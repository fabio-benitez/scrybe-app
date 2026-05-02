package domain

import "time"

type Tag struct {
	ID        string
	UserID    string
	Name      string
	Slug      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
