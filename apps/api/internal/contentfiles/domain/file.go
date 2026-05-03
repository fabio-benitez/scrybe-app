package domain

import "time"

type File struct {
	ID           string
	OriginalName string
	MimeType     string
	SizeBytes    int64
	UploadStatus string
	CreatedAt    time.Time
	UploadedAt   *time.Time
	Position     int
}
