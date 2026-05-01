package http

import (
	"bytes"
	"context"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"path/filepath"
	"strings"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/application"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
	httpresponse "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/response"
	"github.com/go-chi/chi/v5"
)

type uploadFileUseCase interface {
	Execute(ctx context.Context, input application.UploadFileInput) (*domain.File, error)
}

type getFileUseCase interface {
	Execute(ctx context.Context, userID string, fileID string) (*domain.File, error)
}

type Handler struct {
	uploadFileUC   uploadFileUseCase
	getFileUC      getFileUseCase
	maxUploadBytes int64
}

func NewHandler(
	uc uploadFileUseCase,
	gfc getFileUseCase,
	maxUploadBytes int64,
) *Handler {
	return &Handler{
		uploadFileUC:   uc,
		getFileUC:      gfc,
		maxUploadBytes: maxUploadBytes,
	}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Post("/", h.UploadFile)
	r.Get("/{file_id}", h.GetFile)
	return r
}

func (h *Handler) UploadFile(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	// El body multipart incluye cabeceras y boundaries, por eso se añade un pequeño margen.
	r.Body = http.MaxBytesReader(w, r.Body, h.maxUploadBytes+4096)

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		if _, ok := errors.AsType[*http.MaxBytesError](err); ok {
			httpresponse.Error(w, http.StatusRequestEntityTooLarge, "file exceeds maximum allowed size")
			return
		}

		httpresponse.Error(w, http.StatusBadRequest, "invalid multipart form")
		return
	}
	defer r.MultipartForm.RemoveAll()

	file, header, err := r.FormFile("file")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			httpresponse.Error(w, http.StatusBadRequest, "file field is required")
			return
		}

		httpresponse.Error(w, http.StatusBadRequest, "invalid file field")
		return
	}
	defer file.Close()

	originalName := strings.TrimSpace(header.Filename)
	if originalName == "" {
		httpresponse.Error(w, http.StatusBadRequest, "file name is required")
		return
	}

	originalName = filepath.Base(originalName)
	if originalName == "." || originalName == "/" {
		httpresponse.Error(w, http.StatusBadRequest, "file name is invalid")
		return
	}

	if len(originalName) > 255 {
		httpresponse.Error(w, http.StatusBadRequest, "file name is too long")
		return
	}

	// Se leen los primeros bytes para detectar el MIME sin consumir definitivamente el archivo.
	buf512 := make([]byte, 512)
	n, err := io.ReadFull(file, buf512)
	if err != nil &&
		!errors.Is(err, io.ErrUnexpectedEOF) &&
		!errors.Is(err, io.EOF) {
		slog.ErrorContext(r.Context(), "failed to read file for MIME detection", "error", err)
		httpresponse.Error(w, http.StatusInternalServerError, "failed to read file")
		return
	}

	if n == 0 {
		httpresponse.Error(w, http.StatusBadRequest, "file is empty")
		return
	}

	buf := buf512[:n]
	detectedMIME := http.DetectContentType(buf)

	body := io.MultiReader(bytes.NewReader(buf), file)

	result, err := h.uploadFileUC.Execute(r.Context(), application.UploadFileInput{
		UserID:       user.ID,
		OriginalName: originalName,
		DeclaredMIME: header.Header.Get("Content-Type"),
		DetectedMIME: detectedMIME,
		SizeBytes:    header.Size,
		Body:         body,
	})
	if err != nil {
		switch {
		case errors.Is(err, application.ErrOriginalNameRequired),
			errors.Is(err, domain.ErrEmptyFile),
			errors.Is(err, domain.ErrMimeTypeNotAllowed):
			httpresponse.Error(w, http.StatusBadRequest, err.Error())

		case errors.Is(err, domain.ErrFileTooLarge):
			httpresponse.Error(w, http.StatusRequestEntityTooLarge, err.Error())

		case errors.Is(err, application.ErrFileAlreadyExists):
			httpresponse.Error(w, http.StatusConflict, err.Error())

		case errors.Is(err, application.ErrStorageUnavailable):
			httpresponse.Error(w, http.StatusInternalServerError, "storage unavailable")

		default:
			slog.ErrorContext(r.Context(), "failed to upload file",
				"user_id", user.ID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to upload file")
		}

		return
	}

	httpresponse.JSON(w, http.StatusCreated, toFileResponse(result))
}

func (h *Handler) GetFile(w http.ResponseWriter, r *http.Request) {
	user, ok := authhttp.GetAuthenticatedUser(r.Context())
	if !ok {
		httpresponse.Error(w, http.StatusUnauthorized, "authenticated user not found")
		return
	}

	fileID := chi.URLParam(r, "file_id")

	file, err := h.getFileUC.Execute(r.Context(), user.ID, fileID)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrFileNotFound):
			httpresponse.Error(w, http.StatusNotFound, "file not found")

		default:
			slog.ErrorContext(r.Context(), "failed to get file",
				"user_id", user.ID,
				"file_id", fileID,
				"error", err,
			)
			httpresponse.Error(w, http.StatusInternalServerError, "failed to get file")
		}

		return
	}

	httpresponse.JSON(w, http.StatusOK, toFileResponse(file))
}
