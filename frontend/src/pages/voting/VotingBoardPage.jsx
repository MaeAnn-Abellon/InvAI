import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { inventoryApi } from '@/services/inventoryApi';
import { useAuth } from '@/context/useAuth';
import { PageSurface, GradientHeading, GlassPanel, PrimaryButton, SubNote, Divider } from '@/components/ui/Glass';
import NewRequestModal from '@/components/requests/NewRequestModal';
import { Search as SearchIcon, X as XIcon, Filter as FilterIcon } from 'lucide-react';

const fadeIn = 'fadeIn .35s cubic-bezier(.4,0,.2,1)';
const popIn = 'popIn .4s cubic-bezier(.4,0,.2,1)';
const Page = styled(PageSurface)`padding:2rem 2.25rem 3rem; display:flex; flex-direction:column; gap:1.4rem;`;
const Header = styled.div`display:flex; flex-direction:column; gap:.6rem; @media(min-width:680px){flex-direction:row; align-items:center; justify-content:space-between;}`;
const Title = styled(GradientHeading)`margin:0; font-size:1.55rem;`;
const SearchGroup = styled.div`
  width:100%;
  display:flex;
  align-items:center;
  position:relative;
  flex:0 0 auto;
`;
const SearchBox = styled.input`
  flex:1 1 auto;
  min-width:0;
  width:100%;
  max-width:100%;
  box-sizing:border-box;
  border:1px solid rgba(99,102,241,.35);
  background:linear-gradient(155deg,rgba(255,255,255,.92),rgba(255,255,255,.72));
  border-radius:14px;
  padding:.7rem 2.4rem .7rem 2.2rem; /* leave space for icons */
  font-size:.75rem;
  line-height:1;
  box-shadow:0 3px 10px -4px rgba(99,102,241,.28), 0 1px 0 rgba(255,255,255,.55) inset;
  transition:border-color .25s, box-shadow .25s, background .35s;
  &::placeholder{color:#94a3b8; letter-spacing:.3px;}
  &:focus{outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.25), 0 3px 10px -4px rgba(99,102,241,.4);} 
  @media (max-width:520px){ flex:1 1 100%; width:100%; }
`;
const SearchIconWrap = styled.span`
  position:absolute; left:.75rem; top:50%; transform:translateY(-50%); display:flex; align-items:center; justify-content:center; color:#6366f1; opacity:.85; pointer-events:none; height:1rem; width:1rem;
`;
const ClearBtn = styled.button`
  position:absolute; right:.55rem; top:50%; transform:translateY(-50%); background:rgba(99,102,241,.15); border:1px solid rgba(99,102,241,.3); width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer; color:#374151; font-size:.65rem; padding:0; &:hover{background:rgba(99,102,241,.25);} &:active{transform:translateY(calc(-50% + 1px));}
`;
const FiltersInline = styled.div`display:flex; gap:.6rem; flex-wrap:wrap; align-items:center;`;
const Toggle = styled.label`display:inline-flex; align-items:center; gap:.4rem; font-size:.55rem; font-weight:600; letter-spacing:.5px; background:rgba(255,255,255,.55); border:1px solid rgba(255,255,255,.4); padding:.45rem .65rem; border-radius:12px; cursor:pointer; user-select:none;`; 
const ToggleInput = styled.input`accent-color:#6366f1; width:14px; height:14px;`;
const FilterSel = styled.select`
  border:1px solid rgba(99,102,241,.35);
  background:linear-gradient(145deg,rgba(255,255,255,.9),rgba(255,255,255,.72));
  border-radius:14px;
  font-size:.65rem;
  font-weight:600;
  letter-spacing:.5px;
  text-transform:uppercase;
  display:inline-flex;
  align-items:center;
  min-width:150px;
  cursor:pointer;
  box-shadow:0 3px 10px -4px rgba(99,102,241,.3), 0 1px 0 rgba(255,255,255,.55) inset;
  &:focus{outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.25), 0 3px 10px -4px rgba(99,102,241,.45);} 
`;
const Grid = styled.div`display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(250px,1fr));`;
const Card = styled(GlassPanel)`padding:1rem 1.05rem 1.15rem; display:flex; flex-direction:column; gap:.6rem; cursor:pointer; border-radius:20px; position:relative; animation:${fadeIn}; transition:transform .35s, box-shadow .35s; &:hover{transform:translateY(-4px);} &:active{transform:translateY(-1px);} @keyframes fadeIn{0%{opacity:0; transform:translateY(8px);}100%{opacity:1; transform:translateY(0);}}`;
const Name = styled.div`font-size:.85rem; font-weight:600; line-height:1.1;`;
const Meta = styled.div`font-size:.55rem; display:flex; gap:.45rem; flex-wrap:wrap; color:#475569;`;
const Badge = styled.span`background:rgba(255,255,255,.55); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,.35); padding:.28rem .55rem; font-size:.5rem; font-weight:600; border-radius:999px; letter-spacing:.5px; text-transform:uppercase; box-shadow:0 2px 6px -2px rgba(0,0,0,.18);`;
const VoteBtn = styled(PrimaryButton)`margin-top:.25rem; font-size:.53rem; padding:.45rem .7rem; border-radius:10px; background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; display:inline-flex; align-items:center; gap:.35rem;`;
const Count = styled.div`font-size:.6rem; font-weight:600; background:#eef2ff; color:#4338ca; padding:.32rem .6rem; border-radius:10px; display:inline-flex; align-items:center; gap:.3rem; position:relative; box-shadow:0 2px 6px -2px rgba(67,56,202,.35);`;
const ToastWrap = styled.div`position:fixed; bottom:1rem; right:1rem; display:flex; flex-direction:column; gap:.55rem; z-index:500;`;
const Toast = styled.div`background:rgba(255,255,255,.85); backdrop-filter:blur(8px); border:1px solid rgba(99,102,241,.6); padding:.65rem .85rem; font-size:.55rem; font-weight:500; color:#312e81; border-radius:14px; display:flex; align-items:center; gap:.5rem; box-shadow:0 6px 22px -8px rgba(79,70,229,.45); animation:${fadeIn};`;
// Modal overlay reused for detail view
const Backdrop = styled.div`position:fixed; inset:0; background:radial-gradient(circle at 30% 30%,rgba(15,23,42,.65),rgba(15,23,42,.85)); backdrop-filter:blur(5px); display:flex; align-items:flex-start; justify-content:center; padding:4rem 1rem 3rem; z-index:400; animation:${fadeIn};`;
const ModalPanel = styled(GlassPanel)`width:100%; max-width:560px; padding:1.35rem 1.55rem 1.55rem; border-radius:30px; position:relative; display:flex; flex-direction:column; gap:.85rem; animation:${popIn}; @keyframes popIn{0%{opacity:0; transform:translateY(14px) scale(.96);}100%{opacity:1; transform:translateY(0) scale(1);}}`;
const Close = styled.button`position:absolute; top:10px; right:10px; background:rgba(255,255,255,.8); border:1px solid rgba(255,255,255,.4); width:38px; height:38px; display:flex; align-items:center; justify-content:center; border-radius:14px; cursor:pointer; font-weight:600; font-size:.85rem; &:hover{background:rgba(255,255,255,1);}`;

