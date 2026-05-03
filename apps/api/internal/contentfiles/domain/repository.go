package domain

import "context"

type Repository interface {
	ContentExists(ctx context.Context, userID, contentID string) error
	ListContentFiles(ctx context.Context, userID, contentID string) ([]*File, error)
}
