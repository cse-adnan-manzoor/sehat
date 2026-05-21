import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchMedicines, addToCart, fetchCart } from '../../features/pharmacy/pharmacySlice';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiShoppingCart, FiPlus, FiX } from 'react-icons/fi';

export default function Pharmacy() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { medicines, loading, cart } = useSelector(s => s.pharmacy);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchMedicines({}));
    dispatch(fetchCart());
    import('../../api/axios').then(({ default: api }) => {
      api.get('/medicines/categories').then(r => setCategories(r.data.categories || []));
    });
  }, [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchMedicines({ search, category })), 350);
    return () => clearTimeout(t);
  }, [search, category, dispatch]);

  const handleAddToCart = async (medicineId, name) => {
    const res = await dispatch(addToCart({ medicineId, quantity: 1 }));
    if (addToCart.fulfilled.match(res)) toast.success(`${name} ${t('patient.pharmacy.addedToCart')}`);
    else toast.error(t('patient.pharmacy.failAddToCart'));
  };

  const cartCount = cart?.items?.length || 0;
  const isInCart = (id) => cart?.items?.some(item => item.medicineId === id);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>💊 {t('patient.pharmacy.title')}</h1><p style={{ color: 'var(--text-secondary)' }}>{t('patient.pharmacy.subtitle')}</p></div>
        <Link to="/patient/cart" className="btn btn-primary">
          <FiShoppingCart /> {t('patient.pharmacy.cart')} {cartCount > 0 && <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '9999px', padding: '0 6px', fontSize: '0.75rem', marginLeft: '0.25rem' }}>{cartCount}</span>}
        </Link>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 1rem' }}>
          <FiSearch style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('patient.pharmacy.searchPlaceholder')} style={{ flex: 1, padding: '0.75rem 0', background: 'none', fontSize: '0.9rem', color: 'var(--text-primary)' }} />
          {search && <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}><FiX size={14}/></button>}
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 160 }}>
          <option value="">{t('patient.pharmacy.allCategories')}</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
        <button className={`pill ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>{t('patient.pharmacy.all')}</button>
        {categories.map(c => <button key={c} className={`pill ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>)}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {medicines.map((med, i) => (
            <motion.div key={med.id} className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -4 }}>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{med.category}</span>
                  {med.requiresPrescription && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Rx</span>}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{med.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.genericName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{med.dosageForm} · {med.strength}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{med.manufacturer}</p>
                </div>
                {med.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{med.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--primary)' }}>₹{med.price}</span>
                    {med.discount > 0 && <><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.375rem' }}>₹{med.mrp}</span><span style={{ fontSize: '0.7rem', color: 'var(--success)', marginLeft: '0.25rem', fontWeight: 600 }}>{med.discount}% {t('patient.pharmacy.off')}</span></>}
                  </div>
                </div>
                <button className={`btn btn-sm w-full ${isInCart(med.id) ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleAddToCart(med.id, med.name)} style={{ marginTop: '0.25rem' }}>
                  {isInCart(med.id) ? <><FiShoppingCart size={13}/> {t('patient.pharmacy.inCart')}</> : <><FiPlus size={13}/> {t('patient.pharmacy.addToCart')}</>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
