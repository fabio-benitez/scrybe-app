package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/application"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contents/domain"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/go-chi/chi/v5"
)

type createContentUseCase interface {
	Execute(ctx context.Context, input application.CreateContentInput) (*domain.Content, error)
}

type listContentsUseCase interface {
	Execute(ctx context.Context, userID string) ([]*domain.Content, error)
}

type getContentUseCase interface {
	Execute(ctx context.Context, userID string, contentID string) (*domain.Content, error)
}

type updateContentUseCase interface {
	Execute(ctx context.Context, input application.UpdateContentInput) (*domain.Content, error)
}

type deleteContentUseCase interface {
	Execute(ctx context.Context, input application.DeleteContentInput) error
}

type Handler struct {
	createContentUC createContentUseCase
	listContentsUC  listContentsUseCase
	getContentUC    getContentUseCase
	updateContentUC updateContentUseCase
	deleteContentUC deleteContentUseCase
}

func NewHandler(
	createContentUC createContentUseCase,
	listContentsUC listContentsUseCase,
	getContentUC getContentUseCase,
	updateContentUC updateContentUseCase,
	deleteContentUC deleteContentUseCase,
) *Handler {
	return &Handler{
		createContentUC: createContentUC,
		listContentsUC:  listContentsUC,
		getContentUC:    getContentUC,
		updateContentUC: updateContentUC,
		deleteContentUC: deleteContentUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Get("/", h.ListContents)
	r.Post("/", h.CreateContent)
	r.Get("/{content_id}", h.GetContent)
	r.Patch("/{content_id}", h.UpdateContent)
	r.Delete("/{content_id}", h.DeleteContent)
	return r
}

func (h *Handler) CreateContent(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	var req CreateContentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	content, err := h.createContentUC.Execute(r.Context(), application.CreateContentInput{
		UserID:     user.ID,
		CategoryID: req.CategoryID,
		Title:      req.Title,
		Summary:    req.Summary,
		Content:    req.Content,
		Status:     req.Status,
		Visibility: req.Visibility,
		IsFavorite: req.IsFavorite,
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrContentTitleRequired),
			errors.Is(err, application.ErrContentTitleTooLong),
			errors.Is(err, application.ErrContentSummaryTooLong),
			errors.Is(err, application.ErrContentInvalidJSON),
			errors.Is(err, application.ErrContentStatusNotAllowed),
			errors.Is(err, application.ErrContentVisibilityNotAllowed),
			errors.Is(err, application.ErrContentCategoryIDInvalid):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrContentCategoryNotFound):
			httpresponse.Error(w, http.StatusNotFound, err.Error())

		case errors.Is(err, domain.ErrContentAlreadyExists):
			httpresponse.Error(w, http.StatusConflict, err.Error())

		default:
			slog.ErrorContext(r.Context(), "failed to create content",
				"user_id", user.ID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to create content")
		}

		return
	}

	httpresponse.JSON(w, http.StatusCreated, toContentResponse(content))
}

func (h *Handler) ListContents(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	contents, err := h.listContentsUC.Execute(r.Context(), user.ID)
	if err != nil {
		slog.ErrorContext(r.Context(), "failed to list contents",
			"user_id", user.ID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to list contents")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toContentResponseList(contents))
}

func (h *Handler) GetContent(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	contentID := chi.URLParam(r, "content_id")

	content, err := h.getContentUC.Execute(r.Context(), user.ID, contentID)
	if err != nil {
		if errors.Is(err, domain.ErrContentNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "content not found")
			return
		}

		slog.ErrorContext(r.Context(), "failed to get content",
			"user_id", user.ID,
			"content_id", contentID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to get content")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toContentResponse(content))
}

func (h *Handler) UpdateContent(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	contentID := chi.URLParam(r, "content_id")

	var req UpdateContentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var contentInput *json.RawMessage
	if req.Content.Present {
		if req.Content.Null {
			httpresponse.Error(w, http.StatusBadRequest, application.ErrContentInvalidJSON.Error())
			return
		}
		contentInput = &req.Content.Value
	}

	var categoryIDInput **string

	if req.CategoryID.Present {
		if req.CategoryID.Null {
			var nilStr *string
			categoryIDInput = &nilStr
		} else {
			var uuidStr string
			if err := json.Unmarshal(req.CategoryID.Value, &uuidStr); err != nil || uuidStr == "" {
				httpresponse.Error(w, http.StatusBadRequest, application.ErrContentCategoryIDInvalid.Error())
				return
			}
			value := uuidStr
			valuePtr := &value
			categoryIDInput = &valuePtr
		}
	}

	content, err := h.updateContentUC.Execute(r.Context(), application.UpdateContentInput{
		UserID:     user.ID,
		ContentID:  contentID,
		Title:      req.Title,
		Summary:    req.Summary,
		Content:    contentInput,
		CategoryID: categoryIDInput,
		Status:     req.Status,
		Visibility: req.Visibility,
		IsFavorite: req.IsFavorite,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrContentNotFound):
			httpresponse.Error(w, http.StatusNotFound, "content not found")

		case errors.Is(err, application.ErrContentTitleRequired),
			errors.Is(err, application.ErrContentTitleTooLong),
			errors.Is(err, application.ErrContentSummaryTooLong),
			errors.Is(err, application.ErrContentInvalidJSON),
			errors.Is(err, application.ErrContentStatusNotAllowed),
			errors.Is(err, application.ErrContentVisibilityNotAllowed),
			errors.Is(err, application.ErrContentCategoryIDInvalid):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrContentCategoryNotFound):
			httpresponse.Error(w, http.StatusNotFound, err.Error())

		case errors.Is(err, domain.ErrContentAlreadyExists):
			httpresponse.Error(w, http.StatusConflict, err.Error())

		default:
			slog.ErrorContext(r.Context(), "failed to update content",
				"user_id", user.ID,
				"content_id", contentID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to update content")
		}

		return
	}

	httpresponse.JSON(w, http.StatusOK, toContentResponse(content))
}

func toContentResponseList(contents []*domain.Content) []ContentResponse {
	result := make([]ContentResponse, len(contents))
	for i, c := range contents {
		result[i] = toContentResponse(c)
	}
	return result
}

func (h *Handler) DeleteContent(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	contentID := chi.URLParam(r, "content_id")

	err := h.deleteContentUC.Execute(r.Context(), application.DeleteContentInput{
		UserID:    user.ID,
		ContentID: contentID,
	})
	if err != nil {
		if errors.Is(err, domain.ErrContentNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "content not found")
			return
		}

		slog.ErrorContext(r.Context(), "failed to delete content",
			"user_id", user.ID,
			"content_id", contentID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to delete content")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func toContentResponse(c *domain.Content) ContentResponse {
	return ContentResponse{
		ID:          c.ID,
		CategoryID:  c.CategoryID,
		Title:       c.Title,
		Slug:        c.Slug,
		Summary:     c.Summary,
		Content:     c.Content,
		Status:      string(c.Status),
		Visibility:  string(c.Visibility),
		IsFavorite:  c.IsFavorite,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
		PublishedAt: c.PublishedAt,
	}
}
