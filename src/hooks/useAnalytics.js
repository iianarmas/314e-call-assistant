import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAnalytics() {
  const [stats, setStats] = useState({
    totalCalls: 0,
    callsToday: 0,
    callsThisWeek: 0,
    demoRate: 0,
    discoveryRate: 0,
    dexitCalls: 0,
    muspellCalls: 0,
    avgQualificationItems: 0,
    commonObjections: []
  })
  const [recentCalls, setRecentCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all call logs
      const { data: callLogs, error: callsError } = await supabase
        .from('call_logs')
        .select(`
          *,
          contacts (
            name,
            company,
            product,
            title
          )
        `)
        .order('created_at', { ascending: false })

      if (callsError) throw callsError

      // Calculate stats
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - 7)

      const totalCalls = callLogs.length
      const callsToday = callLogs.filter(log => new Date(log.created_at) >= todayStart).length
      const callsThisWeek = callLogs.filter(log => new Date(log.created_at) >= weekStart).length

      // Outcome stats
      const demoCount = callLogs.filter(log => log.outcome === 'demo').length
      const discoveryCount = callLogs.filter(log => log.outcome === 'discovery').length
      const demoRate = totalCalls > 0 ? ((demoCount / totalCalls) * 100).toFixed(1) : 0
      const discoveryRate = totalCalls > 0 ? ((discoveryCount / totalCalls) * 100).toFixed(1) : 0

      // Product breakdown
      const dexitCalls = callLogs.filter(log => log.contacts?.product === 'Dexit').length
      const muspellCalls = callLogs.filter(log => log.contacts?.product === 'Muspell').length

      // Average qualification items (for Dexit calls)
      const dexitCallsWithQual = callLogs.filter(log =>
        log.contacts?.product === 'Dexit' && log.qualification_data?.completedItems
      )
      const avgQualificationItems = dexitCallsWithQual.length > 0
        ? (dexitCallsWithQual.reduce((sum, log) => sum + log.qualification_data.completedItems, 0) / dexitCallsWithQual.length).toFixed(1)
        : 0

      // Common objections
      const objectionMap = {}
      callLogs.forEach(log => {
        if (log.objections_handled && Array.isArray(log.objections_handled)) {
          log.objections_handled.forEach(obj => {
            const key = obj.objection?.toLowerCase().trim()
            if (key) {
              objectionMap[key] = (objectionMap[key] || 0) + 1
            }
          })
        }
      })

      const commonObjections = Object.entries(objectionMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([objection, count]) => ({ objection, count }))

      setStats({
        totalCalls,
        callsToday,
        callsThisWeek,
        demoRate,
        discoveryRate,
        dexitCalls,
        muspellCalls,
        avgQualificationItems,
        commonObjections
      })

      // Recent calls (last 20)
      setRecentCalls(callLogs.slice(0, 20))

      setLoading(false)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  return {
    stats,
    recentCalls,
    loading,
    error,
    refresh: fetchAnalytics
  }
}
