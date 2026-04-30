package config

import (
	"os"
	"strconv"
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

func getEnvAsInt64OrDefault(key string, defaultValue int64) int64 {
	value := getEnvOrDefault(key, "")

	if value == "" {
		return defaultValue
	}

	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return defaultValue
	}

	return parsed
}
