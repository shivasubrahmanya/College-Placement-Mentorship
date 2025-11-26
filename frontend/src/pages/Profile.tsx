import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import MentorDashboard from './MentorDashboard.tsx'
import MenteeDashboard from './MenteeDashboard.tsx'

export default function Profile() {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getMe,
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  if (!currentUser) {
    return <div className="text-center py-8">User not found</div>
  }

  return (
    <div className="px-4 py-6">
      {currentUser.role === 'MENTOR' ? (
        <MentorDashboard />
      ) : (
        <MenteeDashboard />
      )}
    </div>
  )
}
