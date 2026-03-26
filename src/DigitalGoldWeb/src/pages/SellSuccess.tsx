import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/userUtils';

const SellSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sellData = location.state;
  
  if (!sellData) {
    navigate('/sell-gold');
    return null;
  }
  
  const { transactionId, amount, grams, sellRate, paymentStatus, pergramSellingPrice } = sellData;
  const finalSellRate = pergramSellingPrice || sellRate;
  const isPaymentFailed = paymentStatus === 'FAILED' || paymentStatus === 'UNKNOWN';
  const timestamp = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  }).replace(' at ', ', ');

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page { min-height: 100vh; background: #f7f8fa; font-family: 'Sora', sans-serif; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; padding: 24px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .icon { width: 48px; height: 48px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .icon.success { background: #f0fdf4; border: 2px solid #16a34a; }
        .icon.failed { background: #fef2f2; border: 2px solid #dc2626; }
        .title { font-size: 1.1rem; font-weight: 600; color: #1c2b3a; margin-bottom: 16px; }
        .summary { background: #fafbfc; border: 1px solid #e8ecf0; border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: left; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.8rem; }
        .row:not(:last-child) { border-bottom: 1px solid #f0f2f5; margin-bottom: 6px; }
        .label { color: #9eaab8; }
        .value { font-weight: 600; color: #1c2b3a; }
        .value.failed { color: #dc2626; }
        .value.success { color: #16a34a; }
        .actions { display: flex; gap: 10px; }
        .btn { flex: 1; padding: 10px 16px; border: none; border-radius: 7px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-secondary { background: #fff; color: #1c2b3a; border: 1px solid #e0e4e8; }
        .btn-secondary:hover { border-color: #d9a020; background: #fffcf0; }
        .btn-primary { background: linear-gradient(135deg, #f0bb3a, #d9a020); color: #0d1f3c; box-shadow: 0 3px 12px rgba(217,160,32,0.22); }
        .btn-primary:hover { box-shadow: 0 6px 18px rgba(217,160,32,0.32); transform: translateY(-1px); }
      `}</style>

      <div className="page">
        <div className="card">
          <div className={`icon ${isPaymentFailed ? 'failed' : 'success'}`}>
            {isPaymentFailed ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          
          <h1 className="title">
            {isPaymentFailed ? 'Payment Failed' : 'Gold Sold Successfully'}
          </h1>

          <div className="summary">
            <div className="row">
              <span className="label">Amount</span>
              <span className="value">₹{parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="row">
              <span className="label">Gold Sold</span>
              <span className="value">{parseFloat(grams).toFixed(3)} grams</span>
            </div>
            <div className="row">
              <span className="label">Sell Rate</span>
              <span className="value">₹{parseFloat(finalSellRate).toFixed(2)} / gram</span>
            </div>
            <div className="row">
              <span className="label">Transaction ID</span>
              <span className="value">{transactionId}</span>
            </div>
            <div className="row">
              <span className="label">Status</span>
              <span className={`value ${isPaymentFailed ? 'failed' : 'success'}`}>
                {isPaymentFailed ? 'FAILED' : 'SUCCESS'}
              </span>
            </div>
            <div className="row">
              <span className="label">Date & Time</span>
              <span className="value">{timestamp}</span>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-secondary" onClick={() => navigate('/portfolio')}>View Portfolio</button>
            <button className="btn btn-primary" onClick={() => navigate('/sell-gold')}>Sell More →</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellSuccess;
