import { useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  TrendingUp,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  ListChecks,
  HelpCircle,
  X,
} from "lucide-react";

import leaseGoldVideo from "../assets/lease_Gold&sliver.mp4";

export default function LeaseGold() {
  const videoDialogRef = useRef<HTMLDialogElement>(null);
  const modalTitleId = useId();

  const leaseBenefits = [
    "Gold & Silver Leasing",
    "Passive Income Opportunity",
    "Flexible Payout Options",
    "Utilize Idle Precious Metals",
  ];

  const payoutOptions = ["Monthly", "Quarterly", "Half-Yearly", "Yearly"];

  const landingHighlights = [
    { label: "Steps to Participate", icon: ListChecks, hash: "#steps-to-participate" },
    { label: "Sample TDS Certificate", icon: FileCheck2, hash: "#sample-tds" },
    { label: "Leasing FAQs", icon: HelpCircle, hash: "#lease-faqs" },
  ];

  // Light-dismiss fallback for browsers without <dialog closedby="any">
  useEffect(() => {
    const dialog = videoDialogRef.current;
    if (!dialog || "closedBy" in HTMLDialogElement.prototype) return;

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };

    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) dialog.close();
    };

    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("pointerup", onPointerUp);
    return () => {
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

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
          {/* LEFT: 9:16 Vertical Reel Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="group relative w-full max-w-[270px] sm:max-w-[300px] lg:max-w-[320px]">
              {/* Glow Backdrop */}
              <div className="absolute -inset-2.5 rounded-[28px] bg-gradient-to-b from-[#D4AF37]/25 via-[#8A5BFF]/20 to-[#D4AF37]/15 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Reel Frame */}
              <div className="relative overflow-hidden rounded-[24px] border border-[#D4AF37]/30 bg-[#0A0416] p-2 shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                <div className="overflow-hidden rounded-[18px] bg-black">
                  <video
                    src={leaseGoldVideo}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label="Lease Gold and Silver overview video"
                    className="block aspect-[9/16] w-full bg-black object-contain"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 px-2 pt-2.5 pb-1">
                  <span className="text-[11px] font-medium text-white/70">
                    Program Reel
                  </span>
                  <button
                    type="button"
                    onClick={() => videoDialogRef.current?.showModal()}
                    className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-[#F5D36C] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15 transition-colors"
                  >
                    <PlayCircle size={13} />
                    <span>Expand</span>
                  </button>
                </div>
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
              GOLD &amp; SILVER
            </h2>

            {/* Subtitle */}
            <p className="mt-2 text-sm sm:text-base font-medium text-[#F5D36C] leading-relaxed">
              Your Precious Metals. Your Earning Potential.
            </p>

            {/* Description */}
            <div className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/75 leading-relaxed">
              <p>
                Don&apos;t let your Gold &amp; Silver sit idle. Unlock the
                earning potential of your precious metals with OXYGOLD.AI in
                association with{" "}
                <strong className="text-white">
                  Radhakrishna Jewellery And Gold Finance
                </strong>{" "}
                as the collecting partner.
              </p>

              <p>
                Give your precious metals a new purpose and explore potential
                passive income with flexible leasing plans designed around your
                financial goals.
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
                <Award size={18} className="text-[#F5D36C] shrink-0" />
                <span>Why Lease with OXYGOLD.AI?</span>
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

            {/* Quick Links to Dedicated Landing Page Sections */}
            <div className="mt-4 flex flex-wrap gap-2">
              {landingHighlights.map((item) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={`/lease-gold${item.hash}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] sm:text-xs font-medium text-white/80 hover:border-[#D4AF37]/50 hover:text-[#F5D36C] transition-colors"
                  >
                    <IconComp size={13} className="text-[#F5D36C]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/certificates"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] sm:text-xs font-medium text-white/80 hover:border-[#D4AF37]/50 hover:text-[#F5D36C] transition-colors"
              >
                <Award size={13} className="text-[#F5D36C]" />
                <span>Our Certificates</span>
              </Link>
            </div>

            {/* CTA Action */}
            <div className="mt-5 flex flex-col items-start gap-3">
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to="/lease-gold"
                  className="group inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] px-6 py-3.5 text-sm font-extrabold text-[#1B053A] shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                >
                  <span>Explore Gold &amp; Silver Leasing</span>
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="https://www.ulp.oxybricks.world"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-white/[0.05] px-4 py-3.5 text-xs font-bold text-[#F5D36C] transition-all hover:bg-[#D4AF37]/15 sm:w-auto sm:text-sm"
                >
                  <span>ULP – OxyBricks Portal</span>
                  <ExternalLink size={15} />
                </a>
              </div>

              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Explore complete steps to participate, sample TDS certificate,
                and FAQs on our leasing page, or proceed directly to{" "}
                <span className="text-[#F5D36C] font-semibold">
                  ULP – OxyBricks
                </span>{" "}
                to get started.
              </p>
            </div>

            {/* Disclaimer */}
            <p className="mt-4 text-[10px] sm:text-[11px] text-white/45 leading-relaxed">
              *Returns are indicative and subject to applicable leasing terms,
              associated risks and TDS deductions. Returns are not guaranteed.
              Please review the lease agreement before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Native <dialog> Portrait Reel Video Modal */}
      <dialog
        ref={videoDialogRef}
        aria-labelledby={modalTitleId}
        {...({ closedby: "any" } as Record<string, string>)}
        onClose={() => {
          const video = videoDialogRef.current?.querySelector("video");
          if (video) video.pause();
        }}
        className="lease-card-dialog w-[min(94vw,430px)] max-h-[92dvh] rounded-2xl border border-[#D4AF37]/25 bg-[#0F081D] text-white p-0 shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        <div className="flex flex-col max-h-[92dvh]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-[#160B2C]">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                OXYGOLD.AI
              </span>
              <h1
                id={modalTitleId}
                className="text-sm font-bold text-white m-0"
              >
                Lease Gold &amp; Silver
              </h1>
            </div>

            <form method="dialog">
              <button
                type="submit"
                autoFocus
                className="shrink-0 p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer"
                aria-label="Close video"
              >
                <X size={18} />
              </button>
            </form>
          </div>

          <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden p-2.5">
            <video
              src={leaseGoldVideo}
              controls
              playsInline
              preload="metadata"
              className="block aspect-[9/16] max-h-[75dvh] w-full rounded-xl bg-black object-contain"
            >
              Your browser does not support video playback.
            </video>
          </div>

          <div className="flex items-center justify-center px-4 py-2.5 border-t border-white/10 bg-[#160B2C]">
            <p className="text-center text-[11px] text-white/50 m-0">
              Your Gold. Your Silver. Your Earning Potential.
            </p>
          </div>
        </div>
      </dialog>

      <style>{`
        dialog.lease-card-dialog:modal {
          margin: auto;
          overscroll-behavior: contain;
        }
        dialog.lease-card-dialog::backdrop {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(6px);
          overflow: hidden;
          overscroll-behavior: contain;
        }
      `}</style>
    </section>
  );
}
