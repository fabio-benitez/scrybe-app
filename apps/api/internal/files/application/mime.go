package application

import "strings"

func normalizeMIME(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))

	mediaType, _, found := strings.Cut(value, ";")
	if found {
		return strings.TrimSpace(mediaType)
	}

	return value
}

func containsMIME(allowed []string, mimeType string) bool {
	for _, allowedMIME := range allowed {
		if allowedMIME == mimeType {
			return true
		}
	}

	return false
}

func isKnownMIMEDetectionMismatch(declaredMIME string, detectedMIME string) bool {
	return declaredMIME == "text/markdown" && detectedMIME == "text/plain"
}
