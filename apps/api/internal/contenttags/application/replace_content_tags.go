package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contenttags/domain"
	"github.com/google/uuid"
)

type ReplaceContentTagsInput struct {
	UserID    string
	ContentID string
	TagIDs    []string
}

type ReplaceContentTagsUseCase struct {
	repo domain.Repository
}

func NewReplaceContentTagsUseCase(repo domain.Repository) *ReplaceContentTagsUseCase {
	return &ReplaceContentTagsUseCase{
		repo: repo,
	}
}

func (uc *ReplaceContentTagsUseCase) Execute(ctx context.Context, input ReplaceContentTagsInput) ([]*domain.Tag, error) {
	input.ContentID = strings.TrimSpace(input.ContentID)

	if _, err := uuid.Parse(input.ContentID); err != nil {
		return nil, domain.ErrContentNotFound
	}

	dedupedIDs := deduplicateIDs(input.TagIDs)

	for _, id := range dedupedIDs {
		if _, err := uuid.Parse(id); err != nil {
			return nil, ErrInvalidTagID
		}
	}

	return uc.repo.ReplaceContentTags(ctx, input.UserID, input.ContentID, dedupedIDs)
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
