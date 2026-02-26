import React from "react";
import { ShoppingCart } from "lucide-react";
import aiImage from "../assets/gt.png";


export default function AIBookSection() {
  const openAmazon = () => {
    window.open("https://www.amazon.in/dp/YOUR_BOOK_ID", "_blank");
  };

  return (
    <section style={styles.section} className="ai-book-section">
      <div style={styles.container}>
        <div style={styles.card} className="ai-book-card">
          <div style={styles.gradient} />
          
          <div style={styles.grid} className="ai-book-grid">
            {/* Image */}
            <div style={styles.imageWrapper}>
              <img src={aiImage} alt="AI Book" style={styles.image} />
            </div>

            {/* Content */}
            <div style={styles.content}>
              <div style={styles.badge}>
                AI Book • First Copy Winner Benefit
              </div>

              <p style={styles.description}>
                Enter the AI & GenAI Universe is a beginner-friendly yet powerful guide for anyone who wants to understand and use Artificial Intelligence in real life. With 65 practical, easy-to-follow chapters, the book simplifies AI, Generative AI, Prompt Engineering, Large Language Models (LLMs), how to build the future with agentic AI, and future AI careers.
              </p>

              <div style={styles.benefitCard}>
                <p style={styles.benefitTitle}>Special First Copy Winner Benefit</p>
                <p style={styles.benefitText}>
                  Permanent training until placement • Direct interaction with Team & CEO • Daily interview & project guidance • Continuous support until you get the job
                </p>
              </div>

              <button onClick={openAmazon} style={styles.amazonBtn} className="amazon-btn">
                <ShoppingCart size={20} color="#2B0A59" />
                <span>Buy on Amazon</span>
              </button>
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
    background: "#2B0A59",
    padding: "60px 20px",
    position: "relative" as const,
    overflow: "hidden",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "24px",
    border: "1px solid rgba(138, 91, 255, 0.3)",
    background: "#EDE7FF",
    boxShadow: "0 20px 60px rgba(91, 46, 255, 0.15)",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(1200px 700px at 10% 10%, rgba(91,46,255,0.14) 0%, transparent 62%)",
    pointerEvents: "none" as const,
  },
  grid: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "40px",
    padding: "40px",
  },
  imageWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    maxWidth: "500px",
    height: "auto",
    objectFit: "contain",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    alignSelf: "flex-start",
    borderRadius: "999px",
    background: "#8A5BFF",
    border: "1px solid #5B2EFF",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  description: {
    marginTop: "20px",
    color: "#2B0A59",
    textAlign: "justify",
    lineHeight: 1.7,
    fontSize: "15px",
  },
  benefitCard: {
    marginTop: "20px",
    borderRadius: "16px",
    border: "1px solid #D4AF37",
    background: "#FFF6D8",
    padding: "20px",
  },
  benefitTitle: {
    color: "#D4AF37",
    fontWeight: 700,
    fontSize: "16px",
    marginBottom: "8px",
  },
  benefitText: {
    color: "#2B0A59",
    lineHeight: 1.6,
    fontSize: "14px",
    margin: 0,
  },
  amazonBtn: {
    marginTop: "24px",
    padding: "14px 28px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    color: "#2B0A59",
    fontWeight: 700,
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.3s",
    alignSelf: "flex-start",
  },
};

const responsiveStyles = `
  .amazon-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
  }

  .amazon-btn:active {
    transform: scale(0.98);
  }

  @media (min-width: 768px) {
    .ai-book-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 40px !important;
    }
  }

  @media (max-width: 767px) {
    .ai-book-section {
      padding: 40px 16px !important;
    }
    .ai-book-card {
      padding: 24px !important;
    }
    .ai-book-grid {
      gap: 24px !important;
    }
  }

  @media (max-width: 480px) {
    .ai-book-card {
      padding: 20px !important;
    }
    .amazon-btn {
      width: 100%;
    }
  }
`;
