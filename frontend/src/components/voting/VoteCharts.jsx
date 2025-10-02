import React, { useEffect, useState, useMemo } from 'react';
import styled from '@emotion/styled';

const Wrap = styled.div`
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:22px;
  padding:1.4rem 1.6rem 1.6rem;
  box-shadow:0 4px 14px rgba(0,0,0,.05);
  margin-bottom:1.5rem;
`;

const Head = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  flex-wrap:wrap;
  margin-bottom:.75rem;
`;
const Title = styled.h2`
  margin:0;
  font-size:1.1rem;
  font-weight:700;
  color:#1e293b;
`;

const BarList = styled.div`
  display:flex;
  flex-direction:column;
  gap:.65rem;
`;
const BarRow = styled.div`
  display:flex;
  align-items:center;
  gap:.8rem;
  font-size:.72rem;
  .name{flex:0 0 140px; font-weight:600; color:#334155;}
  .track{flex:1; background:#f1f5f9; height:14px; border-radius:8px; overflow:hidden;}
  .bar{height:100%; background:linear-gradient(90deg,#6366f1,#4834d4); width:${p=>p.$pct}%; transition:width .4s;}
  .pct{width:42px; font-weight:600; text-align:right; color:#334155;}
`;

const Button = styled.button`
  background:#6366f1;
  color:#fff;
  font-size:.7rem;
  font-weight:600;
  padding:.55rem .9rem;
  border:none;
  border-radius:8px;
  cursor:pointer;
  letter-spacing:.5px;
  display:inline-flex;
  align-items:center;
  gap:.3rem;
  &:hover{background:#4f46e5;}
`;

const ModalBackdrop = styled.div`
  position:fixed; inset:0; background:rgba(15,23,42,.45);
  display:flex; align-items:flex-start; justify-content:center; padding:4rem 1.2rem; z-index:400;
`;
const ModalCard = styled.div`
  background:#fff; width:100%; max-width:720px;
  border:1px solid #e2e8f0; border-radius:24px;
  padding:1.6rem 1.75rem 2rem; box-shadow:0 10px 38px -6px rgba(0,0,0,.25);
  display:flex; flex-direction:column; gap:1.1rem;
  max-height:calc(100vh - 8rem); overflow:auto;
`;

const Close = styled.button`
  background:#f1f5f9; border:none; color:#334155;
  padding:.45rem .75rem; border-radius:8px; font-size:.65rem;
  font-weight:600; cursor:pointer; align-self:flex-end;
  &:hover{background:#e2e8f0;}
`;

const Small = styled.small`display:block; margin-top:.6rem; color:#64748b; font-size:.6rem;`;

const VoteCharts = () => {
  const [votes,setVotes] = useState([]);
  const [open,setOpen] = useState(false);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    // TODO: replace with backend call: GET /api/votes/summary
    // Expected response: [{itemId, name, totalVotes}, ...]
    setTimeout(()=>{
      const mock = [
        { id:1, name:'Markers', total:120 },
        { id:2, name:'Bond Paper', total:105 },
        { id:3, name:'Headsets', total:95 },
        { id:4, name:'Projector Bulb', total:60 },
        { id:5, name:'Whiteboard Cleaner', total:45 },
        { id:6, name:'HDMI Cables', total:30 },
      ];
      setVotes(mock);
      setLoading(false);
    },350);
  },[]);

  const totalAll = useMemo(
    ()=>votes.reduce((a,b)=>a+b.total,0)||1,
    [votes]
  );

  const ranked = useMemo(
    ()=>[...votes].sort((a,b)=>b.total - a.total),
    [votes]
  );
  const top3 = ranked.slice(0,3);

  const calcPct = (count)=> ((count/totalAll)*100).toFixed(1);

  if (loading) return <Wrap><Title>Top Votes</Title><Small>Loading...</Small></Wrap>;

  return (
    <>
      <Wrap>
        <Head>
          <Title>Top 3 Voted Items</Title>
          <Button onClick={()=>setOpen(true)}>See All Votes ▸</Button>
        </Head>
        <BarList>
          {top3.map(item=>(
            <BarRow key={item.id} $pct={calcPct(item.total)}>
              <div className="name">{item.name}</div>
              <div className="track"><div className="bar" /></div>
              <div className="pct">{calcPct(item.total)}%</div>
            </BarRow>
          ))}
        </BarList>
        <Small>Percentages are relative to total current votes.</Small>
      </Wrap>

      {open && (
        <ModalBackdrop onClick={()=>setOpen(false)}>
          <ModalCard onClick={e=>e.stopPropagation()}>
            <Close onClick={()=>setOpen(false)}>Close ✕</Close>
            <Title style={{marginTop:0}}>All Item Votes</Title>
            <BarList>
              {ranked.map(item=>(
                <BarRow key={item.id} $pct={calcPct(item.total)}>
                  <div className="name">{item.name}</div>
                  <div className="track"><div className="bar" /></div>
                  <div className="pct">{calcPct(item.total)}%</div>
                </BarRow>
              ))}
            </BarList>
            <Small>Total votes: {totalAll}</Small>
          </ModalCard>
        </ModalBackdrop>
      )}
    </>
  );
};

export default VoteCharts;