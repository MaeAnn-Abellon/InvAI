
import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import logo from '../assets/Inv.png'
import banner from '../assets/CCTC.jpg';


const Page = styled.div`
  /* Inherit global Roboto font */
  background:
    radial-gradient(circle at 12% 18%, rgba(99,102,241,.18), transparent 60%),
    radial-gradient(circle at 88% 72%, rgba(72,52,212,.20), transparent 55%),
    #f1f5f9;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  overflow-x:hidden;
`;

/* Header */
const Header = styled.header`
  position:fixed; inset:0 0 auto 0;
  padding:.4rem 2.25rem;
  display:flex; justify-content:space-between; align-items:center;
  backdrop-filter:blur(8px);
  background:rgba(255,255,255,.75);
  border-bottom:1px solid rgba(255,255,255,.4);
  z-index:50;
`;

const Logo = styled.div`
  display:flex; align-items:center; gap:.55rem; font-weight:700;
  font-size:1.4rem; letter-spacing:.5px; color:#1e1b4b;
  img{width:72px; height:72px; object-fit:contain;}
  span{background:linear-gradient(90deg,#6366f1,#4834d4); -webkit-background-clip:text; color:transparent;}
`;

const Nav = styled.nav`
  display:flex; align-items:center; gap:1.1rem;
  a{
    font-size:.8rem; font-weight:600; text-decoration:none;
    padding:.65rem .95rem; color:#1e293b; border-radius:10px;
    transition:.25s;
  }
  a:hover{background:#eef2ff; color:#312e81;}
`;

const PrimaryLink = styled(Link)`
  background:linear-gradient(135deg,#6366f1 0%,#4834d4 55%,#312e81 100%);
  color:#fff !important;
  box-shadow:0 6px 18px -6px rgba(72,52,212,.55);
  &:hover{filter:brightness(.94);}
`;

/* Hero / Banner */
const Banner = styled.section`
  position:relative;
  margin-top:88px;
  width:100%;
  min-height:540px;
  display:flex;
  align-items:stretch;
  justify-content:center;
  isolation:isolate;
  @media (max-width:780px){min-height:420px;}
  @media (max-width:560px){min-height:360px;}
  &:before{
    content:'';
    position:absolute; inset:0;
    background:
      linear-gradient(135deg,rgba(49,46,129,.85),rgba(72,52,212,.78),rgba(99,102,241,.6)),
      url(${banner}) center/cover no-repeat;
    filter:brightness(.9);
    z-index:-2;
  }
  &:after{
    content:'';
    position:absolute;
    left:0; right:0; bottom:-1px; height:140px;
    background:linear-gradient(to bottom,rgba(248,250,252,0), #f1f5f9 60%);
    pointer-events:none;
  }
`;

const HeroInner = styled.div`
  width:100%; max-width:1180px;
  display:flex; align-items:center; justify-content:space-between;
  gap:2.5rem; padding:3.8rem 2.25rem 2.8rem;
  @media (max-width:1080px){flex-direction:column; text-align:center;}
`;

const HeroText = styled.div`
  max-width:620px; color:#fff;
  h1{
    margin:0 0 1.15rem;
    font-size:clamp(2.3rem,5.2vw,3.3rem);
    line-height:1.05;
    letter-spacing:.5px;
    font-weight:800;
    background:linear-gradient(90deg,#fff,#e0e7ff);
    -webkit-background-clip:text; color:transparent;
  }
  p{
    margin:0 0 1.9rem;
    font-size:1.05rem; line-height:1.55rem;
    color:#edeefc; font-weight:500;
  }
`;

const CTAGroup = styled.div`
  display:flex; gap:.85rem; flex-wrap:wrap;
  position:relative;
  z-index:3; /* lift above gradient fade */
  a, button{
    cursor:pointer;
    border:none;
    font-weight:600;
    font-size:.8rem;
    letter-spacing:.5px;
    padding:.9rem 1.5rem;
    border-radius:16px;
    display:inline-flex;
    align-items:center;
    gap:.45rem;
    text-decoration:none;
    transition:.28s;
    line-height:1;
  }
`;

