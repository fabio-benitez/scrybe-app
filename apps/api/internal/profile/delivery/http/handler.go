package http

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/application"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/domain"
	"github.com/go-chi/chi/v5"
)

type getProfileUseCase interface {
	Execute(ctx context.Context, userID string) (*domain.Profile, error)
}

type updateProfileUseCase interface {
	Execute(ctx context.Context, input application.UpdateProfileInput) (*domain.Profile, error)
}

type Handler struct {
	getProfileUC    getProfileUseCase
	updateProfileUC updateProfileUseCase
}

func NewHandler(
	getProfileUC getProfileUseCase,
	updateProfileUC updateProfileUseCase,
) *Handler {
	return &Handler{
		getProfileUC:    getProfileUC,
		updateProfileUC: updateProfileUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()

	r.Get("/", h.GetProfile)
	r.Patch("/", h.UpdateProfile)

	return r
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	profile, err := h.getProfileUC.Execute(r.Context(), user.ID)

	if err != nil {
		if errors.Is(err, domain.ErrProfileNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "profile not found")
			return
		}

		log.Printf("failed to get profile for user %s: %v", user.ID, err)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to get profile")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toProfileResponse(profile))
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	var req UpdateProfileRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	profile, err := h.updateProfileUC.Execute(r.Context(), application.UpdateProfileInput{
		UserID:      user.ID,
		DisplayName: req.DisplayName,
	})

	if err != nil {
		if errors.Is(err, application.ErrDisplayNameRequired) ||
			errors.Is(err, application.ErrDisplayNameTooLong) {
			httpresponse.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if errors.Is(err, domain.ErrProfileNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "profile not found")
			return
		}

		log.Printf("failed to update profile for user %s: %v", user.ID, err)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toProfileResponse(profile))
}

func toProfileResponse(profile *domain.Profile) ProfileResponse {
	return ProfileResponse{
		ID:           profile.ID,
		Email:        profile.Email,
		DisplayName:  profile.DisplayName,
		AvatarFileID: profile.AvatarFileID,
		CreatedAt:    profile.CreatedAt,
		UpdatedAt:    profile.UpdatedAt,
	}
}
