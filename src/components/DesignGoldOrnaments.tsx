import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  MessageOutlined,
  AudioOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import GoldJewelleryImage from "../assets/goldbanner1.png";

// ── Personalise Modal ──
interface PersonaliseModalProps {
  route: string;
  onClose: () => void;
}

const PersonaliseModal: React.FC<PersonaliseModalProps> = ({ route, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    skinTone: "",
    event: "",
  });

  const isComplete = !!(formData.gender && formData.age && formData.skinTone && formData.event);

  const handleSubmit = () => {
    const userContext = `Gender: ${formData.gender}, Age: ${formData.age}, Skin Tone: ${formData.skinTone}, Event: ${formData.event}`;
    sessionStorage.setItem("userJewelryContext", userContext);
    onClose();
    navigate(route);
  };

  const handleSkip = () => {
    onClose();
    navigate(route);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.card}>
        <button onClick={onClose} style={modalStyles.closeBtn}>
          <X size={22} />
        </button>

        <h2 style={modalStyles.title}>Personalize Your Design</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            {
              label: "Gender",
              key: "gender",
              type: "select",
              options: ["Male", "Female", "Unisex"],
            },
            { label: "Age", key: "age", type: "number" },
            {
              label: "Skin Tone",
              key: "skinTone",
              type: "select",
              options: ["Fair", "Medium", "Olive", "Brown", "Dark"],
            },
            {
              label: "Event / Celebration",
              key: "event",
              type: "select",
              options: ["Wedding", "Party", "Official/Formal", "Ethnic/Traditional", "Casual", "Festival"],
            },
          ].map(({ label, key, type, options }) => (
            <div key={key}>
              <label style={modalStyles.label}>{label}</label>
              {type === "select" ? (
                <select
                  value={(formData as any)[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  style={modalStyles.input}
                >
                  <option value="">Select {label}</option>
                  {options!.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={(formData as any)[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder="Enter age"
                  style={modalStyles.input}
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          style={{
            ...modalStyles.primaryBtn,
            opacity: isComplete ? 1 : 0.5,
            cursor: isComplete ? "pointer" : "not-allowed",
          }}
        >
          Continue to Design
        </button>

        <button onClick={handleSkip} style={modalStyles.skipBtn}>
          Skip — Go directly to the page
        </button>
      </div>

      <style>{`
        @keyframes modal-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ── Cards config ──
const cards = [
  {
    id: "chat",
    Icon: MessageOutlined,
    label: "Chat with AI",
    sub: "Ask anything, get instant answers",
    route: "https://www.askoxy.ai/ai-store/gold-ai-store",
    accent: "#9B6FFF",
    showModal: false,
  },
  {
    id: "voice",
    Icon: AudioOutlined,
    label: "Speak with Vedika",
    sub: "Voice-first AI conversation",
    route: "/voiceAssistant",
    accent: "#D4AF37",
    showModal: false,
  },
  {
    id: "image",
    Icon: PictureOutlined,
    label: "Design Jewellery Images",
    sub: "AI-generated jewellery visuals",
    route: "/imageCreation",
    accent: "#F5D36C",
    showModal: true,
  },
  {
    id: "video",
    Icon: VideoCameraOutlined,
    label: "Design Jewellery Videos",
    sub: "Cinematic jewellery showcases",
    route: "/videoCreation",
    accent: "#D4AF37",
    showModal: true,
  },
];

// ── Main Page ──
const OxyGoldAIPage: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [modalRoute, setModalRoute] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCardClick = (card: (typeof cards)[0]) => {
    if (card.route.startsWith("http")) {
      window.open(card.route, "_blank");
    } else if (card.showModal) {
      setModalRoute(card.route);
    } else {
      navigate(card.route);
    }
  };

  return (
    <section>
      <div style={styles.container}>
        {/* Outer card — identical to BuyGoldSection */}
        <div style={styles.card} className="oxygold-card">
          <div style={styles.inner}>
            <div style={styles.heroRow} className="oxygold-hero">

              {/* ── LEFT: Content ── */}
              <div style={styles.left}>
                {/* Badge row */}
                <div style={styles.badgeRow}>
                  <div style={styles.badge}>
                    <span style={styles.badgeDot} />
                    OXYGOLD.AI • Intelligence Suite
                  </div>
                  <div style={styles.pill}>
                    <span style={styles.pillText}>Images &amp; Videos</span>
                  </div>
                </div>

                {/* Heading */}
                <div style={styles.header}>
                  <h2 style={styles.title}>
                    Design Your Own{" "}
                    <span style={styles.goldText}>Jewellery</span>
                  </h2>
                  <p style={styles.subtitle}>
                    Create AI-powered images, videos &amp; voice experiences with OXYGOLD.AI
                  </p>
                </div>

                {/* Feature grid — 2×2 cards */}
                <div style={styles.grid} className="oxygold-grid">
                  {cards.map((card) => {
                    const isHov = hovered === card.id;
                    return (
                      <div
                        key={card.id}
                        style={{
                          ...styles.feature,
                          ...(isHov ? {
                            borderColor: `${card.accent}66`,
                            background: "rgba(255,255,255,0.12)",
                            transform: "translateY(-3px)",
                          } : {}),
                        }}
                        className="feature-card flex items-center"
                        onClick={() => handleCardClick(card)}
                        onMouseEnter={() => setHovered(card.id)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <card.Icon
                          style={{
                            ...styles.icon,
                            color: isHov ? card.accent : "#D4AF37",
                            marginRight: "8px",
                          }}
                        />
                        <div>
                          <h3 style={styles.featureTitle}>{card.label}</h3>
                          <p style={styles.featureText}>{card.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Note */}
                <p style={styles.smallNote}>
                  Create your own images and videos.
                </p>
              </div>

              {/* ── RIGHT: Image ── */}
              <div style={styles.right} className="oxygold-right">
                <img
                  src={GoldJewelleryImage}
                  alt="AI Jewellery Design"
                  style={styles.bannerImg}
                  className="oxygold-banner-img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalRoute && (
        <PersonaliseModal route={modalRoute} onClose={() => setModalRoute(null)} />
      )}

      <style>{responsiveStyles}</style>
    </section>
  );
};

export default OxyGoldAIPage;

// ── Styles ──
const styles: Record<string, React.CSSProperties> = {
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

  bannerImg: {
    width: "100%",
    maxWidth: "676px",
    height: "auto",
    objectFit: "contain",
    display: "block",
    borderRadius: "20px",
  },

  badgeRow: {
    display: "flex",
    flexWrap: "wrap" as const,
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
    display: "inline-block",
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
    textAlign: "left" as const,
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

  // 2×2 grid (same 3-col pattern adapted to 2×2)
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
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
    padding: "12px 14px",
    transition: "all 0.25s ease",
    minHeight: "84px",
    cursor: "pointer",
  },

  icon: {
    fontSize: "26px",
    color: "#D4AF37",
    flex: "0 0 auto",
    transition: "color 0.25s ease",
  },

  featureTitle: {
    fontSize: "14px",
    fontWeight: 900,
    color: "#fff",
    margin: 0,
    lineHeight: 1.2,
  },

  featureText: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.70)",
    margin: "4px 0 0 0",
    lineHeight: 1.25,
  },

  smallNote: {
    margin: "4px 0 0 0",
    color: "rgba(255,255,255,0.70)",
    fontSize: "12.5px",
    fontWeight: 700,
  },
};

// ── Modal styles ──
const modalStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "16px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
    maxWidth: "440px",
    width: "100%",
    padding: "28px",
    position: "relative",
    animation: "modal-slide-up 0.3s ease-out",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    padding: "4px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 20px 0",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #D1D5DB",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#111827",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  primaryBtn: {
    width: "100%",
    marginTop: "20px",
    padding: "13px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #7C3AED, #DB2777)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  skipBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    background: "none",
    color: "#9CA3AF",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
};

const responsiveStyles = `
  .feature-card:hover {
    transform: translateY(-3px);
    border-color: rgba(212,175,55,0.45) !important;
    background: rgba(255,255,255,0.12) !important;
  }

  /* Tablet */
  @media (max-width: 980px) {
    .oxygold-hero {
      grid-template-columns: 1fr !important;
      gap: 22px !important;
    }
    .oxygold-right {
      justify-content: flex-start !important;
    }
    .oxygold-banner-img {
      max-width: 520px !important;
      width: 100% !important;
    }
  }

  /* Mobile */
  @media (max-width: 640px) {
    .oxygold-card > div {
      padding: 22px !important;
    }
    .oxygold-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
  }
`;