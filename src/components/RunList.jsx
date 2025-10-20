import React, { useMemo, useState } from 'react';
import { fmtHMS, secondsToPace } from '../utils/time.js';

export default function RunList({ runs, onEdit, onDelete }){
  const [sortBy, setSortBy] = useState('date_desc');

  const sorted = useMemo(() => {
    const arr = [...runs];
    switch (sortBy){
      case 'date_asc': arr.sort((a,b)=>a.date.localeCompare(b.date)); break;
      case 'pace_best': arr.sort((a,b)=>a.paceSec-b.paceSec); break;
      case 'distance_desc': arr.sort((a,b)=>b.distance-a.distance); break;
      default: arr.sort((a,b)=>b.date.localeCompare(a.date));
    }
    return arr;
  }, [runs, sortBy]);

  if (!runs.length) return <p className="muted">No runs yet. Add your first one above!</p>

  return (
    <div>
      <div className="toolbar">
        <label>Sort: </label>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="date_desc">Newest</option>
          <option value="date_asc">Oldest</option>
          <option value="pace_best">Best Pace</option>
          <option value="distance_desc">Longest Distance</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Distance</th>
            <th>Time</th>
            <th>Pace</th>
            <th>Speed</th>
            <th>Mood</th>
            <th>Weight</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
        {sorted.map(run => (
          <tr key={run.id}>
            <td>{new Date(run.date + 'T00:00:00').toLocaleDateString()}</td>
            <td>{run.distance.toFixed(2)} mi</td>
            <td>{fmtHMS(run.timeSec)}</td>
            <td>{secondsToPace(run.paceSec)} /mi</td>
            <td>{run.speedMph.toFixed(2)} mph</td>
            <td>
              {run.mood === "energetic" && "😀 Energetic"}
              {run.mood === "active" && "🙂 Active"}
              {run.mood === "slow" && "😐 Slow"}
              {run.mood === "tired" && "🙁 Tired"}
            </td>
            <td>{run.weight ? `${run.weight.toFixed(1)} lbs` : '—'}</td>
            <td>
              <button onClick={() => onEdit(run)}>Edit</button>
              <button className="danger" onClick={()=>onDelete(run.id)}>Delete</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}