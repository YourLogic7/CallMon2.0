import { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Menu,
  Users,
  UserCog,
  Settings,
  ChevronDown,
  ClipboardList
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const isSdmActive = ['/account-mgmt', '/team-mgmt'].includes(location.pathname);
  const [isSdmOpen, setIsSdmOpen] = useState(() => isSdmActive);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Keep SDM submenu open if active route is account-mgmt or team-mgmt
  useEffect(() => {
    if (isSdmActive) {
      setIsSdmOpen(true);
    }
  }, [location.pathname, isSdmActive]);

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

  const canManageSdm = ['superadmin', 'QC', 'TL'].includes(currentUser.role);
  const canInputFinding = ['superadmin', 'QC', 'TL'].includes(currentUser.role);
  const canTindakLanjut = ['superadmin', 'QC', 'TL'].includes(currentUser.role);

  return (
    <>
      {/* Mobile Top Header */}
      <div style={styles.mobileNav}>
        <div style={styles.mobileLogo}>
          <ShieldAlert size={24} color="#6366f1" />
          <span style={{ fontWeight: 700, fontSize: '18px', marginLeft: '8px' }}>CallMon2.0</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} style={styles.mobileToggle}>
          <Menu size={24} />
        </button>
      </div>

      {/* Main Sidebar Box */}
      <div style={{
        ...styles.sidebar,
        width: isCollapsed ? '80px' : '260px',
        left: isMobileOpen ? '0px' : (window.innerWidth <= 1024 ? '-280px' : '0px')
      }}>
        {/* Toggle Collapse Button (Desktop Only) */}
        <button onClick={() => setIsCollapsed(!isCollapsed)} style={styles.collapseBtn}>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Brand/Logo Section */}
        <div style={{ ...styles.brand, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <div style={styles.logoBox}>
            <ShieldAlert size={26} color="#ffffff" />
          </div>
          {!isCollapsed && (
            <div style={styles.brandText}>
              <span style={styles.brandTitle}>CallMon2.0</span>
              <span style={styles.brandVer}>v1.0.0</span>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div style={{ ...styles.profileContainer, padding: isCollapsed ? '12px 6px' : '20px' }}>
          <div style={styles.profileRow}>
            <div style={styles.avatar}><User size={20} color="#ffffff" /></div>
            {!isCollapsed && (
              <div style={styles.profileInfo}>
                <div style={styles.profileName}>{currentUser.name}</div>
                <div style={styles.profileUsername}>@{currentUser.username}</div>
              </div>
            )}
          </div>
          {!isCollapsed && <div style={styles.badgeWrapper}>{getRoleBadge(currentUser.role)}</div>}
        </div>

        <div style={styles.divider}></div>

        {/* Navigation Menu */}
        <div style={styles.navMenu}>
          <NavLink to="/dashboard" onClick={() => setIsMobileOpen(false)} style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.activeNavLink : {}), justifyContent: isCollapsed ? 'center' : 'flex-start' })}>
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {canInputFinding && (
            <NavLink to="/input-finding" onClick={() => setIsMobileOpen(false)} style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.activeNavLink : {}), justifyContent: isCollapsed ? 'center' : 'flex-start' })}>
              <PlusCircle size={20} />
              {!isCollapsed && <span>Input Finding</span>}
            </NavLink>
          )}

          {canTindakLanjut && (
            <NavLink to="/tindak-lanjut" onClick={() => setIsMobileOpen(false)} style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.activeNavLink : {}), justifyContent: isCollapsed ? 'center' : 'flex-start' })}>
              <ClipboardList size={20} />
              {!isCollapsed && <span>Tindak Lanjut</span>}
            </NavLink>
          )}

          {canManageSdm && (
            <div style={styles.submenuContainer}>
              <button 
                onClick={() => setIsSdmOpen(!isSdmOpen)} 
                style={{
                  ...styles.navLink, 
                  background: 'transparent', 
                  border: 'none', 
                  width: '100%', 
                  cursor: 'pointer',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  color: isSdmActive ? '#818cf8' : 'var(--text-muted)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Users size={20} />
                  {!isCollapsed && <span>Kelola SDM</span>}
                </div>
                {!isCollapsed && <ChevronDown size={14} style={{ transform: isSdmOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />}
              </button>
              
              {isSdmOpen && !isCollapsed && (
                <div style={styles.submenu}>
                  <NavLink to="/account-mgmt" onClick={() => setIsMobileOpen(false)} style={({ isActive }) => ({ ...styles.subNavLink, ...(isActive ? styles.activeSubLink : {}) })}>
                    <UserCog size={16} />
                    <span>Account Mgmt</span>
                  </NavLink>
                  <NavLink to="/team-mgmt" onClick={() => setIsMobileOpen(false)} style={({ isActive }) => ({ ...styles.subNavLink, ...(isActive ? styles.activeSubLink : {}) })}>
                    <Settings size={16} />
                    <span>Team Mgmt</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer toggles and actions */}
        <div style={{ ...styles.footer, flexDirection: isCollapsed ? 'column' : 'row' }}>
          <button onClick={toggleTheme} style={styles.themeToggle}>
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={18} />
            {!isCollapsed && <span style={{ marginLeft: '8px' }}>Log Out</span>}
          </button>
        </div>
      </div>
      {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} style={styles.backdrop}></div>}
    </>
  );
}

const styles = {
  sidebar: { height: '100vh', background: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', borderRight: '1px solid var(--border-light)', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', padding: '24px 16px', zIndex: 100, transition: 'width 0.3s ease, left 0.3s ease' },
  collapseBtn: { position: 'absolute', right: '-12px', top: '32px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)', zIndex: 10 },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' },
  logoBox: { width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandText: { display: 'flex', flexDirection: 'column' },
  brandTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-heading)' },
  brandVer: { fontSize: '10px', color: 'var(--text-muted)' },
  profileContainer: { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--card-border)', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  profileRow: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', overflow: 'hidden' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileInfo: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  profileName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  profileUsername: { fontSize: '11px', color: 'var(--text-muted)' },
  badgeWrapper: { marginTop: '2px' },
  divider: { height: '1px', background: 'var(--border-light)', marginBottom: '20px' },
  navMenu: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navLink: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: '0.2s' },
  activeNavLink: { background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)', color: '#818cf8', borderLeft: '3px solid var(--primary)', fontWeight: '600' },
  submenuContainer: { display: 'flex', flexDirection: 'column' },
  submenu: { marginLeft: '24px', marginTop: '4px', borderLeft: '1px solid var(--border-light)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '4px' },
  subNavLink: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', transition: '0.2s' },
  activeSubLink: { color: 'var(--primary)', fontWeight: '700', background: 'rgba(99, 102, 241, 0.05)' },
  footer: { marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border-light)' },
  themeToggle: { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' },
  mobileNav: { display: 'none' },
  backdrop: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 99 }
};

if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 1024px) {
      div[style*="mobileNav"] { display: flex !important; align-items: center; justify-content: space-between; padding: 12px 20px; background: var(--sidebar-bg); border-bottom: 1px solid var(--border-light); position: fixed; top: 0; left: 0; width: 100vw; z-index: 90; }
      button[style*="mobileToggle"] { background: none; border: none; color: var(--text-main); cursor: pointer; }
      div[style*="sidebar"] { position: fixed !important; top: 0; z-index: 100; box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
      button[style*="collapseBtn"] { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}
