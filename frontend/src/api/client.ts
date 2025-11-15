import axios from 'axios'

// Use 127.0.0.1 instead of localhost to force IPv4 (avoids IPv6 issues)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Log API base URL for debugging
console.log('🔧 API Base URL:', API_BASE_URL)

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''))
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status)
    return response
  },
  (error) => {
    // Log detailed error information
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
    })
    
    // Handle network errors (no response from server)
    if (!error.response) {
      // Check if it's a CORS error (browser blocks the request)
      if (error.message.includes('CORS') || error.code === 'ERR_BLOCKED_BY_CLIENT') {
        error.message = 'CORS error: Backend is blocking the request. Make sure CORS is properly configured and backend is restarted.'
      } else if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout: Backend server is not responding. Check if backend is running on http://127.0.0.1:8000'
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        error.message = 'Network error: Cannot connect to backend. Make sure the backend is running on http://127.0.0.1:8000. Try restarting the backend.'
      } else if (error.request) {
        error.message = 'Server is not responding. Please check if the backend server is running on http://127.0.0.1:8000'
      }
      console.error('🔴 Network Error Details:', {
        code: error.code,
        message: error.message,
        request: error.request ? 'Request object exists' : 'No request object',
      })
    } else {
      // Server responded but with error status
      console.error('🔴 Server Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      })
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

