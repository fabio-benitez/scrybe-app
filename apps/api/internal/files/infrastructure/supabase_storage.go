package infrastructure

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/files/domain"
)

type SupabaseStorage struct {
	baseURL    string
	secretKey  string
	httpClient *http.Client
}

func NewSupabaseStorage(baseURL string, secretKey string) *SupabaseStorage {
	return &SupabaseStorage{
		baseURL:   strings.TrimRight(baseURL, "/"),
		secretKey: strings.TrimSpace(secretKey),
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

var _ domain.Storage = (*SupabaseStorage)(nil)

func (s *SupabaseStorage) Upload(ctx context.Context, input domain.UploadInput) error {
	bucket := strings.TrimSpace(input.Bucket)
	if bucket == "" {
		return fmt.Errorf("upload: bucket is required")
	}

	contentType := strings.TrimSpace(input.ContentType)
	if contentType == "" {
		return fmt.Errorf("upload: content type is required")
	}

	if input.SizeBytes <= 0 {
		return fmt.Errorf("upload: size must be greater than zero")
	}

	if input.Body == nil {
		return fmt.Errorf("upload: body is required")
	}

	objectPath := strings.TrimLeft(strings.TrimSpace(input.ObjectPath), "/")
	if objectPath == "" {
		return fmt.Errorf("upload: object path is required")
	}

	url := fmt.Sprintf(
		"%s/storage/v1/object/%s/%s",
		s.baseURL,
		bucket,
		objectPath,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, input.Body)
	if err != nil {
		return fmt.Errorf("create storage upload request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.secretKey)
	req.Header.Set("apikey", s.secretKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "false")
	req.ContentLength = input.SizeBytes

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("upload object to storage: %w", err)
	}

	defer func() {
		_, _ = io.Copy(io.Discard, resp.Body)
		_ = resp.Body.Close()
	}()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		errBody, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return fmt.Errorf("upload object to storage: unexpected status %d: %s", resp.StatusCode, strings.TrimSpace(string(errBody)))
	}

	return nil
}

func (s *SupabaseStorage) Delete(ctx context.Context, input domain.DeleteInput) error {
	bucket := strings.TrimSpace(input.Bucket)
	if bucket == "" {
		return fmt.Errorf("delete: bucket is required")
	}

	objectPath := strings.TrimLeft(strings.TrimSpace(input.ObjectPath), "/")
	if objectPath == "" {
		return fmt.Errorf("delete: object path is required")
	}

	payload, err := json.Marshal(struct {
		Prefixes []string `json:"prefixes"`
	}{
		Prefixes: []string{objectPath},
	})
	if err != nil {
		return fmt.Errorf("marshal storage delete body: %w", err)
	}

	url := fmt.Sprintf(
		"%s/storage/v1/object/%s",
		s.baseURL,
		bucket,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("create storage delete request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.secretKey)
	req.Header.Set("apikey", s.secretKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("delete object from storage: %w", err)
	}

	defer func() {
		_, _ = io.Copy(io.Discard, resp.Body)
		_ = resp.Body.Close()
	}()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		errBody, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return fmt.Errorf("delete object from storage: unexpected status %d: %s", resp.StatusCode, strings.TrimSpace(string(errBody)))
	}

	return nil
}
