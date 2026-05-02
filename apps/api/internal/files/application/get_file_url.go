package application

import (
	"context"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
	"github.com/google/uuid"
)

const signedURLExpiresIn = 30 * 60 // 30 minutes

type GetFileURLUseCase struct {
	repo    domain.Repository
	storage domain.Storage
}

func NewGetFileURLUseCase(repo domain.Repository, storage domain.Storage) *GetFileURLUseCase {
	return &GetFileURLUseCase{
		repo:    repo,
		storage: storage,
	}
}

func (uc *GetFileURLUseCase) Execute(ctx context.Context, userID string, fileID string) (string, error) {
	fileID = strings.TrimSpace(fileID)

	if fileID == "" {
		return "", domain.ErrFileNotFound
	}

	if _, err := uuid.Parse(fileID); err != nil {
		return "", domain.ErrFileNotFound
	}

	file, err := uc.repo.FindByID(ctx, userID, fileID)
	if err != nil {
		return "", err
	}

	if file.UploadStatus != domain.UploadStatusUploaded {
		return "", domain.ErrFileNotFound
	}

	return uc.storage.CreateSignedURL(ctx, domain.SignedURLInput{
		Bucket:     file.Bucket,
		ObjectPath: file.ObjectPath,
		ExpiresIn:  signedURLExpiresIn,
	})
}
