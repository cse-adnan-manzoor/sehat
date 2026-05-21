import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { FiCalendar, FiDollarSign, FiUsers, FiToggleLeft, FiToggleRight, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user } = useSelector(s => s.auth);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/auth/me').then(r => { setDoctorProfile(r.data.user?.doctorProfile); setIsOnline(r.data.user?.doctorProfile?.isOnline || false); }),
      api.get('/appointments?limit=10').then(r => setAppointments(r.data.appointments || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const toggleOnline = async () => {
    try {
      const r = await api.put('/doctors/toggle-online');
      setIsOnline(r.data.isOnline);
      toast.success(r.data.isOnline ? '🟢 You are now online' : '🔴 You are now offline');
    } catch { toast.error('Failed to update status'); }
  };

  const today = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString());
  const upcoming = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const earnings = appointments.filter(a => a.status === 'COMPLETED').reduce((sum, a) => sum + (a.paymentAmount || 0), 0);

  const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return '🌅 Good Morning'; if (h < 17) return '☀️ Good Afternoon'; return '🌙 Good Evening'; };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero */}
      <motion.div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', borderRadius: 'var(--radius-xl)', padding: '1.75rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>{getGreeting()}, Doctor</div>
          <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, marginBottom: '0.25rem' }}>{user?.name} 👋</h1>
          <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{doctorProfile?.specialty} · {doctorProfile?.experience} years experience</p>
        </div>
        <button onClick={toggleOnline} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid rgba(255,255,255,0.3)', background: isOnline ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          {isOnline ? <FiToggleRight size={20} style={{ color: '#22C55E' }}/> : <FiToggleLeft size={20}/>}
          {isOnline ? 'Online' : 'Go Online'}
        </button>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: "Today's Patients", value: today.length, icon: '👥', color: '#0D7377', bg: '#E6F7F7' },
          { label: 'Upcoming', value: upcoming.length, icon: '📅', color: '#3B82F6', bg: '#DBEAFE' },
          { label: 'Total Consultations', value: appointments.length, icon: '🩺', color: '#8B5CF6', bg: '#EDE9FE' },
          { label: 'Total Earnings', value: `₹${earnings.toLocaleString()}`, icon: '💰', color: '#F59E0B', bg: '#FEF3C7' },
        ].map((s, i) => (
          <motion.div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontSize: '1.375rem', fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</div></div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Today's Appointments */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700 }}>Today's Schedule</h3>
              <Link to="/doctor/appointments" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View All <FiArrowRight size={13}/></Link>
            </div>
            {today.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}><div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😌</div><p style={{ fontSize: '0.875rem' }}>No appointments today</p></div>
            ) : today.map(apt => (
              <div key={apt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                <img src={apt.patient?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient?.user?.name||'P')}&background=E8F4FD&color=0D7377`} alt="" className="avatar" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{apt.patient?.user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{apt.timeSlot} · {apt.type}</div>
                </div>
                {apt.status === 'CONFIRMED' && <Link to={`/doctor/video/${apt.id}`} className="btn btn-primary btn-sm">Join</Link>}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Your Practice</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Specialty', value: doctorProfile?.specialty || '—' },
                { label: 'Qualification', value: doctorProfile?.qualification || '—' },
                { label: 'Experience', value: `${doctorProfile?.experience || 0} years` },
                { label: 'Consultation Fee', value: doctorProfile?.consultationFee === 0 ? 'Free' : `₹${doctorProfile?.consultationFee}` },
                { label: 'Rating', value: `⭐ ${doctorProfile?.rating || 0} (${doctorProfile?.totalReviews || 0} reviews)` },
                { label: 'Hospital', value: doctorProfile?.hospitalName || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
            <Link to="/doctor/profile" className="btn btn-secondary w-full btn-sm" style={{ marginTop: '1rem' }}>Edit Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
