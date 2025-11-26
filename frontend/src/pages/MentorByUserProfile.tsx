import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { mentorsApi } from '../api/mentors'
import { resourcesApi } from '../api/resources'

export default function MentorByUserProfile() {
  const { userId } = useParams<{ userId: string }>()
  const uid = parseInt(userId || '0')

  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentorByUser', uid],
    queryFn: () => mentorsApi.getByUser(uid),
    enabled: !!uid,
  })

  const { data: resources } = useQuery({
    queryKey: ['mentorResources', uid],
    queryFn: () => resourcesApi.list({ user_id: uid, limit: 50 }),
    enabled: !!uid,
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading mentor...</div>
  }

  if (!mentor) {
    return <div className="text-center py-8">Mentor not found</div>
  }

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mentor.user.full_name}
            </h1>
            <p className="text-gray-600">{mentor.user.email}</p>
          </div>
          {mentor.verified && (
            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
              Verified Mentor
            </span>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shared Resources</h2>
          <div className="space-y-4">
            {resources?.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-gray-600 mb-2 whitespace-pre-wrap">{resource.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {resource.category && (
                        <span className="px-2 py-1 bg-gray-100 rounded">{resource.category}</span>
                      )}
                      <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Open Link
                  </a>
                </div>
              </div>
            ))}
            {resources && resources.length === 0 && (
              <div className="text-center py-8 text-gray-500">No resources shared yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
