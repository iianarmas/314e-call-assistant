/**
 * Extract common objections from parsed scripts for quick-select buttons
 */

export function buildObjectionLibrary(scripts) {
  if (!scripts) return { dexit: [], muspell: [] }

  const library = {
    dexit: [],
    muspell: []
  }

  // Dexit objections from main script
  if (scripts.dexitMain?.objections) {
    Object.entries(scripts.dexitMain.objections).forEach(([objection, response]) => {
      library.dexit.push({
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
      library.muspell.push({
        trigger: objection.toLowerCase(),
        buttonLabel: objection,
        response: cleanResponse(response),
        source: 'muspell-script.md'
      })
    })
  }

  return library
}

/**
 * Clean response text (remove markers, comments)
 */
function cleanResponse(text) {
  if (!text) return ''

  return text
    .replace(/<<<.*?>>>/gs, '') // Remove triple angle bracket comments
    .replace(/\{.*?\}/gs, '') // Remove curly brace instructions
    .replace(/Wait for.*/gi, '') // Remove "Wait for response" instructions
    .replace(/Continue:/gi, '') // Remove "Continue:" markers
    .trim()
}

/**
 * Find relevant objection examples for AI generation
 */
export function findRelevantExamples(objectionText, objectionLibrary, product) {
  const productObjections = objectionLibrary[product.toLowerCase()] || []
  const query = objectionText.toLowerCase()

  // Try to find similar objections by keyword matching
  const relevant = productObjections.filter(obj => {
    const trigger = obj.trigger.toLowerCase()
    const label = obj.buttonLabel.toLowerCase()

    return query.includes(trigger) ||
           trigger.includes(query) ||
           query.includes(label) ||
           label.includes(query)
  })

  if (relevant.length > 0) {
    // Return up to 2 most relevant examples
    return relevant.slice(0, 2).map(obj =>
      `Objection: "${obj.buttonLabel}"\nResponse: ${obj.response}`
    ).join('\n\n')
  }

  // Return a couple random examples if no match
  return productObjections.slice(0, 2).map(obj =>
    `Objection: "${obj.buttonLabel}"\nResponse: ${obj.response}`
  ).join('\n\n')
}
