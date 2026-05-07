package http

import (
	"time"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/application"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
)

// FileResponse is used by GET /files/{id} and other read endpoints.
type FileResponse struct {
	ID           string     `json:"id"`
	OriginalName string     `json:"original_name"`
	MimeType     string     `json:"mime_type"`
	SizeBytes    int64      `json:"size_bytes"`
	UploadStatus string     `json:"upload_status"`
	CreatedAt    time.Time  `json:"created_at"`
	UploadedAt   *time.Time `json:"uploaded_at,omitempty"`
}

func toFileResponse(f *domain.File) FileResponse {
	return FileResponse{
		ID:           f.ID,
		OriginalName: f.OriginalName,
		MimeType:     f.MimeType,
		SizeBytes:    f.SizeBytes,
		UploadStatus: string(f.UploadStatus),
		CreatedAt:    f.CreatedAt,
		UploadedAt:   f.UploadedAt,
	}
}

// UploadFileResponse is used exclusively by POST /files.
// It includes AlreadyExisted to signal file deduplication.
type UploadFileResponse struct {
	ID             string     `json:"id"`
	OriginalName   string     `json:"original_name"`
	MimeType       string     `json:"mime_type"`
	SizeBytes      int64      `json:"size_bytes"`
	UploadStatus   string     `json:"upload_status"`
	CreatedAt      time.Time  `json:"created_at"`
	UploadedAt     *time.Time `json:"uploaded_at,omitempty"`
	AlreadyExisted bool       `json:"already_existed"`
}

func toUploadFileResponse(r *application.UploadFileResult) UploadFileResponse {
	return UploadFileResponse{
		ID:             r.File.ID,
		OriginalName:   r.File.OriginalName,
		MimeType:       r.File.MimeType,
		SizeBytes:      r.File.SizeBytes,
		UploadStatus:   string(r.File.UploadStatus),
		CreatedAt:      r.File.CreatedAt,
		UploadedAt:     r.File.UploadedAt,
		AlreadyExisted: r.AlreadyExisted,
	}
}

type FileURLResponse struct {
	URL string `json:"url"`
}
