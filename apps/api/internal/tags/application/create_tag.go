package application

import (
	"context"
	"strings"
	"unicode/utf8"

	platformslug "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/slug"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/tags/domain"
	"github.com/google/uuid"
)

type CreateTagUseCase struct {
	repo domain.Repository
}

type CreateTagInput struct {
	UserID string
	Name   string
}

func NewCreateTagUseCase(repo domain.Repository) *CreateTagUseCase {
	return &CreateTagUseCase{
		repo: repo,
	}
}

func (uc *CreateTagUseCase) Execute(ctx context.Context, input CreateTagInput) (*domain.Tag, error) {
	name := strings.TrimSpace(input.Name)

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

	tag := &domain.Tag{
		ID:     uuid.NewString(),
		UserID: input.UserID,
		Name:   name,
		Slug:   slug,
	}

	return uc.repo.Create(ctx, tag)
}
