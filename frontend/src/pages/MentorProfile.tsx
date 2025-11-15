import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { mentorsApi } from '../api/mentors'
import { Link } from 'react-router-dom'

export default function MentorProfile() {
  const { id } = useParams<{ id: string }>()
  const mentorId = parseInt(id || '0')

  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentor', mentorId],
    queryFn: () => mentorsApi.get(mentorId),
    enabled: !!mentorId,
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading mentor profile...</div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Branch</h3>
            <p className="text-lg text-gray-900">{mentor.branch}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Graduation Year</h3>
            <p className="text-lg text-gray-900">{mentor.graduation_year}</p>
          </div>
          {mentor.current_company && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Current Company</h3>
              <p className="text-lg text-gray-900">{mentor.current_company}</p>
            </div>
          )}
          {mentor.package > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Package</h3>
              <p className="text-lg text-gray-900">{mentor.package} LPA</p>
            </div>
          )}
        </div>

        {mentor.bio && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
            <p className="text-gray-900">{mentor.bio}</p>
          </div>
        )}

        <div className="flex gap-4">
          {mentor.linkedin_url && (
            <a
              href={mentor.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              LinkedIn
            </a>
          )}
          {mentor.github_url && (
            <a
              href={mentor.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              GitHub
            </a>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <Link
            to={`/chat/${mentor.user_id}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send Message
          </Link>
        </div>
      </div>
    </div>
  )
}

