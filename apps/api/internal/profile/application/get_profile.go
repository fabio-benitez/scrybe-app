package application

import (
	"context"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/domain"
)

type GetProfileUseCase struct {
	repo domain.Repository
}

func NewGetProfileUseCase(repo domain.Repository) *GetProfileUseCase {
	return &GetProfileUseCase{
		repo: repo,
	}
}

func (uc *GetProfileUseCase) Execute(ctx context.Context, userID string) (*domain.Profile, error) {
	return uc.repo.FindByID(ctx, userID)
}
