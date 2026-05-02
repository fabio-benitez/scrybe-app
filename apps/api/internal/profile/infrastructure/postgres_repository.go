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

func (r *PostgresRepository) UpdateDisplayName(
	ctx context.Context,
	id string,
	displayName string,
) (*domain.Profile, error) {
	query := `
		UPDATE user_profiles
		SET display_name = $2, updated_at = NOW()
		WHERE id = $1
		RETURNING id, email, display_name, avatar_file_id, created_at, updated_at
	`

	var profile domain.Profile

	err := r.db.QueryRow(ctx, query, id, displayName).Scan(
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

func (r *PostgresRepository) UpdateAvatar(
	ctx context.Context,
	userID string,
	fileID string,
) (*domain.Profile, *string, error) {
	query := `
		WITH prev AS (
			SELECT avatar_file_id
			FROM user_profiles
			WHERE id = $1
		),
		upd AS (
			UPDATE user_profiles
			SET avatar_file_id = $2, updated_at = NOW()
			WHERE id = $1
			RETURNING id, email, display_name, avatar_file_id, created_at, updated_at
		)
		SELECT
			upd.id,
			upd.email,
			upd.display_name,
			upd.avatar_file_id,
			upd.created_at,
			upd.updated_at,
			prev.avatar_file_id
		FROM upd
		JOIN prev ON true
	`

	var profile domain.Profile
	var prevAvatarFileID *string

	err := r.db.QueryRow(ctx, query, userID, fileID).Scan(
		&profile.ID,
		&profile.Email,
		&profile.DisplayName,
		&profile.AvatarFileID,
		&profile.CreatedAt,
		&profile.UpdatedAt,
		&prevAvatarFileID,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil, domain.ErrProfileNotFound
		}

		return nil, nil, err
	}

	return &profile, prevAvatarFileID, nil
}

func (r *PostgresRepository) ClearAvatar(
	ctx context.Context,
	userID string,
) (*domain.Profile, *string, error) {
	query := `
		WITH prev AS (
			SELECT avatar_file_id
			FROM user_profiles
			WHERE id = $1
		),
		upd AS (
			UPDATE user_profiles
			SET avatar_file_id = NULL, updated_at = NOW()
			WHERE id = $1
			RETURNING id, email, display_name, avatar_file_id, created_at, updated_at
		)
		SELECT
			upd.id,
			upd.email,
			upd.display_name,
			upd.avatar_file_id,
			upd.created_at,
			upd.updated_at,
			prev.avatar_file_id
		FROM upd
		JOIN prev ON true
	`

	var profile domain.Profile
	var prevAvatarFileID *string

	err := r.db.QueryRow(ctx, query, userID).Scan(
		&profile.ID,
		&profile.Email,
		&profile.DisplayName,
		&profile.AvatarFileID,
		&profile.CreatedAt,
		&profile.UpdatedAt,
		&prevAvatarFileID,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil, domain.ErrProfileNotFound
		}

		return nil, nil, err
	}

	return &profile, prevAvatarFileID, nil
}
