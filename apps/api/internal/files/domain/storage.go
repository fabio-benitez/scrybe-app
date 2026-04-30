package domain

import (
	"context"
	"io"
)

type UploadInput struct {
	Bucket      string
	ObjectPath  string
	ContentType string
	SizeBytes   int64
	Body        io.Reader
}

type DeleteInput struct {
	Bucket     string
	ObjectPath string
}

type Storage interface {
	Upload(ctx context.Context, input UploadInput) error
	Delete(ctx context.Context, input DeleteInput) error
}
