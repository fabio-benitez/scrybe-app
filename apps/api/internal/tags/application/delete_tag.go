package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/tags/domain"
	"github.com/google/uuid"
)

type DeleteTagUseCase struct {
	repo domain.Repository
}

type DeleteTagInput struct {
	UserID string
	TagID  string
}

func NewDeleteTagUseCase(repo domain.Repository) *DeleteTagUseCase {
	return &DeleteTagUseCase{
		repo: repo,
	}
}

func (uc *DeleteTagUseCase) Execute(ctx context.Context, input DeleteTagInput) error {
	input.TagID = strings.TrimSpace(input.TagID)

	if _, err := uuid.Parse(input.TagID); err != nil {
		return domain.ErrTagNotFound
	}

	return uc.repo.Delete(ctx, input.UserID, input.TagID)
}
