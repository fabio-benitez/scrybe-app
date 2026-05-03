package domain

import "errors"

var (
	ErrContentNotFound         = errors.New("content not found")
	ErrContentAlreadyExists    = errors.New("content already exists")
	ErrContentCategoryNotFound = errors.New("content category not found")
)
