import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { roleTheme } from '@/theme/roleTheme';

const SidebarWrapper = styled.aside`
  width:240px;
  background:${p => p.$bg || '#17348c'};
  color:#fff;
  position:fixed;
  top:0; left:0;
  height:100vh;
  display:flex; flex-direction:column;
  padding:2rem 1rem 3rem;
  overflow-y:auto; overscroll-behavior:contain; scrollbar-width:thin;
  box-shadow:2px 0 8px -2px rgba(0,0,0,.15);
  z-index:220;
  transition:transform .45s cubic-bezier(.4,.8,.3,1), box-shadow .45s;
  /* desktop default */
  transform:translateX(0);
  @media (max-width: 860px){
    width:min(78%,300px);
    transform:translateX(${p=>p.$open? '0':'-110%'});
    box-shadow:${p=>p.$open? '4px 0 24px -4px rgba(0,0,0,.35)':''};
    backdrop-filter:${p=>p.$open? 'blur(4px)':''};
  }
`;

const UserSection = styled.div`
  display:flex;
  align-items:center;
  gap:1rem;
  padding:.5rem;
  margin-bottom:2rem;
`;

const UserAvatar = styled.img`
  width:70px;
  height:70px;
  border-radius:50%;
  background:#fff;
  object-fit:cover;
  box-shadow:0 0 0 2px rgba(255,255,255,.25);
`;

const UserInfo = styled.div`
  h3 { margin:0 0 .15rem; font-size:1rem; font-weight:600; letter-spacing:.5px; }
  p  { margin:0; font-size:.8rem; opacity:.85; }
`;

const NavMenu = styled.nav`
  display:flex;
  flex-direction:column;
  gap:.35rem;
`;

const NavItem = styled(Link)`
  display:flex;
  align-items:center;
  gap:.85rem;
  padding:.65rem .85rem;
  color:#fff;
  text-decoration:none;
  border-radius:.55rem;
  font-size:.8rem;
  font-weight:500;
  background:${p=>p['data-active']?'rgba(255,255,255,.15)':'transparent'};
  transition:background .18s;
  &:hover{ background:rgba(255,255,255,.12); }
  svg { width:20px; height:20px; }
`;

const NavButton = styled.button`
  display:flex;
  align-items:center;
  gap:.85rem;
  padding:.65rem .85rem;
  color:#fff;
  border:none;
  background:transparent;
  border-radius:.55rem;
  font-size:.8rem;
  font-weight:500;
  cursor:pointer;
  text-align:left;
  &:hover{ background:rgba(255,255,255,.12); }
  svg { width:20px; height:20px; }
`;

const Icon = ({ name }) => {
  switch (name) {
    case 'menu': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>);
    case 'inbox': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>);
    case 'vote': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2v-6a2 2 0 00-2-2h-3l-4-4H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
    case 'bell': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);
    case 'user': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /></svg>);
    case 'box': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>);
    case 'check': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>);
    case 'chart': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18M5 13v8m12-14v14m4-6v6M1 21h22" /></svg>);
    case 'users': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 110 7.75M8 3.13a4 4 0 110 7.75" /></svg>);
    case 'gear': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317l.563-1.125A1 1 0 0111.81 2h.38a1 1 0 01.922.592l.563 1.125a8.003 8.003 0 012.83 0l.563-1.125A1 1 0 0117.81 2h.38a1 1 0 01.922.592l.563 1.125a8.003 8.003 0 011.415 1.03l1.125-.563A1 1 0 0123 4.19v.38a1 1 0 01-.592.922l-1.125.563a8.003 8.003 0 010 2.83l1.125.563A1 1 0 0123 10.19v.38a1 1 0 01-.592.922l-1.125.563a8.003 8.003 0 01-1.03 1.415l.563 1.125A1 1 0 0121 15.81v.38a1 1 0 01-.592.922l-1.125.563a8.003 8.003 0 01-2.83 0l-.563 1.125A1 1 0 0116.19 19h-.38a1 1 0 01-.922-.592l-.563-1.125a8.003 8.003 0 01-1.415-1.03l-1.125.563A1 1 0 0111 17.81v-.38a1 1 0 01.592-.922l1.125-.563a8.003 8.003 0 010-2.83l-1.125-.563A1 1 0 0111 10.19v-.38a1 1 0 01.592-.922l1.125-.563a8.003 8.003 0 011.03-1.415l-.563-1.125A1 1 0 0115.81 5h-.38a1 1 0 01-.922-.592l-.563-1.125a8.003 8.003 0 01-2.83 0z" /></svg>);
    case 'trend': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
    case 'report': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3z" /></svg>);
    case 'history': return (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3z" /></svg>);
    default: return null;
  }
};

