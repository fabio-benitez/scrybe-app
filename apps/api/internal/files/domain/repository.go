package domain

import "context"

type Repository interface {
	Create(ctx context.Context, file *File) (*File, error)
	FindByID(ctx context.Context, userID string, fileID string) (*File, error)
	FindUploadedByChecksum(ctx context.Context, userID string, checksumSHA256 string) (*File, error)
	MarkUploaded(ctx context.Context, userID string, fileID string, checksumSHA256 string) error
	MarkFailed(ctx context.Context, userID string, fileID string) error
	Delete(ctx context.Context, userID string, fileID string) error
}
