import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';

// Styled components
const Page = styled.div`min-height:100vh;background:#f1f5f9;padding:1.5rem;`;
const Header = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;`;
const Title = styled.h1`margin:0;font-size:1.6rem;font-weight:700;background:linear-gradient(135deg,#4f46e5,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;`;
const Filters = styled.div`display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-end;`;
const Field = styled.label`display:flex;flex-direction:column;font-size:.65rem;font-weight:600;text-transform:uppercase;color:#475569;gap:.35rem;min-width:140px; select, input{padding:.55rem .6rem;border:1px solid #cbd5e1;border-radius:8px;font-size:.8rem;background:#fff; &:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.25);} }`;
const Btn = styled.button`background:#4f46e5;color:#fff;border:none;padding:.65rem 1rem;border-radius:8px;font-size:.75rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:.2s; &:hover{background:#4338ca;} &:disabled{opacity:.6;cursor:not-allowed;}`;
const CardsGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.9rem;`;
const Card = styled.div`background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:.9rem .95rem;display:flex;flex-direction:column;gap:.25rem;position:relative;`;
const CardLabel = styled.div`font-size:.6rem;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:.05em;`;
const CardValue = styled.div`font-size:1.35rem;font-weight:700;color:#0f172a;line-height:1;`;
const CardDelta = styled.div`font-size:.55rem;font-weight:600;display:flex;align-items:center;gap:4px; color:${p=>p.positive? '#047857':'#b91c1c'};`;
const Section = styled.section`margin-top:2rem;`;
const SectionTitle = styled.h2`margin:0 0 .9rem;font-size:1rem;font-weight:700;color:#334155;display:flex;align-items:center;gap:.5rem;`;
const TableWrap = styled.div`background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;`;
const Table = styled.table`width:100%;border-collapse:collapse;font-size:.7rem;th{background:#f1f5f9;font-weight:600;text-align:left;padding:.55rem .6rem;color:#475569;}td{padding:.5rem .6rem;border-top:1px solid #f1f5f9;}tbody tr:hover{background:#f8fafc;}`;
const Badge = styled.span`display:inline-block;padding:.25rem .5rem;border-radius:999px;font-size:.55rem;font-weight:600;background:${p=>({available:'#dcfce7',in_stock:'#dbeafe',in_use:'#ede9fe',for_repair:'#fef3c7',out_of_stock:'#fee2e2'}[p.status]||'#e2e8f0')};color:${p=>({available:'#166534',in_stock:'#1e3a8a',in_use:'#6d28d9',for_repair:'#92400e',out_of_stock:'#991b1b'}[p.status]||'#334155')};text-transform:uppercase;letter-spacing:.05em;`;
const InlineNote = styled.div`font-size:.55rem;color:#64748b;margin-top:.4rem;`;
const Pill = styled.span`background:#eef2ff;color:#3730a3;font-size:.55rem;font-weight:600;padding:.25rem .55rem;border-radius:6px;`;
const Flex = styled.div`display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;`;

// Local fetch wrapper hitting inventory endpoints using inventoryApi low-level raw equivalent
// We'll extend inventoryApi temporarily with a private fetch helper if exists; else replicate token header logic.
async function api(path){
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type':'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  let base;
  try { const { getApiBase } = await import('../../services/apiClient'); base = getApiBase(); } catch { base = 'http://localhost:5000/api'; }
  const res = await fetch(base + path, { headers });
  const text = await res.text();
  if (!res.ok) {
    // Attempt to parse JSON error, fallback to raw
    try { const j = JSON.parse(text); throw new Error(j.error || 'Request failed'); } catch { throw new Error(text.startsWith('<!doctype') ? 'Server returned HTML (possible 404 / proxy issue)' : (text||'Request failed')); }
  }
  try { return JSON.parse(text || '{}'); } catch { throw new Error('Invalid JSON from server'); }
}

const AdminInventoryDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [claimAnalytics, setClaimAnalytics] = useState(null);
  const [voteAnalytics, setVoteAnalytics] = useState(null);
  const [filters, setFilters] = useState({ department:'', course:'' });
  const [options, setOptions] = useState({ departments:[], courses:[] });
  const [error, setError] = useState(null);

  // Load selectable filters
  useEffect(()=>{
    let active=true; setOptionsLoading(true);
    api('/inventory/analytics/admin/options')
      .then(data=>{ if(!active) return; setOptions({ departments:data.departments||[], courses:data.courses||[] }); })
      .catch(e=>{ if(active) console.error('Options error',e); })
      .finally(()=>active && setOptionsLoading(false));
    return ()=>{ active=false; };
  },[]);

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      if(filters.department) qs.set('department', filters.department);
      if(filters.course) qs.set('course', filters.course);
      const data = await api('/inventory/analytics/admin/overview'+(qs.toString()?`?${qs.toString()}`:''));
      setOverview(data.overview);
      // Fetch other analytics in parallel
      const [usersRes, claimsRes, votesRes] = await Promise.all([
        api('/inventory/analytics/admin/users'),
        api('/inventory/analytics/admin/claims'),
        api('/inventory/analytics/admin/votes')
      ]);
      setUserAnalytics(usersRes.users);
      setClaimAnalytics(claimsRes.claims);
      setVoteAnalytics(votesRes.votes);
    } catch(e){ setError(e.message||'Failed to load overview'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ run(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const totals = overview?.totals || {};
  const statusMap = useMemo(()=>{
    const map={}; (overview?.statusBreakdown||[]).forEach(r=>{ map[r.status]=r.count; }); return map;
  },[overview]);

  const categoryStatus = overview?.categoryStatus || [];
  const recentChanges = overview?.recentStatusChanges || [];

  const availabilityRate = totals.total_items ? (((totals.available_like||0)/totals.total_items)*100).toFixed(1) : '0.0';

  return (
    <Page>
      <Header>
        <Title>Admin Inventory Overview</Title>
        <Filters>
          <Field>
            Department
            <select value={filters.department} onChange={e=>setFilters(f=>({...f, department:e.target.value}))} disabled={loading||optionsLoading}>
              <option value=''>All</option>
              {options.departments.map(d=> <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field>
            Course
            <select value={filters.course} onChange={e=>setFilters(f=>({...f, course:e.target.value}))} disabled={loading||optionsLoading}>
              <option value=''>All</option>
              {options.courses.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Btn onClick={run} disabled={loading}>{loading? 'Loading…':'Refresh'}</Btn>
        </Filters>
      </Header>

      {error && <InlineNote style={{color:'#b91c1c',fontWeight:600}}>Error: {error}</InlineNote>}

      <CardsGrid>
        <Card><CardLabel>Total Items</CardLabel><CardValue>{totals.total_items||0}</CardValue></Card>
        <Card><CardLabel>Equipment</CardLabel><CardValue>{totals.equipment_items||0}</CardValue></Card>
        <Card><CardLabel>Supplies</CardLabel><CardValue>{totals.supplies_items||0}</CardValue></Card>
        <Card><CardLabel>Available/In Stock</CardLabel><CardValue>{totals.available_like||0}</CardValue></Card>
        <Card><CardLabel>In Use</CardLabel><CardValue>{totals.in_use_items||0}</CardValue></Card>
        <Card><CardLabel>For Repair</CardLabel><CardValue>{totals.for_repair_items||0}</CardValue></Card>
        <Card><CardLabel>Out of Stock</CardLabel><CardValue>{totals.out_of_stock_items||0}</CardValue></Card>
        <Card><CardLabel>Availability Rate</CardLabel><CardValue>{availabilityRate}%</CardValue></Card>
        <Card><CardLabel>New (30d)</CardLabel><CardValue>{overview?.newItemsLast30||0}</CardValue></Card>
      </CardsGrid>

      <InlineNote>Scope: {overview?.scope ? (overview.scope.department||'All Depts') + ' / ' + (overview.scope.course||'All Courses') : 'All Inventory'} — Updated {new Date().toLocaleTimeString()}</InlineNote>

      <Section>
        <SectionTitle>Status Breakdown</SectionTitle>
        <TableWrap>
          <Table>
            <thead><tr><th>Status</th><th>Count</th><th>% of Items</th></tr></thead>
            <tbody>
              {Object.keys(statusMap).length === 0 && <tr><td colSpan={3}>No data</td></tr>}
              {Object.entries(statusMap).map(([s,c])=>{
                const pct = totals.total_items? ((c/totals.total_items)*100).toFixed(1):'0.0';
                return <tr key={s}><td><Badge status={s}>{s.replace(/_/g,' ')}</Badge></td><td>{c}</td><td>{pct}%</td></tr>;
              })}
            </tbody>
          </Table>
        </TableWrap>
      </Section>

      <Section>
        <SectionTitle>User Role Analytics</SectionTitle>
        <TableWrap>
          <Table>
            <thead><tr><th>Role</th><th>Count</th></tr></thead>
            <tbody>
              {!userAnalytics && <tr><td colSpan={2}>Loading...</td></tr>}
              {userAnalytics && userAnalytics.roles.map(r => <tr key={r.role}><td><Pill>{r.role}</Pill></td><td>{r.count}</td></tr>)}
            </tbody>
          </Table>
        </TableWrap>
        <InlineNote>Levels: {userAnalytics?.levels.map(l=>`${l.level}:${l.count}`).join(' | ') || '—'}</InlineNote>
      </Section>

      <Section>
        <SectionTitle>Claims Analytics</SectionTitle>
        <CardsGrid style={{marginBottom:'.75rem'}}>
          <Card><CardLabel>Avg Pending (hrs)</CardLabel><CardValue>{claimAnalytics? claimAnalytics.avgPendingHours: '—'}</CardValue></Card>
        </CardsGrid>
        <TableWrap>
          <Table>
            <thead><tr><th>Status</th><th>Count</th></tr></thead>
            <tbody>
              {!claimAnalytics && <tr><td colSpan={2}>Loading...</td></tr>}
              {claimAnalytics && claimAnalytics.status.map(s=> <tr key={s.status}><td><Badge status={s.status}>{s.status}</Badge></td><td>{s.count}</td></tr>)}
            </tbody>
          </Table>
        </TableWrap>
        <InlineNote>Recent 14d decisions: {claimAnalytics?.recent.map(r=>`${r.date}:${r.count}`).join(', ') || '—'}</InlineNote>
      </Section>

      <Section>
        <SectionTitle>Voting Analytics</SectionTitle>
        <CardsGrid style={{marginBottom:'.75rem'}}>
          <Card><CardLabel>Total Votes</CardLabel><CardValue>{voteAnalytics? voteAnalytics.totalVotes: 0}</CardValue></Card>
        </CardsGrid>
        <TableWrap>
          <Table>
            <thead><tr><th>Request</th><th>Category</th><th>Votes</th></tr></thead>
            <tbody>
              {!voteAnalytics && <tr><td colSpan={3}>Loading...</td></tr>}
              {voteAnalytics && voteAnalytics.topRequests.map(r=> <tr key={r.id}><td>{r.item_name}</td><td><Pill>{r.category}</Pill></td><td>{r.votes}</td></tr>)}
            </tbody>
          </Table>
        </TableWrap>
        <InlineNote>Voter Roles: {voteAnalytics?.voterRoles.map(v=>`${v.role}:${v.count}`).join(' | ') || '—'}</InlineNote>
      </Section>

      <Section>
        <SectionTitle>Category x Status Matrix</SectionTitle>
        <TableWrap>
          <Table>
            <thead><tr><th>Category</th><th>Status</th><th>Count</th></tr></thead>
            <tbody>
              {categoryStatus.length === 0 && <tr><td colSpan={3}>No data</td></tr>}
              {categoryStatus.map(r=> <tr key={r.category+':'+r.status}><td><Pill>{r.category}</Pill></td><td><Badge status={r.status}>{r.status.replace(/_/g,' ')}</Badge></td><td>{r.count}</td></tr>)}
            </tbody>
          </Table>
        </TableWrap>
      </Section>

      <Section>
        <SectionTitle>Recent Status Changes (30d)</SectionTitle>
        <TableWrap>
          <Table>
            <thead><tr><th>New Status</th><th>Transitions</th></tr></thead>
            <tbody>
              {recentChanges.length === 0 && <tr><td colSpan={2}>No recent changes</td></tr>}
              {recentChanges.map(r=> <tr key={r.new_status}><td><Badge status={r.new_status}>{r.new_status.replace(/_/g,' ')}</Badge></td><td>{r.count}</td></tr>)}
            </tbody>
          </Table>
        </TableWrap>
      </Section>
    </Page>
  );
};

export default AdminInventoryDashboard;
