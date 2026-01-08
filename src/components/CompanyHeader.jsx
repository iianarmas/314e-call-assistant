/**
 * CompanyHeader - Display company context at top of call page
 * Shows company name, DMS, EHR, and trigger information
 */
export default function CompanyHeader({ company }) {
  if (!company) {
    return (
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="text-gray-500">Loading company information...</div>
      </div>
    )
  }

  const hasTrigger = company.trigger_type && company.trigger_type !== 'None'

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {company.industry && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Industry:</span>
                {company.industry}
              </span>
            )}
            {company.size && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Size:</span>
                {company.size}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <span className="font-medium text-gray-700">DMS:</span>
              <span className="text-gray-900">{company.dms_system || 'Not specified'}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium text-gray-700">EHR:</span>
              <span className="text-gray-900">{company.ehr_system || 'Not specified'}</span>
            </span>
            {hasTrigger && (
              <span className="flex items-center gap-1">
                <span className="font-medium text-gray-700">Trigger:</span>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                  {company.trigger_type}
                </span>
                {company.trigger_timeline && (
                  <span className="text-gray-600">({company.trigger_timeline})</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Company Notes - Collapsible */}
      {company.company_notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <details className="group">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Company Notes
            </summary>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap pl-5">
              {company.company_notes}
            </p>
          </details>
        </div>
      )}

      {/* Trigger Details - Collapsible */}
      {hasTrigger && company.trigger_details && (
        <div className="mt-2">
          <details className="group">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Trigger Details
            </summary>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap pl-5">
              {company.trigger_details}
            </p>
          </details>
        </div>
      )}
    </div>
  )
}
