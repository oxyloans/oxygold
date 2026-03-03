import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/oxygoldlogo.png";

type LinkItem = { label: string; targetId: string };

const HEADER_OFFSET = 84;

const LandingHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  // Mobile hamburger
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ ONLY 5 links (no dropdown)
  const navLinks: LinkItem[] = useMemo(
    () => [
      { label: "Live gold rate", targetId: "live-rate" },
      { label: "AI book", targetId: "ai-book" },
      { label: "Buy gold coins", targetId: "buy-coins" },
      { label: "Design Own Jewellery", targetId: "design-jewellery" },
      { label: "About Us", targetId: "about" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.(".og-mobile-wrap")) setMobileOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const goTo = (targetId: string) => {
    setMobileOpen(false);

    // If you use /oxygold route, keep it. Otherwise remove it.
    const onLanding = location.pathname === "/" || location.pathname === "/oxygold";
    if (onLanding) {
      scrollToId(targetId);
      return;
    }

    navigate("/");
    requestAnimationFrame(() => setTimeout(() => scrollToId(targetId), 80));
  };

  return (
    <header style={{ ...styles.header, ...(scrolled ? styles.headerScrolled : {}) }}>
      <div style={styles.headerGlow} />

      <div style={styles.container}>
        <div style={styles.content}>
          {/* Logo */}
          <button onClick={() => goTo("top")} style={styles.logoBtn} aria-label="Go to top">
            <img src={Logo} alt="OxyGold Logo" style={styles.logoImg} />
          </button>

          {/* Desktop Nav */}
          <nav className="og-desktop-nav" style={styles.desktopNav} aria-label="Primary navigation">
            {navLinks.map((item) => (
              <button
                key={item.targetId}
                style={styles.navBtn}
                className="og-nav-btn"
                onClick={() => goTo(item.targetId)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <div className="og-mobile-wrap og-mobile-wrap" style={styles.mobileWrap}>
            <button
              style={styles.hamburger}
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span style={styles.hamLine} />
              <span style={styles.hamLine} />
              <span style={styles.hamLine} />
            </button>

            {mobileOpen && (
              <div style={styles.mobileMenu}>
                {navLinks.map((item) => (
                  <button
                    key={item.targetId}
                    onClick={() => goTo(item.targetId)}
                    style={styles.mobileItem}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
    background: "linear-gradient(180deg, #2B0A59 0%, #2B0A59 100%)",
    borderBottom: "3px solid rgba(212, 175, 55, 0.96)",
    transition: "all 0.2s ease",
  },
  headerScrolled: {
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
  },
  headerGlow: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    background:
      "radial-gradient(1200px 700px at 10% 10%, rgba(91, 46, 255, 0.14) 0%, transparent 62%), radial-gradient(900px 520px at 90% 18%, rgba(212, 175, 55, 0.08) 0%, transparent 62%)",
  },
  container: { maxWidth: "1400px", margin: "0 auto", padding: "0 18px" },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "72px",
    gap: "12px",
  },

  logoBtn: {
    display: "flex",
    alignItems: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  logoImg: { height: "72px", width: "170px", objectFit: "contain" },

  desktopNav: { display: "flex", alignItems: "center", gap: "10px" },

  navBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.06)",
    color: "rgba(255, 255, 255, 0.92)",
    whiteSpace: "nowrap",
  },

  mobileWrap: { display: "none", position: "relative" },
  hamburger: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },
  hamLine: {
    width: "18px",
    height: "2px",
    background: "rgba(255,255,255,0.92)",
    borderRadius: "2px",
  },

  mobileMenu: {
    position: "absolute",
    right: 0,
    top: "54px",
    width: "min(92vw, 360px)",
    background: "rgba(29, 9, 62, 0.98)",
    border: "1px solid rgba(212, 175, 55, 0.25)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
    borderRadius: "16px",
    padding: "10px",
  },

  mobileItem: {
    width: "100%",
    textAlign: "left",
    padding: "12px 12px",
    borderRadius: "12px",
    background: "rgba(245, 211, 108, 0.06)",
    border: "1px solid rgba(245, 211, 108, 0.18)",
    cursor: "pointer",
    color: "rgba(255,255,255,0.92)",
    fontSize: "14px",
    fontWeight: 800,
    marginBottom: "10px",
  },
};

const responsiveStyles = `
  .og-nav-btn:hover {
    background: rgba(245, 211, 108, 0.16) !important;
    border-color: rgba(245, 211, 108, 0.55) !important;
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(212, 175, 55, 0.15);
  }

  @media (max-width: 980px) {
    .og-desktop-nav { display: none !important; }
    .og-mobile-wrap { display: block !important; }
  }

  @media (max-width: 420px) {
    header img { width: 150px !important; }
  }
`;

export default LandingHeader;