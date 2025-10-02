import React from 'react';
import { useAuth } from '@/context/useAuth';
import UserDashboard from './UserDashboard';

const RoleDashboard = () => {
  const { user } = useAuth();
  
  if (!user) return <div>Loading...</div>;
  
  const role = user.role;

  if (role === 'student' || role === 'teacher' || role === 'staff') return <UserDashboard />;
  if (role === 'manager') return <div style={{padding:'1rem'}}>Redirecting to manager dashboard...</div>;
  if (role === 'admin') return <div style={{padding:'1rem'}}>Redirecting to admin dashboard...</div>;
  return <UserDashboard />;
};

export default RoleDashboard;