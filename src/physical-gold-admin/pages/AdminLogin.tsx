import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../services/adminService';
import adminGoldBg from '../../assets/admin_gold_bg.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await adminService.adminLogin(email, password);
      const token = data?.token || data?.data?.token || data?.result?.token || data?.accessToken || data?.data?.accessToken || '';
      localStorage.setItem('admin', JSON.stringify({ email, isLoggedIn: true, token, role: 'admin', ...data }));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          background-image:
            linear-gradient(to bottom, rgba(8,6,2,0.45) 0%, rgba(8,6,2,0.2) 40%, rgba(8,6,2,0.7) 100%),
            url('${adminGoldBg}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
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

        .lg-input {
          width: 100%;
          padding: 10px 13px;
          border: 1.5px solid #ede9e2;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: #12100a;
          background: #faf8f5;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .lg-input:focus {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .lg-input::placeholder { color: #d0cabc; }

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
          margin: 20px 0;
        }
        .lg-divider-line { flex: 1; height: 1px; background: #ede9e2; }
        .lg-divider-txt { font-size: 0.65rem; color: #d0cabc; }

        .lg-footer {
          margin-top: 16px;
          text-align: center;
          font-size: 0.72rem;
          color: #b8b0a4;
          font-weight: 300;
        }
        .lg-link {
          color: #c9993a;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.14s;
        }
        .lg-link:hover { color: #a37828; }

        .lg-security-note {
          margin-top: 16px;
          padding: 10px 12px;
          background: #fffbf0;
          border: 1px solid #f0e5c9;
          border-radius: 8px;
          font-size: 0.7rem;
          color: #7a6b4e;
          line-height: 1.5;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        .lg-security-icon {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          color: #c9993a;
          margin-top: 1px;
        }

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
            <div className="lg-animate">
              <div className="lg-form-title">Admin Sign In</div>
              <div className="lg-form-sub">Sign in with your email and password</div>

              <div className="lg-field">
                <label className="lg-lbl">Email Address</label>
                <input
                  className="lg-input"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div className="lg-field">
                <label className="lg-lbl">Password</label>
                <input
                  className="lg-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              {error && <div className="lg-error">{error}</div>}

              <button className="lg-btn" onClick={handleLogin} disabled={loading}>
                {loading ? <span className="lg-spin" /> : 'Sign In →'}
              </button>

              <div className="lg-security-note">
                <svg className="lg-security-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <strong>Security Notice:</strong> After 5 failed login attempts, your account will be temporarily locked for 30 minutes to protect against unauthorized access.
                </div>
              </div>

              <div className="lg-footer">
                Secure admin access only
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
