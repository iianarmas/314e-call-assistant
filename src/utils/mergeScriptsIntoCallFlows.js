/**
 * Merge Database Scripts into Call Flows
 * Takes database scripts and integrates them into the appropriate call flow sections
 */

/**
 * Parse database script content based on section type
 * @param {string} content - Script content (may be formatted markdown)
 * @param {string} sectionType - Section type (opening, discovery, transition, objections, closing)
 * @returns {object} Parsed content appropriate for the section
 */
function parseScriptContent(content, sectionType) {
  if (!content) return null

  if (sectionType === 'opening' || sectionType === 'closing') {
    // Parse versions from markdown format
    // Format: ## Version 1: Label\ncontent\n---\n## Version 2: Label\ncontent
    const versions = []
    const versionBlocks = content.split(/\n*---\n*/)

    versionBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n')
      const headerMatch = lines[0]?.match(/##\s*Version\s*\d+:\s*(.+)/)

      if (headerMatch) {
        const label = headerMatch[1].trim()
        const versionContent = lines.slice(1).join('\n').trim()
        versions.push({
          number: index + 1,
          label: label,
          content: versionContent
        })
      } else if (block.trim()) {
        // No header, treat whole block as single version
        versions.push({
          number: index + 1,
          label: `Version ${index + 1}`,
          content: block.trim()
        })
      }
    })

    return { versions }
  } else if (sectionType === 'objections') {
    // Parse objection with response and alternatives
    // Format: ## Objection\n**Response:**\ncontent\n**Alternative 1:**\ncontent
    const lines = content.split('\n')
    let response = ''
    const alternatives = []
    let currentSection = null

    for (const line of lines) {
      if (line.startsWith('**Response:**')) {
        currentSection = 'response'
        response = line.replace('**Response:**', '').trim()
      } else if (line.match(/\*\*Alternative \d+:\*\*/)) {
        currentSection = 'alternative'
        const altContent = line.replace(/\*\*Alternative \d+:\*\*/, '').trim()
        alternatives.push(altContent)
      } else if (line.trim() && currentSection === 'response') {
        response += '\n' + line
      } else if (line.trim() && currentSection === 'alternative') {
        alternatives[alternatives.length - 1] += '\n' + line
      }
    }

    return {
      response: response.trim(),
      alternatives: alternatives.map(alt => alt.trim())
    }
  } else if (sectionType === 'discovery') {
    // Parse discovery question
    // Format: Question text\n**Why ask this:**\nReason\n**Keywords:**\nkeyword1, keyword2
    const lines = content.split('\n')
    let question = ''
    let why = ''
    let keywords = []
    let currentSection = 'question'

    for (const line of lines) {
      if (line.startsWith('**Why ask this:**')) {
        currentSection = 'why'
        why = line.replace('**Why ask this:**', '').trim()
      } else if (line.startsWith('**Keywords:**')) {
        currentSection = 'keywords'
        const keywordText = line.replace('**Keywords:**', '').trim()
        keywords = keywordText.split(',').map(k => k.trim()).filter(k => k)
      } else if (line.trim()) {
        if (currentSection === 'question') {
          question += (question ? ' ' : '') + line.trim()
        } else if (currentSection === 'why') {
          why += ' ' + line.trim()
        }
      }
    }

    return {
      question: question.trim(),
      why: why.trim(),
      keywords: keywords
    }
  } else if (sectionType === 'transition') {
    // Parse transition pitch
    // Simple format for now - just the content
    return {
      trigger: 'Custom',
      pitch: content.trim(),
      keywords: []
    }
  }

  return null
}

/**
 * Merge database scripts into call flows
 * @param {Array} callFlows - Array of call flow objects from markdown files
 * @param {Array} dbScripts - Array of script objects from database
 * @returns {Array} Call flows with database scripts integrated
 */
export function mergeScriptsIntoCallFlows(callFlows, dbScripts) {
  if (!dbScripts || dbScripts.length === 0) {
    return callFlows
  }

  // Create a deep copy of call flows to avoid mutation
  const mergedFlows = JSON.parse(JSON.stringify(callFlows))

  // Group database scripts by product and approach
  const scriptsByFlow = {}

  dbScripts.forEach(script => {
    if (!script.is_active) return // Skip inactive scripts

    const flowKey = `${script.product}_${script.approach || 'General'}`

    if (!scriptsByFlow[flowKey]) {
      scriptsByFlow[flowKey] = {
        opening: [],
        discovery: [],
        transition: [],
        objections: [],
        closing: []
      }
    }

    const sectionType = script.section_type || script.script_type
    if (scriptsByFlow[flowKey][sectionType]) {
      scriptsByFlow[flowKey][sectionType].push(script)
    }
  })

  // Merge scripts into each call flow
  mergedFlows.forEach(flow => {
    const flowKey = `${flow.product}_${flow.approach}`
    const scriptsForFlow = scriptsByFlow[flowKey]

    if (!scriptsForFlow) return

    // Merge opening scripts
    if (scriptsForFlow.opening.length > 0) {
      scriptsForFlow.opening.forEach(script => {
        const parsed = parseScriptContent(script.content, 'opening')
        if (parsed && parsed.versions) {
          parsed.versions.forEach(version => {
            flow.sections.opening.versions.push({
              ...version,
              dbScriptId: script.id, // Track that this came from database
              dbScriptName: script.name
            })
          })
        }
      })
    }

    // Merge closing scripts
    if (scriptsForFlow.closing.length > 0) {
      scriptsForFlow.closing.forEach(script => {
        const parsed = parseScriptContent(script.content, 'closing')
        if (parsed && parsed.versions) {
          parsed.versions.forEach(version => {
            flow.sections.closing.versions.push({
              ...version,
              dbScriptId: script.id,
              dbScriptName: script.name
            })
          })
        }
      })
    }

    // Merge discovery questions
    if (scriptsForFlow.discovery.length > 0) {
      scriptsForFlow.discovery.forEach(script => {
        const parsed = parseScriptContent(script.content, 'discovery')
        if (parsed) {
          flow.sections.discovery.push({
            ...parsed,
            dbScriptId: script.id,
            dbScriptName: script.name
          })
        }
      })
    }

    // Merge transition pitches
    if (scriptsForFlow.transition.length > 0) {
      scriptsForFlow.transition.forEach(script => {
        const parsed = parseScriptContent(script.content, 'transition')
        if (parsed) {
          flow.sections.transition.push({
            ...parsed,
            dbScriptId: script.id,
            dbScriptName: script.name
          })
        }
      })
    }

    // Merge objections
    if (scriptsForFlow.objections.length > 0) {
      scriptsForFlow.objections.forEach(script => {
        const parsed = parseScriptContent(script.content, 'objections')
        if (parsed) {
          flow.sections.objections.push({
            objection: script.name, // Use script name as objection text
            response: parsed.response,
            alternatives: parsed.alternatives || [],
            keywords: [],
            dbScriptId: script.id
          })
        }
      })
    }
  })

  return mergedFlows
}
