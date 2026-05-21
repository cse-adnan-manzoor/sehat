import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchDoctors } from '../../features/doctors/doctorsSlice';
import { createAppointment } from '../../features/appointments/appointmentsSlice';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiClock, FiVideo, FiCheck } from 'react-icons/fi';
import './BookAppointment.css';

const TIME_SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

export default function BookAppointment() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: doctors, loading: doctorsLoading } = useSelector(s => s.doctors);
  const { loading } = useSelector(s => s.appointments);

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [type, setType] = useState('video');
  const [symptoms, setSymptoms] = useState('');

  const preselectedId = searchParams.get('doctorId');

  useEffect(() => {
    dispatch(fetchDoctors({ limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (preselectedId && doctors.length > 0) {
      const doc = doctors.find(d => d.id === preselectedId);
      if (doc) { setSelectedDoctor(doc); setStep(2); }
    }
  }, [preselectedId, doctors]);

  const getMinDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; };
  const getMaxDate = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) { toast.error(t('patient.bookAppointment.errCompleteSteps')); return; }
    const res = await dispatch(createAppointment({ doctorId: selectedDoctor.id, date: selectedDate, timeSlot: selectedSlot, type, symptoms }));
    if (createAppointment.fulfilled.match(res)) {
      toast.success(t('patient.bookAppointment.successBook'));
      navigate('/patient/appointments');
    } else { toast.error(t('patient.bookAppointment.errBookFail')); }
  };

  const steps = [t('patient.bookAppointment.step1'), t('patient.bookAppointment.step2'), t('patient.bookAppointment.step3')];

  return (
    <div className="book-appointment">
      {/* Header */}
      <div className="book-header">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="book-close-btn">✕</button>
        <h2>{t('patient.bookAppointment.title')}</h2>
        <div className="step-dots">
          {steps.map((_, i) => <div key={i} className={`step-dot ${i + 1 <= step ? 'active' : ''} ${i + 1 < step ? 'done' : ''}`} />)}
        </div>
      </div>

      <div className="book-content">
        <AnimatePresence mode="wait">
          {/* Step 1: Doctor */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h3 className="step-title">{t('patient.bookAppointment.selectDoctorTitle')}</h3>
              {doctorsLoading ? <div className="loading-screen"><div className="spinner" /></div> : (
                <div className="doctor-select-list">
                  {doctors.map(doc => (
                    <div key={doc.id} className={`doctor-select-item ${selectedDoctor?.id === doc.id ? 'selected' : ''}`} onClick={() => setSelectedDoctor(doc)}>
                      <img src={doc.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user?.name||'D')}&background=0D7377&color=fff`} alt="" className="avatar avatar-lg" />
                      <div className="doctor-select-info">
                        <div className="doctor-select-name">{doc.user?.name}</div>
                        <div className="doctor-select-specialty">{doc.specialty}</div>
                        <div className="doctor-select-rating">⭐ {doc.rating} ({doc.totalReviews} {t('patient.bookAppointment.reviews')})</div>
                      </div>
                      <div className="doctor-select-fee">{doc.consultationFee === 0 ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>{t('patient.bookAppointment.free')}</span> : <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{doc.consultationFee}</span>}</div>
                      {selectedDoctor?.id === doc.id && <FiCheck className="doctor-select-check" />}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h3 className="step-title">{t('patient.bookAppointment.selectDateTime')}</h3>
              <div className="form-group">
                <label className="form-label"><FiCalendar /> {t('patient.bookAppointment.consultationDate')}</label>
                <input type="date" className="form-input" value={selectedDate} min={getMinDate()} max={getMaxDate()} onChange={e => setSelectedDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><FiClock /> {t('patient.bookAppointment.timeSlot')}</label>
                <div className="time-slots-grid">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} className={`time-slot-btn ${selectedSlot === slot ? 'active' : ''}`} onClick={() => setSelectedSlot(slot)}>{slot}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><FiVideo /> {t('patient.bookAppointment.consultationType')}</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[{ value: 'video', label: t('patient.bookAppointment.videoCall') }, { value: 'in-person', label: t('patient.bookAppointment.inPerson') }].map(typeObj => (
                    <button key={typeObj.value} className={`type-btn ${type === typeObj.value ? 'active' : ''}`} onClick={() => setType(typeObj.value)}>{typeObj.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('patient.bookAppointment.symptomsTitle')}</label>
                <textarea className="form-input" rows={3} value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder={t('patient.bookAppointment.symptomsPlaceholder')} style={{ resize: 'vertical' }} />
              </div>
            </motion.div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && selectedDoctor && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h3 className="step-title">{t('patient.bookAppointment.summaryTitle')}</h3>
              <div className="summary-card">
                <div className="summary-section"><div className="summary-label">{t('patient.bookAppointment.summaryDoctor')}</div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <img src={selectedDoctor.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.user?.name||'D')}&background=0D7377&color=fff`} alt="" className="avatar" />
                    <div><div style={{ fontWeight: 700 }}>{selectedDoctor.user?.name}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedDoctor.specialty}</div><div style={{ color: '#F59E0B', fontSize: '0.75rem' }}>⭐ {selectedDoctor.rating} ({selectedDoctor.totalReviews} {t('patient.bookAppointment.reviews')})</div></div>
                  </div>
                </div>
                <div className="summary-section"><div className="summary-label">{t('patient.bookAppointment.summaryDateTime')}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('patient.bookAppointment.dateLabel')}</div><div style={{ fontWeight: 700 }}>{selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div></div>
                    <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('patient.bookAppointment.timeLabel')}</div><div style={{ fontWeight: 700 }}>{selectedSlot}</div></div>
                  </div>
                </div>
                <div className="summary-section"><div className="summary-label">{t('patient.bookAppointment.summaryType')}</div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{type === 'video' ? '🎥' : '🏥'}</span>
                    <div><div style={{ fontWeight: 600 }}>{type === 'video' ? t('patient.bookAppointment.videoType') : t('patient.bookAppointment.inPersonType')}</div><div style={{ fontSize: '0.8rem', color: selectedDoctor.consultationFee === 0 ? 'var(--success)' : 'var(--primary)', fontWeight: 700 }}>{selectedDoctor.consultationFee === 0 ? t('patient.bookAppointment.free') : `₹${selectedDoctor.consultationFee}`}</div></div>
                  </div>
                </div>
                <div className="summary-info-box">
                  <div style={{ fontWeight: 600, color: 'var(--info)', marginBottom: '0.5rem' }}>{t('patient.bookAppointment.importantInfo')}</div>
                  <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8, listStyle: 'disc', paddingLeft: '1rem' }}>
                    <li>{t('patient.bookAppointment.info1')}</li>
                    <li>{t('patient.bookAppointment.info2')}</li>
                    <li>{t('patient.bookAppointment.info3')}</li>
                    <li>{t('patient.bookAppointment.info4')}</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer buttons */}
      <div className="book-footer">
        {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>{t('patient.bookAppointment.backBtn')}</button>}
        {step < 3 ? (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { if (step === 1 && !selectedDoctor) { toast.error(t('patient.bookAppointment.errSelectDoc')); return; } if (step === 2 && (!selectedDate || !selectedSlot)) { toast.error(t('patient.bookAppointment.errSelectDateTime')); return; } setStep(s => s + 1); }} disabled={step === 1 && !selectedDoctor}>{t('patient.bookAppointment.nextBtn')}</button>
        ) : (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm} disabled={loading}>{loading ? <span className="btn-spinner" /> : t('patient.bookAppointment.confirmBtn')}</button>
        )}
      </div>
    </div>
  );
}
