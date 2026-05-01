package config

import (
	"errors"
	"strings"
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
	Provider         string
	BaseURL          string
	SecretKey        string
	Bucket           string
	MaxUploadBytes   int64
	AllowedMimeTypes []string
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
			Provider:         getEnvOrDefault("STORAGE_PROVIDER", "supabase"),
			BaseURL:          getEnvOrDefault("STORAGE_BASE_URL", ""),
			SecretKey:        getEnvOrDefault("STORAGE_SECRET_KEY", ""),
			Bucket:           getEnvOrDefault("STORAGE_BUCKET", "attachments"),
			MaxUploadBytes:   getEnvAsInt64OrDefault("STORAGE_MAX_UPLOAD_BYTES", 52428800),
			AllowedMimeTypes: getEnvAsSlice("STORAGE_ALLOWED_MIME_TYPES"),
		},

		CORS: CORSConfig{
			AllowedOrigins:   getEnvAsSlice("CORS_ALLOWED_ORIGINS"),
			AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
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

	if strings.EqualFold(c.Storage.Provider, "supabase") {
		if c.Storage.BaseURL == "" {
			return errors.New("STORAGE_BASE_URL is required when STORAGE_PROVIDER is supabase")
		}

		if c.Storage.SecretKey == "" {
			return errors.New("STORAGE_SECRET_KEY is required when STORAGE_PROVIDER is supabase")
		}

		if c.Storage.Bucket == "" {
			return errors.New("STORAGE_BUCKET is required when STORAGE_PROVIDER is supabase")
		}

		if c.Storage.MaxUploadBytes <= 0 {
			return errors.New("STORAGE_MAX_UPLOAD_BYTES must be greater than zero when STORAGE_PROVIDER is supabase")
		}

		if len(c.Storage.AllowedMimeTypes) == 0 {
			return errors.New("STORAGE_ALLOWED_MIME_TYPES is required when STORAGE_PROVIDER is supabase")
		}
	}

	return nil
}
