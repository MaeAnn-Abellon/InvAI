import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import logo from '../assets/logo.png';
import lpage from '../assets/lpage.png';


const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80vh;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem 2rem;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem; 
  font-weight: bold;
  font-size: 1.5rem; /* Make text slightly bigger to match larger image */
  
  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    paddingTop: 0.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const GetStartedButton = styled.button`
  background: #4834d4;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #372aaa;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  padding-right: 4rem;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const LandingPage = () => {
  return (
    <>
      <Header>
    <Logo>
      <Link 
        to="/" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          textDecoration: 'none', 
          color: 'inherit' 
        }}
      >
        <img src={logo} alt="SmartStock Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        <span>SmartStock</span>
      </Link>
    </Logo>
        <Nav>
          <StyledLink to="/about">About us</StyledLink>
          <StyledLink to="/info">Info</StyledLink>
          <GetStartedButton as={Link} to="/login">Get Started</GetStartedButton>
        </Nav>
      </Header>
      
      <Container>
        <LeftSection>
          <Title>SMART STOCK</Title>
          <Subtitle>
            AI-Based Supply Inventory and Crowdsourced Replenishment System
            for Consolatrix College of Toledo City, Inc.
          </Subtitle>
          <GetStartedButton>Get Started</GetStartedButton>
        </LeftSection>
        <RightSection>
          <img 
            src={lpage} 
            alt="Inventory Management Illustration"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </RightSection>
      </Container>
    </>
  );
};

export default LandingPage; 