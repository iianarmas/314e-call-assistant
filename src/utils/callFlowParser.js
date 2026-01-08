/**
 * Call Flow Parser
 * Parses markdown call flow documents into structured sections
 * Handles: OPENING, DISCOVERY QUESTIONS, TRANSITION TO PITCH, OBJECTION HANDLING, CLOSING
 */

/**
 * Main parser function - converts markdown call flow to structured JSON
 * @param {string} markdown - Raw markdown content
 * @param {string} filename - Name of the file (used to extract product and approach)
 * @returns {object} Structured call flow object
 */
export function parseCallFlow(markdown, filename = '') {
  const lines = markdown.split('\n')

  // Extract metadata from filename (e.g., "dexit-him-callflow-v1.md")
  const metadata = extractMetadata(filename)

  // Split markdown into major sections
  const sections = splitIntoSections(lines)

  return {
    id: generateId(),
    name: `${metadata.product} ${metadata.approach} Call Flow`,
    product: metadata.product,
    approach: metadata.approach,
    version: metadata.version,
    sections: {
      opening: parseOpeningSection(sections.opening || []),
      transition_to_discovery: parseTransitionSection(sections.transition_to_discovery || []),
      discovery: parseDiscoverySection(sections.discovery || []),
      transition_to_pitch: parseTransitionSection(sections.transition_to_pitch || []),
      objections: parseObjectionsSection(sections.objections || []),
      competitor_objections: null, // Will be merged later from dobj-main.md
      closing: parseClosingSection(sections.closing || [])
    }
  }
}

/**
 * Extract product, approach, and version from filename
 */
function extractMetadata(filename) {
  // Default values
  let product = 'Unknown'
  let approach = 'General'
  let version = 1

  if (!filename) return { product, approach, version }

  const lower = filename.toLowerCase()

  // Extract product (Dexit or Muspell)
  if (lower.includes('dexit')) {
    product = 'Dexit'
  } else if (lower.includes('muspell')) {
    product = 'Muspell'
  }

  // Extract approach (HIM, IT, Ambulatory, RC, etc.)
  // Check more specific patterns first to avoid false matches
  if (lower.includes('rc-') || lower.includes('revenue')) {
    approach = 'Revenue Cycle'
  } else if (lower.includes('ambulatory')) {
    approach = 'Ambulatory'
  } else if (lower.includes('him-') || lower.includes('him.')) {
    approach = 'HIM'
  } else if (lower.includes('it-') || lower.includes('it.') || lower.includes('applications')) {
    approach = 'IT'
  }

  // Extract version number
  const versionMatch = filename.match(/v(\d+)/)
  if (versionMatch) {
    version = parseInt(versionMatch[1], 10)
  }

  return { product, approach, version }
}

/**
 * Split markdown into major sections based on headers
 */
function splitIntoSections(lines) {
  const sections = {
    opening: [],
    transition_to_discovery: [],
    discovery: [],
    transition_to_pitch: [],
    objections: [],
    closing: []
  }

  let currentSection = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const upperLine = line.toUpperCase()

    // Detect section headers (order matters - check specific before general)
    if (upperLine.includes('OPENING')) {
      currentSection = 'opening'
      continue
    } else if (upperLine.includes('TRANSITION TO DISCOVERY')) {
      currentSection = 'transition_to_discovery'
      continue
    } else if (upperLine.includes('DISCOVERY QUESTIONS') || upperLine.includes('DISCOVERY')) {
      currentSection = 'discovery'
      continue
    } else if (upperLine.includes('TRANSITION TO PITCH')) {
      currentSection = 'transition_to_pitch'
      continue
    } else if (upperLine.includes('OBJECTION HANDLING') || upperLine === 'OBJECTION HANDLING') {
      currentSection = 'objections'
      continue
    } else if (upperLine.includes('CLOSING')) {
      currentSection = 'closing'
      continue
    }

    // Add line to current section
    if (currentSection && line) {
      sections[currentSection].push(line)
    }
  }

  return sections
}

