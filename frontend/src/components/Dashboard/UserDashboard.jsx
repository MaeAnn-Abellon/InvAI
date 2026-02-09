import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '@/context/useAuth';
import { inventoryApi } from '@/services/inventoryApi';
import StatusAnalytics from '@/components/analytics/StatusAnalytics';

/* Layout - themed to match auth pages (gradient + glass) */
const Wrapper = styled.div`
  position:relative;
  padding:2rem;
  min-height:100vh;
  padding-top:1.6rem;
  background:
    radial-gradient(circle at 12% 18%, rgba(99,102,241,.18), transparent 60%),
    radial-gradient(circle at 88% 72%, rgba(72,52,212,.20), transparent 55%),
    linear-gradient(135deg,#eef2f7,#f1f5f9);
  overflow:hidden;
  &:before, &:after { content:''; position:absolute; width:560px; height:560px; border-radius:50%; filter:blur(70px); opacity:.35; z-index:0; mix-blend-mode:soft-light; }
  &:before { top:-180px; left:-200px; background:radial-gradient(circle,#6366f1,#4834d4 60%); animation:floatA 18s linear infinite; }
  &:after { bottom:-200px; right:-220px; background:radial-gradient(circle,#6366f1,#312e81 60%); animation:floatB 22s linear infinite; }
  @keyframes floatA { 0%{ transform:translateY(0) rotate(0deg);} 50%{ transform:translateY(-40px) rotate(140deg);} 100%{ transform:translateY(0) rotate(360deg);} }
  @keyframes floatB { 0%{ transform:translateY(0) rotate(0deg);} 50%{ transform:translateY(50px) rotate(220deg);} 100%{ transform:translateY(0) rotate(360deg);} }
`;

/* Header */
const Header = styled.div`
  display:flex;
  flex-direction:column;
  gap:.4rem;
  margin-bottom:1.25rem;
`;
const Heading = styled.h1`
  margin:0;
  font-size:1.55rem;
  font-weight:800;
  letter-spacing:.6px;
  display:flex;
  gap:.6rem;
  align-items:center;
  background:linear-gradient(90deg,#312e81,#4834d4,#6366f1);
  -webkit-background-clip:text;
  color:transparent;
`;
const HeaderActions = styled.div`margin-left:auto; display:flex; gap:.6rem; flex-wrap:wrap;`;
const PrimaryBtn = styled.button`background:linear-gradient(135deg,#6366f1,#4834d4); color:#fff; border:1px solid rgba(255,255,255,.25); padding:.55rem .95rem; font-size:.6rem; font-weight:600; border-radius:12px; cursor:pointer; display:inline-flex; align-items:center; gap:.4rem; letter-spacing:.55px; box-shadow:0 8px 22px -10px rgba(72,52,212,.55), 0 0 0 1px rgba(255,255,255,.12) inset; backdrop-filter:blur(6px) saturate(160%); transition:filter .35s, transform .28s, box-shadow .4s; &:hover{filter:brightness(1.08); box-shadow:0 10px 28px -10px rgba(72,52,212,.65);} &:active{transform:translateY(1px);} &:disabled{opacity:.55; cursor:default; box-shadow:none;}`;
const ToastStack = styled.div`position:fixed; bottom:1rem; right:1rem; display:flex; flex-direction:column; gap:.55rem; z-index:6000;`;
const Toast = styled.div`background:#fff; border:1px solid #6366f1; padding:.65rem .85rem; font-size:.55rem; font-weight:600; color:#312e81; border-radius:12px; box-shadow:0 6px 22px -8px rgba(79,70,229,.45); animation:fadeIn .35s; @keyframes fadeIn{0%{opacity:0; transform:translateY(4px);}100%{opacity:1; transform:translateY(0);}}`;
const RoleBadge = styled.span`
  background:#6366f1;
  color:#fff;
  font-size:.6rem;
  padding:.3rem .55rem;
  border-radius:999px;
  letter-spacing:.6px;
  font-weight:600;
  text-transform:uppercase;
`;
const SmallNote = styled.p`
  margin:0;
  font-size:.65rem;
  color:#475569;
  letter-spacing:.3px;
`;

