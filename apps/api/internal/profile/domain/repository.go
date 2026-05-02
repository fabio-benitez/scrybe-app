package domain

import "context"

type Repository interface {
	FindByID(ctx context.Context, id string) (*Profile, error)
	UpdateDisplayName(ctx context.Context, id string, displayName string) (*Profile, error)
	UpdateAvatar(ctx context.Context, userID string, fileID string) (*Profile, *string, error)
	ClearAvatar(ctx context.Context, userID string) (*Profile, *string, error)
}
