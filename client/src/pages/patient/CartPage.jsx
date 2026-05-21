import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchCart, updateCartItem, removeFromCart, createOrder, createStripeSession } from '../../features/pharmacy/pharmacySlice';
import { useTranslation } from 'react-i18next';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector(s => s.pharmacy);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const total = cart?.items?.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0) || 0;
  const savings = cart?.items?.reduce((sum, item) => sum + (item.medicine.mrp - item.medicine.price) * item.quantity, 0) || 0;

  const handleUpdateQty = (itemId, qty) => dispatch(updateCartItem({ itemId, quantity: qty }));
  const handleRemove = async (itemId) => {
    const res = await dispatch(removeFromCart(itemId));
    if (removeFromCart.fulfilled.match(res)) toast.success(t('patient.cart.itemRemoved'));
  };

  const handleCheckout = async () => {
    if (!address.trim()) { toast.error(t('patient.cart.enterAddress')); return; }
    
    if (paymentMethod === 'ONLINE') {
      setCheckingOut(true);
      const sessionRes = await dispatch(createStripeSession({ shippingAddress: address }));
      if (createStripeSession.rejected.match(sessionRes)) {
        toast.error(sessionRes.payload || 'Failed to initialize Stripe payment');
        setCheckingOut(false);
        return;
      }
      
      // Redirect to Stripe Checkout
      if (sessionRes.payload?.url) {
        window.location.href = sessionRes.payload.url;
      } else {
        toast.error('Could not get Stripe checkout URL');
        setCheckingOut(false);
      }
    } else {
      setCheckingOut(true);
      const res = await dispatch(createOrder({ shippingAddress: address, paymentMethod: 'COD' }));
      if (createOrder.fulfilled.match(res)) { toast.success(t('patient.cart.orderSuccess')); navigate('/patient/orders'); }
      else toast.error(t('patient.cart.orderFail'));
      setCheckingOut(false);
    }
  };

  if (loading && !cart) return <div className="loading-screen"><div className="spinner" /></div>;

  const items = cart?.items || [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header"><h1>🛒 {t('patient.cart.title')}</h1><p>{items.length} {t('patient.cart.itemsInCart')}</p></div>
      {items.length === 0 ? (
        <div className="empty-state"><div className="icon">🛒</div><h3>{t('patient.cart.emptyCart')}</h3><p>{t('patient.cart.emptyCartDesc')}</p><button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/patient/pharmacy')}>{t('patient.cart.goPharmacy')}</button></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item, i) => (
              <motion.div key={item.id} className="card" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>💊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{item.medicine.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.medicine.dosageForm} · {item.medicine.strength}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{item.medicine.price}</span>
                      {item.medicine.discount > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{item.medicine.mrp}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleUpdateQty(item.id, item.quantity - 1)}><FiMinus size={14}/></button>
                    <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleUpdateQty(item.id, item.quantity + 1)}><FiPlus size={14}/></button>
                  </div>
                  <div style={{ fontWeight: 700, minWidth: 60, textAlign: 'right' }}>₹{(item.medicine.price * item.quantity).toFixed(2)}</div>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleRemove(item.id)}><FiTrash2 size={16}/></button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontWeight: 700 }}>{t('patient.cart.orderSummary')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>{t('patient.cart.subtotal')}</span><span>₹{total.toFixed(2)}</span></div>
                {savings > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--success)' }}>{t('patient.cart.youSave')}</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>-₹{savings.toFixed(2)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>{t('patient.cart.delivery')}</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>{t('patient.cart.free')}</span></div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}><span>{t('patient.cart.total')}</span><span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span></div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">{t('patient.cart.deliveryAddress')}</label>
                <textarea className="form-input" rows={3} value={address} onChange={e => setAddress(e.target.value)} placeholder={t('patient.cart.addressPlaceholder')} style={{ resize: 'none' }} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: `1px solid ${paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: paymentMethod === 'COD' ? 'var(--primary-50)' : 'transparent' }}>
                    <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ accentColor: 'var(--primary)' }} />
                    <span style={{ fontWeight: 500 }}>Cash on Delivery (COD)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: `1px solid ${paymentMethod === 'ONLINE' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: paymentMethod === 'ONLINE' ? 'var(--primary-50)' : 'transparent' }}>
                    <input type="radio" name="paymentMethod" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={(e) => setPaymentMethod(e.target.value)} style={{ accentColor: 'var(--primary)' }} />
                    <span style={{ fontWeight: 500 }}>Pay Online (Card/UPI)</span>
                  </label>
                </div>
              </div>
              <button className="btn btn-primary w-full btn-lg" onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? <span className="btn-spinner" /> : <><FiShoppingBag /> {t('patient.cart.placeOrder')} (₹{total.toFixed(2)})</>}
              </button>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>🔒 {t('patient.cart.secureInfo')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
