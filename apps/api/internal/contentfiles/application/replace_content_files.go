package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contentfiles/domain"
	"github.com/google/uuid"
)

type ReplaceContentFilesInput struct {
	UserID    string
	ContentID string
	FileIDs   []string
}

type ReplaceContentFilesUseCase struct {
	repo domain.Repository
}

func NewReplaceContentFilesUseCase(repo domain.Repository) *ReplaceContentFilesUseCase {
	return &ReplaceContentFilesUseCase{
		repo: repo,
	}
}

func (uc *ReplaceContentFilesUseCase) Execute(ctx context.Context, input ReplaceContentFilesInput) ([]*domain.File, error) {
	input.ContentID = strings.TrimSpace(input.ContentID)

	if _, err := uuid.Parse(input.ContentID); err != nil {
		return nil, domain.ErrContentNotFound
	}

	dedupedIDs := deduplicateIDs(input.FileIDs)

	for _, id := range dedupedIDs {
		if _, err := uuid.Parse(id); err != nil {
			return nil, ErrInvalidFileID
		}
	}

	return uc.repo.ReplaceContentFiles(ctx, input.UserID, input.ContentID, dedupedIDs)
}

func deduplicateIDs(ids []string) []string {
	seen := make(map[string]struct{}, len(ids))
	result := make([]string, 0, len(ids))

	for _, id := range ids {
		if _, exists := seen[id]; !exists {
			seen[id] = struct{}{}
			result = append(result, id)
		}
	}

	return result
}
