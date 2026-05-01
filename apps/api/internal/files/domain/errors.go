package domain

import "errors"

var (
	ErrFileNotFound        = errors.New("file not found")
	ErrEmptyFile           = errors.New("file is empty")
	ErrFileTooLarge        = errors.New("file exceeds maximum allowed size")
	ErrMimeTypeNotAllowed  = errors.New("MIME type not allowed")
	ErrInvalidUploadStatus = errors.New("invalid upload status")
)
