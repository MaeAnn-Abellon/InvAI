import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
// Removed slideshow assets for simplified auth layout
import logo from '../assets/Inv.png';
import { useAuth } from '../context/useAuth';


const Container = styled.div`
  display:flex; min-height:100vh; background:#f1f5f9; overflow:hidden;
`;
/* Left: Form side (mirrors Login) */
const FormSide = styled.div`
  flex:1; display:flex; flex-direction:column; justify-content:center; padding:4.2rem 3.4rem 3.6rem 3.6rem; background:#ffffff; position:relative; box-shadow:4px 0 24px -12px rgba(15,23,42,.10);
`;
const BrandTiny = styled.div`
  display:flex; align-items:center; gap:.55rem; margin:0 0 2.4rem; img{width:56px;height:56px;object-fit:contain; filter:drop-shadow(0 4px 10px rgba(0,0,0,.25));} h1{margin:0;font-size:1.85rem;font-weight:800;letter-spacing:.6px;background:linear-gradient(90deg,#312e81,#4834d4,#6366f1);-webkit-background-clip:text;color:transparent;}
`;
const SubNote = styled.p`
  margin:-1.2rem 0 2.2rem; font-size:.72rem; letter-spacing:.45px; font-weight:600; color:#64748b; text-transform:uppercase;
`;
/* Right: Animated visual side */
const VisualSide = styled.div`
  flex:1; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; background:linear-gradient(135deg,#312e81,#4834d4 55%,#6366f1); isolation:isolate;
  &:before, &:after {content:''; position:absolute; border-radius:50%; filter:blur(70px); opacity:.55; animation:floaty 11s linear infinite; mix-blend-mode:screen;}
  &:before {width:520px;height:520px;background:radial-gradient(circle,#6366f1,#4834d4 60%); top:-140px; left:-160px; animation-duration:13s;}
  &:after {width:480px;height:480px;background:radial-gradient(circle,#6366f1,#312e81 60%); bottom:-160px; right:-140px; animation-direction:reverse;}
  @keyframes floaty {0%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-40px) rotate(120deg);}100%{transform:translateY(0) rotate(360deg);}}
`;
const PulseRing = styled.div`
  position:absolute; width:340px; height:340px; border-radius:50%; background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.55),rgba(255,255,255,0) 70%); opacity:.28; animation:pulse 6s ease-in-out infinite; @keyframes pulse {0%,100%{transform:scale(.9);}50%{transform:scale(1.08);}}
`;
const VisualCopy = styled.div`
  position:relative; z-index:2; text-align:center; max-width:500px; padding:2rem; color:#fff; h2{margin:0 0 1.2rem;font-size:clamp(1.9rem,3.8vw,2.6rem);font-weight:800;line-height:1.08;background:linear-gradient(90deg,#fff,#e0e7ff);-webkit-background-clip:text;color:transparent;} p{margin:0;font-size:.9rem;line-height:1.45rem;font-weight:500;color:#edeefc;letter-spacing:.3px;}
`;

/* Removed original marketing left section & feature list to mirror Login layout */
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
const FormCard = styled.form`
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 8px 28px -8px rgba(15,23,42,0.25), 0 2px 6px -2px rgba(0,0,0,0.15);
  border-radius: 32px;
  padding: 2.4rem 2.4rem 2.6rem;
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
const Input = styled.input`
  width: 100%;
  padding: 0.85rem 0.95rem;
  margin-bottom: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffffcc;
  font-size: .9rem;
  font-weight: 500;
  letter-spacing: .3px;
  color: #0f172a;
  transition: .28s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  &::placeholder { color: #64748b; font-weight: 400; }
  &:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.35), 0 2px 6px -2px rgba(72,52,212,.35); background:#fff; }
`;
const Select = styled.select`
  width: 100%;
  padding: 0.85rem 0.95rem;
  margin-bottom: 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffffcc;
  font-size: .9rem;
  font-weight: 500;
  color: #0f172a;
  letter-spacing: .3px;
  transition: .28s;
  &:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.35), 0 2px 6px -2px rgba(72,52,212,.35); background:#fff; }
`;
const PrimaryButton = styled.button`
  width: 100%;
  padding: 0.95rem 1.1rem;
  background: linear-gradient(135deg,#7b7ef9 0%, #5b4ef1 45%, #3b36c7 100%);
  color: #ffffff;
  border: 1px solid rgba(255,255,255,.55);
  border-radius: 20px;
  font-size: .85rem;
  font-weight: 700;
  letter-spacing: .6px;
  cursor: pointer;
  margin-top: .35rem;
  transition: .32s;
  box-shadow: 0 8px 26px -8px rgba(60,54,210,.55), 0 2px 4px -1px rgba(0,0,0,.20);
  text-shadow: 0 1px 2px rgba(0,0,0,.35);
  backdrop-filter: saturate(140%) blur(2px);
  &:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 14px 34px -10px rgba(60,54,210,.65), 0 4px 10px -2px rgba(0,0,0,.35); filter: brightness(1.05); }
  &:active { transform: translateY(-1px); }
  &:disabled { filter: grayscale(.4); opacity:.7; cursor:not-allowed; }
  &:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
`;
const SmallText = styled.p`
  text-align: center;
  margin: 1.25rem 0 0;
  color: #475569;
  font-size: .7rem;
  font-weight: 500;
  letter-spacing: .45px;
  a { color: #4834d4; font-weight: 700; margin-left: 0.25rem; text-decoration:none; }
  a:hover { text-decoration: underline; }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 14px;
  padding: 0.85rem .95rem;
  margin: 0 0 .85rem;
  font-size: .7rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: .35px;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
`;

// Slideshow removed

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
  // Removed slideshow state
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

  // Slideshow effect & handler removed

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
      <FormSide>
        <BrandTiny>
          <img src={logo} alt="InvAI" />
          <h1>InvAI</h1>
        </BrandTiny>
        <SubNote>Create Account</SubNote>
        <FormCard onSubmit={handleSubmit} noValidate>
          <FormTitle>Sign Up</FormTitle>
          <Input type="text" name="fullName" placeholder="Full name" value={formData.fullName} onChange={handleChange} autoComplete="name" required />
          <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} autoComplete="email" required />
          <Input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} autoComplete="username" required />
          <Select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </Select>
          {renderStudentFields()}
          {renderTeacherFields()}
          {renderStaffFields()}
          {renderManagerFields()}
          <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} autoComplete="new-password" required />
            <Input type="password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <PrimaryButton type="submit" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Sign Up'}</PrimaryButton>
          <SmallText>Already have an account?<Link to="/login"> Log in</Link></SmallText>
        </FormCard>
      </FormSide>
      <VisualSide>
        <PulseRing />
        <VisualCopy>
          <h2>Collaborate & Forecast</h2>
          <p>Join the platform that blends predictive inventory intelligence with real community needs—request, vote and keep supplies flowing.</p>
        </VisualCopy>
      </VisualSide>
    </Container>
  );
};

export default Signup;