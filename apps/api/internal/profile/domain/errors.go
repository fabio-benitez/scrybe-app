package domain

import "errors"

var ErrProfileNotFound = errors.New("profile not found")

var (
	ErrInvalidAvatarFileID      = errors.New("avatar file id is invalid")
	ErrAvatarFileNotFound       = errors.New("avatar file not found")
	ErrAvatarFileNotReady       = errors.New("avatar file is not ready")
	ErrAvatarMimeTypeNotAllowed = errors.New("avatar mime type is not allowed")
)
