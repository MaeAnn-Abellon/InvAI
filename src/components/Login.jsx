import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import lpage from '../assets/lpage.png';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const LeftSection = styled.div`
  flex: 1;
  background-color: #E6EEFF;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const RightSection = styled.div`
  flex: 1;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1a1a1a;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #4a4a4a;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 500px;
  font-style: italic;
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

  &:hover {
    background: #372aaa;
  }
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

const Illustration = styled.img`
  max-width: 300px;
  margin-bottom: 2rem;
`;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to verify credentials
    // For now, we'll just simulate a successful login
    console.log('Form submitted:', formData);
    
    // Navigate to dashboard after successful login
    navigate('/dashboard');
  };

  return (
    <Container>
      <LeftSection>
        <Title>Welcome to SmartStock</Title>
        <Description>
          Empowering students, teachers, and staff with a seamless
          way to request and manage essential equipment. Your
          voice matters—vote for what you need, and let us handle
          the rest. Stay organized, stay efficient, with SmartStock!
        </Description>
        <Illustration 
          src={lpage} 
          alt="Inventory Management Illustration" 
        />
      </LeftSection>
      <RightSection>
        <Form onSubmit={handleSubmit}>
          <FormTitle>USER LOGIN</FormTitle>
          <SignUpText>
            Don't have an account yet?
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
          <ForgotPasswordText>
            <Link to="/forgot-password">Forgot Password?</Link>
          </ForgotPasswordText>
          <LoginButton type="submit">LOGIN</LoginButton>
        </Form>
      </RightSection>
    </Container>
  );
};

export default Login; 