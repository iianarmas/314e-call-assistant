/**
 * Job Title Constants
 *
 * Defines available job titles by product and maps them to appropriate call flows.
 * Used in CallPrepHeader for dynamic dropdown population.
 */

export const JOB_TITLES = {
  Dexit: [
    'HIM Manager',
    'HIM Director',
    'Revenue Cycle Manager',
    'Revenue Cycle Director',
    'IT/Applications Manager',
    'IT/Applications Director'
  ],
  Muspell: [
    'Project Manager',
    'Project Director',
    'Program Manager',
    'Program Director',
    'Purchasing Manager',
    'Purchasing Director',
    'HIM Manager',
    'HIM Director',
    'Revenue Cycle Manager',
    'Revenue Cycle Director',
    'IT Manager',
    'IT Director',
    'Operations Manager',
    'Operations Director'
    // NOTE: No C-level titles (CFO, CIO, CEO) for Muspell
  ]
}

/**
 * Maps job titles to appropriate call flow approaches
 * Used to auto-select call flow when user picks a title
 */
export const TITLE_TO_CALL_FLOW = {
  Dexit: {
    'HIM Manager': ['HIM'],
    'HIM Director': ['HIM'],
    'Revenue Cycle Manager': ['Revenue Cycle'],
    'Revenue Cycle Director': ['Revenue Cycle'],
    'IT/Applications Manager': ['IT'],
    'IT/Applications Director': ['IT']
  },
  Muspell: {
    'Project Manager': ['Project'],
    'Project Director': ['Project'],
    'Program Manager': ['Program'],
    'Program Director': ['Program'],
    'Purchasing Manager': ['Purchasing'],
    'Purchasing Director': ['Purchasing'],
    'HIM Manager': ['HIM'],
    'HIM Director': ['HIM'],
    'Revenue Cycle Manager': ['Revenue Cycle'],
    'Revenue Cycle Director': ['Revenue Cycle'],
    'IT Manager': ['IT'],
    'IT Director': ['IT'],
    'Operations Manager': ['Operations'],
    'Operations Director': ['Operations']
  }
}

/**
 * Helper function to get suggested call flow for a given product and title
 */
export const getSuggestedCallFlow = (product, title) => {
  const flows = TITLE_TO_CALL_FLOW[product]?.[title]
  return flows && flows.length > 0 ? flows[0] : null
}
