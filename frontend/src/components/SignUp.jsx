import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  position: relative;
  display: flex;
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
  justify-content: space-between;
  align-items: center;
`;
const TopBar = styled.div`
  width: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: center;
`;
const BottomBar = styled.div`
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
`;
const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 16px rgba(0,0,0,0.45);
  margin: 0;
  text-align: center;
  letter-spacing: 1px;
`;
const Dots = styled.div`
  display: flex;
  gap: 0.5rem;
`;
const Dot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) => ($active ? '#fff' : '#b3b3b3')};
  cursor: pointer;
  transition: background 0.2s;
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
  max-width: 480px;
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
  &::placeholder { color: #666; }
  &:focus { outline: none; box-shadow: 0 0 0 2px #4834d4; }
`;
const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #F0F2F7;
  font-size: 1rem;
  &:focus { outline: none; box-shadow: 0 0 0 2px #4834d4; }
`;
const PrimaryButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #4834d4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
  &:hover:not(:disabled) { background: #372aaa; }
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;
const SmallText = styled.p`
  text-align: right;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
  a { color: #4834d4; font-weight: 500; margin-left: 0.25rem; }
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

const images = [lpage1, lpage2, lpage3, lpage4, lpage5];

// Updated college course/program list per request
const collegeDepartments = [
  'BSIT','BSED','BEED','BPED','BSHM','BSENTREP'
];
const seniorHighStrands = [
  'STEM','ABM','HUMSS','GAS','TVL-ICT','TVL-HE'
];
const sections = ['A','B','C','D','E'];

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'student',          // student | teacher | staff | manager
    studentId: '',
    studentLevel: 'college',  // student level (maps to department column)
    managerLevel: 'college',  // manager level (maps to department column)
    level: 'college',         // generic level where needed (teacher/staff fixed college)
    course: '',               // program or strand-section (goes to course column)
    strand: '',
    section: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (idx) => setCurrent(idx);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(s => {
      const next = { ...s, [name]: value };
      // Reset dependent fields when switching role / level
      if (['studentLevel','managerLevel','role'].includes(name)) {
        next.course = '';
        next.strand = '';
        next.section = '';
        if (name === 'role' && value !== 'student') next.studentId = '';
        if (name === 'role' && value !== 'manager') next.managerLevel = 'college';
        if (name === 'role' && (value === 'teacher' || value === 'staff')) next.level = 'college';
      }
      return next;
    });
  };

  const validateDynamic = () => {
    if (formData.role === 'student') {
      if (formData.studentLevel === 'college' && !formData.course) return false;
      if (formData.studentLevel === 'senior_high' && (!formData.strand || !formData.section)) return false;
      if (!formData.studentId.trim()) return false;
    }
    if (formData.role === 'teacher') {
      // Teacher now forced to college level; course may still be required if you want.
      if (!formData.course) return false; // keep requirement for college program
    }
    if (formData.role === 'staff') {
      // Staff no longer needs course/program selection
    }
    if (formData.role === 'manager') {
      if (formData.managerLevel === 'college' && !formData.course) return false;
      if (formData.managerLevel === 'senior_high' && (!formData.strand || !formData.section)) return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (formData.password.length < 3) {
      setError('Password must be at least 3 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!validateDynamic()) {
      setError('Please complete all required fields for the selected role/level.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Prepare data for backend
      const signupData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role,
        level: 'college', // default, may override below
        course: null,
        studentId: formData.studentId || null
      };

      // Set course/department based on role and level
      if (formData.role === 'student') {
        if (formData.studentLevel === 'college') {
          signupData.level = 'college';
          signupData.course = formData.course;
        } else if (formData.studentLevel === 'senior_high') {
          signupData.level = 'senior_high';
          signupData.course = `${formData.strand}-${formData.section}`;
        }
      } else if (formData.role === 'manager') {
        if (formData.managerLevel === 'college') {
          signupData.level = 'college';
          signupData.course = formData.course;
        } else if (formData.managerLevel === 'senior_high') {
          signupData.level = 'senior_high';
          signupData.course = `${formData.strand}-${formData.section}`;
        }
      } else if (formData.role === 'teacher') {
        signupData.level = 'college';
        signupData.course = formData.course; // still collecting program for teachers
      } else if (formData.role === 'staff') {
        signupData.level = 'college';
        // staff no longer supplies course; leave null
      }

      await signup(signupData);
      // Show success message before redirecting
      alert('Account created successfully! Please log in with your credentials.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* Role-specific UI blocks */

  const renderStudentFields = () => {
    if (formData.role !== 'student') return null;
    return (
      <>
        <Select
          name="studentLevel"
          value={formData.studentLevel}
          onChange={handleChange}
        >
          <option value="college">College (Department)</option>
          <option value="senior_high">Senior High (Strand & Section)</option>
        </Select>

        {formData.studentLevel === 'college' && (
          <Select
            name="course"
            value={formData.course}
            onChange={handleChange}
          >
            <option value="">Select Course / Program</option>
            {collegeDepartments.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
        )}

        {formData.studentLevel === 'senior_high' && (
          <>
            <Select
              name="strand"
              value={formData.strand}
              onChange={handleChange}
            >
              <option value="">Select Strand</option>
              {seniorHighStrands.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select
              name="section"
              value={formData.section}
              onChange={handleChange}
            >
              <option value="">Select Section</option>
              {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </Select>
          </>
        )}

        <Input
          type="text"
          name="studentId"
          placeholder="Student ID"
          value={formData.studentId}
          onChange={handleChange}
          required
        />
      </>
    );
  };

  const renderTeacherFields = () => {
    if (formData.role !== 'teacher') return null;
    return (
      <>
        {/* Fixed level selector (only college) to mirror manager style but restricted */}
        <Select
          name="level"
          value={formData.level}
          onChange={handleChange}
          disabled
        >
          <option value="college">College</option>
        </Select>
        <Select
          name="course"
          value={formData.course}
          onChange={handleChange}
        >
          <option value="">Select Course / Program (Teacher)</option>
          {collegeDepartments.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
      </>
    );
  };

  const renderStaffFields = () => {
    if (formData.role !== 'staff') return null;
    // No course/program selection for staff now; keep placeholder for layout consistency if desired.
    return null;
  };

  const renderManagerFields = () => {
    if (formData.role !== 'manager') return null;
    return (
      <>
        <Select
          name="managerLevel"
          value={formData.managerLevel}
          onChange={handleChange}
        >
          <option value="college">College (Department)</option>
          <option value="senior_high">Senior High (Strand & Section)</option>
        </Select>

        {formData.managerLevel === 'college' && (
          <Select
            name="course"
            value={formData.course}
            onChange={handleChange}
          >
            <option value="">Select Course / Program (Manager)</option>
            {collegeDepartments.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
        )}

        {formData.managerLevel === 'senior_high' && (
          <>
            <Select
              name="strand"
              value={formData.strand}
              onChange={handleChange}
            >
              <option value="">Select Strand</option>
              {seniorHighStrands.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select
              name="section"
              value={formData.section}
              onChange={handleChange}
            >
              <option value="">Select Section</option>
              {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </Select>
          </>
        )}
      </>
    );
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
          <TopBar><Title>Welcome to InvAI</Title></TopBar>
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
          <FormTitle>CREATE ACCOUNT</FormTitle>

            <Input
              type="text"
              name="fullName"
              placeholder="Full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </Select>

            {renderStudentFields()}
            {renderTeacherFields()}
            {renderStaffFields()}
            {renderManagerFields()}

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'SIGN UP'}
            </PrimaryButton>

            <SmallText>
              Already have an account?
              <Link to="/login"> Log in</Link>
            </SmallText>
        </Form>
      </RightSection>
    </Container>
  );
};

export default Signup;