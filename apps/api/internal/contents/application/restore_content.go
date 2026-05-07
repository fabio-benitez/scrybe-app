package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
	"github.com/google/uuid"
)

type RestoreContentUseCase struct {
	repo domain.Repository
}

func NewRestoreContentUseCase(repo domain.Repository) *RestoreContentUseCase {
	return &RestoreContentUseCase{repo: repo}
}

func (uc *RestoreContentUseCase) Execute(ctx context.Context, userID string, contentID string) (*domain.Content, error) {
	contentID = strings.TrimSpace(contentID)

	if _, err := uuid.Parse(contentID); err != nil {
		return nil, domain.ErrContentNotFound
	}

	return uc.repo.Restore(ctx, userID, contentID)
}
