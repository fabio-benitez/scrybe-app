package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contentfiles/domain"
	"github.com/google/uuid"
)

type ListContentFilesUseCase struct {
	repo domain.Repository
}

func NewListContentFilesUseCase(repo domain.Repository) *ListContentFilesUseCase {
	return &ListContentFilesUseCase{
		repo: repo,
	}
}

func (uc *ListContentFilesUseCase) Execute(ctx context.Context, userID, contentID string) ([]*domain.File, error) {
	contentID = strings.TrimSpace(contentID)

	if _, err := uuid.Parse(contentID); err != nil {
		return nil, domain.ErrContentNotFound
	}

	if err := uc.repo.ContentExists(ctx, userID, contentID); err != nil {
		return nil, err
	}

	return uc.repo.ListContentFiles(ctx, userID, contentID)
}
