import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  ClockIcon,
  EllipsisIcon,
  FileTextIcon,
  PencilIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react"

import type { CategoryColor } from "@/features/categories/types/category"
import {
  useDeleteContent,
  usePermanentlyDeleteContent,
  useRestoreContent,
} from "@/features/contents/hooks/use-contents"
import type { Content } from "@/features/contents/types/content"
import { formatUpdatedAt } from "@/features/contents/utils/content-date"
import { extractTextFromTipTap } from "@/features/contents/utils/content-text"

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
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
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
  mode?: NoteCardMode
}

export function NoteCard({
  content,
  color,
  mode = "active",
}: NoteCardProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const deleteContent = useDeleteContent()
  const restoreContent = useRestoreContent()
  const permanentlyDeleteContent = usePermanentlyDeleteContent()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const excerpt = extractTextFromTipTap(content.content)
  const iconClass = color
    ? categoryIconClass[color]
    : "bg-muted text-muted-foreground"

  async function handleRestore() {
    try {
      await restoreContent.mutateAsync(content.id)
      toast.success(t("trash.toast.restored"))
    } catch {
      toast.error(t("trash.toast.restoreError"))
    }
  }

  async function handleDelete() {
    try {
      if (mode === "trash") {
        await permanentlyDeleteContent.mutateAsync(content.id)
        toast.success(t("trash.toast.permanentlyDeleted"))
      } else {
        await deleteContent.mutateAsync(content.id)
        toast.success(t("notes.detail.toast.deleted"))
      }

      setIsDeleteDialogOpen(false)
    } catch {
      toast.error(
        mode === "trash"
          ? t("trash.toast.permanentDeleteError")
          : t("notes.detail.toast.deleteError"),
      )
    }
  }

  const card = (
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

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
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

              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className={mode === "trash" ? "w-52" : "w-38"}
              >
                {mode === "active" && (
                  <>
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
                  </>
                )}

                {mode === "trash" && (
                  <>
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        void handleRestore()
                      }}
                    >
                      <RotateCcwIcon className="size-4" />
                      {t("trash.restore")}
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
                      {t("trash.permanentDelete")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {mode === "trash"
                    ? t("trash.permanentDeleteDialog.title")
                    : t("notes.detail.deleteDialog.title")}
                </AlertDialogTitle>

                <AlertDialogDescription>
                  {mode === "trash"
                    ? t("trash.permanentDeleteDialog.description")
                    : t("notes.detail.deleteDialog.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("notes.detail.deleteDialog.cancel")}
                </AlertDialogCancel>

                <AlertDialogAction
                  variant="destructive"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    void handleDelete()
                  }}
                >
                  {mode === "trash"
                    ? t("trash.permanentDeleteDialog.confirm")
                    : t("notes.detail.deleteDialog.confirm")}
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
  )

  if (mode === "trash") {
    return (
      <div className="block h-full rounded-xl">
        {card}
      </div>
    )
  }

  return (
    <Link
      to={`/app/notes/${content.id}`}
      state={{ breadcrumbLabel: content.title }}
      className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {card}
    </Link>
  )
}