import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { PageSurface, GradientHeading, GlassPanel, PrimaryButton, SubNote, Divider } from '@/components/ui/Glass';
import NewRequestModal from '@/components/requests/NewRequestModal';
import { inventoryApi } from '@/services/inventoryApi';
import { Bell, Settings as SettingsIcon, MessageCircle } from 'lucide-react';
import SettingsModal from '@/components/settings/SettingsModal';
import VoteCharts from '@/components/voting/VoteCharts';

const Page = styled(PageSurface)`padding:2rem 2.25rem 3rem;`;
const Header = styled.div`
  display:flex;
  flex-direction:column;
  gap:.75rem;
  margin-bottom:1.5rem;
  @media(min-width:680px){ flex-direction:row; align-items:center; justify-content:space-between; }
`;
const Title = styled(GradientHeading)`margin:0; font-size:1.65rem;`;
const Controls = styled.div`
  display:flex;
  gap:.8rem;
  flex-wrap:wrap;
`;
const Select = styled.select`
  padding:.55rem .7rem;
  border:1px solid #cbd5e1;
  border-radius:8px;
  background:#fff;
  font-size:.85rem;
  &:focus{ outline:none; border-color:#4834d4; box-shadow:0 0 0 2px rgba(72,52,212,.25);}
`;
const Search = styled.input`
  padding:.55rem .7rem;
  border:1px solid #cbd5e1;
  border-radius:8px;
  background:#fff;
  font-size:.85rem;
  width:220px;
  &:focus{ outline:none; border-color:#4834d4; box-shadow:0 0 0 2px rgba(72,52,212,.25);}
`;
const Grid = styled.div`
  display:grid;
  gap:1rem;
  grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
`;
const Card = styled(GlassPanel)`
  padding:1rem 1.05rem 1.15rem;
  gap:.7rem;
  border-radius:18px;
`;
const Name = styled.h3`
  margin:0;
  font-size:.95rem;
  line-height:1.1rem;
  min-height:2.1rem;
`;
const Votes = styled.div`
  font-size:.7rem;
  font-weight:600;
  color:#475569;
  background:#f1f5f9;
  padding:.3rem .55rem;
  border-radius:999px;
  align-self:flex-start;
`;
const BarWrap = styled.div`
  background:#f1f5f9;
  height:8px;
  border-radius:6px;
  overflow:hidden;
  position:relative;
`;
const Bar = styled.div`
  height:100%;
  background:linear-gradient(90deg,#6366f1,#4834d4);
  width:${p=>p.w}%;
  transition:width .3s;
`;
const Actions = styled.div`
  margin-top:auto;
  display:flex;
  gap:.5rem;
`;
const Btn = styled(PrimaryButton)`
  flex:1; justify-content:center; font-size:.62rem; padding:.55rem .7rem; border-radius:10px; background:${p=>p.primary? 'linear-gradient(135deg,#6366f1,#4834d4)' : 'rgba(255,255,255,.85)'}; color:${p=>p.primary? '#fff' : '#1e293b'}; border:${p=>p.primary?'1px solid rgba(255,255,255,.25)':'1px solid #e2e8f0'}; box-shadow:${p=>p.primary?'0 6px 18px -8px rgba(72,52,212,.55)':'0 2px 6px -2px rgba(31,41,55,.08)'}; &:hover{filter:brightness(1.05);} 
`;

const VotingPage = () => {
  const [sort, setSort] = useState('recent');
  const [query, setQuery] = useState('');
  const [showModal,setShowModal] = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [requestForm,setRequestForm] = useState({ itemName:'', category:'supplies', quantity:'1', description:'', reason:'' });
  const [items, setItems] = useState([
    { id:1, name:'Whiteboard Markers (Assorted Colors)', votes:98, createdAt: new Date('2025-09-20') },
    { id:2, name:'Printer Ink (Black & Color)', votes:85, createdAt: new Date('2025-09-24') },
    { id:3, name:'Bond Paper (A4, Short, Long)', votes:120, createdAt: new Date('2025-09-21') },
    { id:4, name:'Ballpoint Pens (Blue, Black, Red)', votes:75, createdAt: new Date('2025-09-25') },
    { id:5, name:'Highlighters (Neon Pack)', votes:45, createdAt: new Date('2025-09-23') },
    { id:6, name:'Correction Tape', votes:90, createdAt: new Date('2025-09-19') },
  ]);

  const maxVotes = Math.max(...items.map(i=>i.votes),1);

  const filtered = useMemo(()=>{
    let list = [...items];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(i=>i.name.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'most': list.sort((a,b)=>b.votes - a.votes); break;
      case 'least': list.sort((a,b)=>a.votes - b.votes); break;
      default: // recent
        list.sort((a,b)=>b.createdAt - a.createdAt);
    }
    return list;
  }, [items, sort, query]);

  const vote = (id) => {
    setItems(prev => prev.map(i => i.id===id ? {...i, votes: i.votes+1} : i));
  };

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
      setShowModal(false);
      setRequestForm({ itemName:'', category:requestForm.category, quantity:'1', description:'', reason:'' });
      // optionally refresh board items when backend integrated
    } catch(e){ alert(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <Page>
      <Header>
        <Title as="h1">Supply Voting</Title>
        <PrimaryButton type="button" onClick={()=>setShowModal(true)} style={{padding:'.55rem 1rem'}}>➕ New Request</PrimaryButton>
        <Controls>
          <Search
            placeholder="Search item..."
            value={query}
            onChange={e=>setQuery(e.target.value)}
          />
          <Select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="most">Most Voted</option>
            <option value="least">Least Voted</option>
          </Select>
        </Controls>
      </Header>
      <GlassPanel style={{marginBottom:'1.4rem'}}>
        <h2 style={{margin:'0 0 .35rem', fontSize:'1rem', fontWeight:700, letterSpacing:'.4px'}}>Voting Overview</h2>
        <Divider />
        <VoteCharts />
        <SubNote>Visual summary of current request engagement. Charts update as votes change.</SubNote>
      </GlassPanel>

      <Grid>
        {filtered.map(item=>(
          <Card key={item.id}>
            <Name>{item.name}</Name>
            <Votes>{item.votes} votes</Votes>
            <BarWrap>
              <Bar w={(item.votes / maxVotes) * 100}/>
            </BarWrap>
            <Actions>
              <Btn onClick={()=>alert('Details placeholder')}>Details</Btn>
              <Btn primary onClick={()=>vote(item.id)}>Vote</Btn>
            </Actions>
          </Card>
        ))}
      </Grid>
      <NewRequestModal
        open={showModal}
        onClose={()=>{ if(!submitting){ setShowModal(false); } }}
        onSubmit={submitRequest}
        form={requestForm}
        setForm={setRequestForm}
        submitting={submitting}
      />
    </Page>
  );
};

export default VotingPage;
