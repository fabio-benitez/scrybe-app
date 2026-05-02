package application

import (
	"context"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/categories/domain"
)

type ListCategoriesUseCase struct {
	repo domain.Repository
}

func NewListCategoriesUseCase(repo domain.Repository) *ListCategoriesUseCase {
	return &ListCategoriesUseCase{
		repo: repo,
	}
}

func (uc *ListCategoriesUseCase) Execute(ctx context.Context, userID string) ([]*domain.Category, error) {
	return uc.repo.FindAllByUserID(ctx, userID)
}
