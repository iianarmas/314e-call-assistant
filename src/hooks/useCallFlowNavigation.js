import { useState, useEffect } from 'react'

/**
 * useCallFlowNavigation Hook
 * Manages navigation state for call flow sections
 * Handles active section, keyboard shortcuts, and section history
 */
export function useCallFlowNavigation(callFlow) {
  const [activeSection, setActiveSection] = useState(null)
  const [sectionHistory, setSectionHistory] = useState([])

  // Auto-select first opening on call flow load
  useEffect(() => {
    if (callFlow && !activeSection) {
      // Auto-select first opening version
      if (callFlow.sections.opening.versions.length > 0) {
        setActiveSection({
          section: 'opening',
          index: 0,
          data: callFlow.sections.opening.versions[0]
        })
      }
    }
  }, [callFlow])

  /**
   * Navigate to a specific section
   */
  const navigateToSection = (sectionData) => {
    // Add current section to history
    if (activeSection) {
      setSectionHistory(prev => [...prev, activeSection].slice(-10)) // Keep last 10
    }

    setActiveSection(sectionData)
  }

  /**
   * Navigate back to previous section
   */
  const navigateBack = () => {
    if (sectionHistory.length > 0) {
      const previous = sectionHistory[sectionHistory.length - 1]
      setSectionHistory(prev => prev.slice(0, -1))
      setActiveSection(previous)
    }
  }

  /**
   * Jump to section by number (for keyboard shortcuts)
   * 1 = Opening, 2 = Discovery, 3 = Transition, 4 = Objections, 5 = Closing
   */
  const jumpToSectionByNumber = (number) => {
    if (!callFlow) return

    const sectionMap = {
      1: 'opening',
      2: 'discovery',
      3: 'transition',
      4: 'objections',
      5: 'closing'
    }

    const sectionName = sectionMap[number]
    if (!sectionName) return

    const section = callFlow.sections[sectionName]
    if (!section) return

    // For opening/closing, select first version
    if (sectionName === 'opening' || sectionName === 'closing') {
      if (section.versions && section.versions.length > 0) {
        navigateToSection({
          section: sectionName,
          index: 0,
          data: section.versions[0]
        })
      }
    }
    // For discovery/transition/objections, select first item
    else if (Array.isArray(section) && section.length > 0) {
      navigateToSection({
        section: sectionName,
        index: 0,
        data: section[0]
      })
    }
  }

  /**
   * Navigate to next item in current section
   */
  const navigateNext = () => {
    if (!activeSection || !callFlow) return

    const { section, index } = activeSection
    const currentSection = callFlow.sections[section]

    if (!currentSection) return

    // For opening/closing
    if (section === 'opening' || section === 'closing') {
      const nextIndex = index + 1
      if (nextIndex < currentSection.versions.length) {
        navigateToSection({
          section,
          index: nextIndex,
          data: currentSection.versions[nextIndex]
        })
      }
    }
    // For discovery/transition/objections
    else if (Array.isArray(currentSection)) {
      const nextIndex = index + 1
      if (nextIndex < currentSection.length) {
        navigateToSection({
          section,
          index: nextIndex,
          data: currentSection[nextIndex]
        })
      }
    }
  }

  /**
   * Navigate to previous item in current section
   */
  const navigatePrevious = () => {
    if (!activeSection || !callFlow) return

    const { section, index } = activeSection
    const currentSection = callFlow.sections[section]

    if (!currentSection || index === 0) return

    // For opening/closing
    if (section === 'opening' || section === 'closing') {
      const prevIndex = index - 1
      if (prevIndex >= 0) {
        navigateToSection({
          section,
          index: prevIndex,
          data: currentSection.versions[prevIndex]
        })
      }
    }
    // For discovery/transition/objections
    else if (Array.isArray(currentSection)) {
      const prevIndex = index - 1
      if (prevIndex >= 0) {
        navigateToSection({
          section,
          index: prevIndex,
          data: currentSection[prevIndex]
        })
      }
    }
  }

  /**
   * Get sections viewed (for analytics)
   */
  const getSectionsViewed = () => {
    const viewed = new Set()

    // Add current section
    if (activeSection) {
      viewed.add(activeSection.section)
    }

    // Add history
    sectionHistory.forEach(item => {
      viewed.add(item.section)
    })

    return Array.from(viewed)
  }

  /**
   * Get section view count (for analytics)
   */
  const getSectionViewCount = () => {
    const counts = {
      opening: 0,
      discovery: 0,
      transition: 0,
      objections: 0,
      closing: 0
    }

    // Count current
    if (activeSection) {
      counts[activeSection.section]++
    }

    // Count history
    sectionHistory.forEach(item => {
      counts[item.section]++
    })

    return counts
  }

  return {
    activeSection,
    navigateToSection,
    navigateBack,
    jumpToSectionByNumber,
    navigateNext,
    navigatePrevious,
    sectionHistory,
    getSectionsViewed,
    getSectionViewCount
  }
}

/**
 * Example usage:
 *
 * const {
 *   activeSection,
 *   navigateToSection,
 *   jumpToSectionByNumber,
 *   navigateNext,
 *   navigatePrevious
 * } = useCallFlowNavigation(callFlow)
 *
 * // Navigate to a specific section
 * navigateToSection({
 *   section: 'objections',
 *   index: 2,
 *   data: callFlow.sections.objections[2]
 * })
 *
 * // Jump to section using keyboard shortcut
 * jumpToSectionByNumber(1) // Opening
 * jumpToSectionByNumber(4) // Objections
 *
 * // Navigate within section
 * navigateNext()
 * navigatePrevious()
 */
