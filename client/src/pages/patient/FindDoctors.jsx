import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchDoctors, fetchSpecialties } from '../../features/doctors/doctorsSlice';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiFilter, FiStar, FiMapPin, FiClock, FiX } from 'react-icons/fi';
import './FindDoctors.css';

export default function FindDoctors() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { list: doctors, specialties, pagination, loading } = useSelector(s => s.doctors);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ specialty: '', maxFee: '', minRating: '', available: false });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { dispatch(fetchSpecialties()); }, [dispatch]);
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(fetchDoctors({ search, ...filters, available: filters.available || undefined, page, limit: 9 }));
    }, 350);
    return () => clearTimeout(t);
  }, [search, filters, page, dispatch]);

  const clearFilters = () => { setFilters({ specialty: '', maxFee: '', minRating: '', available: false }); setSearch(''); };

  return (
    <div className="find-doctors">
      <div className="page-header">
        <h1>{t('patient.findDoctors.title')}</h1>
        <p>{t('patient.findDoctors.subtitle')}</p>
      </div>

      {/* Search Bar */}
      <div className="search-bar-row">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input id="doctor-search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={t('patient.findDoctors.searchPlaceholder')} className="search-input" />
          {search && <button className="search-clear" onClick={() => setSearch('')}><FiX size={14}/></button>}
        </div>
        <button className="btn btn-secondary" onClick={() => setShowFilters(s => !s)}>
          <FiFilter size={16} /> {t('patient.findDoctors.filters')}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div className="filters-panel" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">{t('patient.findDoctors.specialtyLabel')}</label>
              <select className="form-input" value={filters.specialty} onChange={e => { setFilters(f => ({ ...f, specialty: e.target.value })); setPage(1); }}>
                <option value="">{t('patient.findDoctors.allSpecialties')}</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('patient.findDoctors.maxFee')}</label>
              <input type="number" className="form-input" value={filters.maxFee} onChange={e => { setFilters(f => ({ ...f, maxFee: e.target.value })); setPage(1); }} placeholder="e.g. 1000" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('patient.findDoctors.minRating')}</label>
              <select className="form-input" value={filters.minRating} onChange={e => { setFilters(f => ({ ...f, minRating: e.target.value })); setPage(1); }}>
                <option value="">{t('patient.findDoctors.anyRating')}</option>
                <option value="4">{t('patient.findDoctors.stars4')}</option>
                <option value="4.5">{t('patient.findDoctors.stars45')}</option>
              </select>
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              <label className="form-label">{t('patient.findDoctors.availableOnly')}</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={filters.available} onChange={e => { setFilters(f => ({ ...f, available: e.target.checked })); setPage(1); }} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}><FiX size={14}/> {t('patient.findDoctors.clearAll')}</button>
        </motion.div>
      )}

      {/* Specialties Quick Filter */}
      <div className="specialty-pills">
        <button className={`pill ${!filters.specialty ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, specialty: '' }))}>{t('patient.findDoctors.all')}</button>
        {specialties.slice(0, 8).map(s => (
          <button key={s} className={`pill ${filters.specialty === s ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, specialty: s })); setPage(1); }}>{s}</button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="doctors-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="doctor-card-skeleton"><div className="skeleton skeleton-card" /></div>)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state"><div className="icon">👨‍⚕️</div><h3>{t('patient.findDoctors.noDoctorsFound')}</h3><p>{t('patient.findDoctors.adjustSearch')}</p></div>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doc, i) => (
            <motion.div key={doc.id} className="doctor-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}>
              <div className="doctor-card-top">
                <img src={doc.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user?.name||'D')}&background=0D7377&color=fff&size=100`} alt={doc.user?.name} className="doctor-avatar" />
                <div className="doctor-avail-dot" style={{ background: doc.isAvailable ? 'var(--success)' : '#ccc' }} />
              </div>
              <div className="doctor-card-body">
                <h3>{doc.user?.name}</h3>
                <p className="doc-specialty">{doc.specialty}</p>
                <p className="doc-qualification">{doc.qualification}</p>
                {doc.hospitalName && <p className="doc-hospital"><FiMapPin size={12}/> {doc.hospitalName}</p>}
                <div className="doc-meta">
                  <span className="doc-rating"><FiStar size={12} style={{ color: '#F59E0B' }}/> {doc.rating} ({doc.totalReviews})</span>
                  <span className="doc-exp"><FiClock size={12}/> {doc.experience}{t('patient.findDoctors.exp')}</span>
                </div>
                <div className="doc-fee">
                  {doc.consultationFee === 0 ? <span className="fee-free">{t('patient.findDoctors.free')}</span> : <span className="fee-amount">₹{doc.consultationFee}</span>}
                </div>
                <div className="doctor-card-actions">
                  <Link to={`/patient/doctors/${doc.id}`} className="btn btn-secondary btn-sm w-full">{t('patient.findDoctors.viewProfile')}</Link>
                  <Link to={`/patient/book-appointment?doctorId=${doc.id}`} className="btn btn-primary btn-sm w-full">{t('patient.findDoctors.bookNow')}</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('patient.findDoctors.prev')}</button>
          <span className="page-info">{t('patient.findDoctors.pageInfo').replace('{{page}}', page).replace('{{pages}}', pagination.pages)}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>{t('patient.findDoctors.next')}</button>
        </div>
      )}
    </div>
  );
}
