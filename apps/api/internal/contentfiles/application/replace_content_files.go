package application

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contentfiles/domain"
	filesapp "github.com/fabio-benitez/scrybe-app/apps/api/internal/files/application"
	"github.com/google/uuid"
)

type ReplaceContentFilesInput struct {
	UserID    string
	ContentID string
	FileIDs   []string
}

type fileDeleter interface {
	Execute(ctx context.Context, userID string, fileID string) error
}

type ReplaceContentFilesUseCase struct {
	repo        domain.Repository
	fileDeleter fileDeleter
}

func NewReplaceContentFilesUseCase(repo domain.Repository, fd fileDeleter) *ReplaceContentFilesUseCase {
	return &ReplaceContentFilesUseCase{
		repo:        repo,
		fileDeleter: fd,
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

	files, removedFileIDs, err := uc.repo.ReplaceContentFiles(ctx, input.UserID, input.ContentID, dedupedIDs)
	if err != nil {
		return nil, err
	}

	for _, fileID := range removedFileIDs {
		if err := uc.fileDeleter.Execute(ctx, input.UserID, fileID); err != nil {
			if errors.Is(err, filesapp.ErrFileInUse) {
				slog.InfoContext(ctx,
					"skipping orphan file cleanup: file still referenced",
					"user_id", input.UserID,
					"content_id", input.ContentID,
					"file_id", fileID,
				)
			} else {
				slog.ErrorContext(ctx,
					"failed to cleanup orphan file",
					"user_id", input.UserID,
					"content_id", input.ContentID,
					"file_id", fileID,
					"error", err,
				)
			}
		}
	}

	return files, nil
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
