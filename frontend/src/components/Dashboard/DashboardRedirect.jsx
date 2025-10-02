import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

// Lazy load the unified UserDashboard to avoid any potential circular import issues
const UserDashboard = React.lazy(() => import('./UserDashboard'));

const DashboardRedirect = () => {
  const { user, loading, getDashboardPath } = useAuth();

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // If no user and not loading, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // For student / teacher / staff roles, render the unified UserDashboard directly
  if (['student','teacher','staff'].includes(user.role)) {
    return (
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Loading dashboard...
        </div>
      }>
        <UserDashboard />
      </Suspense>
    );
  }

  // For other roles (manager/admin), redirect to their specific dashboard
  try {
    const dashboardPath = getDashboardPath(user.role);
    // Safety: avoid redirect loop if path already /dashboard
    if (dashboardPath === '/dashboard') {
      return (
        <Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'50vh',fontSize:'1.2rem',color:'#666'}}>Loading dashboard...</div>}>
          <UserDashboard />
        </Suspense>
      );
    }
    return <Navigate to={dashboardPath} replace />;
  } catch (error) {
    console.error('Error getting dashboard path:', error);
    return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;