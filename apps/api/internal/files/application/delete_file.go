package application

import (
	"context"
	"log/slog"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
	"github.com/google/uuid"
)

type DeleteFileUseCase struct {
	repo       domain.Repository
	storage    domain.Storage
	refChecker fileReferenceChecker
}

type fileReferenceChecker interface {
	IsReferenced(ctx context.Context, userID string, fileID string) (bool, error)
}

func NewDeleteFileUseCase(
	repo domain.Repository,
	storage domain.Storage,
	refChecker fileReferenceChecker,
) *DeleteFileUseCase {
	return &DeleteFileUseCase{
		repo:       repo,
		storage:    storage,
		refChecker: refChecker,
	}
}

func (uc *DeleteFileUseCase) Execute(
	ctx context.Context,
	userID string,
	fileID string,
) error {
	fileID = strings.TrimSpace(fileID)

	if fileID == "" {
		return domain.ErrFileNotFound
	}

	if _, err := uuid.Parse(fileID); err != nil {
		return domain.ErrFileNotFound
	}

	file, err := uc.repo.FindByID(ctx, userID, fileID)
	if err != nil {
		return err
	}

	referenced, err := uc.refChecker.IsReferenced(ctx, userID, fileID)
	if err != nil {
		return err
	}
	if referenced {
		return ErrFileInUse
	}

	if err := uc.storage.Delete(ctx, domain.DeleteInput{
		Bucket:     file.Bucket,
		ObjectPath: file.ObjectPath,
	}); err != nil {
		slog.ErrorContext(ctx, "failed to delete file from storage",
			"file_id", file.ID,
			"user_id", file.UserID,
			"bucket", file.Bucket,
			"object_path", file.ObjectPath,
			"error", err,
		)

		return ErrStorageUnavailable
	}

	if err := uc.repo.Delete(ctx, userID, fileID); err != nil {
		slog.ErrorContext(ctx, "failed to delete file record from database",
			"file_id", fileID,
			"user_id", userID,
			"error", err,
		)

		return err
	}

	return nil
}
