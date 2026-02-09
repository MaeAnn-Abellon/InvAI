import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import sLogo from "../../assets/Inv.png"; // Updated logo per request
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import StatusAnalytics from '../../components/analytics/StatusAnalytics';
import { inventoryApi } from '../../services/inventoryApi';
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

// Lightweight fetch helper using same pattern as AdminInventoryDashboard
async function api(path){
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type':'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  let base;
  try { const { getApiBase } = await import('../../services/apiClient'); base = getApiBase(); } catch { base = ''; }
  if(!base) throw new Error('API base not configured');
  const res = await fetch(base + path, { headers });
  const text = await res.text();
  if (!res.ok) { try { const j = JSON.parse(text); throw new Error(j.error||'Request failed'); } catch { throw new Error(text||'Request failed'); } }
  return text ? JSON.parse(text) : {};
}
// Header styling (reintroduced after cleanup)
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'white',
  padding: '16px 24px',
  borderBottom: '1px solid #ddd',
  position: 'sticky',
  top: 0,
  zIndex: 10
};

const logoStyle = {
  height: "40px",
  marginRight: "12px",
};

const titleStyle = {
  fontSize: "1.25rem",
  fontWeight: "bold",
  color: "#333",
};

// buttonStyle removed (no refresh button)

const sectionStyle = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  marginBottom: '32px'
};

// Dashboard is now chart-only (visual analytics only as requested).

