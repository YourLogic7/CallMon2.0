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
  Award
} from 'lucide-react';

export default function InputFinding() {
  const { users, addFinding, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  const agents = useMemo(() => users.filter(u => u.role === 'Agent'), [users]);

  const [selectedAgent, setSelectedAgent] = useState('');
  const [auditDate, setAuditDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [msisdn, setMsisdn] = useState('');
  const [noTiket, setNoTiket] = useState('');
  const [noCWC, setNoCWC] = useState('');
  const [duration, setDuration] = useState('');
  const [callDate, setCallDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState('');

  const [paramScores, setParamScores] = useState(() => {
    const initial = {};
    QM_CATEGORIES.forEach(cat => cat.parameters.forEach(p => { initial[p.id] = 1; }));
    return initial;
  });

  const [failedSubParams, setFailedSubParams] = useState({});
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('A');

  const effectiveAgent = selectedAgent || (agents.length > 0 ? agents[0].name : '');

  const calculatedScore = useMemo(() => {
    let score = 0;
    QM_CATEGORIES.forEach(cat => cat.parameters.forEach(p => { if (paramScores[p.id] === 1) score += p.weight; }));
    return score;
  }, [paramScores]);

  const handleParamChange = (paramId, value) => {
    const val = Number(value);
    setParamScores(prev => ({ ...prev, [paramId]: val }));
    if (val === 1) setFailedSubParams(prev => { const n = { ...prev }; delete n[paramId]; return n; });
  };

  const toggleSubParam = (paramId, subIdx) => {
    setFailedSubParams(prev => {
      const curr = prev[paramId] || [];
      return curr.includes(subIdx) ? { ...prev, [paramId]: curr.filter(i => i !== subIdx) } : { ...prev, [paramId]: [...curr, subIdx] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addFinding({ date: auditDate, agentName: effectiveAgent, paramScores, failedSubParams, isFatal: false, notes, msisdn, noTiket, noCWC, duration, callDate, callTime });
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (!['superadmin', 'QC', 'TL'].includes(currentUser?.role)) return null;

  return (
    <div className="main-content">
      <div style={styles.header}>
        <h2 style={styles.title}>New Evaluation</h2>
        <p style={styles.subtitle}>Input hasil monitoring 12 parameter standar.</p>
      </div>

      {success && (
        <div className="glass-card success-alert" style={styles.successCard}>
          <CheckCircle2 size={24} color="var(--success)" />
          <span style={{ fontWeight: '600' }}>Data Audit Berhasil Disimpan!</span>
        </div>
      )}

      <div className="input-layout" style={styles.layout}>
        <div className="form-main" style={styles.formMain}>
          <form onSubmit={handleSubmit} id="qmsForm">
            {/* Metadata Audit */}
            <div className="glass-card" style={{ marginBottom: '20px' }}>
              <div style={styles.grid2} className="grid-2">
                <div className="form-group">
                  <label className="form-label"><User size={12} /> Agent</label>
                  <select className="form-input" value={effectiveAgent} onChange={(e) => setSelectedAgent(e.target.value)} required>
                    {agents.map(a => <option key={a.username} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><Calendar size={12} /> Tgl Audit</label>
                  <input type="date" className="form-input" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Categories */}
            {QM_CATEGORIES.map(cat => (
              <div key={cat.id} className="glass-card" style={{ marginBottom: '16px', padding: 0, overflow: 'hidden' }}>
                <div style={styles.catHeader} onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.catBadge}>{cat.id}</div>
                    <div><div style={styles.catName}>{cat.name}</div><div style={styles.catWeight}>{cat.weight}%</div></div>
                  </div>
                  {expandedCategory === cat.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {expandedCategory === cat.id && (
                  <div style={{ padding: '0 16px 16px' }}>
                    {cat.parameters.map(p => (
                      <div key={p.id} style={styles.paramItem}>
                        <div style={styles.paramTop}>
                          <div style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>{p.id}. {p.name}</div>
                          <select className="form-input" style={{ width: '80px', padding: '6px' }} value={paramScores[p.id]} onChange={(e) => handleParamChange(p.id, e.target.value)}>
                            <option value={1}>1</option><option value={0}>0</option>
                          </select>
                        </div>
                        {paramScores[p.id] === 0 && (
                          <div style={styles.subList}>
                            {p.subParams.map((s, idx) => (
                              <label key={idx} style={styles.subItem}><input type="checkbox" checked={(failedSubParams[p.id] || []).includes(idx)} onChange={() => toggleSubParam(p.id, idx)} /><span style={{ fontSize: '11px' }}>{s}</span></label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Detail Call & Notes */}
            <div className="glass-card" style={{ marginTop: '20px' }}>
              <h3 style={styles.secTitle}>Detail Call & Catatan</h3>
              <div style={styles.grid3} className="grid-3">
                <div className="form-group"><label className="form-label">MSISDN</label><input type="text" className="form-input" value={msisdn} onChange={e => setMsisdn(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">No Tiket</label><input type="text" className="form-input" value={noTiket} onChange={e => setNoTiket(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">No CWC</label><input type="text" className="form-input" value={noCWC} onChange={e => setNoCWC(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Durasi</label><input type="text" className="form-input" value={duration} onChange={e => setDuration(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Tgl Call</label><input type="date" className="form-input" value={callDate} onChange={e => setCallDate(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Jam Call</label><input type="text" className="form-input" value={callTime} onChange={e => setCallTime(e.target.value)} /></div>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label"><MessageSquare size={12} /> Catatan Auditor</label>
                <textarea className="form-input" rows="4" value={notes} onChange={e => setNotes(e.target.value)} required placeholder="Rincian feedback..."></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Submit Audit</button>
            </div>
          </form>
        </div>

        {/* Score Sidebar */}
        <div className="form-side" style={styles.formSide}>
          <div className="glass-card sticky-score" style={styles.stickyScore}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}><Award size={20} color="var(--primary)" /><span style={{ fontWeight: '700' }}>QMS SCORE</span></div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: calculatedScore >= 80 ? 'var(--success)' : 'var(--danger)', marginBottom: '20px' }}>{calculatedScore}%</div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {QM_CATEGORIES.map(cat => {
                const s = cat.parameters.reduce((acc, p) => acc + (paramScores[p.id] === 1 ? p.weight : 0), 0);
                return (
                  <div key={cat.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}><span>{cat.name}</span><span>{s}/{cat.weight}</span></div>
                    <div style={{ height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(s/cat.weight)*100}%`, background: 'var(--primary)' }}></div></div>
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
  title: { fontSize: '24px', fontWeight: '800' },
  subtitle: { fontSize: '13px', color: 'var(--text-muted)' },
  layout: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  formMain: { flex: '1', minWidth: '320px' },
  formSide: { width: '100%', maxWidth: '280px' },
  stickyScore: { textAlign: 'center', position: 'sticky', top: '20px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' },
  catHeader: { padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  catBadge: { width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' },
  catName: { fontSize: '14px', fontWeight: '700' },
  catWeight: { fontSize: '10px', color: 'var(--text-muted)' },
  paramItem: { padding: '12px 0', borderBottom: '1px solid var(--border-light)' },
  paramTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  subList: { marginTop: '10px', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' },
  subItem: { display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'flex-start' },
  secTitle: { fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--primary)' },
  successCard: { background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', padding: '16px', marginBottom: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }
};

// Global Responsive Overrides
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 768px) {
      .form-side { max-width: 100% !important; order: -1; }
      .grid-3 { grid-template-columns: 1fr 1fr !important; }
    }
  `;
  document.head.appendChild(style);
}
