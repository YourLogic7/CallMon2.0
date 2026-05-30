import { useState, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { UserPlus, Trash2, Shield, UserCog, User, Upload, Eye, EyeOff, Edit3, X, Save } from 'lucide-react';
import Papa from 'papaparse';

export default function AccountManagement() {
  const { users, registerByAdmin, deleteUser, currentUser, addUsersBatch, updateUser } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'Agent' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const fileInputRef = useRef(null);

  const isAuthorized = ['superadmin', 'TL'].includes(currentUser?.role);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingUser) {
      const res = await updateUser(editingUser._id || editingUser.id, formData);
      if (res.success) {
        setStatus({ type: 'success', message: 'Akun berhasil diperbarui!' });
        handleCancelEdit();
      } else {
        setStatus({ type: 'error', message: res.message || 'Gagal memperbarui akun.' });
      }
    } else {
      const res = await registerByAdmin(formData.name, formData.username, formData.password, formData.role);
      if (res.success) {
        setStatus({ type: 'success', message: 'Akun berhasil ditambahkan!' });
        setFormData({ name: '', username: '', password: '', role: 'Agent' });
      } else {
        setStatus({ type: 'error', message: res.message || 'Gagal menambahkan akun.' });
      }
    }
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '', // Leave empty for security, only update if typed
      role: user.role
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', password: '', role: 'Agent' });
  };

  const handleDelete = async (id, username) => {
    if (username === currentUser.username) { alert('Anda tidak bisa menghapus akun sendiri!'); return; }
    if (window.confirm(`Hapus akun @${username}?`)) await deleteUser(id);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const res = await addUsersBatch(results.data);
          if (res.success) {
            setStatus({ type: 'success', message: `Berhasil mengimpor ${results.data.length} akun!` });
          } else {
            setStatus({ type: 'error', message: res.message });
          }
          setTimeout(() => setStatus({ type: '', message: '' }), 3000);
          e.target.value = null;
        },
        error: (err) => {
          setStatus({ type: 'error', message: 'Gagal membaca file CSV: ' + err.message });
          setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        }
      });
    }
  };

  return (
    <div className="main-content">
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={styles.title}>Account Management</h2>
            <p style={styles.subtitle}>Kelola akses pengguna dan privilege sistem CallMon2.0</p>
          </div>
          <div>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button 
              className="btn-primary" 
              style={{ background: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={16} /> Import CSV
            </button>
          </div>
        </div>
      </div>

      <div className="account-layout" style={styles.layout}>
        {/* Form Section */}
        <div className="glass-card" style={styles.formCard}>
          <div style={styles.cardHeader}>
            {editingUser ? <Edit3 size={18} color="var(--secondary)" /> : <UserPlus size={18} color="var(--primary)" />}
            <h3 style={styles.cardTitle}>{editingUser ? 'Edit Akun' : 'Tambah Akun Baru'}</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="Nama Lengkap" required />
            </div>
            
            <div style={styles.grid2}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" name="username" className="form-input" value={formData.username} onChange={handleChange} placeholder="username" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="form-input" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder={editingUser ? "(Kosongkan jika tidak ubah)" : "******"} 
                    required={!editingUser} 
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
            </div>

            <div className="form-group">
              <label className="form-label">Role Privilege</label>
              <select name="role" className="form-input" value={formData.role} onChange={handleChange}>
                <option value="Agent">Agent</option>
                <option value="TL">Team Leader (TL)</option>
                <option value="QC">Quality Control (QC)</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary" style={styles.submitBtn}>
                {editingUser ? <><Save size={16} /> Simpan Perubahan</> : <><UserCog size={16} /> Buat Akun Baru</>}
              </button>
              {editingUser && (
                <button type="button" onClick={handleCancelEdit} className="btn-primary" style={{ ...styles.submitBtn, background: 'var(--danger)' }}>
                  <X size={16} /> Batal
                </button>
              )}
            </div>
            
            {status.message && (
              <div style={{ 
                marginTop: '16px', 
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '13px',
                textAlign: 'center',
                background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: status.type === 'success' ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${status.type === 'success' ? 'var(--success)' : 'var(--danger)'}33`
              }}>
                {status.message}
              </div>
            )}
          </form>
        </div>

        {/* List Section */}
        <div className="glass-card" style={styles.listCard}>
          <div style={styles.cardHeader}>
            <Shield size={18} color="var(--primary)" />
            <h3 style={styles.cardTitle}>Daftar Akun Terdaftar</h3>
          </div>
          
          <div className="table-container">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Privilege</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id || u.id} style={styles.tr}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.avatarMini}><User size={14} /></div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>{u.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${u.role === 'superadmin' ? 'primary' : (u.role === 'QC' ? 'success' : (u.role === 'TL' ? 'warning' : 'primary'))}`} style={{ fontSize: '10px' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {isAuthorized && (
                          <button 
                            onClick={() => handleEdit(u)} 
                            style={{ ...styles.actionBtn, color: 'var(--secondary)' }}
                            title="Edit Akun"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(u._id || u.id, u.username)} 
                          style={{ ...styles.actionBtn, color: 'var(--danger)' }}
                          title="Hapus Akun"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '32px' },
  title: { fontSize: '26px', fontWeight: '800', background: 'linear-gradient(135deg, #fff 30%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' },
  layout: { display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' },
  formCard: { flex: '0.8', minWidth: '320px' },
  listCard: { flex: '1.2', minWidth: '400px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' },
  cardTitle: { fontSize: '16px', fontWeight: '700' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  submitBtn: { flex: 1, marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  table: { width: '100%' },
  tr: { transition: 'background 0.2s' },
  avatarMini: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, padding: '8px', borderRadius: '6px', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  toggleBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }
};
