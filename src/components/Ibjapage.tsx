import React from "react";
import ibjaPartner from "../assets/IBJApartner.png";

export default function IBJAPartnerSection() {
  return (
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{responsiveStyles}</style>
    </section>
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
};

const responsiveStyles = `
  .ibja-cta:hover{ transform: translateY(-1px); filter: brightness(1.03); }
  .ibja-cta:active{ transform: translateY(0px) scale(0.99); }

  @media (max-width: 980px){
    .ibja-container{ padding: 28px 0 !important; }
    .ibja-grid{
      grid-template-columns: 1fr !important;
      gap: 28px !important;
    }
    .ibja-inner{ padding: 40px !important; }
    .ibja-left{
      justify-content: center !important;
    }
    .ibja-image{
      max-width: 100% !important;
    }
  }

  @media (max-width: 640px){
    .ibja-container{ padding: 20px 0 !important; }
    .ibja-inner{ padding: 16px !important; }
    .ibja-card{ border-radius: 20px !important; }
    .ibja-grid{ gap: 24px !important; }
  }
`;