const SolidBtn = styled(Link)`
  background:linear-gradient(135deg,#7b7ef9 0%, #5b4ef1 45%, #3b36c7 100%);
  color:#ffffff;
  border:1px solid rgba(255,255,255,.55);
  box-shadow:
    0 8px 26px -8px rgba(60,54,210,.55),
    0 2px 4px -1px rgba(0,0,0,.35);
  text-shadow:0 1px 2px rgba(0,0,0,.35);
  backdrop-filter:saturate(140%) blur(2px);
  &:hover{
    transform:translateY(-3px);
    box-shadow:
      0 14px 34px -10px rgba(60,54,210,.65),
      0 4px 10px -2px rgba(0,0,0,.4);
    filter:brightness(1.05);
  }
  &:active{transform:translateY(-1px);}
  &:focus-visible{
    outline:2px solid #fff;
    outline-offset:3px;
  }
`;

const GhostBtn = styled(Link)`
  background:rgba(255,255,255,.30);
  color:#ffffff;
  border:1px solid rgba(255,255,255,.55);
  box-shadow:
    0 6px 22px -10px rgba(0,0,0,.55),
    0 0 0 1px rgba(255,255,255,.25) inset;
  backdrop-filter:blur(10px) saturate(160%);
  font-weight:600;
  text-shadow:0 1px 2px rgba(0,0,0,.35);
  &:hover{
    background:rgba(255,255,255,.42);
    transform:translateY(-3px);
  }
  &:active{transform:translateY(-1px);}
  &:focus-visible{
    outline:2px solid #fff;
    outline-offset:3px;
  }
`;

const FloatingBadge = styled.div`
  position:absolute;
  top:1.3rem; right:1.6rem;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  color:#fff; font-size:.6rem; letter-spacing:.6px;
  padding:.5rem .9rem;
  border-radius:999px;
  font-weight:700;
  display:inline-flex;
  box-shadow:0 6px 18px -6px rgba(16,185,129,.55);
  animation:pop .9s ease .2s both;
  @keyframes pop {
    0%{transform:translateY(-8px) scale(.85); opacity:0;}
    100%{transform:translateY(0) scale(1); opacity:1;}
  }
  @media (max-width:1080px){position:static;}
`;

/* Feature Section */
const FeaturesWrap = styled.section`
  width:100%; max-width:1180px; margin:0 auto;
  padding:3.5rem 2rem 3.6rem;
  display:grid;
  gap:1.8rem;
  grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
  position:relative;
`;

const FeatureCard = styled.div`
  position:relative;
  background:#ffffff;
  border:1px solid #e2e8f0;
  border-radius:22px;
  padding:1.45rem 1.35rem 1.55rem;
  display:flex; flex-direction:column; gap:.7rem;
  text-align:left;
  box-shadow:0 6px 20px -8px rgba(0,0,0,.07);
  overflow:hidden;
  &:before{
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(72,52,212,.08));
    opacity:0; transition:.35s;
  }
  &:hover:before{opacity:1;}
  h3{
    margin:0; font-size:1rem; font-weight:700; color:#1e293b;
    display:flex; align-items:center; gap:.55rem;
  }
  p{margin:0; font-size:.78rem; line-height:1.15rem; color:#475569; font-weight:500;}
`;

const IconBubble = styled.span`
  width:38px; height:38px; border-radius:14px;
  display:flex; align-items:center; justify-content:center;
  font-size:1.15rem; font-weight:600; color:#fff;
  background:linear-gradient(135deg,#6366f1,#4834d4);
  box-shadow:0 6px 20px -8px rgba(72,52,212,.55);
`;

/* Mission */
const MissionSection = styled.section`
  background:linear-gradient(135deg,#ffffff 0%,#eef2ff 60%,#e0e7ff 100%);
  padding:4rem 1.75rem 4.3rem;
  position:relative;
  overflow:hidden;
  &:before{
    content:'';
    position:absolute;
    top:-120px; right:-120px;
    width:340px; height:340px;
    background:radial-gradient(circle,#6366f1,#4834d4 60%);
    opacity:.15; filter:blur(20px);
  }
  &:after{
    content:'';
    position:absolute;
    bottom:-140px; left:-140px;
    width:340px; height:340px;
    background:radial-gradient(circle,#6366f1,#312e81 60%);
    opacity:.15; filter:blur(28px);
  }
`;

