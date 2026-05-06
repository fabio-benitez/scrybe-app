import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useContents } from "@/features/contents/hooks/use-contents"

import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { PlusIcon } from "lucide-react"

export default function NotesPage() {
  const { t } = useTranslation()

  const { data: contents, isLoading } = useContents()

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contents.map((content) => (
            <Card
              key={content.id}
              className="transition-colors hover:border-primary/40"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-base">
                    {content.title}
                  </CardTitle>

                  <Badge variant="secondary">
                    Draft
                  </Badge>
                </div>

                {content.summary && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {content.summary}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {new Date(content.updated_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}