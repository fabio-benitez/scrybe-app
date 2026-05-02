package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/tags/application"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/tags/domain"
	"github.com/go-chi/chi/v5"
)

type createTagUseCase interface {
	Execute(ctx context.Context, input application.CreateTagInput) (*domain.Tag, error)
}

type listTagsUseCase interface {
	Execute(ctx context.Context, userID string) ([]*domain.Tag, error)
}

type getTagUseCase interface {
	Execute(ctx context.Context, userID string, tagID string) (*domain.Tag, error)
}

type updateTagUseCase interface {
	Execute(ctx context.Context, input application.UpdateTagInput) (*domain.Tag, error)
}

type deleteTagUseCase interface {
	Execute(ctx context.Context, input application.DeleteTagInput) error
}

type Handler struct {
	createTagUC createTagUseCase
	listTagsUC  listTagsUseCase
	getTagUC    getTagUseCase
	updateTagUC updateTagUseCase
	deleteTagUC deleteTagUseCase
}

func NewHandler(
	createTagUC createTagUseCase,
	listTagsUC listTagsUseCase,
	getTagUC getTagUseCase,
	updateTagUC updateTagUseCase,
	deleteTagUC deleteTagUseCase,
) *Handler {
	return &Handler{
		createTagUC: createTagUC,
		listTagsUC:  listTagsUC,
		getTagUC:    getTagUC,
		updateTagUC: updateTagUC,
		deleteTagUC: deleteTagUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Get("/", h.ListTags)
	r.Post("/", h.CreateTag)
	r.Get("/{tag_id}", h.GetTag)
	r.Patch("/{tag_id}", h.UpdateTag)
	r.Delete("/{tag_id}", h.DeleteTag)
	return r
}

func (h *Handler) CreateTag(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	var req CreateTagRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	tag, err := h.createTagUC.Execute(r.Context(), application.CreateTagInput{
		UserID: user.ID,
		Name:   req.Name,
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrTagNameRequired),
			errors.Is(err, application.ErrTagNameTooLong):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrTagAlreadyExists):
			httpresponse.Error(w, http.StatusConflict, err.Error())

		default:
			slog.ErrorContext(r.Context(), "failed to create tag",
				"user_id", user.ID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to create tag")
		}

		return
	}

	httpresponse.JSON(w, http.StatusCreated, toTagResponse(tag))
}

func toTagResponse(t *domain.Tag) TagResponse {
	return TagResponse{
		ID:        t.ID,
		Name:      t.Name,
		Slug:      t.Slug,
		CreatedAt: t.CreatedAt,
		UpdatedAt: t.UpdatedAt,
	}
}

func toTagResponseList(tags []*domain.Tag) []TagResponse {
	result := make([]TagResponse, len(tags))
	for i, t := range tags {
		result[i] = toTagResponse(t)
	}
	return result
}

func (h *Handler) ListTags(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	tags, err := h.listTagsUC.Execute(r.Context(), user.ID)
	if err != nil {
		slog.ErrorContext(r.Context(), "failed to list tags",
			"user_id", user.ID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to list tags")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toTagResponseList(tags))
}

func (h *Handler) GetTag(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	tagID := chi.URLParam(r, "tag_id")

	tag, err := h.getTagUC.Execute(r.Context(), user.ID, tagID)
	if err != nil {
		if errors.Is(err, domain.ErrTagNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "tag not found")
			return
		}

		slog.ErrorContext(r.Context(), "failed to get tag",
			"user_id", user.ID,
			"tag_id", tagID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to get tag")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toTagResponse(tag))
}

func (h *Handler) UpdateTag(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	tagID := chi.URLParam(r, "tag_id")

	var req UpdateTagRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	tag, err := h.updateTagUC.Execute(r.Context(), application.UpdateTagInput{
		UserID: user.ID,
		TagID:  tagID,
		Name:   req.Name,
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrTagNameRequired),
			errors.Is(err, application.ErrTagNameTooLong):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrTagNotFound):
			httpresponse.Error(w, http.StatusNotFound, "tag not found")

		case errors.Is(err, domain.ErrTagAlreadyExists):
			httpresponse.Error(w, http.StatusConflict, err.Error())

		default:
			slog.ErrorContext(r.Context(), "failed to update tag",
				"user_id", user.ID,
				"tag_id", tagID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to update tag")
		}

		return
	}

	httpresponse.JSON(w, http.StatusOK, toTagResponse(tag))
}

func (h *Handler) DeleteTag(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	tagID := chi.URLParam(r, "tag_id")

	err := h.deleteTagUC.Execute(r.Context(), application.DeleteTagInput{
		UserID: user.ID,
		TagID:  tagID,
	})
	if err != nil {
		if errors.Is(err, domain.ErrTagNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "tag not found")
			return
		}

		slog.ErrorContext(r.Context(), "failed to delete tag",
			"user_id", user.ID,
			"tag_id", tagID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to delete tag")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
