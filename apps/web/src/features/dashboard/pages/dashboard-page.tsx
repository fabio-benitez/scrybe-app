import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRightIcon,
  FileTextIcon,
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
} from "lucide-react"

import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { categoryColorStyles } from "@/features/categories/utils/category-colors"
import { useContents } from "@/features/contents/hooks/use-contents"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatRelativeDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/utils"
import { featureColors } from "@/shared/lib/feature-colors"

const weekMs = 7 * 24 * 60 * 60 * 1000
const DASHBOARD_ITEMS_LIMIT = 5

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const contentsQuery = useContents()
  const categoriesQuery = useCategories()

  const contents = contentsQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  const isLoading = contentsQuery.isLoading || categoriesQuery.isLoading
  const weekAgo = Date.now() - weekMs

  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  )

  const favoriteNotes = contents
    .filter((content) => content.is_favorite)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, DASHBOARD_ITEMS_LIMIT)

  const recentNotes = [...contents]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, DASHBOARD_ITEMS_LIMIT)

  const notesThisWeek = contents.filter(
    (content) => new Date(content.updated_at).getTime() >= weekAgo,
  ).length

  const categoriesThisWeek = categories.filter(
    (category) => new Date(category.updated_at).getTime() >= weekAgo,
  ).length

  const categoryStats = categories
    .map((category) => ({
      category,
      count: contents.filter((content) => content.category_id === category.id)
        .length,
    }))
    .filter((item) => item.count > 0)

  const uncategorizedCount = contents.filter(
    (content) => !content.category_id,
  ).length

  const topCategories = [
    ...categoryStats,
    ...(uncategorizedCount > 0
      ? [
        {
          category: null,
          count: uncategorizedCount,
        },
      ]
      : []),
  ]
    .sort((a, b) => b.count - a.count)
    .slice(0, DASHBOARD_ITEMS_LIMIT)

  function renderCompactNote(note: (typeof contents)[number]) {
    const category = note.category_id ? categoriesById.get(note.category_id) : null
    const color = category?.color ?? "gray"

    return (
      <Link
        key={note.id}
        to={`/app/notes/${note.id}`}
        state={{ breadcrumbLabel: note.title }}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
      >
        <div className="flex min-w-0 items-center gap-2">
          <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />

          <span className="truncate text-sm font-medium">
            {note.title}
          </span>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 px-1.5 py-0 text-[11px]",
              category
                ? categoryColorStyles[color].badge
                : "border-muted-foreground/20 bg-muted text-muted-foreground",
            )}
          >
            {category?.name ?? t("dashboard.uncategorized")}
          </Badge>
        </div>

        <span className="shrink-0 text-xs text-muted-foreground">
          {formatRelativeDate(note.updated_at, i18n.language, t)}
        </span>
      </Link>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.description")}
          </p>
        </div>

        <Button className="w-fit" asChild>
          <Link to="/app/notes/new">
            <PlusIcon className="size-4" />
            {t("dashboard.actions.newNote")}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: DASHBOARD_ITEMS_LIMIT }).map((_, index) => (
            <Skeleton key={index} className="h-34 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard
            title={t("dashboard.stats.notes.title")}
            value={contents.length}
            trend={notesThisWeek}
            description={t("dashboard.stats.notes.description", {
              count: notesThisWeek,
            })}
            icon={FileTextIcon}
            to="/app/notes"
            iconWrapperClassName={featureColors.notes.iconWrapper}
            iconClassName={featureColors.notes.icon}
          />

          <DashboardStatCard
            title={t("dashboard.stats.categories.title")}
            value={categories.length}
            trend={categoriesThisWeek}
            description={t("dashboard.stats.categories.description", {
              count: categoriesThisWeek,
            })}
            icon={FolderIcon}
            to="/app/categories"
            iconWrapperClassName={featureColors.categories.iconWrapper}
            iconClassName={featureColors.categories.icon}
          />

          <DashboardStatCard
            title={t("dashboard.stats.favorites.title")}
            value={contents.filter((content) => content.is_favorite).length}
            description={t("dashboard.stats.favorites.description")}
            icon={StarIcon}
            to="/app/notes"
            iconWrapperClassName={featureColors.favorites.iconWrapper}
            iconClassName={featureColors.favorites.icon}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="flex min-h-72 flex-col">
          <CardHeader className="pb-3">
            <CardTitle>{t("dashboard.quickActions.title")}</CardTitle>
          </CardHeader>

          <CardContent className="grid flex-1 gap-3 pb-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl p-4"
              asChild
            >
              <Link to="/app/notes/new">
                <span className={`flex size-9 items-center justify-center rounded-lg ${featureColors.notes.iconWrapper} ${featureColors.notes.icon}`}>
                  <PlusIcon className="size-4" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block font-medium">
                    {t("dashboard.actions.newNote")}
                  </span>
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl p-4"
              asChild
            >
              <Link to="/app/notes">
                <span className={`flex size-9 items-center justify-center rounded-lg ${featureColors.notes.iconWrapper} ${featureColors.notes.icon}`}>
                  <FileTextIcon className="size-4" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block font-medium">
                    {t("dashboard.actions.viewNotes")}
                  </span>
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl p-4"
              asChild
            >
              <Link to="/app/categories">
                <span className={`flex size-9 items-center justify-center rounded-lg ${featureColors.categories.iconWrapper} ${featureColors.categories.icon}`}>
                  <FolderIcon className="size-4" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block font-medium">
                    {t("dashboard.actions.manageCategories")}
                  </span>
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl p-4"
              asChild
            >
              <Link to="/app/settings">
                <span className={`flex size-9 items-center justify-center rounded-lg ${featureColors.settings.iconWrapper} ${featureColors.settings.icon}`}>
                  <SettingsIcon className="size-4" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block font-medium">
                    {t("dashboard.actions.settings")}
                  </span>
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex min-h-72 flex-col">
          <CardHeader className="pb-3">
            <CardTitle>{t("dashboard.favoriteNotes.title")}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 pb-3">
            {isLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 rounded-lg" />
                ))}
              </div>
            ) : favoriteNotes.length > 0 ? (
              <div className="space-y-1">
                {favoriteNotes.map(renderCompactNote)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.favoriteNotes.empty")}
              </p>
            )}
          </CardContent>

          <CardFooter className="border-t p-1.25">
            <Link
              to="/app/notes"
              className="flex h-9 w-full items-center gap-2 px-5 text-sm font-medium transition-colors hover:bg-muted/40"
            >
              {t("dashboard.actions.viewAllFavorites")}
              <ArrowRightIcon className="size-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex min-h-72 flex-col">
          <CardHeader className="pb-3">
            <CardTitle>{t("dashboard.recentNotes.title")}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 pb-3">
            {isLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 rounded-lg" />
                ))}
              </div>
            ) : recentNotes.length > 0 ? (
              <div className="space-y-1">
                {recentNotes.map(renderCompactNote)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.recentNotes.empty")}
              </p>
            )}
          </CardContent>

          <CardFooter className="border-t p-1.25">
            <Link
              to="/app/notes"
              className="flex h-9 w-full items-center gap-2 px-5 text-sm font-medium transition-colors hover:bg-muted/40"
            >
              {t("dashboard.actions.viewAllNotes")}
              <ArrowRightIcon className="size-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex min-h-72 flex-col">
          <CardHeader className="pb-3">
            <CardTitle>{t("dashboard.topCategories.title")}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 pb-3">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 rounded-lg" />
                ))}
              </div>
            ) : topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map((item) => {
                  const category = item.category
                  const color = category?.color ?? "gray"
                  const percentage =
                    contents.length > 0
                      ? Math.round((item.count / contents.length) * 100)
                      : 0

                  return (
                    <div
                      key={category?.id ?? "uncategorized"}
                      className="grid min-h-6 grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FolderIcon
                          className={cn(
                            "size-4 shrink-0",
                            category
                              ? categoryColorStyles[color].icon
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="truncate text-sm font-medium">
                          {category?.name ?? t("dashboard.uncategorized")}
                        </span>
                      </div>

                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            category
                              ? categoryColorStyles[color].bar
                              : "bg-muted-foreground",
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <span className="text-sm text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.topCategories.empty")}
              </p>
            )}
          </CardContent>

          <CardFooter className="border-t p-1.25">
            <Link
              to="/app/categories"
              className="flex h-9 w-full items-center gap-2 px-5 text-sm font-medium transition-colors hover:bg-muted/40"
            >
              {t("dashboard.actions.viewAllCategories")}
              <ArrowRightIcon className="size-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}