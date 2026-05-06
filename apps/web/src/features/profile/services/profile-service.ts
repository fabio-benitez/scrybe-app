import { apiFetch } from "@/shared/api/api-client"
import type { Profile } from "@/features/profile/types/profile"


interface UpdateProfilePayload {
  display_name: string
}

interface UpdateProfileAvatarPayload {
  file_id: string
}


export function getProfile(): Promise<Profile> {
  return apiFetch<Profile>("/profile")
}

export function updateProfile(
  payload: UpdateProfilePayload,
): Promise<Profile> {
  return apiFetch<Profile>("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function updateProfileAvatar(fileId: string): Promise<Profile> {
  return apiFetch<Profile>("/profile/avatar", {
    method: "PATCH",
    body: JSON.stringify({
      file_id: fileId,
    } satisfies UpdateProfileAvatarPayload),
  })
}

export function deleteProfileAvatar(): Promise<void> {
  return apiFetch<void>("/profile/avatar", {
    method: "DELETE",
  })
}