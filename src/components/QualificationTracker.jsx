import { useState, useEffect } from 'react'

export default function QualificationTracker({ onDataChange }) {
  const [data, setData] = useState({
    ehr_system: '',
    dms_system: '',
    team_size: '',
    doc_volume: '',
    challenges: '',
    manual_processes: null
  })

  // Calculate completion
  const completedItems = Object.values(data).filter(v => v !== '' && v !== null).length
  const totalItems = 6
  const isDemoEligible = completedItems >= 4

  // Notify parent of changes
  useEffect(() => {
    onDataChange?.(data, completedItems, isDemoEligible)
  }, [data])

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const commonEHRs = ['Epic', 'Cerner', 'Allscripts', 'Meditech', 'Other']
  const commonDMS = ['OnBase', 'Epic Gallery', 'Cerner WQM', 'Other']

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Dexit Qualification</h3>

        {/* Progress indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">{completedItems}/6 items collected</span>
            {isDemoEligible && (
              <span className="text-sm font-medium text-green-600">✓ Demo Eligible!</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isDemoEligible ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${(completedItems / totalItems) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* EHR System */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            {data.ehr_system && <span className="text-green-600 mr-1">☑</span>}
            {!data.ehr_system && <span className="text-gray-400 mr-1">☐</span>}
            EHR System
          </label>
          <select
            value={data.ehr_system}
            onChange={(e) => handleChange('ehr_system', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select EHR...</option>
            {commonEHRs.map(ehr => (
              <option key={ehr} value={ehr}>{ehr}</option>
            ))}
          </select>
        </div>

        {/* DMS System */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            {data.dms_system && <span className="text-green-600 mr-1">☑</span>}
            {!data.dms_system && <span className="text-gray-400 mr-1">☐</span>}
            DMS System
          </label>
          <select
            value={data.dms_system}
            onChange={(e) => handleChange('dms_system', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select DMS...</option>
            {commonDMS.map(dms => (
              <option key={dms} value={dms}>{dms}</option>
            ))}
          </select>
        </div>

        {/* Team Size */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            {data.team_size && <span className="text-green-600 mr-1">☑</span>}
            {!data.team_size && <span className="text-gray-400 mr-1">☐</span>}
            Team Size
          </label>
          <input
            type="number"
            value={data.team_size}
            onChange={(e) => handleChange('team_size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 12"
          />
        </div>

        {/* Document Volume */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            {data.doc_volume && <span className="text-green-600 mr-1">☑</span>}
            {!data.doc_volume && <span className="text-gray-400 mr-1">☐</span>}
            Document Volume
          </label>
          <input
            type="text"
            value={data.doc_volume}
            onChange={(e) => handleChange('doc_volume', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 500/day or 2000/week"
          />
        </div>

        {/* Challenges */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            {data.challenges && <span className="text-green-600 mr-1">☑</span>}
            {!data.challenges && <span className="text-gray-400 mr-1">☐</span>}
            Challenges / Pain Points
          </label>
          <textarea
            value={data.challenges}
            onChange={(e) => handleChange('challenges', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What challenges did they mention?"
          />
        </div>

        {/* Manual Processes */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            {data.manual_processes !== null && <span className="text-green-600 mr-1">☑</span>}
            {data.manual_processes === null && <span className="text-gray-400 mr-1">☐</span>}
            Manual Processes?
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleChange('manual_processes', true)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                data.manual_processes === true
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleChange('manual_processes', false)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                data.manual_processes === false
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
