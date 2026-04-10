import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TokenManager from '../utils/tokenManager';
import { logout } from '../utils/userUtils';

// Add global function to window for easy token inspection
declare global {
  interface Window {
    debugTokens: any;
    showTokens: () => void;
    showLocalStorage: () => void;
  }
}

// Global functions for debugging
window.showTokens = () => {
  const tokenManager = TokenManager.getInstance();
  console.log('=== CURRENT TOKENS ===');
  console.log('Access Token:', tokenManager.getAccessToken());
  console.log('User ID:', tokenManager.getUserId());
  console.log('Is Logged In:', tokenManager.isLoggedIn());
  console.log('Debug Tokens:', window.debugTokens);
  console.log('=== END TOKENS ===');
};

window.showLocalStorage = () => {
  console.log('=== LOCALSTORAGE DATA ===');
  console.log('Raw user data:', localStorage.getItem('user'));
  try {
    const parsed = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Parsed user data:', parsed);
  } catch (e) {
    console.log('Error parsing localStorage:', e);
  }
  console.log('=== END LOCALSTORAGE ===');
};

const API = 'http://65.0.147.157:9900/api/auth/userLoginOrRegister';

  const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [sessionId, setSessionId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showOtpSent, setShowOtpSent] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const redirectTo = location.state?.from || '/select-gold';

    // Clear any existing session when component mounts
    useEffect(() => {
      console.log('[Login] Component mounted, clearing any existing session');
      const tokenManager = TokenManager.getInstance();
      if (tokenManager.isLoggedIn()) {
        console.log('[Login] Found existing session, clearing it for fresh login');
        logout();
      }
    }, []);

    useEffect(() => {
      if (resendTimer <= 0) return;
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }, [resendTimer]);

    const handleSendOtp = async () => {
      setError('');
      if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit mobile number'); return; }
      setLoading(true);
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phone,
            registrationType: 'mobile',
            userType: 'Login',
            userRole: 'user',
            whatsappNumber: '',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to send OTP');
        setSessionId(data?.mobileOtpSessionId || data?.data?.mobileOtpSessionId || '');
        setShowOtpSent(true);
        setTimeout(() => setShowOtpSent(false), 3000);
        setStep('otp');
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } catch (err: any) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleVerifyOtp = async () => {
      setError('');
      const otpValue = otp.join('');
      if (otpValue.length < 6) { setError('Enter the 6-digit OTP'); return; }
      setLoading(true);
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phone,
            registrationType: 'mobile',
            userType: 'Login',
            mobileOtpSessionId: sessionId,
            mobileOtpValue: otpValue,
          }),
        });
        const data = await res.json();
        console.log('📦 FULL API Response:', JSON.stringify(data, null, 2));
        console.log('📦 Response Object:', data);
        console.log('🔍 Checking data structure:');
        console.log('- data.data exists:', !!data.data);
        console.log('- data.data.accessToken exists:', !!(data.data?.accessToken));
        console.log('- data.accessToken exists:', !!data.accessToken);
        console.log('- Available keys:', Object.keys(data));
        
        if (!res.ok) throw new Error(data?.message || 'Invalid OTP');
        
        // Use TokenManager to store tokens
        const tokenManager = TokenManager.getInstance();
        if (data.data && data.data.accessToken && data.data.refreshToken) {
          console.log('✅ Storing tokens via TokenManager for user:', data.data.userId);
          console.log('🔑 ACCESS TOKEN:', data.data.accessToken?.substring(0, 20) + '...');
          console.log('🔄 REFRESH TOKEN:', data.data.refreshToken?.substring(0, 20) + '...');
          console.log('👤 USER ID:', data.data.userId);
          console.log('⏰ EXPIRES IN:', data.data.expiresIn);
          
          tokenManager.setTokens({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            expiresIn: data.data.expiresIn,
            userId: data.data.userId,
            tokenType: data.data.tokenType || 'Bearer',
          });
          
          // Store in window object for easy access in console
          window.debugTokens = {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            userId: data.data.userId,
            expiresIn: data.data.expiresIn
          };
          
          console.log('%c🎉 LOGIN SUCCESSFUL - NEW USER SESSION CREATED!', 'color: green; font-size: 16px; font-weight: bold;');
          console.log('%cTo view tokens, type: window.debugTokens', 'color: orange; font-weight: bold;');
          
        } else {
          console.log('⚠️ Using fallback token storage - this should not happen');
          // Clear any existing data first
          localStorage.removeItem('user');
          sessionStorage.clear();
          // Fallback for old format
          const userId = data?.data?.userId || data?.userId || data?.data?.id || data?.id || null;
          if (userId) {
            localStorage.setItem('user', JSON.stringify({ phone, isLoggedIn: true, userId, ...data }));
          } else {
            throw new Error('No user ID found in response');
          }
        }
        
        setShowSuccess(true);
        // Add a small delay to ensure token storage is complete
        setTimeout(() => { 
          console.log('[Login] Redirecting to:', redirectTo);
          navigate(redirectTo); 
        }, 1500);
      } catch (err: any) {
        setError(err.message || 'OTP verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleOtpChange = (i: number, val: string) => {
      if (!/^\d?$/.test(val)) return;
      const next = [...otp]; next[i] = val; setOtp(next); setError('');
      if (val && i < 5) otpRefs.current[i + 1]?.focus();
    };
    const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    };
    const handleOtpPaste = (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
      e.preventDefault();
    };
    const handleResend = () => {
      setOtp(['', '', '', '', '', '']); setError(''); handleSendOtp();
    };

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .lg-scene {
            min-height: 100vh;
            background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 16px;
            font-family: 'Sora', sans-serif;
            position: relative;
            overflow: hidden;
          }
          .lg-scene::before {
            content: '';
            position: absolute;
            width: 600px; height: 600px; border-radius: 50%;
            background: radial-gradient(circle, rgba(42,78,158,0.25) 0%, transparent 65%);
            left: -150px; top: 50%; transform: translateY(-50%);
            pointer-events: none;
          }
          .lg-scene::after {
            content: '';
            position: absolute;
            width: 400px; height: 400px; border-radius: 50%;
            background: radial-gradient(circle, rgba(240,187,58,0.07) 0%, transparent 65%);
            right: -80px; top: 20%;
            pointer-events: none;
          }

          header { display: none !important; }

          .lg-card {
            display: grid;
            grid-template-columns: 320px 400px;
            border-radius: 18px;
            overflow: hidden;
            position: relative; z-index: 1;
            box-shadow:
              0 0 0 1px rgba(240,187,58,0.12),
              0 8px 32px rgba(0,0,0,0.5),
              0 32px 72px rgba(0,0,0,0.3);
          }

          /* LEFT PANEL */
          .lg-left {
            position: relative;
            overflow: hidden;
            background: #060f1e;
          }
          .lg-left-img {
            position: absolute; inset: 0;
            background:
              linear-gradient(to bottom, rgba(6,15,30,0.6), rgba(6,15,30,0.75)),
              url('https://img.freepik.com/premium-photo/gold-investment-outlook-illustration-gold-bars-stock-data-hologram_36897-5112.jpg');
            background-size: cover;
            background-position: center;
          }
          .lg-left-content {
            position: relative; z-index: 2; height: 100%;
            display: flex; flex-direction: column;
            justify-content: space-between;
            padding: 32px 28px;
          }
          .lg-logo-name {
            font-size: 1rem; font-weight: 700; color: #f0bb3a;
            letter-spacing: 0.04em;
          }
          .lg-tagline {
            font-size: 1.7rem; font-weight: 700;
            color: #fff; line-height: 1.2; margin-bottom: 10px;
            letter-spacing: -0.02em;
          }
          .lg-tagline em { color: #f0bb3a; font-style: normal; }
          .lg-left-desc {
            font-size: 0.73rem; color: rgba(255,255,255,0.42);
            line-height: 1.65; margin-bottom: 22px; font-weight: 400;
          }
          .lg-stats { display: flex; gap: 18px; }
          .lg-stat { display: flex; flex-direction: column; gap: 2px; }
          .lg-stat-val {
            font-size: 1.2rem; font-weight: 700;
            color: #f0bb3a; line-height: 1;
          }
          .lg-stat-lbl {
            font-size: 0.58rem; color: rgba(255,255,255,0.32);
            text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;
          }

          /* RIGHT PANEL */
          .lg-right {
            background: #f7f8fa;
            display: flex; flex-direction: column;
            justify-content: center;
            padding: 40px 40px;
          }

          .lg-form-title {
            font-size: 1.3rem; font-weight: 700;
            color: #0d1f3c; margin-bottom: 3px;
            letter-spacing: -0.02em;
          }
          .lg-form-sub {
            font-size: 0.74rem; color: #9eaab8;
            margin-bottom: 22px; font-weight: 400;
          }

          .lg-field { margin-bottom: 13px; }
          .lg-lbl {
            display: block; font-size: 0.6rem; font-weight: 600;
            color: #9eaab8; letter-spacing: 0.11em;
            text-transform: uppercase; margin-bottom: 6px;
          }

          .lg-phone-wrap {
            display: flex; align-items: center;
            border: 1.5px solid #e0e4e8;
            border-radius: 9px; overflow: hidden;
            background: #fff;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .lg-phone-wrap:focus-within {
            border-color: #1a3060;
            box-shadow: 0 0 0 3px rgba(26,48,96,0.08);
          }
          .lg-phone-prefix {
            padding: 10px 12px; font-size: 0.8rem; font-weight: 600;
            color: #6b82a8; border-right: 1.5px solid #e0e4e8;
            background: #f4f5f7; flex-shrink: 0;
          }
          .lg-phone-input {
            flex: 1; padding: 10px 12px; border: none; outline: none;
            font-family: 'Sora', sans-serif; font-size: 0.86rem;
            color: #0d1f3c; background: transparent;
            -moz-appearance: textfield;
          }
          .lg-phone-input::-webkit-outer-spin-button,
          .lg-phone-input::-webkit-inner-spin-button { -webkit-appearance: none; }
          .lg-phone-input::placeholder { color: #bcc5cf; }

          /* OTP */
          .lg-otp-row {
            display: flex; gap: 6px; margin-bottom: 8px; width: 100%;
          }
          .lg-otp-box {
            width: 0; flex: 1; min-width: 0; height: 42px;
            padding: 0; border: 1.5px solid #e0e4e8; border-radius: 9px;
            text-align: center; font-family: 'Sora', sans-serif;
            font-size: 1rem; font-weight: 600; color: #0d1f3c;
            background: #fff; outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
            -moz-appearance: textfield;
          }
          .lg-otp-box::-webkit-outer-spin-button,
          .lg-otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }
          .lg-otp-box:focus {
            border-color: #1a3060;
            box-shadow: 0 0 0 3px rgba(26,48,96,0.08);
          }
          .lg-otp-box.filled {
            border-color: #d9a020;
            background: #fffcf2;
          }

          .lg-otp-hint {
            font-size: 0.7rem; color: #9eaab8;
            margin-top: 8px; margin-bottom: 13px; font-weight: 400;
          }
          .lg-otp-hint span { font-weight: 600; color: #1c2b3a; }
          .lg-resend-btn {
            background: none; border: none; cursor: pointer;
            font-family: 'Sora', sans-serif; font-size: inherit;
            color: #d9a020; font-weight: 600; transition: color 0.14s;
          }
          .lg-resend-btn:disabled { color: #bcc5cf; cursor: default; }
          .lg-resend-btn:not(:disabled):hover { color: #b8720a; }

          .lg-change-phone {
            display: inline-flex; align-items: center; gap: 5px;
            font-size: 0.71rem; color: #6b82a8;
            background: #f0f2f5; border: 1px solid #e4e7eb;
            border-radius: 20px; padding: 4px 12px; cursor: pointer;
            font-family: 'Sora', sans-serif; margin-bottom: 18px;
            transition: color 0.14s, background 0.14s; font-weight: 400;
          }
          .lg-change-phone:hover { color: #1c2b3a; background: #e8ecf0; }

          .lg-success {
            font-size: 0.71rem; color: #16a34a;
            padding: 8px 11px; border-radius: 7px;
            background: #f0fdf4; border: 1px solid #bbf7d0;
            margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
          }
          .lg-success-icon {
            width: 14px; height: 14px; border-radius: 50%;
            background: #16a34a; color: white;
            display: flex; align-items: center; justify-content: center;
            font-size: 9px; flex-shrink: 0;
          }

          .lg-error {
            font-size: 0.71rem; color: #dc2626;
            padding: 8px 11px; border-radius: 7px;
            background: #fef2f2; border: 1px solid rgba(220,38,38,0.15);
            margin-bottom: 12px; font-weight: 400;
          }

          .lg-btn {
            width: 100%; padding: 11px; border: none; border-radius: 9px;
            font-family: 'Sora', sans-serif; font-size: 0.84rem; font-weight: 600;
            cursor: pointer;
            background: linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%);
            color: #0d1f3c;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            transition: box-shadow 0.2s, transform 0.1s;
            margin-top: 4px;
            box-shadow: 0 4px 16px rgba(217,160,32,0.28);
          }
          .lg-btn:hover:not(:disabled) {
            box-shadow: 0 6px 22px rgba(217,160,32,0.42);
            transform: translateY(-1px);
          }
          .lg-btn:active:not(:disabled) { transform: scale(0.99); }
          .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

          .lg-divider {
            display: flex; align-items: center; gap: 10px; margin: 14px 0 0;
          }
          .lg-divider-line { flex: 1; height: 1px; background: #e8ecf0; }
          .lg-divider-txt { font-size: 0.62rem; color: #bcc5cf; }

          .lg-footer {
            margin-top: 10px; text-align: center;
            font-size: 0.73rem; color: #9eaab8; font-weight: 400;
          }
          .lg-link {
            color: #d9a020; font-weight: 600; background: none; border: none;
            cursor: pointer; font-family: 'Sora', sans-serif; font-size: inherit;
            transition: color 0.14s;
          }
          .lg-link:hover { color: #b8720a; }

          .lg-back {
            display: block; width: 100%; margin-top: 8px; padding: 9px;
            border: 1.5px solid #e0e4e8; border-radius: 9px;
            font-family: 'Sora', sans-serif; font-size: 0.73rem;
            color: #9eaab8; background: transparent; cursor: pointer;
            transition: color 0.14s, border-color 0.14s; font-weight: 400;
          }
          .lg-back:hover { color: #4a5a6a; border-color: #bcc5cf; }

          @keyframes spin { to { transform: rotate(360deg); } }
          .lg-spin {
            width: 14px; height: 14px; border-radius: 50%;
            border: 2px solid rgba(13,31,60,0.2); border-top-color: #0d1f3c;
            animation: spin 0.65s linear infinite;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(12px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .lg-animate { animation: slideIn 0.25s ease both; }

          @media (max-width: 720px) {
            .lg-card { grid-template-columns: 1fr; max-width: 360px; }
            .lg-left { display: none; }
            .lg-right { padding: 36px 28px; }
          }
        `}</style>

        <div className="lg-scene">
          <div className="lg-card">

            {/* LEFT */}
            <div className="lg-left">
              <div className="lg-left-img" />
              <div className="lg-left-content">
                <div className="lg-logo-name">OXYGOLD.AI</div>
                <div>
                  <div className="lg-tagline">Invest in<br /><em>digital gold</em><br />with confidence</div>
                  <div className="lg-left-desc">Secure, insured, and always at live market rates.</div>
                  <div className="lg-stats">
                    <div className="lg-stat">
                      <span className="lg-stat-val">24K</span>
                      <span className="lg-stat-lbl">Purity</span>
                    </div>
                    <div className="lg-stat">
                      <span className="lg-stat-val">₹100</span>
                      <span className="lg-stat-lbl">Min. Buy</span>
                    </div>
                    <div className="lg-stat">
                      <span className="lg-stat-val">100%</span>
                      <span className="lg-stat-lbl">Insured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg-right">

              {step === 'phone' && (
                <div className="lg-animate">
                  <div className="lg-form-title">Welcome back</div>
                  <div className="lg-form-sub">Sign in with your mobile number</div>

                  <div className="lg-field">
                    <label className="lg-lbl">Mobile Number</label>
                    <div className="lg-phone-wrap">
                      <span className="lg-phone-prefix">+91</span>
                      <input
                        className="lg-phone-input"
                        type="number"
                        placeholder="Enter 10-digit mobile number"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.slice(0, 10)); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      />
                    </div>
                  </div>

                  {error && <div className="lg-error">{error}</div>}

                  <button className="lg-btn" onClick={handleSendOtp} disabled={loading}>
                    {loading ? <span className="lg-spin" /> : 'Send OTP →'}
                  </button>

                  <div className="lg-divider">
                    <div className="lg-divider-line" />
                    <span className="lg-divider-txt">OR</span>
                    <div className="lg-divider-line" />
                  </div>
                  <div className="lg-footer">
                    No account?{' '}
                    <button className="lg-link" onClick={() => navigate('/register')}>Create one</button>
                  </div>
                  <button className="lg-back" onClick={() => navigate('/')}>← Back to home</button>
                </div>
              )}

              {step === 'otp' && (
                <div className="lg-animate">
                  <div className="lg-form-title">Verify OTP</div>
                  <div className="lg-form-sub">Code sent to your mobile</div>

                  {showOtpSent && (
                    <div className="lg-success">
                      <span className="lg-success-icon">✓</span>
                      OTP sent to +91 {phone}
                    </div>
                  )}

                  <button className="lg-change-phone" onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}>
                    ← +91 {phone}
                  </button>

                  <div className="lg-field">
                    <label className="lg-lbl">Enter 6-digit OTP</label>
                    <div className="lg-otp-row" onPaste={handleOtpPaste}>
                      {otp.map((d, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          className={`lg-otp-box ${d ? 'filled' : ''}`}
                          type="number"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={e => handleOtpChange(i, e.target.value.slice(-1))}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                        />
                      ))}
                    </div>
                    <div className="lg-otp-hint">
                      Didn't receive it?{' '}
                      {resendTimer > 0
                        ? <>Resend in <span>{resendTimer}s</span></>
                        : <button className="lg-resend-btn" onClick={handleResend}>Resend OTP</button>
                      }
                    </div>
                  </div>

                  {showSuccess && (
                    <div className="lg-success">
                      <span className="lg-success-icon">✓</span>
                      Login successful! Redirecting...
                    </div>
                  )}

                  {error && <div className="lg-error">{error}</div>}

                  <button
                    className="lg-btn"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.join('').length < 6 || showSuccess}
                  >
                    {loading ? <span className="lg-spin" /> : showSuccess ? 'Success!' : 'Verify & Sign In →'}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </>
    );
  };

  export default Login;