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
import { ThemeToggle } from "@/shared/theme/theme-toggle"

const routeLabels: Record<string, string> = {
  notes: "app.navigation.notes",
  favorites: "app.navigation.favorites",
  library: "app.navigation.library",
  trash: "app.navigation.trash",
  categories: "app.navigation.categories",
  tags: "app.navigation.tags",
  settings: "app.navigation.settings",
  new: "notes.editor.title",
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const { pathname } = useLocation()
  const { t } = useTranslation()

  const segments = pathname.split("/").filter(Boolean).slice(1)

  const breadcrumbItems = segments.map((segment, index) => {
    const path = `/app/${segments.slice(0, index + 1).join("/")}`

    return {
      path,
      label: routeLabels[segment] ?? segment,
    }
  })

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
              {breadcrumbItems.length === 0 ? (
                <BreadcrumbPage>{t("app.brand.name")}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to="/app">{t("app.brand.name")}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1

              return (
                <div key={item.path} className="flex items-center gap-1.5">
                  <BreadcrumbSeparator />

                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{t(item.label)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.path}>{t(item.label)}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}