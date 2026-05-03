package application

import "errors"

var (
	ErrContentTitleRequired        = errors.New("content title is required")
	ErrContentTitleTooLong         = errors.New("content title is too long")
	ErrContentSummaryTooLong       = errors.New("content summary is too long")
	ErrContentInvalidJSON          = errors.New("content must be a valid JSON object")
	ErrContentStatusNotAllowed     = errors.New("content status is not allowed")
	ErrContentVisibilityNotAllowed = errors.New("content visibility is not allowed")
	ErrContentCategoryIDInvalid    = errors.New("content category id is invalid")
)
