import { apiClient } from './client'
import { User } from './users'

export interface Mentee {
  id: number
  user_id: number
  branch?: string
  current_year?: number
  goals?: string
  created_at: string
  user: User
}

export interface MenteeCreate {
  branch?: string
  current_year?: number
  goals?: string
}

export interface MenteeUpdate {
  branch?: string
  current_year?: number
  goals?: string
}

export const menteesApi = {
  create: async (data: MenteeCreate): Promise<Mentee> => {
    const response = await apiClient.post<Mentee>('/mentees', data)
    return response.data
  },
  
  getMe: async (): Promise<Mentee> => {
    const response = await apiClient.get<Mentee>('/mentees/me')
    return response.data
  },
  
  update: async (data: MenteeUpdate): Promise<Mentee> => {
    const response = await apiClient.put<Mentee>('/mentees/me', data)
    return response.data
  },
}

