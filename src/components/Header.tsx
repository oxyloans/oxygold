import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="header-container">
        <h1 className="logo" onClick={() => handleNavigate('/')}>
          <span className="logo-oxy">OXY</span>
          <span className="logo-gold">GOLD</span>
        </h1>
        
        <button 
          className="hamburger-menu" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <button 
            className={isActive('/') ? 'active' : ''} 
            onClick={() => handleNavigate('/')}
          >
            Home
          </button>
          <button 
            className={isActive('/how-it-works') ? 'active' : ''} 
            onClick={() => handleNavigate('/how-it-works')}
          >
            How It Works
          </button>
          <button 
            className={isActive('/buy-gold') ? 'active' : ''} 
            onClick={() => handleNavigate('/buy-gold')}
          >
            Buy Gold
          </button>
          <button 
            className={isActive('/portfolio') ? 'active' : ''} 
            onClick={() => handleNavigate('/portfolio')}
          >
            Portfolio
          </button>
          <button 
            className={isActive('/faq') ? 'active' : ''} 
            onClick={() => handleNavigate('/faq')}
          >
            FAQ
          </button>
          <button 
            className={`ai-button ${isActive('/oxygold-ai') ? 'active' : ''}`}
            onClick={() => handleNavigate('/oxygold-ai')}
          >
            OXYGOLD.AI
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
