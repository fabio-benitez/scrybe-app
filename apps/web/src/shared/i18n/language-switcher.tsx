import { useTranslation } from "react-i18next"
import { LanguagesIcon } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { getPreferences, setPreferences } from "@/shared/preferences/preferences"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLanguage = i18n.language === "en" ? "en" : "es"

  function changeLanguage(language: "es" | "en") {
    const preferences = getPreferences()
    setPreferences({ ...preferences, language })
    i18n.changeLanguage(language)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <LanguagesIcon className="size-4" />
          <span className="sr-only">Cambiar idioma</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage("es")}
          className={currentLanguage === "es" ? "font-medium" : ""}
        >
          Español
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={currentLanguage === "en" ? "font-medium" : ""}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}