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
      alert('User details updated successfully')
    },
  })

  const updateMentee = useMutation({
    mutationFn: menteesApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menteeMe'] })
      alert('Student details updated successfully')
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
    <div className="max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">My Profile</h1>
        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-sm font-medium">
          Student Account
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Core User Info */}
        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6 font-heading border-b border-white/5 pb-4">Account Settings</h2>
            <form onSubmit={handleUserSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
              </div>
              <button type="submit" disabled={updateUser.isPending} className="w-full btn-primary">
                {updateUser.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="card p-6 border-red-500/10 bg-red-500/5">
            <h2 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-slate-400 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  deleteAccount.mutate()
                }
              }}
              disabled={deleteAccount.isPending}
              className="w-full px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              Delete My Account
            </button>
          </div>
        </div>

        {/* Right Column: Mentee Details */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-6 font-heading border-b border-white/5 pb-4">Student Profile</h2>
            <form onSubmit={handleMenteeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Branch</label>
                  <input value={menteeForm.branch || ''} onChange={(e) => setMenteeForm({ ...menteeForm, branch: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Current Year</label>
                  <input type="number" value={menteeForm.current_year || 0} onChange={(e) => setMenteeForm({ ...menteeForm, current_year: Number(e.target.value) })} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Learning Goals</label>
                <textarea rows={6} value={menteeForm.goals || ''} onChange={(e) => setMenteeForm({ ...menteeForm, goals: e.target.value })} className="input-field" placeholder="What do you hope to achieve?" />
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={updateMentee.isPending} className="btn-primary px-8">
                  {updateMentee.isPending ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
