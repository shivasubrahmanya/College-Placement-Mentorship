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
      alert('User details updated successfully')
    },
  })

  const updateMentor = useMutation({
    mutationFn: mentorsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorMe'] })
      alert('Mentor profile updated successfully')
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
    <div className="max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">My Profile</h1>
        <div className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-sm font-medium">
          Mentor Account
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

        {/* Right Column: Mentor Details */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-6 font-heading border-b border-white/5 pb-4">Professional Profile</h2>
            <form onSubmit={handleMentorSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Branch</label>
                  <select
                    value={mentorForm.branch || ''}
                    onChange={(e) => setMentorForm({ ...mentorForm, branch: e.target.value as any })}
                    className="input-field"
                  >
                    {BranchValues.map((b) => (
                      <option key={b} value={b} className="bg-slate-800">{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Graduation Year</label>
                  <input type="number" value={mentorForm.graduation_year || 0} onChange={(e) => setMentorForm({ ...mentorForm, graduation_year: Number(e.target.value) })} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Current Company</label>
                  <input value={mentorForm.current_company || ''} onChange={(e) => setMentorForm({ ...mentorForm, current_company: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Package (LPA)</label>
                  <input type="number" value={mentorForm.package || 0} onChange={(e) => setMentorForm({ ...mentorForm, package: Number(e.target.value) })} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                <textarea rows={4} value={mentorForm.bio || ''} onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })} className="input-field" placeholder="Tell us about yourself..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">LinkedIn URL</label>
                  <input value={mentorForm.linkedin_url || ''} onChange={(e) => setMentorForm({ ...mentorForm, linkedin_url: e.target.value })} className="input-field" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">GitHub URL</label>
                  <input value={mentorForm.github_url || ''} onChange={(e) => setMentorForm({ ...mentorForm, github_url: e.target.value })} className="input-field" placeholder="https://github.com/..." />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={updateMentor.isPending} className="btn-primary px-8">
                  {updateMentor.isPending ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