/**
 * Parse OPENING section - extract multiple versions
 */
function parseOpeningSection(lines) {
  const versions = []
  let currentVersion = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if line starts with "Version X" or similar
    const versionMatch = line.match(/^Version (\d+)\s*\((.*?)\):?/i)

    if (versionMatch) {
      // Save previous version if exists
      if (currentVersion) {
        versions.push(currentVersion)
      }

      // Start new version
      currentVersion = {
        number: parseInt(versionMatch[1], 10),
        label: versionMatch[2].trim(),
        content: ''
      }
    } else if (currentVersion) {
      // Add content to current version (remove quotes if present)
      const cleanLine = line.replace(/^[""]|[""]$/g, '').trim()
      if (cleanLine) {
        currentVersion.content += (currentVersion.content ? ' ' : '') + cleanLine
      }
    }
  }

  // Add final version
  if (currentVersion) {
    versions.push(currentVersion)
  }

  return { versions }
}

/**
 * Parse DISCOVERY QUESTIONS section
 */
function parseDiscoverySection(lines) {
  const questions = []
  let currentQuestion = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Question lines are usually in quotes
    if (line.startsWith('"') && line.endsWith('"')) {
      // Save previous question
      if (currentQuestion) {
        questions.push(currentQuestion)
      }

      // Start new question
      currentQuestion = {
        question: line.replace(/^"|"$/g, ''),
        why: '',
        keywords: extractKeywords(line)
      }
    } else if (line.startsWith('Why:') && currentQuestion) {
      currentQuestion.why = line.replace('Why:', '').trim()
    } else if (currentQuestion && !line.startsWith('Why:') && line.length > 0) {
      // Additional context after "Why"
      if (currentQuestion.why) {
        currentQuestion.why += ' ' + line
      }
    }
  }

  // Add final question
  if (currentQuestion) {
    questions.push(currentQuestion)
  }

  return questions
}

/**
 * Parse TRANSITION TO PITCH section - conditional pitches
 */
function parseTransitionSection(lines) {
  const transitions = []
  let currentTransition = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check for conditional trigger (e.g., "If they mention X:", "Based on:")
    if (line.startsWith('If ') || line.startsWith('Based on')) {
      // Save previous transition
      if (currentTransition) {
        transitions.push(currentTransition)
      }

      // Extract trigger
      const trigger = line.replace(/^If they (?:mention|have|say)\s*/i, '')
                          .replace(/^Based on\s*/i, '')
                          .replace(/:$/, '')
                          .trim()

      currentTransition = {
        trigger: trigger,
        pitch: '',
        keywords: extractKeywords(trigger)
      }
    } else if (currentTransition && line.startsWith('"')) {
      // Pitch content
      const cleanLine = line.replace(/^"|"$/g, '')
      currentTransition.pitch += (currentTransition.pitch ? ' ' : '') + cleanLine
    }
  }

  // Add final transition
  if (currentTransition) {
    transitions.push(currentTransition)
  }

  return transitions
}

/**
 * Parse OBJECTION HANDLING section
 */
