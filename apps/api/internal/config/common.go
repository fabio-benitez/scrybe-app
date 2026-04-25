package config

import (
	"os"
	"strings"
)

func getEnvOrDefault(key, defaultValue string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsSlice(key string) []string {
	value := getEnvOrDefault(key, "")

	if value == "" {
		return []string{}
	}

	parts := strings.Split(value, ",")

	for i := range parts {
		parts[i] = strings.TrimSpace(parts[i])
	}

	return parts
}
