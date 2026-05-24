import { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  FilePlus, 
  User, 
  Calendar, 
  Sliders, 
  CheckSquare, 
  AlertOctagon, 
  CheckCircle2, 
  MessageSquare 
} from 'lucide-react';

export default function InputFinding() {
  const { users, addFinding, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  // Extract users with Agent role
  const agents = useMemo(() => {
    return users.filter(u => u.role === 'Agent');
  }, [users]);

  // Form States
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.name || 'Andi Agent');
  const [auditDate, setAuditDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [softSkills, setSoftSkills] = useState(80);
  const [productKnowledge, setProductKnowledge] = useState(80);
  const [isFatal, setIsFatal] = useState(false);
  const [notes, setNotes] = useState('');

  const [success, setSuccess] = useState(false);

  // Realtime score calculation
  const calculatedScore = useMemo(() => {
    if (isFatal) return 0;
    const soft = Number(softSkills);
    const prod = Number(productKnowledge);
    const compliance = 100; // if not fatal, compliance is 100%
    return Math.round(soft * 0.3 + prod * 0.3 + compliance * 0.4);
  }, [softSkills, productKnowledge, isFatal]);

  const handleSubmit = (e) => {
    e.preventDefault();

    addFinding({
      date: auditDate,
      agentName: selectedAgent,
      softSkills: Number(softSkills),
      productKnowledge: Number(productKnowledge),
      isFatal: isFatal,
      notes: notes,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate('/dashboard');
    }, 2000);
  };

  // Restrict access
  const hasAccess = ['superadmin', 'QC', 'TL'].includes(currentUser?.role);
  if (!hasAccess) {
    return (
      <div className="main-content" style={styles.accessDeniedContainer}>
        <div className="glass-card" style={styles.accessDeniedCard}>
          <AlertOctagon size={48} color="var(--danger)" />
          <h2 style={{ color: 'var(--danger)', marginTop: '16px' }}>Akses Ditolak!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Halaman ini hanya dapat diakses oleh Quality Control (QC), Team Leader (TL), dan Superadmin.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ marginTop: '20px' }}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ marginTop: '20px', maxWidth: '1000px' }}>
      <div style={styles.header}>
        <h2 style={styles.title}>Evaluasi Penilaian Baru</h2>
        <p style={styles.subtitle}>
          Formulir input hasil monitoring temuan (findings) untuk mengevaluasi kualitas layanan Agent.
        </p>
      </div>

      {success && (
        <div className="glass-card" style={styles.successCard}>
          <CheckCircle2 size={36} color="var(--success)" />
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ color: 'var(--success)' }}>Audit Berhasil Disimpan!</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Menyimpan data temuan dan mengarahkan kembali ke Dashboard...</p>
          </div>
        </div>
      )}

      <div style={styles.formLayout}>
        {/* Left Card - Form Fields */}
        <div className="glass-card" style={styles.formCard}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Auditor Badge */}
            <div style={styles.auditorBadge}>
              <span style={{ color: 'var(--text-muted)' }}>Evaluator: </span>
              <strong>{currentUser?.name} ({currentUser?.role})</strong>
            </div>

            {/* Agent Select & Date Row */}
            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="agent">
                  <span style={styles.labelSpan}><User size={16} /> Nama Agent</span>
                </label>
                <select
                  id="agent"
                  className="form-input"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  style={styles.select}
                  required
                >
                  {agents.map((agent) => (
                    <option key={agent.username} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="date">
                  <span style={styles.labelSpan}><Calendar size={16} /> Tanggal Evaluasi</span>
                </label>
                <input
                  id="date"
                  type="date"
                  className="form-input"
                  value={auditDate}
                  onChange={(e) => setAuditDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Slider 1: Soft Skills */}
            <div className="form-group" style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span style={styles.labelSpan}><Sliders size={16} /> Soft Skills (Bobot 30%)</span>
                <span style={styles.sliderVal}>{softSkills} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={softSkills}
                onChange={(e) => setSoftSkills(Number(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderHelp}>Meliputi keramahan, kesopanan, intonasi suara, empati, dan mendengarkan aktif.</span>
            </div>

            {/* Slider 2: Product Knowledge */}
            <div className="form-group" style={styles.sliderGroup}>
              <div style={styles.sliderHeader}>
                <span style={styles.labelSpan}><Sliders size={16} /> Product Knowledge (Bobot 30%)</span>
                <span style={styles.sliderVal}>{productKnowledge} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={productKnowledge}
                onChange={(e) => setProductKnowledge(Number(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderHelp}>Meliputi ketepatan solusi, akurasi penjelasan fitur sistem/promo, dan kejelasan prosedur.</span>
            </div>

            {/* Switch: Process & Compliance Fatal Issue */}
            <div className="form-group" style={styles.fatalGroup}>
              <div style={styles.fatalHeader}>
                <span style={styles.labelSpan}><CheckSquare size={16} /> Kepatuhan Proses & SOP (Bobot 40%)</span>
                <label style={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={isFatal}
                    onChange={(e) => setIsFatal(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxCustom}></span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: isFatal ? 'var(--danger)' : 'var(--text-heading)' }}>
                    {isFatal ? 'FATAL ERROR (Auto Score 0!)' : 'Kepatuhan Aman'}
                  </span>
                </label>
              </div>
              <span style={styles.sliderHelp}>
                Apakah terjadi pelanggaran SOP fatal? (Contoh: Lupa verifikasi identitas, membocorkan OTP, bahasa kasar, menutup telepon sepihak).
              </span>
            </div>

            {/* Realtime Warning Banner */}
            {isFatal && (
              <div style={styles.warningBanner}>
                <AlertOctagon size={18} />
                <span>
                  <strong>Kesalahan SOP Fatal Terdeteksi!</strong> Skor QMS otomatis diatur ke <strong>0%</strong> secara keseluruhan.
                </span>
              </div>
            )}

            {/* Textarea: Catatan / Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                <span style={styles.labelSpan}><MessageSquare size={16} /> Catatan / Keterangan Temuan</span>
              </label>
              <textarea
                id="notes"
                className="form-input"
                rows="4"
                placeholder="Tuliskan catatan perbaikan atau pujian performa..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={styles.textarea}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" style={styles.submitBtn}>
              <FilePlus size={18} /> Simpan & Submit Evaluasi
            </button>
          </form>
        </div>

        {/* Right Card - Live Calculations & Preview */}
        <div className="glass-card" style={styles.previewCard}>
          <h3 style={styles.previewTitle}>Live QMS Preview</h3>
          <p style={styles.previewSubtitle}>Kalkulator nilai otomatis secara realtime.</p>
          
          <div style={styles.scoreCircleWrapper}>
            <div style={{
              ...styles.scoreCircle,
              borderColor: isFatal ? 'var(--danger)' : (calculatedScore >= 90 ? 'var(--success)' : (calculatedScore >= 80 ? 'var(--warning)' : 'var(--danger)')),
              boxShadow: isFatal ? '0 0 20px var(--danger-glow)' : (calculatedScore >= 90 ? '0 0 20px var(--success-glow)' : '0 0 20px var(--primary-glow)')
            }}>
              <span style={{ 
                ...styles.scoreNumber,
                color: isFatal ? 'var(--danger)' : (calculatedScore >= 90 ? 'var(--success)' : (calculatedScore >= 80 ? 'var(--warning)' : 'var(--danger)'))
              }}>{calculatedScore}%</span>
              <span style={styles.scoreText}>QMS SCORE</span>
            </div>
          </div>

          <div style={styles.breakdownList}>
            <h4 style={styles.breakdownTitle}>Rincian Bobot Nilai:</h4>
            
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>Soft Skills (30%)</span>
              <span style={styles.breakdownVal}>{Math.round(softSkills * 0.3)} pts</span>
            </div>
            
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>Product Knowledge (30%)</span>
              <span style={styles.breakdownVal}>{Math.round(productKnowledge * 0.3)} pts</span>
            </div>

            <div style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>Process Compliance (40%)</span>
              <span style={{ 
                ...styles.breakdownVal, 
                color: isFatal ? 'var(--danger)' : 'var(--success)'
              }}>
                {isFatal ? '0 pts (Fatal SOP)' : '40 pts (SOP Ok)'}
              </span>
            </div>
            
            <div style={{ ...styles.breakdownItem, borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '10px' }}>
              <strong style={{ color: 'var(--text-heading)' }}>Skor Terkalkulasi:</strong>
              <strong style={{ 
                fontSize: '16px', 
                color: isFatal ? 'var(--danger)' : (calculatedScore >= 90 ? 'var(--success)' : (calculatedScore >= 80 ? 'var(--warning)' : 'var(--primary)'))
              }}>{calculatedScore}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff 40%, var(--primary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  formLayout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  formCard: {
    flex: '1.4',
    minWidth: '320px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  auditorBadge: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--card-border)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '10px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  labelSpan: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
  sliderGroup: {
    background: 'rgba(0,0,0,0.15)',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
  },
  sliderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  sliderVal: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  slider: {
    width: '100%',
    height: '6px',
    background: 'var(--border-light)',
    outline: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    accentColor: 'var(--primary)',
  },
  sliderHelp: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '6px',
    lineHeight: '1.3',
  },
  fatalGroup: {
    background: 'rgba(239, 68, 68, 0.05)',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  fatalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '8px',
  },
  switchLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: 'var(--danger)',
  },
  warningBanner: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  textarea: {
    fontFamily: 'var(--font-sans)',
    resize: 'vertical',
  },
  submitBtn: {
    marginTop: '10px',
    padding: '14px',
  },
  previewCard: {
    flex: '0.8',
    minWidth: '280px',
    textAlign: 'center',
    padding: '30px 24px',
    position: 'sticky',
    top: '20px',
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: '700',
  },
  previewSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '24px',
  },
  scoreCircleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '28px',
  },
  scoreCircle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    border: '6px solid var(--primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  scoreNumber: {
    fontSize: '38px',
    fontWeight: '800',
    fontFamily: 'var(--font-heading)',
  },
  scoreText: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    marginTop: '-4px',
  },
  breakdownList: {
    background: 'rgba(0,0,0,0.2)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--border-light)',
    textAlign: 'left',
  },
  breakdownTitle: {
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '12px',
    color: 'var(--text-heading)',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    padding: '6px 0',
  },
  breakdownLabel: {
    color: 'var(--text-muted)',
  },
  breakdownVal: {
    fontWeight: '600',
    color: 'var(--text-heading)',
  },
  successCard: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  accessDeniedContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    width: '100%',
  },
  accessDeniedCard: {
    maxWidth: '450px',
    textAlign: 'center',
    padding: '40px 30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};
