package domain

import "errors"

var (
	ErrContentNotFound = errors.New("content not found")
	ErrFileNotFound    = errors.New("file not found")
)
