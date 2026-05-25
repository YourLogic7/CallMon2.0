import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Import the context
import api from '../api/axiosConfig'; // Import the configured axios instance

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext); // Get the login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/login', { username, password });
      
      // The response.data should contain { token, user }
      const { token, user } = response.data;
      
      // Call the login function from AuthContext
      login(user, token);

    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.status === 401) {
        setError('Username atau password salah.');
      } else {
        setError('Gagal terhubung ke server. Silakan coba lagi.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">CallMon2.0</h1>
          <p className="text-gray-400">Silakan login untuk melanjutkan</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500 text-white"
              required
            />
          </div>
          {error && <div className="p-3 text-sm text-center text-red-400 bg-red-800 bg-opacity-30 rounded-lg">{error}</div>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg shadow-purple-900/50"
          >
            Login
          </button>
          <div className="text-center text-gray-400">
            Belum punya akun? <Link to="/signup" className="font-medium text-purple-400 hover:underline">Daftar di sini</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
