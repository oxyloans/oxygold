import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  TrendingUp,
  CalendarDays,
  X,
} from "lucide-react";

import leaseGoldVideo from "../assets/lease_Gold&sliver.mp4";

export default function LeaseGold() {
  const [showModal, setShowModal] = useState(false);

  const leaseBenefits = [
    "Gold & Silver Leasing",
    "Passive Income Opportunity",
    "Flexible Payout Options",
    "Utilize Idle Precious Metals",
  ];

  const payoutOptions = [
    "Monthly",
    "Quarterly",
    "Half-Yearly",
    "Yearly",
  ];

  useEffect(() => {
    if (!showModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowModal(false);
      }
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

          {/* LEFT: Image Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="group relative w-full max-w-[480px]">

              {/* Image Glow Backdrop */}
              <div className="absolute -inset-2 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#8A5BFF]/15 to-[#D4AF37]/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md p-4 sm:p-6 shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]">

                <video
                    src={leaseGoldVideo}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-auto object-contain rounded-xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">

            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D36C] text-[11px] sm:text-xs font-semibold self-start mb-3">
              <Sparkles size={13} className="animate-pulse" />
              <span>Make Your Precious Metals Work for You</span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
                Lease Your
              </span>{" "}
              GOLD & SILVER
            </h2>

            {/* Subtitle */}
            <p className="mt-2 text-sm sm:text-base font-medium text-[#F5D36C] leading-relaxed">
              Your Precious Metals. Your Earning Potential.
            </p>

            {/* Description */}
            <div className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/75 leading-relaxed">
              <p>
                Don't let your Gold & Silver sit idle. Unlock the
                earning potential of your precious metals with
                OXYGOLD.AI through Gold & Silver leasing opportunities.
              </p>

              <p>
                Give your precious metals a new purpose and explore
                potential passive income with flexible leasing plans
                designed around your financial goals.
              </p>
            </div>

            {/* Return Percentage Cards */}
            <div className="mt-5 grid grid-cols-2 gap-3">

              {/* Monthly Returns */}
              <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-3.5 sm:p-5 transition-all duration-300 hover:border-[#D4AF37]/60 hover:-translate-y-1">

                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#D4AF37]/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 text-white/60 text-[10px] sm:text-xs font-medium">
                    <TrendingUp
                      size={16}
                      className="text-[#F5D36C] shrink-0"
                    />
                    Monthly Returns
                  </div>

                  <div className="mt-2 text-xl sm:text-3xl font-extrabold text-[#F5D36C] tracking-tight">
                    0.75% – 1%
                  </div>

                  <p className="mt-1 text-[10px] sm:text-xs text-white/50">
                    Indicative monthly returns
                  </p>
                </div>
              </div>

              {/* Annual Returns */}
              <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-3.5 sm:p-5 transition-all duration-300 hover:border-[#D4AF37]/60 hover:-translate-y-1">

                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#D4AF37]/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 text-white/60 text-[10px] sm:text-xs font-medium">
                    <CalendarDays
                      size={16}
                      className="text-[#F5D36C] shrink-0"
                    />
                    Annual Returns
                  </div>

                  <div className="mt-2 text-xl sm:text-3xl font-extrabold text-[#F5D36C] tracking-tight">
                    9% – 13%
                  </div>

                  <p className="mt-1 text-[10px] sm:text-xs text-white/50">
                    Advertised annual returns
                  </p>
                </div>
              </div>
            </div>

            {/* Leasing Benefits */}
            <div className="mt-5 rounded-xl sm:rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#D4AF37]/10 via-white/[0.03] to-[#8A5BFF]/10 p-4 sm:p-5 backdrop-blur-sm">

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F5D36C] mb-3">
                <Award
                  size={18}
                  className="text-[#F5D36C] shrink-0"
                />
                <span>
                  Why Lease with OXYGOLD.AI?
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {leaseBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-white/90 transition-all hover:border-[#D4AF37]/40 hover:bg-white/[0.08]"
                  >
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400 shrink-0"
                    />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Flexible Payout Options */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm font-semibold text-[#F5D36C]">
                  <CalendarDays size={16} />
                  Flexible Payout Options
                </div>

                <div className="flex flex-wrap gap-2">
                  {payoutOptions.map((option) => (
                    <span
                      key={option}
                      className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3.5 py-1.5 text-[11px] sm:text-xs text-white/80 hover:bg-[#D4AF37]/15 hover:text-[#F5D36C] transition-colors"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Action */}
            <div className="mt-5 flex flex-col items-start gap-3">
                <a
                    href="https://www.ulp.oxybricks.world"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] text-[#1B053A] font-extrabold text-sm shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Explore Gold & Silver Leasing

                    <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                    />
                </a>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                    You will be redirected to{" "}
                    <span className="text-[#F5D36C] font-semibold">
                    ULP – OxyBricks
                    </span>
                    , one of our dedicated platforms, to explore Gold & Silver
                    leasing opportunities and get started.
                </p>
            </div>

            {/* Disclaimer */}
            <p className="mt-4 text-[10px] sm:text-[11px] text-white/45 leading-relaxed">
              *Returns are indicative and subject to applicable
              leasing terms, associated risks and TDS deductions.
              Returns are not guaranteed. Please review the lease
              agreement before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal Portal */}
      {showModal &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[2147483000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-modal-fade"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div
              className="relative flex flex-col w-full max-w-5xl h-[85dvh] max-h-[850px] overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-[#0F081D] shadow-[0_25px_70px_rgba(0,0,0,0.6)] animate-modal-scale"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lease-video-modal-title"
            >

              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-white/10 bg-[#160B2C]">
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                    OXYGOLD.AI
                  </span>

                  <h3
                    id="lease-video-modal-title"
                    className="text-sm sm:text-base font-bold text-white"
                  >
                    Lease Gold & Silver
                  </h3>

                  <p className="mt-0.5 text-[10px] sm:text-xs text-white/50">
                    Discover the earning potential of precious metals
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="shrink-0 p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer"
                  aria-label="Close video"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden">
                <video
                  src={leaseGoldVideo}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  Your browser does not support video playback.
                </video>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-center px-4 py-3 border-t border-white/10 bg-[#160B2C]">
                <p className="text-center text-[10px] sm:text-xs text-white/50">
                  Your Gold. Your Silver. Your Earning Potential.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal Animations */}
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalScaleUp {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-modal-fade {
          animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-modal-scale {
          animation: modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-modal-fade,
          .animate-modal-scale {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}