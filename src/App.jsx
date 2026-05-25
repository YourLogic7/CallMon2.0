import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, default as AuthContext } from './context/AuthContext'; // Import AuthProvider and AuthContext

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InputFinding from './pages/InputFinding';
import AccountMgmt from './pages/AccountMgmt';
import TeamMgmt from './pages/TeamMgmt';

// This component will protect routes that require authentication
const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // You can add a loading spinner here if you want
    return <div>Loading...</div>; 
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// This component will redirect logged-in users away from login/signup
const PublicRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

// Main App Component
const App = () => {
  return (
    <Router>
      <AuthProvider> {/* Wrap everything in AuthProvider */}
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
              <Route path="input-finding" element={<InputFinding />} />
              <Route path="account-mgmt" element={<AccountMgmt />} />
              <Route path="team-mgmt" element={<TeamMgmt />} />
            </Route>
          </Route>

           {/* Fallback route - if nothing matches, redirect based on auth state */}
           <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
