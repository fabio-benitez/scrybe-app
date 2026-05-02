package http

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/categories/application"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/categories/domain"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/go-chi/chi/v5"
)

type createCategoryUseCase interface {
	Execute(ctx context.Context, input application.CreateCategoryInput) (*domain.Category, error)
}

type listCategoriesUseCase interface {
	Execute(ctx context.Context, userID string) ([]*domain.Category, error)
}

type getCategoryUseCase interface {
	Execute(ctx context.Context, userID string, categoryID string) (*domain.Category, error)
}

type updateCategoryUseCase interface {
	Execute(ctx context.Context, input application.UpdateCategoryInput) (*domain.Category, error)
}

type Handler struct {
	createCategoryUC createCategoryUseCase
	listCategoriesUC listCategoriesUseCase
	getCategoryUC    getCategoryUseCase
	updateCategoryUC updateCategoryUseCase
}

func NewHandler(
	createCategoryUC createCategoryUseCase,
	listCategoriesUC listCategoriesUseCase,
	getCategoryUC getCategoryUseCase,
	updateCategoryUC updateCategoryUseCase,
) *Handler {
	return &Handler{
		createCategoryUC: createCategoryUC,
		listCategoriesUC: listCategoriesUC,
		getCategoryUC:    getCategoryUC,
		updateCategoryUC: updateCategoryUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Get("/", h.ListCategories)
	r.Post("/", h.CreateCategory)
	r.Get("/{category_id}", h.GetCategory)
	r.Patch("/{category_id}", h.UpdateCategory)
	return r
}

func (h *Handler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	var req CreateCategoryRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	category, err := h.createCategoryUC.Execute(r.Context(), application.CreateCategoryInput{
		UserID:      user.ID,
		Name:        req.Name,
		Description: req.Description,
		Color:       req.Color,
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrCategoryNameRequired),
			errors.Is(err, application.ErrCategoryNameTooLong),
			errors.Is(err, application.ErrCategoryDescriptionTooLong),
			errors.Is(err, application.ErrCategoryColorNotAllowed):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrCategoryAlreadyExists):
			httpresponse.Error(w, http.StatusConflict, err.Error())

		default:
			slog.ErrorContext(r.Context(), "failed to create category",
				"user_id", user.ID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to create category")
		}

		return
	}

	httpresponse.JSON(w, http.StatusCreated, toCategoryResponse(category))
}

func (h *Handler) ListCategories(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	categories, err := h.listCategoriesUC.Execute(r.Context(), user.ID)
	if err != nil {
		slog.ErrorContext(r.Context(), "failed to list categories",
			"user_id", user.ID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to list categories")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toCategoryResponseList(categories))
}

func (h *Handler) GetCategory(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	categoryID := chi.URLParam(r, "category_id")

	category, err := h.getCategoryUC.Execute(r.Context(), user.ID, categoryID)
	if err != nil {
		if errors.Is(err, domain.ErrCategoryNotFound) {
			httpresponse.Error(w, http.StatusNotFound, "category not found")
			return
		}

		slog.ErrorContext(r.Context(), "failed to get category",
			"user_id", user.ID,
			"category_id", categoryID,
			"error", err,
		)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to get category")
		return
	}

	httpresponse.JSON(w, http.StatusOK, toCategoryResponse(category))
}

func (h *Handler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	categoryID := chi.URLParam(r, "category_id")

	var req UpdateCategoryRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpresponse.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	category, err := h.updateCategoryUC.Execute(r.Context(), application.UpdateCategoryInput{
		UserID:      user.ID,
		CategoryID:  categoryID,
		Name:        req.Name,
		Description: req.Description,
		Color:       req.Color,
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrCategoryNameRequired),
			errors.Is(err, application.ErrCategoryNameTooLong),
			errors.Is(err, application.ErrCategoryDescriptionTooLong),
			errors.Is(err, application.ErrCategoryColorNotAllowed):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrCategoryNotFound):
			httpresponse.Error(w, http.StatusNotFound, "category not found")

		case errors.Is(err, domain.ErrCategoryAlreadyExists):
			httpresponse.Error(w, http.StatusConflict, err.Error())

		default:
			slog.ErrorContext(r.Context(), "failed to update category",
				"user_id", user.ID,
				"category_id", categoryID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to update category")
		}

		return
	}

	httpresponse.JSON(w, http.StatusOK, toCategoryResponse(category))
}

func toCategoryResponse(c *domain.Category) CategoryResponse {
	return CategoryResponse{
		ID:          c.ID,
		Name:        c.Name,
		Slug:        c.Slug,
		Description: c.Description,
		Color:       c.Color,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}

func toCategoryResponseList(categories []*domain.Category) []CategoryResponse {
	result := make([]CategoryResponse, len(categories))
	for i, c := range categories {
		result[i] = toCategoryResponse(c)
	}
	return result
}
