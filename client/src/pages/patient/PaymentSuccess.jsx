import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createOrder } from '../../features/pharmacy/pharmacySlice';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  
  const processedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('Invalid session ID');
      return;
    }
    
    if (processedRef.current) return;
    processedRef.current = true;

    const verifyAndCreateOrder = async () => {
      const res = await dispatch(createOrder({ paymentMethod: 'ONLINE', sessionId }));
      if (createOrder.fulfilled.match(res)) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(res.payload || 'Failed to complete order');
      }
    };

    verifyAndCreateOrder();
  }, [dispatch, sessionId]);

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center', padding: '2rem' }} className="card">
      <div className="card-body">
        {status === 'processing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="spinner" style={{ width: 48, height: 48, borderTopColor: 'var(--primary)' }} />
            <h2 style={{ fontWeight: 700 }}>Processing Payment...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Please do not close this window.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <FiCheckCircle size={64} color="var(--success)" />
            <h2 style={{ fontWeight: 700 }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Your order has been placed successfully.</p>
            <button className="btn btn-primary" onClick={() => navigate('/patient/orders')} style={{ marginTop: '1rem' }}>
              View Orders
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <FiXCircle size={64} color="var(--danger)" />
            <h2 style={{ fontWeight: 700 }}>Payment Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/patient/cart')}>
                Return to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