/* Layout sections */
const Grid = styled.div`
  display:grid;
  gap:1.25rem;
  grid-template-columns:repeat(auto-fit,minmax(340px,1fr));
  margin-bottom:1.5rem;
`;
const Panel = styled.div`
  position:relative;
  background:rgba(255,255,255,.72);
  border:1px solid rgba(255,255,255,.55);
  border-radius:22px;
  padding:1.25rem 1.35rem 1.45rem;
  display:flex;
  flex-direction:column;
  gap:.9rem;
  margin-bottom:1.5rem;
  box-shadow:0 10px 32px -14px rgba(31,41,55,.35), 0 2px 6px -2px rgba(31,41,55,.15);
  backdrop-filter:blur(14px) saturate(180%);
  -webkit-backdrop-filter:blur(14px) saturate(180%);
  overflow:hidden;
  &:before{content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(145deg,rgba(99,102,241,.18),rgba(255,255,255,0) 55%); opacity:.9;}
`;
const PanelTitle = styled.h3`
  margin:0;
  font-size:.95rem;
  font-weight:700;
  display:flex;
  align-items:center;
  gap:.5rem;
  letter-spacing:.4px;
  color:#1e293b;
`;
const Divider = styled.hr`
  border:none;
  height:1px;
  background:#e2e8f0;
  margin:.2rem 0 .4rem;
`;

const SubNote = styled.small`
  font-size:.6rem;
  color:#64748b;
  letter-spacing:.5px;
`;

/* Table */
const TableWrap = styled.div`

  overflow:auto;
  border:1px solid rgba(255,255,255,.6);
  border-radius:18px;
  background:rgba(255,255,255,.85);
  backdrop-filter:blur(10px) saturate(160%);
  -webkit-backdrop-filter:blur(10px) saturate(160%);
`;
const Table = styled.table`
  width:100%;
  border-collapse:collapse;
  font-size:.7rem;
  th { text-align:left; background:linear-gradient(135deg,#f1f5f9,#e2e8f0); font-weight:600; font-size:.6rem; letter-spacing:.55px; padding:.55rem .65rem; position:sticky; top:0; z-index:2; }
  td { padding:.5rem .65rem; border-top:1px solid #e2e8f0; vertical-align:top; background:rgba(255,255,255,.55); }
`;
const ActionsCell = styled.div`
  display:flex;
  flex-wrap:wrap;
  gap:.35rem;
`;
const ActionBtn = styled.button`
  background:#f1f5f9;
  border:1px solid #e2e8f0;
  padding:.3rem .55rem;
  font-size:.55rem;
  border-radius:6px;
  cursor:pointer;
  font-weight:600;
  color:#334155;
  &:hover{ background:#e2e8f0; }
  &:disabled{ opacity:.55; cursor:default; }
`;
const StatusBadge = styled.span`
  display:inline-block;
  padding:.18rem .5rem;
  border-radius:999px;
  font-size:.55rem;
  font-weight:600;
  letter-spacing:.5px;
  background:${p=>p.bg};
  color:${p=>p.color};
`;

/* Modal styling */
const ModalOverlay = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; z-index:5000;
`;
const ModalCard = styled.div`
  background:#fff; border-radius:18px; padding:1.1rem 1.25rem 1.25rem; width:min(420px,90%); box-shadow:0 12px 28px -8px rgba(0,0,0,.25); display:flex; flex-direction:column; gap:.9rem;
`;
const ModalActions = styled.div`
  display:flex; justify-content:flex-end; gap:.6rem; flex-wrap:wrap;
`;
const ModalTitle = styled.h3`
  margin:0; font-size:.95rem; font-weight:700; letter-spacing:.4px; color:#1e293b;
`;
const ModalField = styled.div`display:flex; flex-direction:column; gap:.35rem;`;
const ModalLabel = styled.label`font-size:.55rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:#334155;`;
const ModalInput = styled.input`border:1px solid #cbd5e1; border-radius:8px; padding:.55rem .65rem; font-size:.7rem; width:100%;`;
const ErrorText = styled.div`font-size:.6rem; color:#b91c1c; font-weight:600;`;
const Helper = styled.p`margin:.1rem 0 0; font-size:.55rem; color:#64748b; line-height:1.25;`;

