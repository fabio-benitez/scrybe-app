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

type Handler struct {
	createCategoryUC createCategoryUseCase
}

func NewHandler(createCategoryUC createCategoryUseCase) *Handler {
	return &Handler{
		createCategoryUC: createCategoryUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Post("/", h.CreateCategory)
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
