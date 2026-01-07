import { useState, useEffect } from 'react'
import { useCallLog } from '../hooks/useCallLog'

export default function CallHistoryModal({ isOpen, onClose, contact }) {
  const { getCallHistory } = useCallLog()
  const [callHistory, setCallHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState(null)

  useEffect(() => {
    if (isOpen && contact) {
      loadHistory()
    }
  }, [isOpen, contact])

  const loadHistory = async () => {
    setLoading(true)
    const result = await getCallHistory(contact.id)
    if (result.success) {
      setCallHistory(result.data)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Call History</h2>
            <p className="text-sm text-gray-600 mt-1">
              {contact?.name} - {contact?.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading call history...</p>
            </div>
          ) : callHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No calls recorded yet for this contact.
            </div>
          ) : (
            <div className="space-y-4">
              {callHistory.map((call) => (
                <div
                  key={call.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
                  onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
                >
                  {/* Call Summary */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(call.created_at).toLocaleDateString()} at {new Date(call.created_at).toLocaleTimeString()}
                      </div>
                      <div className="mt-1">
                        {call.outcome && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            call.outcome === 'demo'
                              ? 'bg-green-100 text-green-800'
                              : call.outcome === 'discovery'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {call.outcome === 'demo' ? 'Demo Scheduled' : call.outcome === 'discovery' ? 'Discovery Scheduled' : call.outcome}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm">
                      {selectedCall?.id === call.id ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {selectedCall?.id === call.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Qualification Data (Dexit) */}
                      {call.qualification_data && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Qualification Data</h4>
                          <div className="bg-gray-50 rounded p-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-600">Completed Items:</span>{' '}
                                <span className="font-medium">{call.qualification_data.completedItems || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Demo Eligible:</span>{' '}
                                <span className="font-medium">{call.qualification_data.isDemoEligible ? 'Yes' : 'No'}</span>
                              </div>
                            </div>
                            {call.qualification_data.emr && (
                              <div className="mt-2">
                                <span className="text-gray-600">EMR:</span>{' '}
                                <span className="font-medium">{call.qualification_data.emr}</span>
                              </div>
                            )}
                            {call.qualification_data.manualProcesses !== undefined && (
                              <div className="mt-2">
                                <span className="text-gray-600">Manual Processes:</span>{' '}
                                <span className="font-medium">{call.qualification_data.manualProcesses ? 'Yes' : 'No'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes (Muspell) */}
                      {call.notes && Object.keys(call.notes).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                          <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
                            {Object.entries(call.notes).map(([key, value]) => (
                              value && (
                                <div key={key}>
                                  <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                                  <span className="text-gray-900">{value}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Objections Handled */}
                      {call.objections_handled && call.objections_handled.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Objections Handled ({call.objections_handled.length})
                          </h4>
                          <div className="space-y-2">
                            {call.objections_handled.map((obj, index) => (
                              <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                                <div className="font-medium text-gray-900 mb-1">
                                  {obj.objection}
                                </div>
                                <div className="text-gray-600">
                                  {obj.response?.substring(0, 150)}
                                  {obj.response?.length > 150 && '...'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(obj.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
