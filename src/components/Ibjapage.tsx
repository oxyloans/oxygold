import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  Sparkles,
  Award,
  FileText,
  CheckCircle2,
  ArrowRight,
  X,
} from "lucide-react";
import ibjaPartner from "../assets/IBJApartner.png";

export default function IBJAPartnerSection() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowModal(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  return (
    <section className="w-full py-4 sm:py-8 lg:py-10">
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 lg:p-12 transition-all hover:border-[#D4AF37]/35"
        style={{
          background:
            "radial-gradient(900px 420px at 15% 10%, rgba(91,46,255,0.22), transparent 55%), radial-gradient(700px 360px at 90% 25%, rgba(212,175,55,0.16), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        }}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* LEFT: Image Showcase (5 columns on desktop) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="group relative w-full max-w-[480px]">
              {/* Image Glow Backdrop */}
              <div className="absolute -inset-2 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#8A5BFF]/15 to-[#D4AF37]/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Image Container Card */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md p-4 sm:p-6 shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                <img
                  src={ibjaPartner}
                  alt="IBJA Platinum Partner - OXYGOLD.AI"
                  className="w-full h-auto object-contain rounded-xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Content (7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D36C] text-[11px] sm:text-xs font-semibold self-start mb-3">
              <Sparkles size={13} className="animate-pulse" />
              <span>India's Bullion Authority</span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
                IBJA
              </span>{" "}
              • Platinum Partner
            </h2>

            {/* Subtitle */}
            <p className="mt-2 text-sm sm:text-base font-medium text-white/90 leading-relaxed">
              Aligning our digital gold ecosystem with India’s most respected bullion authority.
            </p>

            {/* Descriptions */}
            <div className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/75 leading-relaxed">
              <p>
                OXYGOLD.AI is proud to be an IBJA Platinum Partner, aligning our digital gold ecosystem with India’s most respected bullion authority.
              </p>
              <p>
                Our pricing intelligence, transparency framework, and compliance standards are powered by IBJA benchmark data — ensuring trust, authenticity, and market integrity.
              </p>
            </div>

            {/* List Card: Intersection of... */}
            <div className="mt-5 rounded-xl sm:rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#D4AF37]/10 via-white/[0.03] to-[#8A5BFF]/10 p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F5D36C] mb-3">
                <Award size={16} className="text-[#F5D36C] shrink-0" />
                <span>As a Platinum Partner, OXYGOLD.AI operates at the intersection of:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-white/90 transition-all hover:border-[#D4AF37]/40 hover:bg-white/[0.08]">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Real-time benchmark pricing</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-white/90 transition-all hover:border-[#D4AF37]/40 hover:bg-white/[0.08]">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Gold market intelligence</span>
                </div>
              </div>
            </div>

            {/* CTA Action */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] text-[#1B053A] font-extrabold text-sm shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                aria-haspopup="dialog"
              >
                <FileText size={17} className="transition-transform group-hover:scale-110" />
                <span>View Certificate</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Portal */}
      {showModal &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[2147483000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-modal-fade"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowModal(false);
            }}
          >
            <div
              className="relative flex flex-col w-full max-w-5xl h-[88vh] max-h-[850px] overflow-hidden rounded-2xl border border-white/20 bg-[#0F081D] shadow-[0_25px_70px_rgba(0,0,0,0.6)] animate-modal-scale"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ibja-certificate-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#160B2C]">
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                    OXYGOLD.AI
                  </span>
                  <h3 id="ibja-certificate-modal-title" className="text-sm sm:text-base font-bold text-white truncate">
                    Certificate of Membership
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer"
                  aria-label="Close certificates viewer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Iframe */}
              <div className="relative flex-1 bg-white">
                <iframe
                  title="OXYGOLD.AI Gold Certificate"
                  src="https://drive.google.com/file/d/1JXREXS8gMcjc292mMj043yDRG1ohzya8/preview"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allow="autoplay"
                  allowFullScreen
                />
                {/* Covers Google Drive's built-in "Pop out" control */}
                <div className="absolute top-2 right-4 w-14 h-14 bg-[#202124] pointer-events-auto" aria-hidden="true" />
              </div>
            </div>
          </div>,
          document.body
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
}
