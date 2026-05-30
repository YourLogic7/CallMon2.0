import { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { QM_CATEGORIES } from '../context/qmParameters';
import * as XLSX from 'xlsx';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  FileText, 
  Filter, 
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function Dashboard() {
  const { findings, currentUser, deleteFinding } = useContext(AppContext);

  const [selectedAgent, setSelectedAgent] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedWeek, setSelectedWeek] = useState('All');
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

  const weeks = ['All', 'Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const handleResetFilters = () => {
    setSelectedAgent('All'); setStartDate(''); setEndDate(''); setSelectedMonth('All'); setSelectedYear('All'); setSelectedWeek('All'); setSearchQuery('');
  };

  const filteredFindings = useMemo(() => {
    return findings.filter((audit) => {
      if (isAgentRole && audit.agentUsername !== currentUser.username) return false;
      if (!isAgentRole && selectedAgent !== 'All' && audit.agentName !== selectedAgent) return false;
      
      const auditDate = new Date(audit.date);
      if (startDate && new Date(startDate) > auditDate) return false;
      if (endDate && new Date(endDate) < auditDate) return false;
      if (selectedMonth !== 'All' && auditDate.getMonth().toString() !== selectedMonth) return false;
      if (selectedYear !== 'All' && auditDate.getFullYear().toString() !== selectedYear) return false;
      if (selectedWeek !== 'All' && audit.week !== selectedWeek) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const auditId = (audit.id || audit._id || '').toString().toLowerCase();
        return auditId.includes(query) || 
               audit.agentName.toLowerCase().includes(query) || 
               (audit.msisdn && audit.msisdn.includes(query));
      }
      return true;
    });
  }, [findings, selectedAgent, startDate, endDate, selectedMonth, selectedYear, selectedWeek, searchQuery, currentUser, isAgentRole]);

  const activeCoaching = useMemo(() => {
    // Only determine active coaching if an agent is specifically targeted (either by role or filter)
    const targetAgent = isAgentRole ? currentUser.name : (selectedAgent !== 'All' ? selectedAgent : null);
    if (!targetAgent) return null;

    const now = new Date();
    // Get all findings for this agent that have a pembinaan
    const agentFindings = findings.filter(f => f.agentName === targetAgent && f.pembinaan && f.followUpAt);
    
    // Check for each if it's still active
    const active = agentFindings.find(f => {
      const followUpDate = new Date(f.followUpAt);
      const diffMs = now - followUpDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const diffMonths = diffDays / 30.44; // Approx

      if (f.pembinaan.toLowerCase().includes('coaching')) {
        return diffDays <= 7;
      } else {
        // Konseling, BATL, SP
        return diffMonths <= 6;
      }
    });

    return active ? active.pembinaan : null;
  }, [findings, currentUser, selectedAgent, isAgentRole]);

  const stats = useMemo(() => {
    const total = filteredFindings.length;
    const qcFindings = filteredFindings.filter(f => ['QC', 'superadmin'].includes(f.auditorRole));
    const totalQC = qcFindings.length;

    if (total === 0) return { avgScore: 0, totalAudits: 0, topAgent: '-', qcCount: 0 };
    
    const avgScore = totalQC > 0 
      ? Math.round(qcFindings.reduce((acc, f) => acc + (f.score || 0), 0) / totalQC)
      : 0;

    const agentScores = {};
    qcFindings.forEach(f => {
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
    
    return { avgScore, totalAudits: total, topAgent: topAgentName, qcCount: totalQC };
  }, [filteredFindings]);

  const trendData = useMemo(() => {
    const wks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return wks.map(w => {
      const weekFindings = filteredFindings.filter(f => f.week === w && ['QC', 'superadmin'].includes(f.auditorRole));
      const avg = weekFindings.length > 0 
        ? Math.round(weekFindings.reduce((acc, f) => acc + (f.score || 0), 0) / weekFindings.length)
        : null;
      return { name: w, score: avg };
    }).filter(d => d.score !== null);
  }, [filteredFindings]);

  const gaugeData = [
    { name: 'Score', value: stats.avgScore },
    { name: 'Gap', value: 100 - stats.avgScore }
  ];
  const COLORS = ['#6366f1', 'rgba(255,255,255,0.05)'];

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

  const handleExportExcel = () => {
    const data = filteredFindings.map(f => {
      const baseData = {
        ID: (f.id || f._id || '').toString(),
        Tanggal: f.date,
        Week: f.week || '-',
        Agent: f.agentName,
        Score: f.score,
        Auditor: f.auditorName,
        Role: f.auditorRole,
        StatusTL: f.pembinaan ? 'Selesai' : 'Pending',
        ValidasiTL: f.hasilValidasiTL || '-',
        Improvement: f.improvement || '-',
        Pembinaan: f.pembinaan || '-',
        MSISDN: f.msisdn || '-',
        NoTiket: f.noTiket || '-',
        Notes: f.notes || ''
      };

      QM_CATEGORIES.forEach(cat => {
        cat.parameters.forEach(p => {
          baseData[`${p.id}. ${p.name}`] = (f.paramScores || {})[p.id] === 1 ? 1 : 0;
        });
      });

      return baseData;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Findings");
    XLSX.writeFile(workbook, `QM_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportExcel} className="btn-primary" style={{ ...styles.resetBtn, background: 'var(--success)' }}>
            <Download size={14} /> Excel
          </button>
          <button onClick={handleResetFilters} className="btn-primary" style={styles.resetBtn}>
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Active Coaching Alert */}
      {activeCoaching && (
        <div className="glass-card" style={styles.activeAlert}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.alertIcon}><Info size={20} color="#fff" /></div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>PEMBINAAN AKTIF</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                {isAgentRole ? 'Anda' : effectiveAgent} sedang dalam masa pembinaan: <strong>{activeCoaching}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid" style={styles.dashboardGrid}>
        <div className="glass-card" style={styles.analyticsCard}>
          <div style={{ display: 'flex', gap: '20px', height: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '220px', textAlign: 'center', marginTop: '-20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '0px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>QMS PERFORMANCE (QC ONLY)</div>
              <div style={{ height: '220px', position: 'relative', marginTop: '-10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%"
                      cy="80%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {gaugeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', bottom: '55px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#fff', textShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>{stats.avgScore}%</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>TARGET: 95%</div>
                </div>
              </div>
            </div>

            <div style={{ flex: '2', minWidth: '300px', height: '180px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>WEEKLY TREND PROGRESSION</div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-light)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={4} dot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={styles.statsGridMini}>
          <div className="glass-card stat-card" style={styles.statCard}>
            <div style={styles.statHeader}><span>Total Monitoring</span><FileText size={16} color="var(--secondary)" /></div>
            <div style={styles.statValue}>{stats.totalAudits}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{stats.qcCount} QC Audits</div>
          </div>
          <div className="glass-card stat-card" style={styles.statCard}>
            <div style={styles.statHeader}><span>Top Performance</span><Award size={16} color="var(--success)" /></div>
            <div style={{ ...styles.statValue, fontSize: '18px', marginTop: '5px' }}>{stats.topAgent}</div>
          </div>
        </div>
      </div>

      <div className="glass-card filter-card" style={{ ...styles.filterCard, marginTop: '24px' }}>
        <div style={styles.cardHeader}><Filter size={16} /><span>Filter Monitoring</span></div>
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
            <label className="form-label">Tahun</label>
            <select className="form-input" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {uniqueYears.map(y => <option key={y} value={y}>{y === 'All' ? 'Semua Tahun' : y}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Periode Week</label>
            <select className="form-input" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
              {weeks.map(w => <option key={w} value={w}>{w === 'All' ? 'Semua Minggu' : w}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
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
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Tanggal <Clock size={10} style={{ display: 'inline' }} /></th>
                <th>Week</th>
                <th onClick={() => handleSort('agentName')} style={{ cursor: 'pointer' }}>Agent</th>
                <th>Skor QMS</th>
                <th>Status TL</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFindings.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Tidak ada data audit.</td></tr> : (
                paginatedFindings.map(audit => (
                  <tr key={audit.id || audit._id} style={{ opacity: audit.auditorRole === 'TL' ? 0.8 : 1 }}>
                    <td>{audit.date}</td>
                    <td><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{audit.week || '-'}</span></td>
                    <td style={{ fontWeight: '600' }}>{audit.agentName}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {getScoreBadge(audit.score)}
                        {audit.auditorRole === 'TL' && <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Reminding Only</span>}
                      </div>
                    </td>
                    <td>
                      {audit.pembinaan ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '11px', fontWeight: '600' }}>
                          <CheckCircle size={12} /> Selesai
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontSize: '11px', fontWeight: '600' }}>
                          <AlertCircle size={12} /> Pending
                        </div>
                      )}
                    </td>
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
                <div className="meta-item"><strong>Auditor:</strong> {selectedAudit.auditorName} ({selectedAudit.auditorRole})</div>
                <div className="meta-item"><strong>Periode:</strong> {selectedAudit.week || '-'}</div>
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
                        {selectedAudit.pembinaan ? <span className="badge badge-primary">{selectedAudit.pembinaan}</span> : <span className="badge badge-warning">Belum Dilakukan</span>}
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
  dashboardGrid: { display: 'grid', gridTemplateColumns: '1.8fr 0.8fr', gap: '20px', marginBottom: '24px' },
  analyticsCard: { padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '300px' },
  statsGridMini: { display: 'flex', flexDirection: 'column', gap: '20px' },
  statCard: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  statHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' },
  statValue: { fontSize: '24px', fontWeight: '800' },
  filterCard: { padding: '20px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '700' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalCard: { width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
  modalMetaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' },
  secTitle: { fontSize: '13px', fontWeight: '800', marginBottom: '10px', color: 'var(--primary)' },
  paramGrid: { background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' },
  activeAlert: { background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', marginBottom: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'glow 2s infinite alternate' },
  alertIcon: { width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }
};

// Responsive Overrides
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 1024px) {
      div[style*="dashboardGrid"] { grid-template-columns: 1fr !important; }
      div[style*="statsGridMini"] { flex-direction: row !important; }
    }
    @keyframes glow {
      from { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
      to { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
    }
  `;
  document.head.appendChild(style);
}
