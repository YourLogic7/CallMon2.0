import { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { QM_CATEGORIES } from '../context/qmParameters';
import { 
  TrendingUp, 
  Award, 
  FileText, 
  Filter, 
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Clock,
  Ticket,
  Calendar,
  Hash,
  User,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Dashboard() {
  const { findings, currentUser, deleteFinding } = useContext(AppContext);

  const [selectedAgent, setSelectedAgent] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isAgentRole = currentUser?.role === 'Agent';
  const canDelete = ['superadmin', 'QC', 'TL'].includes(currentUser?.role);
  const effectiveAgent = isAgentRole ? currentUser.name : selectedAgent;

  const uniqueAgents = useMemo(() => ['All', ...new Set(findings.map(f => f.agentName))], [findings]);
  const uniqueYears = useMemo(() => ['All', ...new Set(findings.map(f => {
    const d = new Date(f.date);
    return isNaN(d.getTime()) ? 'Unknown' : d.getFullYear().toString();
  }))].sort(), [findings]);

  const months = [
    { value: 'All', label: 'Semua Bulan' }, { value: '0', label: 'Jan' }, { value: '1', label: 'Feb' },
    { value: '2', label: 'Mar' }, { value: '3', label: 'Apr' }, { value: '4', label: 'Mei' },
    { value: '5', label: 'Jun' }, { value: '6', label: 'Jul' }, { value: '7', label: 'Agu' },
    { value: '8', label: 'Sep' }, { value: '9', label: 'Okt' }, { value: '10', label: 'Nov' }, { value: '11', label: 'Des' }
  ];

  const handleResetFilters = () => {
    setSelectedAgent('All'); setStartDate(''); setEndDate(''); setSelectedMonth('All'); setSelectedYear('All'); setSearchQuery('');
  };

  const filteredFindings = useMemo(() => {
    return findings.filter((audit) => {
      // Filter by username for Agent role
      if (isAgentRole && audit.agentUsername !== currentUser.username) return false;
      
      if (!isAgentRole && selectedAgent !== 'All' && audit.agentName !== selectedAgent) return false;
      
      const auditDate = new Date(audit.date);
      if (startDate && new Date(startDate) > auditDate) return false;
      if (endDate && new Date(endDate) < auditDate) return false;
      if (selectedMonth !== 'All' && auditDate.getMonth().toString() !== selectedMonth) return false;
      if (selectedYear !== 'All' && auditDate.getFullYear().toString() !== selectedYear) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const auditId = (audit.id || audit._id || '').toString().toLowerCase();
        return auditId.includes(query) || 
               audit.agentName.toLowerCase().includes(query) || 
               (audit.msisdn && audit.msisdn.includes(query));
      }
      return true;
    });
  }, [findings, selectedAgent, startDate, endDate, selectedMonth, selectedYear, searchQuery, currentUser, isAgentRole]);

  const stats = useMemo(() => {
    const total = filteredFindings.length;
    if (total === 0) return { avgScore: 0, totalAudits: 0, topAgent: '-' };
    const avgScore = Math.round(filteredFindings.reduce((acc, f) => acc + (f.score || 0), 0) / total);
    const agentScores = {};
    filteredFindings.forEach(f => {
      if (!agentScores[f.agentName]) agentScores[f.agentName] = { sum: 0, count: 0 };
      agentScores[f.agentName].sum += (f.score || 0);
      agentScores[f.agentName].count += 1;
    });
    let topAgentName = '-';
    let maxAvg = -1;
    Object.keys(agentScores).forEach(name => {
      const avg = agentScores[name].sum / agentScores[name].count;
      if (avg > maxAvg) { maxAvg = avg; topAgentName = name; }
    });
    return { avgScore, totalAudits: total, topAgent: topAgentName };
  }, [filteredFindings]);

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

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data audit ini?')) {
      const res = await deleteFinding(id);
      if (!res.success) alert(res.message);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return <span className="badge badge-success">{score}%</span>;
    if (score >= 80) return <span className="badge badge-warning">{score}%</span>;
    return <span className="badge badge-danger">{score}%</span>;
  };

  return (
    <div className="main-content">
      <div className="header-row" style={styles.headerRow}>
        <div style={{ flex: 1 }}>
          <h2 style={styles.title}>QM Performance</h2>
          <p style={styles.subtitle}>Ringkasan performa audit agent.</p>
        </div>
        <button onClick={handleResetFilters} className="btn-primary" style={styles.resetBtn}>
          <RefreshCw size={14} /> Reset
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={styles.statsGrid}>
        <div className="glass-card stat-card" style={styles.statCard}>
          <div style={styles.statHeader}><span>Rata-rata QMS</span><TrendingUp size={16} color="var(--primary)" /></div>
          <div style={styles.statValue}>{stats.avgScore}%</div>
        </div>
        <div className="glass-card stat-card" style={styles.statCard}>
          <div style={styles.statHeader}><span>Total Audit</span><FileText size={16} color="var(--secondary)" /></div>
          <div style={styles.statValue}>{stats.totalAudits}</div>
        </div>
        <div className="glass-card stat-card" style={styles.statCard}>
          <div style={styles.statHeader}><span>Top Agent</span><Award size={16} color="var(--success)" /></div>
          <div style={{ ...styles.statValue, fontSize: '14px', fontWeight: 'bold', marginTop: '10px' }}>{stats.topAgent}</div>
        </div>
      </div>

      <div className="glass-card filter-card" style={styles.filterCard}>
        <div style={styles.cardHeader}><Filter size={16} /><span>Filter Pemantauan</span></div>
        <div className="filter-grid" style={styles.filterGrid}>
          <div className="form-group">
            <label className="form-label">Agent</label>
            <select className="form-input" value={effectiveAgent} onChange={(e) => setSelectedAgent(e.target.value)} disabled={isAgentRole}>
              {uniqueAgents.map(a => <option key={a} value={a}>{a === 'All' ? 'Semua Agent' : a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bulan</label>
            <select className="form-input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
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

      {/* Table Card */}
      <div className="glass-card table-card" style={{ marginTop: '24px' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID</th>
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Tanggal</th>
                <th onClick={() => handleSort('agentName')} style={{ cursor: 'pointer' }}>Agent</th>
                <th>Skor</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFindings.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Tidak ada data audit.</td></tr> : (
                paginatedFindings.map(audit => (
                  <tr key={audit.id || audit._id}>
                    <td>{(audit.id || audit._id || '').toString().slice(-6)}</td>
                    <td>{audit.date}</td>
                    <td style={{ fontWeight: '600' }}>{audit.agentName}</td>
                    <td>{getScoreBadge(audit.score)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setSelectedAuditId(audit.id || audit._id)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}><Eye size={12} /></button>
                        {canDelete && (
                          <button onClick={() => handleDelete(audit.id || audit._id)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--danger)' }}><Trash2 size={12} /></button>
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

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAuditId(null)}>
          <div className="glass-card modal-card" style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Audit Detail: {(selectedAudit.id || selectedAudit._id || '').toString()}</h3>
              <button onClick={() => setSelectedAuditId(null)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div className="modal-meta-grid" style={styles.modalMetaGrid}>
                <div className="meta-item"><strong>Agent:</strong> {selectedAudit.agentName}</div>
                <div className="meta-item"><strong>Score:</strong> {selectedAudit.score}%</div>
                <div className="meta-item"><strong>MSISDN:</strong> {selectedAudit.msisdn || '-'}</div>
                <div className="meta-item"><strong>Tiket:</strong> {selectedAudit.noTiket || '-'}</div>
                <div className="meta-item"><strong>Auditor:</strong> {selectedAudit.auditorName || '-'}</div>
                <div className="meta-item"><strong>Tanggal:</strong> {selectedAudit.date}</div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={styles.secTitle}>Hasil Parameter:</h4>
                <div style={styles.paramGrid}>
                  {QM_CATEGORIES.map(cat => (
                    <div key={cat.id} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--primary)', borderBottom: '1px solid var(--border-light)' }}>
                        {cat.name}
                      </div>
                      {cat.parameters.map(p => {
                        const isSuccess = (selectedAudit.paramScores || {})[p.id] === 1;
                        const failedSubs = (selectedAudit.failedSubParams || {})[p.id] || [];
                        return (
                          <div key={p.id} style={{ marginBottom: '4px', fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: isSuccess ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>
                                {isSuccess ? '✓' : '✗'} {p.name}
                              </span>
                              <span>{isSuccess ? p.weight : 0}/{p.weight}</span>
                            </div>
                            {!isSuccess && failedSubs.length > 0 && (
                              <div style={{ paddingLeft: '14px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '10px' }}>
                                {failedSubs.map(idx => p.subParams[idx]).join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={styles.secTitle}>Catatan Auditor:</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                  {selectedAudit.notes || 'Tidak ada catatan.'}
                </p>
              </div>

              {/* TL Follow-up Results */}
              {(selectedAudit.hasilValidasiTL || selectedAudit.improvement || selectedAudit.pembinaan) && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <h4 style={styles.secTitle}>Hasil Tindak Lanjut TL:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', background: 'rgba(99, 102, 241, 0.05)', padding: '12px', borderRadius: '10px' }}>
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>Validasi:</strong>
                      <p style={{ marginTop: '4px' }}>{selectedAudit.hasilValidasiTL || '-'}</p>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>Improvement:</strong>
                      <p style={{ marginTop: '4px' }}>{selectedAudit.improvement || '-'}</p>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>Pembinaan:</strong>
                      <div style={{ marginTop: '4px' }}>
                        {selectedAudit.pembinaan ? <span className="badge badge-primary">{selectedAudit.pembinaan}</span> : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
  resetBtn: { padding: '8px 16px', fontSize: '13px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  statHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' },
  statValue: { fontSize: '24px', fontWeight: '800' },
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
  paramGrid: { background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }
};
