package domain

import "time"

type Profile struct {
	ID           string
	Email        string
	DisplayName  string
	AvatarFileID *string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
