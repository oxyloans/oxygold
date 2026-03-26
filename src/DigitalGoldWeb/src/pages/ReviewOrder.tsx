import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoldPrice } from '../context/GoldPriceContext';

const ReviewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state;
  const { buyPrice: livePrice } = useGoldPrice();
  const [timeLeft, setTimeLeft] = useState(orderData?.timeLeft ?? 300);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [priceExpired, setPriceExpired] = useState(false);

  if (!orderData) { navigate('/buy-gold'); return null; }

  useEffect(() => {
    if (timeLeft <= 0) {
      setPriceExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setPriceExpired(true);
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const safeNum = (v: any) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isUrgent = timeLeft <= 60;
  const timerPercent = (timeLeft / 300) * 100;
  const lockedGoldRate = orderData.goldRate;

  const handleConfirm = () => {
    if (priceExpired) {
      alert('Price has expired. Redirecting to fetch new price...');
      navigate('/buy-gold');
      return;
    }
    navigate('/payment-method', { state: { ...orderData, timeLeft, goldRate: lockedGoldRate, lockedTime: orderData.lockedTime } });
  };

  const handleRefreshPrice = () => {
    navigate('/buy-gold');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ro-page {
          min-height: 100vh;
          background: #f8f6fb;
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
        }

        .ro-topbar {
          background: rgba(26, 48, 120, 0.96);
          border-bottom: 1px solid rgba(132, 128, 6, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px 56px;
        }
        .ro-topbar-in {
          max-width: 1000px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; gap: 12px;
        }
        .ro-back {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: rgba(240,187,58,0.08); border: 1px solid rgba(240,187,58,0.28);
          border-radius: 7px; cursor: pointer;
          color: rgba(255,255,255,0.8); font-size: 0.9rem; flex-shrink: 0;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .ro-back:hover { 
          background: rgba(240,187,58,0.12); 
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
        }
        .ro-topbar-sep { width: 1px; height: 14px; background: rgba(240,187,58,0.18); flex-shrink: 0; }
        .ro-topbar-title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .ro-topbar-sub { font-size: 0.78rem; color: rgba(255,255,255,0.58); }

        .ro-main {
          max-width: 760px; margin: 0 auto;
          padding: 28px 48px 56px;
        }

        .ro-timer {
          border-radius: 8px; padding: 12px 16px;
          margin-bottom: 20px;
          border: 1px solid;
        }
        .ro-timer.ok { background: #ffffff; border-color: #e8e0f0; }
        .ro-timer.urgent { background: #fffbeb; border-color: rgba(217,119,6,0.28); }
        .ro-timer.expired { background: #fef2f2; border-color: rgba(220,38,38,0.28); }
        .ro-timer-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 8px;
        }
        .ro-timer-txt { font-size: 0.8rem; font-weight: 500; }
        .ro-timer-txt.ok { color: #7c3aed; }
        .ro-timer-txt.urgent { color: #d97706; }
        .ro-timer-txt.expired { color: #dc2626; }
        .ro-timer-pill {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
          padding: 2px 10px; border-radius: 20px;
        }
        .ro-timer-pill.ok { background: rgba(124,58,237,0.1); color: #7c3aed; }
        .ro-timer-pill.urgent { background: rgba(217,119,6,0.1); color: #d97706; }
        .ro-timer-pill.expired { background: rgba(220,38,38,0.1); color: #dc2626; }
        .ro-timer-bar-wrap { height: 3px; background: rgba(0,0,0,0.06); border-radius: 99px; }
        .ro-timer-bar { height: 100%; border-radius: 99px; transition: width 1s linear; }
        .ro-timer-bar.ok { background: #7c3aed; }
        .ro-timer-bar.urgent { background: #d97706; }
        .ro-timer-bar.expired { background: #dc2626; }

        .ro-card {
          background: #ffffff;
          border: 1px solid #ede8f5;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .ro-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #7c3aed, #d9a020, #f0bb3a);
          opacity: 0.5;
        }

        .ro-warn-strip {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 20px;
          background: #fffbeb;
          border-bottom: 1px solid rgba(217,119,6,0.15);
          font-size: 0.72rem; color: #d97706; line-height: 1.55;
        }

        .ro-content {
          padding: 22px 20px;
        }

        .ro-sec-title {
          font-size: 0.84rem; font-weight: 600;
          color: #1a1a2e; margin-bottom: 16px;
        }

        .ro-detail {
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0; border-bottom: 1px solid #f5f0fc;
        }
        .ro-detail:last-of-type { border-bottom: none; }
        .ro-d-lbl { font-size: 0.76rem; color: #999; font-weight: 500; }
        .ro-d-val { font-size: 0.78rem; font-weight: 600; color: #1a1a2e; }
        .ro-d-val.gold { color: #b8860b; }

        .ro-total-box {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px; margin-top: 14px;
          background: #faf8ff;
          border: 1px solid #ede8f5; border-radius: 7px;
        }
        .ro-total-lbl { font-size: 0.84rem; font-weight: 600; color: #1a1a2e; }
        .ro-total-val { font-size: 1.1rem; font-weight: 700; color: #b8860b; }

        .ro-divider { height: 1px; background: #f0eaf8; margin: 0 20px; }

        .ro-bottom {
          padding: 18px 20px 20px;
          background: #faf8ff;
          border-top: 1px solid #f0eaf8;
        }

        .ro-terms-label {
          display: flex; align-items: flex-start; gap: 8px;
          cursor: pointer; margin-bottom: 4px;
        }
        .ro-checkbox {
          width: 15px; height: 15px; margin-top: 2px;
          accent-color: #d9a020; cursor: pointer; flex-shrink: 0;
        }
        .ro-terms-txt { font-size: 0.78rem; color: #888; line-height: 1.5; }
        .ro-terms-err { font-size: 0.72rem; color: #dc2626; font-weight: 500; margin-top: 4px; }

        .ro-btn-group {
          display: flex; gap: 10px; margin-top: 14px;
        }
        .ro-btn {
          flex: 1; padding: 11px 16px;
          border: none; border-radius: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem; font-weight: 700; cursor: pointer;
          transition: box-shadow 0.18s, filter 0.18s;
          letter-spacing: 0.01em;
        }
        .ro-btn-confirm {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #1a0d05;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .ro-btn-confirm:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
        }
        .ro-btn-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ro-btn-cancel {
          background: #f5f0fc;
          color: #3d2470;
          border: 1px solid #e0d8f0;
        }
        .ro-btn-cancel:hover {
          border-color: #9b72cf;
          background: #faf8ff;
        }
        .ro-btn-refresh {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          box-shadow: 0 3px 12px rgba(124,58,237,0.22);
        }
        .ro-btn-refresh:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 18px rgba(124,58,237,0.32);
        }

        @media (max-width: 768px) {
          .ro-main { padding: 20px 24px 40px; }
          .ro-btn-group { flex-direction: column; }
        }
      `}</style>

      <div className="ro-page">

        <section className="ro-topbar">
          <div className="ro-topbar-in">
            <button className="ro-back" onClick={() => navigate(-1)}>←</button>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-title">Review Order</span>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-sub">Confirm your purchase details</span>
          </div>
        </section>

        <main className="ro-main">

          {priceExpired && (
            <div className="ro-timer expired">
              <div className="ro-timer-row">
                <span className="ro-timer-txt expired">
                  ⚠️ Price Expired
                </span>
                <span className="ro-timer-pill expired">
                  EXPIRED
                </span>
              </div>
              <div className="ro-timer-bar-wrap">
                <div className="ro-timer-bar expired" style={{ width: `${timerPercent}%` }} />
              </div>
            </div>
          )}

          {!priceExpired && isUrgent && (
            <div className="ro-timer urgent">
              <div className="ro-timer-row">
                <span className="ro-timer-txt urgent">
                  ⏰ Hurry! Price expires soon
                </span>
                <span className="ro-timer-pill urgent">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="ro-timer-bar-wrap">
                <div className="ro-timer-bar urgent" style={{ width: `${timerPercent}%` }} />
              </div>
            </div>
          )}

          <div className="ro-card">

            <div className="ro-warn-strip">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M8 1L1 15H15L8 1Z" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6V9M8 11V11.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>
                {priceExpired ? 'Price has expired. Please fetch a new price to continue.' : `Price locked for ${formatTime(timeLeft)} · Transaction cannot be cancelled once confirmed`}
              </span>
            </div>

            <div className="ro-content">
              <div className="ro-sec-title">Order Details</div>

              <div className="ro-detail">
                <span className="ro-d-lbl">Gold Rate (Locked)</span>
                <span className="ro-d-val gold">₹{lockedGoldRate?.toFixed(2)} / gram</span>
              </div>
              <div className="ro-detail">
                <span className="ro-d-lbl">Quantity</span>
                <span className="ro-d-val">{safeNum(orderData.grams).toFixed(6)} grams</span>
              </div>
              <div className="ro-detail">
                <span className="ro-d-lbl">Gold Value</span>
                <span className="ro-d-val">₹{safeNum(orderData.rupees).toFixed(2)}</span>
              </div>
              <div className="ro-detail">
                <span className="ro-d-lbl">GST (3%)</span>
                <span className="ro-d-val">₹{safeNum(orderData.gst).toFixed(2)}</span>
              </div>

              <div className="ro-total-box">
                <span className="ro-total-lbl">Total Amount</span>
                <span className="ro-total-val">₹{safeNum(orderData.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="ro-divider" />

            <div className="ro-bottom">
              <div className="ro-btn-group">
                {priceExpired ? (
                  <>
                    <button className="ro-btn ro-btn-cancel" onClick={() => navigate('/buy-gold')}>Go Back</button>
                    <button className="ro-btn ro-btn-refresh" onClick={handleRefreshPrice}>Fetch New Price</button>
                  </>
                ) : (
                  <>
                    <button className="ro-btn ro-btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                    <button className="ro-btn ro-btn-confirm" onClick={handleConfirm} disabled={priceExpired}>Confirm & Pay</button>
                  </>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default ReviewOrder;
