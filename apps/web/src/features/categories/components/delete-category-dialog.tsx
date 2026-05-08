import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { useDeleteCategory } from "@/features/categories/hooks/use-categories"
import type { Category } from "@/features/categories/types/category"

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

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  notesCount: number
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  notesCount,
}: DeleteCategoryDialogProps) {
  const { t } = useTranslation()
  const deleteCategory = useDeleteCategory()

  async function handleDelete() {
    if (!category) return

    try {
      await deleteCategory.mutateAsync(category.id)

      toast.success(t("categories.deleteDialog.toast.deleted"))
      onOpenChange(false)
    } catch {
      toast.error(t("categories.deleteDialog.toast.deleteError"))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("categories.deleteDialog.title")}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {notesCount > 0
              ? t("categories.deleteDialog.descriptionWithNotes", {
                  count: notesCount,
                })
              : t("categories.deleteDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            {t("categories.deleteDialog.cancel")}
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            disabled={deleteCategory.isPending}
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
          >
            {deleteCategory.isPending
              ? t("categories.deleteDialog.deleting")
              : t("categories.deleteDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}