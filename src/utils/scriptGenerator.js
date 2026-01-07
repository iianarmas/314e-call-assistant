/**
 * Select the appropriate base script based on contact data
 */

export function selectBaseScript(contact, scripts) {
  if (!scripts) return null

  const { product, title, trigger_type } = contact

  // Dexit script selection
  if (product === 'Dexit') {
    // Check if title indicates IT role
    const isIT = title?.toLowerCase().includes('it') ||
                 title?.toLowerCase().includes('information technology') ||
                 title?.toLowerCase().includes('director of applications') ||
                 title?.toLowerCase().includes('technology')

    // Check if provider/ambulatory organization
    const isProvider = title?.toLowerCase().includes('provider') ||
                      title?.toLowerCase().includes('ambulatory') ||
                      title?.toLowerCase().includes('physician')

    if (isProvider) {
      return {
        type: 'dexit-ambulatory',
        section: 'opening',
        content: scripts.dexitAmbulatory?.openings?.['opening'] || scripts.dexitAmbulatory?.raw
      }
    } else if (isIT) {
      return {
        type: 'dexit-it',
        section: 'opening-it',
        content: scripts.dexitMain?.openings?.['opening-it'] || extractFirstParagraph(scripts.dexitMain?.raw)
      }
    } else {
      // Default to HIM approach
      return {
        type: 'dexit-him',
        section: 'opening-him',
        content: scripts.dexitMain?.openings?.['opening-him'] || extractFirstParagraph(scripts.dexitMain?.raw)
      }
    }
  }

  // Muspell script selection
  if (product === 'Muspell') {
    if (trigger_type) {
      switch (trigger_type) {
        case 'Migration':
          // Check trigger details for specific migration type
          const triggerDetails = contact.trigger_details?.toLowerCase() || ''
          if (triggerDetails.includes('cerner') && triggerDetails.includes('epic')) {
            return {
              type: 'muspell-cerner-to-epic',
              section: 'opening-cerner-to-epic',
              content: scripts.muspell?.openings?.['opening-cerner-to-epic']
            }
          } else if (triggerDetails.includes('epic')) {
            return {
              type: 'muspell-epic-to-epic',
              section: 'opening-epic-to-epic',
              content: scripts.muspell?.openings?.['opening-epic-to-epic']
            }
          } else {
            return {
              type: 'muspell-non-epic',
              section: 'opening-non-epic',
              content: scripts.muspell?.openings?.['opening-non-epic']
            }
          }

        case 'Merger':
        case 'Acquisition':
          return {
            type: 'muspell-merger',
            section: 'opening-merger',
            content: scripts.muspell?.openings?.['opening-merger']
          }

        case 'Upgrade':
          return {
            type: 'muspell-epic-to-epic',
            section: 'opening-epic-to-epic',
            content: scripts.muspell?.openings?.['opening-epic-to-epic']
          }

        default:
          return {
            type: 'muspell-generic',
            section: 'generic',
            content: scripts.muspell?.raw
          }
      }
    }

    // No trigger specified - use generic opening
    return {
      type: 'muspell-generic',
      section: 'generic',
      content: scripts.muspell?.openings?.['opening-non-epic'] || scripts.muspell?.raw
    }
  }

  return null
}

/**
 * Extract first meaningful paragraph from raw script
 */
function extractFirstParagraph(text) {
  if (!text) return ''

  const lines = text.split('\n')
  let result = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('#') || trimmed.startsWith('---')) continue
    if (trimmed.length < 20) continue // Skip headers/labels

    result.push(trimmed)

    // Stop after getting 3-5 lines of actual content
    if (result.length >= 3) break
  }

  return result.join('\n\n')
}

/**
 * Prepare context for AI personalization
 */
export function prepareScriptContext(contact, baseScript) {
  return {
    name: contact.name,
    company: contact.company,
    title: contact.title || 'decision maker',
    product: contact.product,
    triggerType: contact.trigger_type,
    triggerDetails: contact.trigger_details,
    notes: contact.notes,
    baseScript: baseScript?.content || '',
    scriptType: baseScript?.type || 'generic'
  }
}
