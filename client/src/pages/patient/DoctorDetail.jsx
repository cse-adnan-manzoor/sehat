import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchDoctor } from '../../features/doctors/doctorsSlice';
import { useTranslation } from 'react-i18next';
import { FiStar, FiMapPin, FiClock, FiArrowLeft, FiCalendar, FiMessageSquare } from 'react-icons/fi';

export default function DoctorDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: doctor, loading } = useSelector(s => s.doctors);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => { dispatch(fetchDoctor(id)); }, [id, dispatch]);

  if (loading || !doctor) return <div className="loading-screen"><div className="spinner" /><p>Loading doctor profile...</p></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}><FiArrowLeft /> {t('patient.doctorDetail.back')}</button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', padding: '2rem', color: 'white', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <img src={doctor.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user?.name||'D')}&background=fff&color=0D7377&size=120`} alt={doctor.user?.name} style={{ width: 96, height: 96, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)', objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{doctor.user?.name}</h1>
            <p style={{ opacity: 0.85, marginBottom: '0.5rem' }}>{doctor.specialty} • {doctor.qualification}</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}><FiStar style={{ color: '#F59E0B' }}/> {doctor.rating} ({doctor.totalReviews} {t('patient.doctorDetail.reviews')})</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}><FiClock /> {doctor.experience} {t('patient.doctorDetail.yearsExp')}</span>
              {doctor.hospitalName && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}><FiMapPin /> {doctor.hospitalName}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>{t('patient.doctorDetail.consultationFee')}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#14FFEC' }}>{doctor.consultationFee === 0 ? t('patient.doctorDetail.free') : `₹${doctor.consultationFee}`}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: doctor.isAvailable ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', marginTop: '0.375rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: doctor.isAvailable ? '#22C55E' : '#9CA3AF', display: 'inline-block' }} />
              {doctor.isAvailable ? t('patient.doctorDetail.available') : t('patient.doctorDetail.unavailable')}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {['about','reviews'].map(tKey => <div key={tKey} className={`tab ${activeTab === tKey ? 'active' : ''}`} onClick={() => setActiveTab(tKey)} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>{tKey === 'about' ? t('patient.doctorDetail.about') : t('patient.doctorDetail.reviewsTab')}</div>)}
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {doctor.bio && <div><h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{t('patient.doctorDetail.aboutHeading')}</h3><p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{doctor.bio}</p></div>}
              <div><h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{t('patient.doctorDetail.languages')}</h3><div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{(doctor.languages || ['English']).map(l => <span key={l} className="badge badge-primary">{l}</span>)}</div></div>
              {doctor.availableSlots && <div><h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{t('patient.doctorDetail.availableDays')}</h3><p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('patient.doctorDetail.contactAvail')}</p></div>}
            </div>
          )}
          {activeTab === 'reviews' && (
            <div>
              {(doctor.user?.reviewsReceived || []).length === 0 ? (
                <div className="empty-state"><div className="icon">⭐</div><h3>{t('patient.doctorDetail.noReviewsYet')}</h3></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(doctor.user?.reviewsReceived || []).map(r => (
                    <div key={r.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <img src={r.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author?.name||'U')}&background=E8F4FD&color=0D7377`} alt="" className="avatar avatar-sm" />
                        <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.author?.name}</div><div style={{ color: '#F59E0B', fontSize: '0.8rem' }}>{'★'.repeat(r.rating)}</div></div>
                      </div>
                      {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
          <Link to={`/patient/book-appointment?doctorId=${doctor.id}`} className="btn btn-primary btn-lg" style={{ flex: 1 }}><FiCalendar /> {t('patient.doctorDetail.bookAppointment')}</Link>
          <Link to="/patient/chat" className="btn btn-secondary btn-lg"><FiMessageSquare /> {t('patient.doctorDetail.chat')}</Link>
        </div>
      </motion.div>
    </div>
  );
}
