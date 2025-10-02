import React, { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { inventoryApi } from '@/services/inventoryApi';

const Wrapper = styled.div`padding:1.5rem 1.75rem 3rem; display:flex; flex-direction:column; gap:1.4rem;`;
const Heading = styled.h2`margin:0; font-size:1.15rem; font-weight:700;`;
const Toolbar = styled.div`display:flex; flex-wrap:wrap; gap:.75rem; align-items:flex-end;`;
const Group = styled.label`display:flex; flex-direction:column; gap:4px; font-size:.55rem; font-weight:600; text-transform:uppercase; letter-spacing:.5px; color:#334155;`;
const Select = styled.select`border:1px solid #cbd5e1; border-radius:6px; padding:.45rem .55rem; font-size:.6rem; background:#fff;`;
const TableWrap = styled.div`border:1px solid #e2e8f0; border-radius:16px; overflow:auto; background:#fff;`;
const Table = styled.table`width:100%; border-collapse:collapse; font-size:.65rem; th{background:#f1f5f9;text-align:left;padding:.55rem .65rem;font-size:.55rem;letter-spacing:.5px;} td{padding:.55rem .65rem;border-top:1px solid #e2e8f0;vertical-align:top;}`;
const Empty = styled.div`padding:1rem .8rem; font-size:.6rem; color:#475569;`;
const Actions = styled.div`display:flex; gap:.4rem; flex-wrap:wrap;`;
const Btn = styled.button`background:#f1f5f9; border:1px solid #e2e8f0; padding:.32rem .6rem; font-size:.55rem; border-radius:6px; cursor:pointer; font-weight:600; color:#334155; &:hover{background:#e2e8f0;} &:disabled{opacity:.55;cursor:default;}`;
const Tag = styled.span`display:inline-block;padding:.22rem .5rem;border-radius:999px;font-size:.5rem;font-weight:600;letter-spacing:.5px;background:#fee2e2;color:#b91c1c;text-transform:uppercase;`;
const ToastStack = styled.div`position:fixed;bottom:1rem;right:1rem;display:flex;flex-direction:column;gap:.5rem;z-index:120;`;
const Toast = styled.div`background:${p=>p.err?'#fee2e2':'#ecfdf5'};color:${p=>p.err?'#991b1b':'#065f46'};border:1px solid ${p=>p.err?'#fecaca':'#a7f3d0'};padding:.55rem .7rem;font-size:.55rem;font-weight:600;border-radius:8px;min-width:160px;display:flex;gap:.6rem;align-items:flex-start;box-shadow:0 4px 14px -6px rgba(0,0,0,.12);`;

export default function EquipmentReturns(){
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(false);
  const [acting,setActing] = useState({});
  const [toasts,setToasts] = useState([]);
  const [itemStatus,setItemStatus] = useState('');

  const pushToast = useCallback((msg,err=false)=>{
    const id = Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,err}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
  },[]);

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const d = await inventoryApi.listPendingReturns();
      let rows = d.items||[];
      if (itemStatus) { rows = rows.filter(r=> (r.status||'').toLowerCase() === itemStatus.toLowerCase()); }
      setItems(rows);
    } catch(e){ pushToast(e.message,true); }
    finally { setLoading(false); }
  },[pushToast,itemStatus]);

  useEffect(()=>{ load(); },[load]);

  const approve = async (it) => {
    setActing(a=>({...a,[it.id]:true}));
    try {
      await inventoryApi.approveReturn(it.id);
      pushToast('Return accepted');
      load();
    } catch(e){ pushToast(e.message,true); }
    finally { setActing(a=>{ const n={...a}; delete n[it.id]; return n; }); }
  };

  return (
    <Wrapper>
      <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <Heading>Equipment Returns (Pending)</Heading>
        <Toolbar>
          <Group>
            Item Status
            <Select value={itemStatus} onChange={e=> setItemStatus(e.target.value)}>
              <option value=''>All</option>
              <option value='in_use'>In Use</option>
              <option value='available'>Available</option>
              <option value='for_repair'>For Repair</option>
              <option value='disposed'>Disposed</option>
            </Select>
          </Group>
        </Toolbar>
      </div>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Qty</th>
              <th>Claimed By</th>
              <th>Role</th>
              <th>Requested</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7}><Empty>Loading...</Empty></td></tr>}
            {!loading && !items.length && <tr><td colSpan={7}><Empty>No pending returns.</Empty></td></tr>}
            {!loading && items.map(it => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td>{it.quantity}</td>
                <td>{it.claimedByName || it.claimedBy || '-'}</td>
                <td>{it.claimedByRole || '-'}</td>
                <td>{new Date(it.updatedAt || it.createdAt).toLocaleString()}</td>
                <td>{it.return_status==='pending'? <Tag>pending</Tag> : '-'}</td>
                <td>
                  <Actions>
                    <Btn disabled={!!acting[it.id]} onClick={()=>approve(it)}>Accept Return</Btn>
                  </Actions>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
      <ToastStack>
        {toasts.map(t=> <Toast key={t.id} err={t.err}>{t.msg}</Toast>)}
      </ToastStack>
    </Wrapper>
  );
}
