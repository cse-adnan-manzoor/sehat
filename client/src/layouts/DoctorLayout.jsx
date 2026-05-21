import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../features/auth/authSlice';
import { FiHome, FiCalendar, FiDollarSign, FiUser, FiMessageSquare, FiLogOut, FiMenu, FiX, FiBell, FiVideo } from 'react-icons/fi';
import './DoctorLayout.css';

const navItems = [
  { to: '/doctor/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/doctor/appointments', icon: FiCalendar, label: 'Appointments' },
  { to: '/doctor/chat', icon: FiMessageSquare, label: 'Chat' },
  { to: '/doctor/earnings', icon: FiDollarSign, label: 'Earnings' },
  { to: '/doctor/profile', icon: FiUser, label: 'Profile' },
];

const bottomNavItems = [
  { to: '/doctor/dashboard', icon: FiHome, label: 'Home' },
  { to: '/doctor/appointments', icon: FiCalendar, label: 'Appointments' },
  { to: '/doctor/chat', icon: FiMessageSquare, label: 'Chat' },
  { to: '/doctor/earnings', icon: FiDollarSign, label: 'Earnings' },
  { to: '/doctor/profile', icon: FiUser, label: 'Profile' },
];

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  return (
    <div className="doctor-layout">
      <AnimatePresence>
        {sidebarOpen && <motion.div className="sidebar-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />}
      </AnimatePresence>

      <aside className={`sidebar doctor-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🏥</div>
            <span className="logo-text">Sehat</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><FiX /></button>
        </div>

        <div className="sidebar-user">
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'D')}&background=0D7377&color=fff`} alt={user?.name} className="avatar avatar-lg" />
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role doctor-role">Doctor</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}><FiLogOut size={18} /><span>Logout</span></button>
      </aside>

      <div className="layout-main">
        <header className="layout-header">
          <button className="header-menu-btn" onClick={() => setSidebarOpen(true)}><FiMenu size={22} /></button>
          <div className="header-logo-mobile"><span className="logo-icon-sm">🏥</span><span>Sehat</span></div>
          <div className="header-actions">
            <button className="header-icon-btn"><FiBell size={20} /></button>
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'D')}&background=0D7377&color=fff`} alt="" className="avatar avatar-sm" onClick={() => navigate('/doctor/profile')} style={{ cursor: 'pointer' }} />
          </div>
        </header>
        <main className="layout-content"><Outlet /></main>
      </div>

      <nav className="bottom-nav">
        {bottomNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
