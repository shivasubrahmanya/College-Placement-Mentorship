import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'

export default function AdminProfile() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: adminApi.getProfile,
  })

  const updateMutation = useMutation({
    mutationFn: adminApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  if (!profile) {
    return <div className="text-center py-8">Profile not found</div>
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget as any
    const data = {
      department_name: form.department_name.value,
      designation: form.designation.value,
      contact_number: form.contact_number.value,
    }
    updateMutation.mutate(data)
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
          <input name="department_name" defaultValue={profile.department_name || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
          <input name="designation" defaultValue={profile.designation || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input name="contact_number" defaultValue={profile.contact_number || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Changes</button>
      </form>
    </div>
  )
}
