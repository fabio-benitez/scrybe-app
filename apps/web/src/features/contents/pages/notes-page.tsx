import { Link } from "react-router-dom"
import type { TFunction } from "i18next"
import { useTranslation } from "react-i18next"
import {
  ChevronDownIcon,
  FolderIcon,
  PlusIcon,
} from "lucide-react"

import { useCategories } from "@/features/categories/hooks/use-categories"
import type { CategoryColor } from "@/features/categories/types/category"
import { useContents } from "@/features/contents/hooks/use-contents"
import type { Content } from "@/features/contents/types/content"

import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import { cn } from "@/shared/lib/utils"

const categoryColorClass: Record<CategoryColor, string> = {
  gray: "text-slate-500",
  red: "text-red-500",
  orange: "text-orange-500",
  yellow: "text-yellow-500",
  green: "text-green-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
}

function getFolderColorClass(
  color?: CategoryColor | null,
  isUncategorized = false,
) {
  if (isUncategorized) {
    return "text-sky-500"
  }

  return color ? categoryColorClass[color] : "text-muted-foreground"
}

function formatUpdatedAt(
  value: string,
  locale: string,
  t: TFunction,
) {
  const updatedAt = new Date(value)
  const elapsedMs = Date.now() - updatedAt.getTime()
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (elapsedMs < minuteMs) {
    return t("notes.updatedAt.justNow")
  }

  if (elapsedMs > 7 * dayMs) {
    return t("notes.updatedAt.date", {
      date: new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }).format(updatedAt),
    })
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" })
  let relativeTime: string

  if (elapsedMs < hourMs) {
    relativeTime = rtf.format(-Math.floor(elapsedMs / minuteMs), "minute")
  } else if (elapsedMs < dayMs) {
    relativeTime = rtf.format(-Math.floor(elapsedMs / hourMs), "hour")
  } else {
    relativeTime = rtf.format(-Math.floor(elapsedMs / dayMs), "day")
  }

  return t("notes.updatedAt.relative", { time: relativeTime })
}

function NoteCard({ content }: { content: Content }) {
  const { t, i18n } = useTranslation()

  return (
    <Link
      to={`/app/notes/${content.id}`}
      className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        size="sm"
        className="h-full bg-muted/30 transition-colors hover:bg-muted/40"
      >
        <CardHeader className="max-w-xs space-y-2 pb-0">
          <CardTitle className="line-clamp-2 text-base">
            {content.title}
          </CardTitle>

          {content.summary && (
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {content.summary}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            {formatUpdatedAt(content.updated_at, i18n.language, t)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

interface NoteGroupProps {
  title: string
  count: number
  contents: Content[]
  color?: CategoryColor | null
  isLast?: boolean
  isUncategorized?: boolean
}

function NoteGroup({
  title,
  count,
  contents,
  color,
  isLast,
  isUncategorized,
}: NoteGroupProps) {
  const { t } = useTranslation()

  return (
    <Collapsible
      defaultOpen
      className={cn(!isLast && "border-b")}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-4 pb-3 pt-5 text-left [&[data-state=open]_.notes-group-chevron]:rotate-180"
        >
          <div className="flex min-w-0 items-center gap-2">
            <FolderIcon
              className={cn(
                "size-4 shrink-0",
                getFolderColorClass(color, isUncategorized),
              )}
            />

            <h2 className="truncate text-sm font-semibold">
              {title}
            </h2>

            <span
              aria-hidden="true"
              className="h-4 w-px shrink-0 bg-border"
            />

            <span className="shrink-0 text-sm text-muted-foreground">
              {t("notes.group.count", { count })}
            </span>
          </div>

          <ChevronDownIcon className="notes-group-chevron size-4 shrink-0 text-muted-foreground transition-transform" />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="grid gap-3 px-4 pb-5 pt-1 md:grid-cols-2 xl:grid-cols-4">
          {contents.map((content) => (
            <NoteCard key={content.id} content={content} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function NotesPage() {
  const { t } = useTranslation()

  const { data: contents, isLoading } = useContents()
  const { data: categories } = useCategories()

  const uncategorizedContents =
    contents?.filter((content) => !content.category_id) ?? []

  const categorizedContents =
    categories
      ?.map((category) => ({
        category,
        contents:
          contents?.filter(
            (content) => content.category_id === category.id,
          ) ?? [],
      }))
      .filter((group) => group.contents.length > 0) ?? []

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("notes.title")}
          </h1>

          <p className="text-sm text-muted-foreground">
            {t("notes.description")}
          </p>
        </div>

        <Button asChild>
          <Link to="/app/notes/new">
            <PlusIcon className="size-4" />
            {t("notes.new")}
          </Link>
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          {t("notes.loading")}
        </p>
      )}

      {!isLoading && contents?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <h2 className="text-lg font-medium">
              {t("notes.empty.title")}
            </h2>

            <p className="text-sm text-muted-foreground">
              {t("notes.empty.description")}
            </p>
          </CardContent>
        </Card>
      )}

      {contents && contents.length > 0 && (
        <Card className="gap-0 overflow-hidden py-0">
          {categorizedContents.map((group, index) => {
            const hasUncategorized = uncategorizedContents.length > 0
            const isLast =
              !hasUncategorized &&
              index === categorizedContents.length - 1

            return (
              <NoteGroup
                key={group.category.id}
                title={group.category.name}
                count={group.contents.length}
                contents={group.contents}
                color={group.category.color}
                isLast={isLast}
              />
            )
          })}

          {uncategorizedContents.length > 0 && (
            <NoteGroup
              title={t("notes.uncategorized")}
              count={uncategorizedContents.length}
              contents={uncategorizedContents}
              isLast
              isUncategorized
            />
          )}
        </Card>
      )}
    </div>
  )
}
