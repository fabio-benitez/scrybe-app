package bootstrap

import (
	"log"
	"net/http"

	authhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/auth/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/config"
	filesapp "github.com/fabio-benitez/scrybe-app/apps/api/internal/files/application"
	fileshttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/files/delivery/http"
	filesinfra "github.com/fabio-benitez/scrybe-app/apps/api/internal/files/infrastructure"
	healthhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/health/delivery/http"
	platformauth "github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/auth"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/database"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/middleware"
	profileapp "github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/application"
	profilehttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/delivery/http"
	profileinfra "github.com/fabio-benitez/scrybe-app/apps/api/internal/profile/infrastructure"
	"github.com/go-chi/chi/v5"
	middlewareChi "github.com/go-chi/chi/v5/middleware"
)

func RunAPI(cfg *config.APIConfig) error {
	// Infraestructure
	dbPool, err := database.NewPostgresPool(cfg.Database.URL)
	if err != nil {
		return err
	}
	defer dbPool.Close()

	jwtValidator, err := platformauth.NewJWTValidator(cfg.Auth.JWKSURL)
	if err != nil {
		return err
	}

	authMiddleware := authhttp.NewMiddleware(jwtValidator)

	profileRepo := profileinfra.NewPostgresRepository(dbPool)
	getProfileUC := profileapp.NewGetProfileUseCase(profileRepo)
	updateProfileUC := profileapp.NewUpdateProfileUseCase(profileRepo)
	profileHandler := profilehttp.NewHandler(getProfileUC, updateProfileUC)

	filesRepo := filesinfra.NewPostgresRepository(dbPool)
	filesStorage := filesinfra.NewSupabaseStorage(cfg.Storage.BaseURL, cfg.Storage.SecretKey)
	uploadFileUC, err := filesapp.NewUploadFileUseCase(
		filesRepo,
		filesStorage,
		cfg.Storage.Bucket,
		cfg.Storage.MaxUploadBytes,
		cfg.Storage.AllowedMimeTypes,
	)
	if err != nil {
		return err
	}
	filesHandler := fileshttp.NewHandler(uploadFileUC, cfg.Storage.MaxUploadBytes)

	// Router
	r := chi.NewRouter()
	r.Use(middlewareChi.Recoverer)
	r.Use(middlewareChi.Logger)

	r.Route("/api/v1", func(r chi.Router) {
		// Public routes
		r.Mount("/health", healthhttp.NewHandler(dbPool).Routes())

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.RequireAuth)

			r.Mount("/profile", profileHandler.Routes())
			r.Mount("/files", filesHandler.Routes())
		})
	})

	log.Printf("api listening on %s", cfg.Addr)

	return http.ListenAndServe(cfg.Addr, middleware.WithCORS(cfg.CORS, r))
}
