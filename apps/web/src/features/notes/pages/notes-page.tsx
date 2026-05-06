import { useTranslation } from "react-i18next"

export default function NotesPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("notes.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("notes.description")}
          </p>
        </div>
      </div>
    </div>
  )
}
