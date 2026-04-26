package http

import (
	"context"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/auth"
)

type contextKey string

const userContextKey contextKey = "authenticated_user"

func WithAuthenticatedUser(ctx context.Context, user *auth.AuthenticatedUser) context.Context {
	return context.WithValue(ctx, userContextKey, user)
}

func GetAuthenticatedUser(ctx context.Context) (*auth.AuthenticatedUser, bool) {
	user, ok := ctx.Value(userContextKey).(*auth.AuthenticatedUser)
	return user, ok
}
