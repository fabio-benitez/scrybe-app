package application

import (
	"context"
	"log/slog"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
	"github.com/google/uuid"
)

type fileDeleter interface {
	Execute(ctx context.Context, userID string, fileID string) error
}

type PermanentDeleteContentUseCase struct {
	repo       domain.Repository
	deleteFile fileDeleter
}

func NewPermanentDeleteContentUseCase(
	repo domain.Repository,
	deleteFile fileDeleter,
) *PermanentDeleteContentUseCase {
	return &PermanentDeleteContentUseCase{
		repo:       repo,
		deleteFile: deleteFile,
	}
}

func (uc *PermanentDeleteContentUseCase) Execute(ctx context.Context, userID string, contentID string) error {
	contentID = strings.TrimSpace(contentID)

	if _, err := uuid.Parse(contentID); err != nil {
		return domain.ErrContentNotFound
	}

	orphanFileIDs, err := uc.repo.PermanentDelete(ctx, userID, contentID)
	if err != nil {
		return err
	}

	for _, fileID := range orphanFileIDs {
		cleanupCtx := context.WithoutCancel(ctx)
		if err := uc.deleteFile.Execute(cleanupCtx, userID, fileID); err != nil {
			slog.ErrorContext(cleanupCtx, "failed to delete orphan file after permanent content delete",
				"content_id", contentID,
				"file_id", fileID,
				"user_id", userID,
				"error", err,
			)
		}
	}

	return nil
}
