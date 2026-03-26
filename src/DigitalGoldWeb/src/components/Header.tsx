import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { requireAuth } from '../utils/auth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    setUser(userData ? JSON.parse(userData) : null);
  }, [location]);

  const handleNavigate = (path: string) => {
    if ((path === '/buy-gold' || path === '/portfolio') && !user) {
      requireAuth(navigate, path);
      setIsMenuOpen(false);
      return;
    }
    navigate(path);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const compactPages = ['/buy-gold', '/sell-gold', '/portfolio', '/faq'];
  const isCompact = compactPages.includes(location.pathname);

  return (
    <>
      <style>{`
        .hdr {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(26, 48, 120, 0.96);
          border-bottom: 1px solid rgba(132, 128, 6, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .hdr-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
          height: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hdr.compact .hdr-inner {
          height: 50px;
          padding: 0 48px;
        }

        .hdr-logo {
          display: flex;
          align-items: baseline;
          cursor: pointer;
          user-select: none;
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .hdr.compact .hdr-logo {
          font-size: 1rem;
        }

        .hdr-logo-oxy { color: rgba(255,255,255,0.85); }
        .hdr-logo-gold {
          background: linear-gradient(120deg, #f0bb3a 0%, #d9a020 55%, #f0bb3a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 900;
          letter-spacing: 0.04em;
        }

        .hdr-nav {
          display: flex;
          align-items: center;
          gap: 1px;
        }

        .hdr-btn {
          padding: 6px 12px;
          border: none;
          background: transparent;
          border-radius: 5px;
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.58);
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .hdr-btn:hover {
          color: #f0bb3a;
          background: rgba(240,187,58,0.08);
        }
        .hdr-btn.active {
          color: #f0bb3a;
          background: rgba(240,187,58,0.12);
          font-weight: 600;
        }

        .hdr-div {
          width: 1px;
          height: 16px;
          background: rgba(240,187,58,0.18);
          margin: 0 5px;
          flex-shrink: 0;
        }
        .hdr-btn-ai {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 13px;
          border: 1px solid rgba(240,187,58,0.28);
          background: rgba(240,187,58,0.06);
          border-radius: 5px;
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #f0bb3a;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.04em;
        }
        .hdr-btn-ai:hover {
          border-color: rgba(240,187,58,0.55);
          background: rgba(240,187,58,0.12);
        }
        .hdr-btn-ai.active {
          background: linear-gradient(135deg, #d9a020, #f0bb3a);
          border-color: transparent;
          color: #0d1f3c;
}
        .ai-dot {
         width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
          animation: aidot 2s ease-in-out infinite;
        }
        @keyframes aidot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.65); }
        }

        .hdr-ham {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 34px; height: 34px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.18s;
        }
        .hdr-ham:hover { background: rgba(240,187,58,0.10); }
        .hdr-ham span {
          display: block; width: 100%; height: 1.5px;
          background: rgba(255,255,255,0.65);
          border-radius: 2px;
          transition: all 0.25s;
          transform-origin: center;
        }
        .hdr-ham.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hdr-ham.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hdr-ham.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        .hdr-mobile {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.22s;
          background: rgba(13, 31, 60, 0.98);
          border-top: 1px solid rgba(240,187,58,0.10);
        }
        .hdr-mobile.open { max-height: 420px; opacity: 1; }
        .hdr-mobile-inner {
          padding: 8px 20px 16px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .hdr-mbtn {
          width: 100%; text-align: left;
          padding: 9px 12px; border: none;
          background: transparent; border-radius: 6px;
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 0.84rem; font-weight: 500;
          color: rgba(255,255,255,0.55);
          cursor: pointer; transition: all 0.15s;
        }
        .hdr-mbtn:hover, .hdr-mbtn.active {
          background: rgba(240,187,58,0.10);
          color: #f0bb3a;
        }
        .hdr-mbtn-ai {
          margin-top: 5px;
          border: 1px solid rgba(240,187,58,0.28) !important;
          background: rgba(240,187,58,0.06) !important;
          color: #f0bb3a !important;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .hdr-btn-signup {
          padding: 6px 14px;
          background: linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%);
          color: #0d1f3c;
          border: none;
          border-radius: 5px;
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(240,187,58,0.28);
          margin-left: 12px;
        }
        .hdr-btn-signup:hover {
          filter: brightness(1.06);
          box-shadow: 0 4px 16px rgba(240,187,58,0.38);
          transform: translateY(-1px);
        }

        .hdr-btn-logout {
          padding: 6px 14px;
          background: transparent;
          border: 1px solid rgba(240,187,58,0.28);
          border-radius: 5px;
          font-family: 'Sora', 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.65);
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          margin-left: 12px;
        }
        .hdr-btn-logout:hover {
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
          background: rgba(240,187,58,0.06);
        }

        @media (max-width: 768px) {
          .hdr-nav { display: none; }
          .hdr-ham { display: flex; }
          .hdr-inner { padding: 0 20px; }
          .hdr-btn-signup { display: none; }
          .hdr-btn-logout { display: none; }
        }
      `}</style>

      <header className={`hdr${isCompact ? ' compact' : ''}`}>
        <div className="hdr-inner">
          <div className="hdr-logo" onClick={() => handleNavigate('/')}>
            <span className="hdr-logo-oxy">OXY</span>
            <span className="hdr-logo-gold">GOLD</span>
          </div>

          <button
            className={`hdr-ham${isMenuOpen ? ' open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

          <nav className="hdr-nav">
            {[
              { label: 'Home',         path: '/' },
              { label: 'How It Works', path: '/how-it-works' },
              ...(user ? [{ label: 'Buy Gold',     path: '/buy-gold' }] : []),
              ...(user ? [{ label: 'Portfolio',    path: '/portfolio' }] : []),
              { label: 'FAQ',          path: '/faq' },
            ].map(({ label, path }) => (
              <button
                key={path}
                className={`hdr-btn${isActive(path) ? ' active' : ''}`}
                onClick={() => handleNavigate(path)}
              >
                {label}
              </button>
            ))}

            <span className="hdr-div" />

            <button
              className={`hdr-btn-ai${isActive('/oxygold-ai') ? ' active' : ''}`}
              onClick={() => handleNavigate('/oxygold-ai')}
            >
              <span className="ai-dot" />
              OXYGOLD.AI
            </button>

            {user ? (
              <button className="hdr-btn-logout" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button className="hdr-btn-signup" onClick={() => handleNavigate('/Login')}>
                Sign Up
              </button>
            )}
          </nav>
        </div>

        <div className={`hdr-mobile${isMenuOpen ? ' open' : ''}`}>
          <div className="hdr-mobile-inner">
            {[
              { label: 'Home',         path: '/' },
              { label: 'How It Works', path: '/how-it-works' },
              ...(user ? [{ label: 'Buy Gold',     path: '/buy-gold' }] : []),
              ...(user ? [{ label: 'Portfolio',    path: '/portfolio' }] : []),
              { label: 'FAQ',          path: '/faq' },
            ].map(({ label, path }) => (
              <button
                key={path}
                className={`hdr-mbtn${isActive(path) ? ' active' : ''}`}
                onClick={() => handleNavigate(path)}
              >
                {label}
              </button>
            ))}
            <button
              className={`hdr-mbtn hdr-mbtn-ai${isActive('/oxygold-ai') ? ' active' : ''}`}
              onClick={() => handleNavigate('/oxygold-ai')}
            >
              ● OXYGOLD.AI
            </button>
            
            {/* Mobile Auth Buttons */}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(240,187,58,0.15)' }}>
              {user ? (
                <button 
                  className="hdr-mbtn" 
                  onClick={handleLogout}
                  style={{ color: 'rgba(255,255,255,0.65)', fontWeight: '600' }}
                >
                  Logout
                </button>
              ) : (
                <button 
                  className="hdr-mbtn hdr-mbtn-ai" 
                  onClick={() => handleNavigate('/Login')}
                  style={{ 
                    background: 'linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%) !important',
                    color: '#0d1f3c !important',
                    fontWeight: '700',
                    border: 'none !important'
                  }}
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;