package infrastructure

import (
	"context"
	"errors"
	"fmt"
	"strings"

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
	query := `
		SELECT id, user_id, name, slug, description, color, created_at, updated_at
		FROM categories
		WHERE user_id = $1
		ORDER BY LOWER(name) ASC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := make([]*domain.Category, 0)

	for rows.Next() {
		var c domain.Category
		if err := scanCategory(rows, &c); err != nil {
			return nil, err
		}
		categories = append(categories, &c)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return categories, nil
}

func (r *PostgresRepository) FindByID(
	ctx context.Context,
	userID string,
	categoryID string,
) (*domain.Category, error) {
	query := `
		SELECT id, user_id, name, slug, description, color, created_at, updated_at
		FROM categories
		WHERE id = $1
		  AND user_id = $2
	`

	var c domain.Category

	if err := scanCategory(r.db.QueryRow(ctx, query, categoryID, userID), &c); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrCategoryNotFound
		}

		return nil, err
	}

	return &c, nil
}

func (r *PostgresRepository) Update(
	ctx context.Context,
	userID string,
	categoryID string,
	fields domain.UpdateCategoryFields,
) (*domain.Category, error) {
	args := []any{categoryID, userID}
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

	if fields.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", i))
		if *fields.Description == "" {
			args = append(args, nil) // write NULL
		} else {
			args = append(args, *fields.Description)
		}
		i++
	}

	if fields.Color != nil {
		setClauses = append(setClauses, fmt.Sprintf("color = $%d", i))
		args = append(args, *fields.Color)
		i++
	}

	setClauses = append(setClauses, "updated_at = NOW()")

	query := fmt.Sprintf(`
		UPDATE categories
		SET %s
		WHERE id = $1
		  AND user_id = $2
		RETURNING id, user_id, name, slug, description, color, created_at, updated_at
	`, strings.Join(setClauses, ", "))

	var c domain.Category

	if err := scanCategory(r.db.QueryRow(ctx, query, args...), &c); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrCategoryNotFound
		}

		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, domain.ErrCategoryAlreadyExists
		}

		return nil, err
	}

	return &c, nil
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
