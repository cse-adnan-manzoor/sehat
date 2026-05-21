import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchAppointments, cancelAppointment } from '../../features/appointments/appointmentsSlice';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiClock, FiVideo, FiX } from 'react-icons/fi';

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];
const statusMap = { Upcoming: ['CONFIRMED', 'PENDING'], Completed: ['COMPLETED'], Cancelled: ['CANCELLED'] };

const statusColors = { CONFIRMED: 'success', PENDING: 'warning', COMPLETED: 'info', CANCELLED: 'danger', IN_PROGRESS: 'primary' };

export default function MyAppointments() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector(s => s.appointments);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => { dispatch(fetchAppointments({ limit: 50 })); }, [dispatch]);

  const filtered = activeTab === 'All' ? appointments : appointments.filter(a => statusMap[activeTab]?.includes(a.status));

  const handleCancel = async (id) => {
    if (!confirm(t('patient.myAppointments.confirmCancel'))) return;
    const res = await dispatch(cancelAppointment(id));
    if (cancelAppointment.fulfilled.match(res)) toast.success(t('patient.myAppointments.cancelSuccess'));
    else toast.error(t('patient.myAppointments.cancelFail'));
  };

  return (
    <div>
      <div className="page-header"><h1>{t('patient.myAppointments.title')}</h1><p>{t('patient.myAppointments.subtitle')}</p></div>
      <div className="tabs">
        {TABS.map(tKey => <div key={tKey} className={`tab ${activeTab === tKey ? 'active' : ''}`} onClick={() => setActiveTab(tKey)}>{t(`patient.myAppointments.tabs.${tKey}`)} {tKey === 'All' ? `(${appointments.length})` : `(${(statusMap[tKey] ? appointments.filter(a => statusMap[tKey].includes(a.status)) : appointments).length})`}</div>)}
      </div>
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">📅</div><h3>{t('patient.myAppointments.noAppointments')}</h3><p>{t('patient.myAppointments.bookFirst')}</p><Link to="/patient/doctors" className="btn btn-primary" style={{ marginTop: '1rem' }}>{t('patient.myAppointments.findDoctors')}</Link></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((apt, i) => (
            <motion.div key={apt.id} className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="card-body" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <img src={apt.doctor?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.user?.name||'D')}&background=0D7377&color=fff`} alt="" className="avatar avatar-xl" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.125rem' }}>{apt.doctor?.user?.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{apt.doctor?.specialty}</p>
                    </div>
                    <span className={`badge badge-${statusColors[apt.status] || 'primary'}`}>{apt.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><FiCalendar size={13}/>{new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><FiClock size={13}/>{apt.timeSlot}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><FiVideo size={13}/>{apt.type === 'video' ? t('patient.myAppointments.videoCall') : t('patient.myAppointments.inPerson')}</span>
                  </div>
                  {apt.symptoms && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.375rem', fontStyle: 'italic' }}>{t('patient.myAppointments.symptoms')}: {apt.symptoms}</p>}
                  {apt.prescription && <div style={{ marginTop: '0.5rem', padding: '0.625rem', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>📋 {t('patient.myAppointments.prescriptionAvail')}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                  {apt.status === 'CONFIRMED' && <Link to={`/patient/video/${apt.id}`} className="btn btn-primary btn-sm"><FiVideo size={13}/> {t('patient.myAppointments.join')}</Link>}
                  {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleCancel(apt.id)}><FiX size={13}/> {t('patient.myAppointments.cancel')}</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
