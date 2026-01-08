import { useState } from 'react'

/**
 * CallFlowNavigator - Left panel navigation tree
 * Shows all sections of the call flow with expandable/collapsible sections
 */
export default function CallFlowNavigator({ callFlow, activeSection, onSectionSelect }) {
  const [expandedSections, setExpandedSections] = useState({
    opening: true,
    transition_to_discovery: true,
    discovery: true,
    transition_to_pitch: true,
    objections: true,
    competitor_objections: false,
    closing: true
  })

  const [expandedCompetitors, setExpandedCompetitors] = useState({})

  if (!callFlow) {
    return (
      <div className="h-full bg-white border-r border-gray-200 p-4">
        <div className="text-gray-500 text-sm">No call flow loaded</div>
      </div>
    )
  }

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const handleItemClick = (sectionName, itemIndex = null, itemData = null) => {
    onSectionSelect({
      section: sectionName,
      index: itemIndex,
      data: itemData
    })
  }

  // Section icons
  const sectionIcons = {
    opening: '👋',
    transition_to_discovery: '➡️',
    discovery: '🔍',
    transition_to_pitch: '🔄',
    objections: '💬',
    competitor_objections: '🏢',
    closing: '🤝'
  }

  // Section labels
  const sectionLabels = {
    opening: 'Opening',
    transition_to_discovery: 'Transition to Discovery',
    discovery: 'Discovery',
    transition_to_pitch: 'Transition to Pitch',
    objections: 'Objections',
    competitor_objections: 'Competitor Objections',
    closing: 'Closing'
  }

  const toggleCompetitor = (competitorId) => {
    setExpandedCompetitors(prev => ({
      ...prev,
      [competitorId]: !prev[competitorId]
    }))
  }

  const isActive = (sectionName, itemIndex = null) => {
    if (!activeSection) return false
    if (itemIndex !== null) {
      return activeSection.section === sectionName && activeSection.index === itemIndex
    }
    return activeSection.section === sectionName
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-sm font-semibold text-gray-700 uppercase mb-2">Call Flow</h2>
        <h3 className="text-md font-bold text-gray-900">{callFlow.name}</h3>
        <p className="text-xs text-gray-500 mt-1">
          {callFlow.product} • {callFlow.approach}
        </p>
      </div>

      {/* Navigation Tree */}
      <div className="p-2">
        {/* OPENING */}
        <NavSection
          name="opening"
          label={sectionLabels.opening}
          icon={sectionIcons.opening}
          expanded={expandedSections.opening}
          onToggle={() => toggleSection('opening')}
          count={callFlow.sections.opening.versions.length}
        >
          {callFlow.sections.opening.versions.map((version, index) => (
            <NavItem
              key={index}
              label={`${version.label}`}
              active={isActive('opening', index)}
              onClick={() => handleItemClick('opening', index, version)}
              badge={`v${version.number}`}
            />
          ))}
        </NavSection>

        {/* TRANSITION TO DISCOVERY */}
        {callFlow.sections.transition_to_discovery && callFlow.sections.transition_to_discovery.length > 0 && (
          <NavSection
            name="transition_to_discovery"
            label={sectionLabels.transition_to_discovery}
            icon={sectionIcons.transition_to_discovery}
            expanded={expandedSections.transition_to_discovery}
            onToggle={() => toggleSection('transition_to_discovery')}
            count={callFlow.sections.transition_to_discovery.length}
          >
            {callFlow.sections.transition_to_discovery.map((transition, index) => (
              <NavItem
                key={index}
                label={transition.dbScriptName || transition.label || (transition.trigger && transition.trigger !== 'Custom' ? transition.trigger : `Version ${index + 1}`)}
                active={isActive('transition_to_discovery', index)}
                onClick={() => handleItemClick('transition_to_discovery', index, transition)}
                number={index + 1}
              />
            ))}
          </NavSection>
        )}

        {/* DISCOVERY */}
        <NavSection
          name="discovery"
          label={sectionLabels.discovery}
          icon={sectionIcons.discovery}
          expanded={expandedSections.discovery}
          onToggle={() => toggleSection('discovery')}
          count={callFlow.sections.discovery.length}
        >
          {callFlow.sections.discovery.map((question, index) => (
            <NavItem
              key={index}
              label={question.question}
              active={isActive('discovery', index)}
              onClick={() => handleItemClick('discovery', index, question)}
              number={index + 1}
            />
          ))}
        </NavSection>

        {/* TRANSITION TO PITCH */}
        {callFlow.sections.transition_to_pitch && callFlow.sections.transition_to_pitch.length > 0 && (
          <NavSection
            name="transition_to_pitch"
            label={sectionLabels.transition_to_pitch}
            icon={sectionIcons.transition_to_pitch}
            expanded={expandedSections.transition_to_pitch}
            onToggle={() => toggleSection('transition_to_pitch')}
            count={callFlow.sections.transition_to_pitch.length}
          >
            {callFlow.sections.transition_to_pitch.map((transition, index) => (
              <NavItem
                key={index}
                label={transition.dbScriptName || transition.label || (transition.trigger && transition.trigger !== 'Custom' ? transition.trigger : `Version ${index + 1}`)}
                active={isActive('transition_to_pitch', index)}
                onClick={() => handleItemClick('transition_to_pitch', index, transition)}
                number={index + 1}
              />
            ))}
          </NavSection>
        )}

        {/* OBJECTIONS */}
        <NavSection
          name="objections"
          label={sectionLabels.objections}
          icon={sectionIcons.objections}
          expanded={expandedSections.objections}
          onToggle={() => toggleSection('objections')}
          count={callFlow.sections.objections.length}
        >
          {callFlow.sections.objections.map((objection, index) => (
            <NavItem
              key={index}
              label={objection.objection}
              active={isActive('objections', index)}
              onClick={() => handleItemClick('objections', index, objection)}
              number={index + 1}
            />
          ))}
        </NavSection>

        {/* COMPETITOR OBJECTIONS */}
        {callFlow.sections.competitor_objections && callFlow.sections.competitor_objections.competitors && callFlow.sections.competitor_objections.competitors.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => toggleSection('competitor_objections')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{sectionIcons.competitor_objections}</span>
                <span>{sectionLabels.competitor_objections}</span>
                <span className="text-xs text-gray-500">
                  ({callFlow.sections.competitor_objections.competitors.reduce((sum, c) => sum + c.subObjections.length, 0)})
                </span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${expandedSections.competitor_objections ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {expandedSections.competitor_objections && (
              <div className="ml-4 mt-2 space-y-1">
                {callFlow.sections.competitor_objections.competitors.map((competitor) => (
                  <div key={competitor.id}>
                    {/* Competitor name (collapsible) */}
                    <button
                      onClick={() => toggleCompetitor(competitor.id)}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{competitor.name}</span>
                        <span className="text-xs text-gray-500">({competitor.subObjections.length})</span>
                      </div>
                      <svg
                        className={`w-3 h-3 transition-transform ${expandedCompetitors[competitor.id] ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Sub-objections */}
                    {expandedCompetitors[competitor.id] && (
                      <div className="ml-4 space-y-1">
                        {competitor.subObjections.map((subObj, idx) => (
                          <button
                            key={subObj.id}
                            onClick={() => handleItemClick('competitor_objections', idx, { competitor, subObjection: subObj })}
                            className={`
                              w-full text-left px-3 py-2 text-sm rounded transition-colors
                              ${activeSection?.section === 'competitor_objections' &&
                                activeSection?.data?.competitor?.id === competitor.id &&
                                activeSection?.data?.subObjection?.id === subObj.id
                                ? 'bg-indigo-100 text-indigo-900 font-medium'
                                : 'hover:bg-gray-50 text-gray-700'
                              }
                            `}
                          >
                            <span className="text-xs text-gray-500 mr-2">{idx + 1}.</span>
                            "{subObj.objection}"
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CLOSING */}
        <NavSection
          name="closing"
          label={sectionLabels.closing}
          icon={sectionIcons.closing}
          expanded={expandedSections.closing}
          onToggle={() => toggleSection('closing')}
          count={callFlow.sections.closing.versions.length}
        >
          {callFlow.sections.closing.versions.map((version, index) => (
            <NavItem
              key={index}
              label={version.label}
              active={isActive('closing', index)}
              onClick={() => handleItemClick('closing', index, version)}
              badge={`v${version.number}`}
            />
          ))}
        </NavSection>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <div className="font-medium mb-2">Keyboard Shortcuts:</div>
        <div className="space-y-1">
          <div><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">1</kbd> Opening</div>
          <div><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">2</kbd> Discovery</div>
          <div><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">3</kbd> Transition</div>
          <div><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">4</kbd> Objections</div>
          <div><kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">5</kbd> Closing</div>
        </div>
      </div>
    </div>
  )
}

/**
 * NavSection - Collapsible section header
 */
function NavSection({ name, label, icon, expanded, onToggle, count, children }) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span>{label}</span>
          <span className="text-xs text-gray-500">({count})</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && (
        <div className="ml-4 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * NavItem - Individual navigation item
 */
function NavItem({ label, active, onClick, number, badge }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-start gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left
        ${active
          ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      {number && (
        <span className={`
          flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs
          ${active ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}
        `}>
          {number}
        </span>
      )}
      {badge && (
        <span className={`
          flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium
          ${active ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}
        `}>
          {badge}
        </span>
      )}
      <span className="flex-1 line-clamp-2">{label}</span>
    </button>
  )
}
