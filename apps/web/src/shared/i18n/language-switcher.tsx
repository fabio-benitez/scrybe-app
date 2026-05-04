import { useTranslation } from "react-i18next"

import { Button } from "@/shared/components/ui/button"
import { getPreferences, setPreferences } from "@/shared/preferences/preferences"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLanguage = i18n.language === "en" ? "en" : "es"

  function changeLanguage(language: "es" | "en") {
    const preferences = getPreferences()

    setPreferences({
      ...preferences,
      language,
    })

    i18n.changeLanguage(language)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={currentLanguage === "es" ? "default" : "outline"}
        size="sm"
        onClick={() => changeLanguage("es")}
      >
        ES
      </Button>

      <Button
        type="button"
        variant={currentLanguage === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => changeLanguage("en")}
      >
        EN
      </Button>
    </div>
  )
}