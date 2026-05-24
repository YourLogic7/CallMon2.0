import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Trash2, UserCheck, Plus } from 'lucide-react';

export default function TeamManagement() {
  const { teamLeaders, sdmList, addTeamLeader, deleteTeamLeader, addSDM, deleteSDM } = useContext(AppContext);
  const [tlForm, setTlForm] = useState({ name: '', nik: '' });
  const [sdmForm, setSdmForm] = useState({ name: '', nik: '', teamName: '' });

  return (
    <div className="main-content">
      <div style={styles.header}>
        <h2 style={styles.title}>Teams</h2>
        <p style={styles.subtitle}>Kelola struktur organisasi SDM.</p>
      </div>

      <div className="team-layout" style={styles.layout}>
        {/* TL Section */}
        <div className="glass-card" style={styles.section}>
          <div style={styles.cardHeader}><UserCheck size={16} /><span>Team Leaders</span></div>
          <form onSubmit={async e => { e.preventDefault(); await addTeamLeader(tlForm.name, tlForm.nik); setTlForm({ name: '', nik: '' }); }} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input type="text" className="form-input" placeholder="Nama" value={tlForm.name} onChange={e => setTlForm({...tlForm, name: e.target.value})} required />
            <input type="text" className="form-input" placeholder="NIK" value={tlForm.nik} onChange={e => setTlForm({...tlForm, nik: e.target.value})} required />
            <button type="submit" className="btn-primary" style={{ padding: '10px' }}><Plus size={16} /></button>
          </form>
          <div className="table-container">
            <table>
              <tbody>
                {teamLeaders.map(tl => (
                  <tr key={tl._id}>
                    <td><div style={{ fontWeight: '600' }}>{tl.name}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NIK: {tl.nik}</div></td>
                    <td style={{ textAlign: 'right' }}><button onClick={() => deleteTeamLeader(tl._id)} style={styles.delBtn}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SDM Section */}
        <div className="glass-card" style={styles.section}>
          <div style={styles.cardHeader}><Users size={16} /><span>SDM (Agents)</span></div>
          <form onSubmit={async e => { e.preventDefault(); await addSDM(sdmForm.name, sdmForm.nik, sdmForm.teamName); setSdmForm({ name: '', nik: '', teamName: '' }); }} style={styles.gridForm}>
            <input type="text" className="form-input" placeholder="Nama SDM" value={sdmForm.name} onChange={e => setSdmForm({...sdmForm, name: e.target.value})} required />
            <input type="text" className="form-input" placeholder="NIK" value={sdmForm.nik} onChange={e => setSdmForm({...sdmForm, nik: e.target.value})} required />
            <input type="text" className="form-input" placeholder="Team" value={sdmForm.teamName} onChange={e => setSdmForm({...sdmForm, teamName: e.target.value})} required />
            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 3' }}>Tambah SDM</button>
          </form>
          <div className="table-container">
            <table>
              <thead><tr><th>Nama</th><th>Team</th><th></th></tr></thead>
              <tbody>
                {sdmList.map(s => (
                  <tr key={s._id}>
                    <td><div style={{ fontWeight: '600' }}>{s.name}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NIK: {s.nik}</div></td>
                    <td><span className="badge badge-primary" style={{ fontSize: '10px' }}>{s.teamName}</span></td>
                    <td style={{ textAlign: 'right' }}><button onClick={() => deleteSDM(s._id)} style={styles.delBtn}><Trash2 size={14} /></button></td>
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
  layout: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  section: { flex: '1', minWidth: '320px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: '700', fontSize: '14px' },
  gridForm: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' },
  delBtn: { background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7 }
};
