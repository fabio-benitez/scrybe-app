package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
	"github.com/google/uuid"
)

type GetFileUseCase struct {
	repo domain.Repository
}

func NewGetFileUseCase(repo domain.Repository) *GetFileUseCase {
	return &GetFileUseCase{
		repo: repo,
	}
}

func (uc *GetFileUseCase) Execute(ctx context.Context, userID string, fileID string) (*domain.File, error) {
	fileID = strings.TrimSpace(fileID)

	if fileID == "" {
		return nil, domain.ErrFileNotFound
	}

	if _, err := uuid.Parse(fileID); err != nil {
		return nil, domain.ErrFileNotFound
	}

	return uc.repo.FindByID(ctx, userID, fileID)
}
