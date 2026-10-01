import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import ibjaPartner from "../assets/IBJApartner.png";

export default function IBJAPartnerSection() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowModal(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);
  const section = (
    <section className="ibja-section">
      <div style={styles.container} className="ibja-container">
        <div style={styles.card} className="ibja-card">
          <div style={styles.inner} className="ibja-inner">
            <div style={styles.grid} className="ibja-grid">
              {/* LEFT: Image */}
              <div style={styles.left} className="ibja-left">
                <img
                  src={ibjaPartner}
                  alt="IBJA Platinum Partner - OXYGOLD.AI"
                  style={styles.image}
                  className="ibja-image"
                />
              </div>

              {/* RIGHT: Content */}
              <div style={styles.right} className="ibja-right">
                <h2 style={styles.title}>
                  <span style={styles.goldText}>IBJA </span> • Platinum Partner
                </h2>
                <p style={styles.subtitle}>
                  Aligning our digital gold ecosystem with India’s most
                  respected bullion authority.
                </p>

                <p style={styles.description}>
                  OXYGOLD.AI is proud to be an IBJA Platinum Partner, aligning
                  our digital gold ecosystem with India’s most respected bullion
                  authority.
                </p>

                <p style={styles.description}>
                  Our pricing intelligence, transparency framework, and
                  compliance standards are powered by IBJA benchmark data —
                  ensuring trust, authenticity, and market integrity.
                </p>

                <div style={styles.listCard}>
                  <div style={styles.listTitle}>
                    As a Platinum Partner, OXYGOLD.AI operates at the
                    intersection of:
                  </div>
                  <ul style={styles.list}>
                    <li style={styles.listItem}>Real-time benchmark pricing</li>
                    <li style={styles.listItem}>Gold market intelligence</li>
                  </ul>
                </div>

                <div className="ibja-certificate-action">
                  <button
                    type="button"
                    className="ctaBtn ibja-cta"
                    onClick={() => setShowModal(true)}
                    aria-haspopup="dialog"
                  >
                    <span className="ibja-cta-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M7 3.75h7.2L18.25 7.8V20.25H7V3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                        <path d="M14 3.9V8h4.05" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                        <path d="m9.75 13.1 1.55 1.55 3.15-3.35" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>View Certificate</span>
                    <span className="ibja-cta-arrow" aria-hidden="true">→</span>
                  </button>
               
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{responsiveStyles}</style>
    </section>
  );

  /* ─── Modal via Portal → renders into document.body, above ALL page elements ─── */
  const modalNode = showModal
    ? ReactDOM.createPortal(
        <div
          className="modalOverlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="modalContent"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ibja-certificate-modal-title"
          >
            {/* ── Header with X always pinned at top ── */}
            <div className="modalHeader">
              <div className="modalHeaderText">
                <span className="modalEyebrow">OXYGOLD.AI</span>
                <h3 id="ibja-certificate-modal-title" className="modalTitle">
                 Certificate of Membership
                </h3>
              </div>
              <button
                type="button"
                className="modalCloseBtn"
                onClick={() => setShowModal(false)}
                aria-label="Close certificates viewer"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* ── iframe fills remaining space ── */}
            <div className="modalIframeWrap">
              <iframe
                title="OXYGOLD.AI Gold Certificate"
                src="https://drive.google.com/file/d/1JXREXS8gMcjc292mMj043yDRG1ohzya8/preview"
                className="driveIframe"
                loading="lazy"
                allow="autoplay"
                allowFullScreen
              />

              {/* Covers Google Drive's built-in "Pop out" control.
                  The iframe is cross-origin, so its internal toolbar cannot be styled directly. */}
              <div className="drivePopoutCover" aria-hidden="true" />
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {section}
      {modalNode}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    boxSizing: "border-box",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0",
  },

  card: {
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 32px rgba(8,2,24,0.20)",
    backdropFilter: "blur(14px)",
  },

  inner: {
    padding: "32px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "0.95fr 1.05fr",
    gap: "48px",
    alignItems: "center",
  },

  left: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 0,
  },

  // ✅ clean image (no rounded, no shadow) — you can add back if you want
  image: {
    width: "100%",
    maxWidth: "520px",
    height: "auto",
    objectFit: "contain",
    display: "block",
  },

  right: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    marginBottom: "14px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: 900,
    color: "#FFFFFF",
    letterSpacing: "0.2px",
  },

  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    boxShadow: "0 0 0 3px rgba(212,175,55,0.16)",
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "9px 14px",
    border: "1px solid rgba(212,175,55,0.35)",
    background: "rgba(212,175,55,0.10)",
  },

  pillText: {
    color: "#F5D36C",
    fontWeight: 900,
    fontSize: "13px",
    letterSpacing: "0.2px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(24px, 3.2vw, 42px)",
    lineHeight: 1.2,
    color: "#FFFFFF",
    fontWeight: 900,
    letterSpacing: "0.2px",
  },

  goldText: {
    color: "#D4AF37",
  },

  subtitle: {
    margin: "10px 0 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "clamp(14px, 2vw, 16px)",
    fontWeight: 750,
    lineHeight: 1.5,
  },

  description: {
    marginTop: "14px",
    color: "rgba(255,255,255,0.88)",
    lineHeight: 1.75,
    fontSize: "clamp(14px, 1.8vw, 15px)",
  },

  listCard: {
    marginTop: "16px",
    borderRadius: "16px",
    border: "1px solid rgba(212,175,55,0.28)",
    background:
      "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(245,211,108,0.06) 100%)",
    padding: "14px 14px",
  },

  listTitle: {
    color: "#F5D36C",
    fontWeight: 900,
    fontSize: "14px",
    marginBottom: "10px",
    lineHeight: 1.4,
  },

  list: {
    margin: 0,
    paddingLeft: "18px",
    color: "rgba(255,255,255,0.90)",
  },

  listItem: {
    marginBottom: "8px",
    lineHeight: 1.5,
    fontSize: "14px",
  },

  ctaRow: {
    marginTop: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },

  ctaBtn: {
    padding: "14px 20px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    color: "#2B0A59",
    fontWeight: 900,
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.25s",
  },

  note: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "13px",
    fontWeight: 750,
  },
  modalOverlay: {},
  modalContent: {},
  modalCloseBtn: {}
};

