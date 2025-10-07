import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RequireRole from '@/routes/RequireRole';

import AppLayout from '@/components/layout/AppLayout';

import ManageRequests from '@/pages/requests/ManageRequests';
import NewRequestPage from '@/pages/requests/NewRequestPage';
import VotingBoardPage from '@/pages/voting/VotingBoardPage';
import InventoryOverview from '@/pages/inventory/InventoryOverview';
import Reports from '@/pages/inventory/Reports';
import UserManagement from '@/pages/users/UserManagement';
import Notifications from '@/pages/notifications/Notifications';
import Profile from '@/pages/profile/Profile';
import Login from '@/components/Login';
// NOTE: Case-sensitive path fix for Linux/Vercel: file is SignUp.jsx (not Signup.jsx)
import Signup from '@/components/SignUp';
import InventoryRoute from '@/pages/inventory/InventoryRoute';
import Landing from '@/components/LandingPage';  
import ManagerForecasts from '@/pages/manager/ManagerForecasts';
import ManagerReports from '@/pages/manager/ManagerReports';
import ManagerAuditLog from '@/pages/manager/ManagerAuditLog';
import ManagerRequests from './pages/requests/ManageRequests';
import ManagerDashboard from './pages/manager/Dashboard';
import InventoryPage from './pages/manager/InventoryPage';
import AdminDashboard from './pages/admin/AdminDashboardPage';
import AdminInventoryDashboard from './pages/admin/AdminInventoryDashboard.jsx';
import ManagerClaims from './pages/manager/ManagerClaims';
import EquipmentReturns from './pages/manager/EquipmentReturns';
import ManagerVotingPage from './pages/manager/ManagerVotingPage';
import AboutApp from './pages/about/AboutApp';
// (Removed direct dashboard component import; Dashboard route uses lazy UserDashboard via DashboardRedirect)
import DashboardRedirect from '@/components/Dashboard/DashboardRedirect';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} /> {/* <-- ADDED landing page */}
          <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          {/* Public About page accessible without auth */}
          <Route path="/about" element={<AboutApp />} />
          <Route path="/aboutapp" element={<AboutApp />} />

          {/* Protected app */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/requests" element={<NewRequestPage />} />
              <Route path="/voting" element={<VotingBoardPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/manage-requests" element={
                <RequireRole roles={['manager','admin']}>
                  <ManageRequests />
                </RequireRole>
              }/>
              <Route path="/inventory" element={
                <RequireRole roles={['manager','teacher','staff']}>
                  <InventoryRoute />
                </RequireRole>
              }/>
              <Route path="/inventory-overview" element={
                <RequireRole roles={['admin']}>
                  <InventoryOverview />
                </RequireRole>
              }/>
              <Route path="/reports" element={
                <RequireRole roles={['manager','admin']}>
                  <Reports />
                </RequireRole>
              }/>
              <Route path="/user-management" element={
                <RequireRole roles={['admin']}>
                  <UserManagement />
                </RequireRole>
              }/>
              <Route path="/manager/requests" element={
                <RequireRole roles={['manager']}>
                  <ManagerRequests />
                </RequireRole>
              } />
              <Route path="/manager/ai-forecasts" element={
                <RequireRole roles={['manager']}>
                  <ManagerForecasts />
                </RequireRole>
              } />
              <Route path="/manager/reports" element={
                <RequireRole roles={['manager']}>
                  <ManagerReports />
                </RequireRole>
              } />
              <Route path="/manager/audit-log" element={
                <RequireRole roles={['manager']}>
                  <ManagerAuditLog />
                </RequireRole>
              } />
              <Route path="/manager/dashboard" element={
                <RequireRole roles={['manager']}>
                  <ManagerDashboard />
                </RequireRole>
              } />
              <Route path="/manager/claims" element={
                <RequireRole roles={['manager','admin']}>
                  <ManagerClaims />
                </RequireRole>
              } />
              <Route path="/manager/returns" element={
                <RequireRole roles={['manager','admin']}>
                  <EquipmentReturns />
                </RequireRole>
              } />
              <Route path="/manager/voting" element={
                <RequireRole roles={['manager']}>
                  <ManagerVotingPage />
                </RequireRole>
              } />
              <Route path="/manager/inventory" element={
                <RequireRole roles={['manager']}>
                  <InventoryPage />
                </RequireRole>
              } />
              <Route path="/admin/dashboard" element={
                <RequireRole roles={['admin']}>
                  <AdminDashboard />
                </RequireRole>
              } />
              <Route path="/admin/inventory" element={
                <RequireRole roles={['admin']}>
                  <AdminInventoryDashboard />
                </RequireRole>
              } />
              {/* Teacher & Staff use shared /dashboard route now (same as student) */}
            </Route>
          </Route>

          {/* Fallback */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}