import { useState } from 'react'
import { anthropic } from '../lib/claude'

export function useScriptGeneration() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Generate personalized opening script
   */
  const generateOpeningScript = async (contact, baseScript) => {
    try {
      setGenerating(true)
      setError(null)

      const prompt = buildOpeningPrompt(contact, baseScript)

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const generatedScript = response.content[0].text

      setGenerating(false)
      return { success: true, script: generatedScript }
    } catch (err) {
      console.error('Error generating opening script:', err)
      setError(err.message)
      setGenerating(false)
      return { success: false, error: err.message }
    }
  }

  /**
   * Generate response to custom objection
   */
  const generateObjectionResponse = async (objection, contact, product, relevantExamples = '') => {
    try {
      setGenerating(true)
      setError(null)

      const prompt = buildObjectionPrompt(objection, contact, product, relevantExamples)

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const generatedResponse = response.content[0].text

      setGenerating(false)
      return { success: true, response: generatedResponse }
    } catch (err) {
      console.error('Error generating objection response:', err)
      setError(err.message)
      setGenerating(false)
      return { success: false, error: err.message }
    }
  }

  /**
   * Generate closing script (demo vs discovery)
   */
  const generateClosingScript = async (contact, qualificationData, closingType) => {
    try {
      setGenerating(true)
      setError(null)

      const prompt = buildClosingPrompt(contact, qualificationData, closingType)

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const generatedScript = response.content[0].text

      setGenerating(false)
      return { success: true, script: generatedScript }
    } catch (err) {
      console.error('Error generating closing script:', err)
      setError(err.message)
      setGenerating(false)
      return { success: false, error: err.message }
    }
  }

  return {
    generating,
    error,
    generateOpeningScript,
    generateObjectionResponse,
    generateClosingScript
  }
}

/**
 * Build prompt for opening script generation
 */
function buildOpeningPrompt(contact, baseScript) {
  return `You are helping generate a conversational cold calling script for 314e Corporation.

Contact Information:
- Name: ${contact.name}
- Title: ${contact.title || 'decision maker'}
- Company: ${contact.company}
- Product: ${contact.product}
${contact.trigger_type ? `- Trigger: ${contact.trigger_type}` : ''}
${contact.trigger_details ? `- Details: ${contact.trigger_details}` : ''}
${contact.notes ? `- Notes: ${contact.notes}` : ''}

Base Script Template:
${baseScript || 'No template available'}

Generate a natural, conversational opening script for this contact.
- Keep it 2-4 sentences
- Personalize using their name, company, and title
- Use simple, everyday language (no jargon)
- Sound natural, not robotic
- Lead to a discovery question or offer to schedule a meeting
- Do NOT include instructions or meta-commentary, just the script itself

Opening script:`
}

/**
 * Build prompt for objection response
 */
function buildObjectionPrompt(objection, contact, product, examples) {
  const productDesc = product === 'Dexit'
    ? 'Dexit is an AI-powered document processing system that automates manual tasks in healthcare organizations'
    : 'Muspell is a FHIR-native data archival solution for EHR migrations and legacy system retirement'

  return `You are helping respond to a prospect's objection during a cold call for 314e Corporation.

Contact: ${contact.name}, ${contact.title} at ${contact.company}
Product: ${product}
Product Description: ${productDesc}

Prospect's Objection: "${objection}"

${examples ? `Here's how we've handled similar objections:\n${examples}\n` : ''}

Generate a conversational response that:
1. Acknowledges their concern (don't dismiss it)
2. Reframes with product value (reference similar examples above if provided)
3. Transitions to scheduling a meeting

Keep it 2-4 sentences, conversational tone, simple language. Match the style of the examples if provided.

Response:`
}

/**
 * Build prompt for closing script
 */
function buildClosingPrompt(contact, qualificationData, closingType) {
  const isDemoCall = closingType === 'demo'

  let context = `Contact: ${contact.name}, ${contact.title} at ${contact.company}\n`
  context += `Product: ${contact.product}\n`

  if (contact.product === 'Dexit' && qualificationData) {
    context += `\nQualification data collected:\n`
    if (qualificationData.ehr_system) context += `- EHR: ${qualificationData.ehr_system}\n`
    if (qualificationData.dms_system) context += `- DMS: ${qualificationData.dms_system}\n`
    if (qualificationData.team_size) context += `- Team size: ${qualificationData.team_size}\n`
    if (qualificationData.doc_volume) context += `- Document volume: ${qualificationData.doc_volume}\n`
    if (qualificationData.challenges) context += `- Challenges: ${qualificationData.challenges}\n`
  }

  return `You are helping close a cold call for 314e Corporation.

${context}

Generate a ${isDemoCall ? 'DEMO' : 'DISCOVERY CALL'} closing script.

${isDemoCall
    ? 'Since we have enough qualification information, we can offer a product demo. Reference specific details from the qualification data to show how the product can help.'
    : 'We need more information, so offer a discovery call with a Subject Matter Expert to discuss their process in detail.'
}

Keep it conversational, 2-3 sentences. Suggest specific timeframes ("this week or next?").

Closing script:`
}
