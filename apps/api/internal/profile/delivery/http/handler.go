package http

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/domain"
	"github.com/go-chi/chi/v5"
)

type getProfileUseCase interface {
	Execute(ctx context.Context, userID string) (*domain.Profile, error)
}

type Handler struct {
	getProfileUC getProfileUseCase
}

func NewHandler(getProfileUC getProfileUseCase) *Handler {
	return &Handler{
		getProfileUC: getProfileUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()

	r.Get("/", h.GetProfile)

	return r
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		http.Error(w, "authenticated user not found", http.StatusUnauthorized)
		return
	}

	profile, err := h.getProfileUC.Execute(r.Context(), user.ID)

	if err != nil {
		if errors.Is(err, domain.ErrProfileNotFound) {
			http.Error(w, "profile not found", http.StatusNotFound)
			return
		}

		log.Printf("failed to get profile for user %s: %v", user.ID, err)
		http.Error(w, "failed to get profile", http.StatusInternalServerError)
		return
	}

	response := ProfileResponse{
		ID:           profile.ID,
		Email:        profile.Email,
		DisplayName:  profile.DisplayName,
		AvatarFileID: profile.AvatarFileID,
		CreatedAt:    profile.CreatedAt,
		UpdatedAt:    profile.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}
