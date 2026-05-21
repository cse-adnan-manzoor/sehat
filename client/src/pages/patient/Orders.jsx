import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchOrders } from '../../features/pharmacy/pharmacySlice';
import { useTranslation } from 'react-i18next';
import { FiPackage, FiTruck, FiCheck } from 'react-icons/fi';

const STATUS_ICONS = { PLACED: '📦', CONFIRMED: '✅', SHIPPED: '🚚', DELIVERED: '🎉', CANCELLED: '❌' };
const STATUS_COLORS = { PLACED: 'primary', CONFIRMED: 'success', SHIPPED: 'info', DELIVERED: 'success', CANCELLED: 'danger' };

export default function Orders() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(s => s.pharmacy);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header"><h1>📦 {t('patient.orders.title')}</h1><p>{t('patient.orders.subtitle')}</p></div>
      {orders.length === 0 ? (
        <div className="empty-state"><div className="icon">📦</div><h3>{t('patient.orders.emptyOrders')}</h3><p>{t('patient.orders.emptyOrdersDesc')}</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order, i) => (
            <motion.div key={order.id} className="card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{t('patient.orders.orderId')}{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <span className={`badge badge-${STATUS_COLORS[order.status]}`}>{STATUS_ICONS[order.status]} {order.status}</span>
                </div>

                {/* Progress bar */}
                {order.status !== 'CANCELLED' && (
                  <div style={{ display: 'flex', gap: 0, marginBottom: '1rem' }}>
                    {['PLACED','CONFIRMED','SHIPPED','DELIVERED'].map((s, idx) => {
                      const statuses = ['PLACED','CONFIRMED','SHIPPED','DELIVERED'];
                      const currentIdx = statuses.indexOf(order.status);
                      const done = idx <= currentIdx;
                      return (
                        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                          <div style={{ width: '100%', height: 3, background: done ? 'var(--primary)' : 'var(--border)', borderRadius: 2 }} />
                          <span style={{ fontSize: '0.6rem', color: done ? 'var(--primary)' : 'var(--text-muted)', fontWeight: done ? 600 : 400 }}>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.875rem' }}>
                  {order.items?.map((item, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span>{item.medicine?.name} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{order.shippingAddress && `📍 ${order.shippingAddress.slice(0, 40)}...`}</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
