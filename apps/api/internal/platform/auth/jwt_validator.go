package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

var ErrInvalidToken = errors.New("invalid token")

type AuthenticatedUser struct {
	ID    string
	Email string
}

type JWTValidator struct {
	jwksURL string
	cache   *jwk.Cache
}

func NewJWTValidator(jwksURL string) (*JWTValidator, error) {
	cache := jwk.NewCache(context.Background())

	if err := cache.Register(jwksURL); err != nil {
		return nil, fmt.Errorf("register jwks cache: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, err := cache.Refresh(ctx, jwksURL); err != nil {
		return nil, fmt.Errorf("refresh jwks: %w", err)
	}

	return &JWTValidator{
		jwksURL: jwksURL,
		cache:   cache,
	}, nil
}

func (v *JWTValidator) ValidateToken(tokenStr string) (*AuthenticatedUser, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	keySet, err := v.cache.Get(ctx, v.jwksURL)
	if err != nil {
		return nil, ErrInvalidToken
	}

	token, err := jwt.Parse(
		[]byte(tokenStr),
		jwt.WithKeySet(keySet),
		jwt.WithValidate(true),
	)
	if err != nil {
		return nil, ErrInvalidToken
	}

	sub, ok := token.Get("sub")
	if !ok {
		return nil, ErrInvalidToken
	}

	email, _ := token.Get("email")

	userID, ok := sub.(string)
	if !ok || userID == "" {
		return nil, ErrInvalidToken
	}

	var userEmail string
	if emailStr, ok := email.(string); ok {
		userEmail = emailStr
	}

	return &AuthenticatedUser{
		ID:    userID,
		Email: userEmail,
	}, nil
}
