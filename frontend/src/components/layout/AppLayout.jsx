import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Dashboard/Sidebar';

const Shell = styled.div`
  min-height:100vh; background:#f8fafc; position:relative;
`;

const Main = styled.main`
  margin-left:240px; min-height:100vh; padding:2.5rem 2.5rem 4rem; overflow-x:hidden; transition:filter .4s;
  @media (max-width:860px){ margin-left:0; padding:4.2rem 1.5rem 4rem; }
`;

const MobileBar = styled.button`
  position:fixed; top:.85rem; left:.9rem; z-index:260; width:46px; height:46px; border:none; border-radius:14px;
  background:linear-gradient(135deg,#6366f1,#4338ca); color:#fff; display:none; align-items:center; justify-content:center; font-size:1.1rem; font-weight:600;
  box-shadow:0 6px 18px -6px rgba(0,0,0,.35), 0 2px 4px -1px rgba(0,0,0,.2); cursor:pointer; letter-spacing:.5px;
  @media (max-width:860px){ display:inline-flex; }
`;

const Overlay = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(2px);
  opacity:${p=>p.$show?1:0}; pointer-events:${p=>p.$show?'auto':'none'}; transition:opacity .45s; z-index:200;
`;

const AppLayout = () => {
  const [navOpen,setNavOpen] = useState(false);
  const close = () => setNavOpen(false);
  // Prevention of background scroll when sidebar open on mobile
  useEffect(()=>{
    if(window.innerWidth <= 860){
      document.body.style.overflow = navOpen? 'hidden':'auto';
    }
  },[navOpen]);
  return (
    <Shell>
      <Sidebar open={navOpen} onClose={close} />
      <MobileBar aria-label="Open navigation" onClick={()=>setNavOpen(true)}>☰</MobileBar>
      <Overlay $show={navOpen} onClick={close} />
      <Main style={navOpen? {filter:'blur(2px) brightness(.85)'}:undefined}>
        <Outlet />
      </Main>
    </Shell>
  );
};

export default AppLayout;