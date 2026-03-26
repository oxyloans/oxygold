import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../services/adminService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      const data = await adminService.loginOrRegister({
        phoneNumber: phone,
        registrationType: 'mobile',
        userType: 'Login',
        userRole: 'admin',
        whatsappNumber: '',
      });
      setSessionId(data?.mobileOtpSessionId || data?.data?.mobileOtpSessionId || '');
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
      const data = await adminService.loginOrRegister({
        phoneNumber: phone,
        registrationType: 'mobile',
        userType: 'Login',
        mobileOtpSessionId: sessionId,
        mobileOtpValue: otpValue,
        userRole: 'admin',
        whatsappNumber: ''
      });

      localStorage.setItem('admin', JSON.stringify({ phone, isLoggedIn: true, ...data }));
      navigate('/admin/dashboard');
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-scene {
          min-height: 100vh;
          background: #F1F3F9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          font-family: 'Outfit', sans-serif;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(180,150,100,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(120,90,50,0.06) 0%, transparent 50%);
        }

        header { display: none !important; }

        /* CARD */
        .lg-card {
          display: grid;
          grid-template-columns: 340px 320px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.10),
            0 32px 64px rgba(0,0,0,0.08);
        }

        /* LEFT PANEL */
        .lg-left {
          position: relative;
          overflow: hidden;
          background: #1a1208;
        }
        .lg-left-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(8,6,2,0.72) 0%, rgba(8,6,2,0.45) 40%, rgba(8,6,2,0.82) 100%),
            url('https://images.unsplash.com/photo-1624365168968-f283d506c6b6?w=700&q=80') center/cover no-repeat;
        }
        .lg-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 32px;
        }
        .lg-logo-mark {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lg-logo-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #d4a843, #f0c96e);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .lg-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.04em;
        }
        .lg-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.95rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .lg-tagline em {
          color: #f0c96e;
          font-style: normal;
        }
        .lg-left-desc {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          margin-bottom: 24px;
        }

        /* RIGHT PANEL */
        .lg-right {
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 36px;
        }

        .lg-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: #12100a;
          margin-bottom: 3px;
          letter-spacing: -0.01em;
        }
        .lg-form-sub {
          font-size: 0.75rem;
          color: #b8b0a4;
          margin-bottom: 24px;
          font-weight: 300;
        }

        .lg-field { margin-bottom: 14px; }
        .lg-lbl {
          display: block;
          font-size: 0.65rem;
          font-weight: 600;
          color: #b8b0a4;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .lg-phone-wrap {
          display: flex;
          align-items: center;
          border: 1.5px solid #ede9e2;
          border-radius: 10px;
          overflow: hidden;
          background: #faf8f5;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lg-phone-wrap:focus-within {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .lg-phone-prefix {
          padding: 10px 12px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #888;
          border-right: 1.5px solid #ede9e2;
          background: #f5f1eb;
          flex-shrink: 0;
        }
        .lg-phone-input {
          flex: 1;
          padding: 10px 13px;
          border: none;
          outline: none;
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: #12100a;
          background: transparent;
          -moz-appearance: textfield;
        }
        .lg-phone-input::-webkit-outer-spin-button,
        .lg-phone-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .lg-phone-input::placeholder { color: #d0cabc; }

        /* OTP */
        .lg-otp-row {
          display: flex;
          gap: 7px;
          margin-bottom: 8px;
          width: 100%;
        }
        .lg-otp-box {
          width: 0;
          flex: 1;
          min-width: 0;
          height: 42px;
          padding: 0;
          border: 1.5px solid #ede9e2;
          border-radius: 10px;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #12100a;
          background: #faf8f5;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          -moz-appearance: textfield;
        }
        .lg-otp-box::-webkit-outer-spin-button,
        .lg-otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }
        .lg-otp-box:focus {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .lg-otp-box.filled {
          border-color: #c9993a;
          background: #fdf8ee;
        }

        .lg-otp-hint {
          font-size: 0.7rem;
          color: #b8b0a4;
          margin-top: 8px;
          margin-bottom: 14px;
          font-weight: 300;
        }
        .lg-otp-hint span { font-weight: 600; color: #12100a; }
        .lg-resend-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: inherit;
          color: #c9993a;
          font-weight: 600;
          transition: color 0.14s;
        }
        .lg-resend-btn:disabled { color: #d0cabc; cursor: default; }
        .lg-resend-btn:not(:disabled):hover { color: #a37828; }

        .lg-change-phone {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: #b8b0a4;
          background: #f5f1eb;
          border: 1px solid #ede9e2;
          border-radius: 20px;
          padding: 4px 12px;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 20px;
          transition: color 0.14s, background 0.14s;
          font-weight: 400;
        }
        .lg-change-phone:hover { color: #555; background: #ede9e2; }

        .lg-error {
          font-size: 0.72rem;
          color: #b94040;
          padding: 8px 11px;
          border-radius: 8px;
          background: #fdf4f4;
          border: 1px solid rgba(185,64,64,0.14);
          margin-bottom: 12px;
        }

        .lg-btn {
          width: 100%;
          padding: 11px;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #c9993a, #d4a843);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.18s, transform 0.1s;
          margin-top: 4px;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 14px rgba(201,153,58,0.3);
        }
        .lg-btn:hover:not(:disabled) { opacity: 0.9; }
        .lg-btn:active:not(:disabled) { transform: scale(0.99); }
        .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        .lg-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 0 0;
        }
        .lg-divider-line { flex: 1; height: 1px; background: #ede9e2; }
        .lg-divider-txt { font-size: 0.65rem; color: #d0cabc; }

        .lg-footer {
          margin-top: 12px;
          text-align: center;
          font-size: 0.75rem;
          color: #b8b0a4;
          font-weight: 300;
        }
        .lg-link {
          color: #c9993a;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: inherit;
          transition: color 0.14s;
        }
        .lg-link:hover { color: #a37828; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .lg-spin {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.65s linear infinite;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .lg-animate { animation: slideIn 0.25s ease both; }

        @media (max-width: 720px) {
          .lg-card { grid-template-columns: 1fr; max-width: 340px; }
          .lg-left { display: none; }
          .lg-right { padding: 36px 28px; }
        }
      `}</style>

      <div className="lg-scene">
        <div className="lg-card">

          {/* LEFT — Image Panel */}
          <div className="lg-left">
            <div className="lg-left-img" />
            <div className="lg-left-content">
              <div className="lg-logo-mark">
                <div className="lg-logo-icon">✦</div>
                <span className="lg-logo-name">OxyGold Admin</span>
              </div>
              <div>
                <div className="lg-tagline">Manage your<br /><em>gold catalog</em><br />seamlessly.</div>
                <div className="lg-left-desc">Admin portal for OxyGold physical gold and digital assets.</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Form Panel */}
          <div className="lg-right">

            {step === 'phone' && (
              <div className="lg-animate">
                <div className="lg-form-title">Admin Sign In</div>
                <div className="lg-form-sub">Sign in with your mobile number</div>

                <div className="lg-field">
                  <label className="lg-lbl">Mobile Number</label>
                  <div className="lg-phone-wrap">
                    <span className="lg-phone-prefix">+91</span>
                    <input
                      className="lg-phone-input"
                      type="number"
                      placeholder="98765 43210"
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
                  No admin account?{' '}
                  <button className="lg-link" onClick={() => navigate('/admin/register')}>Register</button>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="lg-animate">
                <div className="lg-form-title">Verify OTP</div>
                <div className="lg-form-sub">Code sent to your mobile</div>

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

                {error && <div className="lg-error">{error}</div>}

                <button
                  className="lg-btn"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join('').length < 6}
                >
                  {loading ? <span className="lg-spin" /> : 'Verify & Sign In →'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
