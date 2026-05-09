import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ClockIcon,
  FileTextIcon,
} from "lucide-react"

import { CategoryBadge } from "@/features/categories/components/category-badge"
import type {
  Category,
  CategoryColor,
} from "@/features/categories/types/category"
import { NoteActions } from "@/features/contents/components/note-actions"
import type { Content } from "@/features/contents/types/content"
import { formatUpdatedAt } from "@/features/contents/utils/content-date"
import { extractTextFromTipTap } from "@/features/contents/utils/content-text"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

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

type NoteCardMode = "active" | "trash"

interface NoteCardProps {
  content: Content
  color?: CategoryColor | null
  category?: Category | null
  mode?: NoteCardMode
}

export function NoteCard({
  content,
  color,
  category,
  mode = "active",
}: NoteCardProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const excerpt = extractTextFromTipTap(content.content)
  const iconClass = color
    ? categoryIconClass[color]
    : "bg-muted text-muted-foreground"

  const card = (
    <Card
      size="sm"
      className="flex h-full min-h-40 flex-col bg-muted/30 transition-colors hover:bg-muted/40"
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className={cn("shrink-0 rounded-xl p-2.5", iconClass)}>
                <FileTextIcon className="size-5" />
              </div>

              <div className="min-w-0 space-y-1.5">
                <CardTitle className="line-clamp-2 text-base leading-tight">
                  {content.title}
                </CardTitle>

                {mode === "active" && (
                  <CategoryBadge
                    category={category}
                    fallbackLabel={t("notes.uncategorized")}
                    className="w-fit"
                  />
                )}
              </div>
            </div>

            {excerpt && (
              <p className="ml-1.5 line-clamp-2 text-sm text-muted-foreground">
                {excerpt}
              </p>
            )}
          </div>

          <NoteActions content={content} mode={mode} />
        </div>
      </CardHeader>

      <CardContent className="mt-auto pt-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5" />
          {formatUpdatedAt(content.updated_at, i18n.language, t)}
        </p>
      </CardContent>
    </Card>
  )

  if (mode === "trash") {
    return <div className="block h-full rounded-xl">{card}</div>
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => {
        navigate(`/app/notes/${content.id}`, {
          state: { breadcrumbLabel: content.title },
        })
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate(`/app/notes/${content.id}`, {
            state: { breadcrumbLabel: content.title },
          })
        }
      }}
      className="block h-full cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {card}
    </div>
  )
}