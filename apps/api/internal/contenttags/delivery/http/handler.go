package http

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contenttags/domain"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/go-chi/chi/v5"
)

type listContentTagsUseCase interface {
	Execute(ctx context.Context, userID, contentID string) ([]*domain.Tag, error)
}

type Handler struct {
	listContentTagsUC listContentTagsUseCase
}

func NewHandler(listContentTagsUC listContentTagsUseCase) *Handler {
	return &Handler{
		listContentTagsUC: listContentTagsUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Get("/", h.ListContentTags)
	return r
}

func (h *Handler) ListContentTags(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	contentID := chi.URLParam(r, "content_id")

	tags, err := h.listContentTagsUC.Execute(r.Context(), user.ID, contentID)
	if err != nil {
		if errors.Is(err, domain.ErrContentNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "content not found")
			return
		}

		slog.ErrorContext(r.Context(), "failed to list content tags",
			"user_id", user.ID,
			"content_id", contentID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to list content tags")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toTagResponseList(tags))
}
