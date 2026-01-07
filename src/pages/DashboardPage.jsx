import { useAnalytics } from '../hooks/useAnalytics'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { stats, recentCalls, loading, error } = useAnalytics()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error loading dashboard</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Overview of your calling activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Calls */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Calls</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalCalls}</div>
          </div>

          {/* Calls Today */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Calls Today</div>
            <div className="text-2xl font-bold text-gray-900">{stats.callsToday}</div>
          </div>

          {/* Calls This Week */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Calls This Week</div>
            <div className="text-2xl font-bold text-gray-900">{stats.callsThisWeek}</div>
          </div>

          {/* Demo Rate */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Demo Rate</div>
            <div className="text-2xl font-bold text-green-600">{stats.demoRate}%</div>
          </div>
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Discovery Rate */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Discovery Rate</div>
            <div className="text-2xl font-bold text-blue-600">{stats.discoveryRate}%</div>
          </div>

          {/* Product Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Product Breakdown</div>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <div className="text-xs text-gray-500">Dexit</div>
                <div className="text-lg font-bold text-blue-600">{stats.dexitCalls}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Muspell</div>
                <div className="text-lg font-bold text-purple-600">{stats.muspellCalls}</div>
              </div>
            </div>
          </div>

          {/* Avg Qualification */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Avg Qualification Items</div>
            <div className="text-2xl font-bold text-gray-900">{stats.avgQualificationItems}</div>
            <div className="text-xs text-gray-500 mt-1">Dexit calls only</div>
          </div>
        </div>

        {/* Common Objections */}
        {stats.commonObjections.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Common Objections</h2>
            <div className="space-y-2">
              {stats.commonObjections.map((obj, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="text-sm text-gray-900">{obj.objection}</div>
                  <div className="text-sm font-medium text-gray-600">{obj.count} times</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Calls */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>
            <button
              onClick={() => navigate('/contacts')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All Contacts
            </button>
          </div>

          {recentCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No calls yet. Start calling from your contacts list!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Outcome</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {call.contacts?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {call.contacts?.company || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          call.contacts?.product === 'Dexit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {call.contacts?.product || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {call.outcome ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            call.outcome === 'demo'
                              ? 'bg-green-100 text-green-800'
                              : call.outcome === 'discovery'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {call.outcome === 'demo' ? 'Demo' : call.outcome === 'discovery' ? 'Discovery' : call.outcome}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(call.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
