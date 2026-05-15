import { useTranslation } from "react-i18next"

import { NotesBrowser } from "@/features/contents/components/notes-browser"
import { useTrashContents } from "@/features/contents/hooks/use-contents"

export default function TrashPage() {
  const { t } = useTranslation()

  const { data: contents, isLoading } = useTrashContents()

  return (
    <NotesBrowser
      title={t("trash.title")}
      description={t("trash.description")}
      contents={contents ?? []}
      isLoading={isLoading}
      mode="trash"
      hideCreateButton
    />
  )
}