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
    company = {},
    contact = {},
    rep = {},
    product = {},
    scriptContext = {},
    ehr = '',
    dms = '',
    trigger = '',
  } = context

  // Build replacement map
  const replacements = {
    // Company information
    'company_name': company.name || '[Company Name]',
    'company_industry': company.industry || '[Industry]',
    'company_size': company.size || '[Size]',
    'company.name': company.name || '[Company Name]',
    'company.industry': company.industry || '[Industry]',
    'company.size': company.size || '[Size]',

    // Systems information
    'ehr_system': company.ehr_system || ehr || '[EHR System]',
    'dms_system': company.dms_system || dms || '[DMS System]',
    'company.ehr_system': company.ehr_system || ehr || '[EHR System]',
    'company.dms_system': company.dms_system || dms || '[DMS System]',

    // Trigger information (Muspell)
    'trigger_type': company.trigger_type || trigger || '[Trigger Type]',
    'trigger_details': company.trigger_details || '[Trigger Details]',
    'trigger_timeline': company.trigger_timeline || '[Timeline]',
    'company.trigger_type': company.trigger_type || trigger || '[Trigger Type]',
    'company.trigger_details': company.trigger_details || '[Trigger Details]',
    'company.trigger_timeline': company.trigger_timeline || '[Timeline]',

    // Contact information (session only - not from database)
    'contact_name': contact.name || '[Contact Name]',
    'contact_title': contact.title || '[Title]',
    'contact_first_name': contact.first_name || contact.name?.split(' ')[0] || '[First Name]',
    'contact_last_name': contact.last_name || contact.name?.split(' ').slice(1).join(' ') || '[Last Name]',
    'contact.name': contact.name || '[Contact Name]',
    'contact.first_name': contact.first_name || contact.name?.split(' ')[0] || '[First Name]',
    'contact.last_name': contact.last_name || contact.name?.split(' ').slice(1).join(' ') || '[Last Name]',
    'contact.full_name': getFullName(contact),
    'contact.title': contact.title || '[Title]',
    'contact.organization': company.name || '[Organization]',

    // Sales rep information (from settings or defaults)
    'rep_name': rep.name || 'Chris Armas',
    'rep_first_name': rep.first_name || rep.name?.split(' ')[0] || 'Chris',
    'rep_company': rep.company || 'Dexit Solutions',
    'rep.name': rep.name || 'Chris Armas',
    'rep.first_name': rep.first_name || rep.name?.split(' ')[0] || 'Chris',
    'rep.company': rep.company || 'Dexit Solutions',

    // Product information
    'product_name': product.name || '[Product]',
    'product.name': product.name || '[Product]',

    // Technical context (parsed from notes or company data)
    'context.ehr': company.ehr_system || ehr || scriptContext.ehr || '[EHR System]',
    'context.dms': company.dms_system || dms || scriptContext.dms || '[DMS System]',
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
 * Combines company, contact (session), rep settings, and parsed notes
 */
export function buildReplacementContext(company, contact, notes = '', product = 'Dexit') {
  const rep = getRepSettings()
  const scriptContext = parseNotesContext(notes)

  return {
    company: company || {},
    contact: contact || {},
    rep,
    product: {
      name: product || 'Dexit'
    },
    ehr: company?.ehr_system || scriptContext.ehr || '',
    dms: company?.dms_system || scriptContext.dms || '',
    trigger: company?.trigger_type || '',
    scriptContext
  }
}

/**
 * Example usage (updated for company-first architecture):
 *
 * const script = "Hi {{contact_first_name}}, this is {{rep_name}} from {{rep_company}}. " +
 *                "I know {{company_name}} uses {{ehr_system}} for their EHR."
 * const context = buildReplacementContext(company, contact, notes, product)
 * const personalized = replaceScriptVariables(script, context)
 *
 * // Result: "Hi John, this is Chris Armas from Dexit Solutions. " +
 * //         "I know Memorial Hospital uses Epic for their EHR."
 */
