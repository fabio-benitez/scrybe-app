package application

import (
	"context"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
)

type ListTrashUseCase struct {
	repo domain.Repository
}

func NewListTrashUseCase(repo domain.Repository) *ListTrashUseCase {
	return &ListTrashUseCase{repo: repo}
}

func (uc *ListTrashUseCase) Execute(ctx context.Context, userID string) ([]*domain.Content, error) {
	return uc.repo.FindAllInTrashByUserID(ctx, userID)
}
