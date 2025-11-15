import { apiClient } from './client'
import { User } from './users'

export interface Resource {
  id: number
  user_id: number
  title: string
  description?: string
  file_url: string
  category?: string
  created_at: string
  user: User
}

export type ResourceType = 'Study Material' | 'Preparation Guide' | 'Experience' | 'Other'

export const ResourceTypeValues = ['Study Material', 'Preparation Guide', 'Experience', 'Other'] as const

export interface ResourceCreate {
  title: string
  description?: string
  file_url: string
  resource_type?: ResourceType
  category?: string
}

export const resourcesApi = {
  list: async (params?: {
    category?: string
    skip?: number
    limit?: number
  }): Promise<Resource[]> => {
    const response = await apiClient.get<Resource[]>('/resources', { params })
    return response.data
  },
  
  create: async (data: ResourceCreate): Promise<Resource> => {
    const response = await apiClient.post<Resource>('/resources', data)
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resources/${id}`)
  },
}

