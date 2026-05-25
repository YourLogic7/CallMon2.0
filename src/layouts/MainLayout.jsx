import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import AuthContext from '../context/AuthContext'; // Import AuthContext

const MainLayout = () => {
  // Get user data and logout function from the context
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Pass user and logout function to Sidebar */}
      <Sidebar user={user} handleLogout={logout} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
