import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axiosConfig';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/signup', { name, username, password, role: 'Agent' });
      const { token, user } = response.data;
      login(user, token);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Username sudah digunakan. Silakan pilih yang lain.');
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    }
  };

  // Reverted to a simpler structure to match the original look.
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Buat Akun Baru</h1>
      <p style={{ marginBottom: '1.5rem' }}>Selamat datang di CallMon2.0</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Nama Lengkap</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', color: 'black', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', color: 'black', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', color: 'black', padding: '0.5rem' }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Daftar & Login</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Sudah punya akun? <Link to="/login" style={{ color: '#60a5fa' }}>Login di sini</Link>
      </p>
    </div>
  );
};

export default Signup;
