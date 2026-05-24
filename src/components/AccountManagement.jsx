import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UserPlus, Trash2, Shield } from 'lucide-react';

export default function AccountManagement() {
  const { users, signup, deleteUser, currentUser } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'Agent' });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signup(formData.name, formData.username, formData.password, formData.role);
    if (res.success) {
      setStatus({ type: 'success', message: 'Akun berhasil ditambahkan!' });
      setFormData({ name: '', username: '', password: '', role: 'Agent' });
    } else setStatus({ type: 'error', message: res.message || 'Gagal menambahkan akun.' });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const handleDelete = async (id, username) => {
    if (username === currentUser.username) { alert('Anda tidak bisa menghapus akun sendiri!'); return; }
    if (window.confirm(`Hapus akun ${username}?`)) await deleteUser(id);
  };

  return (
    <div className="main-content">
      <div style={styles.header}>
        <h2 style={styles.title}>Accounts</h2>
        <p style={styles.subtitle}>Kelola akses pengguna aplikasi.</p>
      </div>

      <div className="account-layout" style={styles.layout}>
        <div className="glass-card" style={styles.formCard}>
          <div style={styles.cardHeader}><UserPlus size={16} /><span>Tambah Akun</span></div>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Nama</label><input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Username</label><input type="text" name="username" className="form-input" value={formData.username} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Password</label><input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required /></div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-input" value={formData.role} onChange={handleChange}>
                <option value="Agent">Agent</option><option value="TL">TL</option><option value="QC">QC</option><option value="superadmin">Superadmin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Buat Akun</button>
            {status.message && <p style={{ color: status.type === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: '13px', marginTop: '10px' }}>{status.message}</p>}
          </form>
        </div>

        <div className="glass-card" style={styles.listCard}>
          <div style={styles.cardHeader}><Shield size={16} /><span>Daftar Akun</span></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Nama</th><th>Role</th><th></th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><div style={{ fontWeight: '600' }}>{u.name}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{u.username}</div></td>
                    <td><span className={`badge badge-${u.role === 'superadmin' ? 'primary' : 'success'}`} style={{ fontSize: '10px' }}>{u.role}</span></td>
                    <td><button onClick={() => handleDelete(u._id, u.username)} style={styles.delBtn}><Trash2 size={14} /></button></td>
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
  header: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '800' },
  subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
  layout: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  formCard: { flex: '0.7', minWidth: '280px' },
  listCard: { flex: '1.3', minWidth: '320px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: '700', fontSize: '14px' },
  delBtn: { background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7 }
};
