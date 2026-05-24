import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Trash2, UserCheck, Plus, ShieldCheck, Contact } from 'lucide-react';

export default function TeamManagement() {
  const { teamLeaders, sdmList, addTeamLeader, deleteTeamLeader, addSDM, deleteSDM } = useContext(AppContext);
  const [tlForm, setTlForm] = useState({ name: '', nik: '' });
  const [sdmForm, setSdmForm] = useState({ name: '', nik: '', teamName: '' });

  useEffect(() => {
    if (teamLeaders.length > 0 && sdmForm.teamName === '') {
      setSdmForm(prev => ({ ...prev, teamName: teamLeaders[0].name }));
    }
  }, [teamLeaders, sdmForm.teamName]);

  const handleTlSubmit = async (e) => {
    e.preventDefault();
    await addTeamLeader(tlForm.name, tlForm.nik);
    setTlForm({ name: '', nik: '' });
  };

  const handleSdmSubmit = async (e) => {
    e.preventDefault();
    if (!sdmForm.teamName) {
      alert('Pilih Team Leader terlebih dahulu!');
      return;
    }
    await addSDM(sdmForm.name, sdmForm.nik, sdmForm.teamName);
    setSdmForm({ ...sdmForm, name: '', nik: '' });
  };

  return (
    <div className="main-content">
      <div style={styles.header}>
        <h2 style={styles.title}>Team Management</h2>
        <p style={styles.subtitle}>Kelola struktur organisasi dan pemetaan Agent ke Team Leader.</p>
      </div>

      <div className="team-layout" style={styles.layout}>
        {/* TL Section */}
        <div style={styles.section}>
          <div className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <UserCheck size={18} color="var(--primary)" />
              <h3 style={styles.cardTitle}>Kelola Team Leader</h3>
            </div>
            
            <form onSubmit={handleTlSubmit} style={styles.formRow}>
              <input type="text" className="form-input" placeholder="Nama TL" value={tlForm.name} onChange={e => setTlForm({...tlForm, name: e.target.value})} required />
              <input type="text" className="form-input" placeholder="NIK" value={tlForm.nik} onChange={e => setTlForm({...tlForm, nik: e.target.value})} required />
              <button type="submit" className="btn-primary" style={styles.addBtn} title="Tambah TL">
                <Plus size={18} />
              </button>
            </form>

            <div className="table-container" style={{ marginTop: '20px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Informasi TL</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLeaders.map(tl => (
                    <tr key={tl._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={styles.iconBox}><ShieldCheck size={14} /></div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{tl.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>NIK: {tl.nik}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => deleteTeamLeader(tl._id)} style={styles.delBtn}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {teamLeaders.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada data TL.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SDM Section */}
        <div style={{ ...styles.section, flex: '1.4' }}>
          <div className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <Users size={18} color="var(--primary)" />
              <h3 style={styles.cardTitle}>Kelola SDM (Agents)</h3>
            </div>
            
            <form onSubmit={handleSdmSubmit} style={styles.gridForm}>
              <div className="form-group">
                <label className="form-label">Nama SDM</label>
                <input type="text" className="form-input" placeholder="Nama Lengkap" value={sdmForm.name} onChange={e => setSdmForm({...sdmForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">NIK SDM</label>
                <input type="text" className="form-input" placeholder="NIK" value={sdmForm.nik} onChange={e => setSdmForm({...sdmForm, nik: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Pilih Team</label>
                <select className="form-input" value={sdmForm.teamName} onChange={e => setSdmForm({...sdmForm, teamName: e.target.value})} required>
                  <option value="" disabled>Pilih TL</option>
                  {teamLeaders.map(tl => (
                    <option key={tl._id} value={tl.name}>{tl.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ gridColumn: 'span 3', marginTop: '4px' }}>
                <Plus size={16} /> Daftarkan SDM Baru
              </button>
            </form>

            <div className="table-container" style={{ marginTop: '10px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Biodata</th>
                    <th>Penempatan Team</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sdmList.map(s => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={styles.iconBoxGreen}><Contact size={14} /></div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NIK: {s.nik}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '10px' }}>{s.teamName}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => deleteSDM(s._id)} style={styles.delBtn}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {sdmList.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Belum ada data SDM.</td></tr>}
                </tbody>
              </table>
            </div>
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
  section: { flex: '1', minWidth: '320px' },
  card: { height: '100%' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' },
  cardTitle: { fontSize: '16px', fontWeight: '700' },
  formRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  gridForm: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
  addBtn: { padding: '10px', width: '48px', height: '42px', flexShrink: 0 },
  iconBox: { width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' },
  iconBoxGreen: { width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' },
  delBtn: { background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6, padding: '8px', borderRadius: '6px', transition: '0.2s' },
  table: { width: '100%' }
};
