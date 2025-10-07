import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { PageSurface, GradientHeading, GlassPanel, PrimaryButton, SubNote, Divider } from '@/components/ui/Glass';
import NewRequestModal from '@/components/requests/NewRequestModal';
import { inventoryApi } from '@/services/inventoryApi';
import { useAuth } from '@/context/useAuth';

const Page = styled(PageSurface)`padding:2rem 2.3rem 3rem; display:flex; flex-direction:column; gap:1.5rem;`;
const Header = styled.div`display:flex; flex-direction:column; gap:.75rem; @media(min-width:680px){flex-direction:row; align-items:center; justify-content:space-between;}`;
const Title = styled(GradientHeading)`margin:0; font-size:1.7rem;`;
const ActionsBar = styled.div`display:flex; gap:.75rem; flex-wrap:wrap;`;

const ListGrid = styled.div`display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));`;
const ItemCard = styled(GlassPanel)`padding:1rem 1.05rem 1.15rem; display:flex; flex-direction:column; gap:.55rem; border-radius:20px;`;
const ItemTitle = styled.h3`margin:0; font-size:.9rem; line-height:1.15rem; font-weight:600;`;
const Badge = styled.span`background:rgba(255,255,255,.55); border:1px solid rgba(255,255,255,.35); backdrop-filter:blur(4px); padding:.28rem .55rem; font-size:.5rem; font-weight:600; letter-spacing:.5px; border-radius:999px; text-transform:uppercase; box-shadow:0 2px 6px -2px rgba(0,0,0,.15);`;
const MetaRow = styled.div`display:flex; flex-wrap:wrap; gap:.45rem; font-size:.55rem; color:#475569; align-items:center;`;
const Placeholder = styled.div`font-size:.6rem; background:rgba(255,255,255,.6); border:1px dashed rgba(255,255,255,.4); padding:1.1rem 1.2rem; border-radius:22px; text-align:center; color:#475569;`;

