import { apiClient } from './client'
import { User } from './users'

export type Branch = 'CSE' | 'ECE' | 'ME' | 'CE' | 'EE' | 'IT'

// Export Branch values as const array for runtime use
export const BranchValues = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT'] as const

export interface Mentor {
  id: number
  user_id: number
  branch: Branch
  graduation_year: number
  current_company?: string
  package: number
  verified: boolean
  bio?: string
  linkedin_url?: string
  github_url?: string
  created_at: string
  user: User
}

export interface MentorListResponse {
  id: number
  user_id: number
  branch: Branch
  graduation_year: number
  current_company?: string
  package: number
  verified: boolean
  bio?: string
  user: User
}

export interface MentorCreate {
  branch: Branch
  graduation_year: number
  current_company?: string
  package?: number
  bio?: string
  linkedin_url?: string
  github_url?: string
}

export interface MentorUpdate {
  branch?: Branch
  graduation_year?: number
  current_company?: string
  package?: number
  bio?: string
  linkedin_url?: string
  github_url?: string
}

export const mentorsApi = {
  list: async (params?: {
    branch?: Branch
    graduation_year?: number
    verified?: boolean
    skip?: number
    limit?: number
  }): Promise<MentorListResponse[]> => {
    const response = await apiClient.get<MentorListResponse[]>('/mentors', { params })
    return response.data
  },
  
  get: async (id: number): Promise<Mentor> => {
    const response = await apiClient.get<Mentor>(`/mentors/${id}`)
    return response.data
  },
  
  create: async (data: MentorCreate): Promise<Mentor> => {
    const response = await apiClient.post<Mentor>('/mentors', data)
    return response.data
  },
  
  update: async (data: MentorUpdate): Promise<Mentor> => {
    const response = await apiClient.put<Mentor>('/mentors/me', data)
    return response.data
  },
}

