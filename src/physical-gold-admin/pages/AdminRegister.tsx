import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../services/adminService';

const AdminRegister = () => {
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
        userType: 'Register',
        userRole: 'admin',
        whatsappNumber: '',
      });
      setSessionId(
        data?.mobileOtpSessionId ||
        data?.data?.mobileOtpSessionId ||
        data?.result?.mobileOtpSessionId || ''
      );
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
        userType: 'Register',
        mobileOtpSessionId: sessionId,
        mobileOtpValue: otpValue,
        userRole: "admin",
        whatsappNumber: ''
      });

      const token =
        data?.token ||
        data?.data?.token ||
        data?.result?.token ||
        data?.accessToken ||
        data?.data?.accessToken || '';

      localStorage.setItem('admin', JSON.stringify({ phone, isLoggedIn: true, token, role: 'admin', ...data }));

      try {
        await adminService.createRole('admin');
      } catch (roleErr) {
        console.error("Role creation failed:", roleErr);
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
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
  const handleResend = () => { setOtp(['', '', '', '', '', '']); setError(''); handleSendOtp(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-scene {
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
        .rg-card {
          display: grid;
          grid-template-columns: 340px 320px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.10),
            0 32px 64px rgba(0,0,0,0.08);
        }

        /* LEFT PANEL — Image side */
        .rg-left {
          position: relative;
          overflow: hidden;
          background: #1a1208;
        }
        .rg-left-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(8,6,2,0.72) 0%, rgba(8,6,2,0.45) 40%, rgba(8,6,2,0.82) 100%),
            url('https://images.unsplash.com/photo-1624365168968-f283d506c6b6?w=700&q=80') center/cover no-repeat;
        }
        .rg-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 32px;
        }
        .rg-logo-mark {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rg-logo-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #d4a843, #f0c96e);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .rg-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.04em;
        }
        .rg-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.95rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .rg-tagline em {
          color: #f0c96e;
          font-style: normal;
        }
        .rg-left-desc {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          margin-bottom: 24px;
        }

        /* RIGHT PANEL — Form side */
        .rg-right {
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 36px;
        }

        .rg-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: #12100a;
          margin-bottom: 3px;
          letter-spacing: -0.01em;
        }
        .rg-form-sub {
          font-size: 0.75rem;
          color: #b8b0a4;
          margin-bottom: 24px;
          font-weight: 300;
        }

        .rg-field { margin-bottom: 14px; }
        .rg-lbl {
          display: block;
          font-size: 0.65rem;
          font-weight: 600;
          color: #b8b0a4;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .rg-phone-wrap {
          display: flex;
          align-items: center;
          border: 1.5px solid #ede9e2;
          border-radius: 10px;
          overflow: hidden;
          background: #faf8f5;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .rg-phone-wrap:focus-within {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .rg-phone-prefix {
          padding: 10px 12px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #888;
          border-right: 1.5px solid #ede9e2;
          background: #f5f1eb;
          flex-shrink: 0;
        }
        .rg-phone-input {
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
        .rg-phone-input::-webkit-outer-spin-button,
        .rg-phone-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .rg-phone-input::placeholder { color: #d0cabc; }

        /* OTP */
        .rg-otp-row {
          display: flex;
          gap: 7px;
          margin-bottom: 8px;
          width: 100%;
        }
        .rg-otp-box {
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
        .rg-otp-box::-webkit-outer-spin-button,
        .rg-otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }
        .rg-otp-box:focus {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .rg-otp-box.filled {
          border-color: #c9993a;
          background: #fdf8ee;
        }

        .rg-otp-hint {
          font-size: 0.7rem;
          color: #b8b0a4;
          margin-top: 8px;
          margin-bottom: 14px;
          font-weight: 300;
        }
        .rg-otp-hint span { font-weight: 600; color: #12100a; }
        .rg-resend-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: inherit;
          color: #c9993a;
          font-weight: 600;
          transition: color 0.14s;
        }
        .rg-resend-btn:disabled { color: #d0cabc; cursor: default; }
        .rg-resend-btn:not(:disabled):hover { color: #a37828; }

        .rg-change-phone {
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
        .rg-change-phone:hover { color: #555; background: #ede9e2; }

        .rg-error {
          font-size: 0.72rem;
          color: #b94040;
          padding: 8px 11px;
          border-radius: 8px;
          background: #fdf4f4;
          border: 1px solid rgba(185,64,64,0.14);
          margin-bottom: 12px;
        }

        .rg-btn {
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
        .rg-btn:hover:not(:disabled) { opacity: 0.9; }
        .rg-btn:active:not(:disabled) { transform: scale(0.99); }
        .rg-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        .rg-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 0 0;
        }
        .rg-divider-line { flex: 1; height: 1px; background: #ede9e2; }
        .rg-divider-txt { font-size: 0.65rem; color: #d0cabc; }

        .rg-footer {
          margin-top: 12px;
          text-align: center;
          font-size: 0.75rem;
          color: #b8b0a4;
          font-weight: 300;
        }
        .rg-link {
          color: #c9993a;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: inherit;
          transition: color 0.14s;
        }
        .rg-link:hover { color: #a37828; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .rg-spin {
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
        .rg-animate { animation: slideIn 0.25s ease both; }

        @media (max-width: 720px) {
          .rg-card { grid-template-columns: 1fr; max-width: 340px; }
          .rg-left { display: none; }
          .rg-right { padding: 36px 28px; }
        }
      `}</style>

      <div className="rg-scene">
        <div className="rg-card">

          {/* LEFT — Image Panel */}
          <div className="rg-left">
            <div className="rg-left-img" />
            <div className="rg-left-content">
              <div className="rg-logo-mark">
                <div className="rg-logo-icon">✦</div>
                <span className="rg-logo-name">OxyGold Admin</span>
              </div>
              <div className="rg-left-bottom">
                <div className="rg-tagline">Join the<br /><em>Admin team,</em><br />digitally.</div>
                <div className="rg-left-desc">Register as an administrator to manage the OxyGold platform.</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Form Panel */}
          <div className="rg-right">

            {/* STEP 1 — Phone */}
            {step === 'phone' && (
              <div className="rg-animate">
                <div className="rg-form-title">Create Admin account</div>
                <div className="rg-form-sub">Enter your mobile to get started</div>

                <div className="rg-field">
                  <label className="rg-lbl">Mobile Number</label>
                  <div className="rg-phone-wrap">
                    <span className="rg-phone-prefix">+91</span>
                    <input
                      className="rg-phone-input"
                      type="number"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.slice(0, 10)); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>
                </div>

                {error && <div className="rg-error">{error}</div>}

                <button className="rg-btn" onClick={handleSendOtp} disabled={loading}>
                  {loading ? <span className="rg-spin" /> : 'Send OTP →'}
                </button>

                <div className="rg-divider">
                  <div className="rg-divider-line" />
                  <span className="rg-divider-txt">OR</span>
                  <div className="rg-divider-line" />
                </div>
                <div className="rg-footer">
                  Already an admin?{' '}
                  <button className="rg-link" onClick={() => navigate('/admin/login')}>Sign in</button>
                </div>
              </div>
            )}

            {/* STEP 2 — OTP */}
            {step === 'otp' && (
              <div className="rg-animate">
                <div className="rg-form-title">Verify OTP</div>
                <div className="rg-form-sub">Code sent to your mobile</div>

                <button className="rg-change-phone" onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}>
                  ← +91 {phone}
                </button>

                <div className="rg-field">
                  <label className="rg-lbl">Enter 6-digit OTP</label>
                  <div className="rg-otp-row" onPaste={handleOtpPaste}>
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        className={`rg-otp-box ${d ? 'filled' : ''}`}
                        type="number"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value.slice(-1))}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                      />
                    ))}
                  </div>
                  <div className="rg-otp-hint">
                    Didn't receive it?{' '}
                    {resendTimer > 0
                      ? <>Resend in <span>{resendTimer}s</span></>
                      : <button className="rg-resend-btn" onClick={handleResend}>Resend OTP</button>
                    }
                  </div>
                </div>

                {error && <div className="rg-error">{error}</div>}

                <button
                  className="rg-btn"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join('').length < 6}
                >
                  {loading ? <span className="rg-spin" /> : 'Verify & Continue →'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminRegister;
