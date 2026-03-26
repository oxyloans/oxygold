import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PaymentProcessingProps {
  paymentData: any;
}

const PaymentProcessing: React.FC<PaymentProcessingProps> = ({ paymentData }) => {
  const navigate = useNavigate();
  
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
          min-height: calc(100vh - 60px);
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px;
        }
        
        .card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        
        .spinner {
          width: 48px; height: 48px;
          border: 4px solid #f0f2f5;
          border-top: 4px solid #d9a020;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .title {
          font-size: 1.2rem; font-weight: 600;
          color: #1c2b3a; margin-bottom: 8px;
        }
        
        .subtitle {
          color: #9eaab8; font-size: 0.9rem;
        }
      `}</style>
      
      <div className="page">
        <section className="ro-topbar">
          <div className="ro-topbar-in">
            <button className="ro-back" onClick={() => navigate(-1)}>←</button>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-title">Processing Payment</span>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-sub">Please wait...</span>
          </div>
        </section>
        
        <main className="main">
          <div className="card">
            <div className="spinner"></div>
            <h1 className="title">Processing Payment</h1>
            <p className="subtitle">Please wait while we process your payment...</p>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentProcessing;