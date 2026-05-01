package application

import (
	"errors"
	"fmt"
)

var (
	ErrUserIDRequired       = errors.New("user id is required")
	ErrOriginalNameRequired = errors.New("original name is required")
	ErrStorageUnavailable   = errors.New("storage unavailable")
)

func newConfigError(msg string) error {
	return fmt.Errorf("files/application: %s", msg)
}
