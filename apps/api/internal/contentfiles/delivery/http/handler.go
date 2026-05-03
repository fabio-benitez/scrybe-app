package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contentfiles/application"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contentfiles/domain"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/go-chi/chi/v5"
)

type listContentFilesUseCase interface {
	Execute(ctx context.Context, userID, contentID string) ([]*domain.File, error)
}

type replaceContentFilesUseCase interface {
	Execute(ctx context.Context, input application.ReplaceContentFilesInput) ([]*domain.File, error)
}

type Handler struct {
	listContentFilesUC    listContentFilesUseCase
	replaceContentFilesUC replaceContentFilesUseCase
}

func NewHandler(listContentFilesUC listContentFilesUseCase, replaceContentFilesUC replaceContentFilesUseCase) *Handler {
	return &Handler{
		listContentFilesUC:    listContentFilesUC,
		replaceContentFilesUC: replaceContentFilesUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Get("/", h.ListContentFiles)
	r.Put("/", h.ReplaceContentFiles)
	return r
}

func (h *Handler) ListContentFiles(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	contentID := chi.URLParam(r, "content_id")

	files, err := h.listContentFilesUC.Execute(r.Context(), user.ID, contentID)
	if err != nil {
		if errors.Is(err, domain.ErrContentNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "content not found")
			return
		}

		slog.ErrorContext(r.Context(), "failed to list content files",
			"user_id", user.ID,
			"content_id", contentID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to list content files")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toContentFileResponseList(files))
}

func (h *Handler) ReplaceContentFiles(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	contentID := chi.URLParam(r, "content_id")

	var req SetContentFilesRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.FileIDs == nil {
		httpresponse.Error(w, http.StatusBadRequest, "file_ids is required")
		return
	}

	files, err := h.replaceContentFilesUC.Execute(r.Context(), application.ReplaceContentFilesInput{
		UserID:    user.ID,
		ContentID: contentID,
		FileIDs:   *req.FileIDs,
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrInvalidFileID):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrContentNotFound):
			httpresponse.Error(w, http.StatusNotFound, "content not found")

		case errors.Is(err, domain.ErrFileNotFound):
			httpresponse.Error(w, http.StatusNotFound, "file not found")

		default:
			slog.ErrorContext(r.Context(), "failed to replace content files",
				"user_id", user.ID,
				"content_id", contentID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to replace content files")
		}

		return
	}

	httpresponse.JSON(w, http.StatusOK, toContentFileResponseList(files))
}
