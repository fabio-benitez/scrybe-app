import { useEffect, useRef, useState, type SyntheticEvent } from "react"
import type { JSONContent } from "@tiptap/core"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeftIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { SimpleEditor } from "@/shared/components/tiptap-templates/simple/simple-editor"

import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { replaceContentFiles } from "@/features/contents/services/content-service"
import { extractFileIdsFromContent } from "@/features/contents/utils/content-files"
import { CategoryCombobox } from "@/features/categories/components/category-combobox"

import {
  useCreateContent,
  useUpdateContent,
} from "@/features/contents/hooks/use-contents"
import type { Content } from "@/features/contents/types/content"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"


const emptyContent: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

interface NoteEditorProps {
  mode?: "create" | "edit"
  initialContent?: Content
  isLoading?: boolean
}

export function NoteEditor({
  mode = "create",
  initialContent,
  isLoading = false,
}: NoteEditorProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: categories, isLoading: isCategoriesLoading } = useCategories()
  const createContent = useCreateContent()
  const updateContent = useUpdateContent(initialContent?.id ?? "")

  const isEditMode = mode === "edit"
  const isSaving = createContent.isPending || updateContent.isPending

  const [title, setTitle] = useState("")
  const [content, setContent] = useState<JSONContent>(emptyContent)
  const [categoryId, setCategoryId] = useState("uncategorized")
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false)
  const [hasHydratedInitialContent, setHasHydratedInitialContent] = useState(!isEditMode)

  const contentRef = useRef<JSONContent>(emptyContent)

  useEffect(() => {
    if (!isEditMode) return
    if (!initialContent) return

    const nextContent = initialContent.content as JSONContent

    setTitle(initialContent.title)
    setContent(nextContent)
    contentRef.current = nextContent
    setCategoryId(initialContent.category_id ?? "uncategorized")
    setHasHydratedInitialContent(true)
  }, [initialContent, isEditMode])

  async function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      toast.warning(t("notes.editor.validation.titleRequired"))
      return
    }

    const payload = {
      title: trimmedTitle,
      content: contentRef.current,
      category_id: categoryId === "uncategorized" ? null : categoryId,
    }

    const fileIds = extractFileIdsFromContent(contentRef.current)

    try {
      if (isEditMode && initialContent) {
        await updateContent.mutateAsync(payload)
        await replaceContentFiles(initialContent.id, fileIds)

        toast.success(t("notes.editor.toast.updated"))
        navigate(`/app/notes/${initialContent.id}`)
        return
      }

      const createdContent = await createContent.mutateAsync({
        ...payload,
        status: "draft",
        visibility: "private",
        is_favorite: false,
      })

      await replaceContentFiles(createdContent.id, fileIds)

      toast.success(t("notes.editor.toast.created"))
      navigate("/app/notes")
    } catch {
      toast.error(
        isEditMode
          ? t("notes.editor.toast.updateError")
          : t("notes.editor.toast.createError"),
      )
    }
  }

  if (isLoading || !hasHydratedInitialContent || (isEditMode && isCategoriesLoading)) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          {t("notes.editor.loading")}
        </p>
      </div>
    )
  }

  return (
    <>
      <form
        className="flex flex-1 flex-col gap-6 p-4 md:p-6"
        onSubmit={handleSave}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="-ml-3" asChild>
              <Link to="/app/notes">
                <ArrowLeftIcon className="size-4" />
                {t("notes.editor.back")}
              </Link>
            </Button>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {isEditMode ? t("notes.editor.editTitle") : t("notes.editor.title")}
              </h1>

              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? t("notes.editor.editDescription")
                  : t("notes.editor.description")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to={isEditMode && initialContent ? `/app/notes/${initialContent.id}` : "/app/notes"}>
                {t("notes.editor.cancel")}
              </Link>
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? t("notes.editor.saving") : t("notes.editor.save")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="min-h-128">
            <CardContent className="space-y-6 p-6">
              <Input
                className="h-auto border-0 bg-transparent px-2.5 py-2 text-4xl font-semibold leading-tight shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 md:text-4xl"
                placeholder={t("notes.editor.titlePlaceholder")}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <div className="overflow-hidden rounded-xl border bg-muted/10">
                <SimpleEditor
                  key={initialContent?.id ?? "new-note"}
                  placeholder={t("notes.editor.contentPlaceholder")}
                  content={content}
                  onChange={(nextContent) => {
                    const jsonContent = nextContent as JSONContent

                    setContent(jsonContent)
                    contentRef.current = jsonContent
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">
                {t("notes.editor.properties")}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>{t("notes.editor.category")}</Label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setIsCreateCategoryDialogOpen(true)}
                  >
                    <PlusIcon className="size-3.5" />
                    {t("categories.new")}
                  </Button>
                </div>

                <CategoryCombobox
                  value={categoryId}
                  onValueChange={setCategoryId}
                  categories={categories ?? []}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <CategoryFormDialog
        mode="create"
        open={isCreateCategoryDialogOpen}
        onOpenChange={setIsCreateCategoryDialogOpen}
        onSuccess={(category) => {
          setCategoryId(category.id)
        }}
      />
    </>
  )
}