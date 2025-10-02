import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { PageSurface, GradientHeading, GlassPanel, PrimaryButton, SubNote, Divider as GDivider } from '@/components/ui/Glass';
import { useAuth } from '@/context/useAuth';

/* ====== Layout / Main Page ====== */
const Page = styled(PageSurface)`padding:2rem 2.25rem 3rem; width:100%;`;

const Header = styled.div`
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  flex-wrap:wrap;
  gap:1rem;
  margin-bottom:1.25rem;
  h1 { margin:0; font-size:1.8rem; }
`;

const HistoryBtn = styled.button`
  background:#4834d4;
  color:#fff;
  border:none;
  padding:.65rem 1.1rem;
  font-size:.75rem;
  font-weight:500;
  border-radius:10px;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  gap:.4rem;
  &:hover{ background:#372aaa; }
`;

const Notice = styled.div`
  background:#fff8e6;
  border:1px solid #fcd34d;
  padding:.9rem 1rem;
  border-radius:12px;
  font-size:.7rem;
  line-height:1.05rem;
  margin-bottom:1.3rem;
  strong { font-weight:600; }
`;

const FormCard = styled(GlassPanel).withComponent('form')`
  max-width:1000px; gap:1.05rem; padding:1.6rem 1.6rem 2rem; border-radius:26px;
`;

const Field = styled.div`
  display:flex;
  flex-direction:column;
  gap:.45rem;
  label {
    font-size:.62rem;
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:.55px;
    color:#475569;
  }
  input, textarea {
    background:#fff;
    border:1px solid #cbd5e1;
    border-radius:12px;
    padding:.75rem .85rem;
    font-size:.8rem;
    font-family:inherit;
    resize:vertical;
    &:focus{ outline:none; border-color:#4834d4; box-shadow:0 0 0 2px rgba(72,52,212,.25); }
  }
  textarea { min-height:110px; }
`;

const SubmitBtn = styled(PrimaryButton)`margin-top:.3rem; font-size:.68rem; padding:.7rem 1.25rem;`;

/* ====== History Modal ====== */
const Backdrop = styled.div`
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.45);
  backdrop-filter:blur(3px);
  display:flex;
  align-items:flex-start;
  justify-content:center;
  padding:4rem 1.25rem 2rem;
  z-index:500;
`;

const Modal = styled(GlassPanel)`
  width:100%; max-width:940px; border-radius:32px; padding:1.6rem 1.8rem 2rem; gap:1.4rem;
  animation:pop .35s cubic-bezier(.4,0,.2,1);
  @keyframes pop {0%{transform:translateY(12px) scale(.98); opacity:0;}100%{transform:translateY(0) scale(1); opacity:1;}}
`;

const ModalHeader = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  flex-wrap:wrap;
  h2 {
    margin:0;
    font-size:1.2rem;
  }
