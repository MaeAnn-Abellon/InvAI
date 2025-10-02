import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';

const Wrap = styled.div`display:flex; flex-direction:column; gap:1.1rem;`;
const List = styled.ul`list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.65rem;`;
const Item = styled.li`
  position:relative;
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:18px;
  padding:1rem 1.1rem 1.15rem 1.2rem;
  box-shadow:0 4px 12px -4px rgba(0,0,0,.05);
  display:flex;
  gap:.9rem;
  align-items:flex-start;
`;
const Dot = styled.span`
  width:10px; height:10px; border-radius:50%;
  margin-top:.35rem;
  background:${p=>p.$unread ? '#6366f1' : '#cbd5e1'};
  flex:0 0 10px;
`;
const Body = styled.div`
  flex:1;
  h4{
    margin:0 0 .3rem;
    font-size:.8rem;
    font-weight:${p=>p.$unread ? 700 : 600};
    color:#1e293b;
  }
  p{
    margin:0;
    font-size:.7rem;
    line-height:1.05rem;
    color:#475569;
    font-weight:${p=>p.$unread ? 600 : 400};
  }
  small{
    display:block;
    margin-top:.45rem;
    font-size:.55rem;
    color:#64748b;
    letter-spacing:.5px;
  }
`;
const MenuBtn = styled.button`
  position:absolute;
  top:.55rem;
  right:.55rem;
  background:transparent;
  border:none;
  cursor:pointer;
  padding:.25rem;
  border-radius:6px;
  color:#475569;
  &:hover{background:#f1f5f9;}
`;
const Menu = styled.div`
  position:absolute;
  top:2rem;
  right:.55rem;
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:12px;
  padding:.35rem;
  min-width:140px;
  box-shadow:0 10px 28px -8px rgba(0,0,0,.18);
  display:flex;
  flex-direction:column;
  z-index:20;
  button{
    background:transparent;
    border:none;
    text-align:left;
    font-size:.65rem;
    padding:.55rem .65rem;
    border-radius:8px;
    display:flex;
    gap:.45rem;
    align-items:center;
    cursor:pointer;
    color:#334155;
    font-weight:500;
  }
  button:hover{background:#f1f5f9;}
`;

const Notifications = () => {
  const [items,setItems] = useState([]);
  const [openMenu,setOpenMenu] = useState(null);

  useEffect(()=>{
    // TODO: GET /api/notifications
    setItems([
      { id:1, title:'Request Approved', body:'Your request for Markers was approved.', unread:true, ts:'2m ago' },
      { id:2, title:'Vote Update', body:'Headsets moved to 2nd place.', unread:true, ts:'10m ago' },
      { id:3, title:'Reminder', body:'You have 2 pending requests needing details.', unread:false, ts:'1h ago' },
    ]);
  },[]);

  const markAsRead = (id)=>{
    setItems(prev=>prev.map(n=>n.id===id?{...n, unread:false}:n));
    // TODO: PATCH /api/notifications/:id/read
    setOpenMenu(null);
  };
  const deleteOne = (id)=>{
    setItems(prev=>prev.filter(n=>n.id!==id));
    // TODO: DELETE /api/notifications/:id
    setOpenMenu(null);
  };

  return (
    <Wrap>
      <h1 style={{margin:'0 0 1rem', fontSize:'1.35rem', fontWeight:700}}>Notifications</h1>
      <List>
        {items.map(n=>(
          <Item key={n.id}>
            <Dot $unread={n.unread} />
            <Body $unread={n.unread}>
              <h4>{n.title}</h4>
              <p>{n.body}</p>
              <small>{n.ts}</small>
            </Body>
            <MenuBtn onClick={()=>setOpenMenu(openMenu===n.id?null:n.id)} aria-haspopup="true" aria-expanded={openMenu===n.id}>
              ⋮
            </MenuBtn>
            {openMenu===n.id && (
              <Menu>
                {n.unread && <button onClick={()=>markAsRead(n.id)}>Mark as Read</button>}
                <button onClick={()=>deleteOne(n.id)}>Delete</button>
              </Menu>
            )}
          </Item>
        ))}
      </List>
    </Wrap>
  );
};

export default Notifications;