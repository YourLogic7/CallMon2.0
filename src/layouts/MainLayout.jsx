import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 

const MainLayout = () => {
  return (
    <div className="app-container">
      {/* Sidebar automatically reads currentUser from AppContext */}
      <Sidebar />
      
      {/* Scrollable Main content area */}
      <main className="main-content" style={{ overflowY: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
