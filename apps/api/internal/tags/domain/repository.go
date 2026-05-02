package domain

import "context"

type UpdateTagFields struct {
	Name *string
	Slug *string
}

type Repository interface {
	Create(ctx context.Context, tag *Tag) (*Tag, error)
	FindAllByUserID(ctx context.Context, userID string) ([]*Tag, error)
	FindByID(ctx context.Context, userID string, tagID string) (*Tag, error)
	Update(ctx context.Context, userID string, tagID string, fields UpdateTagFields) (*Tag, error)
	Delete(ctx context.Context, userID string, tagID string) error
}
