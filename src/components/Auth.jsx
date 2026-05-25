import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Key, UserPlus, LogIn, Award } from 'lucide-react';

export default function Auth({ defaultIsLogin = true }) {
  const { login, signup } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup Form States
  const [name, setName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Agent');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !regUsername || !regPassword) {
      setError('Semua kolom wajib diisi!');
      return;
    }
    setLoading(true);
    const result = await signup(name, regUsername, regPassword, regRole);
    setLoading(false);
    if (result.success) {
      setSuccessMsg('Pendaftaran berhasil! Mengalihkan...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background blobs for premium glowing visual */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      
      <div style={styles.cardWrapper}>
        <div className="glass-card" style={styles.authCard}>
          <div style={styles.header}>
            <div style={styles.logoCircle}>
              <Award size={36} color="#6366f1" />
            </div>
            <h1 style={styles.title}>CallMon2.0</h1>
            <p style={styles.subtitle}>Quality Monitoring (QM) Score Monitoring Tool</p>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}
          {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} style={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="username">
                  <span style={styles.labelSpan}><User size={16} /> Username</span>
                </label>
                <input
                  id="username"
                  className="form-input"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  <span style={styles.labelSpan}><Key size={16} /> Password</span>
                </label>
                <input
                  id="password"
                  className="form-input"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading}>
                 {loading ? 'Memproses...' : <><LogIn size={18} /> Masuk ke Dashboard</>}
              </button>

              <p style={styles.toggleText}>
                Belum punya akun?{' '}
                <span onClick={() => { setIsLogin(false); setError(''); }} style={styles.toggleLink}>
                  Daftar di sini
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} style={styles.form}>
               <div className="form-group">
                <label className="form-label" htmlFor="regName">Nama Lengkap</label>
                <input
                  id="regName"
                  className="form-input"
                  type="text"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="regUser">Username</label>
                <input
                  id="regUser"
                  className="form-input"
                  type="text"
                  placeholder="Username unik"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="regPass">Password</label>
                <input
                  id="regPass"
                  className="form-input"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="regRole">Role Privilege</label>
                <select
                  id="regRole"
                  className="form-input"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={styles.select}
                  disabled={loading}>
                  <option value="Agent">Agent (Lihat Nilai Sendiri)</option>
                  <option value="QC">QC (Input Finding + Dashboard)</option>
                  <option value="TL">TL (Input Finding + Dashboard)</option>
                  <option value="superadmin">Superadmin (Akses Penuh)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Mendaftar...' : <><UserPlus size={18} /> Daftar Sekarang</>}
              </button>

              <p style={styles.toggleText}>
                Sudah punya akun?{' '}
                <span onClick={() => { setIsLogin(true); setError(''); }} style={styles.toggleLink}>
                  Login di sini
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'rgba(99, 102, 241, 0.15)',
    filter: 'blur(100px)',
    top: '-10%',
    left: '10%',
    borderRadius: '50%',
    zIndex: 0,
  },
  blob2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: 'rgba(168, 85, 247, 0.15)',
    filter: 'blur(120px)',
    bottom: '-10%',
    right: '10%',
    borderRadius: '50%',
    zIndex: 0,
  },
  cardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    maxWidth: '480px',
    zIndex: 1,
  },
  authCard: {
    padding: '36px 32px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '4px',
    background: 'linear-gradient(135deg, #fff 30%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  labelSpan: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  select: {
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  },
  submitBtn: {
    marginTop: '12px',
    width: '100%',
  },
  toggleText: {
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginTop: '16px',
  },
  toggleLink: {
    color: '#818cf8',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
  },
   errorAlert: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
  },
};