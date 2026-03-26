import { useNavigate, useLocation } from 'react-router-dom';

const PaymentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transactionData = location.state;
  
  // Debug logging
  console.log('PaymentDetails - location.state:', location.state);
  console.log('PaymentDetails - transactionData:', transactionData);
  
  // If no data in location.state, try to get from sessionStorage
  let finalTransactionData = transactionData;
  if (!finalTransactionData) {
    const stored = sessionStorage.getItem('paymentSuccessData');
    if (stored) {
      finalTransactionData = JSON.parse(stored);
      console.log('PaymentDetails - restored from sessionStorage:', finalTransactionData);
    }
  }
  
  if (!finalTransactionData) {
    console.log('PaymentDetails - no data found, redirecting to portfolio');
    navigate('/portfolio');
    return null;
  }
  
  const txnId = finalTransactionData?.transactionId || finalTransactionData?.orderId || '';
  const orderId = finalTransactionData?.orderId || finalTransactionData?.transactionId || '';
  const processingFee = parseFloat(finalTransactionData?.processingFee) || 0;
  const subtotal = parseFloat(finalTransactionData?.total) || 0;
  const totalAmount = subtotal + processingFee;
  const gramsDisplay = parseFloat(finalTransactionData?.grams) > 0
    ? parseFloat(finalTransactionData.grams).toFixed(6)
    : finalTransactionData?.grams || '0';
  const goldRateDisplay = parseFloat(finalTransactionData?.goldRate) > 0
    ? parseFloat(finalTransactionData.goldRate).toLocaleString('en-IN', { maximumFractionDigits: 2 })
    : null;
  
  const timestamp = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const handleDownload = () => {
    const receiptContent = `
DIGITAL GOLD PURCHASE RECEIPT
================================

Transaction ID: ${txnId}
Date & Time: ${timestamp}
Payment Method: ${transactionData.paymentMethod === 'upi' ? 'UPI (Cashfree)' : 'Wallet'}

ORDER DETAILS
-------------
Quantity: ${gramsDisplay} grams
Gold Rate: ₹${goldRateDisplay || 'N/A'} / gram
Purity: 24K · 999

PAYMENT BREAKDOWN
-----------------
Subtotal: ₹${subtotal.toLocaleString()}${processingFee > 0 ? `\nProcessing Fee: ₹${processingFee.toFixed(2)}` : ''}
Total Amount: ₹${totalAmount.toLocaleString()}

Status: SUCCESS
================================
Thank you for your purchase!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gold-purchase-${txnId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          max-width: 600px; margin: 0 auto;
          padding: 32px 40px 56px;
        }
        
        .card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          position: relative;
        }
        
        .card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }
        
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f2f5;
          margin-bottom: 24px;
        }
        
        .title {
          font-size: 1.1rem; font-weight: 600;
          color: #1c2b3a; margin-bottom: 4px;
        }
        
        .subtitle {
          font-size: 0.8rem; color: #9eaab8;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 0.6rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #9eaab8; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #f0f2f5; }
        
        .detail-row {
          display: flex; justify-content: space-between;
          padding: 8px 0; font-size: 0.85rem;
        }
        .detail-row:not(:last-child) {
          border-bottom: 1px solid #f7f8fa;
          margin-bottom: 8px;
        }
        .detail-label { color: #9eaab8; }
        .detail-value { font-weight: 600; color: #1c2b3a; }
        .detail-value.txn-id {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          word-break: break-all;
          color: #b8720a;
        }
        .detail-value.total {
          font-size: 1rem;
          color: #b8720a;
        }
        
        .actions {
          display: flex; gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #f0f2f5;
        }
        
        .btn {
          flex: 1; padding: 12px 16px;
          border: none; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 6px;
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
        
        .btn-primary {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #0d1f3c;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .btn-primary:hover {
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
          transform: translateY(-1px);
        }
      `}</style>
      
      <div className="page">
        <section className="ro-topbar">
          <div className="ro-topbar-in">
            <button className="ro-back" onClick={() => navigate(-1)}>←</button>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-title">Payment Details</span>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-sub">Complete transaction information</span>
          </div>
        </section>
        
        <main className="main">
          <div className="card">
            <div className="header">
              <h1 className="title">Payment Receipt</h1>
              <p className="subtitle">{timestamp}</p>
            </div>
            
            <div className="section">
              <div className="section-title">Transaction Details</div>
              <div className="detail-row">
                <span className="detail-label">Transaction ID</span>
                <span className="detail-value txn-id">{txnId}</span>
              </div>
              {finalTransactionData.paymentMethod && (
                <div className="detail-row">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">
                    {finalTransactionData.paymentMethod === 'upi' ? 'UPI (Cashfree)' : `Wallet (${finalTransactionData.wallet || 'Wallet'})`}
                  </span>
                </div>
              )}
            </div>

            <div className="section">
              <div className="section-title">Order Details</div>
              <div className="detail-row">
                <span className="detail-label">Quantity</span>
                <span className="detail-value">{gramsDisplay} grams</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gold Rate</span>
                <span className="detail-value">₹{goldRateDisplay || 'N/A'} / gram</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Purity</span>
                <span className="detail-value">24K · 999</span>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Payment Breakdown</div>
              <div className="detail-row">
                <span className="detail-label">Subtotal</span>
                <span className="detail-value">₹{subtotal.toLocaleString()}</span>
              </div>
              {processingFee > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Processing Fee</span>
                  <span className="detail-value">₹{processingFee.toFixed(2)}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value total">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="actions">
              <button className="btn btn-secondary" onClick={() => navigate('/portfolio')}>
                Back to Portfolio
              </button>
              <button className="btn btn-primary" onClick={handleDownload}>
                📄 Download Receipt
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentDetails;