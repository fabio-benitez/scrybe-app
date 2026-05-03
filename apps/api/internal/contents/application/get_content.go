package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
	"github.com/google/uuid"
)

type GetContentUseCase struct {
	repo domain.Repository
}

func NewGetContentUseCase(repo domain.Repository) *GetContentUseCase {
	return &GetContentUseCase{repo: repo}
}

func (uc *GetContentUseCase) Execute(ctx context.Context, userID string, contentID string) (*domain.Content, error) {
	contentID = strings.TrimSpace(contentID)

	if _, err := uuid.Parse(contentID); err != nil {
		return nil, domain.ErrContentNotFound
	}

	return uc.repo.FindByID(ctx, userID, contentID)
}
