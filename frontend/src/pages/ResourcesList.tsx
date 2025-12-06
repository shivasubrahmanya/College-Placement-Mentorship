import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi, ResourceTypeValues } from '../api/resources'
import { usersApi } from '../api/users'
import { Link } from 'react-router-dom'

export default function ResourcesList() {
  const [category, setCategory] = useState('')
  const queryClient = useQueryClient()

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getMe,
  })

  const resourcesQuery = useQuery({
    queryKey: ['resources', category],
    queryFn: () => resourcesApi.list({ category: category || undefined, limit: 50 }),
  })
  const resources = resourcesQuery.data
  const isLoading = resourcesQuery.isLoading

  const { data: contributors } = useQuery({
    queryKey: ['resourceContributors'],
    queryFn: resourcesApi.listContributors,
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [resourceType, setResourceType] = useState<typeof ResourceTypeValues[number]>('Other')

  const createMutation = useMutation({
    mutationFn: resourcesApi.create,
    onSuccess: (created) => {
      setTitle('')
      setDescription('')
      setFileUrl('')
      setCategoryInput('')
      setResourceType('Other')
      setCategory('')
      queryClient.setQueryData(['resources', category], (old: any) => {
        if (Array.isArray(old)) {
          return [created, ...old]
        }
        return old
      })
      queryClient.invalidateQueries({ queryKey: ['resources', category] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['allResources'] })
      resourcesQuery.refetch()
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || 'Failed to create resource')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: resourcesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', category] })
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
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-indigo-400">Loading resources...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">Resources Library</h1>
        <Link to="/resources/all" className="btn-secondary">View All</Link>
      </div>

      {contributors && contributors.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-100 mb-4">Top Contributors</h2>
          <div className="flex flex-wrap gap-3">
            {contributors.map((c) => (
              <Link
                key={c.user_id}
                to={`/mentors/user/${c.user_id}`}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all hover:scale-105"
                title={`${c.full_name} • ${c.resource_count} resources`}
              >
                {c.full_name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {(currentUser?.role === 'MENTOR' || currentUser?.role === 'ADMIN') && (
        <div className="card p-8 mb-8 border-indigo-500/20">
          <h2 className="text-xl font-bold text-white mb-6">Add New Resource</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate({
                title,
                description,
                file_url: fileUrl,
                category: categoryInput || undefined,
                resource_type: resourceType,
              })
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required placeholder="Resource Title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Link URL</label>
                <input type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." className="input-field" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-[100px]" placeholder="Describe this resource..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select value={resourceType} onChange={(e) => setResourceType(e.target.value as any)} className="input-field">
                  {ResourceTypeValues.map((t) => (
                    <option key={t} value={t} className="bg-slate-800">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} className="input-field" placeholder="e.g. Algorithms" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                {createMutation.isPending ? 'Adding...' : 'Add Resource'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-2">Filter Resources</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Search by category..."
          className="input-field max-w-md"
        />
      </div>

      <div className="space-y-4">
        {resources?.map((resource) => (
          <div key={resource.id} className="card p-6 animate-fade-in-up hover:border-indigo-500/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 font-heading">{resource.title}</h3>
                {resource.description && (
                  <p className="text-slate-400 mb-3">{resource.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <Link to={`/mentors/user/${resource.user_id}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    by {resource.user?.full_name || 'Unknown'}
                  </Link>
                  {resource.category && (
                    <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">{resource.category}</span>
                  )}
                  <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">{resource.resource_type}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => handleDownload(resource.file_url)}
                className="btn-primary text-sm py-1.5 px-4"
              >
                Access Resource
              </button>
              {currentUser && resource.user_id === currentUser.id && (
                <button
                  onClick={() => handleDelete(resource.id)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {resources && resources.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-slate-400 text-lg">No resources found</p>
        </div>
      )}
    </div>
  )
}
