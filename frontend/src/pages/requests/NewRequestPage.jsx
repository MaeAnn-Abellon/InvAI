import React, { useState } from 'react';
import styled from '@emotion/styled';
import { PageSurface, GradientHeading, GlassPanel, PrimaryButton, SubNote, Divider } from '@/components/ui/Glass';
import NewRequestModal from '@/components/requests/NewRequestModal';
import { inventoryApi } from '@/services/inventoryApi';

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
  const [show,setShow] = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [form,setForm] = useState({ itemName:'', category:'supplies', quantity:'1', description:'', reason:'' });
  const [recent,setRecent] = useState([]);

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
      // Optimistic add to recent list (not yet approved)
      setRecent(r=>[{ id:Date.now(), ...form, quantity:parseInt(form.quantity,10)||1, status:'pending' }, ...r].slice(0,12));
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
        <h2 style={{margin:'0 0 .3rem', fontSize:'1.05rem'}}>Recently Submitted (Pending Review)</h2>
        <Divider />
        {!recent.length && (
          <Placeholder>Requests you create will show up here while pending approval. Once approved they move to the voting board.</Placeholder>
        )}
        {!!recent.length && (
          <ListGrid style={{marginTop:'.35rem'}}>
            {recent.map(r=> (
              <ItemCard key={r.id}>
                <ItemTitle>{r.itemName}</ItemTitle>
                <MetaRow>
                  <Badge>{r.category}</Badge>
                  <Badge>Qty {r.quantity}</Badge>
                  <Badge style={{background:'rgba(250,204,21,.22)', borderColor:'rgba(250,204,21,.35)', color:'#92400e'}}>{r.status}</Badge>
                </MetaRow>
                {r.description && <div style={{fontSize:'.55rem', lineHeight:1.3}}>{r.description}</div>}
                {r.reason && <div style={{fontSize:'.5rem', background:'rgba(255,255,255,.55)', padding:'.45rem .55rem', borderRadius:12, border:'1px solid rgba(255,255,255,.4)'}}><strong style={{fontSize:'.5rem'}}>Reason: </strong>{r.reason}</div>}
              </ItemCard>
            ))}
          </ListGrid>
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
