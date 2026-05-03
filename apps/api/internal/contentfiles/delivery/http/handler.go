package http

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contentfiles/domain"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/go-chi/chi/v5"
)

type listContentFilesUseCase interface {
	Execute(ctx context.Context, userID, contentID string) ([]*domain.File, error)
}

type Handler struct {
	listContentFilesUC listContentFilesUseCase
}

func NewHandler(listContentFilesUC listContentFilesUseCase) *Handler {
	return &Handler{
		listContentFilesUC: listContentFilesUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Get("/", h.ListContentFiles)
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
