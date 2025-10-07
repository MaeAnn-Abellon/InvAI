import React, { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { inventoryApi } from '@/services/inventoryApi';

// Temporary delete endpoint wrapper (assumes backend support to be added later)
async function deleteClaim(claimId){
  const token = localStorage.getItem('auth_token');
  let base;
  try { const { getApiBase } = await import('@/services/apiClient'); base = getApiBase(); } catch { base = ''; }
  if(!base) throw new Error('API base not configured');
  const res = await fetch(`${base}/inventory/claims/${claimId}`, { method:'DELETE', headers:{ Authorization: token?`Bearer ${token}`:'' } });
  if(!res.ok) throw new Error('Delete failed');
  return true;
}

const Wrapper = styled.div`
  padding:1.5rem 1.75rem 3rem;
  display:flex;
  flex-direction:column;
  gap:1.4rem;
`;
const Heading = styled.h2` margin:0; font-size:1.15rem; font-weight:700; `;
const Toolbar = styled.div` display:flex; flex-wrap:wrap; gap:.75rem; align-items:flex-end; `;
const Group = styled.label` display:flex; flex-direction:column; gap:4px; font-size:.55rem; font-weight:600; text-transform:uppercase; letter-spacing:.5px; color:#334155; `;
const Select = styled.select` border:1px solid #cbd5e1; border-radius:6px; padding:.45rem .55rem; font-size:.6rem; background:#fff; `;
const TableWrap = styled.div` border:1px solid #e2e8f0; border-radius:16px; overflow:auto; background:#fff; `;
const Table = styled.table` width:100%; border-collapse:collapse; font-size:.65rem; th{ background:#f1f5f9; text-align:left; padding:.55rem .65rem; font-size:.55rem; letter-spacing:.5px; } td{ padding:.55rem .65rem; border-top:1px solid #e2e8f0; vertical-align:top; } `;
const Actions = styled.div` display:flex; flex-wrap:wrap; gap:.35rem; `;
const Btn = styled.button` background:#f1f5f9; border:1px solid #e2e8f0; padding:.32rem .6rem; font-size:.55rem; border-radius:6px; cursor:pointer; font-weight:600; color:#334155; &:hover{ background:#e2e8f0; } &:disabled{ opacity:.55; cursor:default; } `;
const Tag = styled.span` display:inline-block; padding:.22rem .5rem; border-radius:999px; font-size:.5rem; font-weight:600; letter-spacing:.5px; background:${p=>p.bg}; color:${p=>p.color}; text-transform:uppercase; `;
const Empty = styled.div` padding:1rem .8rem; font-size:.6rem; color:#475569; `;
const Pager = styled.div` display:flex; gap:.5rem; flex-wrap:wrap; align-items:center; font-size:.55rem; `;
const ToastStack = styled.div` position:fixed; bottom:1rem; right:1rem; display:flex; flex-direction:column; gap:.5rem; z-index:120; `;
const Toast = styled.div` background:${p=>p.err?'#fee2e2':'#ecfdf5'}; color:${p=>p.err?'#991b1b':'#065f46'}; border:1px solid ${p=>p.err?'#fecaca':'#a7f3d0'}; padding:.55rem .7rem; font-size:.55rem; font-weight:600; border-radius:8px; min-width:160px; display:flex; gap:.6rem; align-items:flex-start; box-shadow:0 4px 14px -6px rgba(0,0,0,.12); `;

const statusColors = {
  pending:{ bg:'#fef9c3', color:'#92400e' },
  approved:{ bg:'#dcfce7', color:'#166534' },
  rejected:{ bg:'#fee2e2', color:'#b91c1c' }
};

export default function ManagerClaims(){
  const [claims,setClaims] = useState([]);
  const [page,setPage] = useState(1); const [totalPages,setTotalPages] = useState(1); const [total,setTotal]=useState(0);
  const [status,setStatus] = useState('pending');
  const [loading,setLoading] = useState(false);
  const [itemStatus, setItemStatus] = useState('');
  const [decisionLoading,setDecisionLoading] = useState({});
  const [toasts,setToasts] = useState([]);

  const pushToast = useCallback((msg, err=false)=>{
    const id = Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,err}]);
    setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)), 3500);
  },[]);

  const load = useCallback(async ()=>{
    setLoading(true);
    try {
      const data = await inventoryApi.listPendingClaims({ page, limit: 15, status: status||undefined, itemStatus: itemStatus||undefined });
      setClaims(data.claims||[]);
      setTotalPages(data.totalPages||1);
      setTotal(data.total||0);
    } catch(e){ pushToast(e.message,true); }
    finally { setLoading(false); }
  },[page,status,itemStatus,pushToast]);
  useEffect(()=>{ load(); },[load]);

  const decide = async (claim, approve) => {
    setDecisionLoading(d=>({...d,[claim.id]:true}));
    try {
      await inventoryApi.decideClaim(claim.id, approve);
      pushToast(approve? 'Approved':'Rejected');
      load();
    } catch(e){ pushToast(e.message,true); }
    finally { setDecisionLoading(d=>{ const n={...d}; delete n[claim.id]; return n; }); }
  };

  const handleDelete = async (claim) => {
    if(!window.confirm('Delete this claim?')) return;
    setDecisionLoading(d=>({...d,[claim.id]:true}));
    try {
      await deleteClaim(claim.id);
      pushToast('Claim deleted');
      load();
    } catch(e){ pushToast(e.message,true); }
    finally { setDecisionLoading(d=>{ const n={...d}; delete n[claim.id]; return n; }); }
  };

  return (
    <Wrapper>
      <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <Heading>Claim Requests</Heading>
        <Toolbar>
          <Group>
            Status
            <Select value={status} onChange={e=>{ setStatus(e.target.value); setPage(1); }}>
              <option value=''>All</option>
              <option value='pending'>Pending</option>
              <option value='approved'>Approved</option>
              <option value='rejected'>Rejected</option>
            </Select>
          </Group>
          <Group>
            Item Status
            <Select value={itemStatus} onChange={e=>{ setItemStatus(e.target.value); setPage(1); }}>
              <option value=''>All</option>
              <option value='available'>Available</option>
              <option value='in_use'>In Use</option>
              <option value='for_repair'>For Repair</option>
              <option value='disposed'>Disposed</option>
              <option value='in_stock'>In Stock</option>
              <option value='out_of_stock'>Out of Stock</option>
            </Select>
          </Group>
        </Toolbar>
      </div>
      <div style={{ fontSize:'.6rem', opacity:.8 }}>Total: {total}</div>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>User</th>
              <th>Qty</th>
              <th>Claim Status</th>
              <th>Item Status</th>
              <th>Created</th>
              <th>Decided</th>
              <th style={{ minWidth:140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !claims.length && <tr><td colSpan={8}><Empty>No claims found.</Empty></td></tr>}
            {loading && <tr><td colSpan={8}><Empty>Loading...</Empty></td></tr>}
            {!loading && claims.map(c => {
              const sc = statusColors[c.status] || { bg:'#e2e8f0', color:'#334155' };
              return (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.item_name}</td>
                  <td>{c.requested_by_username || c.requested_by || '-'}</td>
                  <td>{c.quantity}</td>
                  <td><Tag bg={sc.bg} color={sc.color}>{c.status}</Tag></td>
                  <td>{c.item_status || '-'}</td>
                  <td>{new Date(c.created_at).toLocaleString()}</td>
                  <td>{c.decided_at ? new Date(c.decided_at).toLocaleString() : '-'}</td>
                  <td>
                    <Actions>
                      {c.status==='pending' && <Btn disabled={!!decisionLoading[c.id]} onClick={()=>decide(c,true)}>Approve</Btn>}
                      {c.status==='pending' && <Btn disabled={!!decisionLoading[c.id]} onClick={()=>decide(c,false)} style={{ background:'#fee2e2', color:'#b91c1c' }}>Reject</Btn>}
                      <Btn disabled={!!decisionLoading[c.id]} onClick={()=>handleDelete(c)} style={{ background:'#fff7ed', color:'#9a3412' }}>Delete</Btn>
                    </Actions>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>
      {totalPages > 1 && (
        <Pager>
          <Btn disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Btn>
          <span>Page {page} / {totalPages}</span>
          <Btn disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Btn>
        </Pager>
      )}
      <ToastStack>
        {toasts.map(t=> <Toast key={t.id} err={t.err}>{t.msg}</Toast>)}
      </ToastStack>
    </Wrapper>
  );
}
