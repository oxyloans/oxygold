import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TermsModal from '../components/TermsModal';
import { apiCall } from '../utils/tokenManager';
import { getCurrentUser } from '../utils/userUtils';
import { API_BASE_URL } from '../Config';

interface BankDetails {
  accountNumber: string;
  bankName: string;
  nameAtBank: string;
  ifsc: string;
  userId: number;
  branch?: string;
  city?: string;
  id?: string;
  micr?: string;
  token?: string;
  expiry?: string;
}

const SellSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sellData = location.state;
  
  if (!sellData) {
    navigate('/sell-gold');
    return null;
  }
  
  const { amount, grams, sellRate, sellMode, preview, userId, lockedTime, timeLeft: initialTimeLeft, gst } = sellData;
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft || 300);
  const [isPriceLocked, setIsPriceLocked] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);
  const [showBankSuccess, setShowBankSuccess] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  
  // Use values from preview API response
  const finalGrams = grams;
  const finalAmount = amount; // This is already the final amount after GST deduction from API

  const BANK_DETAILS_API = `${API_BASE_URL}/oxygold-api/auth/getBankDetailsByuserId`;
  const SELL_INITIATE_API = `${API_BASE_URL}/oxygold-api/digital-gold/sell/initiate`;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) { setIsPriceLocked(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Fetch bank details on component mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setBankLoading(true);
        setBankError(null); // Clear any previous errors
        
        // Use userId from sellData or get current user
        const currentUserId = userId || getCurrentUser();
        if (!currentUserId) {
          navigate('/login');
          return;
        }
        
        // Check if we have newly added bank details from navigation state
        if (sellData?.newBankDetails) {
          console.log('=== USING NEW BANK DETAILS FROM STATE ===');
          setBankDetails(sellData.newBankDetails);
          setBankVerified(true);
          setShowBankSuccess(true);
          // Hide success message after 3 seconds
          setTimeout(() => setShowBankSuccess(false), 3000);
          return;
        }
        
        // Use direct fetch instead of apiCall to handle potential response issues
        console.log('=== FETCHING BANK DETAILS FROM API ===');
        console.log('API URL:', `${BANK_DETAILS_API}?userId=${currentUserId}`);
        
        const tokenManager = (await import('../utils/tokenManager')).default.getInstance();
        const accessToken = await tokenManager.getValidAccessToken();
        
        const response = await fetch(`${BANK_DETAILS_API}?userId=${currentUserId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('=== BANK DETAILS API RESPONSE ===');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          let data;
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const textData = await response.text();
            console.log('Bank details response text:', textData);
            data = textData;
          }
          
          console.log('Bank details data:', data);
          console.log('Data type:', typeof data);
          
          // Handle the API response structure: { data: [...], message: "...", success: true }
          if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
            console.log('Found bank details in data array:', data.data[0]);
            setBankDetails(data.data[0]);
            setBankVerified(true);
            setShowBankSuccess(true);
            setTimeout(() => setShowBankSuccess(false), 3000);
          } else if (Array.isArray(data) && data.length > 0) {
            console.log('Found bank details in direct array:', data[0]);
            setBankDetails(data[0]);
            setBankVerified(true);
            setShowBankSuccess(true);
            setTimeout(() => setShowBankSuccess(false), 3000);
          } else if (data && typeof data === 'object' && data.accountNumber) {
            console.log('Found bank details as direct object:', data);
            setBankDetails(data);
            setBankVerified(true);
            setShowBankSuccess(true);
            setTimeout(() => setShowBankSuccess(false), 3000);
          } else {
            console.log('No valid bank details found in response');
            console.log('Response structure:', JSON.stringify(data, null, 2));
          }
        } else {
          console.log('Bank details API returned non-ok status:', response.status);
          if (response.status === 401) {
            setBankError('Authentication failed. Please login again.');
          } else if (response.status === 404) {
            console.log('No bank details found for user');
            // Don't show error for 404, just leave bankDetails as null
          } else if (response.status >= 500) {
            setBankError('Server error. Please try again later.');
          } else {
            setBankError(`Failed to load bank details (Error ${response.status})`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bank details:', err);
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            setBankError('Network error. Please check your connection and try again.');
          } else if (err.message.includes('Authentication')) {
            setBankError('Authentication failed. Please login again.');
          } else {
            setBankError('Failed to load bank details. Please try again.');
          }
        } else {
          setBankError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setBankLoading(false);
      }
    };
    
    fetchBankDetails();
  }, [userId, sellData?.newBankDetails]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!isPriceLocked) return;
    if (!isAccepted) { 
      setShowError(true); 
      setTimeout(() => setShowError(false), 3000); 
      return; 
    }
    
    // Check if bank details are available
    if (!bankDetails) {
      alert('Please add bank account details before proceeding.');
      return;
    }
    
    // Prevent multiple clicks while processing - check both state and ref
    if (sellLoading || isProcessingRef.current) {
      console.log('=== DUPLICATE CALL BLOCKED - ALREADY PROCESSING ===');
      return;
    }
    
    // Set processing state immediately to prevent duplicate clicks
    isProcessingRef.current = true;
    setSellLoading(true);
    
    try {
      await processSellInitiate();
    } catch (error) {
      // Reset states on error
      isProcessingRef.current = false;
      setSellLoading(false);
      throw error;
    }
  };

  const processSellInitiate = async () => {
    // Clear any previous errors when proceeding
    setShowError(false);
    
    // Use userId from sellData or get current user
    const currentUserId = userId || getCurrentUser();
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    
    // Proceed with sell initiate API
    try {
      // Generate unique call ID to track duplicate calls
      const callId = `SELL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`=== STARTING SELL CALL ${callId} ===`);
      
      // Validate required data before making API call
      if (!finalAmount || !finalGrams || !sellRate || !currentUserId) {
        throw new Error('Missing required data for sell initiation');
      }
      
      // Create request body matching your successful Postman request
      const requestBody = {
        userId: parseInt(currentUserId.toString()),
        amount: parseFloat(finalAmount.toString()),
        grams: parseFloat(finalGrams.toString()),
        purchaseType: sellMode?.toUpperCase() === 'GRAMS' ? 'GRAMS' : 'AMOUNT',
        pergramPrice: parseFloat(sellRate.toString()),
        pergramSellingPrice: parseFloat(sellRate.toString()),
        paymentMode: 'BANK',
        productId: 4
      };
      
      // Additional validation
      if (requestBody.amount <= 0 || requestBody.grams <= 0) {
        throw new Error('Amount and grams must be greater than 0');
      }
      
      if (requestBody.pergramPrice <= 0 || requestBody.pergramSellingPrice <= 0) {
        throw new Error('Price per gram must be greater than 0');
      }
      
      // Validate numeric values
      if (isNaN(requestBody.amount) || isNaN(requestBody.grams) || isNaN(requestBody.pergramPrice) || isNaN(requestBody.pergramSellingPrice)) {
        throw new Error('Invalid numeric values in request');
      }
      
      console.log(`=== SELL INITIATE API CALL START ${callId} ===`);
      console.log('Sell Initiate Request:', requestBody);
      console.log('Request Body JSON:', JSON.stringify(requestBody, null, 2));
      console.log('API URL:', SELL_INITIATE_API);
      
      // Use apiCall without overriding headers - let it handle authentication
      const response = await apiCall(SELL_INITIATE_API, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      console.log(`=== SELL INITIATE API CALL END ${callId} ===`);
      console.log('Sell Initiate Response:', response);
      
      // Handle the successful response structure
      if (response && response.success && response.data) {
        const { transactionId, beneficiaryId, status } = response.data;
        
        console.log('=== SELL INITIATE SUCCESS ===');
        console.log('Transaction ID:', transactionId);
        console.log('Beneficiary ID:', beneficiaryId);
        console.log('Status:', status);
        
        // Navigate to processing page with transaction details
        navigate('/sell-processing', {
          state: {
            transactionId: transactionId,
            beneficiaryId: beneficiaryId,
            status: status,
            amount: finalAmount,
            grams: finalGrams,
            sellRate: sellRate,
            bankDetails: bankDetails,
            message: response.message,
            userId: currentUserId,
            // Additional data for processing
            purchaseType: sellMode?.toUpperCase() === 'GRAMS' ? 'GRAMS' : 'AMOUNT',
            paymentMode: 'BANK',
            productId: 4
          }
        });
      } else {
        console.error('=== SELL INITIATE FAILED ===');
        console.error('Response:', response);
        throw new Error(response?.message || 'Sell initiation failed - invalid response');
      }
    } catch (err: unknown) {
      console.error('=== SELL INITIATE ERROR ===');
      console.error('Sell initiate error:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      console.error('=== END ERROR LOG ===');
      // Don't show terms error for API failures - show a different error
      alert('Transaction failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      console.log('=== SELL LOADING SET TO FALSE ===');
      isProcessingRef.current = false;
      setSellLoading(false);
    }
  };

  const timerPercent = (timeLeft / 300) * 100;
  const isUrgent = timeLeft <= 60;

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



        /* ── BANNER ── */
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

        /* ── MAIN ── */
        .main-wrap {
          max-width: 760px; margin: 0 auto;
          padding: 24px 32px 50px;
          position: relative; z-index: 1;
        }

        /* ── TIMER BANNER ── */
        .timer-banner {
          border-radius: 20px; padding: 12px 16px;
          margin-bottom: 29px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; border: 1px solid;
          animation: fadeUp 0.4s ease both;
        }
        .timer-banner.locked-ok {
          background: #fff; border-color: #e8ecf0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .timer-banner.locked-urgent {
          background: #fffbeb; border-color: rgba(217,119,6,0.25);
          box-shadow: 0 2px 8px rgba(217,119,6,0.08);
        }
        .timer-banner.expired {
          background: #fef2f2; border-color: rgba(220,38,38,0.2);
          box-shadow: 0 2px 8px rgba(220,38,38,0.08);
        }
        .timer-left { display: flex; align-items: center; gap: 10px; }
        .timer-icon { font-size: 1rem; }
        .timer-text { font-size: 0.8rem; font-weight: 500; }
        .timer-text.ok { color: #1a3060; }
        .timer-text.urgent { color: #d97706; }
        .timer-text.expired { color: #dc2626; }
        .timer-pill {
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em;
          padding: 4px 10px; border-radius: 100px;
        }
        .timer-pill.ok { background: rgba(26,48,96,0.1); color: #1a3060; }
        .timer-pill.urgent { 
          background: rgba(217,119,6,0.12); color: #d97706; 
          animation: pulse-warn 1.5s ease-in-out infinite; 
        }
        @keyframes pulse-warn { 0%,100% { opacity:1; } 50% { opacity:0.7; } }

        .timer-bar-wrap { height: 3px; background: rgba(0,0,0,0.06); border-radius: 99px; margin-top: 8px; }
        .timer-bar {
          height: 100%; border-radius: 99px;
          transition: width 1s linear;
        }
        .timer-bar.ok { background: #1a3060; }
        .timer-bar.urgent { background: #d97706; }

        /* ── ORDER CARD ── */
        .order-card {
          background: #fff; border: 1px solid #e8ecf0;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          position: relative;
        }
        .order-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.8;
        }

        /* ── WARNING BANNER ── */
        .card-warning {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 18px; background: #fffbeb;
          border-bottom: 1px solid rgba(217,119,6,0.12);
          font-size: 0.72rem; color: #d97706; line-height: 1.5;
        }

        /* ── DETAILS GRID ── */
        .details-grid {
          padding: 18px 20px;
        }

        .section-title {
          font-size: 0.58rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #9eaab8; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #f0f2f5; }

        .detail-row { 
          margin-bottom: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0; border-bottom: 1px solid #f4f5f7;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label {
          font-size: 0.76rem; font-weight: 400;
          color: #8a96a3;
        }
        .detail-value {
          font-size: 0.78rem; font-weight: 500;
          color: #1c2b3a;
        }
        .detail-value.gold { color: #b8720a; font-weight: 600; }

        /* ── TOTAL ROW ── */
        .total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; margin-top: 12px;
          background: #fffcf2; border-radius: 8px;
          border: 1px solid #f0e0a0;
        }
        .total-label { font-size: 0.82rem; font-weight: 600; color: #1c2b3a; }
        .total-value { font-size: 1.1rem; font-weight: 600; color: #b8720a; }

        /* ── CARD BOTTOM ── */
        .card-bottom {
          padding: 16px 20px 18px;
          border-top: 1px solid #f0f2f5;
          background: #fafbfc;
        }

        .card-divider { height: 1px; background: #f0f2f5; margin: 0 20px; }

        /* ── TERMS ── */
        .terms-label {
          display: flex; align-items: flex-start; gap: 10px;
          cursor: pointer; margin-bottom: 6px;
        }
        .terms-checkbox {
          width: 16px; height: 16px; margin-top: 2px;
          accent-color: #d9a020; cursor: pointer; flex-shrink: 0;
        }
        .terms-text { font-size: 0.8rem; color: #8a96a3; line-height: 1.5; font-weight: 400; }
        .terms-link {
          color: #1a3060; font-weight: 600;
          background: none; border: none; cursor: pointer;
          text-decoration: underline; text-underline-offset: 2px;
          font-size: inherit;
          transition: color 0.2s;
        }
        .terms-link:hover { color: #d9a020; }
        .terms-error { font-size: 0.74rem; color: #dc2626; font-weight: 500; margin-top: 6px; }

        /* ── BUTTONS ── */
        .proceed-btn {
          width: 100%; padding: 12px 18px;
          border: none; border-radius: 8px; margin-top: 16px;
          font-size: 0.88rem; font-weight: 600; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.01em;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Sora', sans-serif;
        }
        .proceed-btn.active {
          background: linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%);
          color: #0d1f3c;
          box-shadow: 0 3px 14px rgba(217,160,32,0.24);
        }
        .proceed-btn.active:hover:not(:disabled) { 
          box-shadow: 0 6px 20px rgba(217,160,32,0.36);
          transform: translateY(-1px);
        }
        .proceed-btn.active:disabled { opacity: 0.65; cursor: not-allowed; }
        .proceed-btn.refresh {
          background: linear-gradient(135deg, #1a3060, #0d1f3c);
          color: #fff;
          box-shadow: 0 3px 14px rgba(26,48,96,0.24);
        }
        .proceed-btn.refresh:hover { 
          box-shadow: 0 6px 20px rgba(26,48,96,0.36);
          transform: translateY(-1px);
        }

        /* ── BANK SUCCESS BANNER ── */
        .bank-success-banner {
          background: #f0fdf4;
          border: 1px solid rgba(22,163,74,0.2);
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 14px;
          animation: slideDown 0.3s ease;
        }
        .success-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .success-icon {
          color: #16a34a;
          font-weight: bold;
          font-size: 0.85rem;
        }
        .success-text {
          color: #16a34a;
          font-size: 0.78rem;
          font-weight: 500;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── BANK SELECTION ── */
        .bank-selection {
          margin-top: 14px;
          padding: 12px;
          background: #fafbfc;
          border-radius: 8px;
          border: 1px solid #e8ecf0;
        }
        .selection-title {
          font-size: 0.78rem;
          font-weight: 600;
          color: #1c2b3a;
          margin-bottom: 10px;
          text-align: center;
        }
        .selection-buttons {
          display: flex;
          justify-content: center;
        }
        .select-btn {
          padding: 7px 14px;
          border: none;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-family: 'Sora', sans-serif;
        }
        .select-btn.change {
          background: #f4f5f7;
          color: #1a3060;
          border: 1px solid #e4e7eb;
        }
        .select-btn.change:hover {
          background: #e8ecf0;
          border-color: #1a3060;
        }
        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(13,31,60,0.2);
          border-top: 2px solid #0d1f3c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ro-topbar { padding: 14px 20px; }
          .main-wrap { padding: 20px 16px 36px; }
          .order-card { border-radius: 10px; }
          .details-grid { padding: 16px 16px; }
          .card-bottom { padding: 14px 16px; }
        }
      `}</style>

      <div className="page">

        <section className="ro-topbar">
          <div className="ro-topbar-in">
            <button className="ro-back" onClick={() => navigate('/sell-gold')}>←</button>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-title">Review Sell Order</span>
            <span className="ro-topbar-sep" />
            <span className="ro-topbar-sub">Confirm your sell details</span>
          </div>
        </section>

        <main className="main-wrap">

          {!isPriceLocked && (
            <div className="timer-banner expired">
              <div>
                <div className="timer-left">
                  <span className="timer-icon">⚠️</span>
                  <span className="timer-text expired">Price lock expired — please refresh to get a new price</span>
                </div>
              </div>
            </div>
          )}

          {isPriceLocked && isUrgent && (
            <div className="timer-banner locked-urgent">
              <div>
                <div className="timer-left">
                  <span className="timer-icon">🔒</span>
                  <span className="timer-text urgent">
                    Price locked — expires in
                  </span>
                  <span className="timer-pill urgent">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="timer-bar-wrap">
                  <div
                    className="timer-bar urgent"
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="order-card">

            <div className="card-warning">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M8 1L1 15H15L8 1Z" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6V9M8 11V11.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>
                Price locked for {formatTime(timeLeft)} &nbsp;•&nbsp; Transaction cannot be cancelled once confirmed
              </span>
            </div>

            <div className="details-grid">
              <div className="section-title">Sell Details</div>

              <div className="detail-row">
                <span className="detail-label">Sell Rate (Locked)</span>
                <span className="detail-value gold">₹{sellRate?.toFixed(2)} / gram</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Quantity</span>
                <span className="detail-value">{finalGrams?.toFixed(3)} grams</span>
              </div>

              <div className="total-row">
                <span className="total-label">You Will Receive</span>
                <span className="total-value">₹{finalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>

              <div style={{ fontSize: '0.68rem', color: '#999', marginTop: '6px', fontStyle: 'italic' }}>
                * Selling price is GST-adjusted as per regulations
              </div>
            </div>

            <div className="card-divider" />

            {/* Bank Details Section */}
            <div className="details-grid">
              <div className="section-title">Bank Details</div>
              
              {/* Bank Verification Success Message */}
              {showBankSuccess && (
                <div className="bank-success-banner">
                  <div className="success-content">
                    <span className="success-icon">✓</span>
                    <span className="success-text">Bank verification successful</span>
                  </div>
                </div>
              )}
              
              {bankLoading ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: '#999' }}>
                  <div style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #e0e0e0', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span style={{ marginLeft: '6px', fontSize: '0.76rem' }}>Loading...</span>
                </div>
              ) : bankError ? (
                <div style={{ padding: '12px', textAlign: 'center', background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '6px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/>
                      <path d="M8 5V9M8 11V11.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: '500' }}>{bankError}</span>
                  </div>
                  <button 
                    className="select-btn change" 
                    onClick={() => {
                      setBankError(null);
                      // Retry fetching bank details
                      const fetchBankDetails = async () => {
                        try {
                          setBankLoading(true);
                          setBankError(null);
                          const currentUserId = userId || getCurrentUser();
                          if (!currentUserId) return;
                          
                          const tokenManager = (await import('../utils/tokenManager')).default.getInstance();
                          const accessToken = await tokenManager.getValidAccessToken();
                          
                          const response = await fetch(`${BANK_DETAILS_API}?userId=${currentUserId}`, {
                            method: 'GET',
                            headers: {
                              'Authorization': `Bearer ${accessToken}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          
                          if (response.ok) {
                            const contentType = response.headers.get('content-type');
                            let data;
                            if (contentType && contentType.includes('application/json')) {
                              data = await response.json();
                            } else {
                              data = await response.text();
                            }
                            
                            if (data && (data.success !== false)) {
                              const bankData = data.data || data;
                              if (bankData && typeof bankData === 'object') {
                                setBankDetails(bankData);
                                setBankVerified(true);
                              }
                            }
                          } else {
                            throw new Error(`API returned ${response.status}`);
                          }
                        } catch (err) {
                          setBankError('Failed to retry. Please try again.');
                        } finally {
                          setBankLoading(false);
                        }
                      };
                      fetchBankDetails();
                    }}
                    style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                  >
                    Retry
                  </button>
                </div>
              ) : bankDetails ? (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Account Holder</span>
                    <span className="detail-value">{bankDetails.nameAtBank}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Account Number</span>
                    <span className="detail-value">{bankDetails.accountNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Bank Name</span>
                    <span className="detail-value">{bankDetails.bankName}</span>
                  </div>
                  {bankDetails.branch && bankDetails.city && (
                    <div className="detail-row">
                      <span className="detail-label">Branch</span>
                      <span className="detail-value">{bankDetails.branch}, {bankDetails.city}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">IFSC Code</span>
                    <span className="detail-value">{bankDetails.ifsc}</span>
                  </div>
                  
                  {/* Bank Selection Confirmation */}
                  {bankVerified && (
                    <div className="bank-selection">
                      <div className="selection-title">Proceed with this bank account?</div>
                      <div className="selection-buttons">
                        <button className="select-btn change" onClick={() => navigate('/bank-account', {
                          state: {
                            grams: finalGrams,
                            amount: finalAmount,
                            sellRate: sellRate,
                            userId: userId || getCurrentUser(),
                            lockedTime: lockedTime,
                            timeLeft: timeLeft,
                            sellMode: sellMode,
                            preview: preview,
                            returnTo: 'sell-summary'
                          },
                        })}>
                          Change Account
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '12px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.76rem', color: '#999', marginBottom: '10px' }}>No bank account added</div>
                  <button 
                    className="select-btn change" 
                    onClick={() => navigate('/bank-account', {
                      state: {
                        grams: finalGrams,
                        amount: finalAmount,
                        sellRate: sellRate,
                        userId: userId || getCurrentUser(),
                        lockedTime: lockedTime,
                        timeLeft: timeLeft,
                        sellMode: sellMode,
                        preview: preview,
                        returnTo: 'sell-summary'
                      },
                    })}
                    style={{ margin: '0 auto', display: 'block' }}
                  >
                    + Add Bank Account
                  </button>
                </div>
              )}
            </div>

            <div className="card-divider" />

            <div className="card-bottom">
              <label className="terms-label">
                <input
                  type="checkbox"
                  className="terms-checkbox"
                  checked={isAccepted}
                  onChange={(e) => setIsAccepted(e.target.checked)}
                />
                <span className="terms-text">
                  I agree to the{' '}
                  <button type="button" className="terms-link" onClick={() => setShowTermsModal(true)}>
                    Terms & Conditions
                  </button>
                </span>
              </label>
              {showError && !isAccepted && (
                <div className="terms-error">Please accept the Terms & Conditions to continue</div>
              )}

              {isPriceLocked ? (
                <button 
                  className="proceed-btn active" 
                  onClick={handleConfirm} 
                  disabled={sellLoading || !isAccepted || !bankDetails}
                  style={{ 
                    opacity: (sellLoading || !isAccepted || !bankDetails) ? 0.6 : 1,
                    cursor: (sellLoading || !isAccepted || !bankDetails) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sellLoading ? (
                    <>
                      <div style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(26,13,5,0.3)', borderTop: '2px solid #1a0d05', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Processing...
                    </>
                  ) : bankVerified ? (
                    'Yes, Proceed with This Account →'
                  ) : (
                    'Confirm & Sell Gold →'
                  )}
                </button>
              ) : (
                <button className="proceed-btn refresh" onClick={() => navigate('/sell-gold')}>
                  ↺ Get Fresh Price & Try Again
                </button>
              )}
            </div>

          </div>
        </main>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        flowType="sell"
      />
    </>
  );
};

export default SellSummary;