`;

const CloseBtn = styled.button`
  background:#f1f5f9;
  border:1px solid #e2e8f0;
  width:34px;
  height:34px;
  border-radius:10px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:600;
  font-size:.9rem;
  color:#475569;
  &:hover{ background:#e2e8f0; }
`;

const ChartSection = styled.div`
  display:flex;
  gap:2.2rem;
  flex-wrap:wrap;
`;

const DonutWrap = styled.div`
  position:relative;
  width:200px;
  height:200px;
  flex:0 0 auto;
`;

const Donut = styled.div`
  width:100%;
  height:100%;
  border-radius:50%;
  background:
    conic-gradient(
      #10b981 0deg ${p=>p.approvedDeg}deg,
      #f59e0b ${p=>p.approvedDeg}deg ${p=>p.approvedDeg + p.pendingDeg}deg,
      #ef4444 ${p=>p.approvedDeg + p.pendingDeg}deg 360deg
    );
  position:relative;
  box-shadow:0 0 0 1px #e2e8f0;
  &::after{
    content:'';
    position:absolute;
    inset:18%;
    background:#fff;
    border-radius:50%;
    box-shadow:inset 0 0 0 1px #e2e8f0;
  }
  span.center {
    position:absolute;
    inset:0;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    font-size:.7rem;
    font-weight:600;
    color:#1e293b;
  }
`;

const Legend = styled.ul`
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:.55rem;
  font-size:.7rem;
  li{
    display:flex;
    align-items:center;
    gap:.55rem;
    font-weight:500;
    color:#475569;
  }
  i {
    width:14px;
    height:14px;
    border-radius:4px;
    display:block;
  }
`;

const FilterRow = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:.9rem;
  margin-top:.4rem;
`;

const FilterGroup = styled.div`
  display:flex;
  align-items:center;
  gap:.6rem;
  select {
    padding:.5rem .7rem;
    border:1px solid #cbd5e1;
    border-radius:10px;
    background:#fff;
    font-size:.7rem;
    &:focus{ outline:none; border-color:#4834d4; box-shadow:0 0 0 2px rgba(72,52,212,.25);}
  }
`;

const StatsSummary = styled.div`
  display:flex;
  gap:1rem;
  flex-wrap:wrap;
  font-size:.65rem;
  span{
    background:#f1f5f9;
    padding:.4rem .6rem;
    border-radius:999px;
    font-weight:600;
    color:#475569;
    display:inline-flex;
    align-items:center;
    gap:.4rem;
  }
`;

const List = styled.div`
  border:1px solid rgba(255,255,255,.55);
  border-radius:20px;
  overflow:hidden;
  background:rgba(255,255,255,.85);
  backdrop-filter:blur(10px) saturate(160%);
`;

const ListHead = styled.div`
  display:grid;
  grid-template-columns: 28% 18% 18% 1fr 14%;
  background:linear-gradient(135deg,#f1f5f9,#e2e8f0);
  padding:.65rem .85rem;
  font-size:.6rem;
  font-weight:600;
  letter-spacing:.5px;
  text-transform:uppercase;
  color:#475569;
`;

const Row = styled.div`
  display:grid;
  grid-template-columns: 28% 18% 18% 1fr 14%;
  padding:.65rem .85rem;
  font-size:.7rem;
  border-top:1px solid #e2e8f0;
  background:rgba(255,255,255,.55);
  align-items:start;
  &:nth-of-type(odd){ background:rgba(255,255,255,.75); }
`;

const StatusBadge = styled.span`
  display:inline-block;
  padding:.28rem .55rem;
  font-size:.55rem;
  border-radius:999px;
  font-weight:600;
  background:${p=>p.status==='approved'
    ? '#dcfce7'
    : p.status==='declined'
      ? '#fee2e2'
      : '#fef3c7'};
  color:${p=>p.status==='approved'
    ? '#166534'
    : p.status==='declined'
      ? '#991b1b'
      : '#92400e'};
`;

const Empty = styled.div`
  padding:1.2rem;
  font-size:.7rem;
  color:#64748b;
`;

/* ====== Component ====== */
const RequestPage = () => {
  useAuth(); // reserved for personalization if needed
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ itemName:'', quantity:'', description:'', reason:'' });

  // Sample seeded history for visualization
  const [history, setHistory] = useState([
    { id:1, itemName:'Whiteboard Markers', quantity:'20 boxes', description:'For classrooms', reason:'Running low', status:'approved', date:'2025-09-20' },
    { id:2, itemName:'Graphing Calculators', quantity:'10', description:'Math dept', reason:'Lab needs', status:'pending', date:'2025-09-25' },
    { id:3, itemName:'Headsets', quantity:'15', description:'Language lab', reason:'Broken units', status:'declined', date:'2025-09-24' },
    { id:4, itemName:'Bond Paper (A4)', quantity:'30 reams', description:'Printing', reason:'High usage', status:'approved', date:'2025-09-23' },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f=>({...f,[name]:value}));
  };

  const valid = form.itemName.trim() && form.quantity.trim() && form.description.trim() && form.reason.trim();

  const onSubmit = e => {
    e.preventDefault();
    if(!valid) return;
    setSubmitting(true);
    setTimeout(()=>{
      setHistory(h=>[
        {
          id: Date.now(),
          itemName: form.itemName.trim(),
          quantity: form.quantity.trim(),
          description: form.description.trim(),
          reason: form.reason.trim(),
          status:'pending',
          date: new Date().toISOString().slice(0,10)
        },
        ...h
      ]);
      setForm({ itemName:'', quantity:'', description:'', reason:'' });
      setSubmitting(false);
      setShowHistoryModal(true);
    },600);
  };

  const counts = useMemo(()=>{
    const base = { approved:0, pending:0, declined:0 };
    history.forEach(r => {
      if(r.status === 'approved') base.approved++;
      else if(r.status === 'pending') base.pending++;
      else if(r.status === 'declined') base.declined++;
    });
    return base;
  }, [history]);

  const total = Math.max(1, counts.approved + counts.pending + counts.declined);
  const approvedDeg = (counts.approved / total) * 360;
  const pendingDeg = (counts.pending / total) * 360;

  const filtered = history.filter(r => filterStatus === 'all' ? true : r.status === filterStatus);

  /* Close modal helpers */
  const closeModal = useCallback(()=> setShowHistoryModal(false), []);
  useEffect(()=>{
    if(!showHistoryModal) return;
    const onKey = e => { if(e.key==='Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  }, [showHistoryModal, closeModal]);

  return (
    <Page>
      <Header>
        <GradientHeading as="h1">Submit Supply Request</GradientHeading>
        <HistoryBtn type="button" onClick={()=>setShowHistoryModal(true)}>
          📜 Request History
        </HistoryBtn>
      </Header>

      <Notice>
        <strong>Notice:</strong> Submitted item requests are subject to administrative review.
        Approved requests will be displayed on the voting board for community feedback.
      </Notice>

      <FormCard onSubmit={onSubmit}>
        <Field>
          <label>Item Name</label>
          <input
            name="itemName"
            value={form.itemName}
            onChange={onChange}
            placeholder="e.g. Whiteboard Markers"
            required
          />
        </Field>
        <Field>
          <label>Quantity</label>
          <input
            name="quantity"
            value={form.quantity}
            onChange={onChange}
            placeholder="e.g. 25 boxes"
            required
          />
        </Field>
        <Field>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Brief description of the item"
            required
          />
        </Field>
        <Field>
          <label>Reasons for Request</label>
          <textarea
            name="reason"
            value={form.reason}
            onChange={onChange}
            placeholder="Explain why this item is needed"
            required
          />
        </Field>
        <SubmitBtn type="submit" disabled={!valid || submitting}>
          {submitting ? 'Submitting...' : 'Submit Request'}
        </SubmitBtn>
      </FormCard>

      {showHistoryModal && (
        <Backdrop onClick={e => { if(e.target === e.currentTarget) closeModal(); }}>
          <Modal role="dialog" aria-modal="true" aria-label="Request History">
            <ModalHeader>
              <h2>Request History</h2>
              <CloseBtn type="button" onClick={closeModal} aria-label="Close history">
                ✕
              </CloseBtn>
            </ModalHeader>

            <ChartSection>
              <DonutWrap>
                <Donut approvedDeg={approvedDeg} pendingDeg={pendingDeg}>
                  <span className="center">
                    {total} Total
                  </span>
                </Donut>
              </DonutWrap>
              <Legend>
                <li><i style={{background:'#10b981'}} /> Approved: <strong>{counts.approved}</strong></li>
                <li><i style={{background:'#f59e0b'}} /> Pending: <strong>{counts.pending}</strong></li>
                <li><i style={{background:'#ef4444'}} /> Declined: <strong>{counts.declined}</strong></li>
              </Legend>
              <StatsSummary>
                <span>✅ {(counts.approved/total*100).toFixed(0)}% Approved</span>
                <span>⏳ {(counts.pending/total*100).toFixed(0)}% Pending</span>
                <span>❌ {(counts.declined/total*100).toFixed(0)}% Declined</span>
              </StatsSummary>
            </ChartSection>

            <FilterRow>
              <FilterGroup>
                <label htmlFor="statusFilter" style={{fontSize:'.65rem', fontWeight:600, letterSpacing:'.5px', textTransform:'uppercase', color:'#475569'}}>Status Filter</label>
                <select
                  id="statusFilter"
                  value={filterStatus}
                  onChange={e=>setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="declined">Declined</option>
                </select>
              </FilterGroup>
            </FilterRow>

            <List>
              <ListHead>
                <div>Item</div>
                <div>Quantity</div>
                <div>Date</div>
                <div>Reason</div>
                <div>Status</div>
              </ListHead>
              {filtered.length === 0 && (
                <Empty>No requests for this filter.</Empty>
              )}
              {filtered.map(r => (
                <Row key={r.id}>
                  <div>{r.itemName}</div>
                  <div>{r.quantity}</div>
                  <div>{r.date}</div>
                  <div style={{fontSize:'.65rem', lineHeight:'1rem'}}>{r.reason}</div>
                  <div>
                    <StatusBadge status={r.status}>
                      {r.status.toUpperCase()}
                    </StatusBadge>
                  </div>
                </Row>
              ))}
            </List>
          </Modal>
        </Backdrop>
      )}
    </Page>
  );
};

export default RequestPage;
