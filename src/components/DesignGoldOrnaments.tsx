import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Mic,
  Image,
  Video,
  Sparkles,
  ArrowUpRight,
  X,
} from "lucide-react";
import GoldJewelleryImage from "../assets/goldbanner1.png";

// ── Personalise Modal ──
interface PersonaliseModalProps {
  route: string;
  onClose: () => void;
}

const PersonaliseModal: React.FC<PersonaliseModalProps> = ({
  route,
  onClose,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    skinTone: "",
    event: "",
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const isComplete = !!(
    formData.gender &&
    formData.age &&
    formData.skinTone &&
    formData.event
  );

  const handleSubmit = () => {
    const userContext = `Gender: ${formData.gender}, Age: ${formData.age}, Skin Tone: ${formData.skinTone}, Event: ${formData.event}`;
    sessionStorage.setItem("userJewelryContext", userContext);
    onClose();
    navigate(route);
  };

  const handleSkip = () => {
    sessionStorage.removeItem("userJewelryContext");
    onClose();
    navigate(route);
  };

  const formFields = [
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
      options: [
        "Wedding",
        "Party",
        "Official/Formal",
        "Ethnic/Traditional",
        "Casual",
        "Festival",
      ],
    },
  ];

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[2147483000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-modal-fade"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/20 bg-[#120726] p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.7)] text-white animate-modal-scale custom-scrollbar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="personalise-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] mb-1">
            AI Creative Studio
          </span>
          <h2 id="personalise-modal-title" className="text-xl sm:text-2xl font-black text-white">
            Personalize Your Design
          </h2>
        </div>

        {/* Form Inputs */}
        <div className="flex flex-col gap-4">
          {formFields.map(({ label, key, type, options }) => (
            <div key={key}>
              <label className="block text-xs sm:text-sm font-semibold text-white/80 mb-1.5">
                {label}
              </label>
              {type === "select" ? (
                <select
                  value={(formData as any)[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all cursor-pointer"
                  style={{ backgroundColor: "#1B063D", color: "#FFFFFF" }}
                >
                  <option value="" style={{ backgroundColor: "#1B063D", color: "#FFFFFF" }}>
                    Select {label}
                  </option>
                  {options!.map((o) => (
                    <option key={o} value={o} style={{ backgroundColor: "#1B063D", color: "#FFFFFF" }}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={(formData as any)[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  placeholder="Enter age"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] placeholder-white/30 transition-all"
                />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleSubmit}
            disabled={!isComplete}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm transition-all duration-200 ${
              isComplete
                ? "bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] text-[#1B053A] shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
            }`}
          >
            Continue to Design
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Skip — Go directly to the page
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Cards config ──
const cards = [
  {
    id: "chat",
    Icon: MessageSquare,
    label: "Chat with AI",
    sub: "Ask anything, get instant answers",
    route: "https://www.askoxy.ai/ai-store/gold-ai-store",
    accent: "#9B6FFF",
    iconBg: "from-[#9B6FFF]/20 to-[#9B6FFF]/5 text-[#A78BFA] border-[#9B6FFF]/40",
    hoverBorder: "hover:border-[#9B6FFF]/50",
    showModal: false,
  },
  {
    id: "voice",
    Icon: Mic,
    label: "Speak with Vedika",
    sub: "Voice-first AI conversation",
    route: "/voiceAssistant",
    accent: "#D4AF37",
    iconBg: "from-[#D4AF37]/20 to-[#D4AF37]/5 text-[#F5D36C] border-[#D4AF37]/40",
    hoverBorder: "hover:border-[#D4AF37]/50",
    showModal: false,
  },
  {
    id: "image",
    Icon: Image,
    label: "Design Jewellery Images",
    sub: "AI-generated jewellery visuals",
    route: "/imageCreation",
    accent: "#F5D36C",
    iconBg: "from-[#F5D36C]/20 to-[#F5D36C]/5 text-[#F5D36C] border-[#F5D36C]/40",
    hoverBorder: "hover:border-[#F5D36C]/50",
    showModal: true,
  },
  {
    id: "video",
    Icon: Video,
    label: "Design Jewellery Videos",
    sub: "Cinematic jewellery showcases",
    route: "/videoCreation",
    accent: "#D4AF37",
    iconBg: "from-[#D4AF37]/20 to-[#D4AF37]/5 text-[#F5D36C] border-[#D4AF37]/40",
    hoverBorder: "hover:border-[#D4AF37]/50",
    showModal: true,
  },
];

// ── Main Page Component ──
const OxyGoldAIPage: React.FC = () => {
  const [modalRoute, setModalRoute] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCardClick = (card: (typeof cards)[0]) => {
    if (card.route.startsWith("http")) {
      window.open(card.route, "_blank", "noopener,noreferrer");
    } else if (card.showModal) {
      setModalRoute(card.route);
    } else {
      navigate(card.route);
    }
  };

  return (
    <section className="w-full py-4 sm:py-8 lg:py-10">
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 lg:p-10 transition-all hover:border-[#D4AF37]/35"
        style={{
          background:
            "radial-gradient(900px 420px at 15% 10%, rgba(91,46,255,0.22), transparent 55%), radial-gradient(700px 360px at 90% 25%, rgba(212,175,55,0.16), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        }}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* ── LEFT: Content (7 columns on desktop) ── */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D36C] text-[11px] sm:text-xs font-semibold self-start mb-3">
              <Sparkles size={12} className="animate-pulse" />
              <span>OXYGOLD.AI • Intelligence Suite</span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
              Design Gold{" "}
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
                Jewellery with AI
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-white/80 leading-relaxed max-w-xl mb-6">
              Create jewellery ideas through AI chat, voice, images and videos.
            </p>

            {/* Feature grid — 2×2 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              {cards.map((card) => {
                const IconComponent = card.Icon;
                return (
                  <div
                    key={card.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(card)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleCardClick(card);
                      }
                    }}
                    className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:scale-[0.98] cursor-pointer ${card.hoverBorder}`}
                  >
                    {/* Glowing Icon Container */}
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:scale-105 ${card.iconBg}`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide transition-colors group-hover:text-[#F5D36C] truncate">
                          {card.label}
                        </h3>
                        <ArrowUpRight
                          size={15}
                          className="text-white/40 group-hover:text-[#F5D36C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-white/65 leading-tight truncate">
                        {card.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Banner Image (5 columns on desktop) ── */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="group relative w-full max-w-[540px]">
              {/* Image Glow Backdrop */}
              <div className="absolute -inset-2 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#8A5BFF]/15 to-[#D4AF37]/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Image Container Card */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md p-3 sm:p-4 shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                <img
                  src={GoldJewelleryImage}
                  alt="AI Jewellery Design"
                  className="w-full h-auto object-cover rounded-xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalRoute && (
        <PersonaliseModal
          route={modalRoute}
          onClose={() => setModalRoute(null)}
        />
      )}

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-fade {
          animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-modal-scale {
          animation: modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
};

export default OxyGoldAIPage;
