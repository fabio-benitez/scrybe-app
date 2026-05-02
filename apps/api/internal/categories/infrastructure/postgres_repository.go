package infrastructure

import (
	"context"
	"errors"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/categories/domain"
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
	category *domain.Category,
) (*domain.Category, error) {
	query := `
		INSERT INTO categories (id, user_id, name, slug, description, color)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, name, slug, description, color, created_at, updated_at
	`

	var created domain.Category

	err := r.db.QueryRow(ctx, query,
		category.ID,
		category.UserID,
		category.Name,
		category.Slug,
		category.Description,
		category.Color,
	).Scan(
		&created.ID,
		&created.UserID,
		&created.Name,
		&created.Slug,
		&created.Description,
		&created.Color,
		&created.CreatedAt,
		&created.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, domain.ErrCategoryAlreadyExists
		}

		return nil, err
	}

	return &created, nil
}

func (r *PostgresRepository) FindAllByUserID(
	ctx context.Context,
	userID string,
) ([]*domain.Category, error) {
	// Implemented in GET /categories phase.
	return nil, errors.New("not implemented")
}

func (r *PostgresRepository) FindByID(
	ctx context.Context,
	userID string,
	categoryID string,
) (*domain.Category, error) {
	// Implemented in GET /categories/{id} phase.
	return nil, errors.New("not implemented")
}

func (r *PostgresRepository) Update(
	ctx context.Context,
	userID string,
	categoryID string,
	fields domain.UpdateCategoryFields,
) (*domain.Category, error) {
	// Implemented in PATCH /categories/{id} phase.
	return nil, errors.New("not implemented")
}

func (r *PostgresRepository) Delete(
	ctx context.Context,
	userID string,
	categoryID string,
) error {
	// Implemented in DELETE /categories/{id} phase.
	return errors.New("not implemented")
}

// scanCategory reads a category row into a domain.Category.
func scanCategory(row pgx.Row, c *domain.Category) error {
	return row.Scan(
		&c.ID,
		&c.UserID,
		&c.Name,
		&c.Slug,
		&c.Description,
		&c.Color,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
}
