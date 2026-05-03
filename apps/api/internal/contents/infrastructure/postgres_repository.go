package infrastructure

import (
	"context"
	"encoding/json"
	"errors"

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
		string(content.Content), // cast to string: pgx maps text → jsonb implicitly
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
