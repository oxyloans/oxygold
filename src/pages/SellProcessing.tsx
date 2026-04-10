import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/userUtils';
import { apiCall } from '../utils/tokenManager';

const SellProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sellData = location.state;
  const [currentStep, setCurrentStep] = useState(1);
  const [transferId, setTransferId] = useState('');
  const [finalStatus, setFinalStatus] = useState('PENDING');
  const [statusMessage, setStatusMessage] = useState('Processing your sell order...');
  
  // Redirect if no sell data
  if (!sellData) {
    navigate('/sell-gold');
    return null;
  }
  
  const { transactionId, beneficiaryId, status, amount, grams, sellRate, bankDetails, message, userId } = sellData;
  
  const SELL_EXECUTE_API = 'http://65.0.147.157:9900/api/digital-gold/sell/execute';
  const PAYOUT_STATUS_API = 'http://65.0.147.157:9900/api/digital-gold/payout/status';
  
  useEffect(() => {
    // Verify user authentication
    const currentUserId = userId || getCurrentUser();
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    
    const processTransaction = async () => {
      try {
        // Step 1: Execute the sell transaction
        setCurrentStep(1);
        setStatusMessage('Executing sell order...');
        
        const executeResponse = await apiCall(`${SELL_EXECUTE_API}?txnId=${transactionId}`, {
          method: 'POST'
        });
        
        console.log('Sell Execute Response:', executeResponse);
        
        if (executeResponse.success && executeResponse.data) {
          const { transferId: newTransferId, status: executeStatus, message: executeMessage } = executeResponse.data;
          setTransferId(newTransferId);
          setCurrentStep(2);
          setStatusMessage(executeMessage || 'Bank payout initiated...');
          
          // Step 2: Check payment status via proper status API
          setTimeout(async () => {
            try {
              setCurrentStep(3);
              setStatusMessage('Checking payment status...');
              
              const statusResponse = await apiCall(
                `${PAYOUT_STATUS_API}?transferId=${newTransferId}&txnId=${transactionId}`,
                { method: 'GET' }
              );
              
              console.log('Payout Status Response:', statusResponse);
              
              if (statusResponse.success && statusResponse.data) {
                const { status: paymentStatus, message: paymentMessage } = statusResponse.data;
                
                setFinalStatus(paymentStatus);
                
                // Navigate to success page with final status
                setTimeout(() => {
                  navigate('/sell-success', {
                    state: {
                      transactionId,
                      transferId: newTransferId,
                      beneficiaryId,
                      status: paymentStatus,
                      amount,
                      grams,
                      sellRate,
                      bankDetails,
                      message: paymentMessage,
                      userId: currentUserId,
                      paymentStatus: paymentStatus === 'UNKNOWN' ? 'FAILED' : paymentStatus,
                      pergramSellingPrice: sellRate,
                      purchaseType: 'GRAMS',
                      paymentMode: 'BANK',
                      productId: 4
                    }
                  });
                }, 2000);
              } else {
                throw new Error('Failed to check payment status');
              }
            } catch (statusError) {
              console.error('Status check failed:', statusError);
              navigate('/sell-success', {
                state: {
                  transactionId,
                  transferId: newTransferId,
                  beneficiaryId,
                  status: 'FAILED',
                  amount,
                  grams,
                  sellRate,
                  bankDetails,
                  message: 'Payment status check failed',
                  userId: currentUserId,
                  paymentStatus: 'FAILED',
                  pergramSellingPrice: sellRate,
                  purchaseType: 'GRAMS',
                  paymentMode: 'BANK',
                  productId: 4
                }
              });
            }
          }, 3000);
          
        } else {
          throw new Error(executeResponse.message || 'Sell execution failed');
        }
      } catch (error) {
        console.error('Transaction processing failed:', error);
        // Navigate to success page with failed status
        navigate('/sell-success', {
          state: {
            transactionId,
            beneficiaryId,
            status: 'FAILED',
            amount,
            grams,
            sellRate, // This is the selling price (pergramSellingPrice)
            bankDetails,
            message: 'Transaction processing failed',
            userId: currentUserId,
            paymentStatus: 'FAILED',
            // Pass the same data structure as from SellSummary
            pergramSellingPrice: sellRate,
            purchaseType: 'GRAMS',
            paymentMode: 'BANK',
            productId: 4
          }
        });
      }
    };
    
    // Start processing after a short delay
    const timer = setTimeout(processTransaction, 1000);
    return () => clearTimeout(timer);
  }, [navigate, transactionId, status, amount, grams, sellRate, bankDetails, message, userId]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #faf7f0;
          font-family: 'Inter', sans-serif;
          color: #1a1612;
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

        .content {
          text-align: center;
        }

        /* Spinner */
        .spinner-wrap {
          display: flex; justify-content: center; margin-bottom: 24px;
        }
        .spinner {
          position: relative; width: 56px; height: 56px;
        }
        .spinner-ring {
          position: absolute; inset: 0;
          border: 3px solid transparent;
          border-top-color: #d4a017;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .title {
          font-size: 1.25rem; font-weight: 700;
          color: #1a1612; margin-bottom: 8px;
        }
        .subtitle {
          font-size: 0.875rem; color: #8a7a65;
          margin-bottom: 24px;
        }

        /* Steps */
        .steps {
          display: flex; flex-direction: column; gap: 12px;
        }
        .step {
          display: flex; align-items: center; gap: 12px;
          font-size: 0.875rem; color: #8a7a65;
        }
        .step-dot {
          width: 6px; height: 6px;
          background: #d4a017; border-radius: 50%;
          flex-shrink: 0;
        }
        .step.inactive .step-dot {
          background: #ddd;
        }
      `}</style>

      <div className="page">
        {/* ── BANNER ── */}
        <section className="banner">
          <div className="banner-in">
            <button className="back-btn" onClick={() => navigate('/bank-account')}>←</button>
            <span className="banner-sep" />
            <span className="banner-title">Processing Your Sell Order</span>
            <span className="banner-sep" />
            <span className="banner-sub">Please wait...</span>
          </div>
        </section>

        {/* ── MAIN ── */}
        <main className="main">
          <div className="content">
            <div className="spinner-wrap">
              <div className="spinner">
                <div className="spinner-ring" />
              </div>
            </div>
            
            <h1 className="title">Processing Your Sell Order</h1>
            <p className="subtitle">{statusMessage}</p>
            <p className="subtitle">Transaction ID: {transactionId || 'Generating...'}</p>
            {transferId && <p className="subtitle">Transfer ID: {transferId}</p>}
            
            <div className="steps">
              <div className={`step${currentStep >= 1 ? '' : ' inactive'}`}>
                <div className="step-dot" />
                <span>Executing sell order</span>
              </div>
              <div className={`step${currentStep >= 2 ? '' : ' inactive'}`}>
                <div className="step-dot" />
                <span>Initiating bank payout</span>
              </div>
              <div className={`step${currentStep >= 3 ? '' : ' inactive'}`}>
                <div className="step-dot" />
                <span>Verifying payment status</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SellProcessing;