// Table styles removed (no longer using tables for mock data).

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [claims, setClaims] = useState(null);
  const [votes, setVotes] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  // Removed loading state (refresh button removed)
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const [ov, u, c, v, inv] = await Promise.all([
        api('/inventory/analytics/admin/overview'),
        api('/inventory/analytics/admin/users'),
        api('/inventory/analytics/admin/claims'),
        api('/inventory/analytics/admin/votes'),
  inventoryApi.list()
      ]);
      setOverview(ov.overview);
      setUsers(u.users);
      setClaims(c.claims);
      setVotes(v.votes);
      setInventoryItems(inv.items || []);
    } catch(e){ setError(e.message||'Failed to load analytics'); }
  };

  useEffect(()=>{ load(); }, []);

  // Quick Actions (only include routes admin role is allowed to access based on routing table)
  const quickActions = [
    { label: 'Inventory Analytics', path: '/admin/inventory' },
    { label: 'Manage Requests', path: '/manage-requests' },
    { label: 'User Management', path: '/user-management' },
  ];

  const quickActionWrapStyle = {
    display: 'grid',
    gap: '10px',
    gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
    marginTop: '12px'
  };

  const quickActionBtnStyle = {
    background: '#1e40af',
    border: 'none',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '.05em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background .18s',
  };

  const totals = useMemo(()=> overview?.totals || {}, [overview]);
  const statusBreakdown = useMemo(()=> overview?.statusBreakdown || [], [overview]);
  const categoryStatus = useMemo(()=> overview?.categoryStatus || [], [overview]);
  const votesList = useMemo(()=> votes?.topRequests || [], [votes]);
  const claimStatus = useMemo(()=> claims?.status || [], [claims]);
  const userRoles = useMemo(()=> users?.roles || [], [users]);
  const voterRoles = useMemo(()=> votes?.voterRoles || [], [votes]);
  const claimRecent = useMemo(()=> (claims?.recent||[]).slice().sort((a,b)=> new Date(a.date)-new Date(b.date)), [claims]);

  // Chart Data Builders
  const pieInventoryStatus = useMemo(()=>({
    labels: statusBreakdown.map(s=>s.status.replace(/_/g,' ')),
    datasets:[{ data: statusBreakdown.map(s=>s.count), backgroundColor:['#10b981','#3b82f6','#f59e0b','#ef4444','#6366f1','#94a3b8'] }]
  }),[statusBreakdown]);

  const pieUserRoles = useMemo(()=>({
    labels: userRoles.map(r=>r.role),
    datasets:[{ data: userRoles.map(r=>r.count), backgroundColor:['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#64748b'] }]
  }),[userRoles]);

  const barCategoryStatus = useMemo(()=>{
    const cats = [...new Set(categoryStatus.map(c=>c.category))];
    const statuses = [...new Set(categoryStatus.map(c=>c.status))];
    return {
      labels: statuses.map(s=>s.replace(/_/g,' ')),
      datasets: cats.map((cat,i)=>({
        label: cat,
        data: statuses.map(st=> (categoryStatus.find(cs=>cs.category===cat && cs.status===st)?.count) || 0 ),
        backgroundColor: ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'][i % 6]
      }))
    };
  },[categoryStatus]);

  const barClaims = useMemo(()=>({
    labels: claimStatus.map(s=>s.status),
    datasets:[{ label:'Claims', data: claimStatus.map(s=>s.count), backgroundColor:'#6366f1' }]
  }),[claimStatus]);

  const barVotes = useMemo(()=>({
    labels: votesList.map(v=>v.item_name),
    datasets:[{ label:'Votes', data: votesList.map(v=>v.votes), backgroundColor:'#f59e0b' }]
  }),[votesList]);

  const doughnutAvailability = useMemo(()=>{
    const avail = (totals.available_like||0);
    const notAvail = (totals.total_items||0) - avail;
    return { labels:['Available/In Stock','Other'], datasets:[{ data:[avail, notAvail<0?0:notAvail], backgroundColor:['#10b981','#e2e8f0'] }] };
  },[totals]);

  const lineClaimsTrend = useMemo(()=>{
    return {
      labels: claimRecent.map(r=> r.date.slice(5)), // MM-DD
      datasets:[{
        label:'Claims (14d)',
        data: claimRecent.map(r=> r.count),
        fill:true,
        tension:.3,
        borderColor:'#6366f1',
        backgroundColor:'rgba(99,102,241,0.15)',
        pointRadius:3,
        pointBackgroundColor:'#6366f1'
      }]
    };
  },[claimRecent]);

  const doughnutVoterRoles = useMemo(()=>({
    labels: voterRoles.map(v=>v.role),
    datasets:[{ data: voterRoles.map(v=>v.count), backgroundColor:['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#64748b'] }]
  }),[voterRoles]);

  return (
  <div style={{ backgroundColor: "#f8f9fc", minHeight:'100vh' }}>
      {/* Header Bar */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={sLogo} alt="InvAI Logo" style={logoStyle} />
          <span style={titleStyle}>InvAI Admin Dashboard</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "0" }}>
        {/* Quick Actions */}
        <section style={{ ...sectionStyle, marginTop: 0 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px' }}>Quick Actions</h2>
          <div style={quickActionWrapStyle}>
            {quickActions.map(a => (
              <button key={a.path} style={quickActionBtnStyle} onClick={()=>navigate(a.path)}>
                {a.label}
              </button>
            ))}
          </div>
        </section>
        {/* Intro */}
        <section style={{ ...sectionStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin:0 }}>Visual Analytics</h1>
            <p style={{margin:'6px 0 0', fontSize:'1.2rem', color:'#475569'}}>Live aggregated inventory & engagement metrics.</p>
          </div>
          <img src={sLogo} alt="Logo" style={{ height: "96px" }} />
        </section>

        {/* Core Distribution Charts */}
        <section style={{ ...sectionStyle }}>
          <h2 style={{ fontSize:"1.05rem", fontWeight:700, margin:'0 0 12px' }}>Core Distributions</h2>
          <div style={{display:'grid', gap:'36px', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))'}}>
            <div style={{textAlign:'center'}}>
              <h3 style={{fontSize:'1rem', textTransform:'uppercase', letterSpacing:'.08em', color:'#475569', marginBottom:6}}>Inventory Status</h3>
              <Pie data={pieInventoryStatus} />
            </div>
            <div style={{textAlign:'center'}}>
              <h3 style={{fontSize:'1rem', textTransform:'uppercase', letterSpacing:'.08em', color:'#475569', marginBottom:6}}>Availability</h3>
              <Doughnut data={doughnutAvailability} />
              <p style={{fontSize:'.8rem', marginTop:6}}>Total: {totals.total_items || 0}</p>
            </div>
            <div style={{textAlign:'center'}}>
              <h3 style={{fontSize:'1rem', textTransform:'uppercase', letterSpacing:'.08em', color:'#475569', marginBottom:6}}>User Roles</h3>
              <Pie data={pieUserRoles} />
            </div>
            <div style={{textAlign:'center'}}>
              <h3 style={{fontSize:'1rem', textTransform:'uppercase', letterSpacing:'.08em', color:'#475569', marginBottom:6}}>Voter Roles</h3>
              <Doughnut data={doughnutVoterRoles} />
            </div>
          </div>
        </section>

        {/* Equipment & Supplies Status Analytics */}
        <section style={{ ...sectionStyle }}>
          <h2 style={{ fontSize:"1.05rem", fontWeight:700, margin:'0 0 12px' }}>Equipment & Supplies Status</h2>
          <StatusAnalytics items={inventoryItems} />
        </section>

        {/* AI Notifications */}
        {error && (
          <section style={sectionStyle}>
            <h2 style={{ fontSize: "1rem", fontWeight:700, color:"#b91c1c", margin:'0 0 8px' }}>Data Error</h2>
            <p style={{color:'#b91c1c', fontSize:'.75rem'}}>{error}</p>
          </section>
        )}

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.05rem", fontWeight:700, margin:'0 0 12px' }}>Claims Distribution</h2>
          <div style={{maxWidth:'560px'}}>
            {claims ? <Bar data={barClaims} options={{ responsive:true, plugins:{ legend:{ display:false }}}} /> : <p>Loading...</p>}
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.05rem", fontWeight:700, margin:'0 0 12px' }}>Claims Trend (14 Days)</h2>
          <div style={{maxWidth:'760px'}}>
            {claimRecent.length ? <Line data={lineClaimsTrend} options={{ responsive:true, plugins:{ legend:{ display:false }}, scales:{ y:{ beginAtZero:true, ticks:{ precision:0 }}}}} /> : <p>No recent claim decisions.</p>}
          </div>
        </section>

        {/* Removed Inventory Management mock buttons */}

        {/* Removed AI Predictions placeholder (no real model integrated yet) */}

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.05rem", fontWeight:700, margin:'0 0 12px' }}>Top Voted Requests</h2>
          <div style={{maxWidth:'840px'}}>
            {votes ? <Bar data={barVotes} options={{ indexAxis:'y', plugins:{ legend:{ display:false }}, scales:{ x:{ beginAtZero:true }}}} /> : <p>Loading...</p>}
            <p style={{fontSize:'.9rem', marginTop:'.5rem', color:'#475569'}}>Total Votes: {votes?.totalVotes || 0}</p>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.05rem", fontWeight:700, margin:'0 0 12px' }}>Category × Status Matrix</h2>
          <div style={{maxWidth:'840px'}}>
            {overview ? <Bar data={barCategoryStatus} options={{ responsive:true, plugins:{ legend:{ position:'bottom' }}, scales:{ y:{ beginAtZero:true, ticks:{ precision:0 }}}}} /> : <p>Loading...</p>}
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: "1.05rem", fontWeight:700, margin:'0 0 10px' }}>Snapshot</h2>
          <p style={{fontSize:'.9rem',color:'#475569',lineHeight:1.4}}>Charts auto-refresh only on manual refresh. Use the Refresh button to pull latest aggregated values. Voter & claim dynamics highlight engagement pressure areas.</p>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
