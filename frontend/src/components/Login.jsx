// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import styled from '@emotion/styled';
// import lpage from '../assets/lpage.png';

// const Container = styled.div`
//   display: flex;
//   min-height: 100vh;
// `;

// const LeftSection = styled.div`
//   flex: 1;
//   background-color: #E6EEFF;
//   padding: 4rem;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
// `;

// const RightSection = styled.div`
//   flex: 1;
//   padding: 4rem;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
// `;

// const Title = styled.h1`
//   font-size: 2.5rem;
//   font-weight: bold;
//   margin-bottom: 1rem;
//   color: #1a1a1a;
// `;

// const Description = styled.p`
//   font-size: 1.1rem;
//   color: #4a4a4a;
//   margin-bottom: 2rem;
//   line-height: 1.6;
//   max-width: 500px;
//   font-style: italic;
// `;

// const FormTitle = styled.h2`
//   font-size: 1.5rem;
//   font-weight: 600;
//   margin-bottom: 2rem;
//   text-align: center;
//   color: #1a1a1a;
// `;

// const Form = styled.form`
//   max-width: 400px;
//   margin: 0 auto;
//   width: 100%;
// `;

// const Input = styled.input`
//   width: 100%;
//   padding: 0.75rem;
//   margin-bottom: 1rem;
//   border: none;
//   border-radius: 4px;
//   background-color: #F0F2F7;
//   font-size: 1rem;

//   &::placeholder {
//     color: #666;
//   }

//   &:focus {
//     outline: none;
//     box-shadow: 0 0 0 2px #4834d4;
//   }
// `;

// const LoginButton = styled.button`
//   width: 100%;
//   padding: 0.75rem;
//   background: #4834d4;
//   color: white;
//   border: none;
//   border-radius: 4px;
//   font-size: 1rem;
//   font-weight: 500;
//   cursor: pointer;
//   margin-top: 1rem;
//   transition: background 0.2s;

//   &:hover {
//     background: #372aaa;
//   }
// `;

// const SignUpText = styled.p`
//   text-align: right;
//   margin-bottom: 1rem;
//   color: #666;
//   font-size: 0.9rem;

//   a {
//     color: #4834d4;
//     font-weight: 500;
//     margin-left: 0.25rem;
//   }
// `;

// const ForgotPasswordText = styled.p`
//   text-align: right;
//   margin-top: 0.5rem;
//   margin-bottom: 1rem;
  
//   a {
//     color: #666;
//     font-size: 0.9rem;
//     text-decoration: none;
    
//     &:hover {
//       color: #4834d4;
//     }
//   }
// `;

// const Illustration = styled.img`
//   max-width: 300px;
//   margin-bottom: 2rem;
// `;

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     emailOrUsername: '',
//     password: ''
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Here you would typically make an API call to verify credentials
//     // For now, we'll just simulate a successful login
//     console.log('Form submitted:', formData);
    
//     // Navigate to dashboard after successful login
//     navigate('/dashboard');
//   };

//   return (
//     <Container>
//       <LeftSection>
//         <Title>Welcome to InvAI</Title>
//         <Description>
//           Empowering students, teachers, and staff with a seamless
//           way to request and manage essential equipment. Your
//           voice matters—vote for what you need, and let us handle
//           the rest. Stay organized, stay efficient, with SmartStock!
//         </Description>
//         <Illustration 
//           src={lpage} 
//           alt="Inventory Management Illustration" 
//         />
//       </LeftSection>
//       <RightSection>
//         <Form onSubmit={handleSubmit}>
//           <FormTitle>USER LOGIN</FormTitle>
//           <SignUpText>
//             {/* Don't have an account yet? */}
//             <Link to="/signup">Sign Up</Link>
//           </SignUpText>
//           <Input
//             type="text"
//             name="emailOrUsername"
//             placeholder="Email or username"
//             value={formData.emailOrUsername}
//             onChange={handleChange}
//             required
//           />
//           <Input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />
//           <ForgotPasswordText>
//             <Link to="/forgot-password">Forgot Password?</Link>
//           </ForgotPasswordText>
//           <LoginButton type="submit">LOGIN</LoginButton>
//         </Form>
//       </RightSection>
//     </Container>
//   );
// };