function parseObjectionsSection(lines) {
  const objections = []
  let currentObjection = null
  let capturingResponse = false
  let capturingAlternative = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Objection lines are usually in quotes
    if (line.startsWith('"') && line.endsWith('"') && !capturingResponse) {
      // Save previous objection
      if (currentObjection) {
        objections.push(currentObjection)
      }

      // Start new objection
      const objectionText = line.replace(/^"|"$/g, '')
      currentObjection = {
        objection: objectionText,
        response: '',
        alternatives: [],
        keywords: extractKeywords(objectionText)
      }
      capturingResponse = false
      capturingAlternative = false
    } else if (line.startsWith('Response:') && currentObjection) {
      capturingResponse = true
      capturingAlternative = false
      const responseText = line.replace('Response:', '').trim()
      if (responseText && responseText.startsWith('"')) {
        currentObjection.response = responseText.replace(/^"|"$/g, '')
      }
    } else if (line.startsWith('Alternative:') && currentObjection) {
      capturingAlternative = true
      capturingResponse = false
      const altText = line.replace('Alternative:', '').trim()
      if (altText && altText.startsWith('"')) {
        currentObjection.alternatives.push(altText.replace(/^"|"$/g, ''))
      }
    } else if (currentObjection && line.startsWith('"')) {
      // Continue capturing response or alternative
      const cleanLine = line.replace(/^"|"$/g, '')
      if (capturingResponse) {
        currentObjection.response += (currentObjection.response ? ' ' : '') + cleanLine
      } else if (capturingAlternative) {
        if (currentObjection.alternatives.length === 0) {
          currentObjection.alternatives.push(cleanLine)
        } else {
          currentObjection.alternatives[currentObjection.alternatives.length - 1] += ' ' + cleanLine
        }
      }
    }
  }

  // Add final objection
  if (currentObjection) {
    objections.push(currentObjection)
  }

  return objections
}

/**
 * Parse CLOSING section - multiple versions
 */
function parseClosingSection(lines) {
  const versions = []
  let currentVersion = null
  let versionCounter = 1

  // Look for quoted sections as closing versions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('"') && line.length > 50) { // Substantial quoted text
      const cleanLine = line.replace(/^"|"$/g, '')

      // Try to extract label from context (e.g., "Alternative ask:", "Standard:")
      let label = `Version ${versionCounter}`

      // Check previous lines for context
      if (i > 0) {
        const prevLine = lines[i - 1]
        if (prevLine.includes('Alternative') || prevLine.includes('alternative')) {
          label = 'Alternative'
        } else if (prevLine.includes('Standard') || prevLine.includes('standard')) {
          label = 'Standard'
        } else if (prevLine.includes('Technical') || prevLine.includes('technical')) {
          label = 'Technical'
        } else if (prevLine.includes('Collaborative') || prevLine.includes('collaborative')) {
          label = 'Collaborative'
        } else if (prevLine.includes('Casual') || prevLine.includes('casual')) {
          label = 'Casual'
        } else if (prevLine.includes('Problem-focused') || prevLine.includes('problem')) {
          label = 'Problem-focused'
        }
      }

      versions.push({
        number: versionCounter,
        label: label,
        content: cleanLine
      })

      versionCounter++
    }
  }

  // If no versions found, create a default one from all content
  if (versions.length === 0 && lines.length > 0) {
    const content = lines.join(' ').replace(/^"|"$/g, '').trim()
    if (content) {
      versions.push({
        number: 1,
        label: 'Standard',
        content: content
      })
    }
  }

  return { versions }
}

/**
 * Extract keywords from text for search/matching
 */
function extractKeywords(text) {
  if (!text) return []

  // Remove common words and extract meaningful terms
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can'])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))

  // Return unique keywords
  return [...new Set(words)]
}

/**
 * Generate unique ID for call flow
 */
function generateId() {
  return `callflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Load and parse a call flow file
 * @param {string} filepath - Path to markdown file
 * @returns {Promise<object>} Parsed call flow object
 */
export async function loadCallFlow(filepath) {
  try {
    const response = await fetch(filepath)
    const markdown = await response.text()
    const filename = filepath.split('/').pop()
    return parseCallFlow(markdown, filename)
  } catch (error) {
    console.error(`Error loading call flow from ${filepath}:`, error)
    return null
  }
}

/**
 * Load all call flow files
 * @returns {Promise<Array>} Array of parsed call flows
 */
export async function loadAllCallFlows() {
  const callFlowFiles = [
    '/docs/dexit-him-callflow-v1.md',
    '/docs/dexit-it-callflow-v1.md',
    '/docs/dexit-ambulatory-callflow-v1.md',
    '/docs/dexit-rc-callflow-v1.md'
  ]

  const promises = callFlowFiles.map(file => loadCallFlow(file))
  const results = await Promise.all(promises)

  // Filter out any failed loads
  return results.filter(flow => flow !== null)
}
