import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, AppContext } from './context/AppContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InputFinding from './components/InputFinding';

function AppContent() {
  const { currentUser } = useContext(AppContext);

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Pages */}
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/input-finding" element={<InputFinding />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppContextProvider>
  );
}
