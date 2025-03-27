import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import avatar from '../../assets/avatar.png';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #1e40af;
  min-height: 100vh;
  padding: 2rem 1rem;
  color: white;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  margin-bottom: 2rem;
`;

const UserAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;

`;

const UserInfo = styled.div`
  h3 {
    font-size: 1.2rem;
    margin: 0;
  }
  p {
    font-size: 1rem;
    opacity: 0.8;
    margin: 0;
  }
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Sidebar = () => {
  const location = useLocation();

  return (
    <SidebarContainer>
      <UserSection>
        <UserAvatar src={avatar} alt="User" />
        <UserInfo>
          <h3>Welcome,</h3>
          <p>Mochii</p>
        </UserInfo>
      </UserSection>

      <NavMenu>
        <NavItem to="/dashboard" active={location.pathname === '/dashboard'}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Dashboard
        </NavItem>

        <NavItem to="/voting" active={location.pathname === '/voting'}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Voting & Requests
        </NavItem>

        <NavItem to="/inventory" active={location.pathname === '/inventory'}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          Inventory
        </NavItem>

        <NavItem to="/support" active={location.pathname === '/support'}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Contact & Support
        </NavItem>

        <NavItem to="/about-us" active={location.pathname === '/about-us'}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About Us
        </NavItem>
      </NavMenu>
    </SidebarContainer>
  );
};

export default Sidebar; 