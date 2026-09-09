import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAmazon } from "@fortawesome/free-brands-svg-icons";
import bookImage from "../assets/book.png";

export default function AIBookSection() {
  const openAmazon = () => {
    // ✅ Replace YOUR_BOOK_ID with your real Amazon ASIN
    window.open("https://amzn.in/d/2Ie3hEg", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="ai-book-section" style={styles.section}>
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
              <p
                style={{
                  margin: "4px 0",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  background: "linear-gradient(90deg, #ffffff, #D4AF37)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: `
      0 0 6px rgba(212,175,55,0.4),
      0 0 14px rgba(212,175,55,0.2)
    `,
                }}
              >
                Our Co-Founders are Authors of a Prestigious Book
              </p>
              {/* BIG BOOK NAME */}
              <h2
                style={{
                  margin: "8px 0 6px 0",
                  fontSize: "clamp(24px, 4vw, 44px)",
                  lineHeight: 1.15,
                  fontWeight: 900,
                  letterSpacing: "0.2px",
                }}
              >
                Enter the{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI & GenAI Universe
                </span>
              </h2>

              {/* Tagline */}
              <p
                style={{
                  margin: "4px 0 8px 0",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Build the Future with Agentic AI
              </p>

              {/* Description */}
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.75)",
                  maxWidth: "540px",
                }}
              >
                A beginner-friendly yet powerful guide to understand and use
                Artificial Intelligence in real life. With 65 practical,
                easy-to-follow chapters, it simplifies AI, Generative AI, Prompt
                Engineering, Large Language Models (LLMs), Agentic AI, and
                future AI careers.
              </p>

              {/* CTA */}
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
          @media (max-width: 640px){
            .ai-book-section { padding: 20px 0 !important; }
            .ai-book-card{ border-radius: 16px !important; padding: 16px !important; }
            .ai-book-left{ padding: 0 10px; }
          }
          @media (min-width: 641px) and (max-width: 899px){
            .ai-book-card{ padding: 24px !important; }
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
    padding: "0",
    position: "relative",
    overflow: "hidden",
    background: "transparent",
  },

  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 0px",
  },

  // ✅ Rounded corners focus (simple + premium)
  card: {
    borderRadius: "20px",
    padding: "0px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 32px rgba(8,2,24,0.20)",
    backdropFilter: "blur(12px)",
  },

  inner: {
    padding: "32px",
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
    gap: "20px",
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
    filter: "drop-shadow(0 12px 22px rgba(8,2,24,0.22))",
  },

  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    marginBottom: "10px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#FFFFFF",
    letterSpacing: "0.2px",
  },

  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    boxShadow: "0 0 0 2px rgba(212,175,55,0.16)",
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "7px 12px",
    border: "1px solid rgba(212,175,55,0.35)",
    background: "rgba(212,175,55,0.10)",
  },

  pillText: {
    color: "#F5D36C",
    fontWeight: 900,
    fontSize: "11px",
    letterSpacing: "0.2px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(20px, 2.6vw, 30px)",
    lineHeight: 1.15,
    color: "#FFFFFF",
    fontWeight: 900,
    letterSpacing: "0.2px",
  },
  goldText: { color: "#D4AF37" },
  subtitle: {
    margin: "8px 0 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "14px",
    fontWeight: 700,
  },

  description: {
    marginTop: "12px",
    color: "rgba(255,255,255,0.88)",
    lineHeight: 1.7,
    fontSize: "13px",
    textAlign: "left",
  },

  ctaRow: {
    marginTop: "14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  amazonBtn: {
    padding: "12px 18px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    color: "#2B0A59",
    fontWeight: 900,
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.25s",
  },

  amazonIconChip: {
    width: 30,
    height: 30,
    borderRadius: 10,
    background: "rgba(255,255,255,0.72)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 7px 18px rgba(8,2,24,0.16)",
  },
};
