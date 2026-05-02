package application

import (
	"context"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/tags/domain"
)

type ListTagsUseCase struct {
	repo domain.Repository
}

func NewListTagsUseCase(repo domain.Repository) *ListTagsUseCase {
	return &ListTagsUseCase{
		repo: repo,
	}
}

func (uc *ListTagsUseCase) Execute(ctx context.Context, userID string) ([]*domain.Tag, error) {
	return uc.repo.FindAllByUserID(ctx, userID)
}
