import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../features/auth/authSlice';
import {
  FiHome, FiSearch, FiCalendar, FiMessageSquare, FiActivity,
  FiShoppingCart, FiFileText, FiUser, FiLogOut, FiMenu, FiX,
  FiShoppingBag, FiBell, FiPackage
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './PatientLayout.css';

const navItems = [
  { to: '/patient/dashboard', icon: FiHome, label: 'patient.sidebar.dashboard' },
  { to: '/patient/doctors', icon: FiSearch, label: 'patient.sidebar.findDoctors' },
  { to: '/patient/appointments', icon: FiCalendar, label: 'patient.sidebar.appointments' },
  { to: '/patient/chat', icon: FiMessageSquare, label: 'patient.sidebar.chat' },
  { to: '/patient/symptom-checker', icon: FiActivity, label: 'patient.sidebar.symptoms' },
  { to: '/patient/pharmacy', icon: FiShoppingCart, label: 'patient.sidebar.pharmacy' },
  { to: '/patient/orders', icon: FiPackage, label: 'patient.sidebar.orders' },
  { to: '/patient/health-records', icon: FiFileText, label: 'patient.sidebar.records' },
  { to: '/patient/profile', icon: FiUser, label: 'patient.sidebar.profile' },
];

const bottomNavItems = [
  { to: '/patient/dashboard', icon: FiHome, label: 'patient.sidebar.home' },
  { to: '/patient/doctors', icon: FiSearch, label: 'patient.sidebar.findDoctors' },
  { to: '/patient/appointments', icon: FiCalendar, label: 'patient.sidebar.bookings' },
  { to: '/patient/chat', icon: FiMessageSquare, label: 'patient.sidebar.chat' },
  { to: '/patient/profile', icon: FiUser, label: 'patient.sidebar.profile' },
];

export default function PatientLayout() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector(s => s.auth);
  const { cart } = useSelector(s => s.pharmacy);
  const { unreadCount } = useSelector(s => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = cart?.items?.length || 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="patient-layout">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="sidebar-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <motion.aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} initial={false}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">🏥</div>
            <span className="logo-text">Sehat</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><FiX /></button>
        </div>

        <div className="sidebar-user">
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0D7377&color=fff`} alt={user?.name} className="avatar avatar-lg" />
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{t('patient.sidebar.patient')}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />
              <span>{t(label)}</span>
              {label === 'patient.sidebar.pharmacy' && cartCount > 0 && <span className="sidebar-badge">{cartCount}</span>}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut size={18} />
          <span>{t('patient.sidebar.logout')}</span>
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="layout-main">
        {/* Top Navbar */}
        <header className="layout-header">
          <button className="header-menu-btn" onClick={() => setSidebarOpen(true)}><FiMenu size={22} /></button>
          <div className="header-logo-mobile">
            <span className="logo-icon-sm">🏥</span>
            <span>Sehat</span>
          </div>
          <div className="header-actions">
            <LanguageSwitcher />
            <NavLink to="/patient/cart" className="header-icon-btn">
              <FiShoppingBag size={20} />
              {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
            </NavLink>
            <button className="header-icon-btn">
              <FiBell size={20} />
              {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
            </button>
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0D7377&color=fff`} alt={user?.name} className="avatar avatar-sm" onClick={() => navigate('/patient/profile')} style={{ cursor: 'pointer' }} />
          </div>
        </header>

        {/* Page Content */}
        <main className="layout-content">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav (Mobile) */}
      <nav className="bottom-nav">
        {bottomNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} />
            <span>{t(label)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
