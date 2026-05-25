import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, UserCircle, Trash, Pencil } from 'lucide-react';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://callmon-rev.vercel.app' 
  : 'http://localhost:3001';

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'Agent'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users`);
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError('Gagal memuat daftar pengguna.');
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.username || !formData.password) {
      setError('Semua field wajib diisi.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/signup`, formData);
      // Add the new user to the state to update the list instantly
      setUsers([...users, response.data]);
      setSuccess('Akun baru berhasil dibuat!');
      // Reset form
      setFormData({ name: '', username: '', password: '', role: 'Agent' });
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || 'Gagal membuat akun baru.');
    }
  };
  
  // Dummy delete function - will be implemented later
  const handleDeleteUser = (userId) => {
    console.log("Delete user:", userId);
    // setUsers(users.filter(user => user._id !== userId));
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-2">Account Management</h1>
      <p className="text-gray-400 mb-10">Kelola akses pengguna dan privilege sistem CallMon2.0</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center"><UserCircle className="mr-3" /> Tambah Akun Baru</h2>
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Nama Lengkap</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500" />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Role Privilege</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500">
                <option value="Superadmin">Superadmin (Akses Penuh)</option>
                <option value="QC">QC (Quality Control)</option>
                <option value="TL">TL (Team Leader)</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
            {error && <div className="p-3 text-sm text-red-400 bg-red-800 bg-opacity-30 rounded-lg">{error}</div>}
            {success && <div className="p-3 text-sm text-green-400 bg-green-800 bg-opacity-30 rounded-lg">{success}</div>}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg shadow-purple-900/50">Buat Akun Baru</button>
          </form>
        </div>

        {/* User List Section */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center"><ShieldCheck className="mr-3" /> Daftar Akun Terdaftar</h2>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map(user => (
                <div key={user._id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UserCircle className="w-10 h-10 mr-4 text-gray-400" />
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'Superadmin' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300'}`}>
                          {user.role}
                      </span>
                  </div>
                  <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-600 rounded-full"><Pencil size={16} /></button>
                      <button onClick={() => handleDeleteUser(user._id)} className="p-2 hover:bg-red-500/20 rounded-full text-red-400"><Trash size={16} /></button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">Tidak ada pengguna terdaftar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
