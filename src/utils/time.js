export function parseHMS(hms){
  // accepts "mm:ss" or "hh:mm:ss"
  if(!hms) return NaN
  const parts = hms.split(':').map(Number)
  if(parts.some(n=>Number.isNaN(n))) return NaN
  if(parts.length===2){
    const [m,s] = parts; return m*60 + s
  }
  if(parts.length===3){
    const [h,m,s] = parts; return h*3600 + m*60 + s
  }
  return NaN
}

export function fmtHMS(totalSec){
  const h = Math.floor(totalSec/3600)
  const m = Math.floor((totalSec%3600)/60)
  const s = Math.floor(totalSec%60)
  const pad = (n)=>String(n).padStart(2,'0')
  return h>0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function calcPaceSec(totalSec, distance){
  return Math.round(totalSec / distance)
}

export function secondsToPace(sec){
  const m = Math.floor(sec/60)
  const s = sec % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

