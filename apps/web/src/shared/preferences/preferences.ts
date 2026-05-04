type Preferences = {
  language: "es" | "en"
  theme: "dark" | "light"
}

const STORAGE_KEY = "scrybe.preferences"

const DEFAULT_PREFERENCES: Preferences = {
  language: "es",
  theme: "dark",
}

export function getPreferences(): Preferences {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) return DEFAULT_PREFERENCES

  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function setPreferences(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function getLanguage(): Preferences["language"] {
  return getPreferences().language
}

export function setLanguage(language: Preferences["language"]) {
  const prefs = getPreferences()
  setPreferences({ ...prefs, language })
}