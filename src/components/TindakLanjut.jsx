import { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { QM_CATEGORIES } from '../context/qmParameters';
import { 
  FileText, 
  Filter, 
  Search,
  RefreshCw,
  Eye,
  Edit3,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  ClipboardList
} from 'lucide-react';

export default function TindakLanjut() {
  const { findings, currentUser, updateFinding } = useContext(AppContext);

  const [selectedAgent, setSelectedAgent] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [followUpData, setFollowUpData] = useState({
    hasilValidasiTL: '',
    improvement: '',
    pembinaan: ''
  });

  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isTL = currentUser?.role === 'TL';
  const isQC = currentUser?.role === 'QC';
  const isSuperadmin = currentUser?.role === 'superadmin';
  const canEdit = isTL || isSuperadmin;

  const filteredFindings = useMemo(() => {
    return findings.filter((audit) => {
      if (isTL && audit.teamName !== currentUser.name) return false;
      if (selectedAgent !== 'All' && audit.agentName !== selectedAgent) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const auditId = (audit.id || audit._id || '').toString().toLowerCase();
        return auditId.includes(query) || 
               audit.agentName.toLowerCase().includes(query) || 
               (audit.msisdn && audit.msisdn.includes(query));
      }
      return true;
    });
  }, [findings, selectedAgent, searchQuery, currentUser, isTL]);

  const uniqueAgents = useMemo(() => ['All', ...new Set(filteredFindings.map(f => f.agentName))], [filteredFindings]);

  const selectedAudit = useMemo(() => findings.find(f => (f.id || f._id) === selectedAuditId), [selectedAuditId, findings]);

  const paginatedFindings = useMemo(() => {
    const sorted = [...filteredFindings].sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField];
      if (sortField === 'date') { 
        aVal = new Date(a.date).getTime() || 0; 
        bVal = new Date(b.date).getTime() || 0; 
      }
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredFindings, sortField, sortDirection, currentPage]);

  const totalPages = Math.ceil(filteredFindings.length / itemsPerPage) || 1;

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
    setCurrentPage(1);
  };

  const handleViewDetails = (audit) => {
    setSelectedAuditId(audit.id || audit._id);
    setFollowUpData({
      hasilValidasiTL: audit.hasilValidasiTL || '',
      improvement: audit.improvement || '',
      pembinaan: audit.pembinaan || ''
    });
    setIsEditing(false);
  };

  const handleEdit = (audit) => {
    setSelectedAuditId(audit.id || audit._id);
    setFollowUpData({
      hasilValidasiTL: audit.hasilValidasiTL || '',
      improvement: audit.improvement || '',
      pembinaan: audit.pembinaan || ''
    });
    setIsEditing(true);
  };

  const handleSubmitFollowUp = async (e) => {
    e.preventDefault();
    // Add current timestamp as followUpAt
    const res = await updateFinding(selectedAuditId, {
      ...followUpData,
      followUpAt: new Date()
    });
    if (res.success) {
      alert('Tindak lanjut berhasil disimpan!');
      setIsEditing(false);
    } else {
      alert('Gagal menyimpan tindak lanjut: ' + res.message);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return <span className="badge badge-success">{score}%</span>;
    if (score >= 80) return <span className="badge badge-warning">{score}%</span>;
    return <span className="badge badge-danger">{score}%</span>;
  };

  const pembinaanOptions = [
    '',
    'Coaching 1', 'Coaching 2', 'Coaching 3',
    'Konseling 1', 'Konseling 2', 'Konseling 3',
    'BATL 1', 'BATL 2', 'BATL 3',
    'SP 1', 'SP 2', 'SP 3'
  ];

  return (
    <div className="main-content">
      <div className="header-row" style={styles.headerRow}>
        <div style={{ flex: 1 }}>
          <h2 style={styles.title}>Tindak Lanjut Finding</h2>
          <p style={styles.subtitle}>
            {isTL ? `Kelola temuan untuk Team ${currentUser.name}` : 'Monitor tindak lanjuti temuan audit agent.'}
          </p>
        </div>
      </div>

      <div className="glass-card filter-card" style={styles.filterCard}>
        <div style={styles.cardHeader}><Filter size={16} /><span>Filter Temuan</span></div>
        <div className="filter-grid" style={styles.filterGrid}>
          <div className="form-group">
            <label className="form-label">Agent</label>
            <select className="form-input" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              {uniqueAgents.map(a => <option key={a} value={a}>{a === 'All' ? 'Semua Agent' : a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" style={{ paddingLeft: '32px' }} placeholder="ID, Agent, MSISDN..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card table-card" style={{ marginTop: '24px' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID</th>
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Tanggal</th>
                <th onClick={() => handleSort('agentName')} style={{ cursor: 'pointer' }}>Agent</th>
                <th>Skor</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFindings.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Tidak ada data temuan.</td></tr> : (
                paginatedFindings.map(audit => (
                  <tr key={audit.id || audit._id}>
                    <td>{(audit.id || audit._id || '').toString().slice(-6)}</td>
                    <td>{audit.date}</td>
                    <td style={{ fontWeight: '600' }}>{audit.agentName}</td>
                    <td>{getScoreBadge(audit.score)}</td>
                    <td>
                      {audit.pembinaan ? (
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>Selesai</span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: '10px' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleViewDetails(audit)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }} title="Lihat Detail"><Eye size={12} /></button>
                        {canEdit && (
                          <button onClick={() => handleEdit(audit)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--secondary)' }} title="Tindak Lanjut"><Edit3 size={12} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={styles.pagination}>
          <button className="btn-primary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 12px' }}>Prev</button>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{currentPage} / {totalPages}</span>
          <button className="btn-primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 12px' }}>Next</button>
        </div>
      </div>

      {selectedAudit && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAuditId(null)}>
          <div className="glass-card modal-card" style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{isEditing ? 'Tindak Lanjut' : 'Detail Finding'}: {(selectedAudit.id || selectedAudit._id || '').toString()}</h3>
              <button onClick={() => setSelectedAuditId(null)} style={styles.closeBtn}>&times;</button>
            </div>
            
            <div style={styles.modalBody}>
              <div className="modal-meta-grid" style={styles.modalMetaGrid}>
                <div className="meta-item"><strong>Agent:</strong> {selectedAudit.agentName}</div>
                <div className="meta-item"><strong>Score:</strong> {selectedAudit.score}%</div>
                <div className="meta-item"><strong>MSISDN:</strong> {selectedAudit.msisdn || '-'}</div>
                <div className="meta-item"><strong>Tiket:</strong> {selectedAudit.noTiket || '-'}</div>
                <div className="meta-item"><strong>Auditor:</strong> {selectedAudit.auditorName} ({selectedAudit.auditorRole})</div>
                <div className="meta-item"><strong>Tanggal:</strong> {selectedAudit.date}</div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                <h4 style={{ ...styles.secTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={16} /> Form Tindak Lanjut TL
                </h4>
                
                {isEditing ? (
                  <form onSubmit={handleSubmitFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Hasil Validasi TL</label>
                      <textarea 
                        className="form-input" 
                        rows="3" 
                        value={followUpData.hasilValidasiTL}
                        onChange={e => setFollowUpData({...followUpData, hasilValidasiTL: e.target.value})}
                        placeholder="Masukkan hasil validasi..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Improvement</label>
                      <textarea 
                        className="form-input" 
                        rows="3" 
                        value={followUpData.improvement}
                        onChange={e => setFollowUpData({...followUpData, improvement: e.target.value})}
                        placeholder="Rencana perbaikan..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pembinaan</label>
                      <select 
                        className="form-input" 
                        value={followUpData.pembinaan}
                        onChange={e => setFollowUpData({...followUpData, pembinaan: e.target.value})}
                        required
                      >
                        <option value="" disabled>Pilih Jenis Pembinaan</option>
                        {pembinaanOptions.filter(o => o !== '').map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                      <CheckCircle size={16} style={{ marginRight: '8px' }} /> Simpan Tindak Lanjut
                    </button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div style={styles.followUpViewItem}>
                      <strong>Hasil Validasi TL:</strong>
                      <p>{selectedAudit.hasilValidasiTL || '-'}</p>
                    </div>
                    <div style={styles.followUpViewItem}>
                      <strong>Improvement:</strong>
                      <p>{selectedAudit.improvement || '-'}</p>
                    </div>
                    <div style={styles.followUpViewItem}>
                      <strong>Pembinaan:</strong>
                      <p>{selectedAudit.pembinaan ? <span className="badge badge-primary">{selectedAudit.pembinaan}</span> : '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerRow: { display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' },
  title: { fontSize: '22px', fontWeight: '800' },
  subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
  filterCard: { padding: '16px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '700' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalCard: { width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
  modalMetaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' },
  secTitle: { fontSize: '13px', fontWeight: '800', marginBottom: '10px', color: 'var(--primary)' },
  paramGrid: { background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' },
  followUpViewItem: { fontSize: '12px', color: 'var(--text-muted)' }
};
