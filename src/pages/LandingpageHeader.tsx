import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/oxygoldlogo.png";

type NavItem = { label: string; path: string; primary?: boolean };

const LandingHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: "DIGITAL GOLD", path: "/buy-gold", primary: true },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerGlow} />

      <div style={styles.container}>
        <div style={styles.content}>
          {/* Logo */}
          <div style={styles.logo}>
            <img src={Logo} alt="OxyGold Logo" style={styles.logoImg} />
          </div>

          {/* Nav */}
          {/* <nav style={styles.nav}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                style={item.primary ? styles.btnPrimary : styles.btn}
                className="nav-btn"
              >
                {item.label}
              </button>
            ))}
          </nav> */}
        </div>
      </div>

      <style>{responsiveStyles}</style>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "fixed",
    top: 0,
    zIndex: 50,
    width: "100%",
    background:
      "linear-gradient(180deg, #2B0A59 0%, #2B0A59 0%, #2B0A59 100%)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    borderBottom: "3px solid rgba(212, 175, 55, 0.96)",
  },
  headerGlow: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    background:
      "radial-gradient(1200px 700px at 10% 10%, rgba(91, 46, 255, 0.14) 0%, transparent 62%), radial-gradient(900px 520px at 90% 18%, rgba(212, 175, 55, 0.08) 0%, transparent 62%)",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
   
  },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
  },
  logoImg: {
    height: "220px",
    width: "200px",
    objectFit: "contain",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  btn: {
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.05)",
    color: "rgba(255, 255, 255, 0.8)",
  },
  btnPrimary: {
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "#D4AF37",
    color: "#2B0A59",
  },
};

const responsiveStyles = `
  .nav-btn:hover {
    background: #F5D36C !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
  }

  @media (max-width: 640px) {
    header > div {
      padding: 0 16px !important;
    }
    header > div > div {
      height: 56px !important;
    }
    header img {
      height: 160px !important;
      width: 200px !important;
    }
    .nav-btn {
      padding: 8px 16px !important;
      font-size: 13px !important;
    }
  }
`;

export default LandingHeader;
