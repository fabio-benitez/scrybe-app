package http

import (
	"time"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contentfiles/domain"
)

type ContentFileResponse struct {
	ID           string     `json:"id"`
	OriginalName string     `json:"original_name"`
	MimeType     string     `json:"mime_type"`
	SizeBytes    int64      `json:"size_bytes"`
	UploadStatus string     `json:"upload_status"`
	CreatedAt    time.Time  `json:"created_at"`
	UploadedAt   *time.Time `json:"uploaded_at"`
	Position     int        `json:"position"`
}

type SetContentFilesRequest struct {
	FileIDs *[]string `json:"file_ids"`
}

func toContentFileResponse(f *domain.File) ContentFileResponse {
	return ContentFileResponse{
		ID:           f.ID,
		OriginalName: f.OriginalName,
		MimeType:     f.MimeType,
		SizeBytes:    f.SizeBytes,
		UploadStatus: f.UploadStatus,
		CreatedAt:    f.CreatedAt,
		UploadedAt:   f.UploadedAt,
		Position:     f.Position,
	}
}

func toContentFileResponseList(files []*domain.File) []ContentFileResponse {
	result := make([]ContentFileResponse, len(files))
	for i, f := range files {
		result[i] = toContentFileResponse(f)
	}
	return result
}
