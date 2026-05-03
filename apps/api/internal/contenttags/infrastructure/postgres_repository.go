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
