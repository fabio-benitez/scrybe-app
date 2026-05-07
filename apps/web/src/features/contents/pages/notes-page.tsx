import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { TFunction } from "i18next"
import { useTranslation } from "react-i18next"
import {
  ChevronDownIcon,
  ClockIcon,
  FileTextIcon,
  FolderIcon,
  PencilIcon,
  PlusIcon,
  EllipsisIcon,
  Trash2Icon,
} from "lucide-react"

import { useCategories } from "@/features/categories/hooks/use-categories"
import type { CategoryColor } from "@/features/categories/types/category"
import { useContents, useDeleteContent } from "@/features/contents/hooks/use-contents"
import type { Content } from "@/features/contents/types/content"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

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

const categoryIconClass: Record<CategoryColor, string> = {
  gray: "bg-slate-500/15 text-slate-400",
  red: "bg-red-500/15 text-red-400",
  orange: "bg-orange-500/15 text-orange-400",
  yellow: "bg-yellow-500/15 text-yellow-400",
  green: "bg-green-500/15 text-green-400",
  blue: "bg-blue-500/15 text-blue-400",
  purple: "bg-purple-500/15 text-purple-400",
  pink: "bg-pink-500/15 text-pink-400",
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

function extractTextFromTipTap(content: unknown): string {
  if (!content || typeof content !== "object") return ""

  const node = content as {
    text?: string
    content?: unknown[]
  }

  const ownText = typeof node.text === "string" ? node.text : ""
  const childrenText = Array.isArray(node.content)
    ? node.content.map(extractTextFromTipTap).join(" ")
    : ""

  return `${ownText} ${childrenText}`.trim()
}


function NoteCard({ content, color }: { content: Content; color?: CategoryColor | null }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const excerpt = extractTextFromTipTap(content.content)
  const iconClass = color ? categoryIconClass[color] : "bg-muted text-muted-foreground"
  const deleteContent = useDeleteContent()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  async function handleDelete() {
    try {
      await deleteContent.mutateAsync(content.id)
      setIsDeleteDialogOpen(false)
      toast.success(t("notes.detail.toast.deleted"))
    } catch {
      toast.error(t("notes.detail.toast.deleteError"))
    }
  }

  return (
      <Link
        to={`/app/notes/${content.id}`}
        state={{ breadcrumbLabel: content.title }}
        className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
      <Card
        size="sm"
        className="flex h-full min-h-40 flex-col bg-muted/30 transition-colors hover:bg-muted/40"
      >
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={cn("shrink-0 rounded-xl p-2.5", iconClass)}>
                  <FileTextIcon className="size-5" />
                </div>

                <CardTitle className="line-clamp-2 text-base leading-tight">
                  {content.title}
                </CardTitle>
              </div>

              {excerpt && (
                <p className="ml-1.5 line-clamp-2 text-sm text-muted-foreground">
                  {excerpt}
                </p>
              )}
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-muted-foreground"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                  >
                    <EllipsisIcon className="size-4.5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      navigate(`/app/notes/${content.id}/edit`, {
                        state: { breadcrumbLabel: content.title },
                      })
                    }}
                  >
                    <PencilIcon className="size-4" />
                    {t("notes.detail.edit")}
                  </DropdownMenuItem>


                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2Icon className="size-4" />
                    {t("notes.detail.delete")}
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("notes.detail.deleteDialog.title")}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {t("notes.detail.deleteDialog.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("notes.detail.deleteDialog.cancel")}
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      void handleDelete()
                    }}
                  >
                    {t("notes.detail.deleteDialog.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>

        <CardContent className="mt-auto pt-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" />
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
            <NoteCard key={content.id} content={content} color={color} />
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
