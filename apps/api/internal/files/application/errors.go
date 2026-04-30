package application

import "errors"

var (
	ErrUserIDRequired       = errors.New("user id is required")
	ErrOriginalNameRequired = errors.New("original name is required")
	ErrStorageUnavailable   = errors.New("storage unavailable")
)
