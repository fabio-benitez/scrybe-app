import { apiFetch } from "@/shared/api/api-client"
import type {
  FileResource,
  FileUrlResponse,
  UploadFileResponse,
} from "@/features/files/types/file"

export function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData()

  formData.append("file", file)

  return apiFetch<UploadFileResponse>("/files", {
    method: "POST",
    body: formData,
  })
}

export function getFile(fileId: string): Promise<FileResource> {
  return apiFetch<FileResource>(`/files/${fileId}`)
}

export function getFileUrl(fileId: string): Promise<FileUrlResponse> {
  return apiFetch<FileUrlResponse>(`/files/${fileId}/url`)
}

export function deleteFile(fileId: string): Promise<void> {
  return apiFetch<void>(`/files/${fileId}`, {
    method: "DELETE",
  })
}