import { LanguagesIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"

import { setLanguage } from "@/shared/preferences/preferences"

export function PreferencesSettings() {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const isDark = theme === "dark"
  const currentLanguage = i18n.language === "en" ? "en" : "es"

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  function toggleLanguage() {
    const nextLanguage = currentLanguage === "es" ? "en" : "es"

    setLanguage(nextLanguage)
    i18n.changeLanguage(nextLanguage)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center justify-between rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {t("profileSettings.preferences.theme.title")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("profileSettings.preferences.theme.description")}
          </p>
        </div>

        {isDark ? (
          <SunIcon className="size-5 text-muted-foreground" />
        ) : (
          <MoonIcon className="size-5 text-muted-foreground" />
        )}
      </button>

      <button
        type="button"
        onClick={toggleLanguage}
        className="flex items-center justify-between rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {t("profileSettings.preferences.language.title")}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentLanguage === "es"
              ? t("app.language.spanish")
              : t("app.language.english")}
          </p>
        </div>

        <LanguagesIcon className="size-5 text-muted-foreground" />
      </button>
    </div>
  )
}