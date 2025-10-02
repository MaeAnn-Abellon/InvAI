import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { inventoryApi } from '@/services/inventoryApi';
import { useAuth } from '@/context/useAuth';

const Page = styled.div`padding:1.5rem 1.75rem 3rem; display:flex; flex-direction:column; gap:1.4rem;`;
const Layout = styled.div`display:grid; gap:1.4rem; grid-template-columns:repeat(auto-fit,minmax(330px,1fr)); align-items:start;`;
const fadeIn = 'fadeIn .35s cubic-bezier(.4,0,.2,1)';
const popIn = 'popIn .4s cubic-bezier(.4,0,.2,1)';
const Card = styled.div`background:#fff; border:1px solid #e2e8f0; border-radius:18px; padding:1rem 1.15rem 1.2rem; display:flex; flex-direction:column; gap:.9rem; box-shadow:0 4px 14px -6px rgba(0,0,0,.05); position:relative; animation:${fadeIn}; @keyframes fadeIn{0%{opacity:0; transform:translateY(8px);}100%{opacity:1; transform:translateY(0);}}`;
const Title = styled.h2`margin:0; font-size:1.05rem; font-weight:700;`;
const Field = styled.label`display:flex; flex-direction:column; gap:.35rem; font-size:.6rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:#334155; input,textarea,select{ font-size:.7rem; padding:.55rem .65rem; border:1px solid #cbd5e1; border-radius:8px; resize:vertical; background:#fff; &:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.25);} } textarea{min-height:90px;} select{cursor:pointer;} `;
const Submit = styled.button`background:#6366f1; color:#fff; border:none; padding:.65rem .95rem; font-size:.7rem; border-radius:10px; font-weight:600; cursor:pointer; align-self:flex-start; &:disabled{opacity:.5; cursor:default;} `;
const List = styled.div`display:flex; flex-direction:column; gap:.55rem; max-height:480px; overflow:auto; padding-right:.3rem;`;
const Row = styled.div`background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:.55rem .65rem; display:grid; grid-template-columns:1fr 65px 70px 90px 80px; gap:.6rem; align-items:center; font-size:.55rem; font-weight:500; cursor:pointer; position:relative; transition:background .15s,border-color .15s, transform .25s; &:hover{background:#f1f5f9; border-color:#cbd5e1;} &:active{transform:scale(.985);}`; 
const Status = styled.span`padding:.25rem .5rem; font-size:.5rem; font-weight:600; border-radius:999px; background:${p=>p.v==='approved'?'#dcfce7':p.v==='rejected'?'#fee2e2':'#fef9c3'}; color:${p=>p.v==='approved'?'#166534':p.v==='rejected'?'#b91c1c':'#92400e'}; text-transform:uppercase; letter-spacing:.5px; text-align:center; position:relative;`;
const Actions = styled.div`display:flex; gap:.4rem; flex-wrap:wrap;`;
const Btn = styled.button`background:#fff; border:1px solid #cbd5e1; padding:.3rem .55rem; font-size:.55rem; border-radius:8px; font-weight:600; cursor:pointer; position:relative; overflow:hidden; transition:background .15s,color .15s; &:hover{background:#eef2ff; color:#3730a3;} &:disabled{opacity:.5;cursor:default;} &:active{transform:translateY(1px);} &::after{content:''; position:absolute; inset:0; background:radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(99,102,241,.35), transparent 60%); opacity:0; transition:opacity .35s; mix-blend-mode:multiply;} &:hover::after{opacity:1;}`;
const Empty = styled.div`font-size:.55rem; padding:.7rem .4rem; opacity:.7;`;
const Inline = styled.span`font-size:.55rem; opacity:.75;`;
const Tabs = styled.div`display:flex; gap:.35rem; flex-wrap:wrap;`;
const TabBtn = styled.button`background:${p=>p.active?'linear-gradient(135deg,#6366f1,#4f46e5)':'#f1f5f9'}; color:${p=>p.active?'#fff':'#334155'}; border:1px solid ${p=>p.active?'#6366f1':'#e2e8f0'}; padding:.45rem .7rem; font-size:.55rem; font-weight:600; border-radius:999px; cursor:pointer; letter-spacing:.5px; position:relative; overflow:hidden; transition:background .25s,transform .25s; &:hover{background:${p=>p.active?'linear-gradient(135deg,#4f46e5,#4338ca)':'#e2e8f0'};} &:active{transform:translateY(1px);} ${p=>p.active && 'box-shadow:0 4px 10px -3px rgba(79,70,229,.5);'} `;

