import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { resourcesApi, ResourceTypeValues } from '../api/resources'

export default function AllResources() {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<typeof ResourceTypeValues[number] | ''>('')
  const [q, setQ] = useState('')

  const { data: resources, isLoading } = useQuery({
    queryKey: ['allResources', category, type],
    queryFn: () =>
      resourcesApi.list({
        category: category || undefined,
        resource_type: type || undefined,
        limit: 100,
      }),
  })

  const filtered = (resources || []).filter((r) => {
    const text = `${r.title} ${r.user.full_name} ${r.category || ''}`.toLowerCase()
    return text.includes(q.toLowerCase())
  })

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Resources</h1>
        <div className="flex gap-2">
          <Link to="/resources" className="px-3 py-2 border rounded-md border-gray-300 hover:bg-gray-50">Add Resource</Link>
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-2 border rounded-md ${view === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-2 border rounded-md ${view === 'table' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}
          >
            Table
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or mentor"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., DSA, Web"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {ResourceTypeValues.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading resources...</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{resource.title}</h3>
                  {resource.description && (
                    <p className="text-gray-600 mb-2 line-clamp-3">{resource.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Link to={`/mentors/user/${resource.user_id}`} className="text-blue-600 hover:text-blue-800">
                      by {resource.user?.full_name || 'Unknown'}
                    </Link>
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
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((resource) => (
                <tr key={resource.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{resource.title}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link to={`/mentors/user/${resource.user_id}`} className="text-blue-600 hover:text-blue-800">
                      {resource.user?.full_name || 'Unknown'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{String((resource as any).resource_type).split('_').map((s) => s[0] + s.slice(1).toLowerCase()).join(' ')}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{resource.category || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(resource.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">No resources found</div>
          )}
        </div>
      )}
    </div>
  )
}
