import { Link, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowLeftIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
  FolderIcon,
} from "lucide-react"

import { toast } from "sonner"

import { NoteContentViewer } from "@/features/contents/components/note-content-viewer"
import { useCategories } from "@/features/categories/hooks/use-categories"
import {
  useContent,
  useDeleteContent,
} from "@/features/contents/hooks/use-contents"

import { categoryColorStyles } from "@/features/categories/utils/category-colors"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/lib/utils"

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function NoteDetailPage() {
  const { contentId = "" } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { data: content, isError, isLoading } = useContent(contentId)
  const { data: categories } = useCategories()
  const deleteContent = useDeleteContent()

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          {t("notes.detail.loading")}
        </p>
      </div>
    )
  }

  if (!content || isError) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <Button variant="ghost" size="sm" className="-ml-3 w-fit" asChild>
          <Link to="/app/notes">
            <ArrowLeftIcon className="size-4" />
            {t("notes.detail.back")}
          </Link>
        </Button>

        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t("notes.detail.notFound")}
          </CardContent>
        </Card>
      </div>
    )
  }

  const category = categories?.find(
    (category) => category.id === content.category_id,
  )
  const categoryName =
    category?.name ?? t("notes.detail.uncategorized")

  const contentIdToDelete = content.id

  async function handleDelete() {
    try {
      await deleteContent.mutateAsync(contentIdToDelete)

      toast.success(t("notes.detail.toast.deleted"))
      navigate("/app/notes")
    } catch {
      toast.error(t("notes.detail.toast.deleteError"))
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-3" asChild>
          <Link to="/app/notes">
            <ArrowLeftIcon className="size-4" />
            {t("notes.detail.back")}
          </Link>
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_18rem]">
          <main className="min-h-128 p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 space-y-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {content.title}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {content.category_id && category && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "flex items-center gap-1.5 border",
                          categoryColorStyles[category.color ?? "gray"].badge,
                        )}
                      >
                        <FolderIcon
                          className={cn(
                            "size-3.5",
                            categoryColorStyles[category.color ?? "gray"].icon,
                          )}
                        />
                        {categoryName}
                      </Badge>
                    )}
                    <span>
                      {t("notes.detail.updatedAt")}:{" "}
                      {formatDate(content.updated_at, i18n.language)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("notes.detail.favorite")}
                  disabled
                >
                  <StarIcon className="size-4" />
                </Button>

                <Button type="button" variant="outline" asChild>
                  <Link to={`/app/notes/${content.id}/edit`}>
                    <PencilIcon className="size-4" />
                    {t("notes.detail.edit")}
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2Icon className="size-4" />
                      {t("notes.detail.delete")}
                    </Button>
                  </AlertDialogTrigger>

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

                      <AlertDialogAction onClick={handleDelete}>
                        {t("notes.detail.deleteDialog.confirm")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <NoteContentViewer key={content.id} content={content.content} />
          </main>

          <aside className="space-y-5 border-t p-6 xl:border-l xl:border-t-0">
            <h2 className="text-base font-semibold">
              {t("notes.detail.information")}
            </h2>

            <div className="space-y-5 text-sm">
              <section className="space-y-2">
                <h3 className="font-medium">
                  {t("notes.detail.category")}
                </h3>
                <p className="text-muted-foreground">{categoryName}</p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="font-medium">
                  {t("notes.detail.tags")}
                </h3>
                <p className="text-muted-foreground">
                  {t("notes.detail.noTags")}
                </p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="font-medium">
                  {t("notes.detail.status")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {t(`notes.status.${content.status}`)}
                  </Badge>
                  <Badge variant="outline">
                    {t(`notes.visibility.${content.visibility}`)}
                  </Badge>
                </div>
              </section>

              <Separator />

              <section className="space-y-3">
                <h3 className="font-medium">
                  {t("notes.detail.dates")}
                </h3>

                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    {t("notes.detail.createdAt")}
                  </p>
                  <p>{formatDate(content.created_at, i18n.language)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    {t("notes.detail.updatedAt")}
                  </p>
                  <p>{formatDate(content.updated_at, i18n.language)}</p>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  )
}