const ClaimModal = ({ item, quantity, setQuantity, onClose, onSubmit, error, owner }) => {
  // Hooks must run unconditionally; guard render later
  const isEquipment = item.category === 'equipment';
  const maxQty = item.quantity || 0;
  const [inputValue, setInputValue] = React.useState(quantity);
  const [localErr, setLocalErr] = React.useState('');

  if(!item) return null;

  const handleChange = (e) => {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseInt(raw,10);
    if (isNaN(parsed) || parsed < 1) {
      setLocalErr('Quantity must be at least 1');
      return;
    }
    if (parsed > maxQty) {
      setLocalErr(`Cannot exceed available units (${maxQty})`);
      return;
    }
    setLocalErr('');
    setQuantity(parsed);
  };

  const disableSubmit = !!localErr || quantity < 1 || quantity > maxQty;

  const remainingNote = isEquipment ? `Claiming multiple units creates an In Use row once approved.` : `Supplies quantities reduce available stock when approved.`;
  return (
    <ModalOverlay>
      <ModalCard role="dialog" aria-modal="true" aria-labelledby="claim-modal-title">
        <ModalTitle id="claim-modal-title">Claim Item</ModalTitle>
        <div style={{ fontSize:'.7rem', lineHeight:1.3 }}>
          <strong>{item.name}</strong><br />
          <span style={{ textTransform:'capitalize', color:'#475569' }}>{item.category}</span> — Status: {item.status.replace(/_/g,' ')}<br />
          <span>Available: {maxQty} unit{maxQty===1?'':'s'}{owner && owner.username ? ` · Manager: ${owner.username}`:''}</span>
        </div>
        <ModalField>
          <ModalLabel htmlFor="claim-qty">Quantity</ModalLabel>
          <ModalInput
            id="claim-qty"
            type="number"
            min={1}
            max={maxQty}
            value={inputValue}
            onChange={handleChange}
          />
          <Helper>
            Enter 1–{maxQty}. {remainingNote}
          </Helper>
        </ModalField>
  {isEquipment && <Helper style={{ color:'#475569' }}>Equipment requests are grouped; approval creates a separate In Use record.</Helper>}
        {(localErr || error) && <ErrorText>{localErr || error}</ErrorText>}
        <ModalActions>
          <ActionBtn type='button' onClick={onClose} style={{ background:'#fee2e2', color:'#b91c1c' }}>Cancel</ActionBtn>
          <ActionBtn type='button' disabled={disableSubmit} onClick={!disableSubmit ? onSubmit : undefined} style={disableSubmit?{opacity:.5, cursor:'not-allowed'}:null}>Submit Claim</ActionBtn>
        </ModalActions>
      </ModalCard>
    </ModalOverlay>
  );
};

// New Item Request Modal
const RequestModalCard = styled(ModalCard)`width:min(520px,92%);`;
const RequestTextArea = styled.textarea`border:1px solid #cbd5e1; border-radius:8px; padding:.55rem .65rem; font-size:.7rem; font-family:inherit; resize:vertical; min-height:90px;`;
const SelectInput = styled.select`border:1px solid #cbd5e1; border-radius:8px; padding:.55rem .65rem; font-size:.7rem; background:#fff;`;
const NewRequestModal = ({ open, onClose, onSubmit, form, setForm, submitting }) => {
  if(!open) return null;
  const qtyNum = parseInt(form.quantity,10);
  const errors = {
    itemName: !form.itemName.trim() ? 'Required': '',
       quantity: !form.quantity.trim() ? 'Required' : (isNaN(qtyNum) || qtyNum < 1 ? 'Must be ≥ 1' : ''),
    reason: !form.reason.trim() ? 'Required' : ''
  };
  const valid = !errors.itemName && !errors.quantity && !errors.reason;
  const onKey = (e)=>{ if(e.key==='Escape') onClose(); if(e.key==='Enter' && (e.metaKey||e.ctrlKey) && valid){ onSubmit(); } };
  return (
    <ModalOverlay onClick={e=>{ if(e.target===e.currentTarget) onClose(); }} onKeyDown={onKey} tabIndex={-1}>
      <RequestModalCard role="dialog" aria-modal="true" aria-labelledby="new-request-title">
        <ModalTitle id="new-request-title">New Item Request</ModalTitle>
        <ModalField>
          <ModalLabel>Item Name</ModalLabel>
          <ModalInput value={form.itemName} onChange={e=>setForm(f=>({...f,itemName:e.target.value}))} placeholder="e.g. Microscope" aria-invalid={!!errors.itemName} />
          {errors.itemName && <ErrorText>{errors.itemName}</ErrorText>}
        </ModalField>
        <ModalField>
          <ModalLabel>Category</ModalLabel>
          <SelectInput value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
            <option value="supplies">Supplies</option>
            <option value="equipment">Equipment</option>
          </SelectInput>
        </ModalField>
        <ModalField>
          <ModalLabel>Quantity</ModalLabel>
          <ModalInput type="number" min={1} value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} aria-invalid={!!errors.quantity} />
          {errors.quantity && <ErrorText>{errors.quantity}</ErrorText>}
        </ModalField>
        <ModalField>
          <ModalLabel>Description</ModalLabel>
          <RequestTextArea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Optional description (purpose, specs, etc.)" />
        </ModalField>
        <ModalField>
          <ModalLabel>Reason</ModalLabel>
          <RequestTextArea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} placeholder="Why is this needed?" aria-invalid={!!errors.reason} />
          {errors.reason && <ErrorText>{errors.reason}</ErrorText>}
        </ModalField>
        <Helper style={{marginTop:'-.4rem'}}>Requests are reviewed by your department/course manager before appearing on the voting board. Press Ctrl/Cmd + Enter to submit.</Helper>
        <ModalActions>
          <ActionBtn type='button' onClick={onClose} style={{ background:'#f1f5f9' }}>Cancel</ActionBtn>
          <PrimaryBtn type='button' disabled={!valid || submitting} onClick={()=> valid && onSubmit()}>{submitting? 'Submitting...' : 'Submit Request'}</PrimaryBtn>
        </ModalActions>
      </RequestModalCard>
    </ModalOverlay>
  );
};

