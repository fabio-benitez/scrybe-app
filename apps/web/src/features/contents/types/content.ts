export type ContentStatus = "draft" | "published" | "archived"
export type ContentVisibility = "private" | "public"

export interface Content {
  id: string
  user_id: string
  category_id: string | null
  title: string
  slug: string | null
  summary: string | null
  content: unknown
  status: ContentStatus
  visibility: ContentVisibility
  is_favorite: boolean
  created_at: string
  updated_at: string
  published_at: string | null
  deleted_at: string | null
  delete_after: string | null
}

export interface CreateContentPayload {
  title: string
  summary?: string | null
  content: unknown
  category_id?: string | null
  status?: ContentStatus
  visibility?: ContentVisibility
  is_favorite?: boolean
}

export interface UpdateContentPayload {
  title?: string
  summary?: string | null
  content?: unknown
  category_id?: string | null
  is_favorite?: boolean
}
