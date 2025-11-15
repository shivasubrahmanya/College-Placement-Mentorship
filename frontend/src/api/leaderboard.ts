import { apiClient } from './client'
import { User } from './users'

export interface LeaderboardEntry {
  id: number
  user_id: number
  total_resources: number
  total_posts: number
  package: number
  points: number
  updated_at?: string
  user: User
}

export const leaderboardApi = {
  get: async (params?: { skip?: number; limit?: number }): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<LeaderboardEntry[]>('/leaderboard', { params })
    return response.data
  },
}

