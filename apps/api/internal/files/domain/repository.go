package domain

import "context"

type Repository interface {
	Create(ctx context.Context, file *File) (*File, error)
	FindByID(ctx context.Context, userID string, fileID string) (*File, error)
	UpdateStatus(ctx context.Context, userID string, fileID string, status UploadStatus) error
}
