package application

import (
	"context"
	"log/slog"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/domain"
)

type DeleteAvatarUseCase struct {
	profileRepo domain.Repository
	fileDeleter avatarFileDeleter
	refChecker  fileReferenceChecker
}

func NewDeleteAvatarUseCase(
	profileRepo domain.Repository,
	fileDeleter avatarFileDeleter,
	refChecker fileReferenceChecker,
) *DeleteAvatarUseCase {
	return &DeleteAvatarUseCase{
		profileRepo: profileRepo,
		fileDeleter: fileDeleter,
		refChecker:  refChecker,
	}
}

func (uc *DeleteAvatarUseCase) Execute(ctx context.Context, userID string) (*domain.Profile, error) {
	profile, prevAvatarFileID, err := uc.profileRepo.ClearAvatar(ctx, userID)
	if err != nil {
		return nil, err
	}

	if prevAvatarFileID != nil {
		referenced, err := uc.refChecker.IsReferenced(ctx, userID, *prevAvatarFileID)
		if err != nil {
			slog.ErrorContext(ctx, "failed to check if avatar file is still referenced",
				"user_id", userID,
				"avatar_file_id", *prevAvatarFileID,
				"error", err,
			)
		} else if referenced {
			slog.InfoContext(ctx, "skipping deletion of avatar file: still referenced",
				"user_id", userID,
				"avatar_file_id", *prevAvatarFileID,
			)
		} else {
			if err := uc.fileDeleter.Execute(ctx, userID, *prevAvatarFileID); err != nil {
				slog.ErrorContext(ctx, "failed to delete avatar file after clearing avatar",
					"user_id", userID,
					"avatar_file_id", *prevAvatarFileID,
					"error", err,
				)
			}
		}
	}

	return profile, nil
}