// Modal / Backdrop / Toast
const Backdrop = styled.div`position:fixed; inset:0; background:radial-gradient(circle at 30% 30%,rgba(15,23,42,.65),rgba(15,23,42,.85)); backdrop-filter:blur(3px); display:flex; align-items:flex-start; justify-content:center; padding:4rem 1rem 3rem; z-index:400; animation:${fadeIn};`;
const Modal = styled.div`background:#ffffff; border:1px solid #e2e8f0; width:100%; max-width:640px; border-radius:26px; padding:1.4rem 1.6rem 1.9rem; display:flex; flex-direction:column; gap:.9rem; position:relative; box-shadow:0 12px 48px -10px rgba(0,0,0,.35); animation:${popIn}; @keyframes popIn{0%{opacity:0; transform:translateY(14px) scale(.96);}100%{opacity:1; transform:translateY(0) scale(1);}}`;
const Close = styled.button`position:absolute; top:10px; right:10px; background:#f1f5f9; border:1px solid #e2e8f0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:12px; cursor:pointer; font-weight:600; font-size:.8rem; &:hover{background:#e2e8f0;}`;
const ModalGrid = styled.div`display:grid; gap:.85rem; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); font-size:.6rem;`;
const KV = styled.div`display:flex; flex-direction:column; gap:.25rem; span.key{font-size:.55rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:#64748b;} span.val{font-size:.65rem; font-weight:500; color:#0f172a;}`;
const ToastWrap = styled.div`position:fixed; bottom:1.1rem; right:1.1rem; display:flex; flex-direction:column; gap:.6rem; z-index:500;`;
const Toast = styled.div`background:#ffffff; border:1px solid #6366f1; padding:.7rem .9rem; font-size:.6rem; font-weight:500; color:#312e81; border-radius:12px; display:flex; align-items:center; gap:.6rem; box-shadow:0 6px 22px -8px rgba(79,70,229,.45); animation:${fadeIn};`;

