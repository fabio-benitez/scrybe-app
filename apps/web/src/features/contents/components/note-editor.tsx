import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeftIcon } from "lucide-react"

import { SimpleEditor } from "@/shared/components/tiptap-templates/simple/simple-editor"

import { useCategories } from "@/features/categories/hooks/use-categories"

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

export function NoteEditor() {
  const { t } = useTranslation()
  const { data: categories } = useCategories()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
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

          <Button disabled>
            {t("notes.editor.save")}
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
                />
            </div>

            <div className="overflow-hidden rounded-xl border bg-muted/10">
              <SimpleEditor placeholder={t("notes.editor.contentPlaceholder")} />
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

              <Select>
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
    </div>
  )
}