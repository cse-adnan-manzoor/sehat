import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../../features/appointments/appointmentsSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiVideo } from 'react-icons/fi';

const TABS = ['All','Upcoming','Completed','Cancelled'];
const statusMap = { Upcoming: ['CONFIRMED','PENDING'], Completed: ['COMPLETED'], Cancelled: ['CANCELLED'] };
const statusColors = { CONFIRMED:'success', PENDING:'warning', COMPLETED:'info', CANCELLED:'danger' };

export default function DoctorAppointments() {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector(s => s.appointments);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => { dispatch(fetchAppointments({ limit: 50 })); }, [dispatch]);

  const filtered = activeTab === 'All' ? appointments : appointments.filter(a => statusMap[activeTab]?.includes(a.status));

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status.toLowerCase()}`);
      dispatch(fetchAppointments({ limit: 50 }));
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div>
      <div className="page-header"><h1>📅 Appointments</h1><p>Manage your patient consultations</p></div>
      <div className="tabs">{TABS.map(t => <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>)}</div>
      {loading ? <div className="loading-screen"><div className="spinner" /></div> : filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">📅</div><h3>No appointments</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtered.map((apt, i) => (
            <motion.div key={apt.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <img src={apt.patient?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient?.user?.name||'P')}&background=E8F4FD&color=0D7377`} alt="" className="avatar avatar-lg" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{apt.patient?.user?.name}</div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><FiCalendar size={12}/>{new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><FiClock size={12}/>{apt.timeSlot}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><FiVideo size={12}/>{apt.type}</span>
                  </div>
                  {apt.symptoms && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>Symptoms: {apt.symptoms}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`badge badge-${statusColors[apt.status]}`}>{apt.status}</span>
                  {apt.status === 'CONFIRMED' && <Link to={`/doctor/video/${apt.id}`} className="btn btn-primary btn-sm"><FiVideo size={13}/> Start</Link>}
                  {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}>✓ Complete</button>
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