export default function NewRequestPage(){
  const { user } = useAuth();
  const [show,setShow] = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [form,setForm] = useState({ itemName:'', category:'supplies', quantity:'1', description:'', reason:'' });
  const [requests,setRequests] = useState([]); // full history for this user
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [showAll,setShowAll] = useState(false);

  const loadRequests = useCallback(async () => {
    if(!user?.id) return;
    setLoading(true); setError('');
    try {
      const res = await inventoryApi.listRequests();
      const all = (res.requests||[]).filter(r=> r.requested_by === user.id);
      all.sort((a,b)=> new Date(b.created_at||0) - new Date(a.created_at||0));
      setRequests(all);
    } catch(e){ setError(e.message||'Failed to load requests'); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(()=>{ loadRequests(); const t = setInterval(loadRequests, 30000); return ()=> clearInterval(t); }, [loadRequests]);

  const submit = async () => {
    if(submitting) return;
    const { itemName, quantity, reason } = form;
    if(!itemName.trim() || !quantity.trim() || !reason.trim()) return;
    setSubmitting(true);
    try {
      await inventoryApi.createRequest({
        itemName: form.itemName,
        category: form.category,
        quantity: parseInt(form.quantity,10)||1,
        description: form.description,
        reason: form.reason
      });
      // Optimistic add to history list (status pending until manager acts)
      setRequests(r=>[
        { id: 'local-'+Date.now(), created_at: new Date().toISOString(), requested_by: user?.id, item_name: form.itemName, itemName: form.itemName, category: form.category, quantity: parseInt(form.quantity,10)||1, description: form.description, reason: form.reason, status:'pending' },
        ...r
      ]);
      setShow(false);
      setForm({ itemName:'', category:form.category, quantity:'1', description:'', reason:'' });
    } catch(e){ alert(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <Page>
      <Header>
        <div>
          <Title as='h1'>New Request</Title>
          <SubNote style={{marginTop:'.4rem'}}>Submit a new inventory item request. Approved requests will appear on the voting board for your department & course.</SubNote>
        </div>
        <ActionsBar>
          <PrimaryButton type='button' onClick={()=>setShow(true)} style={{padding:'.6rem 1.05rem'}}>➕ Create Request</PrimaryButton>
        </ActionsBar>
      </Header>

      <GlassPanel style={{padding:'1.15rem 1.25rem 1.25rem', borderRadius:26}}>
        <h2 style={{margin:'0 0 .3rem', fontSize:'1.05rem'}}>My Requests History</h2>
        <Divider />
        {error && <Placeholder style={{ background:'rgba(254,226,226,.7)', color:'#b91c1c', borderColor:'rgba(254,202,202,.9)' }}>{error}</Placeholder>}
        {loading && !error && <Placeholder style={{ background:'rgba(255,255,255,.55)' }}>Loading requests...</Placeholder>}
        {!loading && !error && !requests.length && (
          <Placeholder>You have not submitted any requests yet. Create one to get started.</Placeholder>
        )}
        {!!requests.length && (
          <>
            <SubNote style={{margin:'0 0 .6rem', fontSize:'.55rem'}}>Showing {Math.min(showAll?requests.length:Math.min(12,requests.length), requests.length)} of {requests.length} request{requests.length===1?'':'s'}. Status reflects manager decisions (Approved / Rejected) or pending review.</SubNote>
            <ListGrid style={{marginTop:'.35rem'}}>
              {(showAll ? requests : requests.slice(0,12)).map(r=> {
                const status = r.status;
                const badgeStyle = (()=>{
                  if(status==='approved') return { background:'rgba(187,247,208,.55)', borderColor:'rgba(134,239,172,.8)', color:'#166534' };
                  if(status==='rejected') return { background:'rgba(254,202,202,.55)', borderColor:'rgba(252,165,165,.8)', color:'#b91c1c' };
                  if(status==='voting') return { background:'rgba(221,214,254,.55)', borderColor:'rgba(196,181,253,.8)', color:'#5b21b6' };
                  return { background:'rgba(250,204,21,.22)', borderColor:'rgba(250,204,21,.35)', color:'#92400e' }; // pending
                })();
                return (
                  <ItemCard key={r.id}>
                    <ItemTitle>{r.item_name || r.itemName}</ItemTitle>
                    <MetaRow>
                      <Badge>{r.category}</Badge>
                      <Badge>Qty {r.quantity}</Badge>
                      <Badge style={badgeStyle}>{status}</Badge>
                    </MetaRow>
                    <div style={{display:'flex', gap:'.4rem', flexWrap:'wrap', fontSize:'.48rem', color:'#64748b'}}>
                      <span>{new Date(r.created_at || Date.now()).toLocaleString()}</span>
                      {r.approved_by && <span>• by {r.approved_by_username || r.approved_by}</span>}
                    </div>
                    {r.description && <div style={{fontSize:'.55rem', lineHeight:1.3}}>{r.description}</div>}
                    {r.reason && <div style={{fontSize:'.5rem', background:'rgba(255,255,255,.55)', padding:'.45rem .55rem', borderRadius:12, border:'1px solid rgba(255,255,255,.4)'}}><strong style={{fontSize:'.5rem'}}>Reason: </strong>{r.reason}</div>}
                  </ItemCard>
                );
              })}
            </ListGrid>
            {requests.length > 12 && (
              <div style={{display:'flex', justifyContent:'center', marginTop:'1rem'}}>
                <PrimaryButton type='button' onClick={()=> setShowAll(s=>!s)} style={{padding:'.55rem 1rem', fontSize:'.6rem'}}>
                  {showAll ? 'Show First 12' : `Show All (${requests.length})`}
                </PrimaryButton>
              </div>
            )}
          </>
        )}
      </GlassPanel>

      <NewRequestModal
        open={show}
        onClose={()=>{ if(!submitting) setShow(false); }}
        onSubmit={submit}
        form={form}
        setForm={setForm}
        submitting={submitting}
      />
    </Page>
  );
}
