package http

import (
	"time"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
)

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
