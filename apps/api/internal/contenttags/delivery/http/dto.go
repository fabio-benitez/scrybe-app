package http

import (
	"time"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/contenttags/domain"
)

type TagResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
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

func toTagResponseList(tags []*domain.Tag) []TagResponse {
	result := make([]TagResponse, len(tags))
	for i, t := range tags {
		result[i] = toTagResponse(t)
	}
	return result
}
