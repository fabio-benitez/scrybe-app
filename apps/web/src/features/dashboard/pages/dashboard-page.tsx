import { useTranslation } from "react-i18next"
import {
  FileTextIcon,
  FolderIcon,
  PaperclipIcon,
  PlusIcon,
  TagsIcon,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card"

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.description")}
          </p>
        </div>

        <Button className="w-fit" asChild>
          <Link to="/app/notes/new">
            <PlusIcon className="size-4" />
            {t("dashboard.actions.newNote")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title={t("dashboard.stats.notes.title")}
          value={0}
          description={t("dashboard.stats.notes.description")}
          icon={FileTextIcon}
        />

        <DashboardStatCard
          title={t("dashboard.stats.categories.title")}
          value={0}
          description={t("dashboard.stats.categories.description")}
          icon={FolderIcon}
        />

        <DashboardStatCard
          title={t("dashboard.stats.tags.title")}
          value={0}
          description={t("dashboard.stats.tags.description")}
          icon={TagsIcon}
        />

        <DashboardStatCard
          title={t("dashboard.stats.files.title")}
          value={0}
          description={t("dashboard.stats.files.description")}
          icon={PaperclipIcon}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentNotes.title")}</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.recentNotes.empty")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.topCategories.title")}</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.topCategories.empty")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}