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

type Handler struct {
	createTagUC createTagUseCase
}

func NewHandler(
	createTagUC createTagUseCase,
) *Handler {
	return &Handler{
		createTagUC: createTagUC,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Post("/", h.CreateTag)
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
