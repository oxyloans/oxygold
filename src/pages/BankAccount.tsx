import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/userUtils';
import { API_BASE_URL } from '../Config';

const BankAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sellData = location.state;
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const SAVE_BANK_API = `${API_BASE_URL}/oxygold-api/auth/saveBankDetails`;

  if (!sellData) { navigate('/sell-gold'); return null; }

  const handleSubmit = async () => {
    if (!accountNumber || !ifscCode) {
      setError('Please fill all fields');
      return;
    }
    if (accountNumber.length < 9 || accountNumber.length > 18) {
      setError('Invalid account number (9–18 digits)');
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      setError('Invalid IFSC code format (e.g. SBIN0001234)');
      return;
    }
    
    // Use userId from sellData or get current user
    const currentUserId = sellData?.userId || getCurrentUser();
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const requestBody = {
        userId: parseInt(currentUserId.toString()),
        accountNumber: accountNumber.trim(),
        ifsc: ifscCode.trim().toUpperCase(),
        beneActive: false
      };
      
      console.log('=== SAVE BANK DETAILS API CALL START ===');
      console.log('API URL:', SAVE_BANK_API);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      
      // Make direct fetch call to handle text response properly
      console.log('=== GETTING ACCESS TOKEN ===');
      const tokenManager = (await import('../utils/tokenManager')).default.getInstance();
      
      if (!tokenManager.isLoggedIn()) {
        throw new Error('User not logged in');
      }
      
      const accessToken = await tokenManager.getValidAccessToken();
      console.log('Access token obtained:', accessToken ? 'Yes' : 'No');
      
      console.log('=== MAKING API CALL ===');
      const response = await fetch(SAVE_BANK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('=== SAVE BANK DETAILS API RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get response as text to avoid JSON parsing errors
      const responseText = await response.text();
      console.log('Response text length:', responseText.length);
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        console.error('=== API CALL FAILED ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Response:', responseText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 400) {
          throw new Error(`Invalid request: ${responseText || 'Please check your bank details'}`);
        } else if (response.status === 500) {
          throw new Error(`Server error: ${responseText || 'Please try again later'}`);
        } else if (response.status === 404) {
          throw new Error('Service not available. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to save bank details (${response.status}): ${responseText || 'Please try again'}`);
        }
      }
      
      // Handle the specific response format: "Bank verification successful"
      if (responseText === 'Bank verification successful' || 
          responseText.includes('Bank verification successful')) {
        
        console.log('=== BANK DETAILS SAVED SUCCESSFULLY ===');
        
        // Navigate back to sell summary with updated state
        navigate('/sell-summary', {
          state: {
            ...sellData,
            userId: currentUserId,
            bankDetailsAdded: true,
            // Pass the bank details we just saved
            newBankDetails: {
              accountNumber: accountNumber,
              ifsc: ifscCode,
              userId: parseInt(currentUserId.toString())
            }
          }
        });
      } else {
        console.error('=== UNEXPECTED RESPONSE FORMAT ===');
        console.error('Response text:', responseText);
        throw new Error(`Bank verification failed - unexpected response: ${responseText}`);
      }
    } catch (err: unknown) {
      console.error('=== SAVE BANK DETAILS ERROR ===');
      console.error('Error type:', typeof err);
      console.error('Error:', err);
      
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      
      let errorMessage = 'Failed to save bank details';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('Authentication')) {
          errorMessage = 'Authentication failed. Please login again.';
        } else {
          // Show the actual error message for debugging
          errorMessage = err.message;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold-400: #d4a017;
          --gold-500: #b8860b;
          --cream:    #faf7f0;
          --border:   rgba(212,160,23,0.22);
          --text:     #1a1612;
          --muted:    #7a6a55;
          --dim:      #b0a090;
          --success:  #16a34a;
          --s-bg:     #f0fdf4;
          --error:    #dc2626;
          --e-bg:     #fef2f2;
        }

        body { background: var(--cream); }
        .page { min-height: 100vh; background: var(--cream); }

        .main-wrap {
          max-width: 580px;
          margin: 0 auto;
          padding: 32px 20px 48px;
        }

        .page-header { text-align: center; margin-bottom: 20px; }
        .page-title  { font-size: 1.25rem; font-weight: 700; color: var(--text); font-family: inherit; }
        .page-sub    { font-size: 0.8rem; color: var(--muted); margin-top: 3px; }

        /* Card */
        .card {
          background: #fff;
          border: 1px solid var(--border);
          border-top: 3px solid var(--gold-400);
          border-radius: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .card-head {
          padding: 14px 22px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, #fdf9f0, #fff);
          border-radius: 11px 11px 0 0;
          display: flex; align-items: center; gap: 8px;
        }
        .card-title { font-size: 0.9375rem; font-weight: 600; color: var(--text); }

        .info-strip {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 22px;
          background: var(--s-bg);
          border-bottom: 1px solid rgba(22,163,74,0.15);
          font-size: 0.78rem; color: var(--success); font-weight: 500;
        }

        /* Field rows */
        .field-row {
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(212,160,23,0.12);
        }
        .field-row:last-of-type { border-bottom: none; }

        .field-label {
          flex: 0 0 180px;
          padding: 15px 22px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--muted);
          border-right: 1px solid rgba(212,160,23,0.12);
          background: #fdfaf4;
          white-space: nowrap;
          user-select: none;
        }

        .field-colon {
          padding: 15px 10px;
          color: var(--dim);
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .field-input {
          flex: 1;
          padding: 15px 12px 15px 4px;
          border: none;
          outline: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
          background: transparent;
          font-family: inherit;
          min-width: 0;
        }
        .field-input::placeholder { color: #ccc; font-weight: 400; }

        /* Error */
        .error-msg {
          font-size: 0.8rem; color: var(--error); font-weight: 500;
          padding: 10px 22px;
          background: var(--e-bg);
          border-top: 1px solid rgba(220,38,38,0.15);
          display: flex; align-items: center; gap: 6px;
        }

        /* Footer */
        .card-footer {
          padding: 16px 22px;
          border-top: 1px solid var(--border);
          background: var(--cream);
          border-radius: 0 0 11px 11px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .back-btn {
          flex: 1; padding: 11px;
          background: #fff; color: var(--muted);
          border: 1px solid var(--border); border-radius: 8px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.2s;
        }
        .back-btn:hover { border-color: var(--gold-400); color: var(--gold-400); background: #fdf9f0; }
        .submit-btn {
          flex: 1; padding: 11px;
          background: linear-gradient(135deg, var(--gold-400), var(--gold-500));
          color: #fff; border: none; border-radius: 8px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: opacity 0.2s;
        }
        .submit-btn:hover { opacity: 0.9; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="page">
        <main className="main-wrap">

          <div className="page-header">
            <h1 className="page-title">Bank Account Details</h1>
            <p className="page-sub">Where should we send your funds?</p>
          </div>

          <div className="card">
            <div className="card-head">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="5" width="14" height="9" rx="1.5" stroke="#d4a017" strokeWidth="1.4"/>
                <path d="M4 5V3.5C4 2.12 5.12 1 6.5 1h3C10.88 1 12 2.12 12 3.5V5" stroke="#d4a017" strokeWidth="1.4"/>
              </svg>
              <span className="card-title">Enter Bank Details</span>
            </div>

            <div className="info-strip">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="7" stroke="#16a34a" strokeWidth="1.5"/>
                <path d="M8 7V11M8 5V5.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Funds will be credited within T+1 working day
            </div>

            <div className="field-row">
              <span className="field-label">Account Number</span>
              <span className="field-colon">:</span>
              <input
                type="text"
                className="field-input"
                placeholder="9–18 digit number"
                value={accountNumber}
                onChange={(e) => { setAccountNumber(e.target.value); setError(''); }}
              />
            </div>

            <div className="field-row">
              <span className="field-label">IFSC Code</span>
              <span className="field-colon">:</span>
              <input
                type="text"
                className="field-input"
                placeholder="e.g. SBIN0001234"
                value={ifscCode}
                onChange={(e) => { setIfscCode(e.target.value.toUpperCase()); setError(''); }}
              />
            </div>

            {error && (
              <div className="error-msg">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/>
                  <path d="M8 5V9M8 11V11.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <div className="card-footer">
              <button className="back-btn" onClick={() => navigate('/sell-summary', { state: sellData })}>← Back</button>
              <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <div style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '6px' }}></div>
                    Saving...
                  </>
                ) : (
                  'Confirm & Proceed →'
                )}
              </button>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default BankAccount;