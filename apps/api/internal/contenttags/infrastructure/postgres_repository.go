package infrastructure

import (
	"context"
	"errors"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contenttags/domain"
	"github.com/jackc/pgx/v5"
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

func (r *PostgresRepository) ContentExists(ctx context.Context, userID, contentID string) error {
	query := `
		SELECT 1
		FROM contents
		WHERE id = $1
		  AND user_id = $2
	`

	var dummy int

	err := r.db.QueryRow(ctx, query, contentID, userID).Scan(&dummy)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.ErrContentNotFound
		}

		return err
	}

	return nil
}

func (r *PostgresRepository) ListContentTags(
	ctx context.Context,
	userID, contentID string,
) ([]*domain.Tag, error) {
	query := `
		SELECT t.id, t.user_id, t.name, t.slug, t.created_at, t.updated_at
		FROM content_tags ct
		JOIN tags t ON t.id = ct.tag_id AND t.user_id = ct.user_id
		WHERE ct.content_id = $1
		  AND ct.user_id = $2
		ORDER BY LOWER(t.name) ASC
	`

	rows, err := r.db.Query(ctx, query, contentID, userID)
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

func (r *PostgresRepository) ReplaceContentTags(
	ctx context.Context,
	userID, contentID string,
	tagIDs []string,
) ([]*domain.Tag, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	contentExistsQuery := `
		SELECT 1
		FROM contents
		WHERE id = $1
		  AND user_id = $2
	`

	var dummy int

	if err := tx.QueryRow(ctx, contentExistsQuery, contentID, userID).Scan(&dummy); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrContentNotFound
		}

		return nil, err
	}

	if len(tagIDs) > 0 {
		countQuery := `
			SELECT COUNT(*)
			FROM tags
			WHERE user_id = $1
			  AND id = ANY($2::uuid[])
		`

		var count int

		if err := tx.QueryRow(ctx, countQuery, userID, tagIDs).Scan(&count); err != nil {
			return nil, err
		}

		if count != len(tagIDs) {
			return nil, domain.ErrTagNotFound
		}
	}

	deleteQuery := `
		DELETE FROM content_tags
		WHERE content_id = $1
		  AND user_id = $2
	`

	if _, err := tx.Exec(ctx, deleteQuery, contentID, userID); err != nil {
		return nil, err
	}

	if len(tagIDs) > 0 {
		insertQuery := `
			INSERT INTO content_tags (user_id, content_id, tag_id)
			SELECT $1, $2, unnest($3::uuid[])
		`

		if _, err := tx.Exec(ctx, insertQuery, userID, contentID, tagIDs); err != nil {
			return nil, err
		}
	}

	listQuery := `
		SELECT t.id, t.user_id, t.name, t.slug, t.created_at, t.updated_at
		FROM content_tags ct
		JOIN tags t ON t.id = ct.tag_id AND t.user_id = ct.user_id
		WHERE ct.content_id = $1
		  AND ct.user_id = $2
		ORDER BY LOWER(t.name) ASC
	`

	rows, err := tx.Query(ctx, listQuery, contentID, userID)
	if err != nil {
		return nil, err
	}

	tags := make([]*domain.Tag, 0)

	for rows.Next() {
		var t domain.Tag
		if err := scanTag(rows, &t); err != nil {
			rows.Close()
			return nil, err
		}
		tags = append(tags, &t)
	}

	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, err
	}

	rows.Close()

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return tags, nil
}

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
