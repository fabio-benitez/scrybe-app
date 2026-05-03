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
