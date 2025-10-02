import React, { useState } from 'react';
import styled from '@emotion/styled';
import { generateReport } from '@/services/managerApi';

const Page = styled.div`padding:2rem 2.25rem 3rem; background:#f8fafc;`;
const Title = styled.h1`margin:0 0 1.2rem; font-size:1.45rem; font-weight:700;`;
const Layout = styled.div`display:grid; gap:1.5rem; grid-template-columns:320px 1fr; align-items:start;
@media (max-width:1100px){grid-template-columns:1fr;}
`;
const Card = styled.div`
  background:#fff; border:1px solid #e2e8f0; border-radius:22px;
  padding:1.4rem 1.5rem 1.55rem; display:flex; flex-direction:column; gap:1rem;
  box-shadow:0 4px 14px -5px rgba(0,0,0,.05);
`;
const SectionTitle = styled.h2`margin:0; font-size:1rem; font-weight:700;`;
const Field = styled.div`
  display:flex; flex-direction:column; gap:.45rem;
  label{font-size:.6rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:#475569;}
  select,input {
    padding:.6rem .75rem; border:1px solid #cbd5e1; border-radius:10px;
    font-size:.7rem; background:#fff;
    &:focus{outline:none;border-color:#4834d4; box-shadow:0 0 0 2px rgba(72,52,212,.25);}
  }
`;
const Btn = styled.button`
  background:#4834d4; color:#fff; border:none; padding:.7rem 1rem;
  font-size:.65rem; font-weight:600; border-radius:10px; cursor:pointer;
  &:hover{background:#372aaa;}
  &:disabled{opacity:.5;}
`;

const SummaryList = styled.ul`
  list-style:none; margin:0; padding:0; display:grid;
  gap:.6rem; grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
  li{background:#f1f5f9; padding:.65rem .75rem; border-radius:12px; font-size:.6rem; font-weight:600; color:#334155;}
`;

const ManagerReports = () => {
  const [filters,setFilters] = useState({ month:'2025-09', scope:'department' });
  const [loading,setLoading] = useState(false);
  const [report,setReport] = useState(null);

  const run = async () => {
    setLoading(true);
    setReport(null);
    const res = await generateReport(filters);
    setReport(res);
    setLoading(false);
  };

  const exportCSV = () => {
    if(!report) return;
    const rows = [['Metric','Value']];
    Object.entries(report.summary).forEach(([k,v])=>rows.push([k,v]));
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `report_${filters.month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Page>
      <Title>Reports</Title>
      <Layout>
        <Card>
          <SectionTitle>Generate Report</SectionTitle>
          <Field>
            <label>Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={e=>setFilters(f=>({...f,month:e.target.value}))}
            />
          </Field>
          <Field>
            <label>Scope</label>
            <select
              value={filters.scope}
              onChange={e=>setFilters(f=>({...f,scope:e.target.value}))}
            >
              <option value="department">Department</option>
              <option value="campus">Campus</option>
              <option value="category">Category</option>
            </select>
          </Field>
          <Btn onClick={run} disabled={loading}>{loading?'Generating...':'Generate'}</Btn>
          {report && (
            <div style={{display:'flex', gap:'.6rem', flexWrap:'wrap'}}>
              <Btn onClick={exportCSV}>Export CSV</Btn>
              <Btn onClick={()=>alert('Implement Excel export')}>Export Excel</Btn>
              <Btn onClick={()=>alert('Implement PDF export')}>Export PDF</Btn>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Summary</SectionTitle>
          {!report && !loading && <p style={{fontSize:'.65rem', color:'#64748b'}}>No report generated yet.</p>}
          {loading && <p style={{fontSize:'.65rem'}}>Building report...</p>}
          {report && (
            <>
              <SummaryList>
                {Object.entries(report.summary).map(([k,v])=>(
                  <li key={k}>
                    <div style={{fontSize:'.55rem', textTransform:'uppercase', letterSpacing:'.5px', color:'#475569'}}>{k}</div>
                    <div style={{fontSize:'.85rem'}}>{v}</div>
                  </li>
                ))}
              </SummaryList>
              <small style={{fontSize:'.55rem', color:'#64748b'}}>Generated: {new Date(report.createdAt).toLocaleString()}</small>
            </>
          )}
        </Card>
      </Layout>
    </Page>
  );
};

export default ManagerReports;