import { useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'

/**
 * useAIPitchBuilder Hook
 * Generates custom sales pitches using Claude Haiku model
 * Fast (1-2s), cost-effective, and contextual
 */
export function useAIPitchBuilder() {
  const [generating, setGenerating] = useState(false)
  const [lastPitch, setLastPitch] = useState(null)
  const [error, setError] = useState(null)
  const [tokenUsage, setTokenUsage] = useState({
    input: 0,
    output: 0,
    total: 0
  })

  /**
   * Generate a custom pitch based on notes and context
   */
  const generateCustomPitch = async ({
    contact,
    callFlowType,
    notes,
    raisedObjections = [],
    discoveryAnswers = {},
    context = {},
    modelOverride = 'haiku'
  }) => {
    setGenerating(true)
    setError(null)

    try {
      // Get API key from environment
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

      if (!apiKey) {
        throw new Error('VITE_ANTHROPIC_API_KEY not found in environment variables')
      }

      // Initialize Anthropic client
      const client = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      })

      // Build the prompt
      const prompt = buildPrompt({
        contact,
        callFlowType,
        notes,
        raisedObjections,
        discoveryAnswers,
        context
      })

      // Select model based on user choice
      // Note: Using models available in your Anthropic account
      const modelMap = {
        haiku: 'claude-3-haiku-20240307',
        sonnet: 'claude-sonnet-4-20250514',  // Sonnet 4 (Latest - from your usage dashboard)
        'sonnet-legacy': 'claude-3-5-sonnet-20240620',  // Legacy Sonnet 3.5 (may not be available)
        opus: 'claude-3-opus-20240229'  // May not be available
      }

      const selectedModel = modelMap[modelOverride] || modelMap.haiku
      console.log('Using AI model:', selectedModel)

      // Call Claude API with selected model
      const message = await client.messages.create({
        model: selectedModel,
        max_tokens: 300, // Keep it short and concise
        temperature: 0.8, // More natural and conversational
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      // Extract the generated pitch
      const pitch = message.content[0].text

      // Track token usage
      const usage = {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
        total: message.usage.input_tokens + message.usage.output_tokens
      }

      setTokenUsage(usage)
      setLastPitch(pitch)

      return {
        success: true,
        pitch,
        tokensUsed: usage.total,
        usage
      }
    } catch (err) {
      console.error('Error generating pitch:', err)
      setError(err.message)

      return {
        success: false,
        error: err.message,
        pitch: null
      }
    } finally {
      setGenerating(false)
    }
  }

  /**
   * Estimate token cost before generation
   */
  const estimateTokens = (notes) => {
    // Rough estimate: ~1 token per 4 characters
    // Prompt is ~200-300 tokens, notes vary, response ~300-500 tokens
    const noteTokens = Math.ceil(notes.length / 4)
    const promptTokens = 250 // Average prompt size
    const responseTokens = 400 // Max response size
    return promptTokens + noteTokens + responseTokens
  }

  return {
    generateCustomPitch,
    generating,
    lastPitch,
    error,
    tokenUsage,
    estimateTokens
  }
}

/**
 * Build the AI prompt for pitch generation
 */
function buildPrompt({
  contact,
  callFlowType,
  notes,
  raisedObjections,
  discoveryAnswers,
  context
}) {
  // Parse notes into structured data
  const parsedNotes = parseNotes(notes)

  let prompt = `You are a sales representative speaking to ${contact?.first_name} ${contact?.last_name}, who is a ${contact?.title || 'healthcare professional'} at ${contact?.organization || 'their organization'}.

CRITICAL: Your response MUST be tailored specifically for BOTH the role (${contact?.title}) AND the product (${contact?.product || 'Dexit'}). Use role-specific AND product-specific language.

Contact Details:
- Role/Title: ${contact?.title} (CRITICAL - tailor to this role's pain points)
- Product: ${contact?.product || 'Dexit'} (CRITICAL - pitch THIS product specifically)
- Organization: ${contact?.organization || 'their organization'}
- Call Flow Type: ${callFlowType}

PRODUCT CONTEXT:
${contact?.product === 'Muspell'
  ? '- Muspell: EHR migration/conversion platform - helps healthcare organizations migrate data between EHR systems (e.g., Cerner to Epic). Focus on: data integrity, downtime reduction, regulatory compliance, project timeline.'
  : '- Dexit: Medical records automation platform - automates incoming fax/document processing, patient matching, and routing to EHR. Focus on: manual labor reduction, faster turnaround, accuracy, compliance.'}

Call Notes:
${notes}

Technical Context: ${parsedNotes.ehr ? `EHR: ${parsedNotes.ehr}` : ''} ${parsedNotes.dms ? `DMS: ${parsedNotes.dms}` : ''} ${parsedNotes.volume ? `Volume: ${parsedNotes.volume}` : ''}

Generate a SHORT (2-3 sentences max), conversational pitch that:
1. **SPEAKS TO BOTH ROLE AND PRODUCT**: A ${contact?.title} evaluating ${contact?.product || 'Dexit'} has specific concerns:
   - For Dexit: HIM Directors → compliance & efficiency; IT Directors → integration & security; Revenue Cycle → reimbursement & denials
   - For Muspell: IT Directors → technical migration risks; HIM Directors → data integrity & compliance; Executives → timeline & budget
2. Acknowledges their current technical setup (EHR, DMS, migration plans, etc.)
3. Addresses the specific concerns mentioned in the notes
4. Positions ${contact?.product || 'Dexit'} as the solution to THEIR specific role-based pain points
5. Ends with a clear ask for a discovery call
6. Sounds natural and conversational, not robotic

Remember: A ${contact?.title} evaluating ${contact?.product || 'Dexit'} has unique priorities. Tailor your pitch to resonate with their role-specific AND product-specific challenges.

Your pitch:`

  return prompt
}

/**
 * Parse free-form notes into structured data
 */
function parseNotes(notes) {
  if (!notes) {
    return {
      ehr: null,
      dms: null,
      volume: null,
      painPoints: [],
      objections: [],
      other: []
    }
  }

  const lower = notes.toLowerCase()
  const parsed = {
    ehr: null,
    dms: null,
    volume: null,
    painPoints: [],
    objections: [],
    other: []
  }

  // Extract EHR
  const ehrMatch = notes.match(/ehr\s*[=:]\s*(\w+)/i)
  if (ehrMatch) {
    parsed.ehr = ehrMatch[1]
  } else {
    // Check for common EHR names
    const ehrs = ['epic', 'cerner', 'meditech', 'athena', 'allscripts', 'eclinicalworks']
    for (const ehr of ehrs) {
      if (lower.includes(ehr)) {
        parsed.ehr = ehr.charAt(0).toUpperCase() + ehr.slice(1)
        break
      }
    }
  }

  // Extract DMS
  const dmsMatch = notes.match(/dms\s*[=:]\s*(\w+)/i)
  if (dmsMatch) {
    parsed.dms = dmsMatch[1]
  } else if (lower.includes('no dms') || lower.includes('no document')) {
    parsed.dms = 'none'
  } else {
    const dmsOptions = ['onbase', 'hyland', 'imagecast']
    for (const dms of dmsOptions) {
      if (lower.includes(dms)) {
        parsed.dms = dms.charAt(0).toUpperCase() + dms.slice(1)
        break
      }
    }
  }

  // Extract volume
  const volumeMatch = notes.match(/(\d+)\s*(?:docs?|documents?|pages?)?\s*(?:\/|per)?\s*(?:day|week)/i)
  if (volumeMatch) {
    parsed.volume = volumeMatch[0]
  }

  // Extract pain points
  const painKeywords = [
    'manual', 'time-consuming', 'slow', 'errors', 'backlog',
    'frustrated', 'overwhelmed', 'tedious', 'inefficient'
  ]
  painKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      parsed.painPoints.push(keyword)
    }
  })

  // Extract common objections
  const objectionKeywords = [
    { pattern: /happy|satisfied|all set|good/, text: "We're happy with current setup" },
    { pattern: /not decision|not my decision/, text: "Not the decision maker" },
    { pattern: /budget|cost|expensive|price/, text: "Budget concerns" },
    { pattern: /busy|no time|later/, text: "Timing/too busy" }
  ]
  objectionKeywords.forEach(({ pattern, text }) => {
    if (pattern.test(lower)) {
      parsed.objections.push(text)
    }
  })

  return parsed
}

/**
 * Example usage:
 *
 * const { generateCustomPitch, generating, tokenUsage } = useAIPitchBuilder()
 *
 * const handleGenerate = async () => {
 *   const result = await generateCustomPitch({
 *     contact: { first_name: 'John', last_name: 'Smith', title: 'HIM Director' },
 *     callFlowType: 'HIM',
 *     notes: 'ehr=cerner, no dms, 500 docs/day, happy with current, manual sorting',
 *     raisedObjections: ["We're all set", "How much does it cost?"],
 *     context: {}
 *   })
 *
 *   if (result.success) {
 *     console.log('Generated pitch:', result.pitch)
 *     console.log('Tokens used:', result.tokensUsed)
 *   }
 * }
 */
