/**
 * Parse competitor objections from markdown document
 * Extracts structured data from dobj-main.md
 */

export const parseCompetitorObjections = (markdownContent) => {
  if (!markdownContent || !markdownContent.trim()) {
    return { competitors: [] }
  }

  const lines = markdownContent.split('\n')
  const competitors = []
  let currentCompetitor = null
  let currentSection = null
  let currentSubObjection = null
  let collectingResponse = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Detect new competitor (numbered heading: "1. OnBase (Hyland)")
    const competitorMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/)
    if (competitorMatch && !trimmedLine.startsWith('  ')) {
      // Save previous competitor
      if (currentCompetitor) {
        competitors.push(currentCompetitor)
      }

      // Start new competitor
      const competitorName = competitorMatch[2]
      currentCompetitor = {
        id: competitorName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: competitorName,
        commonObjections: [],
        background: '',
        initialResponse: '',
        subObjections: [],
        bottomLine: '',
        keywords: generateKeywords(competitorName)
      }
      currentSection = null
      currentSubObjection = null
      collectingResponse = false
      continue
    }

    if (!currentCompetitor) continue

    // Detect sections
    if (trimmedLine.startsWith('What They\'ll Say:')) {
      currentSection = 'commonObjections'
      continue
    } else if (trimmedLine.startsWith('What You Need to Know:')) {
      currentSection = 'background'
      continue
    } else if (trimmedLine.startsWith('Your Response Framework:')) {
      currentSection = 'initialResponse'
      continue
    } else if (trimmedLine.startsWith('Deeper Objection Handling:')) {
      currentSection = 'subObjections'
      continue
    } else if (trimmedLine.startsWith('Bottom Line')) {
      currentSection = 'bottomLine'
      continue
    }

    // Parse content based on current section
    if (currentSection === 'commonObjections') {
      // Extract quoted objections
      if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
        currentCompetitor.commonObjections.push(trimmedLine.slice(1, -1))
      }
    } else if (currentSection === 'background') {
      if (trimmedLine && !trimmedLine.startsWith('Your Response')) {
        currentCompetitor.background += (currentCompetitor.background ? ' ' : '') + trimmedLine
      }
    } else if (currentSection === 'initialResponse') {
      if (trimmedLine && !trimmedLine.startsWith('They\'ll') && !trimmedLine.startsWith('Deeper')) {
        currentCompetitor.initialResponse += (currentCompetitor.initialResponse ? ' ' : '') + trimmedLine
      }
    } else if (currentSection === 'subObjections') {
      // Detect sub-objection (quoted text followed by "Response:")
      const objectionMatch = trimmedLine.match(/^"(.+)"$/)
      if (objectionMatch) {
        // Save previous sub-objection
        if (currentSubObjection) {
          currentCompetitor.subObjections.push(currentSubObjection)
        }

        // Start new sub-objection
        const objectionText = objectionMatch[1]
        currentSubObjection = {
          id: `${currentCompetitor.id}_${objectionText.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30)}`,
          objection: objectionText,
          response: '',
          keywords: extractKeywords(objectionText)
        }
        collectingResponse = false
        continue
      }

      // Detect response start
      if (trimmedLine === 'Response:') {
        collectingResponse = true
        continue
      }

      // Collect response text
      if (collectingResponse && currentSubObjection && trimmedLine) {
        // Skip if we hit another objection or section
        if (trimmedLine.startsWith('"') || trimmedLine.startsWith('Bottom Line')) {
          collectingResponse = false
          continue
        }

        currentSubObjection.response += (currentSubObjection.response ? '\n\n' : '') + trimmedLine
      }
    } else if (currentSection === 'bottomLine') {
      if (trimmedLine && !trimmedLine.match(/^(\d+)\./)) {
        currentCompetitor.bottomLine += (currentCompetitor.bottomLine ? ' ' : '') + trimmedLine
      }
    }
  }

  // Save last competitor
  if (currentCompetitor) {
    // Save last sub-objection
    if (currentSubObjection) {
      currentCompetitor.subObjections.push(currentSubObjection)
    }
    competitors.push(currentCompetitor)
  }

  return { competitors }
}

/**
 * Generate keywords for competitor detection
 */
const generateKeywords = (competitorName) => {
  const keywords = []
  const lower = competitorName.toLowerCase()

  // Add full name
  keywords.push(lower)

  // Extract parts (handle parenthetical names like "OnBase (Hyland)")
  const parts = lower.split(/[(\/)]/)[0].trim().split(/\s+/)
  keywords.push(...parts)

  // Add variations
  if (lower.includes('onbase')) {
    keywords.push('on base', 'on-base', 'hyland')
  } else if (lower.includes('epic')) {
    keywords.push('epic', 'hyperdrive', 'gallery')
  } else if (lower.includes('cerner')) {
    keywords.push('cerner', 'oracle health', 'wqm', 'work queue manager')
  } else if (lower.includes('athena')) {
    keywords.push('athena', 'athenahealth', 'athenaone')
  } else if (lower.includes('eclinicalworks') || lower.includes('ecw')) {
    keywords.push('ecw', 'eclinicalworks', 'e clinical works')
  } else if (lower.includes('nextgen')) {
    keywords.push('nextgen', 'next gen')
  } else if (lower.includes('rightfax')) {
    keywords.push('rightfax', 'right fax', 'opentext')
  }

  return [...new Set(keywords)] // Remove duplicates
}

/**
 * Extract keywords from objection text for sub-objection matching
 */
const extractKeywords = (objectionText) => {
  const keywords = []
  const lower = objectionText.toLowerCase()

  // Common keyword patterns
  if (lower.includes('ai')) keywords.push('ai', 'artificial intelligence', 'intelligent')
  if (lower.includes('custom')) keywords.push('custom', 'customized', 'configured')
  if (lower.includes('integrate')) keywords.push('integrate', 'integration')
  if (lower.includes('contract')) keywords.push('contract', 'renewed', 'committed')
  if (lower.includes('expensive')) keywords.push('expensive', 'cost', 'pricing')
  if (lower.includes('upgrade')) keywords.push('upgrade', 'updated', 'new version')
  if (lower.includes('happy')) keywords.push('happy', 'satisfied', 'all set')

  return keywords
}

/**
 * Load competitor objections from file
 */
export const loadCompetitorObjections = async () => {
  try {
    const response = await fetch('/docs/dobj-main.md')
    if (!response.ok) {
      throw new Error('Failed to load competitor objections')
    }
    const markdown = await response.text()
    return parseCompetitorObjections(markdown)
  } catch (error) {
    console.error('Error loading competitor objections:', error)
    return { competitors: [] }
  }
}
