package domain

import "context"

type Repository interface {
	FindByID(ctx context.Context, id string) (*Profile, error)
	UpdateDisplayName(ctx context.Context, id string, displayName string) (*Profile, error)
}
