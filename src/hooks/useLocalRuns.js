//database manager
import { useCallback, useEffect, useState } from 'react'

const KEY = 'runs_v1'

export function useLocalRuns(){
  const [runs, setRuns] = useState(()=>{
    try { return JSON.parse(localStorage.getItem(KEY)) || [] }
    catch { return [] }
  })

  useEffect(()=>{
    localStorage.setItem(KEY, JSON.stringify(runs))
  }, [runs])

  const addRun = useCallback((entry)=>{
    setRuns(prev=>[...prev, entry])
  }, [])

  const updateRun = useCallback((id, patch)=>{
    setRuns(prev=>prev.map(r=> r.id===id ? {...r, ...patch} : r))
  }, [])

  const removeRun = useCallback((id)=>{
    setRuns(prev=>prev.filter(r=>r.id!==id))
  }, [])

  const clearAll = useCallback(()=>{
    if(confirm('Delete ALL runs?')) setRuns([])
  }, [])

  const exportCSV = useCallback(()=>{
    if(!runs.length) return alert('No data to export')
    const header = ['date','distance','time','pace','speed','mood','weight']
    const rows = runs.map(r=>[
      r.date,
      r.distance.toFixed(2),
      r.timeSec,
      r.paceSec,
      r.speedMph.toFixed(2),
      r.mood||'',
      r.weight?.toFixed?.(1) || ''
    ])
    const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'running-log.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [runs])

  return { runs, addRun, updateRun, removeRun, clearAll, exportCSV }
}