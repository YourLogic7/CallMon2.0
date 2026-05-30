import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppContextProvider, AppContext } from './context/AppContext';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InputFinding from './pages/InputFinding';
import AccountMgmt from './pages/AccountMgmt';
import TeamMgmt from './pages/TeamMgmt';
import TindakLanjut from './pages/TindakLanjut';

// Protect routes that require authentication
const ProtectedRoute = () => {
  const { currentUser, isLoading } = useContext(AppContext);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'radial-gradient(circle at top, #1e1b4b 0%, #0f172a 100%)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Memuat CallMon2.0...</p>
        </div>
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

// Redirect logged-in users away from login/signup
const PublicRoute = () => {
  const { currentUser, isLoading } = useContext(AppContext);

  if (isLoading) {
    return null;
  }

  return !currentUser ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// Role-based access control
const RoleProtectedRoute = ({ allowedRoles }) => {
  const { currentUser } = useContext(AppContext);
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  
  return <Outlet />;
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AppContextProvider>
        <Routes>
          {/* Public routes (Login, Signup) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected routes (Dashboard and everything else) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Restricted routes */}
              <Route element={<RoleProtectedRoute allowedRoles={['superadmin', 'QC']} />}>
                <Route path="input-finding" element={<InputFinding />} />
              </Route>
              
              <Route element={<RoleProtectedRoute allowedRoles={['superadmin', 'QC', 'TL']} />}>
                <Route path="tindak-lanjut" element={<TindakLanjut />} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['superadmin']} />}>
                <Route path="account-mgmt" element={<AccountMgmt />} />
                <Route path="team-mgmt" element={<TeamMgmt />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AppContextProvider>
    </Router>
  );
};

export default App;
