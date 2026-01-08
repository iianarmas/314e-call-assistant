/**
 * Merge Database Scripts into Call Flows
 * Takes database scripts and integrates them into the appropriate call flow sections
 */

import { parseCompetitorObjections } from './competitorObjectionsParser'

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
  } else if (sectionType === 'transition_to_discovery' || sectionType === 'transition_to_pitch' || sectionType === 'transition') {
    // Parse transition - support variations format
    // Format: ## Version 1: Label\ncontent\n---\n## Version 2: Label\ncontent
    // OR simple format: just the content

    // Check if it has version format
    if (content.includes('## Version')) {
      // Parse as variations (similar to opening/closing)
      return {
        trigger: 'Custom',
        pitch: content,
        content: content,
        label: 'Version 1',
        keywords: []
      }
    } else {
      // Simple format
      return {
        trigger: 'Custom',
        pitch: content.trim(),
        content: content.trim(),
        keywords: []
      }
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
        transition_to_discovery: [],
        discovery: [],
        transition_to_pitch: [],
        objections: [],
        closing: []
      }
    }

    const sectionType = script.section_type || script.script_type
    // Map old 'transition' to 'transition_to_pitch' for backward compatibility
    const mappedSectionType = sectionType === 'transition' ? 'transition_to_pitch' : sectionType
    if (scriptsByFlow[flowKey][mappedSectionType]) {
      scriptsByFlow[flowKey][mappedSectionType].push(script)
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

    // Merge transition to discovery
    if (scriptsForFlow.transition_to_discovery.length > 0) {
      scriptsForFlow.transition_to_discovery.forEach(script => {
        const parsed = parseScriptContent(script.content, 'transition_to_discovery')
        if (parsed) {
          flow.sections.transition_to_discovery.push({
            ...parsed,
            dbScriptId: script.id,
            dbScriptName: script.name
          })
        }
      })
    }

    // Merge transition to pitch
    if (scriptsForFlow.transition_to_pitch.length > 0) {
      scriptsForFlow.transition_to_pitch.forEach(script => {
        const parsed = parseScriptContent(script.content, 'transition_to_pitch')
        if (parsed) {
          flow.sections.transition_to_pitch.push({
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

/**
 * Merge competitor objections into all call flows
 * @param {Array} callFlows - Array of call flow objects
 * @param {string} competitorMd - Markdown content from dobj-main.md
 * @param {Array} dbScripts - Optional database scripts for competitor objections
 * @returns {Array} Call flows with competitor objections integrated
 */
export function mergeCompetitorObjectionsIntoFlows(callFlows, competitorMd, dbScripts = []) {
  // Parse competitor objections from markdown
  const competitorData = parseCompetitorObjections(competitorMd)

  // Merge database competitor scripts if any
  const competitorScripts = dbScripts.filter(s =>
    s.is_active && (s.section_type === 'competitor_objection' || s.script_type === 'competitor_objection')
  )

  // Add database competitor objections to the parsed data
  competitorScripts.forEach(script => {
    const parsed = parseScriptContent(script.content, 'objections')
    if (parsed) {
      // Find or create competitor entry
      let competitor = competitorData.competitors.find(c =>
        c.id === script.competitor_id || c.name.toLowerCase() === script.competitor?.toLowerCase()
      )

      if (!competitor) {
        // Create new competitor entry for database script
        competitor = {
          id: script.competitor_id || `custom_${script.id}`,
          name: script.competitor || 'Custom Competitor',
          commonObjections: [],
          background: '',
          initialResponse: '',
          subObjections: [],
          bottomLine: '',
          keywords: [script.competitor?.toLowerCase() || 'custom']
        }
        competitorData.competitors.push(competitor)
      }

      // Add sub-objection
      competitor.subObjections.push({
        id: `db_${script.id}`,
        objection: script.name,
        response: parsed.response,
        alternatives: parsed.alternatives || [],
        keywords: [],
        dbScriptId: script.id,
        dbScriptName: script.name
      })
    }
  })

  // Merge competitor data into all call flows (same for all)
  return callFlows.map(flow => ({
    ...flow,
    sections: {
      ...flow.sections,
      competitor_objections: competitorData
    }
  }))
}
