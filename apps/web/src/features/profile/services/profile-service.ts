import { apiFetch } from "@/shared/api/api-client"
import type { Profile } from "@/features/profile/types/profile"

// TODO: move FileURLResponse and getProfileAvatarUrl to features/files
interface FileURLResponse {
  url: string
}

export function getProfile(): Promise<Profile> {
  return apiFetch<Profile>("/profile")
}

export function getProfileAvatarUrl(fileId: string): Promise<FileURLResponse> {
  return apiFetch<FileURLResponse>(`/files/${fileId}/url`)
}
