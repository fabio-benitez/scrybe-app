package http

import (
	"net/http"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/auth"
)

type tokenValidator interface {
	ValidateToken(token string) (*auth.AuthenticatedUser, error)
}

type Middleware struct {
	validator tokenValidator
}

func NewMiddleware(validator tokenValidator) *Middleware {
	return &Middleware{validator: validator}
}

func (m *Middleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			http.Error(w, "Authorization header is required", http.StatusUnauthorized)
			return
		}

		token, ok := strings.CutPrefix(authHeader, "Bearer ")

		if !ok || strings.TrimSpace(token) == "" {
			http.Error(w, "Bearer token is required", http.StatusUnauthorized)
			return
		}

		user, err := m.validator.ValidateToken(token)

		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := WithAuthenticatedUser(r.Context(), user)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
