package domain

import "context"

type Repository interface {
	Create(ctx context.Context, content *Content) (*Content, error)
	FindAllByUserID(ctx context.Context, userID string) ([]*Content, error)
	FindByID(ctx context.Context, userID string, contentID string) (*Content, error)
}
