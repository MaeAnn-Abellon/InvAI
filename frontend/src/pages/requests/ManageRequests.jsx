import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { inventoryApi } from '@/services/inventoryApi';

const Wrap = styled.div`padding:1.8rem 2rem 2.5rem; display:flex; flex-direction:column; gap:1.3rem;`;
const Title = styled.h2`margin:0; font-size:1.1rem; font-weight:700;`;
const Table = styled.div`border:1px solid #e2e8f0; border-radius:18px; overflow:hidden; background:#fff;`; 
const Head = styled.div`display:grid; grid-template-columns:170px 60px 90px 140px 1fr 75px 130px; background:#f1f5f9; padding:.6rem .85rem; font-size:.55rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:#475569;`;
const Row = styled.div`display:grid; grid-template-columns:170px 60px 90px 140px 1fr 75px 130px; padding:.65rem .85rem; font-size:.6rem; border-top:1px solid #e2e8f0; align-items:start; background:#fff; cursor:pointer; transition:background .15s, border-color .15s; &:hover{background:#f8fafc;} &:nth-of-type(odd){background:#fcfdff;}`;
const Status = styled.span`padding:.25rem .5rem; font-size:.5rem; font-weight:600; border-radius:999px; background:${p=>p.v==='approved'?'#dcfce7':p.v==='rejected'?'#fee2e2':'#fef9c3'}; color:${p=>p.v==='approved'?'#166534':p.v==='rejected'?'#991b1b':'#92400e'}; text-transform:uppercase; letter-spacing:.5px;`;
const Actions = styled.div`display:flex; gap:.4rem; flex-wrap:wrap;`;
const Btn = styled.button`background:#fff; border:1px solid #cbd5e1; padding:.35rem .55rem; font-size:.55rem; border-radius:8px; cursor:pointer; font-weight:600; position:relative; overflow:hidden; transition:background .15s,color .15s; &:hover{background:#eef2ff; color:#3730a3;} &:disabled{opacity:.5;cursor:default;} &:active{transform:translateY(1px);} &::after{content:''; position:absolute; inset:0; background:radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(99,102,241,.25), transparent 60%); opacity:0; transition:opacity .4s; mix-blend-mode:multiply;} &:hover::after{opacity:1;}`;
const FilterSel = styled.select`border:1px solid #cbd5e1; background:#fff; border-radius:8px; padding:.45rem .6rem; font-size:.6rem;`;
const Toolbar = styled.div`display:flex; gap:.9rem; flex-wrap:wrap; align-items:center; justify-content:space-between;`;
const Empty = styled.div`padding:1rem; font-size:.6rem; opacity:.7;`;
const Backdrop = styled.div`position:fixed; inset:0; background:radial-gradient(circle at 30% 30%,rgba(15,23,42,.55),rgba(15,23,42,.8)); backdrop-filter:blur(3px); display:flex; align-items:flex-start; justify-content:center; padding:4rem 1rem 3rem; z-index:400; animation:fadeIn .35s; @keyframes fadeIn{0%{opacity:0;}100%{opacity:1;}}`;
const Modal = styled.div`background:#fff; border:1px solid #e2e8f0; width:100%; max-width:620px; border-radius:24px; padding:1.3rem 1.5rem 1.6rem; display:flex; flex-direction:column; gap:.9rem; position:relative; box-shadow:0 14px 48px -10px rgba(0,0,0,.35); animation:pop .4s cubic-bezier(.4,0,.2,1); @keyframes pop{0%{opacity:0; transform:translateY(14px) scale(.96);}100%{opacity:1; transform:translateY(0) scale(1);}}`;
const Close = styled.button`position:absolute; top:10px; right:10px; background:#f1f5f9; border:1px solid #e2e8f0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:12px; cursor:pointer; font-weight:600; font-size:.8rem; &:hover{background:#e2e8f0;}`;
const KV = styled.div`display:flex; flex-direction:column; gap:.25rem; span.key{font-size:.5rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:#64748b;} span.val{font-size:.6rem; font-weight:500; color:#0f172a;}`;
const ModalGrid = styled.div`display:grid; gap:.85rem; grid-template-columns:repeat(auto-fit,minmax(200px,1fr));`;
const ToastWrap = styled.div`position:fixed; bottom:1rem; right:1rem; display:flex; flex-direction:column; gap:.55rem; z-index:500;`;
const Toast = styled.div`background:#fff; border:1px solid #6366f1; padding:.65rem .85rem; font-size:.55rem; font-weight:500; color:#312e81; border-radius:12px; box-shadow:0 6px 22px -8px rgba(79,70,229,.45); animation:fadeIn .35s;`;

