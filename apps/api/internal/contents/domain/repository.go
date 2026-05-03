package domain

import (
	"context"
	"encoding/json"
)

type UpdateContentFields struct {
	Title             *string
	Slug              **string
	Summary           **string
	Content           *json.RawMessage
	CategoryID        **string
	Status            *ContentStatus
	Visibility        *ContentVisibility
	IsFavorite        *bool
	SetPublishedAtNow bool
}

type Repository interface {
	Create(ctx context.Context, content *Content) (*Content, error)
	FindAllByUserID(ctx context.Context, userID string) ([]*Content, error)
	FindByID(ctx context.Context, userID string, contentID string) (*Content, error)
	Update(ctx context.Context, userID string, contentID string, fields UpdateContentFields) (*Content, error)
}
