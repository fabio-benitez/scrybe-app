package application

import (
	"context"
	"encoding/json"
	"strings"
	"unicode/utf8"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
	platformslug "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/slug"
	"github.com/google/uuid"
)

type UpdateContentUseCase struct {
	repo domain.Repository
}

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

func NewUpdateContentUseCase(repo domain.Repository) *UpdateContentUseCase {
	return &UpdateContentUseCase{repo: repo}
}

func (uc *UpdateContentUseCase) Execute(ctx context.Context, input UpdateContentInput) (*domain.Content, error) {
	if _, err := uuid.Parse(input.ContentID); err != nil {
		return nil, domain.ErrContentNotFound
	}

	// No-op: nothing to update — return current state without touching updated_at.
	if input.Title == nil && input.Summary == nil && input.Content == nil &&
		input.CategoryID == nil && input.Status == nil && input.Visibility == nil && input.IsFavorite == nil {
		return uc.repo.FindByID(ctx, input.UserID, input.ContentID)
	}

	fields := domain.UpdateContentFields{}

	if input.Title != nil {
		title := strings.TrimSpace(*input.Title)

		if title == "" {
			return nil, ErrContentTitleRequired
		}

		if utf8.RuneCountInString(title) > 200 {
			return nil, ErrContentTitleTooLong
		}

		fields.Title = &title

		slug := platformslug.Generate(title)
		if slug == "" {
			var nilSlug *string
			fields.Slug = &nilSlug
		} else {
			slugPtr := &slug
			fields.Slug = &slugPtr
		}
	}

	if input.Summary != nil {
		summary := strings.TrimSpace(*input.Summary)

		if summary != "" && utf8.RuneCountInString(summary) > 500 {
			return nil, ErrContentSummaryTooLong
		}

		if summary == "" {
			var nilSumm *string
			fields.Summary = &nilSumm
		} else {
			summPtr := &summary
			fields.Summary = &summPtr
		}
	}

	if input.Content != nil {
		var m map[string]any
		if err := json.Unmarshal(*input.Content, &m); err != nil || m == nil {
			return nil, ErrContentInvalidJSON
		}

		fields.Content = input.Content
	}

	if input.Status != nil {
		s := domain.ContentStatus(*input.Status)
		if !s.IsValid() {
			return nil, ErrContentStatusNotAllowed
		}

		fields.Status = &s

		if s == domain.ContentStatusPublished {
			fields.SetPublishedAtNow = true
		}
	}

	if input.Visibility != nil {
		v := domain.ContentVisibility(*input.Visibility)
		if !v.IsValid() {
			return nil, ErrContentVisibilityNotAllowed
		}

		fields.Visibility = &v
	}

	if input.CategoryID != nil {
		if *input.CategoryID != nil {
			if _, err := uuid.Parse(**input.CategoryID); err != nil {
				return nil, ErrContentCategoryIDInvalid
			}
		}

		fields.CategoryID = input.CategoryID
	}

	if input.IsFavorite != nil {
		fields.IsFavorite = input.IsFavorite
	}

	return uc.repo.Update(ctx, input.UserID, input.ContentID, fields)
}
