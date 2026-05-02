package application

import "errors"

var (
	ErrTagNameRequired = errors.New("tag name is required")
	ErrTagNameTooLong  = errors.New("tag name is too long")
)
