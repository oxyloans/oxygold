import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/oxygoldlogo.png";
import SubscribeLivePrice from "../components/SubscribeLivePrice";
import { IoMdMenu } from "react-icons/io";
type LinkItem = { label: string; targetId: string };

type Props = {
  offsetPx?: number;
};

const NAV_LINKS: LinkItem[] = [
  { label: "Live Gold Rate", targetId: "live-rate" },
  { label: "Buy Silver Coins", targetId: "buy-silver" },
  { label: "Buy Gold Coins", targetId: "buy-gold" },
  { label: "Design Own Jewellery", targetId: "design-jewellery" },
  { label: "About Us", targetId: "about" },
];

const LandingHeader: React.FC<Props> = ({ offsetPx = 106 }) => {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close sidebar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offsetPx;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const goTo = (targetId: string) => {
    setSidebarOpen(false);
    if (targetId === "buy-silver" || targetId === "buy-gold") {
      window.location.href = "/login";
      return;
    }
    if (targetId === "login") {
      navigate("/login");
      return;
    }
    const onLanding = location.pathname === "/" || location.pathname === "/oxygold";
    if (onLanding) {
      scrollToId(targetId);
      return;
    }
    navigate("/");
    requestAnimationFrame(() => setTimeout(() => scrollToId(targetId), 80));
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          zIndex: 60,
          width: "100%",
          height: "72px",
          background: "linear-gradient(180deg, #2B0A59 0%, #2B0A59 100%)",
          borderBottom: "3px solid rgba(212, 175, 55, 0.96)",
          transition: "box-shadow 0.2s ease",
          boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.25)" : "none",
        }}
      >
        {/* Glow */}
        <div style={{
          position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none",
          background: "radial-gradient(1200px 700px at 10% 10%, rgba(91,46,255,0.14) 0%, transparent 62%), radial-gradient(900px 520px at 90% 18%, rgba(212,175,55,0.08) 0%, transparent 62%)",
        }} />

        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 18px", height: "100%" }}>
          <div className="og-header-row" style={{ display: "flex", alignItems: "center", height: "100%", gap: "12px" }}>

            {/* ── Mobile: Hamburger LEFT ── */}
            <button
              className="og-hamburger-btn flex lg:hidden"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((v) => !v)}
              style={{
                width: "42px",
                height: "42px",
                display: "none",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: sidebarOpen ? "rgba(245,211,108,0.14)" : "rgba(255,255,255,0.06)",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              {sidebarOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line x1="2" y1="2" x2="16" y2="16" stroke="rgba(255,255,255,0.92)" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="16" y1="2" x2="2" y2="16" stroke="rgba(255,255,255,0.92)" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              ) : (
                <IoMdMenu size={22} color="rgba(255,255,255,0.92)" />
              )}
            </button>

            {/* Logo */}
            <button
              className="og-header-brand"
              onClick={() => goTo("top")}
              aria-label="Go to top"
              style={{ display: "flex", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
            >
              <img src={Logo} alt="OxyGold Logo" style={{ height: "72px", width: "170px", objectFit: "contain" }} />
            </button>

            {/* ── Desktop Nav (center) ── */}
            <nav className="og-desktop-nav hidden lg:flex" aria-label="Primary navigation"
              style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, justifyContent: "center" }}
            >
              {NAV_LINKS.map((item) => (
                <button
                  key={item.targetId}
                  className="og-nav-btn"
                  onClick={() => goTo(item.targetId)}
                  style={{
                    padding: "9px 13px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: "1px solid rgba(255,255,255,0.10)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.90)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right: Subscribe + Login */}
            <div className="og-header-actions" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <div className="og-subscribe-wrapper og-subscribe-desktop hidden lg:flex" style={{ alignItems: "center" }}>
                <SubscribeLivePrice />
              </div>
              <div className="og-subscribe-wrapper og-subscribe-mobile flex lg:hidden" style={{ alignItems: "center" }}>
                <SubscribeLivePrice iconOnly />
              </div>
              <button
                className="og-login-btn og-desktop-login hidden lg:flex"
                onClick={() => goTo("login")}
                style={{
                  height: "42px",
                  minHeight: "42px",
                  padding: "0 18px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background: "linear-gradient(90deg, #f0bb3a 0%, #d9a020 100%)",
                  color: "#0d1f3c",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(240,187,58,0.3)",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                Login
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Sidebar Overlay ── */}
      <div
        className="og-sidebar-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 70,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
      />

      {/* ── Sidebar Drawer ── */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 80,
          height: "100dvh",
          width: "min(82vw, 300px)",
          background: "linear-gradient(160deg, #1d093e 0%, #2B0A59 60%, #1a0840 100%)",
          borderRight: "1px solid rgba(212,175,55,0.25)",
          boxShadow: sidebarOpen ? "6px 0 40px rgba(0,0,0,0.45)" : "none",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 16px 12px",
          borderBottom: "1px solid rgba(212,175,55,0.15)",
        }}>
          <img src={Logo} alt="OxyGold" style={{ height: "52px", width: "130px", objectFit: "contain" }} />
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            style={{
              width: "36px", height: "36px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="2" x2="14" y2="14" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="2" x2="2" y2="14" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: "16px 12px", flex: 1 }} aria-label="Mobile navigation">
          {/* <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(212,175,55,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px", paddingLeft: "8px" }}>
            Navigation
          </p> */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {NAV_LINKS.map((item, i) => (
              <button
                key={item.targetId}
                onClick={() => goTo(item.targetId)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "13px 14px",
                  borderRadius: "12px",
                  background: "rgba(245,211,108,0.05)",
                  border: "1px solid rgba(245,211,108,0.12)",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.90)",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "10px",
                  transition: "all 0.18s ease",
                }}
                className="og-sidebar-item"
              >
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: `hsl(${40 + i * 12}, 80%, 60%)`,
                  flexShrink: 0,
                }} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer: Subscribe + Login */}
        <div style={{
          padding: "16px 12px 24px",
          borderTop: "1px solid rgba(212,175,55,0.15)",
          display: "flex", flexDirection: "column", gap: "10px",
        }}>
          <div style={{ width: "100%" }}>
            <SubscribeLivePrice />
          </div>
          <button
            onClick={() => goTo("login")}
            style={{
              width: "100%", padding: "13px",
              borderRadius: "12px",
              fontSize: "15px", fontWeight: 800,
              border: "none", cursor: "pointer",
              background: "linear-gradient(90deg, #f0bb3a 0%, #d9a020 100%)",
              color: "#0d1f3c",
              boxShadow: "0 4px 18px rgba(240,187,58,0.35)",
              transition: "all 0.2s ease",
            }}
            className="og-sidebar-login"
          >
            Login
          </button>
        </div>
      </div>

      <style>{`
        .og-nav-btn:hover {
          background: rgba(245,211,108,0.14) !important;
          border-color: rgba(245,211,108,0.5) !important;
          transform: translateY(-1px);
          color: #f5d36c !important;
        }
        .og-desktop-login:hover {
          background: linear-gradient(90deg, #f6cc50 0%, #e8920a 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(240,187,58,0.45) !important;
        }
        .og-sidebar-item:hover {
          background: rgba(245,211,108,0.12) !important;
          border-color: rgba(245,211,108,0.35) !important;
          color: #f5d36c !important;
          transform: translateX(3px);
        }
        .og-sidebar-login:hover {
          background: linear-gradient(90deg, #f6cc50 0%, #e8920a 100%) !important;
          box-shadow: 0 6px 22px rgba(240,187,58,0.5) !important;
        }
        .og-header-brand { margin-right: 0; }
        .og-login-btn { display: flex !important; }
        @media (max-width: 980px) {
          .og-header-row {
            gap: 8px;
            width: 100%;
          }
          .og-header-brand {
            flex: 1 1 auto;
            justify-content: center;
            min-width: 0;
            margin-right: 0;
          }
          .og-header-brand img {
            width: min(42vw, 160px) !important;
            height: auto !important;
          }
          .og-header-actions {
            margin-left: 0;
            gap: 8px;
          }
          .og-login-btn {
            height: 38px !important;
            min-height: 38px !important;
            padding: 0 12px !important;
            font-size: 12px !important;
            min-width: 64px !important;
            justify-content: center !important;
            white-space: nowrap !important;
            letter-spacing: 0.01em !important;
          }
          .og-desktop-nav { display: none !important; }
          .og-desktop-login { display: flex !important; }
          .og-hamburger-btn { display: flex !important; }
          .og-subscribe-desktop { display: none !important; }
          .og-subscribe-mobile { display: flex !important; }
          .og-subscribe-mobile button {
            padding: 8px 10px !important;
            min-width: 0 !important;
          }
        }
        @media (max-width: 400px) {
          .og-header-brand img { width: 120px !important; }
          .og-header-row { padding: 0 2px; }
          .og-login-btn {
            height: 36px !important;
            min-height: 36px !important;
            padding: 0 10px !important;
            font-size: 11px !important;
            min-width: 58px !important;
          }
        }
      `}</style>
    </>
  );
};

export default LandingHeader;
