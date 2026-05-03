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
		if err := scanContentFile(rows, &f); err != nil {
			return nil, err
		}
		files = append(files, &f)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return files, nil
}

func (r *PostgresRepository) ReplaceContentFiles(
	ctx context.Context,
	userID, contentID string,
	fileIDs []string,
) ([]*domain.File, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	contentExistsQuery := `
		SELECT 1
		FROM contents
		WHERE id = $1
		  AND user_id = $2
	`

	var dummy int

	if err := tx.QueryRow(ctx, contentExistsQuery, contentID, userID).Scan(&dummy); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrContentNotFound
		}

		return nil, err
	}

	if len(fileIDs) > 0 {
		countQuery := `
			SELECT COUNT(*)
			FROM files
			WHERE user_id = $1
			  AND id = ANY($2::uuid[])
			  AND upload_status = 'uploaded'
		`

		var count int

		if err := tx.QueryRow(ctx, countQuery, userID, fileIDs).Scan(&count); err != nil {
			return nil, err
		}

		if count != len(fileIDs) {
			return nil, domain.ErrFileNotFound
		}
	}

	deleteQuery := `
		DELETE FROM content_files
		WHERE content_id = $1
		  AND user_id = $2
	`

	if _, err := tx.Exec(ctx, deleteQuery, contentID, userID); err != nil {
		return nil, err
	}

	if len(fileIDs) > 0 {
		insertQuery := `
			INSERT INTO content_files (user_id, content_id, file_id, position)
			SELECT $1, $2, file_id, (pos - 1)::int
			FROM unnest($3::uuid[]) WITH ORDINALITY AS t(file_id, pos)
		`

		if _, err := tx.Exec(ctx, insertQuery, userID, contentID, fileIDs); err != nil {
			return nil, err
		}
	}

	listQuery := `
		SELECT f.id, f.original_name, f.mime_type, f.size_bytes,
		       f.upload_status, f.created_at, f.uploaded_at, cf.position
		FROM content_files cf
		JOIN files f ON f.id = cf.file_id AND f.user_id = cf.user_id
		WHERE cf.content_id = $1
		  AND cf.user_id = $2
		ORDER BY cf.position ASC, cf.created_at ASC
	`

	rows, err := tx.Query(ctx, listQuery, contentID, userID)
	if err != nil {
		return nil, err
	}

	files := make([]*domain.File, 0)

	for rows.Next() {
		var f domain.File
		if err := scanContentFile(rows, &f); err != nil {
			rows.Close()
			return nil, err
		}
		files = append(files, &f)
	}

	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, err
	}

	rows.Close()

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return files, nil
}

func scanContentFile(row pgx.Row, f *domain.File) error {
	return row.Scan(
		&f.ID,
		&f.OriginalName,
		&f.MimeType,
		&f.SizeBytes,
		&f.UploadStatus,
		&f.CreatedAt,
		&f.UploadedAt,
		&f.Position,
	)
}
