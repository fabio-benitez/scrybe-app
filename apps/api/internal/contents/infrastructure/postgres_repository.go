package infrastructure

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

var _ domain.Repository = (*PostgresRepository)(nil)

func (r *PostgresRepository) Create(
	ctx context.Context,
	content *domain.Content,
) (*domain.Content, error) {
	query := `
		INSERT INTO contents (
			id, user_id, category_id, title, slug, summary,
			content, status, visibility, is_favorite, published_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING
			id, user_id, category_id, title, slug, summary,
			content, status, visibility, is_favorite,
			created_at, updated_at, published_at, deleted_at, delete_after
	`

	var created domain.Content

	if err := scanContent(r.db.QueryRow(ctx, query,
		content.ID,
		content.UserID,
		content.CategoryID,
		content.Title,
		content.Slug,
		content.Summary,
		string(content.Content),
		string(content.Status),
		string(content.Visibility),
		content.IsFavorite,
		content.PublishedAt,
	), &created); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505": // unique_violation (slug)
				return nil, domain.ErrContentAlreadyExists
			case "23503": // foreign_key_violation (category_id not found for user)
				return nil, domain.ErrContentCategoryNotFound
			}
		}
		return nil, err
	}

	return &created, nil
}

func (r *PostgresRepository) FindAllByUserID(
	ctx context.Context,
	userID string,
) ([]*domain.Content, error) {
	query := `
		SELECT
			id, user_id, category_id, title, slug, summary,
			content, status, visibility, is_favorite,
			created_at, updated_at, published_at, deleted_at, delete_after
		FROM contents
		WHERE user_id = $1
		ORDER BY updated_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	contents := make([]*domain.Content, 0)

	for rows.Next() {
		var c domain.Content
		if err := scanContent(rows, &c); err != nil {
			return nil, err
		}
		contents = append(contents, &c)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return contents, nil
}

func (r *PostgresRepository) FindByID(
	ctx context.Context,
	userID string,
	contentID string,
) (*domain.Content, error) {
	query := `
		SELECT
			id, user_id, category_id, title, slug, summary,
			content, status, visibility, is_favorite,
			created_at, updated_at, published_at, deleted_at, delete_after
		FROM contents
		WHERE id = $1
		  AND user_id = $2
	`

	var c domain.Content

	if err := scanContent(r.db.QueryRow(ctx, query, contentID, userID), &c); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrContentNotFound
		}
		return nil, err
	}

	return &c, nil
}

func scanContent(row pgx.Row, c *domain.Content) error {
	var (
		rawContent    string
		rawStatus     string
		rawVisibility string
	)

	if err := row.Scan(
		&c.ID,
		&c.UserID,
		&c.CategoryID,
		&c.Title,
		&c.Slug,
		&c.Summary,
		&rawContent,
		&rawStatus,
		&rawVisibility,
		&c.IsFavorite,
		&c.CreatedAt,
		&c.UpdatedAt,
		&c.PublishedAt,
		&c.DeletedAt,
		&c.DeleteAfter,
	); err != nil {
		return err
	}

	c.Content = json.RawMessage(rawContent)
	c.Status = domain.ContentStatus(rawStatus)
	c.Visibility = domain.ContentVisibility(rawVisibility)

	return nil
}

func (r *PostgresRepository) Update(
	ctx context.Context,
	userID string,
	contentID string,
	fields domain.UpdateContentFields,
) (*domain.Content, error) {
	args := []any{contentID, userID}
	setClauses := make([]string, 0)
	i := 3

	if fields.Title != nil {
		setClauses = append(setClauses, fmt.Sprintf("title = $%d", i))
		args = append(args, *fields.Title)
		i++
	}

	if fields.Slug != nil {
		setClauses = append(setClauses, fmt.Sprintf("slug = $%d", i))
		if *fields.Slug == nil {
			args = append(args, nil)
		} else {
			args = append(args, **fields.Slug)
		}
		i++
	}

	if fields.Summary != nil {
		setClauses = append(setClauses, fmt.Sprintf("summary = $%d", i))
		if *fields.Summary == nil {
			args = append(args, nil)
		} else {
			args = append(args, **fields.Summary)
		}
		i++
	}

	if fields.Content != nil {
		setClauses = append(setClauses, fmt.Sprintf("content = $%d", i))
		args = append(args, string(*fields.Content))
		i++
	}

	if fields.Status != nil {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", i))
		args = append(args, string(*fields.Status))
		i++
	}

	if fields.Visibility != nil {
		setClauses = append(setClauses, fmt.Sprintf("visibility = $%d", i))
		args = append(args, string(*fields.Visibility))
		i++
	}

	if fields.IsFavorite != nil {
		setClauses = append(setClauses, fmt.Sprintf("is_favorite = $%d", i))
		args = append(args, *fields.IsFavorite)
		i++
	}

	if fields.CategoryID != nil {
		setClauses = append(setClauses, fmt.Sprintf("category_id = $%d", i))
		if *fields.CategoryID == nil {
			args = append(args, nil)
		} else {
			args = append(args, **fields.CategoryID)
		}
		i++
	}

	if fields.SetPublishedAtNow {
		setClauses = append(setClauses, "published_at = COALESCE(published_at, NOW())")
	}

	setClauses = append(setClauses, "updated_at = NOW()")

	query := fmt.Sprintf(`
		UPDATE contents
		SET %s
		WHERE id = $1
		  AND user_id = $2
		RETURNING
			id, user_id, category_id, title, slug, summary,
			content, status, visibility, is_favorite,
			created_at, updated_at, published_at, deleted_at, delete_after
	`, strings.Join(setClauses, ", "))

	var c domain.Content

	if err := scanContent(r.db.QueryRow(ctx, query, args...), &c); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrContentNotFound
		}

		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505":
				return nil, domain.ErrContentAlreadyExists
			case "23503":
				return nil, domain.ErrContentCategoryNotFound
			}
		}

		return nil, err
	}

	return &c, nil
}
