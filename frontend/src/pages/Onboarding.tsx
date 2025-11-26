import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { mentorsApi, MentorCreate, Branch, BranchValues } from '../api/mentors'
import { menteesApi, MenteeCreate } from '../api/mentees'
import { adminApi } from '../api/admin'

export default function Onboarding() {
  const [role, setRole] = useState<'mentor' | 'mentee' | 'admin' | null>(null)
  const [mentorData, setMentorData] = useState<MentorCreate>({
    branch: 'CSE',
    graduation_year: new Date().getFullYear(),
    package: 0,
  })
  const [menteeData, setMenteeData] = useState<MenteeCreate>({
    branch: 'CSE',
    current_year: 1,
  })
  const navigate = useNavigate()

  const mentorMutation = useMutation({
    mutationFn: mentorsApi.create,
    onSuccess: () => {
      navigate('/')
    },
  })

  const menteeMutation = useMutation({
    mutationFn: menteesApi.create,
    onSuccess: () => {
      navigate('/')
    },
  })

  const [adminData, setAdminData] = useState({
    department_name: '',
    designation: '',
    contact_number: '',
  })

  const adminMutation = useMutation({
    mutationFn: adminApi.createProfile,
    onSuccess: () => {
      navigate('/admin')
    },
  })

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mentorMutation.mutate(mentorData)
  }

  const handleMenteeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    menteeMutation.mutate(menteeData)
  }

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    adminMutation.mutate(adminData)
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Choose your role
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setRole('mentor')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <h3 className="text-xl font-semibold mb-2">Mentor</h3>
              <p className="text-gray-600">Guide and help mentees</p>
            </button>
            <button
              onClick={() => setRole('mentee')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <h3 className="text-xl font-semibold mb-2">Mentee</h3>
              <p className="text-gray-600">Get guidance from mentors</p>
            </button>
            <button
              onClick={() => setRole('admin')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <h3 className="text-xl font-semibold mb-2">Admin</h3>
              <p className="text-gray-600">Moderate and manage platform</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (role === 'mentor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-center text-gray-900">
              Mentor Profile Setup
            </h2>
          </div>
          <form onSubmit={handleMentorSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <select
                value={mentorData.branch}
                onChange={(e) => setMentorData({ ...mentorData, branch: e.target.value as Branch })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {BranchValues.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Graduation Year
              </label>
              <input
                type="number"
                value={mentorData.graduation_year}
                onChange={(e) =>
                  setMentorData({ ...mentorData, graduation_year: parseInt(e.target.value) })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Company (optional)
              </label>
              <input
                type="text"
                value={mentorData.current_company || ''}
                onChange={(e) =>
                  setMentorData({ ...mentorData, current_company: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Package (LPA)
              </label>
              <input
                type="number"
                value={mentorData.package}
                onChange={(e) =>
                  setMentorData({ ...mentorData, package: parseInt(e.target.value) || 0 })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio (optional)</label>
              <textarea
                value={mentorData.bio || ''}
                onChange={(e) => setMentorData({ ...mentorData, bio: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={mentorMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {mentorMutation.isPending ? 'Creating...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-center text-gray-900">
              Admin Profile Setup
            </h2>
          </div>
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department Name</label>
              <input
                type="text"
                value={adminData.department_name}
                onChange={(e) => setAdminData({ ...adminData, department_name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Designation</label>
              <input
                type="text"
                value={adminData.designation}
                onChange={(e) => setAdminData({ ...adminData, designation: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="text"
                value={adminData.contact_number}
                onChange={(e) => setAdminData({ ...adminData, contact_number: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={adminMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {adminMutation.isPending ? 'Creating...' : 'Create Admin Profile'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Mentee Profile Setup
          </h2>
        </div>
        <form onSubmit={handleMenteeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <input
              type="text"
              value={menteeData.branch || ''}
              onChange={(e) => setMenteeData({ ...menteeData, branch: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Year</label>
            <input
              type="number"
              min="1"
              max="4"
              value={menteeData.current_year || ''}
              onChange={(e) =>
                setMenteeData({ ...menteeData, current_year: parseInt(e.target.value) })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Goals (optional)</label>
            <textarea
              value={menteeData.goals || ''}
              onChange={(e) => setMenteeData({ ...menteeData, goals: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={menteeMutation.isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {menteeMutation.isPending ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

