package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/categories/domain"
	"github.com/google/uuid"
)

type GetCategoryUseCase struct {
	repo domain.Repository
}

func NewGetCategoryUseCase(repo domain.Repository) *GetCategoryUseCase {
	return &GetCategoryUseCase{
		repo: repo,
	}
}

func (uc *GetCategoryUseCase) Execute(ctx context.Context, userID string, categoryID string) (*domain.Category, error) {
	categoryID = strings.TrimSpace(categoryID)

	if _, err := uuid.Parse(categoryID); err != nil {
		return nil, domain.ErrCategoryNotFound
	}

	return uc.repo.FindByID(ctx, userID, categoryID)
}
