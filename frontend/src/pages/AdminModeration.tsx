/**
 * Admin Content Moderation Panel
 */
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { mentorsApi } from '../api/mentors'

interface Post {
  id: number
  title: string
  content: string
  media_url?: string
  is_approved: boolean
  user: { full_name: string }
  created_at: string
}

interface Resource {
  id: number
  title: string
  description?: string
  file_url: string
  resource_type: string
  is_approved: boolean
  user: { full_name: string }
  created_at: string
}

export default function AdminModeration() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'posts' | 'resources' | 'mentors'>('posts')
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab') as 'posts' | 'resources' | 'mentors' | null
    if (tab && ['posts', 'resources', 'mentors'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [location.search])
  const [approvedFilter, setApprovedFilter] = useState<boolean | null>(null)
  const queryClient = useQueryClient()

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['admin', 'posts', approvedFilter],
    queryFn: async () => {
      const params = approvedFilter !== null ? `?approved=${approvedFilter}` : ''
      const response = await apiClient.get(`/admin/posts${params}`)
      return response.data
    },
  })

  const { data: resources, isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ['admin', 'resources', approvedFilter],
    queryFn: async () => {
      const params = approvedFilter !== null ? `?approved=${approvedFilter}` : ''
      const response = await apiClient.get(`/admin/resources${params}`)
      return response.data
    },
  })

  const approvePost = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.put(`/admin/posts/${id}/approve`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
    },
  })

  const rejectPost = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.put(`/admin/posts/${id}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
    },
  })

  const deletePost = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/posts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
    },
  })

  const approveResource = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.put(`/admin/resources/${id}/approve`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
    },
  })

  const rejectResource = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.put(`/admin/resources/${id}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
    },
  })

  const deleteResource = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/resources/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
    },
  })

  const recalculateLeaderboard = useMutation({
    mutationFn: async () => {
      await apiClient.post('/admin/leaderboard/recalculate')
    },
    onSuccess: () => {
      alert('Leaderboard recalculated successfully!')
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <button
          onClick={() => recalculateLeaderboard.mutate()}
          disabled={recalculateLeaderboard.isPending}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {recalculateLeaderboard.isPending ? 'Recalculating...' : 'Recalculate Leaderboard'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mentors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mentors
          </button>
        </nav>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Approval Status</label>
        <select
          value={approvedFilter === null ? 'all' : approvedFilter.toString()}
          onChange={(e) => {
            const value = e.target.value
            setApprovedFilter(value === 'all' ? null : value === 'true')
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All</option>
          <option value="true">Approved</option>
          <option value="false">Pending/Rejected</option>
        </select>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div>
          {postsLoading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : (
            <div className="space-y-4">
              {posts?.map((post) => (
                <div
                  key={post.id}
                  className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                    post.is_approved ? 'border-green-500' : 'border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{post.title}</h3>
                      <p className="text-gray-600 mb-2">{post.content.substring(0, 200)}...</p>
                      {post.media_url && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Media: </span>
                          <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Media
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>by {post.user.full_name}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded ${post.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {post.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {!post.is_approved && (
                      <button
                        onClick={() => approvePost.mutate(post.id)}
                        disabled={approvePost.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {post.is_approved && (
                      <button
                        onClick={() => rejectPost.mutate(post.id)}
                        disabled={rejectPost.isPending}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this post?')) {
                          deletePost.mutate(post.id)
                        }
                      }}
                      disabled={deletePost.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {posts && posts.length === 0 && (
                <div className="text-center py-8 text-gray-500">No posts found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div>
          {resourcesLoading ? (
            <div className="text-center py-8">Loading resources...</div>
          ) : (
            <div className="space-y-4">
              {resources?.map((resource) => (
                <div
                  key={resource.id}
                  className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                    resource.is_approved ? 'border-green-500' : 'border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-gray-600 mb-2">{resource.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>by {resource.user.full_name}</span>
                        <span className="px-2 py-1 bg-blue-100 rounded">{resource.resource_type}</span>
                        <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded ${resource.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {resource.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {!resource.is_approved && (
                      <button
                        onClick={() => approveResource.mutate(resource.id)}
                        disabled={approveResource.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {resource.is_approved && (
                      <button
                        onClick={() => rejectResource.mutate(resource.id)}
                        disabled={rejectResource.isPending}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this resource?')) {
                          deleteResource.mutate(resource.id)
                        }
                      }}
                      disabled={deleteResource.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {resources && resources.length === 0 && (
                <div className="text-center py-8 text-gray-500">No resources found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mentors Tab */}
      {activeTab === 'mentors' && (
        <div>
          <MentorsModeration />
        </div>
      )}
    </div>
  )
}

function MentorsModeration() {
  const queryClient = useQueryClient()
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentorsModeration'],
    queryFn: () => mentorsApi.list({ limit: 100 }),
  })

  const verifyMentor = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.put(`/admin/mentors/${id}/verify`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorsModeration'] })
      queryClient.invalidateQueries({ queryKey: ['mentors'] })
      queryClient.invalidateQueries({ queryKey: ['mentor'] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading mentors...</div>
  }

  return (
    <div className="space-y-4">
      {mentors?.map((m) => (
        <div key={m.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{m.user.full_name}</h3>
              <p className="text-gray-600">Branch: {m.branch} • Graduation: {m.graduation_year}</p>
            </div>
            <div className="flex gap-2">
              {!m.verified && (
                <button
                  onClick={() => verifyMentor.mutate(m.id)}
                  disabled={verifyMentor.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {mentors && mentors.length === 0 && (
        <div className="text-center py-8 text-gray-500">No mentors found</div>
      )}
    </div>
  )
}
