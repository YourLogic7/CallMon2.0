import { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { QM_CATEGORIES } from '../context/qmParameters';
import { 
  FilePlus, 
  User, 
  Calendar, 
  CheckCircle2, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock,
  Ticket,
  Hash,
  Activity,
  Award
} from 'lucide-react';

export default function InputFinding() {
  const { users, addFinding, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  const agents = useMemo(() => {
    return users.filter(u => u.role === 'Agent');
  }, [users]);

  // Form States
  const [selectedAgent, setSelectedAgent] = useState('');
  const [auditDate, setAuditDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Call Metadata States
  const [msisdn, setMsisdn] = useState('');
  const [noTiket, setNoTiket] = useState('');
  const [noCWC, setNoCWC] = useState('');
  const [duration, setDuration] = useState('');
  const [callDate, setCallDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [callTime, setCallTime] = useState('');

  const effectiveAgent = selectedAgent || (agents.length > 0 ? agents[0].name : '');

  const [paramScores, setParamScores] = useState(() => {
    const initial = {};
    QM_CATEGORIES.forEach(cat => {
      cat.parameters.forEach(p => {
        initial[p.id] = 1; 
      });
    });
    return initial;
  });

  const [failedSubParams, setFailedSubParams] = useState({});
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('A');

  const calculatedScore = useMemo(() => {
    let score = 0;
    QM_CATEGORIES.forEach(cat => {
      cat.parameters.forEach(p => {
        if (paramScores[p.id] === 1) {
          score += p.weight;
        }
      });
    });
    return score;
  }, [paramScores]);

  const handleParamChange = (paramId, value) => {
    const val = Number(value);
    setParamScores(prev => ({ ...prev, [paramId]: val }));
    if (val === 1) {
      setFailedSubParams(prev => {
        const newFailed = { ...prev };
        delete newFailed[paramId];
        return newFailed;
      });
    }
  };

  const toggleSubParam = (paramId, subIdx) => {
    setFailedSubParams(prev => {
      const current = prev[paramId] || [];
      if (current.includes(subIdx)) {
        return { ...prev, [paramId]: current.filter(i => i !== subIdx) };
      } else {
        return { ...prev, [paramId]: [...current, subIdx] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addFinding({
      date: auditDate,
      agentName: effectiveAgent,
      paramScores,
      failedSubParams,
      isFatal: false,
      notes: notes,
      msisdn,
      noTiket,
      noCWC,
      duration,
      callDate,
      callTime
    });
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setSuccess(false);
      navigate('/dashboard');
    }, 2000);
  };

  const hasAccess = ['superadmin', 'QC', 'TL'].includes(currentUser?.role);
  if (!hasAccess) {
    return (
      <div className="main-content" style={styles.accessDeniedContainer}>
        <div className="glass-card" style={styles.accessDeniedCard}>
          <AlertTriangle size={48} color="var(--danger)" />
          <h2 style={{ color: 'var(--danger)', marginTop: '16px' }}>Akses Ditolak!</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ marginTop: '20px' }}>Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ marginTop: '20px', maxWidth: '1200px' }}>
      <div style={styles.header}>
        <h2 style={styles.title}>Evaluasi Penilaian QMS Baru</h2>
        <p style={styles.subtitle}>Audit kualitas layanan berdasarkan 12 parameter standar perusahaan.</p>
      </div>

      {success && (
        <div className="glass-card" style={styles.successCard}>
          <CheckCircle2 size={32} color="var(--success)" />
          <div>
            <h4 style={{ color: 'var(--success)', margin: 0 }}>Audit Berhasil Disimpan!</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Mengarahkan kembali ke dashboard...</p>
          </div>
        </div>
      )}

      <div style={styles.layout}>
        <div style={styles.formSection}>
          <form onSubmit={handleSubmit} id="qmsForm">
            {/* 1. Informasi Agent Card */}
            <div className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <User size={18} color="var(--primary)" />
                <h3 style={styles.cardTitle}>Informasi Audit</h3>
              </div>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Nama Agent</label>
                  <select className="form-input" value={effectiveAgent} onChange={(e) => setSelectedAgent(e.target.value)} required>
                    <option value="" disabled>Pilih Agent</option>
                    {agents.map(a => <option key={a.username} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Audit (QC)</label>
                  <input type="date" className="form-input" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* 2. Parameter Categories */}
            {QM_CATEGORIES.map(cat => (
              <div key={cat.id} className="glass-card" style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
                <div style={styles.categoryHeader} onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}>
                  <div style={styles.categoryTitleWrapper}>
                    <div style={styles.categoryBadge}>{cat.id}</div>
                    <div>
                      <h3 style={styles.categoryName}>{cat.name}</h3>
                      <span style={styles.categoryWeight}>Kontribusi: {cat.weight}% dari total QMS</span>
                    </div>
                  </div>
                  {expandedCategory === cat.id ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>

                {expandedCategory === cat.id && (
                  <div style={styles.categoryContent}>
                    {cat.parameters.map(param => (
                      <div key={param.id} style={styles.paramItem}>
                        <div style={styles.paramMain}>
                          <div style={styles.paramInfo}>
                            <h4 style={styles.paramName}>{param.id}. {param.name}</h4>
                            <span style={styles.paramWeight}>Bobot: {param.weight}%</span>
                          </div>
                          <div style={styles.selectWrapper}>
                            <select 
                              className="form-input" 
                              style={{ 
                                borderColor: paramScores[param.id] === 0 ? 'var(--danger)' : 'var(--success)',
                                color: paramScores[param.id] === 0 ? 'var(--danger)' : 'var(--success)',
                                fontWeight: 'bold'
                              }} 
                              value={paramScores[param.id]} 
                              onChange={(e) => handleParamChange(param.id, e.target.value)}
                            >
                              <option value={1}>1 (PASS)</option>
                              <option value={0}>0 (FAIL)</option>
                            </select>
                          </div>
                        </div>
                        {paramScores[param.id] === 0 && (
                          <div style={styles.subParamsContainer}>
                            <p style={styles.subParamsTitle}>Alasan Ketidaksesuaian:</p>
                            {param.subParams.map((sub, idx) => (
                              <label key={idx} style={styles.subParamLabel}>
                                <input 
                                  type="checkbox" 
                                  style={styles.checkbox}
                                  checked={(failedSubParams[param.id] || []).includes(idx)} 
                                  onChange={() => toggleSubParam(param.id, idx)} 
                                />
                                <span style={styles.subParamText}>{sub}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 3. Call Detail & Notes Card */}
            <div className="glass-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <Activity size={18} color="var(--primary)" />
                <h3 style={styles.cardTitle}>Detail Call & Catatan Auditor</h3>
              </div>
              
              <div style={styles.metaGrid}>
                <div className="form-group">
                  <label className="form-label-small"><Hash size={12} /> MSISDN</label>
                  <input type="text" className="form-input" value={msisdn} onChange={(e) => setMsisdn(e.target.value)} placeholder="08..." />
                </div>
                <div className="form-group">
                  <label className="form-label-small"><Ticket size={12} /> No Tiket</label>
                  <input type="text" className="form-input" value={noTiket} onChange={(e) => setNoTiket(e.target.value)} placeholder="IN..." />
                </div>
                <div className="form-group">
                  <label className="form-label-small"><FilePlus size={12} /> No CWC</label>
                  <input type="text" className="form-input" value={noCWC} onChange={(e) => setNoCWC(e.target.value)} placeholder="CWC..." />
                </div>
                <div className="form-group">
                  <label className="form-label-small"><Clock size={12} /> Durasi Call</label>
                  <input type="text" className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="mm:ss" />
                </div>
                <div className="form-group">
                  <label className="form-label-small"><Calendar size={12} /> Tanggal Call</label>
                  <input type="date" className="form-input" value={callDate} onChange={(e) => setCallDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label-small"><Clock size={12} /> Jam Call</label>
                  <input type="text" className="form-input" value={callTime} onChange={(e) => setCallTime(e.target.value)} placeholder="HH:mm" />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={14} color="var(--primary)" /> 
                  Catatan Perbaikan/Apresiasi
                </label>
                <textarea 
                  className="form-input" 
                  rows="5" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Tuliskan feedback detail hasil pengamatan call..."
                  required
                  style={{ width: '100%', resize: 'vertical' }}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={styles.submitBtnMain}>
                <FilePlus size={18} /> Simpan Seluruh Data Audit
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar: Sticky Score Summary */}
        <div style={styles.summarySection}>
          <div className="glass-card" style={styles.stickyCard}>
            <div style={styles.scoreTitleBox}>
              <Award size={20} color="var(--primary)" />
              <h3 style={styles.summaryTitle}>Kalkulasi Skor</h3>
            </div>
            
            <div style={styles.scoreCircleWrapper}>
              <div style={{
                ...styles.scoreCircle,
                borderColor: calculatedScore >= 90 ? 'var(--success)' : (calculatedScore >= 80 ? 'var(--warning)' : 'var(--danger)'),
                boxShadow: `0 0 20px ${calculatedScore >= 90 ? 'var(--success-glow)' : 'var(--primary-glow)'}`
              }}>
                <span style={{ 
                  ...styles.scoreNumber,
                  color: calculatedScore >= 90 ? 'var(--success)' : (calculatedScore >= 80 ? 'var(--warning)' : 'var(--danger)')
                }}>{calculatedScore}%</span>
                <span style={styles.scoreLabel}>TOTAL QMS</span>
              </div>
            </div>

            <div style={styles.breakdown}>
              {QM_CATEGORIES.map(cat => {
                const catScore = cat.parameters.reduce((acc, p) => acc + (paramScores[p.id] === 1 ? p.weight : 0), 0);
                const isWarning = catScore < cat.weight;
                return (
                  <div key={cat.id} style={styles.breakdownItem}>
                    <div style={styles.breakdownRow}>
                      <span style={styles.breakdownLabel}>{cat.name}</span>
                      <span style={{ ...styles.breakdownVal, color: isWarning ? 'var(--warning)' : 'var(--text-heading)' }}>
                        {catScore}/{cat.weight}
                      </span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ 
                        ...styles.progressFill, 
                        width: `${(catScore/cat.weight)*100}%`, 
                        background: catScore === cat.weight ? 'var(--success)' : 'var(--primary)' 
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="submit" form="qmsForm" className="btn-primary" style={styles.submitBtnSticky}>
              Submit Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  title: { 
    fontSize: '26px', 
    fontWeight: '800', 
    background: 'linear-gradient(135deg, #fff 30%, var(--primary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' },
  layout: { display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' },
  formSection: { flex: '1.4', minWidth: '320px' },
  summarySection: { flex: '0.6', minWidth: '280px', position: 'sticky', top: '20px' },
  card: { padding: '24px', marginBottom: '24px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: 'var(--text-heading)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  categoryHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    cursor: 'pointer',
    padding: '16px 24px',
    transition: 'background 0.2s ease',
    '&:hover': { background: 'rgba(255,255,255,0.02)' }
  },
  categoryTitleWrapper: { display: 'flex', alignItems: 'center', gap: '16px' },
  categoryBadge: { 
    width: '36px', 
    height: '36px', 
    borderRadius: '10px', 
    background: 'var(--primary)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '800',
    fontSize: '18px',
    boxShadow: '0 4px 12px var(--primary-glow)'
  },
  categoryName: { fontSize: '16px', fontWeight: '700', color: '#fff' },
  categoryWeight: { fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' },
  categoryContent: { padding: '0 24px 24px 24px', borderTop: '1px solid var(--border-light)' },
  paramItem: { padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  paramMain: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
  paramInfo: { flex: 1 },
  paramName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)', lineHeight: '1.5' },
  paramWeight: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' },
  selectWrapper: { width: '120px' },
  subParamsContainer: { 
    marginTop: '16px', 
    background: 'rgba(239, 68, 68, 0.05)', 
    padding: '16px', 
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.1)'
  },
  subParamsTitle: { fontSize: '12px', fontWeight: '700', color: 'var(--danger)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  subParamLabel: { display: 'flex', gap: '12px', marginBottom: '10px', cursor: 'pointer', alignItems: 'flex-start' },
  checkbox: { marginTop: '3px', accentColor: 'var(--danger)', width: '16px', height: '16px' },
  subParamText: { fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4' },
  submitBtnMain: { marginTop: '24px', width: '100%', padding: '16px', fontSize: '15px', fontWeight: '700' },
  stickyCard: { padding: '24px', textAlign: 'center' },
  scoreTitleBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' },
  summaryTitle: { fontSize: '16px', fontWeight: '700', color: 'var(--text-heading)' },
  scoreCircleWrapper: { display: 'flex', justifyContent: 'center', marginBottom: '24px' },
  scoreCircle: { 
    width: '150px', 
    height: '150px', 
    borderRadius: '50%', 
    border: '6px solid var(--primary)', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease'
  },
  scoreNumber: { fontSize: '42px', fontWeight: '900', fontFamily: 'var(--font-heading)' },
  scoreLabel: { fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1.5px' },
  breakdown: { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' },
  breakdownItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
  breakdownRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px' },
  breakdownLabel: { color: 'var(--text-muted)', fontWeight: '500' },
  breakdownVal: { fontWeight: '800' },
  progressBar: { height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
  submitBtnSticky: { marginTop: '24px', width: '100%', padding: '12px' },
  successCard: { 
    background: 'rgba(16, 185, 129, 0.15)', 
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '20px', 
    marginBottom: '24px', 
    borderRadius: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)'
  },
  accessDeniedContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  accessDeniedCard: { textAlign: 'center', padding: '40px', maxWidth: '400px' },
  formLabelSmall: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }
};
