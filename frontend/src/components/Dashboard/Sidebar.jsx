import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { roleTheme } from '@/theme/roleTheme';

// Import icon images
import dashboardIcon from '@/icons/dashboard.png';
import requestsIcon from '@/icons/requests.png';
import voteIcon from '@/icons/vote.png';
import aboutIcon from '@/icons/about.png';
import profileIcon from '@/icons/profile.png';
import inventoryIcon from '@/icons/inventory.png';
import claimsIcon from '@/icons/claims.png';
import returnsIcon from '@/icons/returns.png';
import userManagementIcon from '@/icons/user_management.png';
import settingsIcon from '@/icons/settings.png';
import logoutIcon from '@/icons/logout.png';

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
  h3 { margin:0 0 .15rem; font-size:1.2rem; font-weight:600; letter-spacing:.5px; }
  p  { margin:0; font-size:1rem; opacity:.85; }
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

const IconImage = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
`;

const Icon = ({ name }) => {
  const iconMap = {
    'menu': dashboardIcon,
    'inbox': requestsIcon,
    'vote': voteIcon,
    'report': aboutIcon,
    'user': profileIcon,
    'box': inventoryIcon,
    'check': claimsIcon,
    'history': returnsIcon,
    'users': userManagementIcon,
    'gear': settingsIcon,
    'logout': logoutIcon,
  };

  const icon = iconMap[name];
  return icon ? <IconImage src={icon} alt={name} /> : null;
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
          <h3 style={{margin:0, fontSize:'1rem', letterSpacing:'.5px', textTransform:'uppercase', fontWeight:700}}>Welcome</h3>
          <p style={{margin:'.15rem 0 0', fontWeight:600, fontSize:'1rem', lineHeight:'.95rem'}} title={user?.fullName || user?.name}>{(user?.fullName || user?.name || 'User')}</p>
          <div style={{display:'flex', flexWrap:'wrap', gap:'.35rem', marginTop:'.4rem'}}>
            {user?.role && <span style={{background:'#6366f1', color:'#fff', fontSize:'.8rem', padding:'.25rem .5rem', borderRadius:'999px', fontWeight:600, letterSpacing:'.5px'}}>{user.role}</span>}
            {(user?.department || user?.course) && (
              <span style={{background:'#f1f5f9', color:'#334155', fontSize:'.8rem', padding:'.25rem .55rem', borderRadius:'999px', fontWeight:600, letterSpacing:'.5px'}}>
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
          <Icon name="logout" />
          Logout
        </NavButton>
      </NavMenu>
    </SidebarWrapper>
  );
};

export default Sidebar;