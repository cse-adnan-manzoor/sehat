import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FiActivity, FiArrowRight, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

const SYMPTOMS_LIST = ['Headache','Fever','Cough','Chest Pain','Stomach Pain','Back Pain','Fatigue','Skin Rash','Joint Pain','Breathing Difficulty','Nausea','Dizziness','Sore Throat','Eye Pain','Toothache'];
const SEVERITY_COLORS = { mild: { bg: 'var(--success-light)', color: 'var(--success)', icon: '✅' }, moderate: { bg: 'var(--warning-light)', color: 'var(--warning)', icon: '⚠️' }, severe: { bg: 'var(--danger-light)', color: 'var(--danger)', icon: '🚨' } };

export default function SymptomChecker() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) { toast.error(t('patient.symptomChecker.errSelect')); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/symptom-checker', { symptoms: selectedSymptoms, age, gender });
      setResult(data.result);
      setStep(3);
    } catch { toast.error(t('patient.symptomChecker.errFail')); }
    finally { setLoading(false); }
  };

  const sev = result ? SEVERITY_COLORS[result.severity] : null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="page-header"><h1>🧠 {t('patient.symptomChecker.title')}</h1><p>{t('patient.symptomChecker.subtitle')}</p></div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[t('patient.symptomChecker.step1'), t('patient.symptomChecker.step2'), t('patient.symptomChecker.step3')].map((s, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ height: 4, borderRadius: 2, background: i + 1 <= step ? 'var(--primary)' : 'var(--border)' }} />
            <span style={{ fontSize: '0.7rem', color: i + 1 <= step ? 'var(--primary)' : 'var(--text-muted)', fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card-body">
              <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>{t('patient.symptomChecker.whatSymptoms')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{t('patient.symptomChecker.selectAll')}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {SYMPTOMS_LIST.map(s => (
                  <motion.button key={s} onClick={() => toggleSymptom(s)} whileTap={{ scale: 0.97 }}
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: `2px solid ${selectedSymptoms.includes(s) ? 'var(--primary)' : 'var(--border)'}`, background: selectedSymptoms.includes(s) ? 'var(--primary-50)' : 'var(--bg)', color: selectedSymptoms.includes(s) ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: selectedSymptoms.includes(s) ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {s}
                  </motion.button>
                ))}
              </div>
              {selectedSymptoms.length > 0 && (
                <div style={{ background: 'var(--primary-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                  {t('patient.symptomChecker.selected')} {selectedSymptoms.join(', ')}
                </div>
              )}
              <button className="btn btn-primary w-full" onClick={() => setStep(2)} disabled={selectedSymptoms.length === 0}>{t('patient.symptomChecker.next')} <FiArrowRight /></button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card-body">
              <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>{t('patient.symptomChecker.aboutYou')}</h3>
              <div className="form-group">
                <label className="form-label">{t('patient.symptomChecker.age')}</label>
                <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} placeholder={t('patient.symptomChecker.agePlaceholder')} min="1" max="120" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('patient.symptomChecker.gender')}</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `2px solid ${gender === g ? 'var(--primary)' : 'var(--border)'}`, background: gender === g ? 'var(--primary-50)' : 'var(--bg)', color: gender === g ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: gender === g ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.875rem' }}>{g}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}><FiArrowLeft /> {t('patient.symptomChecker.back')}</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAnalyze} disabled={loading}>{loading ? <span className="btn-spinner" /> : t('patient.symptomChecker.analyze')}</button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Severity Banner */}
            <div style={{ background: sev.bg, border: `1px solid ${sev.color}`, borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2.5rem' }}>{sev.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: sev.color, textTransform: 'capitalize' }}>{t('patient.symptomChecker.severity')} {result.severity}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('patient.symptomChecker.basedOn')}</div>
              </div>
            </div>

            {/* Conditions */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-body">
                <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>{t('patient.symptomChecker.conditions')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.possibleConditions.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-body">
                <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>{t('patient.symptomChecker.recommendations')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.recommendations.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>→</span> {r}
                    </div>
                  ))}
                </div>
                {result.recommendedSpecialties.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('patient.symptomChecker.recommendedSpecialists')}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{result.recommendedSpecialties.map(s => <span key={s} className="badge badge-primary">{s}</span>)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              <FiAlertCircle style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '1px' }} />
              {result.disclaimer}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setSelectedSymptoms([]); setResult(null); }}>{t('patient.symptomChecker.checkAgain')}</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/patient/doctors')}>{t('patient.symptomChecker.findDoctor')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
