
export interface FileResource {
  id: string
  user_id: string
  bucket: string
  object_path: string
  original_name: string
  mime_type: string
  size_bytes: number
  upload_status: string
  checksum_sha256: string | null
  created_at: string
  uploaded_at: string | null
}

export interface FileUrlResponse {
  url: string
}