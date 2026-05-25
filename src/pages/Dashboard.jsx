import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-10">
        Selamat datang kembali, <span className="font-bold text-purple-400">{user ? user.name : 'Pengguna'}</span>!
      </p>
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-6">Overview</h2>
        <p className="text-gray-400">Halaman ini masih dalam tahap pengembangan. Fitur-fitur utama akan segera ditambahkan.</p>
      </div>
    </div>
  );
};

export default Dashboard;
