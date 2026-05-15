import type { ReactNodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"

export function ResizableImageNode({
  node,
  updateAttributes,
}: ReactNodeViewProps) {
  return (
    <NodeViewWrapper className="relative inline-block">
      <img
        src={node.attrs.src}
        alt={node.attrs.alt}
        style={{
          width: node.attrs.width || "100%",
        }}
        className="rounded-md"
      />

      <div
        className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize rounded-sm bg-primary"
        onMouseDown={(event) => {
          event.preventDefault()

          const startX = event.clientX

          const startWidth =
            event.currentTarget.parentElement?.offsetWidth ?? 0

          function onMouseMove(moveEvent: MouseEvent) {
            const newWidth =
              startWidth + (moveEvent.clientX - startX)

            updateAttributes({
              width: `${newWidth}px`,
            })
          }

          function onMouseUp() {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
          }

          window.addEventListener("mousemove", onMouseMove)
          window.addEventListener("mouseup", onMouseUp)
        }}
      />
    </NodeViewWrapper>
  )
}