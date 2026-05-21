import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerUser } from '../../features/auth/authSlice';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: searchParams.get('role') || 'PATIENT', specialty: '', qualification: '' });
  const [showPass, setShowPass] = useState(false);
  const { loading } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const res = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(res)) {
      toast.success('Account created successfully!');
      const role = res.payload.user.role;
      navigate(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
    } else {
      toast.error(res.payload || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">🏥</div>
          <h1>Join Sehat</h1>
          <p>Your Health, Our Priority</p>
        </div>
        <div className="auth-features">
          {['Free to sign up, no hidden fees','Verified doctors only','Secure & private health data','Cancel appointments anytime'].map((f, i) => (
            <div key={i} className="auth-feature"><span className="auth-check">✓</span>{f}</div>
          ))}
        </div>
      </div>

      <motion.div className="auth-right" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join thousands of patients and doctors on Sehat</p>
          </div>

          <div className="role-selector">
            {[{ value: 'PATIENT', icon: '👤', label: 'Patient' }, { value: 'DOCTOR', icon: '👨‍⚕️', label: 'Doctor' }].map(r => (
              <div key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, role: r.value }))}>
                <span className="role-icon">{r.icon}</span>
                <span className="role-name">{r.label}</span>
              </div>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-icon">
                <FiUser className="icon" />
                <input name="name" type="text" value={form.name} onChange={handleChange} className="form-input" placeholder="Enter your full name" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <FiMail className="icon" />
                <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="Enter your email" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="form-input-icon">
                <FiPhone className="icon" />
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="form-input" placeholder="+91 98765 43210" />
              </div>
            </div>
            {form.role === 'DOCTOR' && (
              <>
                <div className="form-group">
                  <label className="form-label">Specialty</label>
                  <select name="specialty" value={form.specialty} onChange={handleChange} className="form-input" required>
                    <option value="">Select specialty</option>
                    {['General Medicine','Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Gynecology','Psychiatry','ENT','Ophthalmology'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input name="qualification" type="text" value={form.qualification} onChange={handleChange} className="form-input" placeholder="MBBS, MD..." required />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon">
                <FiLock className="icon" />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} className="form-input" placeholder="Min 6 characters" required />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>{showPass ? <FiEyeOff /> : <FiEye />}</button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </button>
          </form>
          <p className="auth-footer-text">Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
