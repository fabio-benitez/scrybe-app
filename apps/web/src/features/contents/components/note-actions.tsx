import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  PencilIcon,
  RotateCcwIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

import type { Content } from "@/features/contents/types/content"
import {
  useDeleteContent,
  usePermanentlyDeleteContent,
  useRestoreContent,
} from "@/features/contents/hooks/use-contents"

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
import { cn } from "@/shared/lib/utils"

type NoteActionsMode = "active" | "trash"

interface NoteActionsProps {
  content: Content
  mode?: NoteActionsMode
  className?: string
}

export function NoteActions({
  content,
  mode = "active",
  className,
}: NoteActionsProps) {
  const { t } = useTranslation()
  const deleteContent = useDeleteContent()
  const restoreContent = useRestoreContent()
  const permanentlyDeleteContent = usePermanentlyDeleteContent()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {mode === "active" && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9"
            aria-label={t("notes.detail.favorite")}
            disabled
          >
            <StarIcon
              className={cn(
                "size-4",
                content.is_favorite && "fill-yellow-500 text-yellow-500",
              )}
            />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9"
            aria-label={t("notes.detail.edit")}
            asChild
          >
            <Link
              to={`/app/notes/${content.id}/edit`}
              state={{ breadcrumbLabel: content.title }}
            >
              <PencilIcon className="size-4" />
            </Link>
          </Button>
        </>
      )}

      {mode === "trash" && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          aria-label={t("trash.restore")}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void handleRestore()
          }}
        >
          <RotateCcwIcon className="size-4" />
        </Button>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          aria-label={
            mode === "trash"
              ? t("trash.permanentDelete")
              : t("notes.detail.delete")
          }
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setIsDeleteDialogOpen(true)
          }}
        >
          <Trash2Icon className="size-4" />
        </Button>

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
  )
}