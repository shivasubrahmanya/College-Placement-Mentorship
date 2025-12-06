import { useQuery } from '@tanstack/react-query'
import { leaderboardApi } from '../api/leaderboard'

export default function Leaderboard() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardApi.get({ limit: 100 }),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-indigo-400">Loading top performers...</div>
      </div>
    )
  }

  const topThree = entries?.slice(0, 3) || []
  const rest = entries?.slice(3) || []

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-orange-500' // Gold
      case 1: return 'from-slate-300 to-slate-400' // Silver
      case 2: return 'from-amber-600 to-amber-700' // Bronze
      default: return 'from-indigo-600 to-violet-600'
    }
  }

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4">
          Hall of Fame
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Recognizing our top contributors. Points are awarded for sharing resources (10pts), creating engaging posts (5pts), and securing top placements (2pts/LPA).
        </p>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-16 animate-fade-in-up">
          {/* Silver - 2nd Place */}
          {topThree[1] && (
            <div className="order-2 md:order-1 flex-1 max-w-[280px] w-full relative">
              <div className="absolute inset-0 bg-slate-400/20 blur-[50px] rounded-full" />
              <div className="relative card p-6 border-slate-400/30 flex flex-col items-center transform transition-transform hover:-translate-y-2 duration-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 ring-4 ring-slate-400/20">
                  2
                </div>
                <h3 className="text-xl font-bold text-white mb-1 font-heading">{topThree[1].user.full_name}</h3>
                <p className="text-slate-400 text-sm mb-4">Silver Medalist</p>
                <div className="text-2xl font-bold text-slate-200">{topThree[1].points.toFixed(0)} <span className="text-xs text-slate-500 font-normal">pts</span></div>
              </div>
            </div>
          )}

          {/* Gold - 1st Place */}
          {topThree[0] && (
            <div className="order-1 md:order-2 flex-1 max-w-[320px] w-full relative z-10 -mt-6">
              <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full" />
              <div className="relative card p-8 border-yellow-500/30 flex flex-col items-center bg-gradient-to-b from-yellow-500/10 to-transparent transform transition-transform hover:-translate-y-2 duration-300">
                <div className="absolute -top-6 text-5xl">👑</div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl mb-4 ring-4 ring-yellow-500/30 mt-4">
                  1
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 font-heading">{topThree[0].user.full_name}</h3>
                <p className="text-yellow-400 text-sm mb-4">Champion</p>
                <div className="text-4xl font-bold text-white">{topThree[0].points.toFixed(0)} <span className="text-sm text-slate-400 font-normal">pts</span></div>
              </div>
            </div>
          )}

          {/* Bronze - 3rd Place */}
          {topThree[2] && (
            <div className="order-3 flex-1 max-w-[280px] w-full relative">
              <div className="absolute inset-0 bg-amber-600/20 blur-[50px] rounded-full" />
              <div className="relative card p-6 border-amber-600/30 flex flex-col items-center transform transition-transform hover:-translate-y-2 duration-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 ring-4 ring-amber-600/20">
                  3
                </div>
                <h3 className="text-xl font-bold text-white mb-1 font-heading">{topThree[2].user.full_name}</h3>
                <p className="text-amber-500/80 text-sm mb-4">Bronze Medalist</p>
                <div className="text-2xl font-bold text-slate-200">{topThree[2].points.toFixed(0)} <span className="text-xs text-slate-500 font-normal">pts</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rest of the Leaderboard */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menter</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Resources</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Posts</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rest.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-white">
                    #{index + 4}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{entry.user.full_name}</div>
                    {(entry.package > 0) && (
                      <div className="text-xs text-slate-500 mt-0.5">Package: {entry.package} LPA</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 text-center">
                    {entry.total_resources}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 text-center">
                    {entry.total_posts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-400 text-right group-hover:text-indigo-300">
                    {entry.points.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
