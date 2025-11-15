/**
 * Authentication API client
 * Handles signup and login requests
 */
import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },
  
  /**
   * Sign up a new user
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    console.log('🚀 authApi.signup called with:', { email: data.email, full_name: data.full_name, password: '***' })
    console.log('🚀 Making POST request to: /auth/signup')
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', data)
      console.log('✅ Signup successful:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Signup failed in authApi:', error)
      throw error
    }
  },
}
