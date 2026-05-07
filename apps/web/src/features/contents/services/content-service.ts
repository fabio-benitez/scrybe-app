import { apiFetch } from "@/shared/api/api-client"

import type {
  Content,
  CreateContentPayload,
  UpdateContentPayload,
} from "@/features/contents/types/content"

export function listContents(): Promise<Content[]> {
  return apiFetch<Content[]>("/contents")
}

export function getContent(contentId: string): Promise<Content> {
  return apiFetch<Content>(`/contents/${contentId}`)
}

export function createContent(
  payload: CreateContentPayload,
): Promise<Content> {
  return apiFetch<Content>("/contents", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateContent(
  contentId: string,
  payload: UpdateContentPayload,
): Promise<Content> {
  return apiFetch<Content>(`/contents/${contentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteContent(contentId: string): Promise<void> {
  return apiFetch<void>(`/contents/${contentId}`, {
    method: "DELETE",
  })
}

export function listTrashContents(): Promise<Content[]> {
  return apiFetch<Content[]>("/contents/trash")
}

export function restoreContent(contentId: string): Promise<Content> {
  return apiFetch<Content>(`/contents/${contentId}/restore`, {
    method: "PATCH",
  })
}

export function permanentlyDeleteContent(contentId: string): Promise<void> {
  return apiFetch<void>(`/contents/${contentId}/permanent`, {
    method: "DELETE",
  })
}