import { useState } from 'react'
import { replaceScriptVariables, parseNotesContext } from '../utils/scriptVariables'
import ContactNotes from './ContactNotes'

/**
 * CallFlowContentPanel - Center panel content display
 * Shows the selected section content with instant switching
 * Replaces {{variables}} with actual contact data
 */
export default function CallFlowContentPanel({ activeSection, callFlow, contact, notes }) {
  const [copied, setCopied] = useState(false)
  const [showProTips, setShowProTips] = useState(true)

  if (!callFlow) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-lg font-medium">No call flow loaded</div>
          <div className="text-sm mt-2">Select a contact to begin</div>
        </div>
      </div>
    )
  }

  if (!activeSection) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">👈</div>
          <div className="text-lg font-medium">Select a section</div>
          <div className="text-sm mt-2">Choose from the navigation panel</div>
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    const content = getDisplayContent()
    if (content) {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Build replacement context from contact and notes
  const buildContext = () => {
    return {
      contact: contact || {},
      rep: {
        name: localStorage.getItem('rep_name') || 'Sarah Johnson',
        first_name: localStorage.getItem('rep_first_name') || 'Sarah',
        company: localStorage.getItem('rep_company') || 'Dexit Solutions'
      },
      product: {
        name: contact?.product || 'Dexit'
      },
      scriptContext: parseNotesContext(notes || '')
    }
  }

  const getDisplayContent = () => {
    const { section, index, data } = activeSection

    if (!data) return ''

    const context = buildContext()

    // Opening and Closing sections
    if (section === 'opening' || section === 'closing') {
      return replaceScriptVariables(data.content, context)
    }

    // Discovery section
    if (section === 'discovery') {
      const question = replaceScriptVariables(data.question, context)
      const why = replaceScriptVariables(data.why || '', context)
      return `${question}\n\nWhy: ${why}`
    }

    // Transition sections
    if (section === 'transition_to_discovery' || section === 'transition_to_pitch' || section === 'transition') {
      const trigger = replaceScriptVariables(data.trigger || '', context)
      const pitch = replaceScriptVariables(data.pitch || data.content || '', context)
      return trigger && trigger !== 'Custom' ? `When: ${trigger}\n\n${pitch}` : pitch
    }

    // Objections section
    if (section === 'objections') {
      const objection = replaceScriptVariables(data.objection, context)
      const response = replaceScriptVariables(data.response, context)
      let content = `Objection: "${objection}"\n\nResponse:\n${response}`
      if (data.alternatives && data.alternatives.length > 0) {
        content += '\n\nAlternatives:\n'
        data.alternatives.forEach((alt, i) => {
          const altResponse = replaceScriptVariables(alt, context)
          content += `\n${i + 1}. ${altResponse}`
        })
      }
      return content
    }

    // Competitor objections section
    if (section === 'competitor_objections') {
      const { competitor, subObjection } = data
      const objection = replaceScriptVariables(subObjection.objection, context)
      const response = replaceScriptVariables(subObjection.response, context)
      let content = `Competitor: ${competitor.name}\n\nObjection: "${objection}"\n\nResponse:\n${response}`

      if (subObjection.alternatives && subObjection.alternatives.length > 0) {
        content += '\n\nAlternatives:\n'
        subObjection.alternatives.forEach((alt, i) => {
          const altResponse = replaceScriptVariables(alt, context)
          content += `\n${i + 1}. ${altResponse}`
        })
      }

      if (competitor.bottomLine) {
        content += `\n\nBottom Line:\n${competitor.bottomLine}`
      }

      return content
    }

    return ''
  }

  const getSectionIcon = () => {
    const icons = {
      opening: '👋',
      transition_to_discovery: '➡️',
      discovery: '🔍',
      transition_to_pitch: '🔄',
      objections: '💬',
      competitor_objections: '🏢',
      closing: '🤝'
    }
    return icons[activeSection.section] || '📄'
  }

  const getSectionLabel = () => {
    const labels = {
      opening: 'Opening Script',
      transition_to_discovery: 'Transition to Discovery',
      discovery: 'Discovery Question',
      transition_to_pitch: 'Transition to Pitch',
      objections: 'Objection Response',
      competitor_objections: 'Competitor Objection Response',
      closing: 'Closing Script'
    }
    return labels[activeSection.section] || 'Content'
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getSectionIcon()}</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{getSectionLabel()}</h2>
              {activeSection.data && (
                <p className="text-sm text-gray-600 mt-0.5">
                  {activeSection.section === 'opening' || activeSection.section === 'closing'
                    ? activeSection.data.label
                    : activeSection.section === 'discovery'
                    ? 'Question'
                    : activeSection.section === 'transition_to_discovery' || activeSection.section === 'transition_to_pitch'
                    ? (activeSection.data.trigger && activeSection.data.trigger !== 'Custom'
                        ? `Trigger: ${activeSection.data.trigger.substring(0, 50)}...`
                        : activeSection.data.label || 'Transition')
                    : activeSection.section === 'competitor_objections'
                    ? `${activeSection.data.competitor?.name || 'Competitor'} • ${activeSection.data.subObjection?.objection?.substring(0, 40) || 'Objection'}...`
                    : activeSection.data.objection
                    ? activeSection.data.objection.substring(0, 50) + '...'
                    : ''
                  }
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`
              px-4 py-2 rounded-md font-medium text-sm transition-all
              ${copied
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {renderContent()}

        {/* Contact Notes Section */}
        {contact && (
          <ContactNotes
            contactId={contact.id}
            contactName={contact.first_name && contact.last_name
              ? `${contact.first_name} ${contact.last_name}`
              : contact.name || 'Contact'}
          />
        )}
      </div>

      {/* Footer - Usage stats (optional) */}
      <div className="flex-none px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            <span className="font-medium">💡 Tip:</span> Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">Ctrl+C</kbd> to copy
          </div>
          <div className="flex items-center gap-4">
            <span>📊 Token-free display</span>
            <span>⚡ Instant loading</span>
          </div>
        </div>
      </div>
    </div>
  )

  function renderContent() {
    const { section, data } = activeSection

    if (!data) {
      return <div className="text-gray-500">No content available</div>
    }

    const context = buildContext()

    // Opening and Closing - Show version content
    if (section === 'opening' || section === 'closing') {
      const content = replaceScriptVariables(data.content, context)
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-800 uppercase">Version {data.number}</span>
              <span className="text-xs text-blue-600">• {data.label}</span>
            </div>
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {showProTips && (
            <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 relative">
              <button
                onClick={() => setShowProTips(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                title="Hide pro tips"
              >
                ✕
              </button>
              <strong>💡 Pro tip:</strong> Read this naturally - don't sound scripted. Use it as a guide, not a word-for-word script.
            </div>
          )}
        </div>
      )
    }

    // Discovery Question
    if (section === 'discovery') {
      const question = replaceScriptVariables(data.question, context)
      const why = data.why ? replaceScriptVariables(data.why, context) : ''
      return (
        <div className="space-y-4">
          <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg">
            <div className="text-xs font-semibold text-purple-800 uppercase mb-2">Question</div>
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
              {question}
            </p>
          </div>

          {why && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-700 uppercase mb-2">Why Ask This?</div>
              <p className="text-gray-700 text-base leading-relaxed">
                {why}
              </p>
            </div>
          )}

          {data.keywords && data.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Keywords:</span>
              {data.keywords.slice(0, 5).map((keyword, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {showProTips && (
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3 relative">
              <button
                onClick={() => setShowProTips(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                title="Hide pro tips"
              >
                ✕
              </button>
              <strong>🎯 Listen carefully:</strong> Their answer will guide which transition pitch to use.
            </div>
          )}
        </div>
      )
    }

    // Transition to Discovery
    if (section === 'transition_to_discovery') {
      const trigger = replaceScriptVariables(data.trigger || '', context)
      const pitch = replaceScriptVariables(data.pitch || data.content || '', context)
      return (
        <div className="space-y-4">
          <div className="bg-teal-50 border-l-4 border-teal-600 p-4 rounded-r-lg">
            {data.trigger && (
              <>
                <div className="text-xs font-semibold text-teal-800 uppercase mb-2">When to Use</div>
                <p className="text-gray-800 text-base font-medium mb-4">
                  {trigger}
                </p>
              </>
            )}
            <div className="text-xs font-semibold text-teal-800 uppercase mb-2">Transition</div>
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
              {pitch}
            </p>
          </div>

          {showProTips && (
            <div className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3 relative">
              <button
                onClick={() => setShowProTips(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                title="Hide pro tips"
              >
                ✕
              </button>
              <strong>➡️ Bridge:</strong> Use this to smoothly move from opening into discovery questions.
            </div>
          )}
        </div>
      )
    }

    // Transition to Pitch
    if (section === 'transition_to_pitch') {
      const trigger = replaceScriptVariables(data.trigger || '', context)
      const pitch = replaceScriptVariables(data.pitch || data.content || '', context)
      return (
        <div className="space-y-4">
          <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-r-lg">
            {data.trigger && (
              <>
                <div className="text-xs font-semibold text-orange-800 uppercase mb-2">When to Use</div>
                <p className="text-gray-800 text-base font-medium mb-4">
                  {trigger}
                </p>
              </>
            )}
            <div className="text-xs font-semibold text-orange-800 uppercase mb-2">Your Pitch</div>
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
              {pitch}
            </p>
          </div>

          {showProTips && (
            <div className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-3 relative">
              <button
                onClick={() => setShowProTips(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                title="Hide pro tips"
              >
                ✕
              </button>
              <strong>✅ Perfect timing:</strong> Use this after discovery to transition into your pitch.
            </div>
          )}
        </div>
      )
    }

    // Objection Response
    if (section === 'objections') {
      const objection = replaceScriptVariables(data.objection, context)
      const response = replaceScriptVariables(data.response, context)
      return (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
            <div className="text-xs font-semibold text-red-800 uppercase mb-2">Objection</div>
            <p className="text-gray-800 text-lg font-medium mb-4 italic">
              "{objection}"
            </p>
            <div className="text-xs font-semibold text-red-800 uppercase mb-2">Your Response</div>
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
              {response}
            </p>
          </div>

          {data.alternatives && data.alternatives.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-700 uppercase mb-3">
                Alternative Responses
              </div>
              <div className="space-y-3">
                {data.alternatives.map((alt, i) => {
                  const altResponse = replaceScriptVariables(alt, context)
                  return (
                    <div key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                        {i + 1}
                      </span>
                      <p className="flex-1 text-gray-700 text-base leading-relaxed">
                        {altResponse}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {showProTips && (
            <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 relative">
              <button
                onClick={() => setShowProTips(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                title="Hide pro tips"
              >
                ✕
              </button>
              <strong>🎭 Stay calm:</strong> Objections are normal. This is a conversation, not a confrontation.
            </div>
          )}
        </div>
      )
    }

    // Competitor Objections
    if (section === 'competitor_objections') {
      const { competitor, subObjection } = data
      const objection = replaceScriptVariables(subObjection.objection, context)
      const response = replaceScriptVariables(subObjection.response, context)

      return (
        <div className="space-y-4">
          {/* Main response */}
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-indigo-800 uppercase">
                Competitor
              </span>
              <span className="text-sm font-bold text-indigo-900">
                {competitor.name}
              </span>
            </div>

            <div className="text-xs font-semibold text-indigo-800 uppercase mb-2">
              Objection
            </div>
            <p className="text-gray-800 text-lg font-medium mb-4 italic">
              "{objection}"
            </p>

            <div className="text-xs font-semibold text-indigo-800 uppercase mb-2">
              Your Response
            </div>
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
              {response}
            </p>
          </div>

          {/* Alternatives */}
          {subObjection.alternatives && subObjection.alternatives.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-700 uppercase mb-3">
                Alternative Responses
              </div>
              <div className="space-y-3">
                {subObjection.alternatives.map((alt, i) => {
                  const altResponse = replaceScriptVariables(alt, context)
                  return (
                    <div key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                        {i + 1}
                      </span>
                      <p className="flex-1 text-gray-700 text-base leading-relaxed">
                        {altResponse}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Background context (collapsible) */}
          {competitor.background && (
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <summary className="text-xs font-semibold text-gray-700 uppercase cursor-pointer">
                Background: What You Need to Know ▼
              </summary>
              <p className="text-gray-700 text-sm leading-relaxed mt-2">
                {competitor.background}
              </p>
            </details>
          )}

          {/* Common objections from this competitor */}
          {competitor.commonObjections && competitor.commonObjections.length > 0 && (
            <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <summary className="text-xs font-semibold text-blue-700 uppercase cursor-pointer">
                What They'll Usually Say ▼
              </summary>
              <ul className="mt-2 space-y-1">
                {competitor.commonObjections.map((obj, i) => (
                  <li key={i} className="text-gray-700 text-sm">
                    • "{obj}"
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* Initial response framework */}
          {competitor.initialResponse && (
            <details className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <summary className="text-xs font-semibold text-purple-700 uppercase cursor-pointer">
                Initial Response Framework ▼
              </summary>
              <p className="text-gray-700 text-sm leading-relaxed mt-2 whitespace-pre-wrap">
                {competitor.initialResponse}
              </p>
            </details>
          )}

          {/* Bottom line positioning */}
          {competitor.bottomLine && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="text-xs font-semibold text-green-800 uppercase mb-2">
                Bottom Line Positioning
              </div>
              <p className="text-gray-800 text-base font-medium leading-relaxed">
                {competitor.bottomLine}
              </p>
            </div>
          )}

          {/* Pro tip */}
          {showProTips && (
            <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 relative">
              <button
                onClick={() => setShowProTips(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                title="Hide pro tips"
              >
                ✕
              </button>
              <strong>🎯 Remember:</strong> Position as complementary, not competitive.
              "We work alongside {competitor.name}, not replace it."
            </div>
          )}
        </div>
      )
    }

    return null
  }
}
