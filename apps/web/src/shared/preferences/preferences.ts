export type Language = "es" | "en"
export type NotesViewMode = "list" | "grid"

interface Preferences {
  language: Language
  notesView: NotesViewMode
}

const STORAGE_KEY = "scrybe.preferences"

const DEFAULT_PREFERENCES: Preferences = {
  language: "es",
  notesView: "list",
}

function getPreferences(): Preferences {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return DEFAULT_PREFERENCES
  }

  try {
    const parsed = JSON.parse(stored) as Partial<Preferences>

    return {
      language:
        parsed.language === "en" ? "en" : DEFAULT_PREFERENCES.language,

      notesView:
        parsed.notesView === "grid"
          ? "grid"
          : DEFAULT_PREFERENCES.notesView,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function savePreferences(preferences: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}

export function getLanguage(): Language {
  return getPreferences().language
}

export function setLanguage(language: Language) {
  const preferences = getPreferences()

  savePreferences({
    ...preferences,
    language,
  })
}

export function getNotesView(): NotesViewMode {
  return getPreferences().notesView
}

export function setNotesView(notesView: NotesViewMode) {
  const preferences = getPreferences()

  savePreferences({
    ...preferences,
    notesView,
  })
}