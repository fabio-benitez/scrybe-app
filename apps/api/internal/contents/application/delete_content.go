package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
	"github.com/google/uuid"
)

type DeleteContentUseCase struct {
	repo domain.Repository
}

type DeleteContentInput struct {
	UserID    string
	ContentID string
}

func NewDeleteContentUseCase(repo domain.Repository) *DeleteContentUseCase {
	return &DeleteContentUseCase{repo: repo}
}

func (uc *DeleteContentUseCase) Execute(ctx context.Context, input DeleteContentInput) error {
	input.ContentID = strings.TrimSpace(input.ContentID)

	if _, err := uuid.Parse(input.ContentID); err != nil {
		return domain.ErrContentNotFound
	}

	return uc.repo.Delete(ctx, input.UserID, input.ContentID)
}
