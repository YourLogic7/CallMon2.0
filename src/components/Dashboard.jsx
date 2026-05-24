import { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  FileText, 
  Filter, 
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye
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

  // Lock agent filter if current user is an Agent
  const isAgentRole = currentUser?.role === 'Agent';
  const effectiveAgent = isAgentRole ? currentUser.name : selectedAgent;

  // Extract unique agents for filtering dropdown
  const uniqueAgents = useMemo(() => {
    const list = findings.map(f => f.agentName);
    return ['All', ...new Set(list)];
  }, [findings]);

  // Extract unique years for filtering dropdown
  const uniqueYears = useMemo(() => {
    const list = findings.map(f => new Date(f.date).getFullYear().toString());
    return ['All', ...new Set(list)].sort();
  }, [findings]);

  // Months array for filtering
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

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedAgent('All');
    setStartDate('');
    setEndDate('');
    setSelectedMonth('All');
    setSelectedYear('All');
    setSearchQuery('');
  };

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return findings.filter((audit) => {
      // 1. Agent Filter
      if (isAgentRole) {
        if (audit.agentName.toLowerCase() !== currentUser.name.toLowerCase()) return false;
      } else if (selectedAgent !== 'All' && audit.agentName !== selectedAgent) {
        return false;
      }

      // 2. Date Range Filter
      const auditDate = new Date(audit.date);
      if (startDate && new Date(startDate) > auditDate) return false;
      if (endDate && new Date(endDate) < auditDate) return false;

      // 3. Month & Year Filter
      if (selectedMonth !== 'All' && auditDate.getMonth().toString() !== selectedMonth) return false;
      if (selectedYear !== 'All' && auditDate.getFullYear().toString() !== selectedYear) return false;

      // 4. Search Queries (ID, Notes, Auditor Name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchId = audit.id.toLowerCase().includes(query);
        const matchNotes = audit.notes?.toLowerCase().includes(query);
        const matchAuditor = audit.auditorName?.toLowerCase().includes(query);
        const matchAgent = audit.agentName?.toLowerCase().includes(query);
        if (!matchId && !matchNotes && !matchAuditor && !matchAgent) return false;
      }

      return true;
    });
  }, [findings, selectedAgent, startDate, endDate, selectedMonth, selectedYear, searchQuery, currentUser, isAgentRole]);

  // Statistics KPI calculations
  const stats = useMemo(() => {
    const total = filteredFindings.length;
    if (total === 0) return { avgScore: 0, totalAudits: 0, fatalRate: 0, topAgent: '-' };

    const sumScore = filteredFindings.reduce((acc, f) => acc + f.score, 0);
    const avgScore = Math.round(sumScore / total);

    const totalFatal = filteredFindings.filter(f => f.isFatal).length;
    const fatalRate = ((totalFatal / total) * 100).toFixed(1);

    // Calculate Top Agent (excluding case when user is Agent, which makes it redundant)
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

    return { avgScore, totalAudits: total, fatalRate, topAgent: topAgentName };
  }, [filteredFindings]);

  // Detailed Selected Audit for Modal
  const selectedAudit = useMemo(() => {
    if (!selectedAuditId) return null;
    return findings.find(f => f.id === selectedAuditId);
  }, [selectedAuditId, findings]);

  // Prepare Chart 1: Line Chart Data (Trend QMS)
  const lineChartData = useMemo(() => {
    // Sort chronologically for trend
    const chronFindings = [...filteredFindings].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (chronFindings.length === 0) return [];
    
    // Group by Date or simply plot last 8 audits for smooth visual
    const plotData = chronFindings.slice(-10).map(f => ({
      label: f.id,
      score: f.score,
      date: f.date.substring(5) // MM-DD
    }));

    return plotData;
  }, [filteredFindings]);

  // Prepare Chart 2: Bar Chart Data (Average Score per Agent)
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

  // Prepare Chart 3: Donut Chart Data (Compliance status)
  const donutData = useMemo(() => {
    const total = filteredFindings.length;
    if (total === 0) return { passed: 0, needImprovement: 0, fatal: 0 };

    const fatal = filteredFindings.filter(f => f.isFatal).length;
    const passed = filteredFindings.filter(f => !f.isFatal && f.score >= 90).length;
    const needImprovement = total - fatal - passed;

    return {
      passed: Math.round((passed / total) * 100),
      needImprovement: Math.round((needImprovement / total) * 100),
      fatal: Math.round((fatal / total) * 100)
    };
  }, [filteredFindings]);

  // Sorted and Paginated Findings for Table
  const sortedFindings = useMemo(() => {
    const sorted = [...filteredFindings];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle date conversion
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
    if (score >= 90) return <span className="badge badge-success">EXCELLENT ({score})</span>;
    if (score >= 80) return <span className="badge badge-warning">GOOD ({score})</span>;
    return <span className="badge badge-danger">CRITICAL ({score})</span>;
  };

  return (
    <div className="main-content" style={{ marginTop: '20px' }}>
      {/* Header Panel */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.dashboardTitle}>QM Performance Dashboard</h2>
          <p style={styles.dashboardSubtitle}>
            Selamat datang, <strong style={{ color: 'var(--primary)' }}>{currentUser?.name}</strong>. Berikut adalah data performa QM Score pantauan Anda.
          </p>
        </div>
        <button onClick={handleResetFilters} className="btn-primary" style={styles.resetBtn}>
          <RefreshCw size={16} /> Reset Filter
        </button>
      </div>

      {/* Filter Card (Glassmorphism) */}
      <div className="glass-card" style={styles.filterCard}>
        <div style={styles.cardHeader}>
          <Filter size={18} color="#6366f1" />
          <h3 style={styles.cardTitle}>Filter Pemantauan</h3>
        </div>
        
        <div style={styles.filterGrid}>
          {/* Agent Filter (Locked if current user is Agent) */}
          <div className="form-group">
            <label className="form-label" htmlFor="agentFilter">Agent</label>
            <select
              id="agentFilter"
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
                  <option key={agent} value={agent}>
                    {agent === 'All' ? 'Semua Agent' : agent}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Month Filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="monthFilter">Bulan</label>
            <select
              id="monthFilter"
              className="form-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.select}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="yearFilter">Tahun</label>
            <select
              id="yearFilter"
              className="form-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={styles.select}
            >
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year === 'All' ? 'Semua Tahun' : year}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="form-group">
            <label className="form-label" htmlFor="startFilter">Dari Tanggal</label>
            <div style={styles.dateInputWrapper}>
              <Calendar size={16} style={styles.dateIcon} />
              <input
                id="startFilter"
                type="date"
                className="form-input"
                style={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Date Picker End */}
          <div className="form-group">
            <label className="form-label" htmlFor="endFilter">Sampai Tanggal</label>
            <div style={styles.dateInputWrapper}>
              <Calendar size={16} style={styles.dateIcon} />
              <input
                id="endFilter"
                type="date"
                className="form-input"
                style={styles.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        {/* KPI 1: Rata-rata QMS */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Rata-rata QMS Score</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(99, 102, 241, 0.1)' }}>
              <TrendingUp color="#6366f1" size={20} />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiValue}>{stats.avgScore}%</span>
            <span style={{ 
              ...styles.kpiGrowth, 
              color: stats.avgScore >= 90 ? '#10b981' : (stats.avgScore >= 80 ? '#f59e0b' : '#ef4444')
            }}>
              {stats.avgScore >= 90 ? 'Target Terpenuhi' : 'Di Bawah Target'}
            </span>
          </div>
          <div style={styles.kpiProgressContainer}>
            <div style={{ 
              ...styles.kpiProgressBar, 
              width: `${stats.avgScore}%`,
              background: stats.avgScore >= 90 ? 'var(--success)' : (stats.avgScore >= 80 ? 'var(--warning)' : 'var(--danger)')
            }}></div>
          </div>
        </div>

        {/* KPI 2: Total Audits */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Total Evaluasi Audit</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(168, 85, 247, 0.1)' }}>
              <FileText color="#a855f7" size={20} />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiValue}>{stats.totalAudits}</span>
            <span style={styles.kpiGrowthMuted}>Findings matching filters</span>
          </div>
          <p style={styles.kpiDesc}>Seluruh rekaman audit yang tersaring filter.</p>
        </div>

        {/* KPI 3: Fatal Error Rate */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Fatal Error Rate</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertTriangle color="#ef4444" size={20} />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={{ ...styles.kpiValue, color: Number(stats.fatalRate) > 10 ? 'var(--danger)' : 'var(--text-heading)' }}>
              {stats.fatalRate}%
            </span>
            <span style={{ 
              ...styles.kpiGrowth, 
              color: Number(stats.fatalRate) > 10 ? '#ef4444' : '#10b981'
            }}>
              {Number(stats.fatalRate) > 10 ? 'Kritis' : 'Aman'}
            </span>
          </div>
          <p style={styles.kpiDesc}>Persentase kegagalan proses fatal oleh Agent.</p>
        </div>

        {/* KPI 4: Top Performing Agent */}
        <div className="glass-card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Top Performing Agent</span>
            <div style={{ ...styles.kpiIcon, background: 'rgba(16, 185, 129, 0.1)' }}>
              <Award color="#10b981" size={20} />
            </div>
          </div>
          <div style={styles.kpiValueRow}>
            <span style={styles.kpiValue, { fontSize: '18px', fontWeight: '700', color: 'var(--success)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {stats.topAgent}
            </span>
          </div>
          <p style={styles.kpiDesc}>Peraih nilai QMS tertinggi berdasarkan filter.</p>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div style={styles.chartsGrid}>
        {/* Chart 1: Line Chart - Trend QM Score */}
        <div className="glass-card" style={styles.chartContainer}>
          <h4 style={styles.chartTitle}>Grafik Tren QM Score (10 Audit Terakhir)</h4>
          {lineChartData.length === 0 ? (
            <div style={styles.emptyChart}>Tidak ada data tren untuk filter ini.</div>
          ) : (
            <div style={styles.svgWrapper}>
              <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* X-Grid lines */}
                {[0, 1, 2, 3, 4].map(idx => (
                  <line 
                    key={idx} 
                    x1="0" 
                    y1={20 + idx * 40} 
                    x2="500" 
                    y2={20 + idx * 40} 
                    stroke="var(--border-light)" 
                    strokeDasharray="4 4" 
                  />
                ))}

                {/* Draw Area below the line */}
                <path
                  d={`
                    M 10 200
                    ${lineChartData.map((d, i) => {
                      const x = 10 + (i * 480) / (lineChartData.length - 1 || 1);
                      const y = 180 - (d.score * 160) / 100;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L ${10 + (lineChartData.length - 1) * (480 / (lineChartData.length - 1 || 1))} 200
                    Z
                  `}
                  fill="url(#lineGrad)"
                />

                {/* Draw Trend Line */}
                <path
                  d={lineChartData.map((d, i) => {
                    const x = 10 + (i * 480) / (lineChartData.length - 1 || 1);
                    const y = 180 - (d.score * 160) / 100;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Points on Line */}
                {lineChartData.map((d, i) => {
                  const x = 10 + (i * 480) / (lineChartData.length - 1 || 1);
                  const y = 180 - (d.score * 160) / 100;
                  return (
                    <g key={i}>
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="6" 
                        fill="var(--primary)" 
                        stroke="#ffffff" 
                        strokeWidth="2" 
                        style={{ cursor: 'pointer' }}
                      />
                      <text 
                        x={x} 
                        y={y - 10} 
                        fill="var(--text-heading)" 
                        fontSize="10" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {d.score}
                      </text>
                      <text 
                        x={x} 
                        y="195" 
                        fill="var(--text-muted)" 
                        fontSize="8" 
                        textAnchor="middle"
                      >
                        {d.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Chart 2: Bar Chart - Agent Comparison */}
        <div className="glass-card" style={styles.chartContainer}>
          <h4 style={styles.chartTitle}>Nilai Rata-rata per Agent</h4>
          {barChartData.length === 0 ? (
            <div style={styles.emptyChart}>Tidak ada data agent untuk disandingkan.</div>
          ) : (
            <div style={styles.barChartWrapper}>
              {barChartData.map((d) => (
                <div key={d.name} style={styles.barItem}>
                  <div style={styles.barLabel} title={d.name}>{d.name.split(' ')[0]}</div>
                  <div style={styles.barTrack}>
                    <div style={{
                      ...styles.barFill,
                      width: `${d.avg}%`,
                      background: d.avg >= 90 ? 'linear-gradient(90deg, var(--success), #34d399)' : (d.avg >= 80 ? 'linear-gradient(90deg, var(--warning), #fbbf24)' : 'linear-gradient(90deg, var(--danger), #f87171)')
                    }}></div>
                  </div>
                  <div style={styles.barValue}>{d.avg}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 3: Donut Chart - Compliance Ring */}
        <div className="glass-card" style={{ ...styles.chartContainer, flex: 0.8 }}>
          <h4 style={styles.chartTitle}>Distribusi Kepatuhan SOP</h4>
          {filteredFindings.length === 0 ? (
            <div style={styles.emptyChart}>Tidak ada data kepatuhan.</div>
          ) : (
            <div style={styles.donutWrapper}>
              <svg width="120" height="120" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-light)" strokeWidth="3" />
                
                {/* Lolos Segment (Green) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="var(--success)" 
                  strokeWidth="3.2" 
                  strokeDasharray={`${donutData.passed} ${100 - donutData.passed}`} 
                  strokeDashoffset="25" 
                />

                {/* Fatal Segment (Red) */}
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="none" 
                  stroke="var(--danger)" 
                  strokeWidth="3.2" 
                  strokeDasharray={`${donutData.fatal} ${100 - donutData.fatal}`} 
                  strokeDashoffset={`${25 - donutData.passed}`} 
                />
              </svg>
              <div style={styles.donutLegend}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, background: 'var(--success)' }}></div>
                  <span style={styles.legendText}>Lolos SOP ({donutData.passed}%)</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, background: 'var(--warning)' }}></div>
                  <span style={styles.legendText}>Perlu Perbaikan ({donutData.needImprovement}%)</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, background: 'var(--danger)' }}></div>
                  <span style={styles.legendText}>Fatal/Gagal SOP ({donutData.fatal}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit History Table (Glassmorphic) */}
      <div className="glass-card" style={styles.tableCard}>
        <div style={styles.tableCardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#6366f1" />
            <h3 style={styles.cardTitle}>Daftar Temuan Riwayat Audit</h3>
          </div>
          
          {/* Search Box */}
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari Agent, Auditor, Catatan..."
              className="form-input"
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Table Element */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th onClick={() => handleSort('id')} style={styles.th}>
                  ID Audit {sortField === 'id' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('date')} style={styles.th}>
                  Tanggal {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('agentName')} style={styles.th}>
                  Agent {sortField === 'agentName' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th style={styles.th}>Auditor</th>
                <th onClick={() => handleSort('score')} style={styles.th}>
                  Skor QMS {sortField === 'score' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th style={styles.th}>Status SOP</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFindings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.tdEmpty}>Tidak ada rekaman audit yang sesuai dengan filter.</td>
                </tr>
              ) : (
                paginatedFindings.map((audit) => (
                  <tr key={audit.id} style={styles.trBody}>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary)' }}>{audit.id}</td>
                    <td style={styles.td}>{audit.date}</td>
                    <td style={{ ...styles.td, fontWeight: '600' }}>{audit.agentName}</td>
                    <td style={styles.td}>{audit.auditorName}</td>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>
                      <span style={{ 
                        color: audit.isFatal ? 'var(--danger)' : (audit.score >= 90 ? 'var(--success)' : (audit.score >= 80 ? 'var(--warning)' : 'var(--danger)'))
                      }}>
                        {audit.score}%
                      </span>
                    </td>
                    <td style={styles.td}>
                      {audit.isFatal ? (
                        <span className="badge badge-danger">FATAL ERROR</span>
                      ) : (
                        <span className="badge badge-success">OK (Lolos)</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => setSelectedAuditId(audit.id)} 
                        style={styles.actionBtn}
                        title="Lihat Detail Audit"
                      >
                        <Eye size={15} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={styles.paginationRow}>
          <span style={styles.pageCount}>
            Menampilkan <strong>{Math.min(sortedFindings.length, (currentPage - 1) * itemsPerPage + 1)}</strong> - <strong>{Math.min(sortedFindings.length, currentPage * itemsPerPage)}</strong> dari <strong>{sortedFindings.length}</strong> data
          </span>
          <div style={styles.pageBtns}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              Prev
            </button>
            <span style={styles.activePage}>{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAuditId(null)}>
          <div className="glass-card" style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Detail Audit: {selectedAudit.id}</h3>
              <button onClick={() => setSelectedAuditId(null)} style={styles.modalCloseBtn}>×</button>
            </div>
            
            <div style={styles.modalGrid}>
              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>Informasi Umum</h4>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalInfoLabel}>Tanggal Audit:</span>
                  <span style={styles.modalInfoVal}>{selectedAudit.date}</span>
                </div>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalInfoLabel}>Nama Agent:</span>
                  <span style={styles.modalInfoVal}>{selectedAudit.agentName}</span>
                </div>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalInfoLabel}>Auditor QC/TL:</span>
                  <span style={styles.modalInfoVal}>{selectedAudit.auditorName}</span>
                </div>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>Detail Penilaian</h4>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalInfoLabel}>Soft Skills (30%):</span>
                  <span style={styles.modalInfoVal}>{selectedAudit.softSkills} / 100</span>
                </div>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalInfoLabel}>Product Knowledge (30%):</span>
                  <span style={styles.modalInfoVal}>{selectedAudit.productKnowledge} / 100</span>
                </div>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalInfoLabel}>Process Compliance (40%):</span>
                  <span style={styles.modalInfoVal}>
                    {selectedAudit.isFatal ? '0 (Fatal SOP Violations)' : '100 (Kepatuhan Penuh)'}
                  </span>
                </div>
                <div style={{ ...styles.modalInfoRow, borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '8px' }}>
                  <span style={{ ...styles.modalInfoLabel, fontWeight: 'bold' }}>Skor Akhir QMS:</span>
                  <span style={{ ...styles.modalInfoVal, fontWeight: 'bold', fontSize: '18px', color: selectedAudit.isFatal ? 'var(--danger)' : 'var(--primary)' }}>
                    {selectedAudit.score}%
                  </span>
                </div>
              </div>
            </div>

            <div style={{ ...styles.modalSection, marginTop: '20px' }}>
              <h4 style={styles.modalSecTitle}>Status & Keterangan</h4>
              <div style={{ marginBottom: '12px' }}>
                {getScoreBadge(selectedAudit.score, selectedAudit.isFatal)}
              </div>
              <div style={styles.modalNotesBox}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Catatan Auditor:</div>
                <p style={styles.modalNotes}>{selectedAudit.notes || 'Tidak ada catatan khusus.'}</p>
              </div>
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button onClick={() => setSelectedAuditId(null)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '8px',
  },
  dashboardTitle: {
    fontSize: '26px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff 40%, var(--primary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  dashboardSubtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  resetBtn: {
    padding: '10px 16px',
    fontSize: '13px',
  },
  filterCard: {
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '10px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  select: {
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  },
  dateInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  dateIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  dateInput: {
    paddingLeft: '38px',
    width: '100%',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '20px',
  },
  kpiCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '135px',
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  kpiTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  kpiIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '8px',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-heading)',
  },
  kpiGrowth: {
    fontSize: '12px',
    fontWeight: '600',
  },
  kpiGrowthMuted: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  kpiProgressContainer: {
    height: '6px',
    borderRadius: '3px',
    background: 'var(--border-light)',
    overflow: 'hidden',
    marginTop: '6px',
  },
  kpiProgressBar: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease-out',
  },
  kpiDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 0.8fr',
    gap: '20px',
  },
  chartContainer: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '260px',
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '16px',
    color: 'var(--text-heading)',
  },
  svgWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChart: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    border: '1px dashed var(--border-light)',
    borderRadius: '8px',
  },
  barChartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    justifyContent: 'center',
  },
  barItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  barLabel: {
    width: '60px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  barTrack: {
    flex: 1,
    height: '12px',
    background: 'var(--border-light)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.4s ease-out',
  },
  barValue: {
    fontSize: '11px',
    fontWeight: 'bold',
    width: '32px',
    textAlign: 'right',
  },
  donutWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  donutLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  tableCard: {
    padding: '24px',
  },
  tableCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '14px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    paddingLeft: '36px',
    width: '260px',
    height: '38px',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    borderBottom: '2px solid var(--border-light)',
  },
  th: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  trBody: {
    borderBottom: '1px solid var(--border-light)',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.02)',
    }
  },
  td: {
    padding: '16px',
    fontSize: '14px',
  },
  tdEmpty: {
    padding: '30px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  actionBtn: {
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
  },
  paginationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  pageCount: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  pageBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pageBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-main)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  activePage: {
    fontSize: '13px',
    color: 'var(--text-heading)',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modalCard: {
    width: '100%',
    maxWidth: '600px',
    padding: '30px',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '12px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '24px',
    cursor: 'pointer',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  modalSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  modalSecTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--primary)',
    marginBottom: '12px',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '4px',
  },
  modalInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '13px',
  },
  modalInfoLabel: {
    color: 'var(--text-muted)',
  },
  modalInfoVal: {
    fontWeight: '600',
    color: 'var(--text-heading)',
  },
  modalNotesBox: {
    background: 'rgba(0,0,0,0.2)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
    marginTop: '10px',
  },
  modalNotes: {
    fontSize: '13px',
    lineHeight: '1.4',
    color: 'var(--text-main)',
  }
};
