package domain

import "time"

type Category struct {
	ID          string
	UserID      string
	Name        string
	Slug        string
	Description *string
	Color       string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
