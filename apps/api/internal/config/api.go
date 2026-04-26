package config

import (
	"errors"
)

type APIConfig struct {
	Addr string

	Database DatabaseConfig
	Auth     AuthConfig
	Storage  StorageConfig
	CORS     CORSConfig
}

type DatabaseConfig struct {
	URL string
}

type AuthConfig struct {
	JWKSURL string
}

type StorageConfig struct {
	Provider  string
	BaseURL   string
	SecretKey string
	Bucket    string
}

type CORSConfig struct {
	AllowedOrigins   []string
	AllowedMethods   []string
	AllowedHeaders   []string
	AllowCredentials bool
}

func LoadAPIConfig() (*APIConfig, error) {
	cfg := &APIConfig{
		Addr: getEnvOrDefault("API_ADDR", ":8081"),

		Database: DatabaseConfig{
			URL: getEnvOrDefault("DATABASE_URL", ""),
		},

		Auth: AuthConfig{
			JWKSURL: getEnvOrDefault("AUTH_JWKS_URL", ""),
		},

		Storage: StorageConfig{
			Provider:  getEnvOrDefault("STORAGE_PROVIDER", "supabase"),
			BaseURL:   getEnvOrDefault("STORAGE_BASE_URL", ""),
			SecretKey: getEnvOrDefault("STORAGE_SECRET_KEY", ""),
			Bucket:    getEnvOrDefault("STORAGE_BUCKET", "attachments"),
		},

		CORS: CORSConfig{
			AllowedOrigins:   getEnvAsSlice("CORS_ALLOWED_ORIGINS"),
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Content-Type", "Accept", "Authorization"},
			AllowCredentials: true,
		},
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *APIConfig) validate() error {
	if c.Database.URL == "" {
		return errors.New("DATABASE_URL is required")
	}

	if c.Auth.JWKSURL == "" {
		return errors.New("AUTH_JWKS_URL is required")
	}

	return nil
}
