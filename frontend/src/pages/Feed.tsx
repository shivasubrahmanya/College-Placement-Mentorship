import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { postsApi } from '../api/posts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'

export default function Feed() {
  const queryClient = useQueryClient()
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getMe,
  })

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
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-indigo-400">Loading feed...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">Community Feed</h1>
        {(currentUser?.role === 'MENTOR' || currentUser?.role === 'ADMIN') && (
          <Link
            to="/posts/create"
            className="btn-primary"
          >
            Create Post
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {posts?.map((post) => (
          <div key={post.id} className="card p-6 animate-fade-in-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-1 font-heading">{post.title}</h3>
                <p className="text-sm text-slate-400">
                  by <span className="text-indigo-400">{post.user.full_name}</span> •{' '}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-slate-300 mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4">
              <button
                onClick={() => handleLike(post.id)}
                disabled={likeMutation.isPending}
                className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors group"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:scale-110 group-active:scale-95"
                  fill={post.likes > 0 ? 'currentColor' : 'none'}
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
                <span className="font-medium">{post.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts && posts.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-slate-400 text-lg">No posts yet. Be the first to start the conversation!</p>
        </div>
      )}
    </div>
  )
}
