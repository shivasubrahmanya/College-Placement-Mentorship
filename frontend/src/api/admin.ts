import { apiClient } from './client'

export interface AdminProfile {
  id: number
  user_id: number
  department_name?: string
  designation?: string
  contact_number?: string
  created_at: string
  updated_at?: string
}

export interface AdminCreateInput {
  department_name?: string
  designation?: string
  contact_number?: string
}

export interface AdminStats {
  mentors: number
  mentees: number
  pending_mentors: number
  resources: number
  posts: number
}

export const adminApi = {
  createProfile: async (input: AdminCreateInput): Promise<AdminProfile> => {
    const res = await apiClient.post<AdminProfile>('/admin/profile/create', input)
    return res.data
  },
  getProfile: async (): Promise<AdminProfile> => {
    const res = await apiClient.get<AdminProfile>('/admin/profile')
    return res.data
  },
  updateProfile: async (input: Partial<AdminCreateInput>): Promise<AdminProfile> => {
    const res = await apiClient.put<AdminProfile>('/admin/profile', input)
    return res.data
  },
  getStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get<AdminStats>('/admin/stats')
    return res.data
  },
}
