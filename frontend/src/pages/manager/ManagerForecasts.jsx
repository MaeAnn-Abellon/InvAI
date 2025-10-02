import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
// Replacing mock forecast with real backend depletion projection
import { inventoryApi } from '../../services/inventoryApi';

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
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // derived client-side
  const [error, setError] = useState(null);
  const [windowDays, setWindowDays] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await inventoryApi.forecastDepletion({ windowDays });
        const list = data.forecasts || [];
        setForecasts(list);
        // Simple suggestion heuristic: items with daysToDeplete <= 14 or already out_of_stock
        const sug = list
          .filter(it => (it.daysToDeplete !== null && it.daysToDeplete <= 14) || it.status === 'out_of_stock')
          .slice(0,10)
          .map(it => ({
            item: it.name,
            reason: it.status === 'out_of_stock' ? 'Already out of stock' : `Projected depletion in ${Math.round(it.daysToDeplete)} days`
          }));
        setSuggestions(sug);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [windowDays]);

  if (loading) return <div>Loading forecasts...</div>;

  return (
    <Page>
      <Title>AI Depletion Forecasts</Title>
      <div style={{display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap'}}>
        <label style={{fontSize:'.75rem'}}>Window (days)
          <select value={windowDays} onChange={e=>setWindowDays(parseInt(e.target.value,10))} style={{marginLeft:'.4rem'}}>
            {[14,30,60,90].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        {error && <span style={{color:'#dc2626', fontSize:'.7rem'}}>Error: {error}</span>}
        <small style={{color:'#64748b'}}>Heuristic forecast based on recent approved claims.</small>
      </div>

      <section>
        <h3>Projected Depletion</h3>
        <table style={{width:'100%', fontSize:'.7rem', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left', background:'#f1f5f9'}}>
              <th style={{padding:'.4rem'}}>Item</th>
              <th style={{padding:'.4rem'}}>Qty</th>
              <th style={{padding:'.4rem'}}>Avg Daily Use</th>
              <th style={{padding:'.4rem'}}>Days Left</th>
              <th style={{padding:'.4rem'}}>Depletion Date</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map(it => (
              <tr key={it.id} style={{borderTop:'1px solid #e2e8f0'}}>
                <td style={{padding:'.45rem .4rem'}}>{it.name}</td>
                <td style={{padding:'.45rem .4rem'}}>{it.quantity}</td>
                <td style={{padding:'.45rem .4rem'}}>{it.avgDailyUsage?.toFixed(2)}</td>
                <td style={{padding:'.45rem .4rem'}}>{it.daysToDeplete ? Math.round(it.daysToDeplete) : '—'}</td>
                <td style={{padding:'.45rem .4rem'}}>{it.projectedDepletionDate ? new Date(it.projectedDepletionDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {!forecasts.length && (
              <tr><td colSpan={5} style={{padding:'.7rem', textAlign:'center', color:'#64748b'}}>No usage data in window.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section style={{marginTop:'1.5rem'}}>
        <h3>Suggested Restocking (Next 2 Weeks)</h3>
        <ul style={{fontSize:'.7rem', paddingLeft:'1rem'}}>
          {suggestions.map((s,i)=> <li key={i} style={{marginBottom:'.3rem'}}><strong>{s.item}</strong>: {s.reason}</li>)}
          {!suggestions.length && <li style={{color:'#64748b'}}>No urgent restock suggestions.</li>}
        </ul>
      </section>
    </Page>
  );
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