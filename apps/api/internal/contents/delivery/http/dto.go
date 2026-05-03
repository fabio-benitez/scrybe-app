package http

import (
	"encoding/json"
	"time"
)

type CreateContentRequest struct {
	CategoryID *string         `json:"category_id"`
	Title      string          `json:"title"`
	Summary    string          `json:"summary"`
	Content    json.RawMessage `json:"content"`
	Status     string          `json:"status"`
	Visibility string          `json:"visibility"`
	IsFavorite bool            `json:"is_favorite"`
}

type ContentResponse struct {
	ID          string          `json:"id"`
	CategoryID  *string         `json:"category_id"`
	Title       string          `json:"title"`
	Slug        *string         `json:"slug"`
	Summary     *string         `json:"summary"`
	Content     json.RawMessage `json:"content"`
	Status      string          `json:"status"`
	Visibility  string          `json:"visibility"`
	IsFavorite  bool            `json:"is_favorite"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	PublishedAt *time.Time      `json:"published_at"`
}

type UpdateContentRequest struct {
	Title      *string            `json:"title"`
	Summary    *string            `json:"summary"`
	Content    NullableRawMessage `json:"content"`
	CategoryID NullableRawMessage `json:"category_id"`
	Status     *string            `json:"status"`
	Visibility *string            `json:"visibility"`
	IsFavorite *bool              `json:"is_favorite"`
}

type NullableRawMessage struct {
	Present bool
	Null    bool
	Value   json.RawMessage
}

func (n *NullableRawMessage) UnmarshalJSON(b []byte) error {
	n.Present = true
	if string(b) == "null" {
		n.Null = true
		return nil
	}
	n.Value = json.RawMessage(b)
	return nil
}
