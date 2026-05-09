import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createContent,
  deleteContent,
  getContent,
  listContents,
  listTrashContents,
  permanentlyDeleteContent,
  restoreContent,
  updateContent,
} from "@/features/contents/services/content-service"
import type {
  CreateContentPayload,
  UpdateContentPayload,
} from "@/features/contents/types/content"

export const contentsQueryKey = ["contents"] as const
export const trashContentsQueryKey = [...contentsQueryKey, "trash"] as const

export function useContents() {
  return useQuery({
    queryKey: contentsQueryKey,
    queryFn: listContents,
  })
}

export function useContent(contentId: string) {
  return useQuery({
    queryKey: [...contentsQueryKey, contentId],
    queryFn: () => getContent(contentId),
    enabled: Boolean(contentId),
  })
}

export function useCreateContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateContentPayload) => createContent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentsQueryKey })
    },
  })
}

export function useUpdateContent(contentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateContentPayload) =>
      updateContent(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentsQueryKey })
      queryClient.invalidateQueries({
        queryKey: [...contentsQueryKey, contentId],
      })
    },
  })
}

export function useDeleteContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentsQueryKey })
    },
  })
}

export function useTrashContents() {
  return useQuery({
    queryKey: trashContentsQueryKey,
    queryFn: listTrashContents,
  })
}

export function useRestoreContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: restoreContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentsQueryKey })
      queryClient.invalidateQueries({ queryKey: trashContentsQueryKey })
    },
  })
}

export function usePermanentlyDeleteContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: permanentlyDeleteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trashContentsQueryKey })
    },
  })
}

export function useToggleFavoriteContent(contentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isFavorite: boolean) =>
      updateContent(contentId, {
        is_favorite: isFavorite,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contentsQueryKey,
      })

      queryClient.invalidateQueries({
        queryKey: [...contentsQueryKey, contentId],
      })
    },
  })
}