import { JOB_TITLES, getSuggestedCallFlow } from '../constants/jobTitles'

/**
 * CallPrepHeader - Call preparation inputs
 * Contact name (free text), Product, Job Title, Call Flow (all dropdowns)
 * No database saves - session only
 */
export default function CallPrepHeader({
  contactName,
  product,
  jobTitle,
  callFlow,
  onContactNameChange,
  onProductChange,
  onJobTitleChange,
  onCallFlowChange
}) {
  // When product changes, reset title and flow
  const handleProductChange = (newProduct) => {
    onProductChange(newProduct)
    onJobTitleChange('') // Reset title
    onCallFlowChange('') // Reset flow
  }

  // When title changes, auto-select suggested call flow
  const handleTitleChange = (newTitle) => {
    onJobTitleChange(newTitle)

    // Auto-select call flow based on title
    const suggestedFlow = getSuggestedCallFlow(product, newTitle)
    if (suggestedFlow) {
      onCallFlowChange(suggestedFlow)
    }
  }

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="grid grid-cols-4 gap-4">
        {/* Contact Name - Free text input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Name
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => onContactNameChange(e.target.value)}
            placeholder="John Smith"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Not saved to database
          </p>
        </div>

        {/* Product - Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product *
          </label>
          <select
            value={product}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select product...</option>
            <option value="Dexit">Dexit</option>
            <option value="Muspell">Muspell</option>
          </select>
        </div>

        {/* Job Title - Dropdown (changes based on product) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <select
            value={jobTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!product}
            required
          >
            <option value="">Select title...</option>
            {product && JOB_TITLES[product]?.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
          {!product && (
            <p className="text-xs text-gray-500 mt-1">
              Select product first
            </p>
          )}
        </div>

        {/* Call Flow - Auto-selected based on title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Call Flow *
          </label>
          <input
            type="text"
            value={callFlow}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            placeholder="Auto-selected"
          />
          {!jobTitle && (
            <p className="text-xs text-gray-500 mt-1">
              Select job title first
            </p>
          )}
          {jobTitle && callFlow && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Auto-selected
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
