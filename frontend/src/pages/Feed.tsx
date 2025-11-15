import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { postsApi } from '../api/posts'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function Feed() {
  const queryClient = useQueryClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postsApi.list({ limit: 20 }),
  })

  const likeMutation = useMutation({
    mutationFn: postsApi.like,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const handleLike = (postId: number) => {
    likeMutation.mutate(postId)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading posts...</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
        <Link
          to="/posts/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Post
        </Link>
      </div>

      <div className="space-y-6">
        {posts?.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-500">
                  by {post.user.full_name} •{' '}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(post.id)}
                disabled={likeMutation.isPending}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{post.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts && posts.length === 0 && (
        <div className="text-center py-8 text-gray-500">No posts yet. Be the first to post!</div>
      )}
    </div>
  )
}

