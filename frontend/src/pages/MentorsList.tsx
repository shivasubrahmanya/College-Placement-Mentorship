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
    refetchInterval: 2000,
  })

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6 font-heading">Find a Mentor</h1>

        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as Branch | '')}
                className="input-field"
              >
                <option value="" className="bg-slate-800">All Branches</option>
                {BranchValues.map((b) => (
                  <option key={b} value={b} className="bg-slate-800">
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Graduation Year
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g., 2020"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Verified</label>
              <select
                value={verified === '' ? '' : verified.toString()}
                onChange={(e) =>
                  setVerified(e.target.value === '' ? '' : e.target.value === 'true')
                }
                className="input-field"
              >
                <option value="" className="bg-slate-800">All</option>
                <option value="true" className="bg-slate-800">Verified</option>
                <option value="false" className="bg-slate-800">Not Verified</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse text-indigo-400">Loading mentors...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors?.map((mentor) => (
            <Link
              key={mentor.id}
              to={`/mentors/${mentor.id}`}
              className="card p-6 hover:scale-[1.02] hover:border-indigo-500/50 group block animate-fade-in-up"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-primary transition-colors font-heading">
                  {mentor.user.full_name}
                </h3>
                {mentor.verified && (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-500/20">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-slate-400 mb-4 text-sm font-medium">{mentor.user.email}</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-500">Branch</span>
                  <span>{mentor.branch}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-500">Graduation</span>
                  <span>{mentor.graduation_year}</span>
                </div>
                {mentor.current_company && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-slate-500">Company</span>
                    <span className="font-semibold text-indigo-400">{mentor.current_company}</span>
                  </div>
                )}
                {mentor.package > 0 && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Package</span>
                    <span>{mentor.package} LPA</span>
                  </div>
                )}
              </div>
              {mentor.bio && (
                <p className="mt-4 text-sm text-slate-400 line-clamp-2 italic border-t border-white/10 pt-4">
                  "{mentor.bio}"
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {mentors && mentors.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-slate-400 text-lg">No mentors found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
