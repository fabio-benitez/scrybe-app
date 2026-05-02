package application

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	filesdomain "github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/domain"
	"github.com/google/uuid"
)

var allowedAvatarMIMETypes = []string{
	"image/jpeg",
	"image/png",
	"image/webp",
}

type avatarFileFinder interface {
	FindByID(ctx context.Context, userID string, fileID string) (*filesdomain.File, error)
}

type avatarFileDeleter interface {
	Execute(ctx context.Context, userID string, fileID string) error
}

type UpdateAvatarUseCase struct {
	profileRepo domain.Repository
	fileFinder  avatarFileFinder
	fileDeleter avatarFileDeleter
}

type UpdateAvatarInput struct {
	UserID string
	FileID string
}

func NewUpdateAvatarUseCase(
	profileRepo domain.Repository,
	fileFinder avatarFileFinder,
	fileDeleter avatarFileDeleter,
) *UpdateAvatarUseCase {
	return &UpdateAvatarUseCase{
		profileRepo: profileRepo,
		fileFinder:  fileFinder,
		fileDeleter: fileDeleter,
	}
}

func (uc *UpdateAvatarUseCase) Execute(ctx context.Context, input UpdateAvatarInput) (*domain.Profile, error) {
	fileID := strings.TrimSpace(input.FileID)

	if fileID == "" {
		return nil, domain.ErrInvalidAvatarFileID
	}

	if _, err := uuid.Parse(fileID); err != nil {
		return nil, domain.ErrInvalidAvatarFileID
	}

	file, err := uc.fileFinder.FindByID(ctx, input.UserID, fileID)
	if err != nil {
		if errors.Is(err, filesdomain.ErrFileNotFound) {
			return nil, domain.ErrAvatarFileNotFound
		}

		return nil, err
	}

	if file.UploadStatus != filesdomain.UploadStatusUploaded {
		return nil, domain.ErrAvatarFileNotReady
	}

	if !isAllowedAvatarMIME(file.MimeType) {
		return nil, domain.ErrAvatarMimeTypeNotAllowed
	}

	profile, prevAvatarFileID, err := uc.profileRepo.UpdateAvatar(ctx, input.UserID, fileID)
	if err != nil {
		return nil, err
	}

	if prevAvatarFileID != nil && *prevAvatarFileID != fileID {
		if err := uc.fileDeleter.Execute(ctx, input.UserID, *prevAvatarFileID); err != nil {
			slog.ErrorContext(ctx, "failed to delete previous avatar file",
				"user_id", input.UserID,
				"prev_avatar_file_id", *prevAvatarFileID,
				"error", err,
			)
		}
	}

	return profile, nil
}

func isAllowedAvatarMIME(mimeType string) bool {
	for _, allowed := range allowedAvatarMIMETypes {
		if mimeType == allowed {
			return true
		}
	}

	return false
}
