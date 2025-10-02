import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { inventoryApi } from '@/services/inventoryApi';
import { useAuth } from '@/context/useAuth';

const fadeIn = 'fadeIn .35s cubic-bezier(.4,0,.2,1)';
const popIn = 'popIn .4s cubic-bezier(.4,0,.2,1)';
const Wrap = styled.div`padding:1.6rem 1.9rem 2.6rem; display:flex; flex-direction:column; gap:1.4rem;`;
const Title = styled.h2`margin:0; font-size:1.05rem; font-weight:700;`;
const SubNote = styled.p`margin:.1rem 0 0; font-size:.55rem; color:#64748b; line-height:1.1;`;
const Grid = styled.div`display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(250px,1fr));`;
const Card = styled.div`background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:.9rem 1rem 1.05rem; display:flex; flex-direction:column; gap:.6rem; box-shadow:0 4px 18px -8px rgba(0,0,0,.08); position:relative; cursor:pointer; animation:${fadeIn}; transition:transform .3s, box-shadow .3s, border-color .25s; &:hover{transform:translateY(-4px); box-shadow:0 10px 28px -10px rgba(0,0,0,.25); border-color:#cbd5e1;} &:active{transform:translateY(-1px);} @keyframes fadeIn{0%{opacity:0; transform:translateY(8px);}100%{opacity:1; transform:translateY(0);}}`;
const Name = styled.div`font-size:.8rem; font-weight:600;`;
const Meta = styled.div`font-size:.55rem; display:flex; gap:.45rem; flex-wrap:wrap; color:#475569;`;
const Badge = styled.span`background:#f1f5f9; border:1px solid #e2e8f0; padding:.25rem .5rem; font-size:.5rem; font-weight:600; border-radius:999px; letter-spacing:.5px; text-transform:uppercase;`;
const VoteBtn = styled.button`margin-top:.4rem; align-self:flex-start; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; border:none; padding:.45rem .75rem; font-size:.6rem; font-weight:600; border-radius:10px; cursor:pointer; position:relative; overflow:hidden; transition:filter .3s, transform .2s; &:hover{filter:brightness(1.08);} &:active{transform:translateY(1px);} &:disabled{opacity:.55; cursor:default; filter:none;}`;
const Count = styled.div`font-size:.6rem; font-weight:600; background:#eef2ff; color:#4338ca; padding:.3rem .55rem; border-radius:8px; display:inline-flex; align-items:center; gap:.3rem; position:relative;`;
const SearchBox = styled.input`border:1px solid #cbd5e1; background:#fff; border-radius:8px; padding:.5rem .65rem; font-size:.6rem; width:220px; &:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.25);} `;
const Toolbar = styled.div`display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:.8rem;`;
const FilterSel = styled.select`border:1px solid #cbd5e1; background:#fff; border-radius:8px; padding:.45rem .6rem; font-size:.6rem;`;

// Modal + Toast
const Backdrop = styled.div`position:fixed; inset:0; background:radial-gradient(circle at 30% 30%,rgba(15,23,42,.65),rgba(15,23,42,.85)); backdrop-filter:blur(3px); display:flex; align-items:flex-start; justify-content:center; padding:4rem 1rem 3rem; z-index:400; animation:${fadeIn};`;
const Modal = styled.div`background:#ffffff; border:1px solid #e2e8f0; width:100%; max-width:560px; border-radius:24px; padding:1.3rem 1.5rem 1.6rem; display:flex; flex-direction:column; gap:.8rem; position:relative; box-shadow:0 12px 44px -8px rgba(0,0,0,.32); animation:${popIn}; @keyframes popIn{0%{opacity:0; transform:translateY(14px) scale(.96);}100%{opacity:1; transform:translateY(0) scale(1);}}`;
const Close = styled.button`position:absolute; top:10px; right:10px; background:#f1f5f9; border:1px solid #e2e8f0; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:12px; cursor:pointer; font-weight:600; font-size:.8rem; &:hover{background:#e2e8f0;}`;
const ToastWrap = styled.div`position:fixed; bottom:1rem; right:1rem; display:flex; flex-direction:column; gap:.55rem; z-index:500;`;
const Toast = styled.div`background:#ffffff; border:1px solid #6366f1; padding:.65rem .85rem; font-size:.55rem; font-weight:500; color:#312e81; border-radius:12px; display:flex; align-items:center; gap:.5rem; box-shadow:0 6px 22px -8px rgba(79,70,229,.45); animation:${fadeIn};`;