const CloseBar = styled.button`
  position:absolute; top:.85rem; right:.85rem; display:none; border:none; background:rgba(255,255,255,.15); color:#fff; width:34px; height:34px; border-radius:10px; font-size:1.05rem; cursor:pointer; backdrop-filter:blur(6px);
  @media (max-width:860px){ display:inline-flex; align-items:center; justify-content:center; }
  &:hover{ background:rgba(255,255,255,.25); }
`;

const Sidebar = ({ open=false, onClose }) => {
  const location = useLocation();
  const { role, user, logout } = useAuth();

  const theme = roleTheme[role] || roleTheme.default;

  const menusByRole = {
    student: [
      { to: '/dashboard', label: 'Dashboard', icon: 'menu' },
      { to: '/requests', label: 'Requests', icon: 'inbox' },
      { to: '/voting', label: 'Voting', icon: 'vote' },
      { to: '/about', label: 'About', icon: 'report' },
      { to: '/profile', label: 'Profile', icon: 'user' },
    ],
    teacher: [
      { to: '/dashboard', label: 'Dashboard', icon: 'menu' },
      { to: '/requests', label: 'Requests', icon: 'inbox' },
      { to: '/voting', label: 'Voting', icon: 'vote' },
      { to: '/about', label: 'About', icon: 'report' },
      { to: '/profile', label: 'Profile', icon: 'user' },
    ],
    staff: [
      { to: '/dashboard', label: 'Dashboard', icon: 'menu' },
      { to: '/requests', label: 'Requests', icon: 'inbox' },
      { to: '/voting', label: 'Voting', icon: 'vote' },
      { to: '/about', label: 'About', icon: 'report' },
      { to: '/profile', label: 'Profile', icon: 'user' },
    ],
    manager: [
      { to: '/dashboard', label: 'Dashboard', icon: 'menu' },
      { to: '/manager/inventory', label: 'Inventory', icon: 'box' },
      { to: '/manager/claims', label: 'Claims', icon: 'check' },
      { to: '/manager/returns', label: 'Returns', icon: 'history' },
      { to: '/manage-requests', label: 'Requests', icon: 'inbox' },
      { to: '/manager/voting', label: 'Voting', icon: 'vote' },
      { to: '/profile', label: 'Profile', icon: 'user' },
    ],
    admin: [
      { to: '/dashboard', label: 'Dashboard', icon: 'menu' },
      { to: '/admin/inventory', label: 'Inventory Overview', icon: 'box' },
      { to: '/manage-requests', label: 'Request Oversight', icon: 'check' },
      { to: '/user-management', label: 'User Management', icon: 'users' },
      { to: '/about', label: 'About', icon: 'report' },
      { to: '/settings', label: 'Settings', icon: 'gear' },
      { to: '/profile', label: 'Profile', icon: 'user' },
    ],
  };

  const menu = menusByRole[role] || menusByRole.student;

  // Auto-close on route change (mobile only)
  useEffect(()=>{
    if(onClose && window.innerWidth <= 860){
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[location.pathname]);

  return (
    <SidebarWrapper $bg={theme.sidebarBg} $open={open}>
      <CloseBar aria-label="Close navigation" onClick={onClose}>×</CloseBar>
      <UserSection>
        <UserAvatar src={getAvatarUrl(user)} alt="User avatar" />
        <UserInfo>
          <h3 style={{margin:0, fontSize:'.7rem', letterSpacing:'.5px', textTransform:'uppercase', fontWeight:700}}>Welcome</h3>
          <p style={{margin:'.15rem 0 0', fontWeight:600, fontSize:'.8rem', lineHeight:'.95rem'}} title={user?.fullName || user?.name}>{(user?.fullName || user?.name || 'User')}</p>
          <div style={{display:'flex', flexWrap:'wrap', gap:'.35rem', marginTop:'.4rem'}}>
            {user?.role && <span style={{background:'#6366f1', color:'#fff', fontSize:'.5rem', padding:'.25rem .5rem', borderRadius:'999px', fontWeight:600, letterSpacing:'.5px'}}>{user.role}</span>}
            {(user?.department || user?.course) && (
              <span style={{background:'#f1f5f9', color:'#334155', fontSize:'.5rem', padding:'.25rem .55rem', borderRadius:'999px', fontWeight:600, letterSpacing:'.5px'}}>
                {(user?.department||'').toString()} {user?.course? '· '+user.course : ''}
              </span>
            )}
          </div>
        </UserInfo>
      </UserSection>
      <NavMenu>
        {menu.map(m => (
          <NavItem key={m.to} to={m.to} data-active={location.pathname === m.to}>
            <Icon name={m.icon} />
            {m.label}
          </NavItem>
        ))}
        <NavButton onClick={logout}>
          <Icon name="gear" />
          Logout
        </NavButton>
      </NavMenu>
    </SidebarWrapper>
  );
};

export default Sidebar;