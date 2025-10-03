import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '@/services/inventoryApi';

// Add CSS animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .manager-dashboard {
    animation: fadeIn 0.6s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default function Dashboard() {
  // Removed recentRequests (per requirement)
  // Removed forecastHighlights & notifications (unused mock content)
  const [analytics, setAnalytics] = useState({ items:[], claims:[], returns:{ pending_returns:0 }});
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);
  const [depletionAlerts, setDepletionAlerts] = useState([]); // derived from forecast endpoint
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [returns, setReturns] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const navigate = useNavigate();

  // Removed mock dashboard fetch (no longer needed)

  useEffect(()=>{
    (async()=>{
      try {
        const data = await inventoryApi.analyticsSummary();
        setAnalytics(data);
      } catch(e){ console.error('analytics error', e); }
    })();
  }, []);

  // Fetch inventory items
  useEffect(()=>{
    (async()=>{
      setInventoryLoading(true);
      try {
        const data = await inventoryApi.list();
        setInventoryItems(data.items || []);
      } catch(e){ console.error('inventory error', e); }
      finally { setInventoryLoading(false); }
    })();
  }, []);

  // Fetch requests data
  useEffect(()=>{
    (async()=>{
      setRequestsLoading(true);
      try {
        const data = await inventoryApi.listRequests();
        setRequests(data.requests || []);
      } catch(e){ console.error('requests error', e); }
      finally { setRequestsLoading(false); }
    })();
  }, []);

  // Fetch claims data
  useEffect(()=>{
    (async()=>{
      setClaimsLoading(true);
      try {
        const data = await inventoryApi.listPendingClaims();
        setClaims(data.claims || []);
      } catch(e){ console.error('claims error', e); }
      finally { setClaimsLoading(false); }
    })();
  }, []);

  // Fetch returns data
  useEffect(()=>{
    (async()=>{
      setReturnsLoading(true);
      try {
        const data = await inventoryApi.listPendingReturns();
        setReturns(data.returns || []);
      } catch(e){ console.error('returns error', e); }
      finally { setReturnsLoading(false); }
    })();
  }, []);

  // Fetch AI depletion forecast (lightweight subset for dashboard)
  useEffect(()=>{
    (async () => {
      setForecastLoading(true); setForecastError(null);
      try {
        const res = await inventoryApi.forecastDepletion({ windowDays:30, limit:30 });
        const list = (res.forecasts||[]) // pick items that are out_of_stock OR <=14 days
          .filter(it => it.status === 'out_of_stock' || (it.daysToDeplete !== null && it.daysToDeplete <= 14))
          .map(it => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            status: it.status,
            daysToDeplete: it.daysToDeplete,
            projectedDate: it.projectedDepletionDate,
            avgDailyUsage: it.avgDailyUsage
          }))
          .sort((a,b)=>{
            const da = a.daysToDeplete ?? 9999;
            const db = b.daysToDeplete ?? 9999;
            return da - db;
          })
          .slice(0,10);
        setDepletionAlerts(list);
      } catch(e){
        setForecastError(e.message);
      } finally { setForecastLoading(false); }
    })();
  }, []);

  // no loading gate (analytics has its own loading state)

  return (
    <div className="manager-dashboard" style={{ 
      padding: '2rem', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{ 
        marginBottom: '2rem',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.5rem 2rem',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '1rem', 
          flexWrap: 'wrap' 
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2rem', 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Manager Dashboard
            </h1>
            <p style={{ 
              margin: '.5rem 0 0', 
              color: '#64748b', 
              fontSize: '.9rem' 
            }}>
              Comprehensive inventory management overview
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap' }}>
            <ModernButton onClick={() => navigate('/manager/inventory')} color="#4f46e5">
              📦 Inventory
            </ModernButton>
            <ModernButton onClick={() => navigate('/manager/claims')} color="#f59e0b">
              📋 Claims
            </ModernButton>
            <ModernButton onClick={() => navigate('/manager/returns')} color="#f97316">
              ↩️ Returns
            </ModernButton>
            <ModernButton onClick={() => navigate('/manager/reports')} color="#10b981">
              📊 Reports
            </ModernButton>
          </div>
        </div>
      </div>

      {/* AI Forecast Alerts Section */}
      <div style={{ marginBottom: '2rem' }}>
        <DepletionAlerts
          loading={forecastLoading}
          error={forecastError}
          alerts={depletionAlerts}
          onViewAll={() => navigate('/manager/ai-forecasts')}
        />
      </div>

      {/* Key Metrics Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <SectionHeader title="Key Performance Metrics" subtitle="Real-time overview of your inventory system" />
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.5rem',
          marginTop: '1rem'
        }}>
          <ModernCard
            label="Total Items"
            value={analytics.items.reduce((a,c)=> a + (c.count||0), 0)}
            color="#4f46e5"
            icon="📦"
            trend="+12%"
            breakdown={(function(){
              const eq = analytics.items.filter(i=>i.category==='equipment').reduce((a,c)=>a+(c.count||0),0);
              const sup = analytics.items.filter(i=>i.category==='supplies').reduce((a,c)=>a+(c.count||0),0);
              return [
                { label:'Equipment', value:eq, color:'#4f46e5' },
                { label:'Supplies', value:sup, color:'#06b6d4' }
              ];
            })()}
          />
          <ModernCard 
            label="Active Claims" 
            value={(analytics.claims.find(c=>c.status==='pending')||{}).count || 0} 
            color="#f59e0b"
            icon="📋"
            trend="-5%"
            breakdown={(function(){
              const pending = (analytics.claims.find(c=>c.status==='pending')||{}).count || 0;
              const approved = (analytics.claims.find(c=>c.status==='approved')||{}).count || 0;
              const rejected = (analytics.claims.find(c=>c.status==='rejected')||{}).count || 0;
              return [
                { label:'Pending', value:pending, color:'#f59e0b' },
                { label:'Approved', value:approved, color:'#10b981' },
                { label:'Rejected', value:rejected, color:'#ef4444' }
              ];
            })()}
          />
          <ModernCard 
            label="Equipment in Use" 
            value={analytics.returns.total_in_use || 0} 
            color="#8b5cf6"
            icon="⚙️"
            trend="+8%"
          />
          <ModernCard 
            label="Utilization Rate" 
            value={`${Math.round(((analytics.returns.total_in_use || 0) / Math.max(1, analytics.items.filter(i=>i.category==='equipment').reduce((a,c)=>a+c.count,0))) * 100)}%`} 
            color="#10b981"
            icon="📈"
            trend="+3%"
          />
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Left Column - Large Panels */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ModernPanel title="📊 Analytics Overview" gridColumn="span 12">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', height: '300px' }}>
              <div>
                <h4 style={{ fontSize: '.8rem', margin: '0 0 1rem', color: '#475569', fontWeight: 600 }}>Item Status Distribution</h4>
                <PieChart data={aggregateForPie(analytics.items)} colors={['#4f46e5','#06b6d4','#10b981','#f59e0b','#ef4444','#64748b']} size={200} />
              </div>
              <div>
                <h4 style={{ fontSize: '.8rem', margin: '0 0 1rem', color: '#475569', fontWeight: 600 }}>Claim Processing</h4>
                <BarChart data={aggregateKeyCounts(analytics.claims,'status')} colors={{ pending:'#f59e0b', approved:'#10b981', rejected:'#ef4444' }} maxWidth={200} />
              </div>
            </div>
          </ModernPanel>

          <ModernPanel title="⚙️ Equipment Utilization" gridColumn="span 12">
            <EquipmentUtilization analytics={analytics} items={inventoryItems} />
          </ModernPanel>
        </div>

        {/* Right Column - Activity & Status */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ModernPanel title="🔔 Recent Activity">
            <RecentActivity 
              claims={claims} 
              requests={requests} 
              returns={returns} 
              loading={claimsLoading || requestsLoading || returnsLoading} 
            />
          </ModernPanel>

          <ModernPanel title="📋 Request Analytics">
            <RequestAnalytics requests={requests} loading={requestsLoading} />
          </ModernPanel>
        </div>
      </div>

      {/* Bottom Section - Detailed Views */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <ModernPanel title="📦 Inventory Overview">
          <InventoryItemsList items={inventoryItems} loading={inventoryLoading} />
        </ModernPanel>

        <ModernPanel title="📈 Status Breakdown">
          <ItemStatusList items={analytics.items} />
        </ModernPanel>

        <ModernPanel title="↩️ Return Management">
          <ReturnStatus returnsData={analytics.returns} />
          <div style={{ marginTop: '1rem' }}>
            <PieChart data={returnBreakdownPie(analytics.returns)} colors={['#f97316','#10b981','#64748b']} size={160} />
          </div>
        </ModernPanel>
      </div>
    </div>
  );
}

// Modern UI Components
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2 style={{ 
        margin: 0, 
        fontSize: '1.5rem', 
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: '.25rem'
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ 
          margin: 0, 
          color: '#64748b', 
          fontSize: '.9rem' 
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ModernButton({ children, onClick, color = "#4f46e5" }) {
  return (
    <button 
      onClick={onClick} 
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: '#fff',
        border: 'none',
        padding: '.75rem 1.25rem',
        borderRadius: '12px',
        fontSize: '.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: `0 4px 15px ${color}40`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = `0 8px 25px ${color}50`;
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = `0 4px 15px ${color}40`;
      }}
    >
      {children}
    </button>
  );
}

function ModernCard({ label, value, color, icon, trend, breakdown }) {
  const [hover, setHover] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: breakdown ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover 
          ? `0 20px 40px ${color}30` 
          : '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, transparent 70%)`,
        borderRadius: '50%',
        transform: hover ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontSize: '2rem',
            opacity: 0.8
          }}>
            {icon}
          </div>
          {trend && (
            <span style={{
              fontSize: '.75rem',
              fontWeight: 600,
              color: trend.startsWith('+') ? '#10b981' : '#ef4444',
              background: trend.startsWith('+') ? '#10b98120' : '#ef444420',
              padding: '.25rem .5rem',
              borderRadius: '8px'
            }}>
              {trend}
            </span>
          )}
        </div>
        
        <div style={{
          fontSize: '.8rem',
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '.5px',
          marginBottom: '.5rem'
        }}>
          {label}
        </div>
        
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#1e293b',
          lineHeight: 1
        }}>
          <AnimatedNumber value={typeof value === 'string' ? value : value} />
        </div>
      </div>

      {/* Breakdown Overlay */}
      {breakdown && hover && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span style={{
            fontSize: '.8rem',
            fontWeight: 700,
            color: '#374151',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '.5px'
          }}>
            Breakdown
          </span>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '.75rem'
          }}>
            {breakdown.map(b => {
              const total = breakdown.reduce((sum, item) => sum + item.value, 0);
              const pct = total ? ((b.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={b.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: b.color,
                      borderRadius: '3px'
                    }} />
                    <span style={{ fontSize: '.75rem', fontWeight: 500 }}>{b.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '.9rem', fontWeight: 700 }}>{b.value}</div>
                    <div style={{ fontSize: '.65rem', color: '#64748b' }}>{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ModernPanel({ title, children, gridColumn }) {
  return (
    <div style={{
      gridColumn,
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <h3 style={{
        margin: '0 0 1.5rem',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// Styles/helpers & visual components
const emptyStyle = { fontSize:'.6rem', opacity:.6, padding:'.4rem .3rem' };

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
  
  useEffect(() => {
    // Handle string values (like percentages)
    if (typeof value === 'string') {
      setDisplay(value);
      return;
    }
    
    let start = 0;
    const duration = 500;
    const begin = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - begin) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  
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

// ============ Inventory Items List Component ============
function InventoryItemsList({ items, loading }) {
  if (loading) return <div style={emptyStyle}>Loading inventory items...</div>;
  if (!items || !items.length) return <div style={emptyStyle}>No inventory items found.</div>;
  
  // Group items by category
  const grouped = groupBy(items, item => item.category);
  
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.8rem', maxHeight:'320px', overflowY:'auto' }}>
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} style={{
          border:'1px solid #e2e8f0',
          background:'#fff',
          borderRadius:14,
          padding:'.7rem .75rem .75rem',
          boxShadow:'0 3px 10px -6px rgba(0,0,0,.06)'
        }}>
          <div style={{ 
            display:'flex', 
            justifyContent:'space-between', 
            alignItems:'center',
            marginBottom:'.6rem',
            paddingBottom:'.4rem',
            borderBottom:'1px solid #f1f5f9'
          }}>
            <strong style={{ 
              fontSize:'.65rem', 
              textTransform:'uppercase', 
              letterSpacing:.6,
              color:'#475569'
            }}>
              {category}
            </strong>
            <span style={{ 
              fontSize:'.5rem', 
              fontWeight:600, 
              background:'#f1f5f9', 
              padding:'.2rem .45rem', 
              borderRadius:20,
              color:'#64748b'
            }}>
              {categoryItems.length} items
            </span>
          </div>
          
          <div style={{ display:'flex', flexDirection:'column', gap:'.4rem' }}>
            {categoryItems.slice(0, 5).map(item => (
              <div key={item.id} style={{
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                padding:'.4rem .5rem',
                background:'#f8fafc',
                borderRadius:8,
                fontSize:'.55rem'
              }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'.1rem', flex:1 }}>
                  <span style={{ fontWeight:600, color:'#1e293b' }}>{item.name}</span>
                  {item.description && (
                    <span style={{ 
                      fontSize:'.5rem', 
                      color:'#64748b',
                      overflow:'hidden',
                      textOverflow:'ellipsis',
                      whiteSpace:'nowrap',
                      maxWidth:'200px'
                    }}>
                      {item.description}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
                  <span style={{ 
                    fontSize:'.5rem', 
                    fontWeight:600,
                    color:'#475569'
                  }}>
                    Qty: {item.quantity || 0}
                  </span>
                  <StatusBadge status={item.status} category={item.category} />
                </div>
              </div>
            ))}
            {categoryItems.length > 5 && (
              <div style={{
                fontSize:'.5rem',
                color:'#64748b',
                textAlign:'center',
                padding:'.3rem',
                fontStyle:'italic'
              }}>
                + {categoryItems.length - 5} more items
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status, category }) {
  const color = statusColor(category, status);
  const bgColor = `${color}20`;
  
  return (
    <span style={{
      background: bgColor,
      color: color,
      padding:'.15rem .4rem',
      fontSize:'.45rem',
      fontWeight:600,
      borderRadius:12,
      textTransform:'uppercase',
      letterSpacing:.3,
      border: `1px solid ${color}40`
    }}>
      {status.replace('_', ' ')}
    </span>
  );
}

// ============ New Analytics Components ============

function RequestAnalytics({ requests, loading }) {
  if (loading) return <div style={emptyStyle}>Loading request analytics...</div>;
  if (!requests || !requests.length) return <div style={emptyStyle}>No requests found.</div>;
  
  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = requests.reduce((acc, req) => {
    const priority = req.priority || 'normal';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const recentRequests = requests
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.8rem' }}>
      {/* Status Distribution */}
      <div>
        <h4 style={{ fontSize:'.6rem', margin:'0 0 .5rem', color:'#64748b', textTransform:'uppercase', letterSpacing:.5 }}>Status Distribution</h4>
        <BarChart 
          data={statusCounts} 
          colors={{ pending:'#f59e0b', approved:'#16a34a', rejected:'#dc2626', voting:'#8b5cf6' }} 
          maxWidth={120}
        />
      </div>

      {/* Priority Breakdown */}
      {Object.keys(priorityCounts).length > 1 && (
        <div>
          <h4 style={{ fontSize:'.6rem', margin:'0 0 .5rem', color:'#64748b', textTransform:'uppercase', letterSpacing:.5 }}>Priority Levels</h4>
          <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
            {Object.entries(priorityCounts).map(([priority, count]) => (
              <Badge 
                key={priority}
                bg={priority === 'high' ? '#fee2e2' : priority === 'medium' ? '#fef9c3' : '#f1f5f9'}
                color={priority === 'high' ? '#b91c1c' : priority === 'medium' ? '#92400e' : '#475569'}
              >
                {priority}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div>
        <h4 style={{ fontSize:'.6rem', margin:'0 0 .5rem', color:'#64748b', textTransform:'uppercase', letterSpacing:.5 }}>Recent Requests</h4>
        <div style={{ display:'flex', flexDirection:'column', gap:'.3rem', maxHeight:'120px', overflowY:'auto' }}>
          {recentRequests.map(req => (
            <div key={req.id} style={{
              padding:'.4rem .5rem',
              background:'#f8fafc',
              borderRadius:8,
              fontSize:'.5rem',
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center'
            }}>
              <span style={{ fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {req.item_name || req.description || 'Unnamed Request'}
              </span>
              <Badge 
                bg={req.status === 'pending' ? '#fef9c3' : req.status === 'approved' ? '#dcfce7' : '#fee2e2'}
                color={req.status === 'pending' ? '#92400e' : req.status === 'approved' ? '#166534' : '#b91c1c'}
              >
                {req.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EquipmentUtilization({ analytics, items }) {
  const equipmentItems = analytics.items.filter(i => i.category === 'equipment');
  const totalEquipment = equipmentItems.reduce((a, c) => a + (c.count || 0), 0);
  const inUse = analytics.returns.total_in_use || 0;
  const available = equipmentItems.filter(i => i.status === 'available').reduce((a, c) => a + (c.count || 0), 0);
  const forRepair = equipmentItems.filter(i => i.status === 'for_repair').reduce((a, c) => a + (c.count || 0), 0);
  const disposed = equipmentItems.filter(i => i.status === 'disposed').reduce((a, c) => a + (c.count || 0), 0);

  const utilizationRate = totalEquipment > 0 ? ((inUse / totalEquipment) * 100).toFixed(1) : 0;
  const availabilityRate = totalEquipment > 0 ? ((available / totalEquipment) * 100).toFixed(1) : 0;

  const utilizationData = [
    { label: 'In Use', value: inUse, color: '#8b5cf6' },
    { label: 'Available', value: available, color: '#16a34a' },
    { label: 'For Repair', value: forRepair, color: '#f97316' },
    { label: 'Disposed', value: disposed, color: '#64748b' }
  ].filter(item => item.value > 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.8rem' }}>
      {/* Key Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
        <div style={{ textAlign:'center', padding:'.5rem', background:'#f8fafc', borderRadius:10 }}>
          <div style={{ fontSize:'.5rem', color:'#64748b', marginBottom:'.2rem' }}>Utilization Rate</div>
          <div style={{ fontSize:'1.2rem', fontWeight:700, color:'#8b5cf6' }}>{utilizationRate}%</div>
        </div>
        <div style={{ textAlign:'center', padding:'.5rem', background:'#f8fafc', borderRadius:10 }}>
          <div style={{ fontSize:'.5rem', color:'#64748b', marginBottom:'.2rem' }}>Availability Rate</div>
          <div style={{ fontSize:'1.2rem', fontWeight:700, color:'#16a34a' }}>{availabilityRate}%</div>
        </div>
      </div>

      {/* Equipment Distribution */}
      {utilizationData.length > 0 && (
        <div>
          <h4 style={{ fontSize:'.6rem', margin:'0 0 .5rem', color:'#64748b', textTransform:'uppercase', letterSpacing:.5 }}>Equipment Distribution</h4>
          <PieChart data={utilizationData} colors={utilizationData.map(d => d.color)} size={160} />
        </div>
      )}

      {/* Equipment Categories */}
      {items && items.length > 0 && (
        <div>
          <h4 style={{ fontSize:'.6rem', margin:'0 0 .5rem', color:'#64748b', textTransform:'uppercase', letterSpacing:.5 }}>Top Equipment Types</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:'.3rem', maxHeight:'100px', overflowY:'auto' }}>
            {items.filter(item => item.category === 'equipment').slice(0, 5).map(item => (
              <div key={item.id} style={{
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                padding:'.3rem .4rem',
                background:'#f8fafc',
                borderRadius:6,
                fontSize:'.5rem'
              }}>
                <span style={{ fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {item.name}
                </span>
                <StatusBadge status={item.status} category="equipment" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecentActivity({ claims, requests, returns, loading }) {
  if (loading) return <div style={emptyStyle}>Loading recent activity...</div>;
  
  // Combine all activities and sort by date
  const activities = [];
  
  if (claims) {
    claims.slice(0, 3).forEach(claim => {
      activities.push({
        id: `claim-${claim.id}`,
        type: 'claim',
        title: `Claim for ${claim.item_name || 'Item'}`,
        status: claim.status,
        user: claim.user_name || claim.requested_by_name || 'Unknown User',
        date: claim.created_at || claim.request_date,
        icon: '📋'
      });
    });
  }

  if (requests) {
    requests.slice(0, 3).forEach(request => {
      activities.push({
        id: `request-${request.id}`,
        type: 'request',
        title: request.item_name || request.description || 'New Request',
        status: request.status,
        user: request.user_name || request.requested_by_name || 'Unknown User',
        date: request.created_at || request.request_date,
        icon: '💡'
      });
    });
  }

  if (returns) {
    returns.slice(0, 3).forEach(returnItem => {
      activities.push({
        id: `return-${returnItem.id}`,
        type: 'return',
        title: `Return Request: ${returnItem.item_name || 'Equipment'}`,
        status: returnItem.return_status || 'pending',
        user: returnItem.user_name || returnItem.current_user_name || 'Unknown User',
        date: returnItem.return_requested_at || returnItem.updated_at,
        icon: '↩️'
      });
    });
  }

  // Sort by date (most recent first)
  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentActivities = activities.slice(0, 8);

  if (recentActivities.length === 0) {
    return <div style={emptyStyle}>No recent activity.</div>;
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.4rem', maxHeight:'300px', overflowY:'auto' }}>
      {recentActivities.map(activity => (
        <div key={activity.id} style={{
          display:'flex',
          alignItems:'center',
          gap:'.5rem',
          padding:'.4rem .5rem',
          background:'#f8fafc',
          borderRadius:8,
          fontSize:'.55rem',
          borderLeft:`3px solid ${getActivityColor(activity.type)}`
        }}>
          <span style={{ fontSize:'.7rem' }}>{activity.icon}</span>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'.1rem' }}>
            <span style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {activity.title}
            </span>
            <span style={{ fontSize:'.5rem', color:'#64748b' }}>
              by {activity.user} • {formatRelativeTime(activity.date)}
            </span>
          </div>
          <Badge 
            bg={getStatusBg(activity.status)}
            color={getStatusColor(activity.status)}
          >
            {activity.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// Helper functions for Recent Activity
function getActivityColor(type) {
  switch (type) {
    case 'claim': return '#f59e0b';
    case 'request': return '#06b6d4';
    case 'return': return '#f97316';
    default: return '#64748b';
  }
}

function getStatusBg(status) {
  switch (status) {
    case 'pending': return '#fef9c3';
    case 'approved': return '#dcfce7';
    case 'rejected': return '#fee2e2';
    case 'voting': return '#ede9fe';
    default: return '#f1f5f9';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'pending': return '#92400e';
    case 'approved': return '#166534';
    case 'rejected': return '#b91c1c';
    case 'voting': return '#6b21a8';
    default: return '#475569';
  }
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return date.toLocaleDateString();
}

// ============ AI Forecast Alerts Component ============
function DepletionAlerts({ loading, error, alerts, onViewAll }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '1.5rem 2rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '.75rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.2)',
            animation: 'pulse 2s infinite'
          }} />
          <h3 style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#1e293b',
            letterSpacing: '.3px'
          }}>
            🤖 AI Depletion Alerts
          </h3>
          <span style={{
            fontSize: '.7rem',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#fff',
            padding: '.25rem .6rem',
            fontWeight: 600,
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '.5px'
          }}>
            Beta
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <small style={{ 
            fontSize: '.75rem', 
            color: '#64748b',
            background: '#f1f5f9',
            padding: '.4rem .8rem',
            borderRadius: '8px'
          }}>
            Window: 30d • Threshold: ≤14d
          </small>
          <ModernButton onClick={onViewAll} color="#4f46e5">
            View All Forecasts
          </ModernButton>
        </div>
      </div>
      
      {loading && (
        <div style={{ 
          fontSize: '.9rem', 
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '.5rem'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #e2e8f0',
            borderTop: '2px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Analyzing recent usage patterns...
        </div>
      )}
      
      {!loading && error && (
        <div style={{ 
          fontSize: '.9rem', 
          color: '#ef4444',
          background: '#fef2f2',
          padding: '.75rem',
          borderRadius: '12px',
          border: '1px solid #fecaca'
        }}>
          ⚠️ Error: {error}
        </div>
      )}
      
      {!loading && !error && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {alerts.map(a => (
            <div key={a.id} style={{
              background: 'linear-gradient(135deg, #fef7ff 0%, #f3f4f6 100%)',
              border: '1px solid #e5e7eb',
              padding: '.75rem 1rem',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '.5rem',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '.75rem' 
              }}>
                <span style={{ 
                  fontWeight: 700,
                  color: '#1e293b',
                  fontSize: '.9rem'
                }}>
                  {a.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  {a.status === 'out_of_stock' && (
                    <Badge bg="#fef2f2" color="#dc2626">OUT OF STOCK</Badge>
                  )}
                  {a.status !== 'out_of_stock' && a.daysToDeplete != null && (
                    <Badge 
                      bg={a.daysToDeplete <= 7 ? '#fef2f2' : '#fef9c3'} 
                      color={a.daysToDeplete <= 7 ? '#dc2626' : '#d97706'}
                    >
                      ~{Math.max(0, Math.round(a.daysToDeplete))} days
                    </Badge>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <UsageBar days={a.daysToDeplete} />
                <span style={{ 
                  fontSize: '.75rem', 
                  color: '#64748b',
                  fontWeight: 500
                }}>
                  {a.status === 'out_of_stock' 
                    ? 'Restock immediately' 
                    : a.daysToDeplete != null 
                      ? 'Est. depletion' 
                      : 'Insufficient data'
                  }
                </span>
              </div>
            </div>
          ))}
          {!alerts.length && (
            <div style={{
              fontSize: '.9rem',
              color: '#64748b',
              textAlign: 'center',
              padding: '2rem',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
              borderRadius: '16px',
              border: '1px dashed #d1d5db'
            }}>
              🎉 No urgent depletion risks detected
            </div>
          )}
        </div>
      )}
      
      <small style={{ 
        fontSize: '.75rem', 
        color: '#9ca3af',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Predictions based on recent approved claims • AI heuristic model
      </small>
    </div>
  );
}

function UsageBar({ days }) {
  if (days == null) return <div style={{ flex:1, height:6, background:'#e2e8f0', borderRadius:4 }} />;
  const threshold = 14; // days window considered urgent
  const clamped = Math.min(threshold, Math.max(0, days));
  const pct = 100 - (clamped/threshold)*100; // fuller bar = sooner depletion
  const color = days <= 7 ? '#dc2626' : '#f59e0b';
  return (
    <div style={{ position:'relative', flex:1, height:6, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }} aria-label={`${Math.round(days)} days to deplete`}>
      <div style={{ position:'absolute', inset:0, width:`${pct}%`, background:color, transition:'width .6s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  );
}