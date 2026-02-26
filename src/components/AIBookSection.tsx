import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAmazon } from "@fortawesome/free-brands-svg-icons";
import bookImage from "../assets/book.png";

export default function AIBookSection() {
  const openAmazon = () => {
    // ✅ Replace YOUR_BOOK_ID with your real Amazon ASIN
    window.open(
      "https://www.amazon.in/dp/YOUR_BOOK_ID",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section >
      <div style={styles.container}>
        {/* ✅ use SAME div (no new div) + make it the rounded card */}
        <div
          style={{ ...styles.card, ...styles.inner }}
          className="ai-book-inner ai-book-card"
        >

          <div style={styles.grid} className="ai-book-grid">
            {/* LEFT: Image */}
            <div style={styles.left} className="ai-book-left">
              <div style={styles.imageWrap}>
                <img
                  src={bookImage}
                  alt="Enter the AI & GenAI Universe book cover"
                  style={styles.image}
                />
              </div>
            </div>

            {/* RIGHT: Content */}
            <div style={styles.content} className="ai-book-content">
              <div style={styles.badgeRow}>
                <div style={styles.badge}>
                  <span style={styles.badgeDot} />
                  AI Book • Winner Benefit
                </div>

                <div style={styles.pill}>
                  <span style={styles.pillText}>65 Practical Chapters</span>
                </div>
              </div>

              {/* ✅ next title (white) */}
              <h2 style={styles.title}>Enter the <span style={styles.goldText}>AI & GenAI Universe</span></h2>
              <p style={styles.subtitle}>Build the Future with Agentic AI</p>

              <p style={styles.description}>
                A beginner-friendly yet powerful guide to understand and use
                Artificial Intelligence in real life. With 65 practical,
                easy-to-follow chapters, it simplifies AI, Generative AI, Prompt
                Engineering, Large Language Models (LLMs), Agentic AI, and future
                AI careers.
              </p>

              <div style={styles.ctaRow}>
                <button
                  onClick={openAmazon}
                  style={styles.amazonBtn}
                  className="amazon-btn"
                  type="button"
                >
                  <span style={styles.amazonIconChip}>
                    <FontAwesomeIcon
                      icon={faAmazon}
                      style={{ fontSize: 18, color: "#2B0A59" }}
                    />
                  </span>
                  <span>Buy on Amazon</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tiny responsive help without Tailwind */}
      <style>
        {`
          @media (min-width: 900px){
            .ai-book-grid{ grid-template-columns: 0.95fr 1.05fr !important; }
          }
          @media (max-width: 520px){
            .ai-book-card{ border-radius: 22px !important; padding: 22px !important; }
          }
          .amazon-btn:hover{ transform: translateY(-1px); filter: brightness(1.03); }
          .amazon-btn:active{ transform: translateY(0px) scale(0.99); }
        `}
      </style>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    width: "100%",
    padding: "76px 20px",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(1200px 700px at 20% 10%, rgba(138,91,255,0.22) 0%, rgba(43,10,89,1) 60%), linear-gradient(180deg, #2B0A59 0%, #160537 100%)",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  // ✅ Rounded corners focus (simple + premium)
  card: {
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
  },

  inner: {
    padding: "38px",
  },

  // ✅ Top title (gold)
  topTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 900,
    letterSpacing: "2px",
    textTransform: "uppercase",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  topSubTitle: {
    margin: "10px 0 22px 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
    fontWeight: 700,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "32px",
    alignItems: "center",
  },

  left: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  imageWrap: {
    width: "100%",
    maxWidth: "520px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },

  image: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    display: "block",
    filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.35))",
  },

  content: {
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
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: 800,
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
    fontSize: "34px",
    lineHeight: 1.15,
    color: "#FFFFFF",
    fontWeight: 900,
    letterSpacing: "0.2px",
  },
  goldText: { color: "#D4AF37" },
  subtitle: {
    margin: "10px 0 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    fontWeight: 700,
  },

  description: {
    marginTop: "16px",
    color: "rgba(255,255,255,0.88)",
    lineHeight: 1.75,
    fontSize: "15px",
    textAlign: "left",
  },

  ctaRow: {
    marginTop: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },

  amazonBtn: {
    padding: "14px 22px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    color: "#2B0A59",
    fontWeight: 900,
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.25s",
  },

  amazonIconChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(255,255,255,0.72)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
  },
};