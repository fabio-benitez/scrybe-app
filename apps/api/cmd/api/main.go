package main

import (
	"log"

	"github.com/fabio-benitez/scrybe-app/apps/api/internal/bootstrap"
	"github.com/fabio-benitez/scrybe-app/apps/api/internal/config"
)

func main() {
	cfg, err := config.LoadAPIConfig()

	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	if err := bootstrap.RunAPI(cfg); err != nil {
		log.Fatalf("api failed to start: %v", err)
	}
}
