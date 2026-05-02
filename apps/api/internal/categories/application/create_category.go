package application

import (
	"context"
	"strings"
	"unicode/utf8"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/categories/domain"
	platformslug "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/slug"
	"github.com/google/uuid"
)

var allowedColors = map[string]bool{
	"gray":   true,
	"red":    true,
	"orange": true,
	"yellow": true,
	"green":  true,
	"blue":   true,
	"purple": true,
	"pink":   true,
}

type CreateCategoryUseCase struct {
	repo domain.Repository
}

type CreateCategoryInput struct {
	UserID      string
	Name        string
	Description string
	Color       string
}

func NewCreateCategoryUseCase(repo domain.Repository) *CreateCategoryUseCase {
	return &CreateCategoryUseCase{
		repo: repo,
	}
}

func (uc *CreateCategoryUseCase) Execute(ctx context.Context, input CreateCategoryInput) (*domain.Category, error) {
	name := strings.TrimSpace(input.Name)

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

	var description *string
	if d := strings.TrimSpace(input.Description); d != "" {
		if utf8.RuneCountInString(d) > 500 {
			return nil, ErrCategoryDescriptionTooLong
		}
		description = &d
	}

	color := strings.ToLower(strings.TrimSpace(input.Color))
	if color == "" {
		color = "gray"
	}

	if !allowedColors[color] {
		return nil, ErrCategoryColorNotAllowed
	}

	category := &domain.Category{
		ID:          uuid.NewString(),
		UserID:      input.UserID,
		Name:        name,
		Slug:        slug,
		Description: description,
		Color:       color,
	}

	return uc.repo.Create(ctx, category)
}
