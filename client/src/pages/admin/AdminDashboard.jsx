import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { FiUsers, FiCalendar, FiShoppingBag, FiActivity, FiRefreshCw } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: '👥', color: '#0D7377', bg: '#E6F7F7' },
    { label: 'Doctors', value: stats?.stats?.totalDoctors || 0, icon: '👨‍⚕️', color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Patients', value: stats?.stats?.totalPatients || 0, icon: '🏥', color: '#8B5CF6', bg: '#EDE9FE' },
    { label: 'Appointments', value: stats?.stats?.totalAppointments || 0, icon: '📅', color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Orders', value: stats?.stats?.totalOrders || 0, icon: '📦', color: '#10B981', bg: '#D1FAE5' },
    { label: 'Medicines', value: stats?.stats?.totalMedicines || 0, icon: '💊', color: '#EF4444', bg: '#FEE2E2' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', borderRadius: 'var(--radius-xl)', padding: '2rem', color: 'white', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>⚙️ Admin Dashboard</h1>
          <p style={{ opacity: 0.7 }}>Manage the Sehat platform</p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map((s, i) => (
          <motion.div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</div></div>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Appointments</h3>
          {(stats?.recentAppointments || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent appointments</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.recentAppointments.map(apt => (
                <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{apt.patient?.user?.name} → {apt.doctor?.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(apt.date).toLocaleDateString('en-IN')} · {apt.timeSlot}</div>
                    </div>
                  </div>
                  <span className={`badge badge-${apt.status === 'CONFIRMED' ? 'success' : apt.status === 'PENDING' ? 'warning' : apt.status === 'CANCELLED' ? 'danger' : 'info'}`}>{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
