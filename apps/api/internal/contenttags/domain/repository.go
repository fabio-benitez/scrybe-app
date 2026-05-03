package domain

import "context"

type Repository interface {
	ContentExists(ctx context.Context, userID, contentID string) error
	ListContentTags(ctx context.Context, userID, contentID string) ([]*Tag, error)
	ReplaceContentTags(ctx context.Context, userID, contentID string, tagIDs []string) ([]*Tag, error)
}
