import React from "react";
import { VideoCameraOutlined, PictureOutlined, GoldOutlined, AudioOutlined } from "@ant-design/icons";

export default function DesignGoldOrnaments() {
  const handleNavigation = (url: string) => {
    window.open(url, "_blank");
  };

  const cards = [
    {
      icon: <GoldOutlined />,
      title: "Explore GOLD Collection",
      description: "Browse premium gold, silver and collections",
      url: "https://www.askoxy.ai/main/dashboard/products?type=GOLD",
      gradient: "linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)",
    },
    {
      icon: <VideoCameraOutlined />,
      title: "Jewellery Videos",
      description: "AI-powered video creation for your jewellery designs",
      url: "https://www.askoxy.ai/video-creator",
      gradient: "linear-gradient(135deg, #8A5BFF 0%, #5B2EFF 100%)",
    },
    {
      icon: <PictureOutlined />,
      title: "Design Images",
      description: "Generate stunning images of gold and diamond ornaments",
      url: "https://www.askoxy.ai/image-creator",
      gradient: "linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)",
    },
    {
      icon: <AudioOutlined />,
      title: "Talk with Gold AI",
      description: "Voice-powered assistant for jewellery and investment queries",
      url: "https://www.askoxy.ai/voiceAssistant/welcome",
      gradient: "linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)",
    },
  ];

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            Design Your Own <span style={styles.goldText}>Gold Ornaments</span>
          </h2>
          <p style={styles.subtitle}>
            Explore AI-powered tools to design, visualize, and create your
            perfect gold jewellery
          </p>
        </div>

        <div style={styles.grid}>
          {cards.map((card, index) => (
            <div
              key={index}
              style={styles.card}
              className="design-card"
              onClick={() => handleNavigation(card.url)}
            >
              <div style={{ ...styles.cardIcon, background: card.gradient }}>
                {card.icon}
              </div>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDesc}>{card.description}</p>
              <div style={styles.cardArrow}>→</div>
            </div>
          ))}
        </div>

       
      </div>

      <style>{responsiveStyles}</style>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    width: "100%",
    background: "linear-gradient(180deg, #2B0A59 0%, #3D0B7A 100%)",
    padding: "50px 20px",
    position: "relative",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 700,
    margin: 0,
    marginBottom: "12px",
    color: "#fff",
    lineHeight: 1.3,
  },
  goldText: {
    color: "#D4AF37",
  },
  subtitle: {
    fontSize: "16px",
    color: "#EDE7FF",
    margin: 0,
    lineHeight: 1.6,
    maxWidth: "700px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
    marginBottom: "40px",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "16px",
    padding: "28px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  cardIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: "28px",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    margin: 0,
    marginBottom: "8px",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#EDE7FF",
    margin: 0,
    lineHeight: 1.5,
    minHeight: "40px",
  },
  cardArrow: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    fontSize: "20px",
    color: "#D4AF37",
    opacity: 0,
    transition: "all 0.3s ease",
  },
  ctaWrapper: {
    textAlign: "center",
  },
  exploreBtn: {
    padding: "16px 48px",
    fontSize: "17px",
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
  .design-card:hover {
    transform: translateY(-6px);
    border-color: rgba(212,175,55,0.5);
    background: rgba(255,255,255,0.14);
    box-shadow: 0 8px 24px rgba(212,175,55,0.2);
  }

  .design-card:hover .cardArrow {
    opacity: 1 !important;
    right: 16px !important;
  }

  .explore-btn:hover {
    background: #F5D36C !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(212,175,55,0.5) !important;
  }

  @media (max-width: 1024px) {
    section > div > div:nth-child(2) {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 640px) {
    section {
      padding: 40px 16px !important;
    }

    section > div > div:nth-child(2) {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }

    section button {
      width: 100%;
      padding: 14px 32px !important;
    }
  }
`;
