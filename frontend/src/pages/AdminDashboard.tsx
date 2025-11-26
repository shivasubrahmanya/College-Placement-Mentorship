import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import { mentorsApi } from '../api/mentors'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  })

  const { data: pendingMentors } = useQuery({
    queryKey: ['pendingMentors'],
    queryFn: () => mentorsApi.list({ verified: false, limit: 20 }),
  })

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/admin/moderation" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Moderation</Link>
            <Link to="/admin/profile" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Profile</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Mentors" value={stats?.mentors ?? 0} />
          <StatCard title="Mentees" value={stats?.mentees ?? 0} />
          <StatCard title="Pending Mentors" value={stats?.pending_mentors ?? 0} />
          <StatCard title="Resources" value={stats?.resources ?? 0} />
          <StatCard title="Posts" value={stats?.posts ?? 0} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Mentor Verifications</h2>
          <div className="space-y-4">
            {pendingMentors?.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{m.user.full_name}</div>
                  <div className="text-sm text-gray-600">Branch: {m.branch} • Graduation: {m.graduation_year}</div>
                </div>
                <Link to="/admin/moderation" className="px-3 py-1 bg-green-600 text-white rounded-md">Verify</Link>
              </div>
            ))}
            {pendingMentors && pendingMentors.length === 0 && (
              <div className="text-center py-8 text-gray-500">No pending mentors</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}
