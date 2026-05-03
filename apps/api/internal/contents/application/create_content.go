package application

import (
	"context"
	"encoding/json"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
	platformslug "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/slug"
	"github.com/google/uuid"
)

type CreateContentUseCase struct {
	repo domain.Repository
}

type CreateContentInput struct {
	UserID     string
	CategoryID *string
	Title      string
	Summary    string
	Content    json.RawMessage
	Status     string
	Visibility string
	IsFavorite bool
}

func NewCreateContentUseCase(repo domain.Repository) *CreateContentUseCase {
	return &CreateContentUseCase{repo: repo}
}

func (uc *CreateContentUseCase) Execute(ctx context.Context, input CreateContentInput) (*domain.Content, error) {
	// Title
	title := strings.TrimSpace(input.Title)
	if title == "" {
		return nil, ErrContentTitleRequired
	}
	if utf8.RuneCountInString(title) > 200 {
		return nil, ErrContentTitleTooLong
	}

	// Slug: nullable if generate returns ""
	var slug *string
	if s := platformslug.Generate(title); s != "" {
		slug = &s
	}

	// Summary
	var summary *string
	if s := strings.TrimSpace(input.Summary); s != "" {
		if utf8.RuneCountInString(s) > 500 {
			return nil, ErrContentSummaryTooLong
		}
		summary = &s
	}

	// Content: must be a valid JSON object
	var raw map[string]any
	if err := json.Unmarshal(input.Content, &raw); err != nil || raw == nil {
		return nil, ErrContentInvalidJSON
	}

	// Status
	status := domain.ContentStatus(input.Status)
	if input.Status == "" {
		status = domain.ContentStatusDraft
	} else if !status.IsValid() {
		return nil, ErrContentStatusNotAllowed
	}

	// Visibility
	visibility := domain.ContentVisibility(input.Visibility)
	if input.Visibility == "" {
		visibility = domain.ContentVisibilityPrivate
	} else if !visibility.IsValid() {
		return nil, ErrContentVisibilityNotAllowed
	}

	// CategoryID
	var categoryID *string
	if input.CategoryID != nil {
		cid := strings.TrimSpace(*input.CategoryID)
		if _, err := uuid.Parse(cid); err != nil {
			return nil, ErrContentCategoryIDInvalid
		}
		categoryID = &cid
	}

	// PublishedAt: set only when creating as published
	var publishedAt *time.Time
	if status == domain.ContentStatusPublished {
		now := time.Now()
		publishedAt = &now
	}

	content := &domain.Content{
		ID:          uuid.NewString(),
		UserID:      input.UserID,
		CategoryID:  categoryID,
		Title:       title,
		Slug:        slug,
		Summary:     summary,
		Content:     input.Content,
		Status:      status,
		Visibility:  visibility,
		IsFavorite:  input.IsFavorite,
		PublishedAt: publishedAt,
	}

	return uc.repo.Create(ctx, content)
}
