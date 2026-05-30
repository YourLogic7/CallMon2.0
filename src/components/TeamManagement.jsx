import { useState, useContext, useMemo, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Trash2, UserCheck, Plus, ShieldCheck, Contact, Upload } from 'lucide-react';
import Papa from 'papaparse';

export default function TeamManagement() {
  const { 
    teamLeaders, addTeamLeader, deleteTeamLeader, 
    sdmList, addSDM, deleteSDM, 
    users, addTeamLeadersBatch, addSdmBatch 
  } = useContext(AppContext);

  const [tlForm, setTlForm] = useState({ name: '', nik: '' });
  const [sdmForm, setSdmForm] = useState({ name: '', nik: '', teamName: '' });
  
  const tlFileInputRef = useRef(null);
  const sdmFileInputRef = useRef(null);

  // Get users with role 'Agent' that aren't already in sdmList (or allow re-mapping)
  const agentUsers = useMemo(() => {
    return users.filter(u => u.role === 'Agent');
  }, [users]);

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

  const handleSdmNikChange = (e) => {
    const selectedNik = e.target.value;
    const user = agentUsers.find(u => u.username === selectedNik);
    setSdmForm({
      ...sdmForm,
      nik: selectedNik,
      name: user ? user.name : ''
    });
  };

  const handleTlFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const res = await addTeamLeadersBatch(results.data);
          if (res.success) {
            alert(`Berhasil mengimpor ${results.data.length} Team Leader!`);
          } else {
            alert(res.message);
          }
          e.target.value = null;
        }
      });
    }
  };

  const handleSdmFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          // Filter: only allow SDM whose NIK exists in User data
          const registeredUsernames = new Set(users.map(u => u.username));
          const validData = [];
          const invalidNiks = [];

          results.data.forEach(item => {
            if (registeredUsernames.has(item.nik)) {
              validData.push(item);
            } else {
              invalidNiks.push(item.nik);
            }
          });

          if (invalidNiks.length > 0) {
            alert(`Gagal impor ${invalidNiks.length} data karena NIK tidak terdaftar di User: ${invalidNiks.join(', ')}`);
          }

          if (validData.length > 0) {
            const res = await addSdmBatch(validData);
            if (res.success) {
              alert(`Berhasil mengimpor ${validData.length} SDM!`);
            } else {
              alert(res.message);
            }
          }
          e.target.value = null;
        }
      });
    }
  };

  return (
    <div className="main-content">
      <div style={styles.header}>
        <h2 style={styles.title}>Team & SDM Management</h2>
        <p style={styles.subtitle}>Atur struktur organisasi dan penempatan agent CallMon2.0</p>
      </div>

      <div className="team-layout" style={styles.layout}>
        {/* TL Section */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <h3 style={styles.cardTitle}>Data Team Leader</h3>
            </div>
            <div>
              <input type="file" accept=".csv" ref={tlFileInputRef} style={{ display: 'none' }} onChange={handleTlFileUpload} />
              <button className="btn-primary" style={{ background: 'var(--success)', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => tlFileInputRef.current.click()}>
                <Upload size={14} /> Import
              </button>
            </div>
          </div>

          <form onSubmit={handleTlSubmit} style={styles.formInline}>
            <input type="text" className="form-input" style={{ flex: 1.5 }} placeholder="Nama TL" value={tlForm.name} onChange={e => setTlForm({ ...tlForm, name: e.target.value })} required />
            <input type="text" className="form-input" style={{ flex: 1 }} placeholder="NIK TL" value={tlForm.nik} onChange={e => setTlForm({ ...tlForm, nik: e.target.value })} required />
            <button type="submit" className="btn-primary" style={{ padding: '10px' }}><Plus size={18} /></button>
          </form>

          <div className="table-container" style={{ marginTop: '20px' }}>
            <table style={styles.table}>
              <thead>
                <tr><th>Nama TL</th><th>NIK</th><th style={{ textAlign: 'right' }}>Aksi</th></tr>
              </thead>
              <tbody>
                {teamLeaders.map(tl => (
                  <tr key={tl._id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={14} color="var(--primary)" /> {tl.name}</div></td>
                    <td><code style={{ fontSize: '11px' }}>{tl.nik}</code></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => deleteTeamLeader(tl._id)} style={styles.delBtn}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SDM Section */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Contact size={20} color="var(--success)" />
              <h3 style={styles.cardTitle}>Data SDM Agent</h3>
            </div>
            <div>
              <input type="file" accept=".csv" ref={sdmFileInputRef} style={{ display: 'none' }} onChange={handleSdmFileUpload} />
              <button className="btn-primary" style={{ background: 'var(--success)', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => sdmFileInputRef.current.click()}>
                <Upload size={14} /> Import
              </button>
            </div>
          </div>

          <form onSubmit={handleSdmSubmit} style={styles.formVertical}>
            <div style={styles.grid2}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '11px' }}>NIK Agent (Username)</label>
                <select className="form-input" value={sdmForm.nik} onChange={handleSdmNikChange} required>
                  <option value="">Pilih NIK / Username</option>
                  {agentUsers.map(u => (
                    <option key={u.username} value={u.username}>{u.username} - {u.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '11px' }}>Nama Lengkap</label>
                <input type="text" className="form-input" placeholder="Otomatis terisi" value={sdmForm.name} readOnly style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '11px' }}>Pilih Team Leader</label>
                <select className="form-input" value={sdmForm.teamName} onChange={e => setSdmForm({ ...sdmForm, teamName: e.target.value })} required>
                  <option value="">Pilih TL...</option>
                  {teamLeaders.map(tl => <option key={tl.nik} value={tl.name}>{tl.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 20px' }}>Tambah Agent</button>
            </div>
          </form>

          <div className="table-container" style={{ marginTop: '20px' }}>
            <table style={styles.table}>
              <thead>
                <tr><th>Nama Agent</th><th>NIK</th><th>Team</th><th style={{ textAlign: 'right' }}>Aksi</th></tr>
              </thead>
              <tbody>
                {sdmList.map(sdm => (
                  <tr key={sdm._id}>
                    <td style={{ fontWeight: '700' }}>{sdm.name}</td>
                    <td><code style={{ fontSize: '11px' }}>{sdm.nik}</code></td>
                    <td><span className="badge badge-primary" style={{ fontSize: '10px' }}>{sdm.teamName}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => deleteSDM(sdm._id)} style={styles.delBtn}><Trash2 size={14} /></button>
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
  layout: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { padding: '24px' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' },
  cardTitle: { fontSize: '16px', fontWeight: '700' },
  formInline: { display: 'flex', gap: '10px', marginBottom: '10px' },
  formVertical: { display: 'flex', flexDirection: 'column', gap: '12px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  avatarMini: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' },
  delBtn: { background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6, padding: '8px', borderRadius: '6px', transition: '0.2s' },
  table: { width: '100%' }
};
