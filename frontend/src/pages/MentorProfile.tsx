import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { mentorsApi } from '../api/mentors'
import { Link } from 'react-router-dom'
import { resourcesApi } from '../api/resources'

export default function MentorProfile() {
  const { id } = useParams<{ id: string }>()
  const mentorId = parseInt(id || '0')

  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentor', mentorId],
    queryFn: () => mentorsApi.get(mentorId),
    enabled: !!mentorId,
    refetchInterval: 2000,
  })

  const { data: resources } = useQuery({
    queryKey: ['mentorResources', mentorId],
    queryFn: () => resourcesApi.listByMentorId(mentorId),
    enabled: !!mentorId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-indigo-400">Loading profile...</div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-slate-400">Mentor not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      {/* Cover Image */}
      <div className="h-48 md:h-64 rounded-xl bg-gradient-to-r from-indigo-900 to-purple-900 relative overflow-hidden mb-12 shadow-2xl ring-1 ring-white/10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      </div>

      <div className="relative -mt-24 px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-800 border-4 border-slate-900 shadow-xl flex items-center justify-center text-4xl font-bold text-slate-500 bg-gradient-to-br from-slate-700 to-slate-800">
              {mentor.user.full_name.charAt(0)}
            </div>
            {mentor.verified && (
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-white shadow-lg" title="Verified Mentor">
                ✓
              </div>
            )}
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-4xl font-bold text-white mb-2 font-heading">{mentor.user.full_name}</h1>
            <p className="text-slate-400 text-lg">{mentor.current_company ? `Engineer at ${mentor.current_company}` : 'Software Engineer'}</p>
          </div>

          <div className="flex gap-3 pb-2">
            <Link
              to={`/chat/${mentor.user_id}`}
              className="btn-primary"
            >
              Message
            </Link>
            {mentor.linkedin_url && (
              <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">LinkedIn</a>
            )}
            {mentor.github_url && (
              <a href={mentor.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">GitHub</a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Stats & Info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-slate-100 font-bold mb-4 font-heading text-lg">About</h3>
              {mentor.bio ? (
                <p className="text-slate-400 leading-relaxed mb-6">{mentor.bio}</p>
              ) : (
                <p className="text-slate-500 italic mb-6">No bio available.</p>
              )}

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-500">Branch</span>
                  <span className="text-slate-200">{mentor.branch}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-500">Graduation</span>
                  <span className="text-slate-200">{mentor.graduation_year}</span>
                </div>
                {mentor.package > 0 && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-500">Package</span>
                    <span className="text-emerald-400 font-medium">{mentor.package} LPA</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Resources */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white font-heading">Shared Resources</h2>
            <div className="space-y-4">
              {resources?.map((resource) => (
                <div key={resource.id} className="card p-6 hover:bg-white/5 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">{resource.title}</h3>
                      {resource.description && <p className="text-slate-400 mb-4">{resource.description}</p>}
                      <div className="flex gap-3 text-sm">
                        {resource.category && <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 border border-white/5">{resource.category}</span>}
                        <span className="text-slate-500 py-1">{new Date(resource.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm"
                    >
                      Access
                    </a>
                  </div>
                </div>
              ))}
              {resources && resources.length === 0 && (
                <div className="card p-12 text-center text-slate-500 italic border-dashed">
                  No resources shared yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
