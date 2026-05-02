package infrastructure

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/tags/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{
		db: db,
	}
}

var _ domain.Repository = (*PostgresRepository)(nil)

func (r *PostgresRepository) Create(
	ctx context.Context,
	tag *domain.Tag,
) (*domain.Tag, error) {
	query := `
		INSERT INTO tags (id, user_id, name, slug)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, name, slug, created_at, updated_at
	`

	var created domain.Tag

	err := r.db.QueryRow(ctx, query,
		tag.ID,
		tag.UserID,
		tag.Name,
		tag.Slug,
	).Scan(
		&created.ID,
		&created.UserID,
		&created.Name,
		&created.Slug,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, domain.ErrTagAlreadyExists
		}

		return nil, err
	}

	return &created, nil
}

func (r *PostgresRepository) FindAllByUserID(
	ctx context.Context,
	userID string,
) ([]*domain.Tag, error) {
	query := `
		SELECT id, user_id, name, slug, created_at, updated_at
		FROM tags
		WHERE user_id = $1
		ORDER BY LOWER(name) ASC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := make([]*domain.Tag, 0)

	for rows.Next() {
		var t domain.Tag
		if err := scanTag(rows, &t); err != nil {
			return nil, err
		}
		tags = append(tags, &t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tags, nil
}

func (r *PostgresRepository) FindByID(
	ctx context.Context,
	userID string,
	tagID string,
) (*domain.Tag, error) {
	query := `
		SELECT id, user_id, name, slug, created_at, updated_at
		FROM tags
		WHERE id = $1
		  AND user_id = $2
	`

	var t domain.Tag

	if err := scanTag(r.db.QueryRow(ctx, query, tagID, userID), &t); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrTagNotFound
		}

		return nil, err
	}

	return &t, nil
}

func (r *PostgresRepository) Update(
	ctx context.Context,
	userID string,
	tagID string,
	fields domain.UpdateTagFields,
) (*domain.Tag, error) {
	args := []any{tagID, userID}
	setClauses := make([]string, 0)
	i := 3

	if fields.Name != nil {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", i))
		args = append(args, *fields.Name)
		i++
		setClauses = append(setClauses, fmt.Sprintf("slug = $%d", i))
		args = append(args, *fields.Slug)
		i++
	}

	setClauses = append(setClauses, "updated_at = NOW()")

	query := fmt.Sprintf(`
		UPDATE tags
		SET %s
		WHERE id = $1
		  AND user_id = $2
		RETURNING id, user_id, name, slug, created_at, updated_at
	`, strings.Join(setClauses, ", "))

	var t domain.Tag

	if err := scanTag(r.db.QueryRow(ctx, query, args...), &t); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrTagNotFound
		}

		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, domain.ErrTagAlreadyExists
		}

		return nil, err
	}

	return &t, nil
}

func (r *PostgresRepository) Delete(
	ctx context.Context,
	userID string,
	tagID string,
) error {
	query := `
		DELETE FROM tags
		WHERE id = $1
		  AND user_id = $2
	`

	result, err := r.db.Exec(ctx, query, tagID, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrTagNotFound
	}

	return nil
}

// scanTag reads a tag row into a domain.Tag.
func scanTag(row pgx.Row, t *domain.Tag) error {
	return row.Scan(
		&t.ID,
		&t.UserID,
		&t.Name,
		&t.Slug,
		&t.CreatedAt,
		&t.UpdatedAt,
	)
}
