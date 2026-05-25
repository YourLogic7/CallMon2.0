import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axiosConfig';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/login', { username, password });
      const { token, user } = response.data;
      login(user, token);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Username atau password salah.');
      } else {
        setError('Gagal terhubung ke server. Silakan coba lagi.');
      }
    }
  };

  // Reverted to a simpler structure to match the original look.
  // Assumes basic styling is handled by a global CSS file like index.css
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>CallMon2.0</h1>
      <p style={{ marginBottom: '1.5rem' }}>Silakan login untuk melanjutkan</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', color: 'black', padding: '0.5rem' }} // Basic styling
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', color: 'black', padding: '0.5rem' }} // Basic styling
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Login</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Belum punya akun? <Link to="/signup" style={{ color: '#60a5fa' }}>Daftar di sini</Link>
      </p>
    </div>
  );
};

export default Login;
