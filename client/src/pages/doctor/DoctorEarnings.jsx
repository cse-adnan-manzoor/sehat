import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi';

export default function DoctorEarnings() {
  const { user } = useSelector(s => s.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments?limit=100').then(r => setAppointments(r.data.appointments || [])).finally(() => setLoading(false));
  }, []);

  const completed = appointments.filter(a => a.status === 'COMPLETED');
  const total = completed.reduce((sum, a) => sum + (a.paymentAmount || 0), 0);
  const thisMonth = completed.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).reduce((sum, a) => sum + (a.paymentAmount || 0), 0);
  const thisWeek = completed.filter(a => { const d = new Date(a.date); const now = new Date(); const weekAgo = new Date(now.setDate(now.getDate() - 7)); return d >= weekAgo; }).reduce((sum, a) => sum + (a.paymentAmount || 0), 0);

  return (
    <div>
      <div className="page-header"><h1>💰 Earnings</h1><p>Track your consultation revenue</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Earnings', value: `₹${total.toLocaleString()}`, icon: '💰', color: '#0D7377', bg: '#E6F7F7' },
          { label: 'This Month', value: `₹${thisMonth.toLocaleString()}`, icon: '📅', color: '#8B5CF6', bg: '#EDE9FE' },
          { label: 'This Week', value: `₹${thisWeek.toLocaleString()}`, icon: '📈', color: '#22C55E', bg: '#DCFCE7' },
        ].map((s, i) => (
          <motion.div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }}>
            <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.label}</div></div>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Payments</h3>
          {loading ? <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner" /></div> : completed.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}><div className="icon">💰</div><h3>No earnings yet</h3><p>Complete consultations to earn</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {completed.map((apt, i) => (
                <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img src={apt.patient?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient?.user?.name||'P')}&background=E8F4FD&color=0D7377`} alt="" className="avatar avatar-sm" />
                    <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{apt.patient?.user?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(apt.date).toLocaleDateString('en-IN')}</div></div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>+₹{apt.paymentAmount || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
