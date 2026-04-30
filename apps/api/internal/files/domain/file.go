package domain

import "time"

type UploadStatus string

const (
	UploadStatusPending  UploadStatus = "pending"
	UploadStatusUploaded UploadStatus = "uploaded"
	UploadStatusFailed   UploadStatus = "failed"
)

func (s UploadStatus) IsValid() bool {
	switch s {
	case UploadStatusPending, UploadStatusUploaded, UploadStatusFailed:
		return true
	default:
		return false
	}
}

type File struct {
	ID           string
	UserID       string
	Bucket       string
	ObjectPath   string
	OriginalName string
	MimeType     string
	SizeBytes    int64
	UploadStatus UploadStatus
	CreatedAt    time.Time
}
