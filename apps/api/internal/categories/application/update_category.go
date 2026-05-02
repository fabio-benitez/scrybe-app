package application

import (
	"context"
	"strings"
	"unicode/utf8"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/categories/domain"
	platformslug "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/slug"
	"github.com/google/uuid"
)

type UpdateCategoryUseCase struct {
	repo domain.Repository
}

type UpdateCategoryInput struct {
	UserID      string
	CategoryID  string
	Name        *string
	Description *string
	Color       *string
}

func NewUpdateCategoryUseCase(repo domain.Repository) *UpdateCategoryUseCase {
	return &UpdateCategoryUseCase{
		repo: repo,
	}
}

func (uc *UpdateCategoryUseCase) Execute(ctx context.Context, input UpdateCategoryInput) (*domain.Category, error) {
	if _, err := uuid.Parse(input.CategoryID); err != nil {
		return nil, domain.ErrCategoryNotFound
	}

	if input.Name == nil && input.Description == nil && input.Color == nil {
		return uc.repo.FindByID(ctx, input.UserID, input.CategoryID)
	}

	fields := domain.UpdateCategoryFields{}

	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)

		if name == "" {
			return nil, ErrCategoryNameRequired
		}

		if utf8.RuneCountInString(name) > 80 {
			return nil, ErrCategoryNameTooLong
		}

		slug := platformslug.Generate(name)
		if slug == "" {
			return nil, ErrCategoryNameRequired
		}

		fields.Name = &name
		fields.Slug = &slug
	}

	if input.Description != nil {
		d := strings.TrimSpace(*input.Description)

		if d != "" && utf8.RuneCountInString(d) > 500 {
			return nil, ErrCategoryDescriptionTooLong
		}

		fields.Description = &d
	}

	if input.Color != nil {
		c := strings.ToLower(strings.TrimSpace(*input.Color))

		if c == "" {
			c = "gray"
		}

		if !allowedColors[c] {
			return nil, ErrCategoryColorNotAllowed
		}

		fields.Color = &c
	}

	return uc.repo.Update(ctx, input.UserID, input.CategoryID, fields)
}
