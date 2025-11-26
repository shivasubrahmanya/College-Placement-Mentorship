import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import { menteesApi, MenteeUpdate } from '../api/mentees'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function MenteeDashboard() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getMe,
  })

  const { data: mentee } = useQuery({
    queryKey: ['menteeMe'],
    queryFn: menteesApi.getMe,
    enabled: !!currentUser,
  })

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [menteeForm, setMenteeForm] = useState<MenteeUpdate>({})

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  useEffect(() => {
    if (mentee) {
      setMenteeForm({
        branch: mentee.branch,
        current_year: mentee.current_year,
        goals: mentee.goals,
      })
    }
  }, [mentee])

  const updateUser = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })

  const updateMentee = useMutation({
    mutationFn: menteesApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menteeMe'] })
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

  const handleMenteeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMentee.mutate(menteeForm)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Mentee Profile</h1>
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
        <h2 className="text-xl font-semibold mb-4">Mentee Details</h2>
        <form onSubmit={handleMenteeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <input value={menteeForm.branch || ''} onChange={(e) => setMenteeForm({ ...menteeForm, branch: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
            <input type="number" value={menteeForm.current_year || 0} onChange={(e) => setMenteeForm({ ...menteeForm, current_year: Number(e.target.value) })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
            <textarea value={menteeForm.goals || ''} onChange={(e) => setMenteeForm({ ...menteeForm, goals: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md w-full" />
          </div>
          <button type="submit" disabled={updateMentee.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Mentee Details</button>
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
