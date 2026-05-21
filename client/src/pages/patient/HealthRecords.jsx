import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { FiUpload, FiDownload, FiTrash2, FiFileText, FiPlus } from 'react-icons/fi';

const TYPES = ['Lab Report', 'Prescription', 'X-Ray', 'MRI/CT Scan', 'Vaccination', 'Other'];

export default function HealthRecords() {
  const { t } = useTranslation();
  const { user } = useSelector(s => s.auth);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Lab Report', description: '', doctorName: '', date: '', fileUrl: '', fileName: '' });

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    try { const r = await api.get('/health-records'); setRecords(r.data.records || []); }
    catch { toast.error(t('patient.healthRecords.loadFail')); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/health-records', form);
      toast.success(t('patient.healthRecords.addSuccess'));
      setShowModal(false);
      setForm({ title: '', type: 'Lab Report', description: '', doctorName: '', date: '', fileUrl: '', fileName: '' });
      loadRecords();
    } catch { toast.error(t('patient.healthRecords.addFail')); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('patient.healthRecords.delConfirm'))) return;
    await api.delete(`/health-records/${id}`);
    toast.success(t('patient.healthRecords.delSuccess'));
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const TYPE_ICONS = { 'Lab Report': '🧪', 'Prescription': '💊', 'X-Ray': '🦴', 'MRI/CT Scan': '🔬', 'Vaccination': '💉', 'Other': '📋' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>📋 {t('patient.healthRecords.title')}</h1><p style={{ color: 'var(--text-secondary)' }}>{t('patient.healthRecords.subtitle')}</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> {t('patient.healthRecords.addRecord')}</button>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : records.length === 0 ? (
        <div className="empty-state"><div className="icon">📋</div><h3>{t('patient.healthRecords.emptyRecords')}</h3><p>{t('patient.healthRecords.emptyRecordsDesc')}</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {records.map((rec, i) => (
            <motion.div key={rec.id} className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{TYPE_ICONS[rec.type] || '📋'}</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {rec.fileUrl && <button className="btn btn-ghost btn-icon" title="Download" onClick={() => window.open(rec.fileUrl)}><FiDownload size={15} /></button>}
                    <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(rec.id)}><FiTrash2 size={15} /></button>
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.9375rem' }}>{rec.title}</h3>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginBottom: '0.625rem' }}>{rec.type}</span>
                {rec.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec.description}</p>}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {rec.doctorName && <span>👨‍⚕️ {rec.doctorName}</span>}
                  <span>📅 {new Date(rec.date).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header"><h3>{t('patient.healthRecords.modalTitle')}</h3><button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">✕</button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{t('patient.healthRecords.modalTitleInput')}</label><input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('patient.healthRecords.titlePlaceholder')} required /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{t('patient.healthRecords.type')}</label><select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{TYPES.map(typeVal => <option key={typeVal}>{typeVal}</option>)}</select></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{t('patient.healthRecords.docName')}</label><input className="form-input" value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} placeholder={t('patient.healthRecords.docPlaceholder')} /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{t('patient.healthRecords.date')}</label><input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{t('patient.healthRecords.description')}</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t('patient.healthRecords.descPlaceholder')} style={{ resize: 'none' }} /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{t('patient.healthRecords.fileUrl')}</label><input className="form-input" value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('patient.healthRecords.cancel')}</button><button type="submit" className="btn btn-primary">{t('patient.healthRecords.addRecord')}</button></div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
