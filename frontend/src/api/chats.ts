import { apiClient } from './client'

export interface Chat {
  id: number
  sender_id: number
  receiver_id: number
  message: string
  created_at: string
}

export interface ChatCreate {
  receiver_id: number
  message: string
}

export const chatsApi = {
  send: async (data: ChatCreate): Promise<Chat> => {
    const response = await apiClient.post<Chat>('/chats', data)
    return response.data
  },
  
  getConversation: async (
    userId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>(`/chats/conversation/${userId}`, { params })
    return response.data
  },
}

