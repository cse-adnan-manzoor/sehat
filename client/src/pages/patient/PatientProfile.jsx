import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { getProfile } from '../../features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { FiUser, FiPhone, FiMail, FiEdit2, FiSave } from 'react-icons/fi';

export default function PatientProfile() {
  const { t } = useTranslation();
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', gender: '', bloodGroup: '', dateOfBirth: '', height: '', weight: '', allergies: '', chronicConditions: '', emergencyContact: '', address: '' });

  useEffect(() => {
    api.get('/patient/profile').then(r => {
      const p = r.data.profile;
      setProfile(p);
      setForm({
        name: p?.user?.name || '',
        phone: p?.user?.phone || '',
        gender: p?.gender || '',
        bloodGroup: p?.bloodGroup || '',
        dateOfBirth: p?.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        height: p?.height || '',
        weight: p?.weight || '',
        allergies: (p?.allergies || []).join(', '),
        chronicConditions: (p?.chronicConditions || []).join(', '),
        emergencyContact: p?.emergencyContact || '',
        address: p?.address || '',
      });
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', { name: form.name, phone: form.phone });
      await api.put('/patient/profile', {
        gender: form.gender, bloodGroup: form.bloodGroup,
        dateOfBirth: form.dateOfBirth || undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()) : [],
        chronicConditions: form.chronicConditions ? form.chronicConditions.split(',').map(s => s.trim()) : [],
        emergencyContact: form.emergencyContact, address: form.address,
      });
      dispatch(getProfile());
      toast.success(t('patient.profile.successMsg'));
      setEditing(false);
    } catch { toast.error(t('patient.profile.failMsg')); }
    finally { setLoading(false); }
  };

  const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header"><h1>👤 {t('patient.profile.title')}</h1><p>{t('patient.profile.subtitle')}</p></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Avatar card */}
        <motion.div className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=0D7377&color=fff&size=200`} alt={user?.name} style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--primary-50)' }} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</p>
              <span className="badge badge-primary" style={{ marginTop: '0.375rem' }}>Patient</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(e => !e)}>
              {editing ? `✕ ${t('patient.profile.cancel')}` : <><FiEdit2 size={14}/> {t('patient.profile.editProfile')}</>}
            </button>
          </div>
        </motion.div>

        {/* Personal Info */}
        <motion.div className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{t('patient.profile.personalInfo')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: t('patient.profile.fullName'), field: 'name', type: 'text', icon: FiUser },
                { label: t('patient.profile.phone'), field: 'phone', type: 'tel', icon: FiPhone },
                { label: t('patient.profile.dob'), field: 'dateOfBirth', type: 'date' },
                { label: t('patient.profile.gender'), field: 'gender', type: 'select', options: ['Male','Female','Other','Prefer not to say'] },
                { label: t('patient.profile.bloodGroup'), field: 'bloodGroup', type: 'select', options: BLOOD_GROUPS },
                { label: t('patient.profile.height'), field: 'height', type: 'number' },
                { label: t('patient.profile.weight'), field: 'weight', type: 'number' },
                { label: t('patient.profile.emergencyContact'), field: 'emergencyContact', type: 'tel' },
              ].map(({ label, field, type, options }) => (
                <div className="form-group" key={field} style={{ marginBottom: 0 }}>
                  <label className="form-label">{label}</label>
                  {!editing ? (
                    <div style={{ padding: '0.75rem 0', fontSize: '0.9375rem', color: form[field] ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>{form[field] || '—'}</div>
                  ) : type === 'select' ? (
                    <select className="form-input" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>
                      <option value="">{t('patient.profile.selectMsg')}</option>
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type} className="form-input" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Medical Info */}
        <motion.div className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card-body">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{t('patient.profile.medicalInfo')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: t('patient.profile.allergies'), field: 'allergies', placeholder: t('patient.profile.allergiesPlaceholder') },
                { label: t('patient.profile.chronicConditions'), field: 'chronicConditions', placeholder: t('patient.profile.chronicPlaceholder') },
                { label: t('patient.profile.address'), field: 'address', placeholder: t('patient.profile.addressPlaceholder') },
              ].map(({ label, field, placeholder }) => (
                <div className="form-group" key={field} style={{ marginBottom: 0 }}>
                  <label className="form-label">{label}</label>
                  {!editing ? (
                    <div style={{ padding: '0.75rem 0', fontSize: '0.9375rem', color: form[field] ? 'var(--text-primary)' : 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>{form[field] || '—'}</div>
                  ) : (
                    <input type="text" className="form-input" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {editing && (
          <motion.button className="btn btn-primary btn-lg w-full" onClick={handleSave} disabled={loading} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loading ? <span className="btn-spinner" /> : <><FiSave /> {t('patient.profile.saveChanges')}</>}
          </motion.button>
        )}
      </div>
    </div>
  );
}
