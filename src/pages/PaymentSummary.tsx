import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSummary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
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
          font-family: 'Sora', sans-serif;
        }
        .ro-back:hover { 
          background: rgba(240,187,58,0.12); 
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
        }
        .ro-topbar-sep { width: 1px; height: 14px; background: rgba(240,187,58,0.18); flex-shrink: 0; }
        .ro-topbar-title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .ro-topbar-sub { font-size: 0.78rem; color: rgba(255,255,255,0.58); }
        
        .main {
          max-width: 800px; margin: 0 auto;
          padding: 32px 48px 56px;
        }
        
        .card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        
        .title {
          font-size: 1.1rem; font-weight: 600;
          color: #1c2b3a; margin-bottom: 16px;
        }
        
        .detail-row {
          display: flex; justify-content: space-between;
          padding: 8px 0;
          font-size: 0.85rem;
        }
        .detail-row:not(:last-child) {
          border-bottom: 1px solid #f0f2f5;
          margin-bottom: 8px;
        }
        .detail-label { color: #9eaab8; }
        .detail-value { font-weight: 600; color: #1c2b3a; }
        
        .total-row {
          display: flex; justify-content: space-between;
          padding: 12px 0;
          font-size: 1rem; font-weight: 600;
          border-top: 1px solid #e8ecf0;
          margin-top: 12px;
        }
        
        .actions {
          display: flex; gap: 12px;
        }
        .btn {
          flex: 1; padding: 12px 20px;
          border: none; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }
        .btn-primary {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #0d1f3c;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .btn-primary:hover {
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
          transform: translateY(-1px);
        }
        .btn-secondary {
          background: #fff;
          color: #1c2b3a;
          border: 1px solid #e0e4e8;
        }
        .btn-secondary:hover {
          border-color: #d9a020;
          background: #fffcf0;
        }
      `}</style>
      
      <div className="page">
        <section className="ro-topbar">
          <div className="ro-topbar-in">
            <button className="ro-back" onClick={() => navigate(-1)}>←</button>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-title">Payment Summary</span>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-sub">Transaction completed successfully</span>
          </div>
        </section>
        
        <main className="main">
          <div className="card">
            <h2 className="title">Transaction Details</h2>
            
            {paymentData ? (
              <div>
                <div className="detail-row">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">₹{paymentData.amount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Gold Quantity:</span>
                  <span className="detail-value">{paymentData.goldQuantity}g</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Gold Rate:</span>
                  <span className="detail-value">₹{paymentData.goldRate}/g</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">GST:</span>
                  <span className="detail-value">₹{paymentData.gst}</span>
                </div>
                <div className="total-row">
                  <span>Total Amount:</span>
                  <span>₹{paymentData.totalAmount}</span>
                </div>
              </div>
            ) : (
              <p className="detail-label">No payment data available</p>
            )}
          </div>
          
          <div className="actions">
            <button
              onClick={() => navigate('/portfolio')}
              className="btn btn-primary"
            >
              View Portfolio
            </button>
            <button
              onClick={() => navigate('/buy-gold')}
              className="btn btn-secondary"
            >
              Buy More Gold
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentSummary;