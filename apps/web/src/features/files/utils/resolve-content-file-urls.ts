import { getFileUrl } from "@/features/files/services/file-service"

type TiptapNode = {
  type?: string
  attrs?: {
    fileId?: unknown
    src?: string
  }
  content?: TiptapNode[]
}

export async function resolveContentFileUrls<T>(
  content: T,
): Promise<T> {
  const cloned = structuredClone(content)

  async function walk(node: TiptapNode) {
    if (
      node.type === "image" &&
      typeof node.attrs?.fileId === "string"
    ) {
      try {
        const response = await getFileUrl(node.attrs.fileId)

        node.attrs.src = response.url
      } catch (error) {
        console.error("Failed to resolve image URL", error)
      }
    }

    if (Array.isArray(node.content)) {
      await Promise.all(node.content.map(walk))
    }
  }

  if (cloned && typeof cloned === "object") {
    await walk(cloned as TiptapNode)
  }

  return cloned
}