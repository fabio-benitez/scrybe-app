package application

import (
	"context"
	"strings"
	"unicode/utf8"

	platformslug "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/slug"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/tags/domain"
	"github.com/google/uuid"
)

type UpdateTagUseCase struct {
	repo domain.Repository
}

type UpdateTagInput struct {
	UserID string
	TagID  string
	Name   *string
}

func NewUpdateTagUseCase(repo domain.Repository) *UpdateTagUseCase {
	return &UpdateTagUseCase{
		repo: repo,
	}
}

func (uc *UpdateTagUseCase) Execute(ctx context.Context, input UpdateTagInput) (*domain.Tag, error) {
	tagID := strings.TrimSpace(input.TagID)

	if _, err := uuid.Parse(tagID); err != nil {
		return nil, domain.ErrTagNotFound
	}

	if input.Name == nil {
		return uc.repo.FindByID(ctx, input.UserID, tagID)
	}

	fields := domain.UpdateTagFields{}

	name := strings.TrimSpace(*input.Name)

	if name == "" {
		return nil, ErrTagNameRequired
	}

	if utf8.RuneCountInString(name) > 50 {
		return nil, ErrTagNameTooLong
	}

	slug := platformslug.Generate(name)
	if slug == "" {
		return nil, ErrTagNameRequired
	}

	fields.Name = &name
	fields.Slug = &slug

	return uc.repo.Update(ctx, input.UserID, tagID, fields)
}
