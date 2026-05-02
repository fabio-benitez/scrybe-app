package domain

import "context"

type UpdateCategoryFields struct {
	Name        *string
	Slug        *string
	Description *string
	Color       *string
}

type Repository interface {
	Create(ctx context.Context, category *Category) (*Category, error)
	FindAllByUserID(ctx context.Context, userID string) ([]*Category, error)
	FindByID(ctx context.Context, userID string, categoryID string) (*Category, error)
	Update(ctx context.Context, userID string, categoryID string, fields UpdateCategoryFields) (*Category, error)
	Delete(ctx context.Context, userID string, categoryID string) error
}
