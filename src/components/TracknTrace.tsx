
import { Sparkles, Layers, CheckCircle2 } from "lucide-react";
import trackImage from "../assets/trackImage.png";

export default function TracknTrace() {
  const participants = [
    "Mining Companies",
    "Refineries",
    "Importers",
    "Jewellery Retailers",
    "Bullion Companies",
    "Digital Gold Platforms",
  ];

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
          {/* LEFT CONTENT (7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D36C] text-[11px] sm:text-xs font-semibold self-start mb-3">
              <Sparkles size={12} className="animate-pulse" />
              <span>Building Trust in the Gold Ecosystem</span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Track & Trace{" "}
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
                Gold
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mt-2 text-sm sm:text-base md:text-lg font-bold text-white/90 leading-relaxed">
              A transparent platform designed for 5 million+ trusted customers
            </p>

            {/* Descriptions */}
            <div className="mt-4 space-y-2.5 text-xs sm:text-sm md:text-[15px] leading-relaxed text-white/75">
              <p>
                We are building a Gold Track & Trace Platform designed to bring
                transparency, authenticity, and trust to the gold supply chain.
              </p>
              <p>
                Every stage of gold — from origin to customer purchase — will be
                securely recorded. This enables customers to verify the true journey
                of their gold and builds confidence across the entire ecosystem.
              </p>
            </div>

            {/* Industry Participants Card */}
            <div className="mt-6 rounded-xl sm:rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-br from-[#D4AF37]/10 via-white/[0.03] to-[#8A5BFF]/10 p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F5D36C] mb-3">
                <Layers size={16} className="text-[#F5D36C] shrink-0" />
                <span>We invite industry participants to join our platform:</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {participants.map((item) => (
                  <div
                    key={item}
                    className="group/chip flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center text-xs sm:text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-white/[0.08] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(212,175,55,0.15)]"
                  >
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 group-hover/chip:scale-110 transition-transform" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Closing text */}
            <p className="mt-4 text-xs sm:text-sm md:text-[15px] leading-relaxed text-white/75">
              By joining our platform, you can build credibility, transparency,
              and direct trust with millions of customers.
            </p>
          </div>

          {/* RIGHT IMAGE (5 columns on desktop) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="group relative w-full max-w-[500px]">
              {/* Image Glow Backdrop */}
              <div className="absolute -inset-2 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#8A5BFF]/15 to-[#D4AF37]/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Showcase Container */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md p-4 sm:p-6 shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                <img
                  src={trackImage}
                  alt="Track and Trace Gold"
                  className="w-full h-auto object-contain rounded-xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