export default function NewRequestPage(){
  const { user } = useAuth();
  const [form,setForm] = useState({ itemName:'', category:'supplies', quantity:'1', description:'', reason:'' });
  const [loading,setLoading] = useState(false);
  const [requests,setRequests] = useState([]);
  const [filter,setFilter] = useState('mine');
  const [submitting,setSubmitting] = useState(false);
  const [decision,setDecision] = useState({});
  const [voteLoading,setVoteLoading] = useState({});
  const [active,setActive] = useState(null);
  const [toasts,setToasts] = useState([]);

  const load = useCallback(async ()=>{
    setLoading(true);
    try {
      // for users (teacher/student/staff) we want their own + approved in dept/course (handled server side)
      const res = await inventoryApi.listRequests();
      setRequests(res.requests||[]);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  },[]);
  useEffect(()=>{ load(); },[load]);

  const create = async (e) => {
    e.preventDefault();
    if(!form.itemName.trim() || !form.quantity.trim() || !form.reason.trim()) return;
    setSubmitting(true);
    try {
      await inventoryApi.createRequest({
        itemName: form.itemName,
        category: form.category,
        quantity: parseInt(form.quantity,10)||1,
        description: form.description,
        reason: form.reason
      });
      setForm({ itemName:'', category:form.category, quantity:'1', description:'', reason:'' });
      load();
      pushToast('Request submitted for review');
    } catch(e){ alert(e.message); }
    finally { setSubmitting(false); }
  };

  const decide = async (r, approve=true) => {
    setDecision(d=>({...d,[r.id]:true}));
  try { await inventoryApi.decideRequest(r.id, approve); load(); pushToast(`Request ${approve?'approved':'rejected'}`); } catch(e){ alert(e.message); }
    finally { setDecision(d=>{ const n={...d}; delete n[r.id]; return n; }); }
  };

  const vote = async (r) => {
    setVoteLoading(v=>({...v,[r.id]:true}));
  try { await inventoryApi.voteOnRequest(r.id); load(); pushToast('Vote recorded'); } catch(e){ alert(e.message); }
    finally { setVoteLoading(v=>{ const n={...v}; delete n[r.id]; return n; }); }
  };
  const pushToast = (msg) => {
    const id = Date.now();
    setToasts(t=>[...t,{ id, msg }]);
    setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)), 3200);
  };
  const handleRowClick = (r) => setActive(r);
  const closeModal = () => setActive(null);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') closeModal(); };
    if(active) window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[active]);

  const visible = requests.filter(r => {
    if (filter==='mine') return r.requested_by === user?.id;
    if (filter==='approved') return r.status==='approved';
    if (filter==='pending') return r.status==='pending';
    return true;
  });

  return (
    <Page>
      <Title>Item Requests & Voting</Title>
      <Layout>
        <Card as="form" onSubmit={create}>
          <h3 style={{margin:'0 0 .4rem', fontSize:'.85rem'}}>New Request</h3>
          <Field>Item Name<input value={form.itemName} onChange={e=>setForm(f=>({...f,itemName:e.target.value}))} required placeholder="e.g. Microscope" /></Field>
          <Field>Category<select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
            <option value="supplies">Supplies</option>
            <option value="equipment">Equipment</option>
          </select></Field>
          <Field>Quantity<input type="number" min={1} value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} required /></Field>
            <Field>Description<textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Optional description" /></Field>
          <Field>Reason<textarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} required placeholder="Why is this needed?" /></Field>
          <Submit disabled={submitting}>{submitting? 'Submitting...' : 'Submit Request'}</Submit>
        </Card>
        <Card style={{gridColumn:'span 2'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.6rem'}}>
            <h3 style={{margin:0, fontSize:'.85rem'}}>Requests</h3>
            <Tabs>
              {['mine','approved','pending','all'].map(t=> <TabBtn key={t} type="button" active={t===filter} onClick={()=>setFilter(t)}>{t}</TabBtn>)}
            </Tabs>
          </div>
          {loading && <Inline>Loading...</Inline>}
          {!loading && !visible.length && <Empty>No requests.</Empty>}
          {!loading && !!visible.length && (
            <List>
              {visible.map(r => (
                <Row key={r.id} onClick={()=>handleRowClick(r)}>
                  <div style={{fontWeight:600}}>{r.item_name}</div>
                  <div>{r.quantity}</div>
                  <div>{r.category}</div>
                  <div>{r.status==='approved'? (r.votes!==undefined? r.votes+' votes' : '-') : r.status}</div>
                  <div>
                    <Status v={r.status}>{r.status}</Status>
                  </div>
                  <Actions style={{gridColumn:'1 / -1'}}>
                    {r.status==='pending' && (user?.role==='manager' || user?.role==='admin') && (
                      <>
                        <Btn disabled={!!decision[r.id]} onClick={(e)=>{e.stopPropagation();decide(r,true);}}>Approve</Btn>
                        <Btn disabled={!!decision[r.id]} onClick={(e)=>{e.stopPropagation();decide(r,false);}} style={{background:'#fee2e2'}}>Reject</Btn>
                      </>
                    )}
                    {r.status==='approved' && r.requested_by !== user?.id && !r.voted && (
                      <Btn disabled={!!voteLoading[r.id]} onClick={(e)=>{e.stopPropagation();vote(r);}}>Vote</Btn>
                    )}
                  </Actions>
                </Row>
              ))}
            </List>
          )}
        </Card>
      </Layout>
      {active && createPortal(
        <Backdrop onClick={e=>{ if(e.target===e.currentTarget) closeModal(); }}>
          <Modal>
            <Close onClick={closeModal}>✕</Close>
            <h3 style={{margin:'0 0 .4rem', fontSize:'.9rem'}}>{active.item_name}</h3>
            <ModalGrid>
              <KV><span className="key">Category</span><span className="val">{active.category}</span></KV>
              <KV><span className="key">Quantity</span><span className="val">{active.quantity}</span></KV>
              <KV><span className="key">Status</span><span className="val">{active.status}</span></KV>
              {active.votes!==undefined && <KV><span className="key">Votes</span><span className="val">{active.votes}</span></KV>}
            </ModalGrid>
            {active.description && <p style={{fontSize:'.6rem', lineHeight:'1rem', margin:'1rem 0 .4rem'}}>{active.description}</p>}
            {active.reason && <div style={{fontSize:'.55rem', background:'#f1f5f9', padding:'.6rem .7rem', borderRadius:'10px', border:'1px solid #e2e8f0'}}><strong style={{fontSize:'.55rem'}}>Reason: </strong>{active.reason}</div>}
            <div style={{display:'flex', gap:'.5rem', marginTop:'1rem', flexWrap:'wrap'}}>
              {active.status==='pending' && (user?.role==='manager'||user?.role==='admin') && <>
                <Btn onClick={()=>{decide(active,true); closeModal();}}>Approve</Btn>
                <Btn onClick={()=>{decide(active,false); closeModal();}} style={{background:'#fee2e2'}}>Reject</Btn>
              </>}
              {active.status==='approved' && active.requested_by !== user?.id && !active.voted && <Btn onClick={()=>{vote(active); closeModal();}}>Vote</Btn>}
              <Btn onClick={closeModal} style={{background:'#f1f5f9'}}>Close</Btn>
            </div>
          </Modal>
        </Backdrop>, document.body)}
      {createPortal(
        <ToastWrap>
          {toasts.map(t => <Toast key={t.id}>{t.msg}</Toast>)}
        </ToastWrap>, document.body)}
    </Page>
  );
}