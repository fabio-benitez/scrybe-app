
export function extractFileIdsFromContent(content: unknown): string[] {
  const fileIds = new Set<string>()

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return

    const current = node as {
      attrs?: {
        fileId?: unknown
      }
      content?: unknown[]
    }

    if (typeof current.attrs?.fileId === "string") {
      fileIds.add(current.attrs.fileId)
    }

    if (Array.isArray(current.content)) {
      current.content.forEach(walk)
    }
  }

  walk(content)

  return Array.from(fileIds)
}