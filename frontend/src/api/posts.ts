import { apiClient } from './client'
import { User } from './users'

export interface Post {
  id: number
  user_id: number
  title: string
  content: string
  likes: number
  created_at: string
  user: User
}

export interface PostCreate {
  title: string
  content: string
  media_url?: string
}

export const postsApi = {
  list: async (params?: { skip?: number; limit?: number }): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/posts', { params })
    return response.data
  },
  
  get: async (id: number): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${id}`)
    return response.data
  },
  
  create: async (data: PostCreate): Promise<Post> => {
    const response = await apiClient.post<Post>('/posts', data)
    return response.data
  },
  
  like: async (id: number): Promise<Post> => {
    const response = await apiClient.post<Post>(`/posts/${id}/like`)
    return response.data
  },
}

