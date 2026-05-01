package infrastructure

import (
	"context"
	"errors"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
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

func (r *PostgresRepository) Create(
	ctx context.Context,
	file *domain.File,
) (*domain.File, error) {
	query := `
		INSERT INTO files (
			id,
			user_id,
			bucket,
			object_path,
			original_name,
			mime_type,
			size_bytes,
			upload_status
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING
			id,
			user_id,
			bucket,
			object_path,
			original_name,
			mime_type,
			size_bytes,
			upload_status,
			created_at
	`

	var created domain.File

	err := r.db.QueryRow(
		ctx,
		query,
		file.ID,
		file.UserID,
		file.Bucket,
		file.ObjectPath,
		file.OriginalName,
		file.MimeType,
		file.SizeBytes,
		file.UploadStatus,
	).Scan(
		&created.ID,
		&created.UserID,
		&created.Bucket,
		&created.ObjectPath,
		&created.OriginalName,
		&created.MimeType,
		&created.SizeBytes,
		&created.UploadStatus,
		&created.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &created, nil
}

func (r *PostgresRepository) FindByID(
	ctx context.Context,
	userID string,
	fileID string,
) (*domain.File, error) {
	query := `
		SELECT
			id,
			user_id,
			bucket,
			object_path,
			original_name,
			mime_type,
			size_bytes,
			upload_status,
			created_at
		FROM files
		WHERE user_id = $1
		  AND id = $2
	`

	var file domain.File

	err := r.db.QueryRow(ctx, query, userID, fileID).Scan(
		&file.ID,
		&file.UserID,
		&file.Bucket,
		&file.ObjectPath,
		&file.OriginalName,
		&file.MimeType,
		&file.SizeBytes,
		&file.UploadStatus,
		&file.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrFileNotFound
		}

		return nil, err
	}

	return &file, nil
}

func (r *PostgresRepository) UpdateStatus(
	ctx context.Context,
	userID string,
	fileID string,
	status domain.UploadStatus,
) error {
	if !status.IsValid() {
		return domain.ErrInvalidUploadStatus
	}

	query := `
		UPDATE files
		SET upload_status = $3
		WHERE user_id = $1
		  AND id = $2
	`

	tag, err := r.db.Exec(ctx, query, userID, fileID, status)

	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return domain.ErrFileNotFound
	}

	return nil
}
