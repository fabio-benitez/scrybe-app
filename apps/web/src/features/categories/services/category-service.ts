import { apiFetch } from "@/shared/api/api-client"

import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/features/categories/types/category"


export function listCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories")
}

export function getCategory(categoryId: string): Promise<Category> {
  return apiFetch<Category>(`/categories/${categoryId}`)
}

export function createCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  return apiFetch<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateCategory(
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  return apiFetch<Category>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteCategory(categoryId: string): Promise<void> {
  return apiFetch<void>(`/categories/${categoryId}`, {
    method: "DELETE",
  })
}