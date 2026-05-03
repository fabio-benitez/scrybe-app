package application

import "encoding/json"

// UpdateContentInput is used by the update use case (implemented in commit 3).
type UpdateContentInput struct {
	UserID     string
	ContentID  string
	Title      *string
	Summary    *string
	Content    *json.RawMessage
	CategoryID **string
	Status     *string
	Visibility *string
	IsFavorite *bool
}