const MissionInner = styled.div`
  width:100%; max-width:860px; margin:0 auto;
  text-align:center; position:relative; z-index:1;
  h2{margin:0 0 1rem; font-size:1.85rem; font-weight:800;
    background:linear-gradient(90deg,#312e81,#4834d4,#6366f1);
    -webkit-background-clip:text; color:transparent;
  }
  p{
    margin:0 auto 1.85rem;
    font-size:1rem; line-height:1.55rem; max-width:640px;
    color:#334155; font-weight:500;
  }
  a{
    text-decoration:none;
    background:linear-gradient(135deg,#6366f1,#4834d4 55%,#312e81);
    padding:.85rem 1.35rem;
    color:#fff; font-size:.75rem; font-weight:600;
    border-radius:12px;
    letter-spacing:.5px;
    box-shadow:0 8px 24px -10px rgba(72,52,212,.55);
    transition:.28s;
  }
  a:hover{transform:translateY(-3px);}
`;

/* Footer */
const Footer = styled.footer`
  margin-top:auto;
  width:100%;
  background:#0f172a;
  color:#94a3b8;
  text-align:center;
  padding:1.4rem 1rem 1.1rem;
  font-size:.7rem;
  letter-spacing:.35px;
  position:relative;
  overflow:hidden;
  &:before{
    content:'';
    position:absolute; inset:0;
    background:
      radial-gradient(circle at 30% 30%,rgba(72,52,212,.35),transparent 60%),
      radial-gradient(circle at 70% 70%,rgba(99,102,241,.28),transparent 55%);
    opacity:.3;
  }
  span{position:relative; z-index:2;}
`;

const LandingPage = () => (
  <Page>
    <Header>
      <Logo>
        <Link to="/" style={{display:'flex',alignItems:'center',gap:'.55rem',textDecoration:'none',color:'inherit'}}>
          <img src={logo} alt="InvAi Logo"/>
          <span>InvAI</span>
        </Link>
      </Logo>
      <Nav>
  <Link to="/about">About</Link>
        <Link to="/signup">Sign Up</Link>
        <PrimaryLink to="/login">Log In</PrimaryLink>
      </Nav>
    </Header>

    <Banner>
      <HeroInner>
        <HeroText>
          <FloatingBadge>NEW • AI FORECASTS</FloatingBadge>
          <h1>Smarter School Inventory. Powered by AI + Community.</h1>
          <p>
            Predict shortages before they happen, let students & staff vote on what matters, and
            manage supplies with confidence—all in one unified platform.
          </p>
          <CTAGroup>
            <SolidBtn to="/signup">Get Started Free →</SolidBtn>
            <GhostBtn to="/login">Login</GhostBtn>
          </CTAGroup>
        </HeroText>
      </HeroInner>
    </Banner>

    <FeaturesWrap>
      <FeatureCard>
        <h3>
          <IconBubble>🤖</IconBubble>
          AI Predictions
        </h3>
        <p>Daily demand projections warn you before stockouts. Reduce wastage and plan smarter purchasing cycles.</p>
      </FeatureCard>
      <FeatureCard>
        <h3>
          <IconBubble style={{background:'linear-gradient(135deg,#22c55e,#16a34a)'}}>🗳️</IconBubble>
          Voting Insights
        </h3>
        <p>Community voting surfaces the most needed items so approvals stay transparent and data‑driven.</p>
      </FeatureCard>
      <FeatureCard>
        <h3>
          <IconBubble style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>📦</IconBubble>
          Bulk Excel Upload
        </h3>
        <p>Managers update hundreds of items with a single sheet—perfect for fast onboarding & periodic audits.</p>
      </FeatureCard>
      <FeatureCard>
        <h3>
          <IconBubble style={{background:'linear-gradient(135deg,#ec4899,#db2777)'}}>🔐</IconBubble>
          Role Controls
        </h3>
        <p>Granular roles (Student, Teacher, Staff, Manager, Admin) keep actions secure and responsibilities clear.</p>
      </FeatureCard>
    </FeaturesWrap>

    <MissionSection id="vision">
      <MissionInner>
        <h2>Reinventing Resource Stewardship</h2>
        <p>
          InvAI aligns predictive analytics with real campus input. By pairing AI consumption models and
          collaborative requests, schools gain visibility, accountability, and agility in their supply chain.
        </p>
        <a href="/signup">Start Transforming →</a>
      </MissionInner>
    </MissionSection>

    <Footer>
      <span>&copy; {new Date().getFullYear()} InvAI — All Rights Reserved.</span>
    </Footer>
  </Page>
);

export default LandingPage;