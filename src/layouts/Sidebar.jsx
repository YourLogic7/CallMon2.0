import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, Briefcase, LogOut, Sun, Moon, UserCircle } from 'lucide-react';

// Sidebar receives user and handleLogout as props
const Sidebar = ({ user, handleLogout }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center mb-10">
          <h1 className="text-2xl font-bold text-white">CallMon2.0</h1>
          <span className="ml-2 bg-purple-500 text-xs font-semibold px-2 py-0.5 rounded-full">v1.0.0</span>
        </div>

        <div className="flex items-center p-3 mb-8 bg-gray-700 rounded-lg">
          <UserCircle className="w-12 h-12 text-purple-400 mr-3" />
          <div>
            <p className="font-bold">{user ? user.name : 'Guest'}</p>
            <p className="text-xs text-gray-400">@{user ? user.username : 'guest'}</p>
            {user && <span className="mt-1 inline-block bg-blue-500/20 text-blue-300 px-2 py-0.5 text-xs font-semibold rounded-md">{user.role}</span>}
          </div>
        </div>

        <nav className="space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}>
            <LayoutDashboard className="mr-3" /> Dashboard
          </NavLink>
          <NavLink to="/input-finding" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}>
            <PlusCircle className="mr-3" /> Input Finding
          </NavLink>
          <div className="pt-2">
            <span className="px-4 text-xs text-gray-500 font-semibold uppercase">Kelola SDM</span>
            <NavLink to="/account-mgmt" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg mt-2 ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}>
              <Users className="mr-3" /> Account Mgmt
            </NavLink>
            <NavLink to="/team-mgmt" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}>
              <Briefcase className="mr-3" /> Team Mgmt
            </NavLink>
          </div>
        </nav>
      </div>

      <div className="space-y-2">
         {/* The light/dark mode toggle can be implemented later */}
        <button className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-gray-700">
          <Sun className="mr-3" /> Light Mode
        </button>
        <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/20">
          <LogOut className="mr-3" /> Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