// export default Login; 

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import logo from '../assets/Inv.png';
import { useAuth } from '../context/useAuth';
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  /* Inherit global Roboto font */
  background:#f1f5f9;
  overflow: hidden;
`;
/* LEFT (Form) */
const FormSide = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  justify-content:center;
  padding:4.2rem 3.4rem 3.6rem 3.6rem;
  background:#ffffff;
  position:relative;
  box-shadow: 4px 0 24px -12px rgba(15,23,42,.10);
`;

const BrandTiny = styled.div`
  display:flex; align-items:center; gap:.55rem; margin:0 0 2.4rem;
  img{width:56px;height:56px;object-fit:contain; filter:drop-shadow(0 4px 10px rgba(0,0,0,.25));}
  h1{margin:0;font-size:1.85rem;font-weight:800;letter-spacing:.6px;background:linear-gradient(90deg,#312e81,#4834d4,#6366f1);-webkit-background-clip:text;color:transparent;}
`;

const SubNote = styled.p`
  margin:-1.2rem 0 2.2rem; font-size:.72rem; letter-spacing:.45px; font-weight:600; color:#64748b; text-transform:uppercase;
`;

/* RIGHT (Animated Visual) */
const VisualSide = styled.div`
  flex:1;
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  background:linear-gradient(135deg,#312e81,#4834d4 55%,#6366f1);
  isolation:isolate;
  &:before, &:after {content:''; position:absolute; border-radius:50%; filter:blur(70px); opacity:.55; animation: floaty 11s linear infinite; mix-blend-mode:screen;}
  &:before {width:520px;height:520px;background:radial-gradient(circle,#6366f1,#4834d4 60%); top:-140px; left:-160px; animation-duration:13s;}
  &:after {width:480px;height:480px;background:radial-gradient(circle,#6366f1,#312e81 60%); bottom:-160px; right:-140px; animation-direction:reverse;}
  @keyframes floaty {0%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-40px) rotate(120deg);}100%{transform:translateY(0) rotate(360deg);}}
`;

const PulseRing = styled.div`
  position:absolute; width:340px; height:340px; border-radius:50%;
  background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.55),rgba(255,255,255,0) 70%);
  opacity:.28;
  animation:pulse 6s ease-in-out infinite;
  @keyframes pulse {0%,100%{transform:scale(.9);}50%{transform:scale(1.08);}}
`;

const VisualCopy = styled.div`
  position:relative; z-index:2; text-align:center; max-width:480px; padding:2rem; color:#fff;
  h2{margin:0 0 1.2rem;font-size:clamp(1.9rem,3.8vw,2.6rem);font-weight:800;line-height:1.08;background:linear-gradient(90deg,#fff,#e0e7ff);-webkit-background-clip:text;color:transparent;}
  p{margin:0;font-size:.9rem;line-height:1.45rem;font-weight:500;color:#edeefc;letter-spacing:.3px;}
`;

/* FORM CARD */
const RightSection = styled.div``; /* placeholder removed old naming */

const FormCard = styled.form`
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 8px 28px -8px rgba(15,23,42,0.25), 0 2px 6px -2px rgba(0,0,0,0.15);
  border-radius: 28px;
  padding: 2.4rem 2.2rem 2.6rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(140deg, rgba(99,102,241,0.12), rgba(72,52,212,0.10));
    opacity: 0;
    transition: .35s;
    pointer-events: none;
  }
  &:hover:before { opacity: 1; }
`;

const FormTitle = styled.h2`
  font-size: 1.55rem;
  font-weight: 800;
  margin: 0 0 1.85rem;
  text-align: center;
  letter-spacing: .6px;
  background: linear-gradient(90deg,#312e81,#4834d4,#6366f1);
  -webkit-background-clip: text;
  color: transparent;
`;

