import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { PanelLeftIcon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { useSidebar } from "@/shared/components/ui/sidebar"
import { LanguageSwitcher } from "@/shared/i18n/language-switcher"

const routeLabels: Record<string, string> = {
  notes: "app.navigation.notes",
  favorites: "app.navigation.favorites",
  library: "app.navigation.library",
  trash: "app.navigation.trash",
  categories: "app.navigation.categories",
  tags: "app.navigation.tags",
  settings: "app.navigation.settings",
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const { pathname } = useLocation()
  const { t } = useTranslation()

  const segments = pathname.split("/").filter(Boolean).slice(1)
  const currentSegment = segments.at(-1)

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeftIcon />
        </Button>

        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/app">{t("app.brand.name")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {currentSegment && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {t(routeLabels[currentSegment] ?? currentSegment)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}