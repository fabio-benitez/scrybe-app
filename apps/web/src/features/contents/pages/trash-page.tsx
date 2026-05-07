import { useTranslation } from "react-i18next"

import { NoteCard } from "@/features/contents/components/note-card"
import { useTrashContents } from "@/features/contents/hooks/use-contents"

import {
  Card,
  CardContent,
} from "@/shared/components/ui/card"

export default function TrashPage() {
  const { t } = useTranslation()

  const { data: contents, isLoading } = useTrashContents()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("trash.title")}
        </h1>

        <p className="text-sm text-muted-foreground">
          {t("trash.description")}
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          {t("trash.loading")}
        </p>
      )}

      {!isLoading && contents?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <h2 className="text-lg font-medium">
              {t("trash.empty.title")}
            </h2>

            <p className="text-sm text-muted-foreground">
              {t("trash.empty.description")}
            </p>
          </CardContent>
        </Card>
      )}

      {contents && contents.length > 0 && (
        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {contents.map((content) => (
              <NoteCard key={content.id} content={content} mode="trash" />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}