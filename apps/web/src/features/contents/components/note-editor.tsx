import { useState, type FormEvent } from "react"
import type { JSONContent } from "@tiptap/core"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { SimpleEditor } from "@/shared/components/tiptap-templates/simple/simple-editor"

import { useCategories } from "@/features/categories/hooks/use-categories"
import { useCreateContent } from "@/features/contents/hooks/use-contents"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const emptyContent: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

export function NoteEditor() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const createContent = useCreateContent()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState<JSONContent>(emptyContent)
  const [categoryId, setCategoryId] = useState("uncategorized")

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      toast.warning(t("notes.editor.validation.titleRequired"))
      return
    }

    try {
      await createContent.mutateAsync({
        title: trimmedTitle,
        content,
        category_id: categoryId === "uncategorized" ? null : categoryId,
        status: "draft",
        visibility: "private",
        is_favorite: false,
      })

      toast.success(t("notes.editor.toast.created"))
      navigate("/app/notes")
    } catch {
      toast.error(t("notes.editor.toast.createError"))
    }
  }

  return (
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
              {t("notes.editor.title")}
            </h1>

            <p className="text-sm text-muted-foreground">
              {t("notes.editor.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/app/notes">
              {t("notes.editor.cancel")}
            </Link>
          </Button>

          <Button type="submit" disabled={createContent.isPending}>
            {createContent.isPending
              ? t("notes.editor.saving")
              : t("notes.editor.save")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-h-128">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3">
              <Input
                className="h-auto border-0 bg-transparent px-2.5 py-2 text-4xl font-semibold leading-tight shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 md:text-4xl"
                placeholder={t("notes.editor.titlePlaceholder")}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="overflow-hidden rounded-xl border bg-muted/10">
              <SimpleEditor
                placeholder={t("notes.editor.contentPlaceholder")}
                content={content}
                onChange={(nextContent) =>
                  setContent(nextContent as JSONContent)
                }
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
            <div className="space-y-2">
              <Label>
                {t("notes.editor.category")}
              </Label>

              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("notes.uncategorized")} />
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  side="bottom"
                  align="start"
                  className="w-(--radix-select-trigger-width)"
                >
                  <SelectItem value="uncategorized" className="text-sm">
                    {t("notes.uncategorized")}
                  </SelectItem>

                  {categories?.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="text-sm"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
