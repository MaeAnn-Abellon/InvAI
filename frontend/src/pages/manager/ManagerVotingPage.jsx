import React, { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { inventoryApi } from '@/services/inventoryApi';
import { useAuth } from '@/context/useAuth';

const Page = styled.div`padding:1.6rem 1.8rem 2.8rem;`;
const Heading = styled.h1`margin:0 0 1.2rem; font-size:1.55rem; font-weight:800; letter-spacing:.5px; background:linear-gradient(90deg,#312e81,#6366f1); -webkit-background-clip:text; color:transparent;`;
const TopBar = styled.div`display:flex; flex-direction:column; gap:.8rem; margin-bottom:1.2rem; @media(min-width:760px){flex-direction:row; align-items:center; justify-content:space-between;}`;
const Card = styled.div`background:#fff; border:1px solid #e2e8f0; border-radius:18px; padding:1rem 1.15rem 1.15rem; box-shadow:0 6px 18px -8px rgba(0,0,0,.08); display:flex; flex-direction:column; gap:.65rem;`;
const Grid = styled.div`display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));`;
const ItemTitle = styled.h3`margin:0; font-size:.9rem; font-weight:600; line-height:1.15; color:#1e293b;`;
const Badge = styled.span`display:inline-block; background:#f1f5f9; padding:.28rem .55rem; font-size:.5rem; font-weight:600; letter-spacing:.5px; border-radius:999px; text-transform:uppercase; color:#334155;`;
const Muted = styled.span`font-size:.55rem; color:#64748b;`;
const Actions = styled.div`display:flex; gap:.45rem; flex-wrap:wrap;`; 
const Btn = styled.button`background:#f1f5f9; border:1px solid #e2e8f0; padding:.5rem .75rem; font-size:.55rem; font-weight:600; border-radius:10px; cursor:pointer; color:#334155; &:hover{background:#e2e8f0;} &.danger{background:#fee2e2; border-color:#fecaca; color:#b91c1c;} &.primary{background:#6366f1; border-color:#6366f1; color:#fff;} &:disabled{opacity:.55; cursor:default;}`;
const Placeholder = styled.div`padding:1rem; font-size:.6rem; color:#475569; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:16px; text-align:center;`;
const TopHighlight = styled.div`background:linear-gradient(135deg,#6366f1,#4338ca); color:#fff; padding:1rem 1.15rem; border-radius:22px; position:relative; overflow:hidden; box-shadow:0 10px 24px -10px rgba(99,102,241,.45);`;
const TopTitle = styled.h2`margin:0 0 .4rem; font-size:1rem; font-weight:700; display:flex; gap:.5rem; align-items:center;`;
const ToastStack = styled.div`position:fixed; bottom:1rem; right:1rem; display:flex; flex-direction:column; gap:.55rem; z-index:5000;`;
const Toast = styled.div`background:#fff; border:1px solid #6366f1; padding:.6rem .75rem; font-size:.55rem; font-weight:600; color:#312e81; border-radius:12px; box-shadow:0 6px 18px -6px rgba(79,70,229,.4);`;

export default function ManagerVotingPage(){
  const { user } = useAuth();
  const [requests,setRequests] = useState([]);
  const [loading,setLoading] = useState(false);
  const [top,setTop] = useState(null);
  const [busy,setBusy] = useState({}); // id -> bool
  const [toasts,setToasts] = useState([]);
  const pushToast = (msg)=>{ const id=Date.now()+Math.random(); setToasts(t=>[...t,{id,msg}]); setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)),3200); };

  const load = useCallback(async ()=>{
    setLoading(true);
    try {
      const [listRes, topRes] = await Promise.all([
        inventoryApi.listApprovedForVoting(), // existing endpoint returns approved requests for manager scope
        inventoryApi.weeklyTopRequest().catch(()=>({}))
      ]);
      setRequests(listRes.requests||[]);
      setTop(topRes.top||null);
    } finally { setLoading(false); }
  },[]);

  useEffect(()=>{ if(user?.role==='manager') load(); },[user,load]);

  const del = async (r) => {
    if (!window.confirm(`Delete request "${r.item_name}"? This removes it from voting.`)) return;
    setBusy(b=>({...b,[r.id]:true}));
    try { await inventoryApi.deleteRequest(r.id); pushToast('Request deleted'); load(); }
    catch(e){ alert(e.message); }
    finally { setBusy(b=>{ const n={...b}; delete n[r.id]; return n; }); }
  };
  const convert = async (r) => {
    if (!window.confirm(`Convert "${r.item_name}" to inventory? This will remove the request from voting.`)) return;
    setBusy(b=>({...b,[r.id]:true}));
    try { await inventoryApi.convertRequest(r.id); pushToast('Added to inventory'); load(); }
    catch(e){ alert(e.message); }
    finally { setBusy(b=>{ const n={...b}; delete n[r.id]; return n; }); }
  };

  const weekLabel = (()=>{
    if (!top) return null; const week = top.week_number; const ws = top.week_start; return `Week ${week} (from ${ws})`;
  })();

  return (
    <Page>
      <TopBar>
        <Heading>Department Voting Overview</Heading>
      </TopBar>
      <TopHighlight>
        <TopTitle>Most Voted Item {weekLabel && <span style={{fontSize:'.65rem', fontWeight:500, opacity:.9}}>as of {weekLabel}</span>}</TopTitle>
        {!top && <Muted style={{color:'#e2e8f0'}}>No votes yet this week.</Muted>}
        {top && (
          <div style={{display:'flex', flexDirection:'column', gap:'.4rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.6rem'}}>
              <div style={{display:'flex', flexDirection:'column', gap:'.2rem', minWidth:0}}>
                <span style={{fontSize:'.85rem', fontWeight:700}}>{top.item_name}</span>
                <span style={{fontSize:'.55rem', opacity:.85}}>Week Votes: {top.votes_week} • Total Votes: {top.votes_total}</span>
              </div>
              <Actions>
                <Btn className='danger' disabled={busy[top.id]} onClick={()=>del(top)}>Delete</Btn>
                <Btn className='primary' disabled={busy[top.id]} onClick={()=>convert(top)}>Add to Inventory</Btn>
              </Actions>
            </div>
          </div>
        )}
      </TopHighlight>

      <div style={{margin:'1.5rem 0 .8rem'}}>
        <h2 style={{margin:'0 0 .6rem', fontSize:'1rem'}}>Approved Requests (Voting List)</h2>
        {loading && <Muted>Loading...</Muted>}
        {!loading && !requests.length && <Placeholder>No approved requests in voting list.</Placeholder>}
        {!loading && !!requests.length && (
          <Grid>
            {requests.map(r => (
              <Card key={r.id}>
                <ItemTitle>{r.item_name}</ItemTitle>
                <div style={{display:'flex', gap:'.4rem', flexWrap:'wrap'}}>
                  <Badge>{r.category}</Badge>
                  <Badge>Qty {r.quantity}</Badge>
                  <Badge style={{background:'#ede9fe', color:'#5b21b6'}}>Votes {r.votes}</Badge>
                </div>
                {r.description && <Muted style={{fontSize:'.5rem', lineHeight:1.3}}>{r.description}</Muted>}
                <Muted style={{fontSize:'.48rem'}}>Requested by: {r.requested_by_username || r.requested_by_full_name || 'User '+r.requested_by}</Muted>
                <Actions>
                  <Btn className='danger' disabled={busy[r.id]} onClick={()=>del(r)}>Delete</Btn>
                  <Btn className='primary' disabled={busy[r.id]} onClick={()=>convert(r)}>Add to Inventory</Btn>
                </Actions>
              </Card>
            ))}
          </Grid>
        )}
      </div>
      {!!toasts.length && (
        <ToastStack>
          {toasts.map(t=> <Toast key={t.id}>{t.msg}</Toast>)}
        </ToastStack>
      )}
    </Page>
  );
}
