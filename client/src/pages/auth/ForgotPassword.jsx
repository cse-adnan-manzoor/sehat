import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { FiMail, FiArrowLeft, FiLock } from 'react-icons/fi';
import './Auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch { toast.error('Email not found'); }
    finally { setLoading(false); }
  };

  const handleReset = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully!');
      setStep(3);
    } catch { toast.error('Invalid or expired OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">🔐</div>
          <h1>Sehat</h1>
          <p>Reset your password securely</p>
        </div>
      </div>
      <motion.div className="auth-right" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="auth-card">
          <Link to="/login" className="back-link"><FiArrowLeft /> Back to Login</Link>
          {step === 1 && (
            <>
              <div className="auth-header"><h2>Forgot Password?</h2><p>Enter your email to receive an OTP</p></div>
              <form className="auth-form" onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="form-input-icon">
                    <FiMail className="icon" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="Enter your email" required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>{loading ? <span className="btn-spinner" /> : 'Send OTP'}</button>
              </form>
            </>
          )}
          {step === 2 && (
            <>
              <div className="auth-header"><h2>Enter OTP</h2><p>Check your email for the 6-digit code</p></div>
              <form className="auth-form" onSubmit={handleReset}>
                <div className="form-group">
                  <label className="form-label">OTP Code</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="form-input" placeholder="Enter 6-digit OTP" maxLength={6} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="form-input-icon">
                    <FiLock className="icon" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-input" placeholder="Enter new password" required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>{loading ? <span className="btn-spinner" /> : 'Reset Password'}</button>
              </form>
            </>
          )}
          {step === 3 && (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Password Reset!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your password has been reset successfully.</p>
              <Link to="/login" className="btn btn-primary w-full">Go to Login</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
