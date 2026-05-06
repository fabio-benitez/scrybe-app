import { useTranslation } from "react-i18next"
import { LanguagesIcon } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { setLanguage } from "@/shared/preferences/preferences"

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language === "en" ? "en" : "es"

  function changeLanguage(language: "es" | "en") {
    setLanguage(language)
    i18n.changeLanguage(language)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <LanguagesIcon className="size-4" />
          <span className="sr-only">{t("app.language.change")}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage("es")}
          className={currentLanguage === "es" ? "font-medium" : ""}
        >
          {t("app.language.spanish")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={currentLanguage === "en" ? "font-medium" : ""}
        >
          {t("app.language.english")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}