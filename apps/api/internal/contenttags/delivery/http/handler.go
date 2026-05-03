package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contenttags/application"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contenttags/domain"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/go-chi/chi/v5"
)

type listContentTagsUseCase interface {
	Execute(ctx context.Context, userID, contentID string) ([]*domain.Tag, error)
}

type replaceContentTagsUseCase interface {
	Execute(ctx context.Context, input application.ReplaceContentTagsInput) ([]*domain.Tag, error)
}

type Handler struct {
	listContentTagsUC    listContentTagsUseCase
	replaceContentTagsUC replaceContentTagsUseCase
}

func NewHandler(listContentTagsUC listContentTagsUseCase, replaceContentTagsUC replaceContentTagsUseCase) *Handler {
	return &Handler{
		listContentTagsUC:    listContentTagsUC,
		replaceContentTagsUC: replaceContentTagsUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Get("/", h.ListContentTags)
	r.Put("/", h.ReplaceContentTags)
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

func (h *Handler) ReplaceContentTags(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	contentID := chi.URLParam(r, "content_id")

	var req SetContentTagsRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.TagIDs == nil {
		httpresponse.Error(w, http.StatusBadRequest, "tag_ids is required")
		return
	}

	tags, err := h.replaceContentTagsUC.Execute(r.Context(), application.ReplaceContentTagsInput{
		UserID:    user.ID,
		ContentID: contentID,
		TagIDs:    *req.TagIDs,
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrInvalidTagID):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrContentNotFound):
			httpresponse.Error(w, http.StatusNotFound, "content not found")

		case errors.Is(err, domain.ErrTagNotFound):
			httpresponse.Error(w, http.StatusNotFound, "tag not found")

		default:
			slog.ErrorContext(r.Context(), "failed to replace content tags",
				"user_id", user.ID,
				"content_id", contentID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to replace content tags")
		}

		return
	}

	httpresponse.JSON(w, http.StatusOK, toTagResponseList(tags))
}