export default function VotingBoardPage(){
  const { user } = useAuth();
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(false);
  const [voting,setVoting] = useState({});
  const [q,setQ] = useState('');
  const [cat,setCat] = useState('all');
  const [onlyAvailable,setOnlyAvailable] = useState(false);
  const [active,setActive] = useState(null);
  const [toasts,setToasts] = useState([]);
  const autoRef = useRef(null);
  // New Request modal state
  const [showNew,setShowNew] = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [requestForm,setRequestForm] = useState({ itemName:'', category:'supplies', quantity:'1', description:'', reason:'' });

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
  const submitRequest = async () => {
    if(submitting) return;
    const { itemName, quantity, reason } = requestForm;
    if(!itemName.trim() || !quantity.trim() || !reason.trim()) return;
    setSubmitting(true);
    try {
      await inventoryApi.createRequest({
        itemName: requestForm.itemName,
        category: requestForm.category,
        quantity: parseInt(requestForm.quantity,10)||1,
        description: requestForm.description,
        reason: requestForm.reason
      });
      setShowNew(false);
      setRequestForm({ itemName:'', category:requestForm.category, quantity:'1', description:'', reason:'' });
      pushToast('Request submitted');
      // Optionally reload items if newly approved appear later
    } catch(e){ alert(e.message); }
    finally { setSubmitting(false); }
  };
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') closeModal(); };
    if(active) window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[active]);

  const filtered = items.filter(i => {
    if(q && !i.item_name.toLowerCase().includes(q.toLowerCase())) return false;
    if(cat!=='all' && i.category!==cat) return false;
    if(onlyAvailable && (i.voted || i.requested_by === user?.id)) return false;
    return true;
  });

  const highlight = (text) => {
    if(!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&')})`,'ig'));
    return parts.map((p,i)=> p.toLowerCase()===q.toLowerCase() ? <mark key={i} style={{background:'linear-gradient(90deg,#6366f1,#4f46e5)', color:'#fff', borderRadius:4, padding:'0 2px'}}>{p}</mark> : p);
  };

  const sameDeptCourseInfo = user ? `${user.department||'No Dept'} / ${user.course||'No Course'}` : '';
  const noDeptCourse = !user?.department || !user?.course;

  return (
    <Page>
      <Header>
        <div>
          <Title as="h1">Voting Board</Title>
          <SubNote style={{marginTop:'.35rem'}}>Your approved department & course requests only. Department/Course: <strong style={{color:'#334155'}}>{sameDeptCourseInfo}</strong>{noDeptCourse && ' (set your department & course to participate)'}.</SubNote>
        </div>
        <div style={{display:'flex', gap:'.6rem', flexWrap:'wrap'}}>
          <PrimaryButton type="button" onClick={()=>setShowNew(true)} style={{padding:'.55rem 1rem'}}>➕ New Request</PrimaryButton>
        </div>
      </Header>
      <GlassPanel style={{padding:'.7rem .85rem .85rem', borderRadius:24, display:'flex', flexDirection:'column', gap:'.55rem'}}>
        <SearchGroup>
            <SearchIconWrap><SearchIcon size={14} strokeWidth={2}/></SearchIconWrap>
            <SearchBox aria-label="Search requests" placeholder="Search item name..." value={q} onChange={e=>setQ(e.target.value)} />
            {q && <ClearBtn type="button" aria-label="Clear search" onClick={()=>setQ('')}><XIcon size={14}/></ClearBtn>}
        </SearchGroup>
        <FiltersInline style={{display:'flex', gap:'.5rem', flexWrap:'wrap', alignItems:'center'}}>
          <FilterSel value={cat} onChange={e=>setCat(e.target.value)} aria-label="Filter by category" style={{height:'38px', padding:'.5rem .6rem'}}>
            <option value="all">All Categories</option>
            <option value="supplies">Supplies</option>
            <option value="equipment">Equipment</option>
          </FilterSel>
          <Toggle title="Show only items you can still vote on" style={{padding:'.4rem .55rem', height:'38px'}}>
            <ToggleInput type="checkbox" checked={onlyAvailable} onChange={e=>setOnlyAvailable(e.target.checked)} />
            <span style={{fontSize:'.5rem'}}>Not Voted</span>
          </Toggle>
          <div style={{fontSize:'.5rem', opacity:.65, marginLeft:'auto', padding:'0 .25rem'}}>{loading? 'Loading...' : filtered.length + ' items'}</div>
        </FiltersInline>
      </GlassPanel>
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
              <Name>{highlight(r.item_name)}</Name>
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
          <ModalPanel>
            <Close onClick={closeModal}>✕</Close>
            <h3 style={{margin:'0 0 .35rem', fontSize:'.95rem'}}>{active.item_name}</h3>
            <Divider />
            <div style={{display:'flex', flexWrap:'wrap', gap:'.45rem', fontSize:'.55rem'}}>
              <Badge>{active.category}</Badge>
              <Badge>Qty {active.quantity}</Badge>
              {active.department && active.course && <Badge>{active.department}/{active.course}</Badge>}
              {active.votes!==undefined && <Badge>Votes: {active.votes}</Badge>}
              {active.voted && <Badge style={{background:'rgba(16,185,129,.18)', borderColor:'rgba(16,185,129,.35)', color:'#065f46'}}>VOTED</Badge>}
            </div>
            {active.description && <p style={{fontSize:'.58rem', lineHeight:'1rem', margin:'.75rem 0 .5rem'}}>{active.description}</p>}
            {active.reason && <div style={{fontSize:'.55rem', background:'rgba(255,255,255,.55)', padding:'.55rem .65rem', borderRadius:'14px', border:'1px solid rgba(255,255,255,.4)'}}><strong style={{fontSize:'.55rem'}}>Reason: </strong>{active.reason}</div>}
            <div style={{display:'flex', gap:'.6rem', marginTop:'1rem', flexWrap:'wrap'}}>
              {active.requested_by !== user?.id && !active.voted && !noDeptCourse && <VoteBtn disabled={!!voting[active.id]} onClick={()=>{vote(active); closeModal();}}>{voting[active.id]? 'Voting...' : 'Vote'}</VoteBtn>}
              <PrimaryButton type="button" onClick={closeModal} style={{background:'rgba(255,255,255,.85)', color:'#1e293b', border:'1px solid rgba(255,255,255,.4)', padding:'.55rem .9rem'}}>Close</PrimaryButton>
            </div>
          </ModalPanel>
        </Backdrop>, document.body)}
      <NewRequestModal
        open={showNew}
        onClose={()=>{ if(!submitting) setShowNew(false); }}
        onSubmit={submitRequest}
        form={requestForm}
        setForm={setRequestForm}
        submitting={submitting}
      />
      {createPortal(
        <ToastWrap>
          {toasts.map(t => <Toast key={t.id}>{t.msg}</Toast>)}
        </ToastWrap>, document.body)}
    </Page>
  );
}