/**
 * Signup Page
 * Modern, glassmorphism signup form
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
    if (!email || !password || !fullName) {
      alert('Please fill in all fields')
      return
    }
    mutation.mutate({ email, password, full_name: fullName })
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 card p-10 animate-fade-in-up">
        <div>
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Create Account
          </h2>
          <p className="text-center text-slate-400 text-sm">
            Join the community and start your journey
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="input-field"
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
                autoComplete="new-password"
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
              <div className="font-semibold mb-1">Signup Failed</div>
              <div>
                {mutation.error && 'response' in mutation.error
                  ? (() => {
                    const error = mutation.error as any
                    if (error.response?.status === 422) {
                      const detail = error.response?.data?.detail
                      if (Array.isArray(detail)) {
                        return detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
                      }
                      return detail || 'Validation error'
                    }
                    return error.response?.data?.detail ||
                      error.message ||
                      'Network error'
                  })()
                  : 'An error occurred'}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-primary hover:text-primary-hover text-sm font-medium transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
