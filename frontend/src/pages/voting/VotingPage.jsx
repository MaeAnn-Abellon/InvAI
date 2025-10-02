import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { Bell, Settings as SettingsIcon, MessageCircle } from 'lucide-react';
import SettingsModal from '@/components/settings/SettingsModal';
import VoteCharts from '@/components/voting/VoteCharts';

const Page = styled.div`
  padding: 2rem;
  background:#f8fafc;
`;
const Header = styled.div`
  display:flex;
  flex-direction:column;
  gap:.75rem;
  margin-bottom:1.5rem;
  @media(min-width:680px){ flex-direction:row; align-items:center; justify-content:space-between; }
`;
const Title = styled.h1`
  font-size:1.55rem;
  margin:0;
`;
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
const Card = styled.div`
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:14px;
  padding:1rem;
  display:flex;
  flex-direction:column;
  gap:.6rem;
  box-shadow:0 1px 3px rgba(0,0,0,0.06);
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
const Btn = styled.button`
  flex:1;
  background:${p=>p.primary?'#4834d4':'#e2e8f0'};
  color:${p=>p.primary?'#fff':'#1e293b'};
  border:none;
  padding:.45rem .55rem;
  font-size:.7rem;
  border-radius:8px;
  cursor:pointer;
  font-weight:500;
  transition:background .2s;
  &:hover{ background:${p=>p.primary?'#372aaa':'#cbd5e1'}; }
`;

const VotingPage = () => {
  const [sort, setSort] = useState('recent');
  const [query, setQuery] = useState('');
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

  return (
    <Page>
      <Header>
        <Title>Supply Voting</Title>
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

      <VoteCharts />

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
    </Page>
  );
};

export default VotingPage;
