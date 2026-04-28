package application

import (
	"context"
	"errors"
	"strings"
	"unicode/utf8"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/domain"
)

var (
	ErrDisplayNameRequired = errors.New("display name is required")
	ErrDisplayNameTooLong  = errors.New("display name is too long")
)

type UpdateProfileUseCase struct {
	repo domain.Repository
}

type UpdateProfileInput struct {
	UserID      string
	DisplayName string
}

func NewUpdateProfileUseCase(repo domain.Repository) *UpdateProfileUseCase {
	return &UpdateProfileUseCase{
		repo: repo,
	}
}

func (uc *UpdateProfileUseCase) Execute(ctx context.Context, input UpdateProfileInput) (*domain.Profile, error) {
	displayName := strings.TrimSpace(input.DisplayName)

	if displayName == "" {
		return nil, ErrDisplayNameRequired
	}

	if utf8.RuneCountInString(displayName) > 80 {
		return nil, ErrDisplayNameTooLong
	}

	return uc.repo.UpdateDisplayName(ctx, input.UserID, displayName)
}