const responsiveStyles = `
  .ibja-certificate-action{
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .ibja-cta{
    display: inline-flex;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    gap: 10px;
    max-width: 100%;
    padding: 12px 17px;
    border: 1px solid rgba(245,211,108,0.58);
    border-radius: 12px;
    background: #D4AF37;
    color: #271041;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    line-height: 1.25;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(0,0,0,0.16);
    transition:
      transform 180ms ease,
      background 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  .ibja-cta:hover{
    transform: translateY(-1px);
    background: #E0BD48;
    border-color: rgba(255,229,135,0.82);
    box-shadow: 0 10px 24px rgba(0,0,0,0.20);
  }

  .ibja-cta:active{
    transform: translateY(0) scale(0.99);
  }

  .ibja-cta:focus-visible,
  .modalCloseBtn:focus-visible{
    outline: 3px solid rgba(245,211,108,0.38);
    outline-offset: 3px;
  }

  .ibja-cta-icon{
    display: inline-flex;
    width: 21px;
    height: 21px;
    flex: 0 0 21px;
    align-items: center;
    justify-content: center;
  }

  .ibja-cta-icon svg{
    width: 21px;
    height: 21px;
  }

  .ibja-cta-arrow{
    font-size: 17px;
    line-height: 1;
    transition: transform 180ms ease;
  }

  .ibja-cta:hover .ibja-cta-arrow{
    transform: translateX(2px);
  }

  .ibja-certificate-note{
    margin: 0;
    color: rgba(255,255,255,0.62);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.5;
  }

  .modalOverlay{
    position: fixed !important;
    inset: 0 !important;
    z-index: 2147483000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(9, 5, 18, 0.78);
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);
    isolation: isolate;
  }

  .modalContent{
    position: relative;
    display: flex;
    width: min(1120px, 96vw);
    /* use dvh so browser chrome is excluded; min 400px so it never collapses */
    height: min(86dvh, 820px);
    max-height: calc(100dvh - 40px);
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 30px 90px rgba(0,0,0,0.48);
  }

  .modalHeader{
    display: flex;
    min-height: 60px;
    /* never grow/shrink — always fixed at top */
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px 12px 20px;
    border-bottom: 1px solid #E9E5DE;
    background: #ffffff;
    /* stick header to top so X is always visible */
    position: relative;
    z-index: 50;
  }

  .modalHeaderText{
    min-width: 0;
  }

  .modalEyebrow{
    display: block;
    margin-bottom: 3px;
    color: #A27E1A;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .modalTitle{
    margin: 0;
    overflow: hidden;
    color: #1F2937;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .modalCloseBtn{
    display: inline-flex;
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    background: #F8FAFC;
    color: #475569;
    cursor: pointer;
    /* always visible — no position:absolute */
    position: static;
    transition:
      background 160ms ease,
      color 160ms ease,
      transform 160ms ease;
    /* ensure it never shrinks or hides */
    flex-shrink: 0;
    z-index: 10;
  }

  .modalCloseBtn svg{
    width: 18px;
    height: 18px;
    pointer-events: none;
  }

  .modalCloseBtn:hover{
    background: #FEF3C7;
    color: #111827;
    border-color: #D4AF37;
    transform: scale(1.06);
  }

  .modalCloseBtn:active{
    transform: scale(0.97);
  }

  .modalIframeWrap{
    position: relative;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
    background: #F4F4F5;
  }

  .driveIframe{
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: #ffffff;
  }

  /* Hide Google Drive viewer's built-in top-right Pop out button.
     This overlay sits above only that control and leaves the scrollbar usable. */
  .drivePopoutCover{
    position: absolute;
    top: 8px;
    right: 18px;
    width: 58px;
    height: 58px;
    z-index: 8;
    background: #202124;
    pointer-events: auto;
  }

  /* ── Tablet (641px – 980px) ── */
  @media (max-width: 980px){
    .ibja-container{
      padding: 28px 0 !important;
    }

    .ibja-grid{
      grid-template-columns: 1fr !important;
      gap: 28px !important;
    }

    .ibja-inner{
      padding: 32px !important;
    }

    .ibja-left{
      justify-content: center !important;
    }

    .ibja-image{
      max-width: 100% !important;
    }

    .modalOverlay{
      padding: 16px;
      align-items: center;
    }

    .modalContent{
      width: min(900px, 100%);
      height: clamp(360px, 86dvh, 860px);
      max-height: calc(100dvh - 32px);
      border-radius: 16px;
    }

    .modalHeader{
      padding: 10px 12px 10px 16px;
      min-height: 58px;
    }

    /* close btn clearly visible on tablet */
    .modalCloseBtn{
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }
  }

  /* ── Mobile (≤ 640px) ── */
  @media (max-width: 640px){
    .ibja-container{
      padding: 20px 0 !important;
    }

    .ibja-inner{
      padding: 16px !important;
    }

    .ibja-card{
      border-radius: 18px !important;
    }

    .ibja-grid{
      gap: 22px !important;
    }

    .ibja-certificate-action{
      align-items: stretch;
      margin-top: 16px;
    }

    .ibja-cta{
      width: 100%;
      min-height: 48px;
      padding: 12px 14px;
      font-size: 12px;
    }

    .ibja-certificate-note{
      text-align: center;
    }

    /* full-screen modal on mobile */
    .modalOverlay{
      align-items: flex-start;
      padding: 0;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: rgba(0,0,0,0.82);
    }

    .modalContent{
      width: 100%;
      /* 100dvh excludes browser chrome so content never scrolls off */
      height: 100dvh;
      max-height: 100dvh;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      display: flex;
      flex-direction: column;
    }

    .modalHeader{
      /* always at very top; push down for iOS notch */
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: max(14px, env(safe-area-inset-top, 14px));
      padding-bottom: 12px;
      padding-left: 16px;
      padding-right: 12px;
      min-height: 58px;
      background: #ffffff;
      border-bottom: 1px solid #E9E5DE;
      position: relative;
      z-index: 50;
    }

    .modalHeaderText{
      flex: 1 1 auto;
      min-width: 0;
    }

    .modalTitle{
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* bigger tap target on mobile — 44px min per Apple HIG */
    .modalCloseBtn{
      flex: 0 0 44px;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #F1F5F9;
      border: 1.5px solid #D1D5DB;
      color: #374151;
      /* guarantee button is never hidden */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: static !important;
    }

    .modalCloseBtn svg{
      width: 20px;
      height: 20px;
    }

    .modalIframeWrap{
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }

    .drivePopoutCover{
      top: 6px;
      right: 14px;
      width: 54px;
      height: 54px;
    }
  }

  @media (max-width: 380px){
    .ibja-cta{
      gap: 7px;
      font-size: 11px;
      letter-spacing: -0.01em;
    }

    .ibja-cta-icon{
      width: 18px;
      height: 18px;
      flex-basis: 18px;
    }

    .ibja-cta-icon svg{
      width: 18px;
      height: 18px;
    }
  }
`;
