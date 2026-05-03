package application

import (
	"context"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
)

type ListContentsUseCase struct {
	repo domain.Repository
}

func NewListContentsUseCase(repo domain.Repository) *ListContentsUseCase {
	return &ListContentsUseCase{repo: repo}
}

func (uc *ListContentsUseCase) Execute(ctx context.Context, userID string) ([]*domain.Content, error) {
	return uc.repo.FindAllByUserID(ctx, userID)
}
