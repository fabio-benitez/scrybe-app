import { apiFetch } from "@/shared/api/api-client"
import type { Profile } from "@/features/profile/types/profile"



export function getProfile(): Promise<Profile> {
  return apiFetch<Profile>("/profile")
}
