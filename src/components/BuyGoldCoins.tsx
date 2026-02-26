import React from "react";
import { SafetyOutlined, ThunderboltOutlined, ShoppingOutlined } from "@ant-design/icons";

export default function BuyGoldSection() {
  const handleBuyNow = () => {
    window.open("https://www.askoxy.ai/main/dashboard/products?type=GOLD", "_blank");
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            Buy <span style={styles.goldText}>Gold Coins</span>
          </h2>
          <p style={styles.subtitle}>
            Invest in 24K and 22K pure digital gold backed by physical reserves
          </p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card} className="feature-card">
            <SafetyOutlined style={styles.icon} />
            <h3 style={styles.cardTitle}>Secure</h3>
            <p style={styles.cardText}>Bank-grade security with vault-backed storage</p>
          </div>

          <div style={styles.card} className="feature-card">
            <ThunderboltOutlined style={styles.icon} />
            <h3 style={styles.cardTitle}>Instant</h3>
            <p style={styles.cardText}>Buy and sell gold in seconds, anytime</p>
          </div>

          <div style={styles.card} className="feature-card">
            <ShoppingOutlined style={styles.icon} />
            <h3 style={styles.cardTitle}>Transparent</h3>
            <p style={styles.cardText}>Live pricing with complete transparency</p>
          </div>
        </div>

        <div style={styles.ctaWrapper}>
          <button onClick={handleBuyNow} style={styles.button} className="buy-gold-cta">
            Buy Gold Coins Now →
          </button>
        </div>
      </div>

      <style>{responsiveStyles}</style>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    width: "100%",
    background: "linear-gradient(135deg, #2B0A59 0%, #3D0B7A 100%)",
    padding: "40px 20px",
    position: "relative",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "clamp(28px, 4vw, 40px)",
    fontWeight: 700,
    margin: 0,
    marginBottom: "8px",
    color: "#fff",
    lineHeight: 1.3,
  },
  goldText: {
    color: "#D4AF37",
  },
  subtitle: {
    fontSize: "15px",
    color: "#EDE7FF",
    margin: 0,
    lineHeight: 1.5,
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "32px",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "12px",
    padding: "24px 20px",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  icon: {
    fontSize: "32px",
    color: "#D4AF37",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    margin: 0,
    marginBottom: "6px",
  },
  cardText: {
    fontSize: "13px",
    color: "#EDE7FF",
    margin: 0,
    lineHeight: 1.5,
  },
  ctaWrapper: {
    textAlign: "center",
  },
  button: {
    padding: "14px 40px",
    fontSize: "16px",
    fontWeight: 700,
    background: "#D4AF37",
    color: "#2B0A59",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
    transition: "all 0.3s ease",
  },
};

const responsiveStyles = `
  .feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(212,175,55,0.4);
    background: rgba(255,255,255,0.12);
  }

  .buy-gold-cta:hover {
    background: #F5D36C !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(212,175,55,0.5) !important;
  }

  @media (max-width: 968px) {
    section > div > div:nth-child(2) {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
  }

  @media (max-width: 640px) {
    section {
      padding: 40px 16px !important;
    }
    
    section button {
      width: 100%;
      padding: 14px 32px !important;
    }
  }
`;
