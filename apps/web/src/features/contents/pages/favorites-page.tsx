import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { NotesBrowser } from "@/features/contents/components/notes-browser"
import { useContents } from "@/features/contents/hooks/use-contents"

export default function FavoritesPage() {
  const { t } = useTranslation()
  const { data: contents, isLoading } = useContents()

  const favoriteContents = useMemo(() => {
    return (contents ?? []).filter(
      (content) => content.is_favorite,
    )
  }, [contents])

  return (
    <NotesBrowser
      title={t("favorites.title")}
      description={t("favorites.description")}
      contents={favoriteContents}
      isLoading={isLoading}
    />
  )
}