
export function extractTextFromTipTap(content: unknown): string {
  if (!content || typeof content !== "object") return ""

  const node = content as {
    text?: string
    content?: unknown[]
  }

  const ownText = typeof node.text === "string" ? node.text : ""
  const childrenText = Array.isArray(node.content)
    ? node.content.map(extractTextFromTipTap).join(" ")
    : ""

  return `${ownText} ${childrenText}`.trim()
}