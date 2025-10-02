import React from 'react';
import styled from '@emotion/styled';

// Lightweight standalone modal replicating original UserDashboard new request modal
const ModalOverlay = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; z-index:5000;
`;
const ModalCard = styled.div`
  background:#fff; border-radius:20px; padding:1.15rem 1.3rem 1.35rem; width:min(520px,92%); box-shadow:0 12px 28px -8px rgba(0,0,0,.25); display:flex; flex-direction:column; gap:.9rem; position:relative;
`;
const ModalTitle = styled.h3`
  margin:0; font-size:.95rem; font-weight:700; letter-spacing:.4px; color:#1e293b;
`;
const ModalField = styled.div`display:flex; flex-direction:column; gap:.35rem;`;
const ModalLabel = styled.label`font-size:.55rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:#334155;`;
const Input = styled.input`border:1px solid #cbd5e1; border-radius:8px; padding:.55rem .65rem; font-size:.7rem; width:100%;`;
const TextArea = styled.textarea`border:1px solid #cbd5e1; border-radius:8px; padding:.55rem .65rem; font-size:.7rem; width:100%; font-family:inherit; resize:vertical; min-height:90px;`;
const Select = styled.select`border:1px solid #cbd5e1; border-radius:8px; padding:.55rem .65rem; font-size:.7rem; background:#fff;`;
const ErrorText = styled.div`font-size:.55rem; color:#b91c1c; font-weight:600;`;
const Helper = styled.p`margin:.1rem 0 0; font-size:.55rem; color:#64748b; line-height:1.25;`;
const Actions = styled.div`display:flex; justify-content:flex-end; gap:.6rem; flex-wrap:wrap;`;
const Button = styled.button`
  background:${p=>p.variant==='primary' ? 'linear-gradient(135deg,#6366f1,#4834d4)' : '#f1f5f9'};
  color:${p=>p.variant==='primary' ? '#fff' : '#334155'};
  border:1px solid ${p=>p.variant==='primary' ? 'rgba(255,255,255,.3)' : '#e2e8f0'};
  padding:.55rem .9rem; font-size:.6rem; font-weight:600; border-radius:10px; cursor:pointer; letter-spacing:.5px;
  box-shadow:${p=>p.variant==='primary' ? '0 6px 18px -6px rgba(72,52,212,.55)' : '0 2px 6px -2px rgba(15,23,42,.1)'};
  &:hover{filter:brightness(1.05);} &:disabled{opacity:.55; cursor:default; box-shadow:none;}
`;

export default function NewRequestModal({ open, onClose, onSubmit, form, setForm, submitting }) {
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
      <ModalCard role="dialog" aria-modal="true" aria-labelledby="new-request-title">
        <ModalTitle id="new-request-title">New Item Request</ModalTitle>
        <ModalField>
          <ModalLabel>Item Name</ModalLabel>
          <Input value={form.itemName} onChange={e=>setForm(f=>({...f,itemName:e.target.value}))} placeholder="e.g. Microscope" aria-invalid={!!errors.itemName} />
          {errors.itemName && <ErrorText>{errors.itemName}</ErrorText>}
        </ModalField>
        <ModalField>
          <ModalLabel>Category</ModalLabel>
          <Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
            <option value="supplies">Supplies</option>
            <option value="equipment">Equipment</option>
          </Select>
        </ModalField>
        <ModalField>
          <ModalLabel>Quantity</ModalLabel>
          <Input type="number" min={1} value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} aria-invalid={!!errors.quantity} />
          {errors.quantity && <ErrorText>{errors.quantity}</ErrorText>}
        </ModalField>
        <ModalField>
          <ModalLabel>Description</ModalLabel>
          <TextArea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Optional description (purpose, specs, etc.)" />
        </ModalField>
        <ModalField>
          <ModalLabel>Reason</ModalLabel>
          <TextArea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} placeholder="Why is this needed?" aria-invalid={!!errors.reason} />
          {errors.reason && <ErrorText>{errors.reason}</ErrorText>}
        </ModalField>
        <Helper style={{marginTop:'-.2rem'}}>Requests are reviewed before appearing on the voting board. Ctrl/Cmd + Enter to submit.</Helper>
        <Actions>
          <Button type='button' onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type='button' variant='primary' disabled={!valid || submitting} onClick={()=> valid && onSubmit()}>{submitting? 'Submitting...' : 'Submit Request'}</Button>
        </Actions>
      </ModalCard>
    </ModalOverlay>
  );
}