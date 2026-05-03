package domain

import (
	"encoding/json"
	"time"
)

type ContentStatus string

const (
	ContentStatusDraft     ContentStatus = "draft"
	ContentStatusPublished ContentStatus = "published"
	ContentStatusArchived  ContentStatus = "archived"
)

func (s ContentStatus) IsValid() bool {
	switch s {
	case ContentStatusDraft, ContentStatusPublished, ContentStatusArchived:
		return true
	default:
		return false
	}
}

type ContentVisibility string

const (
	ContentVisibilityPrivate ContentVisibility = "private"
	ContentVisibilityPublic  ContentVisibility = "public"
)

func (v ContentVisibility) IsValid() bool {
	switch v {
	case ContentVisibilityPrivate, ContentVisibilityPublic:
		return true
	default:
		return false
	}
}

type Content struct {
	ID          string
	UserID      string
	CategoryID  *string
	Title       string
	Slug        *string
	Summary     *string
	Content     json.RawMessage
	Status      ContentStatus
	Visibility  ContentVisibility
	IsFavorite  bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
	PublishedAt *time.Time
	DeletedAt   *time.Time
	DeleteAfter *time.Time
}
