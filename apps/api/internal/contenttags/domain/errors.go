package domain

import "errors"

var (
	ErrContentNotFound = errors.New("content not found")
	ErrTagNotFound     = errors.New("tag not found")
)