/* Filters */
const Filters = styled.div`
  display:flex;
  gap:.75rem;
  flex-wrap:wrap;
  margin:.2rem 0 1rem;
  align-items:flex-end;
`;
const FilterGroup = styled.div`
  display:flex;
  flex-direction:column;
  gap:4px;
`;
const Label = styled.label`
  font-size:.5rem;
  font-weight:600;
  letter-spacing:.5px;
  text-transform:uppercase;
  color:#334155;
`;
const Select = styled.select`
  border:1px solid #cbd5e1;
  border-radius:6px;
  padding:.45rem .55rem;
  font-size:.6rem;
  background:#fff;
`;
const ClearBtn = styled.button`
  background:#f1f5f9;
  border:none;
  padding:.5rem .75rem;
  font-size:.55rem;
  border-radius:6px;
  cursor:pointer;
  font-weight:600;
  color:#475569;
`;

/* Empty / Loading */
const Empty = styled.div`
  padding:1rem .75rem;
  font-size:.6rem;
  color:#475569;
`;
const Loading = styled.div`
  padding:1rem .75rem;
  font-size:.65rem;
  color:#334155;
`;

/* Component */
const UserDashboard = () => {
  const { user } = useAuth();
  const roleDisplay = user?.role ? user.role.charAt(0).toUpperCase()+user.role.slice(1) : 'User';
  const firstName = (user?.name||'').split(' ')[0] || roleDisplay;

  const [items,setItems] = useState([]);
  // Control how many inventory items are visible in the main list (default 10)
  const [showAllItems, setShowAllItems] = useState(false);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [filters,setFilters] = useState({ category:'', status:'' });
  const [claiming,setClaiming] = useState(null); // item currently claiming (full item object)
  const [claimOwner,setClaimOwner] = useState(null); // owner info for modal
  const [claimQty,setClaimQty] = useState(1);
  const [claimError,setClaimError] = useState('');
  const [claims,setClaims] = useState([]); // for managers to approve
  const [loadingClaims,setLoadingClaims] = useState(false);
  const [myClaimed,setMyClaimed] = useState([]);
  const [loadingMyClaimed,setLoadingMyClaimed] = useState(false);
  const [returning,setReturning] = useState({});
  const [myClaims,setMyClaims] = useState([]);
  // New Request modal state
  const [showRequest,setShowRequest] = useState(false);
  const [requestForm,setRequestForm] = useState({ itemName:'', category:'supplies', quantity:'1', description:'', reason:'' });
  const [requestSubmitting,setRequestSubmitting] = useState(false);
  const [recentRequests,setRecentRequests] = useState([]);
  const [toasts,setToasts] = useState([]);
  const pushToast = (msg) => { const id=Date.now()+Math.random(); setToasts(t=>[...t,{id,msg}]); setTimeout(()=> setToasts(t=>t.filter(x=>x.id!==id)), 3200); };

  useEffect(()=>{
    let active = true;
    (async ()=>{
      setLoading(true); setError('');
      try {
        const data = await inventoryApi.list({ category: filters.category || undefined, status: filters.status || undefined });
        if(active) setItems(data.items || []);
      } catch(e){ if(active) setError(e.message); }
      finally { if(active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [filters.category, filters.status]);

  // Load pending claims if manager/admin
  useEffect(()=>{
    if(!['manager','admin'].includes(user?.role)) return;
    let active = true;
    (async()=>{
      setLoadingClaims(true);
      try {
        // aggregate claims for visible items (could add a dedicated endpoint later)
        const all = [];
        for (const it of items) {
          try { const d = await inventoryApi.listClaims(it.id); all.push(...(d.claims||[])); } catch { /* ignore per-item claim load failure */ }
        }
        if(active) setClaims(all.filter(c=>c.status==='pending'));
      } finally { if(active) setLoadingClaims(false); }
    })();
    return ()=>{ active=false; };
  }, [items, user?.role]);

  // Load user's claimed equipment
  useEffect(()=>{
    if(!user?.id) return;
    let active = true; setLoadingMyClaimed(true);
    (async()=>{
      try {
        const d = await inventoryApi.listMyClaimedEquipment();
        if(active) setMyClaimed(d.items||[]);
      } finally { if(active) setLoadingMyClaimed(false); }
    })();
    return ()=>{ active=false; };
  }, [user?.id]);

  // Load user's claim requests (all statuses) for unified panel
  useEffect(()=>{
    if(!user?.id) return;
    let active = true;
    (async()=>{
      try {
        const d = await inventoryApi.listMyClaims();
        if(active) setMyClaims(d.claims||[]);
      } catch { /* ignore */ }
    })();
    return ()=>{ active=false; };
  }, [user?.id]);

  const requestReturn = async (it) => {
    setReturning(r=>({...r,[it.id]:true}));
    try {
      await inventoryApi.requestReturn(it.id);
      // refresh lists
      const [mine, refreshed] = await Promise.all([
        inventoryApi.listMyClaimedEquipment(),
        inventoryApi.list({ category: filters.category || undefined, status: filters.status || undefined })
      ]);
      setMyClaimed(mine.items||[]);
      setItems(refreshed.items||[]);
    } catch(e){ alert(e.message); }
    finally { setReturning(r=>{ const n={...r}; delete n[it.id]; return n; }); }
  };

  const submitNewRequest = async () => {
    if (requestSubmitting) return; // guard
    const { itemName, quantity, reason } = requestForm;
    if(!itemName.trim() || !quantity.trim() || !reason.trim()) return;
    setRequestSubmitting(true);
    try {
      await inventoryApi.createRequest({
        itemName: requestForm.itemName,
        category: requestForm.category,
        quantity: parseInt(requestForm.quantity,10)||1,
        description: requestForm.description,
        reason: requestForm.reason
      });
      setShowRequest(false);
      pushToast('Request submitted for review');
      setRequestForm({ itemName:'', category:'supplies', quantity:'1', description:'', reason:'' });
      // Refresh recent requests list
      try {
        const res = await inventoryApi.listRequests();
        const all = res.requests || [];
        const mine = all.filter(r => r.requested_by === user?.id);
        mine.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
        setRecentRequests(mine.slice(0,5));
      } catch {/* ignore */}
    } catch(e){ alert(e.message); }
    finally { setRequestSubmitting(false); }
  };

  // Load & auto-refresh recent item requests for user roles that can submit
  useEffect(()=>{
    if(!user?.id || !['student','teacher','staff'].includes(user.role)) return;
    let active = true;
    const load = async () => {
      try {
        const res = await inventoryApi.listRequests();
        if(!active) return;
        const all = res.requests || [];
        const mine = all.filter(r => r.requested_by === user.id);
        mine.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
        setRecentRequests(mine.slice(0,5));
      } catch {/* ignore */}
    };
    load();
    const int = setInterval(load, 15000); // 15s auto-refresh
    return () => { active=false; clearInterval(int); };
  }, [user?.id, user?.role]);

  const formatStatus = (s) => {
    const map = { in_stock:'In Stock', out_of_stock:'Out of Stock', available:'Available', in_use:'In Use', for_repair:'For Repair', disposed:'Disposed' };
    return map[s] || s;
  };
  const badgeMeta = (s) => {
    const map = {
      in_stock:{ bg:'#dcfce7', color:'#166534' },
      out_of_stock:{ bg:'#fee2e2', color:'#b91c1c' },
      available:{ bg:'#e0f2fe', color:'#075985' },
      in_use:{ bg:'#ede9fe', color:'#5b21b6' },
      for_repair:{ bg:'#fef9c3', color:'#92400e' },
      disposed:{ bg:'#f1f5f9', color:'#475569' }
    };
    return map[s] || { bg:'#e2e8f0', color:'#334155' };
  };

  const submitClaim = async () => {
    if(!claiming) return;
    setClaimError('');
    try {
      let qty = claimQty;
      if (claiming.category === 'equipment') {
        const availableUnits = (claiming.quantity || 0);
        if (qty > availableUnits) {
          setClaimError(`Cannot exceed available units (${availableUnits})`);
          return;
        }
      }
      await inventoryApi.createClaim(claiming.id, { quantity: qty });
      // Auto-refresh items list (even though server state won't change until approval, keeps UI consistent & future-proof)
      try {
        const refreshed = await inventoryApi.list({ category: filters.category || undefined, status: filters.status || undefined });
        setItems(refreshed.items || []);
        // refresh my claims so pending shows instantly
        const claimsData = await inventoryApi.listMyClaims();
        setMyClaims(claimsData.claims || []);
  } catch { /* ignore refresh failure */ }
      setClaiming(null); setClaimQty(1);
    } catch(e){
      const msg = e.message || '';
      if (msg.includes('Forbidden')) setClaimError('You are not allowed to claim this item (different department/course).');
      else if (msg.includes('Not found')) setClaimError('Item not found or no longer visible.');
      else setClaimError(msg);
    }
  };

  const decide = async (claim, approve) => {
    try {
      await inventoryApi.decideClaim(claim.id, approve);
      // refresh items list to reflect changed statuses/quantities
      const data = await inventoryApi.list({ category: filters.category || undefined, status: filters.status || undefined });
      setItems(data.items||[]);
      setClaims(claims.filter(c=>c.id!==claim.id));
    } catch(e){ alert(e.message); }
  };

  return (
    <Wrapper>
      <Header>
        <Heading>
          Inventory Overview <RoleBadge>{roleDisplay}</RoleBadge>
          {['student','teacher','staff'].includes(user?.role) && (
            <HeaderActions>
              <PrimaryBtn type='button' onClick={()=>setShowRequest(true)}>➕ New Request</PrimaryBtn>
            </HeaderActions>
          )}
        </Heading>
        <SmallNote>Welcome, {firstName}. Below is the current inventory list and live status analytics.</SmallNote>
      </Header>

      <Grid>
        <Panel>
          <PanelTitle>� Inventory Status Analytics</PanelTitle>
          <Divider />
          <StatusAnalytics items={items} />
        </Panel>
        {['student','teacher','staff'].includes(user?.role) && !!recentRequests.length && (
          <Panel>
            <PanelTitle>🕒 My Recent Requests</PanelTitle>
            <Divider />
            <Table style={{ fontSize:'.62rem' }}>
              <thead>
                <tr>
                  <th style={{width:'45%'}}>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map(r => (
                  <tr key={r.id}>
                    <td>{r.item_name}</td>
                    <td>{r.quantity}</td>
                    <td><StatusBadge bg={r.status==='approved'? '#dcfce7': r.status==='rejected'? '#fee2e2':'#fef9c3'} color={r.status==='approved'? '#166534': r.status==='rejected'? '#b91c1c':'#92400e'}>{r.status}</StatusBadge></td>
                    <td>{typeof r.votes==='number'? r.votes : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <SubNote>Shows your 5 most recent submissions. Auto-refreshes every 15s.</SubNote>
          </Panel>
        )}
      </Grid>

      {/* Filters moved outside grid and placed above Inventory Items */}
      <Panel>
        <PanelTitle>🔍 Filters</PanelTitle>
        <Divider />
        <Filters>
          <FilterGroup>
            <Label>Category</Label>
            <Select value={filters.category} onChange={e=>setFilters(f=>({...f,category:e.target.value}))}>
              <option value=''>All</option>
              <option value='supplies'>Supplies</option>
              <option value='equipment'>Equipment</option>
            </Select>
          </FilterGroup>
          <FilterGroup>
            <Label>Status</Label>
            <Select value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
              <option value=''>All</option>
              {(!filters.category || filters.category==='supplies') && <>
                <option value='in_stock'>In Stock</option>
                <option value='out_of_stock'>Out of Stock</option>
              </>}
              {(!filters.category || filters.category==='equipment') && <>
                <option value='available'>Available</option>
                <option value='in_use'>In Use</option>
                <option value='for_repair'>For Repair</option>
                <option value='disposed'>Disposed</option>
              </>}
            </Select>
          </FilterGroup>
          {(filters.category || filters.status) && (
            <ClearBtn type='button' onClick={()=>setFilters({category:'',status:''})}>Clear</ClearBtn>
          )}
        </Filters>
        <SubNote>Filters apply instantly to the list & analytics.</SubNote>
      </Panel>

      <Panel>
        <PanelTitle>📃 Inventory Items</PanelTitle>
        <Divider />
        <div style={{padding:'0.75rem 0.5rem 0.2rem'}}>
        <TableWrap>
          {error && <Empty style={{ color:'#b91c1c', background:'#fee2e2', borderRadius:'8px', fontWeight:600 }}>{error}</Empty>}
          {loading && !error && <Loading>Loading items...</Loading>}
          {!loading && !error && !items.length && <Empty>No items found.</Empty>}
          {!loading && !error && !!items.length && (
            <>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Qty</th>
                  <th>Updated</th>
                  {['admin','manager'].includes(user?.role) && <th>Owned By</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(showAllItems ? items : items.slice(0,10)).map(it => {
                  const meta = badgeMeta(it.status);
                  return (
                    <tr key={it.id}>
                      <td>{it.name}</td>
                      <td style={{ textTransform:'capitalize' }}>{it.category||'-'}</td>
                      <td><StatusBadge bg={meta.bg} color={meta.color}>{formatStatus(it.status)}</StatusBadge></td>
                      <td>{it.quantity}</td>
                      <td>{it.updatedAt ? new Date(it.updatedAt).toLocaleString() : '-'}</td>
                      {['admin','manager'].includes(user?.role) && <td>{it.createdBy || '-'}</td>}
                      <td>
                        <ActionsCell>
                          {['student','teacher','staff'].includes(user?.role) && (
                            <ActionBtn
                              disabled={(it.category==='equipment' && it.status!=='available') || (it.category==='supplies' && it.status==='out_of_stock')}
                              onClick={()=>{ setClaiming(it); setClaimOwner({ username: it.createdBy }); setClaimQty(1); setClaimError(''); }}
                            >Claim</ActionBtn>
                          )}
                        </ActionsCell>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {items.length > 10 && (
              <div style={{ padding:'.55rem .65rem', display:'flex', justifyContent:'center' }}>
                <ActionBtn type='button' onClick={()=> setShowAllItems(s=>!s)} style={{ fontWeight:700 }}>
                  {showAllItems ? 'Show First 10' : `See All Items (${items.length})`}
                </ActionBtn>
              </div>
            )}
            </>
          )}
        </TableWrap>
        </div>
        {/* Modal mounts outside table */}
      </Panel>

      {/* User's claimed equipment */}
      {['student','teacher','staff'].includes(user?.role) && (
        <Panel>
          <PanelTitle>🧾 My Claimed Equipment & Supplies</PanelTitle>
          <Divider />
          <div style={{padding:'0.75rem 0.6rem 0.4rem'}}>
          {loadingMyClaimed && <Loading>Loading claimed items...</Loading>}
          {(() => {
            // Build unified rows: pending/approved/rejected claims + live in-use equipment
            const pendingClaims = myClaims.filter(c => c.status==='pending');
            const rejectedClaims = myClaims.filter(c => c.status==='rejected');
            // Approved supplies claims
            const approvedSupplyClaims = myClaims.filter(c => c.status==='approved' && c.item_category==='supplies');
            // Approved equipment represented by in-use equipment rows (avoid double counting approved equipment claims)
            const inUseEquipment = myClaimed.filter(ci => ci.status==='in_use');
            const totalEquipUnits = inUseEquipment.reduce((a,b)=>a+(b.quantity||0),0);
            const totalSupplyUnits = approvedSupplyClaims.reduce((a,b)=>a+(b.quantity||0),0);
            const hasAny = pendingClaims.length || rejectedClaims.length || approvedSupplyClaims.length || inUseEquipment.length;
            if (!loadingMyClaimed && !hasAny) return <Empty>No claims yet. Submit a claim to see it here.</Empty>;
            if (!hasAny) return null;

            const rows = [];
            // pending claims first
            pendingClaims.forEach(c => rows.push({ key:`claim-p-${c.id}`, name:c.item_name, qty:c.quantity, cat:c.item_category, status:'pending' }));
            // approved equipment (live rows)
            inUseEquipment.forEach(e => rows.push({ key:`equip-a-${e.id}`, name:e.name, qty:e.quantity, cat:'equipment', status:'approved', returnStatus:e.return_status, equipment:e }));
            // approved supplies
            approvedSupplyClaims.forEach(c => rows.push({ key:`supp-a-${c.id}`, name:c.item_name, qty:c.quantity, cat:'supplies', status:'approved' }));
            // rejected claims
            rejectedClaims.forEach(c => rows.push({ key:`claim-r-${c.id}`, name:c.item_name, qty:c.quantity, cat:c.item_category, status:'rejected' }));

            // Sort: pending -> approved -> rejected, then equipment before supplies, then name
            const orderStatus = { pending:0, approved:1, rejected:2 };
            const orderCat = { equipment:0, supplies:1 };
            rows.sort((a,b)=>{
              const s = orderStatus[a.status]-orderStatus[b.status]; if (s) return s;
              const c = (orderCat[a.cat]??9) - (orderCat[b.cat]??9); if (c) return c;
              return (a.name||'').localeCompare(b.name||'');
            });

            const badgeForClaimStatus = (st) => {
              if (st==='pending') return { bg:'#fef9c3', color:'#92400e', label:'Pending' };
              if (st==='approved') return { bg:'#dcfce7', color:'#166534', label:'Approved' };
              if (st==='rejected') return { bg:'#fee2e2', color:'#b91c1c', label:'Rejected' };
              return { bg:'#e2e8f0', color:'#334155', label:st };
            };

            return (
              <>
                <div style={{display:'flex', flexWrap:'wrap', gap:'1rem', margin:'0 0 .6rem', fontSize:'.6rem'}}>
                  <div style={{background:'#f1f5f9', padding:'.45rem .65rem', borderRadius:8}}><strong style={{fontSize:'.7rem'}}>Equipment Units (Approved)</strong>: {totalEquipUnits}</div>
                  <div style={{background:'#f1f5f9', padding:'.45rem .65rem', borderRadius:8}}><strong style={{fontSize:'.7rem'}}>Supplies Qty (Approved)</strong>: {totalSupplyUnits}</div>
                  <div style={{background:'#f1f5f9', padding:'.45rem .65rem', borderRadius:8}}><strong style={{fontSize:'.7rem'}}>Pending</strong>: {pendingClaims.length}</div>
                  <div style={{background:'#f1f5f9', padding:'.45rem .65rem', borderRadius:8}}><strong style={{fontSize:'.7rem'}}>Rejected</strong>: {rejectedClaims.length}</div>
                </div>
                <Table style={{ fontSize:'.65rem' }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => {
                      const badge = badgeForClaimStatus(r.status);
                      const returnCell = (()=> {
                        if (r.cat==='equipment' && r.status==='approved') {
                          if (r.returnStatus==='pending') return <span style={{ fontSize:'.5rem', fontWeight:600, color:'#92400e' }}>Return Pending</span>;
                          return <ActionsCell><ActionBtn disabled={!!returning[r.equipment?.id]} onClick={()=>r.equipment && requestReturn(r.equipment)}>Request Return</ActionBtn></ActionsCell>;
                        }
                        return <span style={{ fontSize:'.5rem', color:'#64748b' }}>N/A</span>;
                      })();
                      return (
                        <tr key={r.key}>
                          <td>{r.name || '—'}</td>
                          <td style={{ textTransform:'capitalize' }}>{r.cat}</td>
                          <td>{r.qty}</td>
                          <td><StatusBadge bg={badge.bg} color={badge.color}>{badge.label}</StatusBadge></td>
                          <td>{returnCell}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </>
            );
          })()}
          </div>
          <SubNote style={{marginTop:'.4rem'}}>All your claims (pending / approved / rejected) plus approved in-use equipment shown here. Return only applies to approved equipment.</SubNote>
        </Panel>
      )}

      {/* Removed separate My Claim Requests panel; unified above */}

      {claiming && (
        <ClaimModal
          item={claiming}
          quantity={claimQty}
          setQuantity={setClaimQty}
          onClose={()=>{ setClaiming(null); setClaimQty(1); setClaimError(''); }}
          onSubmit={submitClaim}
          error={claimError}
          owner={claimOwner}
        />
      )}

      {['manager','admin'].includes(user?.role) && (
        <Panel>
          <PanelTitle>📝 Pending Claims {loadingClaims && <span style={{ fontSize:'.55rem', fontWeight:400, color:'#64748b' }}>loading...</span>}</PanelTitle>
          <Divider />
          {!loadingClaims && !claims.length && <Empty>No pending claims.</Empty>}
          {!!claims.length && (
            <Table style={{ fontSize:'.65rem' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Requested By</th>
                  <th>Created</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.item_name}</td>
                    <td>{c.quantity}</td>
                    <td>{c.requested_by_username || c.requested_by || '-'}</td>
                    <td>{new Date(c.created_at).toLocaleString()}</td>
                    <td>
                      <ActionsCell>
                        <ActionBtn onClick={()=>decide(c, true)}>Approve</ActionBtn>
                        <ActionBtn onClick={()=>decide(c, false)} style={{ background:'#fee2e2', color:'#b91c1c' }}>Reject</ActionBtn>
                      </ActionsCell>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>
      )}
      <NewRequestModal
        open={showRequest}
        onClose={()=>{ if(!requestSubmitting){ setShowRequest(false); } }}
        onSubmit={submitNewRequest}
        form={requestForm}
        setForm={setRequestForm}
        submitting={requestSubmitting}
      />
      {!!toasts.length && (
        <ToastStack>
          {toasts.map(t => <Toast key={t.id}>{t.msg}</Toast>)}
        </ToastStack>
      )}
    </Wrapper>
  );
};

export default UserDashboard;
