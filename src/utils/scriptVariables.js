/**
 * Script Variable Replacement Utility
 * Handles dynamic variable replacement in call flow scripts
 * Format: {{variable.name}} -> actual value
 */

/**
 * Replace all variables in script content
 * @param {string} content - Script content with {{variables}}
 * @param {object} context - Replacement context
 * @returns {string} - Content with variables replaced
 */
export function replaceScriptVariables(content, context = {}) {
  if (!content) return content

  const {
    contact = {},
    rep = {},
    product = {},
    scriptContext = {},
  } = context

  // Build replacement map
  const replacements = {
    // Contact information
    'contact.first_name': contact.first_name || contact.name?.split(' ')[0] || '[First Name]',
    'contact.last_name': contact.last_name || contact.name?.split(' ').slice(1).join(' ') || '[Last Name]',
    'contact.full_name': getFullName(contact),
    'contact.title': contact.title || '[Title]',
    'contact.organization': contact.organization || contact.company || '[Organization]',

    // Sales rep information (from settings or defaults)
    'rep.name': rep.name || 'Sarah Johnson', // Default rep name
    'rep.first_name': rep.first_name || rep.name?.split(' ')[0] || 'Sarah',
    'rep.company': rep.company || 'Dexit Solutions',

    // Product information
    'product.name': product.name || contact.product || 'Dexit',

    // Technical context (parsed from notes)
    'context.ehr': scriptContext.ehr || '[EHR System]',
    'context.dms': scriptContext.dms || '[DMS System]',
    'context.volume': scriptContext.volume || '[Volume]',
  }

  // Replace all {{variable}} patterns
  let result = content

  Object.entries(replacements).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(pattern, value)
  })

  // Clean up any remaining unreplaced variables
  // Replace {{anything.else}} with just [placeholder]
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    console.warn(`Unreplaced variable: ${varName}`)
    return `[${varName}]`
  })

  return result
}

/**
 * Get full name from contact
 */
function getFullName(contact) {
  if (contact.first_name && contact.last_name) {
    return `${contact.first_name} ${contact.last_name}`
  }
  if (contact.name) {
    return contact.name
  }
  return '[Contact Name]'
}

/**
 * Parse context from notes
 * Extracts EHR, DMS, volume, etc. from free-form notes
 */
export function parseNotesContext(notes) {
  if (!notes) return {}

  const lower = notes.toLowerCase()
  const context = {}

  // Extract EHR
  const ehrMatch = notes.match(/ehr\s*[=:]\s*(\w+)/i)
  if (ehrMatch) {
    context.ehr = ehrMatch[1]
  } else {
    // Check for common EHR names
    const ehrs = ['epic', 'cerner', 'meditech', 'athena', 'allscripts', 'eclinicalworks']
    for (const ehr of ehrs) {
      if (lower.includes(ehr)) {
        context.ehr = ehr.charAt(0).toUpperCase() + ehr.slice(1)
        break
      }
    }
  }

  // Extract DMS
  const dmsMatch = notes.match(/dms\s*[=:]\s*(\w+)/i)
  if (dmsMatch) {
    context.dms = dmsMatch[1]
  } else if (lower.includes('no dms') || lower.includes('no document')) {
    context.dms = 'none'
  } else {
    const dmsOptions = ['onbase', 'hyland', 'imagecast']
    for (const dms of dmsOptions) {
      if (lower.includes(dms)) {
        context.dms = dms.charAt(0).toUpperCase() + dms.slice(1)
        break
      }
    }
  }

  // Extract volume
  const volumeMatch = notes.match(/(\d+)\s*(?:docs?|documents?|pages?|faxes?)?\s*(?:\/|per)?\s*(?:day|week)/i)
  if (volumeMatch) {
    context.volume = volumeMatch[0]
  }

  return context
}

/**
 * Get sales rep settings from localStorage
 * Users can configure their name and company
 */
export function getRepSettings() {
  try {
    const settings = localStorage.getItem('rep_settings')
    if (settings) {
      return JSON.parse(settings)
    }
  } catch (err) {
    console.error('Error loading rep settings:', err)
  }

  // Default settings
  return {
    name: 'Chris A.',
    first_name: 'Chris',
    company: '314e Corporation'
  }
}

/**
 * Save sales rep settings to localStorage
 */
export function saveRepSettings(settings) {
  try {
    localStorage.setItem('rep_settings', JSON.stringify(settings))
    return { success: true }
  } catch (err) {
    console.error('Error saving rep settings:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Build complete replacement context
 * Combines contact, rep settings, and parsed notes
 */
export function buildReplacementContext(contact, notes = '') {
  const rep = getRepSettings()
  const scriptContext = parseNotesContext(notes)

  return {
    contact,
    rep,
    product: {
      name: contact?.product || 'Dexit'
    },
    scriptContext
  }
}

/**
 * Example usage:
 *
 * const script = "Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}."
 * const context = buildReplacementContext(contact, notes)
 * const personalized = replaceScriptVariables(script, context)
 *
 * // Result: "Hi John, this is Sarah Johnson from Dexit Solutions."
 */