export default function VotingBoardPage(){
  const { user } = useAuth();
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(false);
  const [voting,setVoting] = useState({});
  const [q,setQ] = useState('');
  const [cat,setCat] = useState('all');
  const [active,setActive] = useState(null);
  const [toasts,setToasts] = useState([]);
  const autoRef = useRef(null);

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const res = await inventoryApi.listApprovedForVoting();
      setItems(res.requests||[]);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  },[]);
  useEffect(()=>{ load(); },[load]);

  // Auto-refresh every 15s to reflect new votes (only if page visible)
  useEffect(()=>{
    autoRef.current = setInterval(()=>{
      if(document.hidden) return;
      load();
    },15000);
    return ()=>{ if(autoRef.current) clearInterval(autoRef.current); };
  },[load]);

  const vote = async (r) => {
    setVoting(v=>({...v,[r.id]:true}));
    try { await inventoryApi.voteOnRequest(r.id); load(); pushToast('Vote recorded'); } catch(e){ alert(e.message); }
    finally { setVoting(v=>{ const n={...v}; delete n[r.id]; return n; }); }
  };
  const pushToast = (msg) => {
    const id = Date.now();
    setToasts(t=>[...t,{id,msg}]);
    setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)), 3000);
  };
  const closeModal = () => setActive(null);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') closeModal(); };
    if(active) window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[active]);

  const filtered = items.filter(i => {
    if(q && !i.item_name.toLowerCase().includes(q.toLowerCase())) return false;
    if(cat!=='all' && i.category!==cat) return false;
    return true;
  });

  const sameDeptCourseInfo = user ? `${user.department||'No Dept'} / ${user.course||'No Course'}` : '';
  const noDeptCourse = !user?.department || !user?.course;

  return (
    <Wrap>
      <Title>Voting Board</Title>
      <SubNote>Your approved department & course requests only. Department/Course: <strong style={{color:'#334155'}}>{sameDeptCourseInfo}</strong>{noDeptCourse && ' (set your department & course to participate)'}.</SubNote>
      <Toolbar>
        <SearchBox placeholder="Search item..." value={q} onChange={e=>setQ(e.target.value)} />
        <FilterSel value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="supplies">Supplies</option>
          <option value="equipment">Equipment</option>
        </FilterSel>
        <div style={{fontSize:'.55rem', opacity:.7}}>{loading? 'Loading...' : filtered.length + ' items'}</div>
      </Toolbar>
      {!loading && !filtered.length && (
        <div style={{fontSize:'.6rem', background:'#f1f5f9', border:'1px solid #e2e8f0', padding:'.9rem 1rem', borderRadius:14}}>
          {noDeptCourse ? 'Set your department and course in your profile to view and vote on approved requests.' : 'No approved requests available for your department & course yet.'}
        </div>
      )}
      <Grid>
        {filtered.map(r => {
          const disableVote = r.requested_by === user?.id || r.voted || noDeptCourse;
          return (
            <Card key={r.id} onClick={()=>setActive(r)}>
              <Name>{r.item_name}</Name>
              <Meta>
                <Badge>{r.category}</Badge>
                <Badge>Qty {r.quantity}</Badge>
                {r.department && r.course && <Badge style={{background:'#eef2ff', borderColor:'#e0e7ff'}}>{r.department}/{r.course}</Badge>}
                {r.voted && <Badge style={{background:'#dcfce7', borderColor:'#bbf7d0', color:'#166534'}}>VOTED</Badge>}
              </Meta>
              {r.description && <div style={{fontSize:'.55rem', lineHeight:1.35}}>{r.description}</div>}
              <div style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
                <Count>{r.votes} vote{r.votes===1?'':'s'}</Count>
                {!disableVote && (
                  <VoteBtn disabled={!!voting[r.id]} onClick={(e)=>{e.stopPropagation(); vote(r);}}>{voting[r.id]? 'Voting...' : 'Vote'}</VoteBtn>
                )}
                {disableVote && r.requested_by===user?.id && <span style={{fontSize:'.48rem', fontWeight:600, color:'#64748b'}}>Your request</span>}
                {disableVote && r.voted && r.requested_by!==user?.id && <span style={{fontSize:'.48rem', fontWeight:600, color:'#166534'}}>Thank you!</span>}
                {disableVote && noDeptCourse && <span style={{fontSize:'.48rem', fontWeight:600, color:'#b45309'}}>Set dept/course</span>}
              </div>
            </Card>
          );
        })}
      </Grid>
      {active && createPortal(
        <Backdrop onClick={e=>{ if(e.target===e.currentTarget) closeModal(); }}>
          <Modal>
            <Close onClick={closeModal}>✕</Close>
            <h3 style={{margin:'0 0 .35rem', fontSize:'.9rem'}}>{active.item_name}</h3>
            <div style={{display:'flex', flexWrap:'wrap', gap:'.45rem', fontSize:'.55rem'}}>
              <Badge>{active.category}</Badge>
              <Badge>Qty {active.quantity}</Badge>
              {active.department && active.course && <Badge>{active.department}/{active.course}</Badge>}
              {active.votes!==undefined && <Badge>Votes: {active.votes}</Badge>}
              {active.voted && <Badge style={{background:'#dcfce7', borderColor:'#bbf7d0', color:'#166534'}}>VOTED</Badge>}
            </div>
            {active.description && <p style={{fontSize:'.6rem', lineHeight:'1rem', margin:'.8rem 0 .4rem'}}>{active.description}</p>}
            {active.reason && <div style={{fontSize:'.55rem', background:'#f1f5f9', padding:'.55rem .6rem', borderRadius:'10px', border:'1px solid #e2e8f0'}}><strong style={{fontSize:'.55rem'}}>Reason: </strong>{active.reason}</div>}
            <div style={{display:'flex', gap:'.55rem', marginTop:'1rem', flexWrap:'wrap'}}>
              {active.requested_by !== user?.id && !active.voted && !noDeptCourse && <VoteBtn disabled={!!voting[active.id]} onClick={()=>{vote(active); closeModal();}}>{voting[active.id]? 'Voting...' : 'Vote'}</VoteBtn>}
              <VoteBtn style={{background:'#e2e8f0', color:'#1e293b'}} onClick={closeModal}>Close</VoteBtn>
            </div>
          </Modal>
        </Backdrop>, document.body)}
      {createPortal(
        <ToastWrap>
          {toasts.map(t => <Toast key={t.id}>{t.msg}</Toast>)}
        </ToastWrap>, document.body)}
    </Wrap>
  );
}