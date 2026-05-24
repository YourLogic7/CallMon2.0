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

  // Filters State
  const [selectedAgent, setSelectedAgent] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState(null); // Detail modal

  // Table Sort and Pagination State
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isAgentRole = currentUser?.role === 'Agent';
  const effectiveAgent = isAgentRole ? currentUser.name : selectedAgent;

  const uniqueAgents = useMemo(() => {
    const list = findings.map(f => f.agentName);
    return ['All', ...new Set(list)];
  }, [findings]);

  const uniqueYears = useMemo(() => {
    const list = findings.map(f => new Date(f.date).getFullYear().toString());
    return ['All', ...new Set(list)].sort();
  }, [findings]);

  const months = [
    { value: 'All', label: 'Semua Bulan' },
    { value: '0', label: 'Januari' },
    { value: '1', label: 'Februari' },
    { value: '2', label: 'Maret' },
    { value: '3', label: 'April' },
    { value: '4', label: 'Mei' },
    { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' },
    { value: '7', label: 'Agustus' },
    { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' },
    { value: '10', label: 'November' },
    { value: '11', label: 'Desember' }
  ];

  const handleResetFilters = () => {
    setSelectedAgent('All');
    setStartDate('');
    setEndDate('');
    setSelectedMonth('All');
    setSelectedYear('All');
    setSearchQuery('');
  };

  const filteredFindings = useMemo(() => {
    return findings.filter((audit) => {
      if (isAgentRole) {
        if (audit.agentName.toLowerCase() !== currentUser.name.toLowerCase()) return false;
      } else if (selectedAgent !== 'All' && audit.agentName !== selectedAgent) {
        return false;
      }
      const auditDate = new Date(audit.date);
      if (startDate && new Date(startDate) > auditDate) return false;
      if (endDate && new Date(endDate) < auditDate) return false;
      if (selectedMonth !== 'All' && auditDate.getMonth().toString() !== selectedMonth) return false;
      if (selectedYear !== 'All' && auditDate.getFullYear().toString() !== selectedYear) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchId = audit.id.toLowerCase().includes(query);
        const matchNotes = audit.notes?.toLowerCase().includes(query);
        const matchAuditor = audit.auditorName?.toLowerCase().includes(query);
        const matchAgent = audit.agentName?.toLowerCase().includes(query);
        const matchMsisdn = audit.msisdn?.toLowerCase().includes(query);
        if (!matchId && !matchNotes && !matchAuditor && !matchAgent && !matchMsisdn) return false;
      }
      return true;
    });
  }, [findings, selectedAgent, startDate, endDate, selectedMonth, selectedYear, searchQuery, currentUser, isAgentRole]);

  const stats = useMemo(() => {
    const total = filteredFindings.length;
    if (total === 0) return { avgScore: 0, totalAudits: 0, topAgent: '-' };
    const sumScore = filteredFindings.reduce((acc, f) => acc + f.score, 0);
    const avgScore = Math.round(sumScore / total);
    const agentScores = {};
    filteredFindings.forEach(f => {
      if (!agentScores[f.agentName]) {
        agentScores[f.agentName] = { sum: 0, count: 0 };
      }
      agentScores[f.agentName].sum += f.score;
      agentScores[f.agentName].count += 1;
    });
    let topAgentName = '-';
    let maxAvg = -1;
    Object.keys(agentScores).forEach(name => {
      const avg = agentScores[name].sum / agentScores[name].count;
      if (avg > maxAvg) {
        maxAvg = avg;
        topAgentName = name;
      }
    });
    return { avgScore, totalAudits: total, topAgent: topAgentName };
  }, [filteredFindings]);

  const selectedAudit = useMemo(() => {
    if (!selectedAuditId) return null;
    return findings.find(f => f.id === selectedAuditId);
  }, [selectedAuditId, findings]);

  const lineChartData = useMemo(() => {
    const chronFindings = [...filteredFindings].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (chronFindings.length === 0) return [];
    return chronFindings.slice(-10).map(f => ({
      label: f.id,
      score: f.score,
      date: f.date.substring(5)
    }));
  }, [filteredFindings]);

  const barChartData = useMemo(() => {
    const agentScores = {};
    filteredFindings.forEach(f => {
      if (!agentScores[f.agentName]) {
        agentScores[f.agentName] = { sum: 0, count: 0 };
      }
      agentScores[f.agentName].sum += f.score;
      agentScores[f.agentName].count += 1;
    });
    return Object.keys(agentScores).map(name => ({
      name,
      avg: Math.round(agentScores[name].sum / agentScores[name].count)
    })).sort((a, b) => b.avg - a.avg);
  }, [filteredFindings]);

  const sortedFindings = useMemo(() => {
    const sorted = [...filteredFindings];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredFindings, sortField, sortDirection]);

  const paginatedFindings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedFindings.slice(start, start + itemsPerPage);
  }, [sortedFindings, currentPage]);

  const totalPages = Math.ceil(sortedFindings.length / itemsPerPage) || 1;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getScoreBadge = (score, isFatal) => {
    if (isFatal) return <span className="badge badge-danger">FATAL ERROR</span>;
    if (score >= 90) return <span className="badge badge-success">EXCELLENT ({score}%)</span>;
    if (score >= 80) return <span className="badge badge-warning">GOOD ({score}%)</span>;
    return <span className="badge badge-danger">CRITICAL ({score}%)</span>;
  };

  return (
    <div className="main-content" style={{ marginTop: '20px' }}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.dashboardTitle}>QM Performance Dashboard</h2>
          <p style={styles.dashboardSubtitle}>
            Selamat datang, <strong style={{ color: 'var(--primary)' }}>{currentUser?.name}</strong>.
          </p>
        </div>
        <button onClick={handleResetFilters} className="btn-primary" style={styles.resetBtn}>
          <RefreshCw size={16} /> Reset Filter
        </button>
      </div>

      <div className="glass-card" style={styles.filterCard}>
        <div style={styles.cardHeader}>
          <Filter size={18} color="#6366f1" />
          <h3 style={styles.cardTitle}>Filter Pemantauan</h3>
        </div>
        
        <div style={styles.filterGrid}>
          <div className="form-group">
            <label className="form-label">Agent</label>
            <select
              className="form-input"
              value={effectiveAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              disabled={isAgentRole}
              style={styles.select}
            >
              {isAgentRole ? (
                <option value={currentUser.name}>{currentUser.name}</option>
              ) : (
                uniqueAgents.map((agent) => (
                  <option key={agent} value={agent}>{agent === 'All' ? 'Semua Agent' : agent}</option>
                ))
              )}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bulan</label>
            <select
              className="form-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.select}
            >
              {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tahun</label>
            <select
              className="form-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={styles.select}
            >
              {uniqueYears.map((year) => <option key={year} value={year}>{year === 'All' ? 'Semua Tahun' : year}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dari Tanggal</label>
            <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Sampai Tanggal</label>
            <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Rata-rata QMS Score</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(99, 102, 241, 0.1)' }}>
              <TrendingUp color="#6366f1" size={20} />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiValue}>{stats.avgScore}%</span>
          </div>
          <div style={styles.kpiProgressContainer}>
            <div style={{ ...styles.kpiProgressBar, width: `${stats.avgScore}%`, background: stats.avgScore >= 90 ? 'var(--success)' : (stats.avgScore >= 80 ? 'var(--warning)' : 'var(--danger)') }}></div>
          </div>
        </div>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Total Evaluasi Audit</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(168, 85, 247, 0.1)' }}>
              <FileText color="#a855f7" size={20} />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiValue}>{stats.totalAudits}</span>
          </div>
        </div>
        <div className="glass-card" style={stats.topAgent === '-' ? { display: 'none' } : styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Top Agent</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(16, 185, 129, 0.1)' }}>
              <Award color="#10b981" size={20} />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={{ ...styles.kpiValue, fontSize: '18px' }}>{stats.topAgent}</span>
          </div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div className="glass-card" style={styles.chartContainer}>
          <h4 style={styles.chartTitle}>Grafik Tren QM Score</h4>
          {lineChartData.length === 0 ? <div style={styles.emptyChart}>Tidak ada data.</div> : (
            <div style={styles.svgWrapper}>
              <svg width="100%" height="180" viewBox="0 0 500 180" preserveAspectRatio="none">
                <path
                  d={lineChartData.map((d, i) => {
                    const x = 10 + (i * 480) / (lineChartData.length - 1 || 1);
                    const y = 160 - (d.score * 140) / 100;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none" stroke="var(--primary)" strokeWidth="3"
                />
                {lineChartData.map((d, i) => {
                  const x = 10 + (i * 480) / (lineChartData.length - 1 || 1);
                  const y = 160 - (d.score * 140) / 100;
                  return <circle key={i} cx={x} cy={y} r="4" fill="var(--primary)" stroke="#fff" />;
                })}
              </svg>
            </div>
          )}
        </div>
        <div className="glass-card" style={styles.chartContainer}>
          <h4 style={styles.chartTitle}>Rata-rata per Agent</h4>
          <div style={styles.barChartWrapper}>
            {barChartData.map((d) => (
              <div key={d.name} style={styles.barItem}>
                <div style={styles.barLabel}>{d.name.split(' ')[0]}</div>
                <div style={styles.barTrack}><div style={{ ...styles.barFill, width: `${d.avg}%`, background: 'var(--primary)' }}></div></div>
                <div style={styles.barValue}>{d.avg}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card" style={styles.tableCard}>
        <div style={styles.tableCardHeader}>
          <h3 style={styles.cardTitle}>Daftar Temuan Riwayat Audit</h3>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input type="text" placeholder="Cari..." className="form-input" style={styles.searchInput} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th onClick={() => handleSort('id')} style={styles.th}>ID</th>
                <th onClick={() => handleSort('date')} style={styles.th}>Tanggal</th>
                <th onClick={() => handleSort('agentName')} style={styles.th}>Agent</th>
                <th style={styles.th}>Skor</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFindings.length === 0 ? <tr><td colSpan="5" style={styles.tdEmpty}>Kosong.</td></tr> : (
                paginatedFindings.map((audit) => (
                  <tr key={audit.id} style={styles.trBody}>
                    <td style={styles.td}>{audit.id}</td>
                    <td style={styles.td}>{audit.date}</td>
                    <td style={styles.td}>{audit.agentName}</td>
                    <td style={styles.td}>{getScoreBadge(audit.score, audit.isFatal)}</td>
                    <td style={styles.td}><button onClick={() => setSelectedAuditId(audit.id)} style={styles.actionBtn}><Eye size={14} /> Detail</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '10px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <span>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>

      {selectedAudit && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAuditId(null)}>
          <div className="glass-card" style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Hasil Audit: {selectedAudit.id}</h3>
              <button onClick={() => setSelectedAuditId(null)} style={styles.modalCloseBtn}>×</button>
            </div>
            
            <div style={styles.modalScroll}>
              <div style={styles.modalGrid2Col}>
                <div style={styles.modalMeta}>
                  <h4 style={styles.modalSubTitle}>Informasi Audit</h4>
                  <p><User size={12} /> <strong>Agent:</strong> {selectedAudit.agentName}</p>
                  <p><FileText size={12} /> <strong>Auditor:</strong> {selectedAudit.auditorName}</p>
                  <p><Calendar size={12} /> <strong>Tgl Audit:</strong> {selectedAudit.date}</p>
                  <p><Award size={12} /> <strong>Skor:</strong> <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{selectedAudit.score}%</span></p>
                </div>
                
                <div style={styles.modalMeta}>
                  <h4 style={styles.modalSubTitle}>Detail Call</h4>
                  <p><Hash size={12} /> <strong>MSISDN:</strong> {selectedAudit.msisdn || '-'}</p>
                  <p><Ticket size={12} /> <strong>No Tiket:</strong> {selectedAudit.noTiket || '-'}</p>
                  <p><FileText size={12} /> <strong>No CWC:</strong> {selectedAudit.noCWC || '-'}</p>
                  <p><Clock size={12} /> <strong>Call:</strong> {selectedAudit.callDate || '-'} {selectedAudit.callTime || ''} ({selectedAudit.duration || '-'})</p>
                </div>
              </div>

              {QM_CATEGORIES.map(cat => (
                <div key={cat.id} style={styles.modalCategory}>
                  <h4 style={styles.modalCatTitle}>{cat.id}. {cat.name}</h4>
                  <div style={styles.modalParams}>
                    {cat.parameters.map(p => {
                      const isPassed = selectedAudit.paramScores?.[p.id] === 1;
                      const failedIndices = selectedAudit.failedSubParams?.[p.id] || [];
                      return (
                        <div key={p.id} style={styles.modalParamItem}>
                          <div style={styles.modalParamHeader}>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{p.id}. {p.name}</span>
                            {isPassed ? 
                              <span style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 'bold' }}>PASS</span> : 
                              <span style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 'bold' }}>FAIL</span>
                            }
                          </div>
                          {!isPassed && failedIndices.length > 0 && (
                            <ul style={styles.modalSubList}>
                              {failedIndices.map(idx => (
                                <li key={idx} style={styles.modalSubItem}>{p.subParams[idx]}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={styles.modalNotesSec}>
                <h4 style={styles.modalCatTitle}>Catatan Auditor</h4>
                <p style={styles.modalNotesText}>{selectedAudit.notes || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  dashboardTitle: { fontSize: '24px', fontWeight: '700', color: '#fff' },
  dashboardSubtitle: { fontSize: '14px', color: 'var(--text-muted)' },
  filterCard: { padding: '20px', marginBottom: '20px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '600' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' },
  kpiCard: { padding: '20px', minHeight: '100px' },
  kpiHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  kpiTitle: { fontSize: '12px', color: 'var(--text-muted)' },
  kpiValueRow: { marginBottom: '10px' },
  kpiValue: { fontSize: '24px', fontWeight: '700' },
  kpiProgressContainer: { height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden' },
  kpiProgressBar: { height: '100%' },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '20px' },
  chartContainer: { padding: '20px', minHeight: '240px' },
  chartTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '16px' },
  tableCard: { padding: '20px' },
  tableCardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  searchWrapper: { position: 'relative' },
  searchInput: { paddingLeft: '32px', width: '200px' },
  searchIcon: { position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' },
  td: { padding: '12px', fontSize: '13px', borderBottom: '1px solid var(--border-light)' },
  actionBtn: { padding: '4px 8px', fontSize: '11px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-light)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { width: '90%', maxWidth: '750px', maxHeight: '90vh', padding: '24px', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  modalTitle: { fontSize: '18px', fontWeight: '700' },
  modalCloseBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
  modalScroll: { overflowY: 'auto', flex: 1, paddingRight: '10px' },
  modalGrid2Col: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  modalMeta: { padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' },
  modalSubTitle: { fontSize: '12px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px', textTransform: 'uppercase' },
  modalCategory: { marginBottom: '20px' },
  modalCatTitle: { fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' },
  modalParams: { display: 'flex', flexDirection: 'column', gap: '12px' },
  modalParamItem: { padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' },
  modalParamHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalSubList: { marginTop: '8px', paddingLeft: '20px', color: 'var(--danger)' },
  modalSubItem: { fontSize: '12px', marginBottom: '4px' },
  modalNotesSec: { marginTop: '20px' },
  modalNotesText: { fontSize: '13px', fontStyle: 'italic', color: 'var(--text-muted)' },
  select: { cursor: 'pointer' }
};
