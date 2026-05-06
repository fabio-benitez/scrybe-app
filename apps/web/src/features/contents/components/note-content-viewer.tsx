import type { Content as TiptapContent } from "@tiptap/core"
import { EditorContent, useEditor } from "@tiptap/react"
import { useTranslation } from "react-i18next"

import "./note-content-viewer.scss"

import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

interface NoteContentViewerProps {
  content: unknown
}

type TiptapDocument = {
  content?: TiptapNode[]
}

type TiptapNode = {
  content?: unknown[]
}

function isEmptyTiptapContent(content: unknown) {
  if (!content || typeof content !== "object") {
    return true
  }

  const document = content as TiptapDocument

  if (!Array.isArray(document.content)) {
    return true
  }

  return document.content.every((node) => !node.content?.length)
}

export function NoteContentViewer({ content }: NoteContentViewerProps) {
  const { t } = useTranslation()
  const isEmpty = isEmptyTiptapContent(content)

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    content: content as TiptapContent,
    editorProps: {
      attributes: {
        class: "min-h-64 outline-none",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: true,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
    ],
  })

  if (isEmpty) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("notes.detail.emptyContent")}
      </p>
    )
  }

  return (
    <EditorContent
      editor={editor}
      className="note-content-viewer"
    />
  )
}