const Input = styled.input`
  width:100%;
  padding:0.85rem 0.95rem;
  margin-bottom:0.9rem;
  border:1px solid #e2e8f0;
  border-radius:14px;
  background:#ffffffcc;
  font-size:.9rem;
  font-weight:500;
  letter-spacing:.3px;
  color:#0f172a;
  transition:.28s;
  box-shadow:0 1px 2px rgba(0,0,0,0.04);
  &::placeholder{color:#64748b;font-weight:400;}
  &:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.35),0 2px 6px -2px rgba(72,52,212,.35);background:#fff;}
`;
// Role select removed – role inferred from server response.
const LoginButton = styled.button`
  width:100%;
  padding:0.95rem 1.1rem;
  background:linear-gradient(135deg,#7b7ef9 0%, #5b4ef1 45%, #3b36c7 100%);
  color:#ffffff;
  border:1px solid rgba(255,255,255,.55);
  border-radius:18px;
  font-size:.85rem;
  font-weight:700;
  letter-spacing:.6px;
  cursor:pointer;
  margin-top:.35rem;
  transition:.32s;
  box-shadow:0 8px 26px -8px rgba(60,54,210,.55),0 2px 4px -1px rgba(0,0,0,.20);
  text-shadow:0 1px 2px rgba(0,0,0,.35);
  backdrop-filter:saturate(140%) blur(2px);
  &:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 14px 34px -10px rgba(60,54,210,.65),0 4px 10px -2px rgba(0,0,0,.35);filter:brightness(1.05);} 
  &:active{transform:translateY(-1px);} 
  &:disabled{filter:grayscale(.4); opacity:.7; cursor:not-allowed;} 
  &:focus-visible{outline:2px solid #fff; outline-offset:3px;}
`;
const ErrorMessage = styled.div`
  color:#dc2626; background:#fef2f2; border:1px solid #fee2e2; border-radius:14px; padding:.8rem .9rem; margin:0 0 .85rem; font-size:.7rem; font-weight:600; text-align:center; letter-spacing:.35px; box-shadow:0 1px 2px rgba(0,0,0,.05);
`;
const SignUpText = styled.p`
  text-align:center; margin:.9rem 0 0; color:#475569; font-size:.65rem; font-weight:500; letter-spacing:.45px; a{color:#4834d4; font-weight:700; margin-left:.25rem; text-decoration:none;} a:hover{text-decoration:underline;}
`;
const ForgotPasswordText = styled.p`
  text-align:right; margin:.15rem 0 .75rem; a{color:#64748b; font-size:.6rem; font-weight:600; text-decoration:none; letter-spacing:.4px; transition:.25s;} a:hover{color:#4834d4;}
`;

const Login = () => {
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ emailOrUsername:'', password:'' });

  const handleChange = (e) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if(!formData.emailOrUsername.trim()) { setError('Email or username is required'); return; }
    if(!formData.password) { setError('Password is required'); return; }
    setIsLoading(true);
    try {
      const u = await login({ emailOrUsername: formData.emailOrUsername.trim(), password: formData.password });
      navigate(getDashboardPath(u.role));
    } catch(err){
      setError(err.message || 'Login failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <Container>
      <FormSide>
        <BrandTiny>
          <img src={logo} alt="InvAI" />
          <h1>InvAI</h1>
        </BrandTiny>
        <SubNote>Secure Access Portal</SubNote>
        <FormCard onSubmit={handleSubmit} noValidate>
          <FormTitle>Log In</FormTitle>
          <Input type="text" name="emailOrUsername" placeholder="Email or username" value={formData.emailOrUsername} onChange={handleChange} autoComplete="username" required />
          <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} autoComplete="current-password" required />
          {/* Role selection removed; backend assigns correct role. */}
          <ForgotPasswordText><Link to="/forgot-password">Forgot Password?</Link></ForgotPasswordText>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <LoginButton type="submit" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Log In'}</LoginButton>
          <SignUpText>Need an account?<Link to="/signup"> Create one</Link></SignUpText>
        </FormCard>
      </FormSide>
      <VisualSide>
        <PulseRing />
        <VisualCopy>
          <h2>Predict • Prioritize • Provide</h2>
          <p>Real-time forecasts and community-driven requests keep essential learning resources available when they matter most.</p>
        </VisualCopy>
      </VisualSide>
    </Container>
  );
};

export default Login;