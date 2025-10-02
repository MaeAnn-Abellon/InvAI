import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '@/services/inventoryApi';

export default function Dashboard() {
  // Removed recentRequests (per requirement)
  // Removed forecastHighlights & notifications (unused mock content)
  const [analytics, setAnalytics] = useState({ items:[], claims:[], returns:{ pending_returns:0 }});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const navigate = useNavigate();

  // Removed mock dashboard fetch (no longer needed)

  useEffect(()=>{
    (async()=>{
      setAnalyticsLoading(true);
      try {
        const data = await inventoryApi.analyticsSummary();
        setAnalytics(data);
      } catch(e){ console.error('analytics error', e); }
      finally { setAnalyticsLoading(false); }
    })();
  }, []);

  // no loading gate (analytics has its own loading state)

  return (
    <div className="manager-dashboard" style={{ padding: '1.75rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem', gap:'1rem', flexWrap:'wrap' }}>
        <h2 style={{ margin: 0 }}>Manager Dashboard</h2>
        <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap' }}>
          <QuickBtn onClick={()=>navigate('/manager/inventory')}>Inventory</QuickBtn>
          <QuickBtn onClick={()=>navigate('/manager/claims')}>Claims</QuickBtn>
          <QuickBtn onClick={()=>navigate('/manager/returns')}>Returns</QuickBtn>
          <QuickBtn onClick={()=>navigate('/reports')}>Reports</QuickBtn>
        </div>
      </div>

  {/* Separate status sections replacing previous combined AnalyticsBar */}
  <StatusSections analytics={analytics} loading={analyticsLoading} />

      {/** Derive total items from analytics (manager-scoped) instead of mock overview */}
      <div className="overview-cards" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <AnimatedCard
          label="Total Items"
          value={analytics.items.reduce((a,c)=> a + (c.count||0), 0)}
          color="#6366f1"
          breakdown={(function(){
            const eq = analytics.items.filter(i=>i.category==='equipment').reduce((a,c)=>a+(c.count||0),0);
            const sup = analytics.items.filter(i=>i.category==='supplies').reduce((a,c)=>a+(c.count||0),0);
            return [
              { label:'Equipment', value:eq, color:'#6366f1' },
              { label:'Supplies', value:sup, color:'#0ea5e9' }
            ];
          })()}
        />
        <AnimatedCard label="Pending Claims" value={(analytics.claims.find(c=>c.status==='pending')||{}).count || 0} color="#f59e0b" />
        <AnimatedCard label="Pending Returns" value={analytics.returns.pending_returns || 0} color="#f97316" />
        <AnimatedCard label="Low Stock (Supplies Out)" value={analytics.items.filter(i=>i.category==='supplies' && i.status==='out_of_stock').reduce((a,c)=>a+c.count,0)} color="#dc2626" />
      </div>

      <div style={{ display:'grid', gap:'1.25rem', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', alignItems:'start' }}>
        <Panel title="Item Status Distribution">
          <PieChart data={aggregateForPie(analytics.items)} colors={['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#64748b']} />
        </Panel>
        <Panel title="Claim Statuses">
          <BarChart data={aggregateKeyCounts(analytics.claims,'status')} colors={{ pending:'#f59e0b', approved:'#16a34a', rejected:'#dc2626' }} />
        </Panel>
        <Panel title="Return States">
          <ReturnStatus returnsData={analytics.returns} />
          <div style={{ marginTop:'.9rem' }}>
            <PieChart data={returnBreakdownPie(analytics.returns)} colors={['#f97316','#10b981','#64748b']} size={140} />
          </div>
        </Panel>
        <Panel title="Item Status Lists">
          <ItemStatusList items={analytics.items} />
        </Panel>
      </div>
    </div>
  );
}

function AnimatedCard({ label, value, color, breakdown }) {
  const [hover, setHover] = useState(false);
  const total = value || 0;
  return (
    <div
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, position:'relative',
        padding:'1rem 1.1rem 1.2rem', minWidth:140, overflow:'hidden', cursor: breakdown? 'pointer':'default',
        animation:'fadeIn .6s ease', boxShadow:'0 4px 14px -6px rgba(0,0,0,.08)', transition:'transform .25s'
      }}>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, ${color}15, transparent 70%)` }} />
      <span style={{ fontSize:'.6rem', fontWeight:600, letterSpacing:.5, textTransform:'uppercase', color:'#475569' }}>{label}</span>
      <div style={{ fontSize:'1.7rem', fontWeight:700, marginTop:'.2rem', color:'#0f172a', display:'flex', alignItems:'flex-end', gap:'.4rem' }}>
        <AnimatedNumber value={value} />
      </div>
      {breakdown && hover && (
        <div style={{ position:'absolute', inset:0, backdropFilter:'blur(2px)', background:'rgba(255,255,255,.92)', display:'flex', flexDirection:'column', padding:'.6rem .7rem', gap:'.45rem', animation:'fadeIn .25s ease' }}>
          <span style={{ fontSize:'.55rem', fontWeight:700, letterSpacing:.5, color:'#334155' }}>Breakdown</span>
          <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'.3rem', fontSize:'.55rem' }}>
            {breakdown.map(b => {
              const pct = total? ((b.value/total)*100).toFixed(1) : 0;
              return (
                <li key={b.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:10, height:10, background:b.color, borderRadius:2 }} />
                    {b.label}
                  </span>
                  <span style={{ fontWeight:600 }}>{b.value} <span style={{ opacity:.6 }}>({pct}%)</span></span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div style={{ position:'absolute', bottom:6, right:10, fontSize:'.5rem', letterSpacing:.5, color:color, fontWeight:600 }}>live</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{
      background:'#fff', border:'1px solid #e2e8f0', borderRadius:20,
      padding:'1rem 1.1rem 1.2rem', display:'flex', flexDirection:'column',
      boxShadow:'0 4px 14px -6px rgba(0,0,0,.05)'
    }}>
      <h3 style={{ margin:'0 0 .75rem', fontSize:'.9rem' }}>{title}</h3>
      {children}
    </div>
  );
}

// Styles/helpers & visual components
const emptyStyle = { fontSize:'.6rem', opacity:.6, padding:'.4rem .3rem' };

// Removed notifType (unused)

// Quick action button
function QuickBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background:'#4338ca', color:'#fff', border:'none', padding:'.55rem .85rem',
      borderRadius:8, fontSize:'.6rem', fontWeight:600, cursor:'pointer',
      letterSpacing:.5, boxShadow:'0 2px 6px -2px rgba(0,0,0,.25)'
    }}>{children}</button>
  );
}

function StatusSections({ loading }) {
  if (loading) return <div style={{ fontSize:'.6rem', opacity:.7, marginBottom:'1.25rem' }}>Loading status metrics...</div>;
  return null; // Sections rendered below in panels (Item / Claim / Return)
}

// Shared badge
function Badge({ children, bg='#e2e8f0', color='#334155' }) { return <span style={{ background:bg, color, padding:'.25rem .55rem', fontSize:'.5rem', fontWeight:600, borderRadius:999, letterSpacing:.5 }}>{children}</span>; }

function ItemStatusList({ items }) {
  if (!items || !items.length) return <div style={emptyStyle}>No item data.</div>;
  const grouped = groupBy(items, r=>r.category);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.8rem' }}>
      {Object.entries(grouped).map(([cat,list]) => {
        const total = list.reduce((a,c)=>a + (c.count||0),0) || 1;
        const statuses = list.slice().sort((a,b)=>a.status.localeCompare(b.status));
        return (
          <div key={cat} style={{
            border:'1px solid #e2e8f0',
            background:'#fff',
            borderRadius:14,
            padding:'.7rem .75rem .75rem',
            boxShadow:'0 3px 10px -6px rgba(0,0,0,.06)',
            display:'flex', flexDirection:'column', gap:'.55rem'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <strong style={{ fontSize:'.62rem', textTransform:'uppercase', letterSpacing:.6 }}>{cat}</strong>
              <span style={{ fontSize:'.5rem', fontWeight:600, background:'#f1f5f9', padding:'.2rem .45rem', borderRadius:20 }}>Total {total}</span>
            </div>
            <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'.4rem' }}>
              {statuses.map(s => {
                const pct = Math.min(100, ((s.count||0)/total)*100);
                const color = statusColor(cat, s.status);
                return (
                  <li key={cat+s.status} style={{ display:'flex', flexDirection:'column', gap:'.25rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.52rem', fontWeight:600, letterSpacing:.4 }}>
                      <span style={{ textTransform:'uppercase' }}>{s.status}</span>
                      <span>{s.count}</span>
                    </div>
                    <div style={{ position:'relative', height:8, background:'#f1f5f9', borderRadius:6, overflow:'hidden' }} aria-label={`${s.status} ${s.count} (${pct.toFixed(1)}%)`}>
                      <div style={{ position:'absolute', inset:0, width:`${pct}%`, background:color, transition:'width .6s cubic-bezier(.4,0,.2,1)' }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ClaimStatusList({ claims }) {
  if (!claims || !claims.length) return <div style={emptyStyle}>No claims data.</div>;
  const ordered = ['pending','approved','rejected'];
  const map = {}; claims.forEach(c=>{ map[c.status]= (map[c.status]||0) + (c.count||0); });
  return (
    <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'.4rem' }}>
      {ordered.filter(o=>map[o]!==undefined).map(st => (
        <li key={st} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc', padding:'.45rem .55rem', borderRadius:10, fontSize:'.55rem', fontWeight:600 }}>
          <span style={{ textTransform:'uppercase', letterSpacing:.5 }}>{st}</span>
          <span>
            <AnimatedBar width={Math.min(100, map[st]*12)} color={st==='pending'?'#f59e0b':st==='approved'?'#16a34a':'#dc2626'} />
            <span style={{ marginLeft:6 }}>{map[st]}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReturnStatus({ returnsData }) {
  const pending = returnsData?.pending_returns || 0;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
      <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
        <Badge bg="#ffedd5" color="#9a3412">pending {pending}</Badge>
        <Badge bg="#f1f5f9" color="#334155">in-use {returnsData?.total_in_use || 0}</Badge>
      </div>
      <small style={{ fontSize:'.5rem', opacity:.65 }}>Breakdown includes in-use equipment with/without pending return requests.</small>
    </div>
  );
}

// Color palette for statuses per category (light gradients could be added later)
function statusColor(category, status) {
  const base = status.toLowerCase();
  const map = {
    equipment: {
      available:'#10b981',
      in_use:'#6366f1',
      for_repair:'#f59e0b',
      disposed:'#64748b'
    },
    supplies: {
      in_stock:'#0ea5e9',
      out_of_stock:'#dc2626'
    }
  };
  return (map[category]?.[base]) || '#6366f1';
}

// Animated number component
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(()=>{
    let start = 0;
    const duration = 500; const begin = performance.now();
    const step = (t)=>{
      const p = Math.min(1, (t-begin)/duration);
      const eased = 1 - Math.pow(1-p,3);
      setDisplay(Math.round(start + (value-start)*eased));
      if (p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },[value]);
  return <span>{display}</span>;
}

function AnimatedBar({ width, color }) {
  return (
    <span style={{ position:'relative', display:'inline-block', width:100, height:8, background:'#e2e8f0', borderRadius:6, verticalAlign:'middle' }}>
      <span style={{ position:'absolute', left:0, top:0, bottom:0, width:width, maxWidth:'100%', background:color, borderRadius:6, transition:'width .6s cubic-bezier(.4,0,.2,1)' }} />
    </span>
  );
}

// PieChart (pure SVG)
function PieChart({ data=[], colors=[], size=180 }) {
  const [hovered, setHovered] = useState(null);
  if (!data.length) return <div style={emptyStyle}>No data.</div>;
  const total = data.reduce((a,c)=>a+c.value,0) || 1;
  const radius = size/2;
  const cx = radius; const cy = radius;
  let acc = 0;
  // Precompute paths for stable rendering
  const slices = data.map((slice, i) => {
    const val = slice.value / total;
    const start = acc; const end = acc + val; acc = end;
    const large = val > .5 ? 1 : 0;
    const x1 = cx + radius * Math.sin(2 * Math.PI * start);
    const y1 = cy - radius * Math.cos(2 * Math.PI * start);
    const x2 = cx + radius * Math.sin(2 * Math.PI * end);
    const y2 = cy - radius * Math.cos(2 * Math.PI * end);
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
    return { d, slice, i, val };
  });
  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'stretch', gap:'.65rem' }}>
      <div style={{ position:'relative', width:size, height:size, margin:'0 auto' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Item distribution donut chart">
          {slices.map(({ d, i }) => {
            const color = colors[i % colors.length] || '#64748b';
            const isHover = hovered === i;
            return (
              <g key={i} style={{ cursor:'pointer' }}
                 onMouseEnter={()=>setHovered(i)}
                 onMouseLeave={()=>setHovered(null)}
                 onFocus={()=>setHovered(i)}
                 onBlur={()=>setHovered(null)}
                 tabIndex={0}>
                <path d={d}
                  fill={color}
                  style={{
                    transition:'transform .35s, opacity .3s',
                    transformOrigin:`${cx}px ${cy}px`,
                    transform:isHover? 'scale(1.05)':'scale(1)',
                    opacity: hovered==null || isHover ? 1 : .45,
                    filter: isHover? 'drop-shadow(0 2px 4px rgba(0,0,0,.25))':''
                  }} />
              </g>
            );
          })}
          {/* Donut cut-out */}
          <circle cx={cx} cy={cy} r={radius*0.52} fill="#fff" />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none', fontSize:'.55rem', fontWeight:600, lineHeight:1.1 }}>
          {hovered==null && <>
            <span style={{ opacity:.7 }}>TOTAL</span>
            <span style={{ fontSize:'.9rem' }}>{total}</span>
          </>}
          {hovered!=null && (()=>{
            const h = data[hovered];
            const pct = ((h.value/total)*100).toFixed(1);
            return (
              <div style={{ textAlign:'center', padding:'0 .3rem' }}>
                <div style={{ fontSize:'.55rem', fontWeight:700 }}>{h.label}</div>
                <div style={{ fontSize:'.8rem', fontWeight:700 }}>{h.value}</div>
                <div style={{ fontSize:'.55rem', opacity:.65 }}>{pct}%</div>
              </div>
            );
          })()}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:'.45rem' }}>
        {data.map((s,i)=> {
          const pct = ((s.value/total)*100).toFixed(1);
          return (
            <button key={i} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}
              style={{
                background: hovered===i? '#f1f5f9':'#fff',
                border:'1px solid #e2e8f0',
                borderRadius:10,
                padding:'.4rem .45rem',
                display:'flex', flexDirection:'column', gap:'.15rem',
                textAlign:'left', cursor:'pointer', fontSize:'.5rem', fontWeight:600,
                transition:'background .25s, border-color .25s'
              }}>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:10, height:10, background:colors[i%colors.length]||'#64748b', borderRadius:2 }} />
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.label}</span>
              </span>
              <span style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ opacity:.7 }}>{pct}%</span>
                <span>{s.value}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// BarChart horizontal
function BarChart({ data={}, colors={}, maxWidth=180 }) {
  const entries = Object.entries(data);
  if (!entries.length) return <div style={emptyStyle}>No data.</div>;
  const max = Math.max(...entries.map(([,v])=>v),1);
  return (
    <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:'.45rem' }}>
      {entries.map(([k,v])=>{
        const w = (v/max)*maxWidth;
        return (
          <li key={k} style={{ fontSize:'.55rem', fontWeight:600 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
              <span style={{ textTransform:'uppercase', letterSpacing:.5 }}>{k}</span>
              <span>{v}</span>
            </div>
            <div style={{ position:'relative', height:10, background:'#f1f5f9', borderRadius:6, overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, width:w, background:colors[k]||'#6366f1', transition:'width .6s cubic-bezier(.4,0,.2,1)' }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Data transformers
function aggregateForPie(items=[]) {
  const map = {};
  items.forEach(i=>{ const key = `${i.category}:${i.status}`; map[key] = (map[key]||0) + (i.count||0); });
  return Object.entries(map).map(([k,v])=>({ label:k, value:v })).sort((a,b)=> b.value - a.value).slice(0,8);
}
function aggregateKeyCounts(rows=[], key) {
  const out = {}; rows.forEach(r=>{ out[r[key]] = (out[r[key]]||0) + (r.count||0); }); return out;
}
function returnBreakdownPie(returns={}) {
  const breakdown = returns.breakdown || [];
  return breakdown.map(r=>({ label:r.return_status, value:r.count }));
}

function groupBy(arr, fn) {
  return arr.reduce((acc,x)=>{ const k = fn(x); (acc[k] ||= []).push(x); return acc; }, {});
}