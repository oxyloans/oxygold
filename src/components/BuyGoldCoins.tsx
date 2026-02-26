import React from "react";
import {
  SafetyOutlined,
  ThunderboltOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import goldBanner from "../assets/goldbanner.png";

export default function BuyGoldSection() {
  const handleBuyNow = () => {
    window.open(
      "https://www.askoxy.ai/main/dashboard/products?type=GOLD",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handlePlayStore = () => {
    // ✅ replace with your real Play Store link
    window.open(
      "https://play.google.com/store/search?q=askoxy&c=apps",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleAppStore = () => {
    // ✅ replace with your real App Store link
    window.open(
      "https://apps.apple.com/in/app/askoxy-ai-ai-z-marketplace/id6738732000",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section >
      <div style={styles.container}>
        {/* ✅ AI-book style card */}
        <div style={styles.card} className="buy-gold-card">
          <div style={styles.inner}>
            <div style={styles.heroRow} className="buy-gold-hero">
              {/* LEFT CONTENT */}
              <div style={styles.left}>
                <div style={styles.badgeRow}>
                  <div style={styles.badge}>
                    <span style={styles.badgeDot} />
                    Gold • Vault-Backed
                  </div>
                  <div style={styles.pill}>
                    <span style={styles.pillText}>24K / 22K Coins</span>
                  </div>
                </div>

                <div style={styles.header}>
                  <h2 style={styles.title}>
                    Buy <span style={styles.goldText}>Gold Coins</span>
                  </h2>
                  <p style={styles.subtitle}>
                    Secure digital gold with physical reserve backing.
                  </p>
                </div>

                {/* ✅ Simplified + shorter feature boxes */}
                <div style={styles.grid} className="buy-gold-grid">
                  <div style={styles.feature} className="feature-card">
                    <SafetyOutlined style={styles.icon} />
                    <div>
                      <h3 style={styles.featureTitle}>Vault Secure</h3>
                      <p style={styles.featureText}>Bank-grade protection</p>
                    </div>
                  </div>

                  <div style={styles.feature} className="feature-card">
                    <ThunderboltOutlined style={styles.icon} />
                    <div>
                      <h3 style={styles.featureTitle}>Instant Trade</h3>
                      <p style={styles.featureText}>Buy / sell anytime</p>
                    </div>
                  </div>

                  <div style={styles.feature} className="feature-card">
                    <ShoppingOutlined style={styles.icon} />
                    <div>
                      <h3 style={styles.featureTitle}>Live Pricing</h3>
                      <p style={styles.featureText}>Transparent rates</p>
                    </div>
                  </div>
                </div>

                <div style={styles.ctaWrapper}>
                  <button
                    onClick={handleBuyNow}
                    style={styles.button}
                    className="buy-gold-cta"
                    type="button"
                  >
                    Buy Gold Coins Now →
                  </button>

                  {/* ✅ Store buttons BELOW */}
                  <div style={styles.storeRow} className="store-row">
                    <button
                      type="button"
                      onClick={handlePlayStore}
                      style={styles.storeBtn}
                      className="store-btn"
                      aria-label="Get it on Google Play"
                    >
                      {/* Google Play icon */}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={styles.storeIcon}
                      >
                        <path
                          d="M3.7 2.4c-.4.4-.7 1-.7 1.8v15.6c0 .8.3 1.4.7 1.8l9-9-9-9Z"
                          fill="currentColor"
                          opacity="0.95"
                        />
                        <path
                          d="M13.2 11.4 4.4 2.6c.3-.1.7 0 1.2.3l11.1 6.4-3.5 2.1Z"
                          fill="currentColor"
                          opacity="0.75"
                        />
                        <path
                          d="M13.2 12.6 4.4 21.4c.3.1.7 0 1.2-.3l11.1-6.4-3.5-2.1Z"
                          fill="currentColor"
                          opacity="0.75"
                        />
                        <path
                          d="M17.8 9.8 14.7 11.6l3.1 1.8 3.7-2.1c.8-.5.8-1.3 0-1.8l-3.7-2.1Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span style={styles.storeText}>Play Store</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAppStore}
                      style={styles.storeBtn}
                      className="store-btn"
                      aria-label="Download on the App Store"
                    >
                      {/* Apple icon */}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={styles.storeIcon}
                      >
                        <path
                          d="M16.9 13.2c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.1-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.8-2.7-.8-1.4 0-2.7.8-3.4 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7 1.3 0 1.6.7 2.7.7 1.1 0 1.9-1.1 2.6-2.1.8-1.2 1.1-2.3 1.1-2.3-.1 0-2.4-.9-2.4-3.3Z"
                          fill="currentColor"
                          opacity="0.95"
                        />
                        <path
                          d="M14.6 6.6c.6-.7 1-1.8.9-2.8-.9.1-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.6-1.4Z"
                          fill="currentColor"
                          opacity="0.8"
                        />
                      </svg>
                      <span style={styles.storeText}>App Store</span>
                    </button>
                  </div>

                  <p style={styles.smallNote}>Available on Web • Android • iOS</p>
                </div>
              </div>

              {/* RIGHT IMAGE (✅ 30% bigger, ✅ no rounded, ✅ no shadow) */}
              <div style={styles.right} className="buy-gold-right">
                <img
                  src={goldBanner}
                  alt="Gold coins banner"
                  style={styles.bannerImg}
                  className="gold-banner-img"
                />
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
  section: {
    width: "100%",
    background:
      "radial-gradient(1200px 700px at 20% 10%, rgba(138,91,255,0.22) 0%, rgba(43,10,89,1) 60%), linear-gradient(180deg, #2B0A59 0%, #160537 100%)",
    padding: "70px 20px",
    position: "relative",
    overflow: "hidden",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  card: {
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
    overflow: "hidden",
  },

  inner: {
    padding: "42px",
  },

  heroRow: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "26px",
    alignItems: "center",
  },

  left: { minWidth: 0 },

  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },

  // ✅ 30% larger than 520px => 676px
  // ✅ no rounded, ✅ no shadow
  bannerImg: {
    width: "100%",
    maxWidth: "676px",
    height: "auto",
    objectFit: "contain",
    display: "block",
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
    boxShadow: "0 0 0 3px rgba(212,175,55,0.18)",
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

  header: {
    textAlign: "left",
    marginBottom: "16px",
  },

  title: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 900,
    margin: 0,
    marginBottom: "8px",
    color: "#fff",
    lineHeight: 1.15,
    letterSpacing: "0.2px",
  },

  goldText: { color: "#D4AF37" },

  subtitle: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.82)",
    margin: 0,
    lineHeight: 1.6,
    maxWidth: "640px",
  },

  // ✅ reduced height by reducing padding + 2-line max content
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(212,175,55,0.22)",
    borderRadius: "14px",
    padding: "12px 12px", // reduced
    transition: "all 0.25s ease",
    minHeight: "72px", // reduced height
  },

  icon: {
    fontSize: "26px",
    color: "#D4AF37",
    flex: "0 0 auto",
  },

  featureTitle: {
    fontSize: "15px",
    fontWeight: 900,
    color: "#fff",
    margin: 0,
    lineHeight: 1.15,
  },

  featureText: {
    fontSize: "12.5px",
    color: "rgba(255,255,255,0.78)",
    margin: "4px 0 0 0",
    lineHeight: 1.25,
  },

  ctaWrapper: { textAlign: "left" },

  button: {
    padding: "14px 34px",
    fontSize: "16px",
    fontWeight: 900,
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    color: "#2B0A59",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    boxShadow: "0 6px 22px rgba(212,175,55,0.28)",
    transition: "all 0.3s ease",
  },

  storeRow: {
    marginTop: "14px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  storeBtn: {
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    padding: "10px 14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.25s ease",
  },

  storeIcon: { color: "#F5D36C" },

  storeText: {
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.2px",
  },

  smallNote: {
    margin: "12px 0 0 0",
    color: "rgba(255,255,255,0.70)",
    fontSize: "12.5px",
    fontWeight: 700,
  },
};

const responsiveStyles = `
  .feature-card:hover {
    transform: translateY(-3px);
    border-color: rgba(212,175,55,0.45);
    background: rgba(255,255,255,0.12);
  }

  .buy-gold-cta:hover {
    filter: brightness(1.02);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(212,175,55,0.45) !important;
  }

  .store-btn:hover{
    transform: translateY(-2px);
    border-color: rgba(245,211,108,0.55);
    background: rgba(255,255,255,0.12);
  }
  .store-btn:active{
    transform: translateY(0px) scale(0.99);
  }

  /* Tablet: stack, image below */
  @media (max-width: 980px) {
    .buy-gold-hero{
      grid-template-columns: 1fr !important;
      gap: 22px !important;
    }
    .buy-gold-right{
      justify-content: flex-start !important;
    }
    .buy-gold-grid{
      grid-template-columns: 1fr 1fr !important;
    }
    .gold-banner-img{
      max-width: 760px !important;
      width: 100% !important;
    }
  }

  /* Mobile */
  @media (max-width: 640px) {
    section {
      padding: 54px 16px !important;
    }
    .buy-gold-card > div{
      padding: 22px !important;
    }
    .buy-gold-grid{
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    section button.buy-gold-cta{
      width: 100%;
      justify-content: center;
      padding: 14px 18px !important;
    }
    .store-row{
      width: 100%;
    }
    .store-row button{
      width: 100%;
      justify-content: center;
    }
  }
`;