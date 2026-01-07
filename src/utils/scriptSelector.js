/**
 * Select the best matching script from database based on contact data
 */

export function selectDatabaseScript(contact, scripts, scriptType = 'opening') {
  if (!scripts || scripts.length === 0) return null

  const { product, title, trigger_type } = contact

  // Filter scripts by product and type
  let candidates = scripts.filter(s =>
    s.product === product &&
    s.script_type === scriptType &&
    s.is_active === true
  )

  if (candidates.length === 0) return null

  // For Dexit opening scripts, match by approach
  if (product === 'Dexit' && scriptType === 'opening') {
    // Determine approach from title
    const isIT = title?.toLowerCase().includes('it') ||
                 title?.toLowerCase().includes('information technology') ||
                 title?.toLowerCase().includes('director of applications') ||
                 title?.toLowerCase().includes('technology')

    const isProvider = title?.toLowerCase().includes('provider') ||
                      title?.toLowerCase().includes('ambulatory') ||
                      title?.toLowerCase().includes('physician')

    const targetApproach = isProvider ? 'Provider' : (isIT ? 'IT' : 'HIM')

    // Try to find exact approach match
    const approachMatch = candidates.find(s => s.approach === targetApproach)
    if (approachMatch) return approachMatch

    // Fall back to any Dexit opening script
    return candidates[0]
  }

  // For Muspell scripts, match by trigger_type
  if (product === 'Muspell' && trigger_type) {
    const triggerMatch = candidates.find(s => s.trigger_type === trigger_type)
    if (triggerMatch) return triggerMatch
  }

  // Return first active script (latest version)
  return candidates[0]
}

/**
 * Get the highest version script in a version chain
 */
export function getLatestVersion(scriptId, allScripts) {
  // Find all versions in the chain
  const versions = allScripts.filter(s =>
    s.id === scriptId ||
    s.parent_script_id === scriptId
  )

  // Sort by version number descending
  versions.sort((a, b) => b.version - a.version)

  return versions[0]
}

/**
 * Increment usage count for a script
 */
export async function incrementScriptUsage(scriptId, supabase) {
  try {
    const { error } = await supabase.rpc('increment_script_usage', {
      script_id: scriptId
    })

    if (error) {
      // If RPC doesn't exist, fall back to manual increment
      const { data: script } = await supabase
        .from('scripts')
        .select('usage_count')
        .eq('id', scriptId)
        .single()

      if (script) {
        await supabase
          .from('scripts')
          .update({ usage_count: (script.usage_count || 0) + 1 })
          .eq('id', scriptId)
      }
    }
  } catch (err) {
    console.warn('Failed to increment script usage:', err)
  }
}
