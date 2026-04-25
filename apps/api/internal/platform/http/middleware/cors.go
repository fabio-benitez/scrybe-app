package middleware

import (
	"net/http"
	"slices"
	"strings"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/config"
)

func WithCORS(cfg config.CORSConfig, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if origin != "" {
			w.Header().Add("Vary", "Origin")
		}

		if !isAllowedOrigin(origin, cfg.AllowedOrigins) {
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
			return
		}

		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", strings.Join(cfg.AllowedMethods, ", "))
		w.Header().Set("Access-Control-Allow-Headers", strings.Join(cfg.AllowedHeaders, ", "))

		if cfg.AllowCredentials {
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func isAllowedOrigin(origin string, allowedOrigins []string) bool {
	return origin != "" && slices.Contains(allowedOrigins, origin)
}
