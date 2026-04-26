package infrastructure

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/domain"
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

func (r *PostgresRepository) FindByID(
	ctx context.Context,
	id string,
) (*domain.Profile, error) {
	query := `
		SELECT
			id,
			email,
			display_name,
			avatar_file_id,
			created_at,
			updated_at
		FROM user_profiles
		WHERE id = $1
	`

	var profile domain.Profile

	err := r.db.QueryRow(ctx, query, id).Scan(
		&profile.ID,
		&profile.Email,
		&profile.DisplayName,
		&profile.AvatarFileID,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrProfileNotFound
		}

		return nil, err
	}

	return &profile, nil
}
