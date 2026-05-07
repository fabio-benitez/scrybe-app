import { useParams } from "react-router-dom"

import { NoteEditor } from "@/features/contents/components/note-editor"
import { useContent } from "@/features/contents/hooks/use-contents"

export default function NoteEditorPage() {
  const { contentId = "" } = useParams()
  const isEditMode = Boolean(contentId)

  const contentQuery = useContent(contentId)

  return (
    <NoteEditor
      mode={isEditMode ? "edit" : "create"}
      initialContent={contentQuery.data}
      isLoading={isEditMode && contentQuery.isLoading}
    />
  )
}