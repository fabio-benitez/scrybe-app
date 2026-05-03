package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contenttags/domain"
	"github.com/google/uuid"
)

type ListContentTagsUseCase struct {
	repo domain.Repository
}

func NewListContentTagsUseCase(repo domain.Repository) *ListContentTagsUseCase {
	return &ListContentTagsUseCase{
		repo: repo,
	}
}

func (uc *ListContentTagsUseCase) Execute(ctx context.Context, userID, contentID string) ([]*domain.Tag, error) {
	contentID = strings.TrimSpace(contentID)

	if _, err := uuid.Parse(contentID); err != nil {
		return nil, domain.ErrContentNotFound
	}

	if err := uc.repo.ContentExists(ctx, userID, contentID); err != nil {
		return nil, err
	}

	return uc.repo.ListContentTags(ctx, userID, contentID)
}
