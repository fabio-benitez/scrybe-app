
export interface FileResource {
  id: string
  original_name: string
  mime_type: string
  size_bytes: number
  upload_status: string
  created_at: string
  uploaded_at: string | null
}

export interface UploadFileResponse extends FileResource {
  already_existed: boolean
}

export interface FileUrlResponse {
  url: string
}