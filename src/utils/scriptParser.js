/**
 * Parse markdown script files to extract sections
 * Scripts contain: openings, objections, questions, etc.
 */

export async function loadScripts() {
  try {
    // Load all script files
    const dexitMain = await fetch('/docs/dexit-main-script.md').then(r => r.text())
    const dexitAmbulatory = await fetch('/docs/dexit-ambulatory-script.md').then(r => r.text())
    const muspell = await fetch('/docs/muspell-script.md').then(r => r.text())

    return {
      dexitMain: parseScriptFile(dexitMain, 'dexit-main'),
      dexitAmbulatory: parseScriptFile(dexitAmbulatory, 'dexit-ambulatory'),
      muspell: parseScriptFile(muspell, 'muspell')
    }
  } catch (error) {
    console.error('Error loading scripts:', error)
    return null
  }
}

/**
 * Parse a single script file into structured sections
 */
function parseScriptFile(content, type) {
  const lines = content.split('\n')
  const sections = {
    openings: {},
    objections: {},
    questions: [],
    raw: content
  }

  let currentSection = null
  let currentObjection = null
  let buffer = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Detect sections
    if (type === 'dexit-main' || type === 'dexit-ambulatory') {
      // Opening scripts
      if (line.includes('Information Technology:')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentSection = 'opening-it'
        currentObjection = null
        buffer = []
        continue
      }

      if (line.includes('Health Information Management:')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentSection = 'opening-him'
        currentObjection = null
        buffer = []
        continue
      }

      // Objections section
      if (line.toUpperCase().includes('OBJECTIONS')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentSection = 'objections'
        buffer = []
        continue
      }

      // Individual objections
      if (currentSection === 'objections' && line.endsWith(':') && !line.startsWith('For ') && !line.startsWith('If ')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentObjection = line.replace(':', '').trim()
        buffer = []
        continue
      }
    }

    if (type === 'muspell') {
      // Detect Muspell openings
      if (line.includes('Cerner to Epic:')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentSection = 'opening-cerner-to-epic'
        currentObjection = null
        buffer = []
        continue
      }

      if (line.includes('Epic to Epic')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentSection = 'opening-epic-to-epic'
        currentObjection = null
        buffer = []
        continue
      }

      if (line.includes('mergers and acquisitions:') || line.includes('For mergers')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentSection = 'opening-merger'
        currentObjection = null
        buffer = []
        continue
      }

      if (line.includes('Non-Epic:')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentSection = 'opening-non-epic'
        currentObjection = null
        buffer = []
        continue
      }

      // Muspell objections
      if (line.includes('Objections:')) {
        if (buffer.length) saveSection(sections, currentSection, currentObjection, buffer)
        currentSection = 'objections'
        buffer = []
        continue
      }
    }

    // Skip empty lines and section separators
    if (!line || line === '---') continue

    // Add to buffer
    buffer.push(lines[i]) // Keep original formatting
  }

  // Save last section
  if (buffer.length) {
    saveSection(sections, currentSection, currentObjection, buffer)
  }

  return sections
}

/**
 * Save parsed section to appropriate location
 */
function saveSection(sections, sectionType, objectionName, buffer) {
  const content = buffer.join('\n').trim()
  if (!content) return

  if (sectionType?.startsWith('opening-')) {
    sections.openings[sectionType] = content
  } else if (sectionType === 'objections' && objectionName) {
    sections.objections[objectionName] = content
  }
}

/**
 * Extract common objections for quick-select buttons
 */
export function extractObjections(scripts) {
  const objections = {
    dexit: [],
    muspell: []
  }

  // Dexit objections from main script
  if (scripts.dexitMain?.objections) {
    Object.entries(scripts.dexitMain.objections).forEach(([objection, response]) => {
      objections.dexit.push({
        trigger: objection.toLowerCase(),
        buttonLabel: objection,
        response: cleanResponse(response),
        source: 'dexit-main-script.md'
      })
    })
  }

  // Muspell objections
  if (scripts.muspell?.objections) {
    Object.entries(scripts.muspell.objections).forEach(([objection, response]) => {
      objections.muspell.push({
        trigger: objection.toLowerCase(),
        buttonLabel: objection,
        response: cleanResponse(response),
        source: 'muspell-script.md'
      })
    })
  }

  return objections
}

/**
 * Clean response text (remove markers like >>>, <<<, etc.)
 */
function cleanResponse(text) {
  return text
    .replace(/<<<.*?>>>/gs, '') // Remove comments in angle brackets
    .replace(/\{.*?\}/gs, '') // Remove instructions in curly braces
    .trim()
}
