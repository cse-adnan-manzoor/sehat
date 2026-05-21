import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { getProfile } from '../../features/auth/authSlice';
import { FiEdit2, FiSave } from 'react-icons/fi';

const SPECIALTIES = ['General Medicine','Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Gynecology','Psychiatry','ENT','Ophthalmology','Pulmonology','Gastroenterology'];
const LANGUAGES = ['English','Hindi','Bengali','Telugu','Tamil','Gujarati','Punjabi','Marathi','Malayalam','Kannada','Urdu'];

export default function DoctorProfile() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', specialty: '', qualification: '', experience: '', consultationFee: '', bio: '', languages: [], hospitalName: '', hospitalAddress: '', isAvailable: true });

  useEffect(() => {
    api.get('/auth/me').then(r => {
      const u = r.data.user;
      const dp = u?.doctorProfile;
      setForm({ name: u?.name || '', phone: u?.phone || '', specialty: dp?.specialty || '', qualification: dp?.qualification || '', experience: dp?.experience || '', consultationFee: dp?.consultationFee || '', bio: dp?.bio || '', languages: dp?.languages || ['English'], hospitalName: dp?.hospitalName || '', hospitalAddress: dp?.hospitalAddress || '', isAvailable: dp?.isAvailable ?? true });
    });
  }, []);

  const toggleLanguage = (lang) => setForm(f => ({ ...f, languages: f.languages.includes(lang) ? f.languages.filter(l => l !== lang) : [...f.languages, lang] }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', { name: form.name, phone: form.phone });
      await api.put('/doctors/profile', { specialty: form.specialty, qualification: form.qualification, experience: parseInt(form.experience) || 0, consultationFee: parseFloat(form.consultationFee) || 0, bio: form.bio, languages: form.languages, hospitalName: form.hospitalName, hospitalAddress: form.hospitalAddress, isAvailable: form.isAvailable });
      dispatch(getProfile());
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header"><h1>👨‍⚕️ Doctor Profile</h1><p>Manage your professional information</p></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Card */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'D')}&background=0D7377&color=fff&size=200`} alt="" style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--primary-50)' }} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</p>
              <span className="badge" style={{ background: 'var(--primary-50)', color: 'var(--primary)', marginTop: '0.375rem' }}>👨‍⚕️ Verified Doctor</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(e => !e)}>{editing ? '✕ Cancel' : <><FiEdit2 size={14}/> Edit</>}</button>
          </div>
        </motion.div>

        {/* Professional Info */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Professional Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Full Name', field: 'name', type: 'text' },
                { label: 'Phone', field: 'phone', type: 'tel' },
                { label: 'Specialty', field: 'specialty', type: 'select', options: SPECIALTIES },
                { label: 'Qualification', field: 'qualification', type: 'text' },
                { label: 'Experience (years)', field: 'experience', type: 'number' },
                { label: 'Consultation Fee (₹)', field: 'consultationFee', type: 'number' },
                { label: 'Hospital Name', field: 'hospitalName', type: 'text' },
                { label: 'Hospital Address', field: 'hospitalAddress', type: 'text' },
              ].map(({ label, field, type, options }) => (
                <div key={field} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{label}</label>
                  {!editing ? (
                    <div style={{ padding: '0.75rem 0', fontSize: '0.9375rem', color: form[field] ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>{form[field] || '—'}</div>
                  ) : type === 'select' ? (
                    <select className="form-input" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>{options.map(o => <option key={o}>{o}</option>)}</select>
                  ) : (
                    <input type={type} className="form-input" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem', gridColumn: '1 / -1' }}>
              <label className="form-label">Bio</label>
              {!editing ? <div style={{ padding: '0.75rem 0', color: form.bio ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: '1px solid var(--border-light)', fontSize: '0.9375rem' }}>{form.bio || '—'}</div> : <textarea className="form-input" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell patients about yourself..." style={{ resize: 'vertical' }} />}
            </div>
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Languages Spoken</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => editing && toggleLanguage(lang)} style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', border: `2px solid ${form.languages.includes(lang) ? 'var(--primary)' : 'var(--border)'}`, background: form.languages.includes(lang) ? 'var(--primary-50)' : 'var(--bg)', color: form.languages.includes(lang) ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: form.languages.includes(lang) ? 600 : 400, cursor: editing ? 'pointer' : 'default' }}>{lang}</button>
              ))}
            </div>
          </div>
        </motion.div>

        {editing && (
          <button className="btn btn-primary btn-lg w-full" onClick={handleSave} disabled={loading}>{loading ? <span className="btn-spinner" /> : <><FiSave /> Save Changes</>}</button>
        )}
      </div>
    </div>
  );
}
