import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchAppointments } from '../../features/appointments/appointmentsSlice';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiSearch, FiActivity, FiShoppingCart, FiFileText, FiVideo, FiArrowRight, FiClock } from 'react-icons/fi';
import './PatientDashboard.css';

const quickActions = [
  { to: '/patient/doctors', icon: FiSearch, labelKey: 'patient.sidebar.findDoctors', color: '#0D7377', bg: '#E6F7F7' },
  { to: '/patient/appointments', icon: FiCalendar, labelKey: 'patient.sidebar.appointments', color: '#3B82F6', bg: '#DBEAFE' },
  { to: '/patient/symptom-checker', icon: FiActivity, labelKey: 'patient.sidebar.symptoms', color: '#8B5CF6', bg: '#EDE9FE' },
  { to: '/patient/pharmacy', icon: FiShoppingCart, labelKey: 'patient.sidebar.pharmacy', color: '#F59E0B', bg: '#FEF3C7' },
  { to: '/patient/health-records', icon: FiFileText, labelKey: 'patient.sidebar.records', color: '#10B981', bg: '#D1FAE5' },
  { to: '/patient/chat', icon: FiVideo, labelKey: 'patient.sidebar.chat', color: '#EF4444', bg: '#FEE2E2' },
];

const healthTipsKeys = [
  { icon: '💧', tipKey: 'patient.dashboard.healthTips.water' },
  { icon: '🏃', tipKey: 'patient.dashboard.healthTips.exercise' },
  { icon: '😴', tipKey: 'patient.dashboard.healthTips.sleep' },
  { icon: '🥗', tipKey: 'patient.dashboard.healthTips.diet' },
];

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector(s => s.auth);
  const { list: appointments, loading } = useSelector(s => s.appointments);
  const dispatch = useDispatch();

  useEffect(() => { dispatch(fetchAppointments({ limit: 5 })); }, [dispatch]);

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').slice(0, 3);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return `🌅 ${t('patient.dashboard.goodMorning')}`;
    if (h < 17) return `☀️ ${t('patient.dashboard.goodAfternoon')}`;
    return `🌙 ${t('patient.dashboard.goodEvening')}`;
  };

  return (
    <div className="patient-dashboard">
      {/* Header */}
      <motion.div className="dashboard-hero" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <div className="dashboard-greeting">{getGreeting()}</div>
          <h1>{t('patient.dashboard.welcomeBack')}, <span>{user?.name?.split(' ')[0]}</span>! 👋</h1>
          <p>{t('patient.dashboard.howFeeling')}</p>
        </div>
        <div className="dashboard-hero-illustration">🏥</div>
      </motion.div>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <h2 className="section-title">{t('patient.dashboard.quickActions')}</h2>
        <motion.div className="quick-actions-grid" initial="hidden" animate="visible" variants={stagger}>
          {quickActions.map((a, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Link to={a.to} className="quick-action-card">
                <div className="qa-icon" style={{ background: a.bg, color: a.color }}>
                  <a.icon size={22} />
                </div>
                <span>{t(a.labelKey)}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="dashboard-grid">
        {/* Upcoming Appointments */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <h2 className="section-title">{t('patient.dashboard.upcomingApt')}</h2>
            <Link to="/patient/appointments" className="see-all-link">{t('patient.dashboard.seeAll')} <FiArrowRight size={14} /></Link>
          </div>
          {loading ? (
            <div className="skeleton-list">{[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" style={{height: 80, marginBottom: 8}} />)}</div>
          ) : upcoming.length === 0 ? (
            <div className="empty-card">
              <span>📅</span>
              <p>{t('patient.dashboard.noUpcoming')}</p>
              <Link to="/patient/doctors" className="btn btn-primary btn-sm">{t('patient.dashboard.bookNow')}</Link>
            </div>
          ) : (
            <div className="appointments-list">
              {upcoming.map(apt => (
                <motion.div key={apt.id} className="apt-card" whileHover={{ scale: 1.01 }}>
                  <img src={apt.doctor?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.user?.name || 'Dr')}&background=0D7377&color=fff`} alt="" className="avatar avatar-lg" />
                  <div className="apt-info">
                    <div className="apt-doctor">{apt.doctor?.user?.name}</div>
                    <div className="apt-specialty">{apt.doctor?.specialty}</div>
                    <div className="apt-time"><FiClock size={12} /> {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {apt.timeSlot}</div>
                  </div>
                  <div className={`apt-status status-${apt.status.toLowerCase()}`}>{apt.status}</div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Health Tips */}
        <section className="dashboard-section">
          <h2 className="section-title">{t('patient.dashboard.dailyHealth')}</h2>
          <div className="health-tips">
            {healthTipsKeys.map((tItem, i) => (
              <motion.div key={i} className="health-tip" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <span className="tip-icon">{tItem.icon}</span>
                <p>{t(tItem.tipKey)}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Stats */}
      <section className="dashboard-section">
        <h2 className="section-title">{t('patient.dashboard.healthGlance')}</h2>
        <div className="stats-row">
          {[
            { label: t('patient.dashboard.stats.total'), value: appointments.length, icon: '📅', color: '#0D7377' },
            { label: t('patient.dashboard.stats.completed'), value: appointments.filter(a => a.status === 'COMPLETED').length, icon: '✅', color: '#22C55E' },
            { label: t('patient.dashboard.stats.upcoming'), value: upcoming.length, icon: '⏰', color: '#3B82F6' },
            { label: t('patient.dashboard.stats.cancelled'), value: appointments.filter(a => a.status === 'CANCELLED').length, icon: '❌', color: '#EF4444' },
          ].map((s, i) => (
            <motion.div key={i} className="mini-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="mini-stat-icon" style={{ color: s.color }}>{s.icon}</div>
              <div className="mini-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="mini-stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
