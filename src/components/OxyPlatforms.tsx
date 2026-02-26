import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OxyBricksLogo from "../assets/oxybrickslogo.png";
import OxyLoansLogo from "../assets/oxyloanslogo.png";
import AskOxyLogo from "../assets/askoxylogo.png";

const ecosystemCards = [
  {
    id: "oxybricks",
    name: "OxyBricks",
    description: "Real Estate Investment Platform",
    logo: OxyBricksLogo,
    url: "https://www.oxybricks.world/",
  },
  {
    id: "oxyloans",
    name: "OxyLoans",
    description: "P2P Lending & Borrowing Platform",
    logo: OxyLoansLogo,
    url: "https://www.oxyloans.com/",
  },
  {
    id: "askoxy",
    name: "AskOxy.ai",
    description: "AI-Powered Assistant Platform",
    logo: AskOxyLogo,
    url: "https://www.askoxy.ai/",
  },
];

const OxyEcosystem: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleCardClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <section>
      <div >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            Explore Our <span style={styles.goldText}>Platforms</span>
          </h2>
        </div>

        {/* Grid of 3 logos - no backgrounds */}
        <div style={styles.grid}>
          {ecosystemCards.map((card) => {
            const isHov = hovered === card.id;
            return (
              <div
                key={card.id}
                style={{
                  ...styles.logoCard,
                  ...(isHov ? { transform: "scale(1.05)" } : {}),
                }}
                onClick={() => handleCardClick(card.url)}
                onMouseEnter={() => setHovered(card.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <img
                  src={card.logo}
                  alt={card.name}
                  style={styles.logo}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OxyEcosystem;

const styles: Record<string, React.CSSProperties> = {
  header: {
    textAlign: "center" as const,
    marginBottom: "6px",
  },

  title: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 900,
    margin: 0,
    color: "#fff",
    lineHeight: 1.15,
  },

  goldText: { color: "#D4AF37" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "60px",
    alignItems: "center",
    justifyItems: "center",
  },

  logoCard: {
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },

  logo: {
    width: "280px",
    height: "280px",
    objectFit: "contain",
    display: "block",
  },
};

const responsiveStyles = `
  @media (max-width: 980px) {
    .oxy-ecosystem-grid {
      grid-template-columns: 1fr !important;
      gap: 40px !important;
    }
  }
`;
