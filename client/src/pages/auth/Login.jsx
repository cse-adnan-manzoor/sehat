import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginUser } from '../../features/auth/authSlice';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import './Auth.css';

const DEMO = {
  PATIENT: { email: 'patient@sehat.com', password: 'password123' },
  DOCTOR: { email: 'rajesh@sehat.com', password: 'password123' },
  ADMIN: { email: 'admin@sehat.com', password: 'password123' },
};

export default function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { loading, error } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(res)) {
      toast.success(`Welcome back, ${res.payload.user.name}!`);
      const role = res.payload.user.role;
      navigate(role === 'DOCTOR' ? '/doctor/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard');
    } else {
      toast.error(res.payload || 'Login failed');
    }
  };

  const fillDemo = (role) => setForm(DEMO[role]);

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}><LanguageSwitcher /></div>
        <div className="auth-brand">
          <div className="auth-logo">🏥</div>
          <h1>Sehat</h1>
          <p>{t('hero.title2')}</p>
        </div>
        <div className="auth-features">
          {t('login.features', { returnObjects: true }).map((f, i) => (
            <div key={i} className="auth-feature"><span className="auth-check">✓</span>{f}</div>
          ))}
        </div>
      </div>

      <motion.div className="auth-right" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="auth-card">
          <div className="auth-header">
            <h2>{t('login.title')}</h2>
            <p>{t('login.subtitle')}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('login.emailLabel')}</label>
              <div className="form-input-icon">
                <FiMail className="icon" />
                <input id="login-email" name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder={t('login.emailPlaceholder')} required />
              </div>
            </div>
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">{t('login.passwordLabel')}</label>
                <Link to="/forgot-password" className="forgot-link">{t('login.forgotPassword')}</Link>
              </div>
              <div className="form-input-icon">
                <FiLock className="icon" />
                <input id="login-password" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} className="form-input" placeholder={t('login.passwordPlaceholder')} required />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
              </div>
            </div>
            <button id="login-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : t('login.signInBtn')}
            </button>
          </form>

          <div className="auth-divider"><span>{t('login.demoCreds')}</span></div>
          <div className="demo-creds">
            {Object.entries(DEMO).map(([role]) => (
              <button key={role} className={`demo-btn demo-${role.toLowerCase()}`} onClick={() => fillDemo(role)}>
                {role === 'PATIENT' ? '👤' : role === 'DOCTOR' ? '👨‍⚕️' : '⚙️'} {role}
              </button>
            ))}
          </div>

          <p className="auth-footer-text">{t('login.noAccount')} <Link to="/register" className="auth-link">{t('login.signUp')}</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
