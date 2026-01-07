/**
 * Detect competitor mentions in objections
 */

const COMPETITORS = {
  dexit: [
    'onbase',
    'epic gallery',
    'cerner wqm',
    'hyland',
    'documentum',
    'sharepoint'
  ],
  muspell: [
    'archival solution',
    'archiving system',
    'data conversion',
    'migration vendor'
  ]
}

export function detectCompetitor(text, product) {
  if (!text) return null

  const lowerText = text.toLowerCase()
  const competitors = COMPETITORS[product.toLowerCase()] || []

  for (const competitor of competitors) {
    if (lowerText.includes(competitor)) {
      return competitor
    }
  }

  return null
}

/**
 * Check if objection mentions existing solution
 */
export function hasExistingSolution(text) {
  const patterns = [
    'already have',
    'already using',
    'current solution',
    'we use',
    "we're using",
    'existing system'
  ]

  const lowerText = text.toLowerCase()
  return patterns.some(pattern => lowerText.includes(pattern))
}
