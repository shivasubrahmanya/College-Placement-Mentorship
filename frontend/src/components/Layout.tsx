import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api/users'

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getMe,
  })

  // Helper to check if link is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const navLinkClass = (path: string) => `
    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200
    ${isActive(path)
      ? 'border-primary text-white'
      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'}
  `

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-gradient font-heading">
                  Mentorship Platform
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link to="/" className={navLinkClass('/')}>
                  Feed
                </Link>
                <Link to="/mentors" className={navLinkClass('/mentors')}>
                  Mentors
                </Link>
                <Link to="/resources" className={navLinkClass('/resources')}>
                  Resources
                </Link>
                <Link to="/leaderboard" className={navLinkClass('/leaderboard')}>
                  Leaderboard
                </Link>
                <Link to="/profile" className={navLinkClass('/profile')}>
                  Profile
                </Link>
                {currentUser?.role === 'ADMIN' && (
                  <Link to="/admin" className={navLinkClass('/admin')}>
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 animate-fade-in-up">
        <Outlet />
      </main>
    </div>
  )
}
