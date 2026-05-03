package infrastructure

import (
	"context"
	"errors"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contentfiles/domain"
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

func (r *PostgresRepository) ListContentFiles(
	ctx context.Context,
	userID, contentID string,
) ([]*domain.File, error) {
	query := `
		SELECT f.id, f.original_name, f.mime_type, f.size_bytes,
		       f.upload_status, f.created_at, f.uploaded_at, cf.position
		FROM content_files cf
		JOIN files f ON f.id = cf.file_id AND f.user_id = cf.user_id
		WHERE cf.content_id = $1
		  AND cf.user_id = $2
		ORDER BY cf.position ASC, cf.created_at ASC
	`

	rows, err := r.db.Query(ctx, query, contentID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	files := make([]*domain.File, 0)

	for rows.Next() {
		var f domain.File
		if err := rows.Scan(
			&f.ID,
			&f.OriginalName,
			&f.MimeType,
			&f.SizeBytes,
			&f.UploadStatus,
			&f.CreatedAt,
			&f.UploadedAt,
			&f.Position,
		); err != nil {
			return nil, err
		}
		files = append(files, &f)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return files, nil
}
