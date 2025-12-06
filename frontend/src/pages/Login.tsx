/**
 * Login Page
 * Modern, glassmorphism login form
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      login(data.access_token)
      try {
        const me = await (await import('../api/users')).usersApi.getMe()
        if (me.role === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } catch {
        navigate('/')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 card p-10 animate-fade-in-up">
        <div>
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-slate-400 text-sm">
            Sign in to access your mentorship dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                className="input-field"
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
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {mutation.isError && (
            <div className="text-red-400 text-sm text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              {mutation.error && 'response' in mutation.error
                ? (mutation.error as any).response?.data?.detail ||
                (mutation.error as any).response?.data?.message ||
                (mutation.error as any).message ||
                'Network error: Could not connect to server.'
                : mutation.error instanceof Error
                  ? mutation.error.message
                  : 'An error occurred.'}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/signup" className="text-primary hover:text-primary-hover text-sm font-medium transition-colors">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
