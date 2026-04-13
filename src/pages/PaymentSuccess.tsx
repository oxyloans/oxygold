import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiCall } from '../utils/tokenManager';
import { API_BASE_URL } from '../Config';

const WEBHOOK_API = `${API_BASE_URL}/oxygold-api/digital-gold/payments/webhook`;

const PaymentSuccess = ({ transactionData: propData }: { transactionData?: any }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false); // kept for future use
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failure' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlOrderId = urlParams.get('order_id');

    // 1. Cashfree redirect with ?order_id= — sessionStorage has the full snapshot saved just before redirect
    if (urlOrderId) {
      const stored = sessionStorage.getItem('paymentSuccessData');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Overwrite orderId/transactionId with the URL param (source of truth)
        const data = { ...parsed, orderId: urlOrderId, transactionId: urlOrderId };
        console.log('[PaymentSuccess] Restored from sessionStorage:', { grams: data.grams, goldRate: data.goldRate, total: data.total });
        setTransactionData(data);
      } else {
        // sessionStorage missing (e.g. different browser tab) — set minimal data so webhook still runs
        console.warn('[PaymentSuccess] sessionStorage empty, using URL orderId only');
        setTransactionData({ orderId: urlOrderId, transactionId: urlOrderId });
      }
      return;
    }

    // 2. Navigated via location.state (e.g. payment error path)
    const source = location.state || propData || null;
    if (source) {
      sessionStorage.setItem('paymentSuccessData', JSON.stringify(source));
      setTransactionData(source);
      return;
    }

    // 3. Page refresh — restore from sessionStorage with user validation
    const stored = sessionStorage.getItem('paymentSuccessData');
    if (stored) {
      const parsed = JSON.parse(stored);
      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.data?.userId;
      if (currentUserId && parsed.userId && parsed.userId !== currentUserId) {
        sessionStorage.removeItem('paymentSuccessData');
        navigate('/buy-gold');
        return;
      }
      setTransactionData(parsed);
    } else {
      navigate('/buy-gold');
    }
  }, [location.state, location.search, propData]);

  const txnId = transactionData?.transactionId || transactionData?.orderId || '';
  const orderId = transactionData?.orderId || transactionData?.transactionId || '';
  const processingFee = parseFloat(transactionData?.processingFee) || 0;
  const subtotal = parseFloat(transactionData?.total) || 0;
  const totalAmount = subtotal + processingFee;
  const gramsDisplay = parseFloat(transactionData?.grams) > 0
    ? parseFloat(transactionData.grams).toFixed(6)
    : transactionData?.grams || '0';
  const goldRateDisplay = parseFloat(transactionData?.goldRate) > 0
    ? parseFloat(transactionData.goldRate).toLocaleString('en-IN', { maximumFractionDigits: 2 })
    : null;

  // Debug logging
  console.log('PaymentSuccess - transactionData:', transactionData);
  console.log('PaymentSuccess - calculated values:', { txnId, gramsDisplay, totalAmount, goldRateDisplay });

  // Trigger webhook poll whenever transactionData is set
  useEffect(() => {
    if (!transactionData) return;
    const id = transactionData.orderId || transactionData.transactionId || '';
    if (id) {
      checkPaymentStatus(id);
    } else {
      const s = transactionData.status;
      setPaymentStatus(s === 'SUCCESS' || s === 'success' ? 'success' : 'failure');
      setIsLoading(false);
    }
  }, [transactionData]);

  const checkPaymentStatus = async (id: string) => {
    const MAX_ATTEMPTS = 10;
    const INTERVAL_MS = 3000;

    setIsLoading(true);
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        setPollAttempt(attempt);
        const response = await apiCall(`${WEBHOOK_API}?order_id=${id}`, { method: 'POST' }) as any;
        const status = response.status || response.data?.status || '';
        console.log(`[PaymentSuccess] Poll ${attempt} for ${id}: status=${status}`);

        if (status === 'SUCCESS') {
          setPaymentStatus('success');
          // Don't remove sessionStorage here - keep it for payment details page
          // sessionStorage.removeItem('paymentSuccessData');
          setIsLoading(false);
          return;
        }
        if (status === 'FAILED' || status === 'FAILURE' || status === 'CANCELLED') {
          setPaymentStatus('failure');
          setIsLoading(false);
          return;
        }
        if (attempt < MAX_ATTEMPTS) await new Promise(res => setTimeout(res, INTERVAL_MS));
      } catch (error) {
        console.error(`[PaymentSuccess] Poll ${attempt} error:`, error);
        if (attempt < MAX_ATTEMPTS) await new Promise(res => setTimeout(res, INTERVAL_MS));
      }
    }

    console.warn('[PaymentSuccess] Still PENDING after max attempts');
    const fallback = transactionData?.status;
    setPaymentStatus(fallback === 'SUCCESS' || fallback === 'success' ? 'success' : 'failure');
    setIsLoading(false);
  };

  // Show loading state while checking payment status
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #d9a020', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#1a1a2e', fontWeight: 600, marginBottom: 6 }}>Verifying payment...</p>
          {pollAttempt > 1 && (
            <p style={{ color: '#999', fontSize: '0.8rem' }}>Still checking... attempt {pollAttempt}/10</p>
          )}
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const isSuccess = paymentStatus === 'success';

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #f8f6fb;
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
        }

        /* ── BANNER ── */
        .banner {
          background: rgba(26, 48, 120, 0.96);
          border-bottom: 1px solid rgba(132, 128, 6, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px 56px;
        }
        .banner-in {
          max-width: 1000px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; gap: 12px;
        }
        .back-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: rgba(240,187,58,0.08); border: 1px solid rgba(240,187,58,0.28);
          border-radius: 7px; cursor: pointer;
          color: rgba(255,255,255,0.8); font-size: 0.9rem; flex-shrink: 0;
          transition: all 0.2s;
        }
        .back-btn:hover { 
          background: rgba(240,187,58,0.12); 
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
        }
        .banner-sep { width: 1px; height: 14px; background: rgba(240,187,58,0.18); flex-shrink: 0; }
        .banner-title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .banner-sub { font-size: 0.78rem; color: rgba(255,255,255,0.58); }

        /* ── MAIN ── */
        .main {
          min-height: calc(100vh - 60px);
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px;
        }

        .card {
          background: #ffffff;
          border: 1px solid #ede8f5;
          border-radius: 12px;
          padding: 32px 28px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
        }

        .icon {
          width: 56px; height: 56px;
          margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
        }
        .icon.success {
          background: #f0fdf4;
          border: 2px solid #16a34a;
        }
        .icon.failure {
          background: #fef2f2;
          border: 2px solid #dc2626;
        }
        .icon svg { width: 32px; height: 32px; }

        .title {
          font-size: 1.25rem; font-weight: 700;
          color: #1a1a2e; margin-bottom: 8px;
        }
        .title.failure { color: #dc2626; }
        .subtitle {
          font-size: 0.875rem; color: #888;
          margin-bottom: 24px;
        }

        /* Summary */
        .summary {
          background: #faf8ff;
          border: 1px solid #ede8f5;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: left;
        }
        .summary-section {
          margin-bottom: 12px;
        }
        .summary-section:last-child {
          margin-bottom: 0;
        }
        .summary-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .summary-row {
          display: flex; justify-content: space-between;
          padding: 6px 0;
          font-size: 0.875rem;
        }
        .summary-row:not(:last-child) {
          border-bottom: 1px solid #f0eaf8;
          margin-bottom: 6px;
          padding-bottom: 6px;
        }
        .summary-label { color: #888; }
        .summary-value { font-weight: 600; color: #1a1a2e; }
        .summary-value.txn-id {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          word-break: break-all;
          color: #b8860b;
        }
        .summary-value.total {
          font-size: 1rem;
          color: #b8860b;
        }

        /* Actions */
        .actions {
          display: flex; gap: 8px;
        }
        .btn {
          flex: 1; padding: 10px 14px;
          border: none; border-radius: 7px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .btn-secondary {
          background: #fff;
          color: #1a1a2e;
          border: 1px solid #ede8f5;
        }
        .btn-secondary:hover {
          border-color: #9b72cf;
          background: #faf8ff;
        }
        .btn-details {
          background: #f7f8fa;
          color: #1a3060;
          border: 1px solid #e0e4e8;
        }
        .btn-details:hover {
          border-color: #1a3060;
          background: #f0f4ff;
        }
        .btn-primary {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #1a0d05;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .btn-primary:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
        }

        @media (max-width: 640px) {
          .banner { padding: 12px 20px; }
          .card { padding: 24px 20px; }
        }
      `}</style>

      <div className="page">
        {/* ── BANNER ── */}
        <section className="banner">
          <div className="banner-in">
            <button className="back-btn" onClick={() => navigate('/portfolio')}>←</button>
            <span className="banner-sep" />
            <span className="banner-title">{isSuccess ? 'Payment Successful' : 'Payment Failed'}</span>
            <span className="banner-sep" />
            <span className="banner-sub">Transaction ID: {txnId}</span>
          </div>
        </section>

        {/* ── MAIN ── */}
        <main className="main">
          <div className="card">
            <div className={`icon ${isSuccess ? 'success' : 'failure'}`}>
              {isSuccess ? (
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="#16a34a" strokeWidth="2"/>
                  <path d="M14 24L20 30L34 16" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="23" stroke="#dc2626" strokeWidth="2"/>
                  <path d="M16 16L32 32M32 16L16 32" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            
            <h1 className={`title ${isSuccess ? '' : 'failure'}`}>
              {isSuccess ? 'Payment Successful' : 'Payment Failed'}
            </h1>
            <p className="subtitle">
              {isSuccess 
                ? `${gramsDisplay} grams added to your account`
                : 'Your payment could not be processed. Please try again.'}
            </p>

            <div className="summary">
              <div className="summary-row">
                <span className="summary-label">Transaction ID</span>
                <span className="summary-value txn-id">{txnId}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Quantity</span>
                <span className="summary-value">{gramsDisplay} grams</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value total">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="actions">
              <button className="btn btn-secondary" onClick={() => navigate('/portfolio')}>
                Portfolio
              </button>
              <button className="btn btn-details" onClick={() => navigate('/payment-details', { state: transactionData })}>
                View Payment Details
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/buy-gold')}>
                {isSuccess ? 'Buy More →' : 'Try Again →'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentSuccess;
