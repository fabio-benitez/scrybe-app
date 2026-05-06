
export type CategoryColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"

export interface Category {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  color: CategoryColor | null
  created_at: string
  updated_at: string
}

export interface CreateCategoryPayload {
  name: string
  description?: string | null
  color?: CategoryColor | null
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string | null
  color?: CategoryColor | null
}