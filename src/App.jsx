//Angelica Parra

import React, { useState } from 'react';   // useState
import MultiStepForm from './components/MultiStepForm.jsx';
import RunList from './components/RunList.jsx';
import { useLocalRuns } from './hooks/useLocalRuns.js';

export default function App(){
  const { runs, addRun, updateRun, removeRun, clearAll, exportCSV } = useLocalRuns();

  // track the run currently being edited (or null if creating)
  const [editingRun, setEditingRun] = useState(null);

  // single handler for create vs update
  function handleFormSubmit(entry) {
    if (editingRun) {
      // use the existing id; ignore any id coming from the form
      const { id: _ignore, ...patch } = entry;
      updateRun(editingRun.id, patch);
      setEditingRun(null);
    } else {
      addRun(entry);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>My Running Log</h1>
        <p>Enter date → distance → time → mood → weight. Entries auto-save to your log.</p>
      </header>

      <section className="card">
        <h2>{editingRun ? 'Edit Run' : 'Add a Run'}</h2>
        <MultiStepForm
          onSubmit={handleFormSubmit}
          editingRun={editingRun}                 // pass the run being edited (or null)
          onCancelEdit={() => setEditingRun(null)}// optional cancel
        />
      </section>

      <section className="card">
        <div className="listHeader">
          <h2>Run History</h2>
          <div className="actions">
            <button className="secondary" onClick={exportCSV}>Export CSV</button>
            <button className="danger" onClick={clearAll}>Clear All</button>
          </div>
        </div>
        <RunList
          runs={runs}
          onEdit={setEditingRun}   // when you click Edit on a row, this sets editingRun
          onDelete={removeRun}
        />
      </section>

      <footer className="footer">Built with React • Data stored locally in your browser</footer>
    </div>
  )
}
