import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import { mentorsApi, MentorUpdate, BranchValues } from '../api/mentors'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function MentorDashboard() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getMe,
  })

  const { data: mentor } = useQuery({
    queryKey: ['mentorMe'],
    queryFn: mentorsApi.getMe,
    enabled: !!currentUser,
  })

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mentorForm, setMentorForm] = useState<MentorUpdate>({})

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  useEffect(() => {
    if (mentor) {
      setMentorForm({
        branch: mentor.branch,
        graduation_year: mentor.graduation_year,
        current_company: mentor.current_company,
        package: mentor.package,
        bio: mentor.bio,
        linkedin_url: mentor.linkedin_url,
        github_url: mentor.github_url,
      })
    }
  }, [mentor])

  const updateUser = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })

  const updateMentor = useMutation({
    mutationFn: mentorsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorMe'] })
    },
  })

  const deleteAccount = useMutation({
    mutationFn: usersApi.deleteMe,
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser.mutate({ full_name: fullName, email })
  }

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMentor.mutate(mentorForm)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Mentor Profile</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <button type="submit" disabled={updateUser.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Changes</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Mentor Details</h2>
        <form onSubmit={handleMentorSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select value={mentorForm.branch || ''} onChange={(e) => setMentorForm({ ...mentorForm, branch: e.target.value as any })} className="px-3 py-2 border border-gray-300 rounded-md w-full">
              {BranchValues.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
            <input type="number" value={mentorForm.graduation_year || 0} onChange={(e) => setMentorForm({ ...mentorForm, graduation_year: Number(e.target.value) })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
            <input value={mentorForm.current_company || ''} onChange={(e) => setMentorForm({ ...mentorForm, current_company: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package (LPA)</label>
            <input type="number" value={mentorForm.package || 0} onChange={(e) => setMentorForm({ ...mentorForm, package: Number(e.target.value) })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={mentorForm.bio || ''} onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input value={mentorForm.linkedin_url || ''} onChange={(e) => setMentorForm({ ...mentorForm, linkedin_url: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input value={mentorForm.github_url || ''} onChange={(e) => setMentorForm({ ...mentorForm, github_url: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
            </div>
          </div>
          <button type="submit" disabled={updateMentor.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Mentor Details</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
        <button onClick={() => {
          if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteAccount.mutate()
          }
        }} disabled={deleteAccount.isPending} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete My Account</button>
      </div>
    </div>
  )
}