export default function ManagerRequests(){
  const [requests,setRequests] = useState([]);
  const [loading,setLoading] = useState(false);
  const [filter,setFilter] = useState('pending');
  const [deciding,setDeciding] = useState({});
  const [active,setActive] = useState(null);
  const [toasts,setToasts] = useState([]);

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const res = await inventoryApi.listRequests(filter==='all'? undefined : filter);
      setRequests(res.requests||[]);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  },[filter]);
  useEffect(()=>{ load(); },[load]);

  const decide = async(r, approve=true)=>{
    setDeciding(d=>({...d,[r.id]:true}));
    try { await inventoryApi.decideRequest(r.id, approve); load(); pushToast(`Request ${approve?'approved':'rejected'}`); } catch(e){ alert(e.message); }
    finally { setDeciding(d=>{ const n={...d}; delete n[r.id]; return n; }); }
  };
  const pushToast = (msg) => { const id=Date.now(); setToasts(t=>[...t,{id,msg}]); setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)),3000); };
  const closeModal = () => setActive(null);
  useEffect(()=>{ const onKey = e=>{ if(e.key==='Escape') closeModal(); }; if(active) window.addEventListener('keydown', onKey); return ()=>window.removeEventListener('keydown', onKey); },[active]);

  return (
    <Wrap>
      <Toolbar>
        <Title>Manage Item Requests</Title>
        <FilterSel value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </FilterSel>
      </Toolbar>
      <Table>
        <Head>
          <div>Item</div>
          <div>Qty</div>
          <div>Category</div>
          <div>Requested By</div>
          <div>Reason</div>
          <div>Status</div>
          <div>Actions</div>
        </Head>
        {loading && <Empty>Loading...</Empty>}
        {!loading && !requests.length && <Empty>No requests.</Empty>}
        {!loading && requests.map(r => (
          <Row key={r.id} onClick={()=>setActive(r)}>
            <div style={{fontWeight:600}}>{r.item_name}</div>
            <div>{r.quantity}</div>
            <div>{r.category}</div>
            <div style={{fontSize:'.55rem', lineHeight:'.8rem'}}>
              {(r.requested_by_full_name || r.requested_by_username || 'Unknown')}
              <br />
              <span style={{fontSize:'.48rem', textTransform:'uppercase', letterSpacing:'.5px', opacity:.7}}>{r.requested_by_role||'user'}</span>
            </div>
            <div style={{fontSize:'.55rem', lineHeight:'1rem'}}>{r.reason || r.description}</div>
            <div><Status v={r.status}>{r.status}</Status></div>
            <Actions onClick={e=>e.stopPropagation()}>
              {r.status==='pending' && <>
                <Btn disabled={!!deciding[r.id]} onClick={(e)=>{e.stopPropagation();decide(r,true);}}>Approve</Btn>
                <Btn disabled={!!deciding[r.id]} onClick={(e)=>{e.stopPropagation();decide(r,false);}} style={{background:'#fee2e2'}}>Reject</Btn>
              </>}
            </Actions>
          </Row>
        ))}
      </Table>
      {active && createPortal(
        <Backdrop onClick={e=>{ if(e.target===e.currentTarget) closeModal(); }}>
          <Modal>
            <Close onClick={closeModal}>✕</Close>
            <h3 style={{margin:'0 0 .4rem', fontSize:'.9rem'}}>{active.item_name}</h3>
            <ModalGrid>
              <KV><span className='key'>Quantity</span><span className='val'>{active.quantity}</span></KV>
              <KV><span className='key'>Category</span><span className='val' style={{textTransform:'capitalize'}}>{active.category}</span></KV>
              <KV><span className='key'>Status</span><span className='val'>{active.status}</span></KV>
              <KV><span className='key'>Requester</span><span className='val'>{active.requested_by_full_name || active.requested_by_username || 'Unknown'}</span></KV>
              <KV><span className='key'>Role</span><span className='val'>{active.requested_by_role}</span></KV>
              {active.votes!==undefined && <KV><span className='key'>Votes</span><span className='val'>{active.votes}</span></KV>}
            </ModalGrid>
            {active.description && <p style={{fontSize:'.55rem', lineHeight:'1rem', margin:'.9rem 0 .4rem'}}>{active.description}</p>}
            {active.reason && <div style={{fontSize:'.53rem', background:'#f1f5f9', padding:'.55rem .6rem', borderRadius:'10px', border:'1px solid #e2e8f0'}}><strong style={{fontSize:'.53rem'}}>Reason: </strong>{active.reason}</div>}
            <div style={{display:'flex', gap:'.55rem', marginTop:'1rem', flexWrap:'wrap'}}>
              {active.status==='pending' && <>
                <Btn disabled={!!deciding[active.id]} onClick={()=>{decide(active,true); closeModal();}}>Approve</Btn>
                <Btn disabled={!!deciding[active.id]} onClick={()=>{decide(active,false); closeModal();}} style={{background:'#fee2e2'}}>Reject</Btn>
              </>}
              <Btn onClick={closeModal} style={{background:'#f1f5f9'}}>Close</Btn>
            </div>
          </Modal>
        </Backdrop>, document.body)}
      {createPortal(
        <ToastWrap>
          {toasts.map(t=> <Toast key={t.id}>{t.msg}</Toast>)}
        </ToastWrap>, document.body)}
    </Wrap>
  );
}
