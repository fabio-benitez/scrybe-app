import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getFileUrl, uploadFile } from "@/features/files/services/file-service"
import {
  deleteProfileAvatar,
  getProfile,
  updateProfile,
  updateProfileAvatar,
} from "@/features/profile/services/profile-service"

export const profileQueryKey = ["profile"] as const

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: getProfile,
  })
}

export function useProfileAvatar(fileId?: string | null) {
  return useQuery({
    queryKey: ["profile-avatar", fileId],
    queryFn: () => getFileUrl(fileId!),
    enabled: Boolean(fileId),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey })
    },
  })
}

export function useUpdateProfileAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const uploadedFile = await uploadFile(file)
      return updateProfileAvatar(uploadedFile.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey })
    },
  })
}

export function useDeleteProfileAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProfileAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey })
    },
  })
}