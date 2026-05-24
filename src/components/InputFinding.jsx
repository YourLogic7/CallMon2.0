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
  AlertTriangle
} from 'lucide-react';

export default function InputFinding() {
  const { users, addFinding, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  // Extract users with Agent role
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

  // Effective agent fallback
  const effectiveAgent = selectedAgent || (agents.length > 0 ? agents[0].name : '');

  // Parameter Scoring State: { paramId: 1 | 0 }
  const [paramScores, setParamScores] = useState(() => {
    const initial = {};
    QM_CATEGORIES.forEach(cat => {
      cat.parameters.forEach(p => {
        initial[p.id] = 1; 
      });
    });
    return initial;
  });

  // Failed Sub-parameters State: { paramId: [subParamIndices] }
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
        <p style={styles.subtitle}>Sistem penilaian 12 parameter standar.</p>
      </div>

      {success && (
        <div className="glass-card" style={styles.successCard}>
          <CheckCircle2 size={36} color="var(--success)" />
          <h4 style={{ color: 'var(--success)' }}>Berhasil Disimpan!</h4>
        </div>
      )}

      <div style={styles.layout}>
        <div style={styles.formSection}>
          <form onSubmit={handleSubmit}>
            <div className="glass-card" style={styles.card}>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label"><User size={14} /> Agent</label>
                  <select className="form-input" value={effectiveAgent} onChange={(e) => setSelectedAgent(e.target.value)} required>
                    <option value="" disabled>Pilih Agent</option>
                    {agents.map(a => <option key={a.username} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><Calendar size={14} /> Tanggal</label>
                  <input type="date" className="form-input" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} required />
                </div>
              </div>
            </div>

            {QM_CATEGORIES.map(cat => (
              <div key={cat.id} className="glass-card" style={{ ...styles.card, marginBottom: '20px' }}>
                <div style={styles.categoryHeader} onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}>
                  <div style={styles.categoryTitleWrapper}>
                    <div style={styles.categoryBadge}>{cat.id}</div>
                    <div>
                      <h3 style={styles.categoryName}>{cat.name}</h3>
                      <span style={styles.categoryWeight}>Bobot: {cat.weight}%</span>
                    </div>
                  </div>
                  {expandedCategory === cat.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {expandedCategory === cat.id && (
                  <div style={styles.categoryContent}>
                    {cat.parameters.map(param => (
                      <div key={param.id} style={styles.paramItem}>
                        <div style={styles.paramMain}>
                          <div style={styles.paramInfo}>
                            <h4 style={styles.paramName}>{param.id}. {param.name}</h4>
                            <span style={styles.paramWeight}>{param.weight}%</span>
                          </div>
                          <select className="form-input" style={{ width: '100px' }} value={paramScores[param.id]} onChange={(e) => handleParamChange(param.id, e.target.value)}>
                            <option value={1}>1 (Pass)</option>
                            <option value={0}>0 (Fail)</option>
                          </select>
                        </div>
                        {paramScores[param.id] === 0 && (
                          <div style={styles.subParamsContainer}>
                            {param.subParams.map((sub, idx) => (
                              <label key={idx} style={styles.subParamLabel}>
                                <input type="checkbox" checked={(failedSubParams[param.id] || []).includes(idx)} onChange={() => toggleSubParam(param.id, idx)} />
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

            <div className="glass-card" style={styles.card}>
              <label className="form-label"><MessageSquare size={14} /> Catatan</label>
              <textarea className="form-input" rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} required></textarea>
              <button type="submit" className="btn-primary" style={styles.submitBtn}>Simpan Audit</button>
            </div>
          </form>
        </div>

        <div style={styles.summarySection}>
          <div className="glass-card" style={styles.stickyCard}>
            <h3 style={styles.summaryTitle}>Skor: {calculatedScore}%</h3>
            <div style={styles.breakdown}>
              {QM_CATEGORIES.map(cat => {
                const catScore = cat.parameters.reduce((acc, p) => acc + (paramScores[p.id] === 1 ? p.weight : 0), 0);
                return (
                  <div key={cat.id} style={styles.breakdownItem}>
                    <div style={styles.breakdownRow}><span>{cat.name}</span><span>{catScore}/{cat.weight}</span></div>
                    <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${(catScore/cat.weight)*100}%`, background: 'var(--primary)' }}></div></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)' },
  layout: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  formSection: { flex: '1', minWidth: '320px' },
  summarySection: { width: '280px', position: 'sticky', top: '20px' },
  card: { padding: '20px', marginBottom: '20px' },
  stickyCard: { padding: '24px', textAlign: 'center' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  categoryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  categoryTitleWrapper: { display: 'flex', alignItems: 'center', gap: '12px' },
  categoryBadge: { width: '30px', height: '30px', borderRadius: '6px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  categoryName: { fontSize: '15px', fontWeight: '700' },
  categoryWeight: { fontSize: '11px', color: 'var(--text-muted)' },
  categoryContent: { marginTop: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' },
  paramItem: { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  paramMain: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  paramInfo: { flex: 1 },
  paramName: { fontSize: '13px', fontWeight: '600', color: '#fff', lineHeight: '1.4' },
  paramWeight: { fontSize: '10px', color: 'var(--text-muted)' },
  subParamsContainer: { marginTop: '10px', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '6px' },
  subParamLabel: { display: 'flex', gap: '8px', marginBottom: '6px', cursor: 'pointer' },
  subParamText: { fontSize: '11px', color: 'var(--text-main)' },
  submitBtn: { marginTop: '16px', width: '100%', padding: '12px' },
  summaryTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '16px' },
  breakdown: { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' },
  breakdownItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  breakdownRow: { display: 'flex', justifyContent: 'space-between', fontSize: '11px' },
  progressBar: { height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%' },
  successCard: { background: 'rgba(16, 185, 129, 0.1)', padding: '12px', marginBottom: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
  accessDeniedContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  accessDeniedCard: { textAlign: 'center', padding: '30px' }
};
