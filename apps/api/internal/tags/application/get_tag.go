package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/tags/domain"
	"github.com/google/uuid"
)

type GetTagUseCase struct {
	repo domain.Repository
}

func NewGetTagUseCase(repo domain.Repository) *GetTagUseCase {
	return &GetTagUseCase{
		repo: repo,
	}
}

func (uc *GetTagUseCase) Execute(ctx context.Context, userID string, tagID string) (*domain.Tag, error) {
	tagID = strings.TrimSpace(tagID)

	if _, err := uuid.Parse(tagID); err != nil {
		return nil, domain.ErrTagNotFound
	}

	return uc.repo.FindByID(ctx, userID, tagID)
}
