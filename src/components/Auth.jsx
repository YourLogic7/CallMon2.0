import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Key, LogIn, Award, Eye, EyeOff } from 'lucide-react';

export default function Auth({ defaultIsLogin = true }) {
  const { login } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLogin] = useState(defaultIsLogin);
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
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

          {isLogin && (
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
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={styles.toggleBtn}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading}>
                 {loading ? 'Memproses...' : <><LogIn size={18} /> Masuk ke Dashboard</>}
              </button>
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
  submitBtn: {
    marginTop: '12px',
    width: '100%',
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
  toggleBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  }
};
