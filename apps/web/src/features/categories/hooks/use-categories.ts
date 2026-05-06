import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "@/features/categories/services/category-service"
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/features/categories/types/category"

export const categoriesQueryKey = ["categories"] as const

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: listCategories,
  })
}

export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: [...categoriesQueryKey, categoryId],
    queryFn: () => getCategory(categoryId),
    enabled: Boolean(categoryId),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}

export function useUpdateCategory(categoryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCategoryPayload) =>
      updateCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
      queryClient.invalidateQueries({
        queryKey: [...categoriesQueryKey, categoryId],
      })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}