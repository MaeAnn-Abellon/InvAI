import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

const Wrap = styled.div`display:flex;flex-direction:column;gap:1.4rem;`;
const Title = styled.h1`margin:0;font-size:1.35rem;font-weight:700;`;
const Card = styled.div`
  background:#fff;border:1px solid #e2e8f0;border-radius:22px;
  padding:1.6rem 1.75rem 1.8rem;box-shadow:0 5px 18px -4px rgba(0,0,0,.06);
`;
const Table = styled.table`
  width:100%;border-collapse:collapse;font-size:.72rem;
  th,td{padding:.6rem .7rem;text-align:left;}
  th{font-size:.6rem;letter-spacing:.55px;text-transform:uppercase;color:#475569;}
  tbody tr:nth-of-type(even){background:#f8fafc;}
  tbody td{border-top:1px solid #e2e8f0;}
`;
const Pill = styled.span`
  display:inline-block;padding:.28rem .65rem;border-radius:999px;font-size:.58rem;font-weight:600;
  background:${p=>p.type==='in' && '#dcfce7' || p.type==='low' && '#fef9c3' || p.type==='out' && '#fee2e2'};
  color:${p=>p.type==='in' && '#166534' || p.type==='low' && '#92400e' || p.type==='out' && '#991b1b'};
`;

const ReadOnlyInventory = () => {
  const [items,setItems] = useState([]);

  useEffect(()=>{
    // TODO: fetch from API e.g. GET /api/inventory/department?scope=teacher
    setItems([
      { id:1, name:'Projector', description:'In Use (Room 204)', status:'In Stock' },
      { id:2, name:'Microscope', description:'For Repair', status:'Low' },
      { id:3, name:'3D Printer', description:'Broken - awaiting parts', status:'Out' },
      { id:4, name:'HDMI Cable Set', description:'In Use', status:'In Stock' },
      { id:5, name:'Lab Beakers', description:'In Use', status:'Low' },
    ]);
  },[]);

  return (
    <Wrap>
      <Title>Inventory (Read‑Only)</Title>
      <Card>
        <Table>
          <thead>
            <tr><th>Item</th><th>Description / Condition</th><th>Status</th></tr>
          </thead>
          <tbody>
            {items.map(it=>(
              <tr key={it.id}>
                <td>{it.name}</td>
                <td>{it.description}</td>
                <td>
                  <Pill type={it.status==='In Stock'?'in':it.status==='Low'?'low':'out'}>
                    {it.status}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p style={{fontSize:'.6rem',margin:'1rem 0 0',color:'#64748b'}}>
          Viewing only. Contact manager to request changes.
        </p>
      </Card>
    </Wrap>
  );
};

export default ReadOnlyInventory;