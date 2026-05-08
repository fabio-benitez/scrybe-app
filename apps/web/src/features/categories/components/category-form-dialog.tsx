import { useEffect, useState, type FormEvent } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { CategoryColorPicker } from "@/features/categories/components/category-color-picker"
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/features/categories/hooks/use-categories"
import type {
  Category,
  CategoryColor,
} from "@/features/categories/types/category"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"

interface CategoryFormDialogProps {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
}

export function CategoryFormDialog({
  mode,
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const { t } = useTranslation()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory(category?.id ?? "")

  const isEditMode = mode === "edit"
  const isSaving = createCategory.isPending || updateCategory.isPending

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState<CategoryColor>("gray")

  useEffect(() => {
    if (!open) return

    setName(category?.name ?? "")
    setDescription(category?.description ?? "")
    setColor(category?.color ?? "gray")
  }, [category, open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      toast.warning(t("categories.form.validation.nameRequired"))
      return
    }

    if (trimmedName.length > 80) {
      toast.warning(t("categories.form.validation.nameMax"))
      return
    }

    if (trimmedDescription.length > 500) {
      toast.warning(t("categories.form.validation.descriptionMax"))
      return
    }

    const payload = {
      name: trimmedName,
      description: trimmedDescription,
      color,
    }

    try {
      if (isEditMode && category) {
        await updateCategory.mutateAsync(payload)
        toast.success(t("categories.form.toast.updated"))
      } else {
        await createCategory.mutateAsync(payload)
        toast.success(t("categories.form.toast.created"))
      }

      onOpenChange(false)
    } catch {
      toast.error(
        isEditMode
          ? t("categories.form.toast.updateError")
          : t("categories.form.toast.createError"),
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? t("categories.form.editTitle")
                : t("categories.form.createTitle")}
            </DialogTitle>

            <DialogDescription>
              {isEditMode
                ? t("categories.form.editDescription")
                : t("categories.form.createDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="category-name">
                {t("categories.form.name")}
              </Label>

              <Input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("categories.form.namePlaceholder")}
                maxLength={80}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">
                {t("categories.form.description")}
              </Label>

              <Textarea
                id="category-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("categories.form.descriptionPlaceholder")}
                maxLength={500}
              />
            </div>

            <div className="space-y-3">
              <Label>{t("categories.form.color")}</Label>

              <CategoryColorPicker value={color} onValueChange={setColor} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              {t("categories.form.cancel")}
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? t("categories.form.saving")
                : t("categories.form.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}