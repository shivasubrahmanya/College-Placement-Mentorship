/**
 * File Upload API - Presigned URLs for S3
 */
import { apiClient } from './client'

export interface UploadRequest {
  file_name: string
  content_type?: string
  file_type?: 'resource' | 'post'
}

export interface UploadResponse {
  upload_url: string
  file_key: string
  download_url: string
}

export const uploadApi = {
  /**
   * Get presigned URL for file upload
   */
  getPresignedUrl: async (data: UploadRequest): Promise<UploadResponse> => {
    const response = await apiClient.post<UploadResponse>('/upload/presigned-url', data)
    return response.data
  },
  
  /**
   * Upload file to S3 using presigned URL
   */
  uploadFile: async (file: File, presignedUrl: string): Promise<void> => {
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })
  },
  
  /**
   * Get download URL for a file
   */
  getDownloadUrl: async (fileKey: string): Promise<string> => {
    const response = await apiClient.get<{ download_url: string }>(`/upload/download-url/${encodeURIComponent(fileKey)}`)
    return response.data.download_url
  },
}

