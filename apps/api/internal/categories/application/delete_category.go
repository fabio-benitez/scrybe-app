package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/categories/domain"
	"github.com/google/uuid"
)

type DeleteCategoryUseCase struct {
	repo domain.Repository
}

func NewDeleteCategoryUseCase(repo domain.Repository) *DeleteCategoryUseCase {
	return &DeleteCategoryUseCase{
		repo: repo,
	}
}

type DeleteCategoryInput struct {
	UserID     string
	CategoryID string
}

func (uc *DeleteCategoryUseCase) Execute(ctx context.Context, input DeleteCategoryInput) error {
	input.CategoryID = strings.TrimSpace(input.CategoryID)

	if _, err := uuid.Parse(input.CategoryID); err != nil {
		return domain.ErrCategoryNotFound
	}

	return uc.repo.Delete(ctx, input.UserID, input.CategoryID)
}
