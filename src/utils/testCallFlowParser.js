/**
 * Test file for callFlowParser.js
 * Run this in browser console to test the parser
 */

import { parseCallFlow, loadAllCallFlows } from './callFlowParser.js'

// Sample markdown content for quick testing
const sampleMarkdown = `
HIM Manager/Director Call Flow
OPENING (Conversational & Clear)
Version 1 (Direct):
"Hi [First Name], this is [Your Name] from 314e. We work with healthcare organizations to help them process patient documents faster using AI."

Version 2 (Question-led):
"Hi [First Name], [Your Name] from 314e. Quick question - when a patient document comes in, how much of that process is your team doing manually?"

DISCOVERY QUESTIONS (Natural Flow)
"What EHR are you using?"

Why: Shows you understand their environment

"How are documents coming into your department?"

Why: Identifies intake channels

TRANSITION TO PITCH
If they have manual processes:
"Got it. So it sounds like your team is spending a lot of time on tasks that could actually be handled automatically."

If they mention high volume:
"Wow, [X] documents a day with a team of [Y]? That's a lot."

OBJECTION HANDLING
"I'm not the decision maker"
Response:
"I totally understand - these decisions usually involve a few people. But here's why I wanted to talk to you specifically..."

Alternative:
"That's fine - who else would typically be involved in a decision like this?"

"We're all set / We're good"
Response:
"That's great to hear! Can I ask - what are you using now to handle your document processing?"

CLOSING
"Awesome. Let me grab a couple of times from you. What does [this week/next week] look like?"
`

/**
 * Test the parser with sample markdown
 */
export function testParser() {
  console.log('=== Testing Call Flow Parser ===\n')

  const result = parseCallFlow(sampleMarkdown, 'dexit-him-callflow-v1.md')

  console.log('Metadata:')
  console.log(`  Name: ${result.name}`)
  console.log(`  Product: ${result.product}`)
  console.log(`  Approach: ${result.approach}`)
  console.log(`  Version: ${result.version}`)
  console.log(`  ID: ${result.id}\n`)

  console.log('Opening Versions:', result.sections.opening.versions.length)
  result.sections.opening.versions.forEach((v, i) => {
    console.log(`  Version ${v.number} (${v.label}):`)
    console.log(`    ${v.content.substring(0, 80)}...\n`)
  })

  console.log('Discovery Questions:', result.sections.discovery.length)
  result.sections.discovery.forEach((q, i) => {
    console.log(`  Q${i + 1}: ${q.question}`)
    console.log(`    Why: ${q.why}`)
    console.log(`    Keywords: ${q.keywords.join(', ')}\n`)
  })

  console.log('Transition Pitches:', result.sections.transition.length)
  result.sections.transition.forEach((t, i) => {
    console.log(`  Trigger: ${t.trigger}`)
    console.log(`    Pitch: ${t.pitch.substring(0, 80)}...`)
    console.log(`    Keywords: ${t.keywords.join(', ')}\n`)
  })

  console.log('Objections:', result.sections.objections.length)
  result.sections.objections.forEach((o, i) => {
    console.log(`  Objection: ${o.objection}`)
    console.log(`    Response: ${o.response.substring(0, 80)}...`)
    if (o.alternatives.length > 0) {
      console.log(`    Alternatives: ${o.alternatives.length}`)
    }
    console.log(`    Keywords: ${o.keywords.join(', ')}\n`)
  })

  console.log('Closing Versions:', result.sections.closing.versions.length)
  result.sections.closing.versions.forEach((v, i) => {
    console.log(`  Version ${v.number} (${v.label}):`)
    console.log(`    ${v.content.substring(0, 80)}...\n`)
  })

  console.log('=== Full Result Object ===')
  console.log(JSON.stringify(result, null, 2))

  return result
}

/**
 * Test loading all call flows
 */
export async function testLoadAllCallFlows() {
  console.log('=== Testing Load All Call Flows ===\n')

  try {
    const callFlows = await loadAllCallFlows()

    console.log(`Successfully loaded ${callFlows.length} call flows:\n`)

    callFlows.forEach((flow, i) => {
      console.log(`${i + 1}. ${flow.name}`)
      console.log(`   Product: ${flow.product}`)
      console.log(`   Approach: ${flow.approach}`)
      console.log(`   Opening versions: ${flow.sections.opening.versions.length}`)
      console.log(`   Discovery questions: ${flow.sections.discovery.length}`)
      console.log(`   Transition pitches: ${flow.sections.transition.length}`)
      console.log(`   Objections: ${flow.sections.objections.length}`)
      console.log(`   Closing versions: ${flow.sections.closing.versions.length}\n`)
    })

    return callFlows
  } catch (error) {
    console.error('Error loading call flows:', error)
    return []
  }
}

/**
 * Test section navigation (simulate user clicking through sections)
 */
export function testSectionNavigation(callFlow) {
  console.log('=== Testing Section Navigation ===\n')

  if (!callFlow) {
    console.error('No call flow provided')
    return
  }

  const sections = ['opening', 'discovery', 'transition', 'objections', 'closing']

  sections.forEach(sectionName => {
    console.log(`Navigating to: ${sectionName.toUpperCase()}`)

    const section = callFlow.sections[sectionName]

    if (sectionName === 'opening' || sectionName === 'closing') {
      console.log(`  Available versions: ${section.versions.length}`)
      section.versions.forEach(v => {
        console.log(`    - ${v.label}`)
      })
    } else if (Array.isArray(section)) {
      console.log(`  Available items: ${section.length}`)
      section.slice(0, 3).forEach((item, i) => {
        if (sectionName === 'discovery') {
          console.log(`    ${i + 1}. ${item.question}`)
        } else if (sectionName === 'transition') {
          console.log(`    ${i + 1}. ${item.trigger}`)
        } else if (sectionName === 'objections') {
          console.log(`    ${i + 1}. ${item.objection}`)
        }
      })
      if (section.length > 3) {
        console.log(`    ... and ${section.length - 3} more`)
      }
    }

    console.log('')
  })
}

// Export test functions for use in console
if (typeof window !== 'undefined') {
  window.testCallFlowParser = testParser
  window.testLoadAllCallFlows = testLoadAllCallFlows
  window.testSectionNavigation = testSectionNavigation
}
