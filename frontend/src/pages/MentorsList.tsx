import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { mentorsApi, Branch, BranchValues } from '../api/mentors'

export default function MentorsList() {
  const [branch, setBranch] = useState<Branch | ''>('')
  const [graduationYear, setGraduationYear] = useState('')
  const [verified, setVerified] = useState<boolean | ''>('')

  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors', branch, graduationYear, verified],
    queryFn: () =>
      mentorsApi.list({
        branch: branch || undefined,
        graduation_year: graduationYear ? parseInt(graduationYear) : undefined,
        verified: verified !== '' ? verified : undefined,
      }),
  })

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Mentors</h1>
        
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as Branch | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Branches</option>
                {BranchValues.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g., 2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
              <select
                value={verified === '' ? '' : verified.toString()}
                onChange={(e) =>
                  setVerified(e.target.value === '' ? '' : e.target.value === 'true')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading mentors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors?.map((mentor) => (
            <Link
              key={mentor.id}
              to={`/mentors/${mentor.id}`}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {mentor.user.full_name}
                </h3>
                {mentor.verified && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{mentor.user.email}</p>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Branch: {mentor.branch}</p>
                <p>Graduation Year: {mentor.graduation_year}</p>
                {mentor.current_company && <p>Company: {mentor.current_company}</p>}
                {mentor.package > 0 && <p>Package: {mentor.package} LPA</p>}
              </div>
              {mentor.bio && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{mentor.bio}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {mentors && mentors.length === 0 && (
        <div className="text-center py-8 text-gray-500">No mentors found</div>
      )}
    </div>
  )
}

