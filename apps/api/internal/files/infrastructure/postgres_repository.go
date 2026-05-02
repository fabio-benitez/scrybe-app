package infrastructure

import (
	"context"
	"errors"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
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
			checksum_sha256,
			created_at,
			uploaded_at
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
		&created.ChecksumSHA256,
		&created.CreatedAt,
		&created.UploadedAt,
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
			checksum_sha256,
			created_at,
			uploaded_at
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
		&file.ChecksumSHA256,
		&file.CreatedAt,
		&file.UploadedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrFileNotFound
		}

		return nil, err
	}

	return &file, nil
}

func (r *PostgresRepository) FindUploadedByChecksum(
	ctx context.Context,
	userID string,
	checksumSHA256 string,
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
			checksum_sha256,
			created_at,
			uploaded_at
		FROM files
		WHERE user_id = $1
		  AND checksum_sha256 = $2
		  AND upload_status = 'uploaded'
		LIMIT 1
	`

	var file domain.File

	err := r.db.QueryRow(ctx, query, userID, checksumSHA256).Scan(
		&file.ID,
		&file.UserID,
		&file.Bucket,
		&file.ObjectPath,
		&file.OriginalName,
		&file.MimeType,
		&file.SizeBytes,
		&file.UploadStatus,
		&file.ChecksumSHA256,
		&file.CreatedAt,
		&file.UploadedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrFileNotFound
		}

		return nil, err
	}

	return &file, nil
}

func (r *PostgresRepository) MarkUploaded(
	ctx context.Context,
	userID string,
	fileID string,
	checksumSHA256 string,
) error {
	query := `
		UPDATE files
		SET
			upload_status = 'uploaded',
			checksum_sha256 = $3,
			uploaded_at = now()
		WHERE user_id = $1
		  AND id = $2
	`

	tag, err := r.db.Exec(ctx, query, userID, fileID, checksumSHA256)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return domain.ErrFileConflict
		}

		return err
	}

	if tag.RowsAffected() == 0 {
		return domain.ErrFileNotFound
	}

	return nil
}

func (r *PostgresRepository) MarkFailed(
	ctx context.Context,
	userID string,
	fileID string,
) error {
	query := `
		UPDATE files
		SET
			upload_status = 'failed',
			checksum_sha256 = null,
			uploaded_at = null
		WHERE user_id = $1
		  AND id = $2
		  AND upload_status <> 'uploaded'
	`

	tag, err := r.db.Exec(ctx, query, userID, fileID)
	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return domain.ErrFileNotFound
	}

	return nil
}

func (r *PostgresRepository) Delete(
	ctx context.Context,
	userID string,
	fileID string,
) error {
	query := `
		DELETE FROM files
		WHERE user_id = $1
		  AND id = $2
	`

	tag, err := r.db.Exec(ctx, query, userID, fileID)
	if err != nil {
		return err
	}

	if tag.RowsAffected() == 0 {
		return domain.ErrFileNotFound
	}

	return nil
}
