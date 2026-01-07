import { useState } from 'react'

/**
 * CallFlowNavigator - Left panel navigation tree
 * Shows all sections of the call flow with expandable/collapsible sections
 */
export default function CallFlowNavigator({ callFlow, activeSection, onSectionSelect }) {
  const [expandedSections, setExpandedSections] = useState({
    opening: true,
    discovery: true,
    transition: true,
    objections: true,
    closing: true
  })

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
    discovery: '🔍',
    transition: '🔄',
    objections: '💬',
    closing: '🤝'
  }

  // Section labels
  const sectionLabels = {
    opening: 'Opening',
    discovery: 'Discovery',
    transition: 'Transition',
    objections: 'Objections',
    closing: 'Closing'
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

        {/* TRANSITION */}
        <NavSection
          name="transition"
          label={sectionLabels.transition}
          icon={sectionIcons.transition}
          expanded={expandedSections.transition}
          onToggle={() => toggleSection('transition')}
          count={callFlow.sections.transition.length}
        >
          {callFlow.sections.transition.map((transition, index) => (
            <NavItem
              key={index}
              label={transition.trigger}
              active={isActive('transition', index)}
              onClick={() => handleItemClick('transition', index, transition)}
              number={index + 1}
            />
          ))}
        </NavSection>

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
