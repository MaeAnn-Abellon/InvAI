import React, { useState } from 'react';
import { generateReport } from '../../services/managerAPI';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState(null);

  const run = async () => {
    setLoading(true);
    const r = await generateReport({ type: 'monthly-inventory', format: 'pdf' });
    setLast(r);
    setLoading(false);
  };

  return (
    <div className="manager-reports">
      <h2>Reports (Mock)</h2>
      <button onClick={run} disabled={loading}>{loading ? 'Generating...' : 'Generate Report'}</button>
      {last && (
        <div className="report-result">
          <p>Type: {last.type}</p>
            <p>Format: {last.format}</p>
            <p>Generated: {last.generatedAt}</p>
            <p>Download: {last.url}</p>
        </div>
      )}
    </div>
  );
}