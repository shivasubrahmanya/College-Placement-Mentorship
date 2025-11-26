import { apiClient } from './client'

export interface User {
  id: number
  email: string
  full_name: string
  role: 'MENTOR' | 'MENTEE' | 'ADMIN'
  created_at: string
}

export interface UserUpdate {
  full_name?: string
  email?: string
}

export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  },
  
  updateMe: async (data: UserUpdate): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', data)
    return response.data
  },
  
  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/users/me')
  },
}

