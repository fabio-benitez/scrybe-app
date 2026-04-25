package bootstrap

import (
	"log"
	"net/http"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/config"
	healthhttp "github.com/fabio-benitez/scrybe-app/apps/api/internal/health/delivery/http"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/database"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/platform/http/middleware"
	"github.com/go-chi/chi/v5"
	middlewareChi "github.com/go-chi/chi/v5/middleware"
)

func RunAPI(cfg *config.APIConfig) error {
	dbPool, err := database.NewPostgresPool(cfg.Database.URL)
	if err != nil {
		return err
	}
	defer dbPool.Close()

	r := chi.NewRouter()
	r.Use(middlewareChi.Recoverer)
	r.Use(middlewareChi.Logger)

	r.Route("/api/v1", func(r chi.Router) {
		r.Mount("/health", healthhttp.NewHandler(dbPool).Routes())
	})

	log.Printf("api listening on %s", cfg.Addr)

	return http.ListenAndServe(cfg.Addr, middleware.WithCORS(cfg.CORS, r))
}
