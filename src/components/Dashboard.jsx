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
  Clock,
  Ticket,
  Calendar,
  Hash,
  User
} from 'lucide-react';

export default function Dashboard() {
  const { findings, currentUser } = useContext(AppContext);

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
  const effectiveAgent = isAgentRole ? currentUser.name : selectedAgent;

  const uniqueAgents = useMemo(() => ['All', ...new Set(findings.map(f => f.agentName))], [findings]);
  const uniqueYears = useMemo(() => ['All', ...new Set(findings.map(f => new Date(f.date).getFullYear().toString()))].sort(), [findings]);
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
      if (isAgentRole && audit.agentName.toLowerCase() !== currentUser.name.toLowerCase()) return false;
      if (!isAgentRole && selectedAgent !== 'All' && audit.agentName !== selectedAgent) return false;
      const auditDate = new Date(audit.date);
      if (startDate && new Date(startDate) > auditDate) return false;
      if (endDate && new Date(endDate) < auditDate) return false;
      if (selectedMonth !== 'All' && auditDate.getMonth().toString() !== selectedMonth) return false;
      if (selectedYear !== 'All' && auditDate.getFullYear().toString() !== selectedYear) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return audit.id.toLowerCase().includes(query) || audit.agentName.toLowerCase().includes(query) || (audit.msisdn && audit.msisdn.includes(query));
      }
      return true;
    });
  }, [findings, selectedAgent, startDate, endDate, selectedMonth, selectedYear, searchQuery, currentUser, isAgentRole]);

  const stats = useMemo(() => {
    const total = filteredFindings.length;
    if (total === 0) return { avgScore: 0, totalAudits: 0, topAgent: '-' };
    const avgScore = Math.round(filteredFindings.reduce((acc, f) => acc + f.score, 0) / total);
    const agentScores = {};
    filteredFindings.forEach(f => {
      if (!agentScores[f.agentName]) agentScores[f.agentName] = { sum: 0, count: 0 };
      agentScores[f.agentName].sum += f.score;
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

  const selectedAudit = useMemo(() => findings.find(f => f.id === selectedAuditId), [selectedAuditId, findings]);

  const paginatedFindings = useMemo(() => {
    const sorted = [...filteredFindings].sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField];
      if (sortField === 'date') { aVal = new Date(a.date).getTime(); bVal = new Date(b.date).getTime(); }
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
          <div style={styles.statValue, { fontSize: '14px', fontWeight: 'bold', marginTop: '10px' }}>{stats.topAgent}</div>
        </div>
      </div>

      {/* Filter Card */}
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
                  <tr key={audit.id}>
                    <td>{audit.id}</td>
                    <td>{audit.date}</td>
                    <td style={{ fontWeight: '600' }}>{audit.agentName}</td>
                    <td>{getScoreBadge(audit.score)}</td>
                    <td><button onClick={() => setSelectedAuditId(audit.id)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}><Eye size={12} /></button></td>
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
              <h3>Audit Detail: {selectedAudit.id}</h3>
              <button onClick={() => setSelectedAuditId(null)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              <div className="modal-meta-grid" style={styles.modalMetaGrid}>
                <div className="meta-item"><strong>Agent:</strong> {selectedAudit.agentName}</div>
                <div className="meta-item"><strong>Score:</strong> {selectedAudit.score}%</div>
                <div className="meta-item"><strong>MSISDN:</strong> {selectedAudit.msisdn || '-'}</div>
                <div className="meta-item"><strong>Tiket:</strong> {selectedAudit.noTiket || '-'}</div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '8px' }}>Catatan Auditor:</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{selectedAudit.notes || '-'}</p>
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
  modalCard: { width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
  modalMetaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }
};
