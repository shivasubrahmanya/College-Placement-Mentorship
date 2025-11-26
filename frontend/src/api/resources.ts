import { apiClient } from './client'
import { User } from './users'

export interface Resource {
  id: number
  user_id: number
  title: string
  description?: string
  file_url: string
  resource_type: ResourceType
  category?: string
  created_at: string
  user: User
}

export type ResourceType = string

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
    resource_type?: ResourceType
    user_id?: number
    skip?: number
    limit?: number
  }): Promise<Resource[]> => {
    const response = await apiClient.get<Resource[]>('/resources', { params })
    return response.data
  },
  listByMentorId: async (mentorId: number): Promise<Resource[]> => {
    const response = await apiClient.get<Resource[]>(`/mentors/${mentorId}/resources`)
    return response.data
  },
  listContributors: async (): Promise<{ user_id: number; full_name: string; resource_count: number }[]> => {
    const response = await apiClient.get('/resources/mentors')
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

