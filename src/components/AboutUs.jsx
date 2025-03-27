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
  z-index: 1000;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  font-size: 1.75rem;
  color: black;
  text-decoration: none;

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  &:hover {
    text-decoration: none;
    color: black;
  }
`;


const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? '#4834d4' : '#e2e2e2'};
  color: ${props => props.variant === 'primary' ? 'white' : 'black'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#372aaa' : '#d1d1d1'};
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

const Description = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 600px;
`;

const LearnMoreButton = styled(Button)`
  font-size: 1.1rem;
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

const AboutUs = () => {
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
          <Button as={Link} to="/get-started" variant="primary">Get Started</Button>
        </Nav>
      </Header>

      <Container>
        <LeftSection>
          <Title>ABOUT US</Title>
          <Description>
            AI-Based Supply Inventory and Crowdsourced Replenishment System
            for Consolatrix College of Toledo City, Inc.
          </Description>
          <LearnMoreButton as={Link} to="/learn-more" variant="primary">
            Learn More
          </LearnMoreButton>
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

export default AboutUs; 