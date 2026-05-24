import { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  User, 
  Sun, 
  Moon, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return <span className="badge badge-primary">Superadmin</span>;
      case 'QC':
        return <span className="badge badge-success">Quality Control</span>;
      case 'TL':
        return <span className="badge badge-warning">Team Leader</span>;
      default:
        return <span className="badge badge-primary" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>Agent</span>;
    }
  };

  if (!currentUser) return null;

  // Determine if the user has permission to input findings
  const canInputFinding = ['superadmin', 'QC', 'TL'].includes(currentUser.role);

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div style={styles.mobileNav}>
        <div style={styles.mobileLogo}>
          <ShieldAlert size={24} color="#6366f1" />
          <span style={{ fontWeight: 700, fontSize: '18px', marginLeft: '8px' }}>CallMon2.0</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} style={styles.mobileToggle}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Panel */}
      <div style={{
        ...styles.sidebar,
        width: isCollapsed ? '80px' : '260px',
        left: isMobileOpen ? '0px' : (window.innerWidth <= 1024 ? '-280px' : '0px')
      }}>
        {/* Toggle Collapse Button for desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          style={styles.collapseBtn}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Brand Header */}
        <div style={{ ...styles.brand, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <div style={styles.logoBox}>
            <ShieldAlert size={26} color="#ffffff" />
          </div>
          {!isCollapsed && (
            <div style={styles.brandText}>
              <span style={styles.brandTitle}>CallMon20</span>
              <span style={styles.brandVer}>v1.0.0</span>
            </div>
          )}
        </div>

        {/* Profil User */}
        <div style={{ 
          ...styles.profileContainer, 
          padding: isCollapsed ? '12px 6px' : '20px',
          alignItems: isCollapsed ? 'center' : 'flex-start' 
        }}>
          <div style={styles.profileRow}>
            <div style={styles.avatar}>
              <User size={20} color="#ffffff" />
            </div>
            {!isCollapsed && (
              <div style={styles.profileInfo}>
                <div style={styles.profileName} title={currentUser.name}>
                  {currentUser.name}
                </div>
                <div style={styles.profileUsername}>
                  @{currentUser.username}
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div style={styles.badgeWrapper}>
              {getRoleBadge(currentUser.role)}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={styles.divider}></div>

        {/* Menu Navigasi */}
        <div style={styles.navMenu}>
          <NavLink
            to="/dashboard"
            onClick={() => setIsMobileOpen(false)}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.activeNavLink : {}),
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            })}
            title="Dashboard Monitoring"
          >
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {canInputFinding && (
            <NavLink
              to="/input-finding"
              onClick={() => setIsMobileOpen(false)}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeNavLink : {}),
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              })}
              title="Input Finding"
            >
              <PlusCircle size={20} />
              {!isCollapsed && <span>Input Finding</span>}
            </NavLink>
          )}
        </div>

        {/* Footer Sidebar (Theme toggle & Logout) */}
        <div style={{ 
          ...styles.footer, 
          flexDirection: isCollapsed ? 'column' : 'row',
          gap: isCollapsed ? '16px' : '0px'
        }}>
          <button onClick={toggleTheme} style={styles.themeToggle} title="Ganti Tema">
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>
          
          <button onClick={handleLogout} style={styles.logoutBtn} title="Keluar Akun">
            <LogOut size={18} />
            {!isCollapsed && <span style={{ marginLeft: '8px' }}>Log Out</span>}
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div onClick={() => setIsMobileOpen(false)} style={styles.backdrop}></div>
      )}
    </>
  );
}

const styles = {
  sidebar: {
    height: '100vh',
    background: 'var(--sidebar-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: '1px solid var(--border-light)',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s ease',
  },
  collapseBtn: {
    position: 'absolute',
    right: '-12px',
    top: '32px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--primary)',
    border: 'none',
    color: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
    zIndex: 10,
    display: 'none', // hidden on mobile, will show in media queries via CSS
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  logoBox: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-heading)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.5px',
  },
  brandVer: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '-2px',
  },
  profileContainer: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--card-border)',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    overflow: 'hidden',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  profileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-heading)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  profileUsername: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  badgeWrapper: {
    marginTop: '2px',
  },
  divider: {
    height: '1px',
    background: 'var(--border-light)',
    marginBottom: '20px',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  activeNavLink: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
    color: '#818cf8',
    borderLeft: '3px solid var(--primary)',
    fontWeight: '600',
    boxShadow: 'var(--glow-active)',
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-light)',
  },
  themeToggle: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--card-border)',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    padding: '6px 8px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  mobileNav: {
    display: 'none', // default hidden for desktop
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 99,
  }
};

// Add standard styles for sidebar hover via CSS Injection
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .sidebar-link:hover {
      color: var(--text-heading) !important;
      background: rgba(255, 255, 255, 0.04);
    }
    
    @media (max-width: 1024px) {
      div[style*="height: 100vh"] {
        position: fixed !important;
        top: 0 !important;
        left: -280px;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        height: 100vh !important;
        box-shadow: 10px 0 30px rgba(0,0,0,0.5) !important;
      }
      
      /* Mobile top bar styling */
      div[style*="display: none"] {
        display: flex !important;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        background: var(--sidebar-bg);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border-light);
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 98;
        height: 60px;
      }
      
      button[style*="background: transparent"] {
        color: var(--text-heading) !important;
      }
    }
    
    @media (min-width: 1025px) {
      button[style*="position: absolute"] {
        display: flex !important;
      }
    }
  `;
  document.head.appendChild(style);
}
