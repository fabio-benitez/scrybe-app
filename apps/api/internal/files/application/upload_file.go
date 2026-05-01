package application

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"strings"
	"time"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
	"github.com/google/uuid"
)

type UploadFileInput struct {
	UserID       string
	OriginalName string
	DeclaredMIME string
	DetectedMIME string
	SizeBytes    int64
	Body         io.Reader
}

type UploadFileUseCase struct {
	repo             domain.Repository
	storage          domain.Storage
	bucket           string
	maxUploadBytes   int64
	allowedMIMETypes []string
}

func NewUploadFileUseCase(
	repo domain.Repository,
	storage domain.Storage,
	bucket string,
	maxUploadBytes int64,
	allowedMIMETypes []string,
) (*UploadFileUseCase, error) {
	if repo == nil {
		return nil, newConfigError("repo is required")
	}

	if storage == nil {
		return nil, newConfigError("storage is required")
	}

	bucket = strings.TrimSpace(bucket)
	if bucket == "" {
		return nil, newConfigError("bucket is required")
	}

	if maxUploadBytes <= 0 {
		return nil, newConfigError("maxUploadBytes must be greater than zero")
	}

	if len(allowedMIMETypes) == 0 {
		return nil, newConfigError("allowedMIMETypes cannot be empty")
	}

	normalizedMIMEs := make([]string, 0, len(allowedMIMETypes))
	for _, m := range allowedMIMETypes {
		m = normalizeMIME(m)
		if m != "" {
			normalizedMIMEs = append(normalizedMIMEs, m)
		}
	}

	if len(normalizedMIMEs) == 0 {
		return nil, newConfigError("allowedMIMETypes contains no valid MIME types")
	}

	return &UploadFileUseCase{
		repo:             repo,
		storage:          storage,
		bucket:           bucket,
		maxUploadBytes:   maxUploadBytes,
		allowedMIMETypes: normalizedMIMEs,
	}, nil
}

func (uc *UploadFileUseCase) Execute(ctx context.Context, input UploadFileInput) (*domain.File, error) {
	if err := uc.validate(input); err != nil {
		return nil, err
	}

	fileID := uuid.NewString()
	objectPath := fmt.Sprintf("users/%s/%s", input.UserID, fileID)

	file := &domain.File{
		ID:           fileID,
		UserID:       input.UserID,
		Bucket:       uc.bucket,
		ObjectPath:   objectPath,
		OriginalName: input.OriginalName,
		MimeType:     normalizeMIME(input.DeclaredMIME),
		SizeBytes:    input.SizeBytes,
		UploadStatus: domain.UploadStatusPending,
	}

	createdFile, err := uc.repo.Create(ctx, file)
	if err != nil {
		return nil, err
	}

	hasher := sha256.New()
	body := io.TeeReader(input.Body, hasher)

	if err := uc.storage.Upload(ctx, domain.UploadInput{
		Bucket:      createdFile.Bucket,
		ObjectPath:  createdFile.ObjectPath,
		ContentType: createdFile.MimeType,
		SizeBytes:   createdFile.SizeBytes,
		Body:        body,
	}); err != nil {
		slog.ErrorContext(ctx, "failed to upload file to storage",
			"file_id", createdFile.ID,
			"user_id", createdFile.UserID,
			"bucket", createdFile.Bucket,
			"object_path", createdFile.ObjectPath,
			"error", err,
		)

		uc.markFailed(ctx, createdFile)

		return nil, ErrStorageUnavailable
	}

	checksum := hex.EncodeToString(hasher.Sum(nil))

	existingFile, err := uc.repo.FindUploadedByChecksum(ctx, createdFile.UserID, checksum)
	if err != nil {
		if !errors.Is(err, domain.ErrFileNotFound) {
			uc.deleteUploadedObject(ctx, createdFile)
			uc.markFailed(ctx, createdFile)

			return nil, fmt.Errorf("checking existing file by checksum: %w", err)
		}
	} else {
		uc.deleteUploadedObject(ctx, createdFile)
		uc.markFailed(ctx, createdFile)

		slog.InfoContext(ctx, "duplicate file upload rejected",
			"user_id", createdFile.UserID,
			"file_id", createdFile.ID,
			"existing_file_id", existingFile.ID,
			"checksum_sha256", checksum,
		)

		return nil, ErrFileAlreadyExists
	}

	if err := uc.repo.MarkUploaded(ctx, createdFile.UserID, createdFile.ID, checksum); err != nil {
		uc.deleteUploadedObject(ctx, createdFile)
		uc.markFailed(ctx, createdFile)

		if errors.Is(err, domain.ErrFileConflict) {
			return nil, ErrFileAlreadyExists
		}

		return nil, fmt.Errorf("marking file as uploaded: %w", err)
	}

	now := time.Now().UTC()
	createdFile.UploadStatus = domain.UploadStatusUploaded
	createdFile.ChecksumSHA256 = &checksum
	createdFile.UploadedAt = &now

	return createdFile, nil
}

func (uc *UploadFileUseCase) validate(input UploadFileInput) error {
	if strings.TrimSpace(input.UserID) == "" {
		return ErrUserIDRequired
	}

	if strings.TrimSpace(input.OriginalName) == "" {
		return ErrOriginalNameRequired
	}

	if input.Body == nil {
		return domain.ErrEmptyFile
	}

	if input.SizeBytes <= 0 {
		return domain.ErrEmptyFile
	}

	if input.SizeBytes > uc.maxUploadBytes {
		return domain.ErrFileTooLarge
	}

	if !uc.isAllowedMIME(input.DeclaredMIME, input.DetectedMIME) {
		return domain.ErrMimeTypeNotAllowed
	}

	return nil
}

func (uc *UploadFileUseCase) isAllowedMIME(declaredMIME string, detectedMIME string) bool {
	declaredMIME = normalizeMIME(declaredMIME)
	detectedMIME = normalizeMIME(detectedMIME)

	if declaredMIME == "" {
		return false
	}

	if !containsMIME(uc.allowedMIMETypes, declaredMIME) {
		return false
	}

	if detectedMIME == "" || detectedMIME == "application/octet-stream" {
		return true
	}

	return detectedMIME == declaredMIME || isKnownMIMEDetectionMismatch(declaredMIME, detectedMIME)
}

func (uc *UploadFileUseCase) markFailed(ctx context.Context, file *domain.File) {
	cleanupCtx := context.WithoutCancel(ctx)
	if err := uc.repo.MarkFailed(cleanupCtx, file.UserID, file.ID); err != nil {
		slog.ErrorContext(cleanupCtx, "failed to mark file upload as failed",
			"file_id", file.ID,
			"user_id", file.UserID,
			"error", err,
		)
	}
}

func (uc *UploadFileUseCase) deleteUploadedObject(ctx context.Context, file *domain.File) {
	cleanupCtx := context.WithoutCancel(ctx)
	if err := uc.storage.Delete(cleanupCtx, domain.DeleteInput{
		Bucket:     file.Bucket,
		ObjectPath: file.ObjectPath,
	}); err != nil {
		slog.ErrorContext(cleanupCtx, "failed to delete uploaded file",
			"file_id", file.ID,
			"user_id", file.UserID,
			"object_path", file.ObjectPath,
			"error", err,
		)
	}
}
