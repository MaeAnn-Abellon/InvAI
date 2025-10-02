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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import lpage1 from '../assets/lpage.png';
import lpage2 from '../assets/lpage2.png';
import lpage3 from '../assets/lpage3.png';
import lpage4 from '../assets/lpage4.png';
import lpage5 from '../assets/lpage5.png';
import { useAuth } from '../context/useAuth';
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const LeftSection = styled.div`
  flex: 1;
  background-color: #E6EEFF;
  padding: 0;
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  min-height: 100vh;
  overflow: hidden;
`;

const ImageBg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ $visible }) => ($visible ? 0.8 : 0)};
  z-index: 1;
  transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1);
  pointer-events: none;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* push title to top, dots to bottom */
  align-items: center;
`;

const TopBar = styled.div`
  width: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: center; /* center title horizontally at the top */
`;

const BottomBar = styled.div`
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: center; /* center dots at the bottom */
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 16px rgba(0,0,0,0.45);
  margin: 0; /* no background */
  z-index: 3;
  text-align: center;
  letter-spacing: 1px;
`;

const Dots = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  z-index: 3;
`;

const Dot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) => ($active ? '#fff' : '#b3b3b3')};
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
`;

const RightSection = styled.div`
  flex: 1;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
  color: #1a1a1a;
`;

const Form = styled.form`
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #F0F2F7;
  font-size: 1rem;

  &::placeholder {
    color: #666;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #4834d4;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #F0F2F7;
  font-size: 1rem;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #4834d4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #372aaa;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-align: center;
`;

const SignUpText = styled.p`
  text-align: right;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;

  a {
    color: #4834d4;
    font-weight: 500;
    margin-left: 0.25rem;
  }
`;

const ForgotPasswordText = styled.p`
  text-align: right;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  
  a {
    color: #666;
    font-size: 0.9rem;
    text-decoration: none;
    
    &:hover {
      color: #4834d4;
    }
  }
`;

const images = [lpage1, lpage2, lpage3, lpage4, lpage5];

const Login = () => {
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    role: 'student',
  });

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (idx) => setCurrent(idx);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.emailOrUsername.trim()) {
      setError('Email or username is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    setIsLoading(true);
    try {
      const u = await login({
        emailOrUsername: formData.emailOrUsername.trim(),
        password: formData.password
      });
      // Navigate to role-specific dashboard
      navigate(getDashboardPath(u.role));
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <LeftSection>
        {images.map((img, idx) => (
          <ImageBg
            key={idx}
            src={img}
            alt={`Slideshow ${idx + 1}`}
            $visible={current === idx}
            aria-hidden={current !== idx}
          />
        ))}
        <Overlay>
          <TopBar>
            <Title>Welcome to InvAI</Title>
          </TopBar>
          <BottomBar>
            <Dots>
              {images.map((_, idx) => (
                <Dot
                  key={idx}
                  $active={current === idx}
                  onClick={() => handleDotClick(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </Dots>
          </BottomBar>
        </Overlay>
      </LeftSection>
      <RightSection>
        <Form onSubmit={handleSubmit}>
          <FormTitle>USER LOGIN</FormTitle>
          <SignUpText>
            <Link to="/signup">Sign Up</Link>
          </SignUpText>
          <Input
            type="text"
            name="emailOrUsername"
            placeholder="Email or username"
            value={formData.emailOrUsername}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Select
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
          <ForgotPasswordText>
            <Link to="/forgot-password">Forgot Password?</Link>
          </ForgotPasswordText>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'LOGIN'}
          </LoginButton>
        </Form>
      </RightSection>
    </Container>
  );
};

export default Login;