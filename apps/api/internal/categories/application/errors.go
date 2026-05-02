package application

import "errors"

var (
	ErrCategoryNameRequired        = errors.New("category name is required")
	ErrCategoryNameTooLong         = errors.New("category name is too long")
	ErrCategoryDescriptionTooLong  = errors.New("category description is too long")
	ErrCategoryColorNotAllowed     = errors.New("category color is not allowed")
)
