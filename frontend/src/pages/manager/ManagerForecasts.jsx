import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { fetchForecastData } from '../../services/managerApi';

const Page = styled.div`padding:2rem 2.25rem 3rem; background:#f8fafc;`;
const Title = styled.h1`margin:0 0 1.3rem; font-size:1.45rem; font-weight:700;`;
const Grid = styled.div`display:grid; gap:1.4rem; grid-template-columns:repeat(auto-fit,minmax(340px,1fr));`;
const Card = styled.div`
  background:#fff; border:1px solid #e2e8f0; border-radius:22px;
  padding:1.4rem 1.5rem 1.55rem; display:flex; flex-direction:column; gap:.9rem;
  box-shadow:0 4px 14px -5px rgba(0,0,0,.05);
`;
const SectionTitle = styled.h2`margin:0; font-size:1rem; font-weight:700;`;
const Suggestions = styled.ul`
  list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.55rem;
  li{background:#f1f5f9; padding:.6rem .7rem; border-radius:10px; font-size:.65rem; font-weight:500; color:#334155;}
`;
const ChartBox = styled.div`
  background:#f8fafc; border:1px dashed #cbd5e1; height:220px;
  border-radius:16px; display:flex; align-items:center; justify-content:center;
  font-size:.65rem; color:#64748b; font-weight:500;
`;

const ManagerForecasts = () => {
  const [department, setDepartment] = useState('All');
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchForecastData({ department });
      setForecasts(res.forecasts);
      setSuggestions(res.suggestions);
      setLoading(false);
    })();
  }, [department]);

  if (loading) return <div>Loading forecasts...</div>;

  return (
    <Page>
      <Title>AI Forecasts</Title>
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
        <ul>
          {suggestions.map((s,i)=> <li key={i}><strong>{s.item}</strong>: {s.reason}</li>)}
        </ul>
      </section>
    </Page>
  );
};
const btnStyle = {
  background:'#4834d4', color:'#fff', border:'none',
  padding:'.6rem .9rem', fontSize:'.65rem', fontWeight:600,
  borderRadius:'10px', cursor:'pointer'
};
export default ManagerForecasts;

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