type Language = "es" | "en"

const LANGUAGE_STORAGE_KEY = "scrybe.language"

const DEFAULT_LANGUAGE: Language = "es"

export function getLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)

  if (stored === "es" || stored === "en") {
    return stored
  }

  return DEFAULT_LANGUAGE
}

export function setLanguage(language: Language) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}