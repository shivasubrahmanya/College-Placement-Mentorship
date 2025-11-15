import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi } from '../api/resources'
import { usersApi } from '../api/users'

export default function ResourcesList() {
  const [category, setCategory] = useState('')
  const queryClient = useQueryClient()

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getMe,
  })

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', category],
    queryFn: () => resourcesApi.list({ category: category || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: resourcesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading resources...</div>
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Resources</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Enter category"
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-4">
        {resources?.map((resource) => (
          <div key={resource.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{resource.title}</h3>
                {resource.description && (
                  <p className="text-gray-600 mb-2">{resource.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>by {resource.user.full_name}</span>
                  {resource.category && (
                    <span className="px-2 py-1 bg-gray-100 rounded">{resource.category}</span>
                  )}
                  <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleDownload(resource.file_url)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download
              </button>
              {currentUser && resource.user_id === currentUser.id && (
                <button
                  onClick={() => handleDelete(resource.id)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {resources && resources.length === 0 && (
        <div className="text-center py-8 text-gray-500">No resources found</div>
      )}
    </div>
  )
}

