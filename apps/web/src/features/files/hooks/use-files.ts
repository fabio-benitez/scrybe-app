import { useMutation } from "@tanstack/react-query"

import {
  deleteFile,
  uploadFile,
} from "@/features/files/services/file-service"

export function useUploadFile() {
  return useMutation({
    mutationFn: uploadFile,
  })
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: deleteFile,
  })
}