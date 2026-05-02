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

type updateAvatarUseCase interface {
	Execute(ctx context.Context, input application.UpdateAvatarInput) (*domain.Profile, error)
}

type deleteAvatarUseCase interface {
	Execute(ctx context.Context, userID string) (*domain.Profile, error)
}

type Handler struct {
	getProfileUC    getProfileUseCase
	updateProfileUC updateProfileUseCase
	updateAvatarUC  updateAvatarUseCase
	deleteAvatarUC  deleteAvatarUseCase
}

func NewHandler(
	getProfileUC getProfileUseCase,
	updateProfileUC updateProfileUseCase,
	updateAvatarUC updateAvatarUseCase,
	deleteAvatarUC deleteAvatarUseCase,
) *Handler {
	return &Handler{
		getProfileUC:    getProfileUC,
		updateProfileUC: updateProfileUC,
		updateAvatarUC:  updateAvatarUC,
		deleteAvatarUC:  deleteAvatarUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()

	r.Get("/", h.GetProfile)
	r.Patch("/", h.UpdateProfile)
	r.Patch("/avatar", h.UpdateAvatar)
	r.Delete("/avatar", h.DeleteAvatar)

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

func (h *Handler) UpdateAvatar(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	var req UpdateAvatarRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	profile, err := h.updateAvatarUC.Execute(r.Context(), application.UpdateAvatarInput{
		UserID: user.ID,
		FileID: req.FileID,
	})

	if err != nil {
		if errors.Is(err, domain.ErrInvalidAvatarFileID) {
			httpresponse.Error(w, http.StatusBadRequest, err.Error())
			return
		}

		if errors.Is(err, domain.ErrAvatarFileNotFound) {
			httpresponse.Error(w, http.StatusNotFound, err.Error())
			return
		}

		if errors.Is(err, domain.ErrAvatarFileNotReady) ||
			errors.Is(err, domain.ErrAvatarMimeTypeNotAllowed) {
			httpresponse.Error(w, http.StatusUnprocessableEntity, err.Error())
			return
		}

		if errors.Is(err, domain.ErrProfileNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "profile not found")
			return
		}

		log.Printf("failed to update avatar for user %s: %v", user.ID, err)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to update avatar")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toProfileResponse(profile))
}

func (h *Handler) DeleteAvatar(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	profile, err := h.deleteAvatarUC.Execute(r.Context(), user.ID)

	if err != nil {
		if errors.Is(err, domain.ErrProfileNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "profile not found")
			return
		}

		log.Printf("failed to delete avatar for user %s: %v", user.ID, err)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to delete avatar")
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
