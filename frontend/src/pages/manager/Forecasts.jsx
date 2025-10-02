import React, { useEffect, useState } from 'react';

export default function Forecasts() {
  const [department, setDepartment] = useState('All');
  const [forecasts, setForecasts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setForecasts([
      { id: 1, label: 'Agri Seeds', data: [5,7,9,14,13], unit: 'packs' },
      { id: 2, label: 'IT Cables', data: [2,3,5,5,8], unit: 'pcs' },
    ]);
    setSuggestions([
      { item: 'Fertilizer', reason: 'Projected shortage in 3 weeks' },
      { item: 'LAN Cable', reason: 'Usage trending up' },
    ]);
  }, [department]);

  const exportData = fmt => console.log('Export', fmt);

  return (
    <div className="manager-forecasts">
      <h2>AI Forecasts</h2>
      <label>Department
        <select value={department} onChange={e=>setDepartment(e.target.value)}>
          <option>All</option>
          <option>Agriculture</option>
          <option>Fisheries</option>
          <option>IT</option>
        </select>
      </label>
      <section>
        <h3>Forecast Graphs (mock)</h3>
        <div className="graphs">
          {forecasts.map(f => (
            <div key={f.id} className="forecast-card">
              <strong>{f.label}</strong>
              <MiniLine data={f.data} />
              <small>Unit: {f.unit}</small>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3>Suggested Restocking</h3>
        <ul>{suggestions.map((s,i)=> <li key={i}><strong>{s.item}</strong>: {s.reason}</li>)}</ul>
      </section>
      <section>
        <h3>Export</h3>
        <button onClick={()=>exportData('csv')}>CSV</button>
        <button onClick={()=>exportData('excel')}>Excel</button>
        <button onClick={()=>exportData('pdf')}>PDF</button>
      </section>
    </div>
  );
}

function MiniLine({ data }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  return (
    <svg width="120" height="40">
      {data.map((v,i) => {
        if (i === 0) return null;
        const x1 = ((i-1)/(data.length-1))*120;
        const x2 = (i/(data.length-1))*120;
        const y1 = 40 - (data[i-1]/max)*35 - 2;
        const y2 = 40 - (v/max)*35 - 2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4b82f7" strokeWidth="2"/>;
      })}
    </svg>
  );
}