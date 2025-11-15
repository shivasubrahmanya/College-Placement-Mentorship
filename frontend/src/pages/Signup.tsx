/**
 * Signup Page
 * Simple, clean signup form with error handling
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      login(data.access_token)
      navigate('/onboarding')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Signup form submitted:', { email, full_name: fullName, password: '***' })
    console.log('📝 Calling mutation.mutate with:', { email, password: '***', full_name: fullName })
    
    if (!email || !password || !fullName) {
      console.error('❌ Form validation failed: Missing fields')
      alert('Please fill in all fields')
      return
    }
    
    console.log('📝 Triggering mutation...')
    mutation.mutate({ email, password, full_name: fullName })
    console.log('📝 Mutation triggered, isPending:', mutation.isPending)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <div className="mt-2 text-center text-sm text-gray-500">
            API Endpoint: POST /auth/signup
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {mutation.isError && (
            <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-md">
              <div className="font-semibold mb-1">Signup Failed</div>
              <div>
                {mutation.error && 'response' in mutation.error
                  ? (() => {
                      const error = mutation.error as any
                      // Handle validation errors (422)
                      if (error.response?.status === 422) {
                        const detail = error.response?.data?.detail
                        if (Array.isArray(detail)) {
                          return detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
                        }
                        return detail || 'Validation error: Please check your input'
                      }
                      // Handle other errors
                      return error.response?.data?.detail || 
                        error.response?.data?.message ||
                        error.message ||
                        'Network error: Could not connect to server. Make sure the backend is running on http://127.0.0.1:8000'
                    })()
                  : mutation.error instanceof Error
                  ? mutation.error.message
                  : 'An error occurred. Please check if the backend server is running.'}
              </div>
              <div className="text-xs mt-2 text-gray-500">
                Check browser console (F12) for more details
              </div>
            </div>
          )}
          
          {mutation.isSuccess && (
            <div className="text-green-600 text-sm text-center p-3 bg-green-50 rounded-md">
              ✅ Account created successfully! Redirecting...
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {mutation.isPending ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-500 text-sm">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
