import React from "react";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import bookImage from "../assets/book.png";

export default function AIBookSection() {
  const openAskOxyBook = () => {
    window.open(
      "https://www.askoxy.ai/main/itemsdisplay/b3e1bf52-9f80-4179-b533-c9410affd8d2",
      "_self"
    );
  };

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
          {/* LEFT: Book Image Showcase (5 columns on desktop) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="group relative w-full max-w-[460px]">
              {/* Ambient Glow Backdrop */}
              <div className="absolute -inset-2 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#8A5BFF]/15 to-[#D4AF37]/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Showcase Container */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-black/40 backdrop-blur-md p-4 sm:p-6 shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                <img
                  src={bookImage}
                  alt="Enter the AI & GenAI Universe book cover"
                  className="w-full h-auto object-contain rounded-xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Content (7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Pre-title Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D36C] text-[11px] sm:text-xs font-semibold self-start mb-3">
              <Sparkles size={12} className="animate-pulse" />
              <span>Our Co-Founders are Authors of a Prestigious Book</span>
            </div>

            {/* BIG BOOK NAME */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Enter the{" "}
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
                AI & GenAI Universe
              </span>
            </h2>

            {/* Tagline */}
            <p className="mt-2 text-sm sm:text-base md:text-lg font-bold text-white/90">
              Build the Future with Agentic AI
            </p>

            {/* Description */}
            <p className="mt-3 text-xs sm:text-sm md:text-[15px] leading-relaxed text-white/75 max-w-xl">
              A beginner-friendly yet powerful guide to understand and use
              Artificial Intelligence in real life. With 65 practical,
              easy-to-follow chapters, it simplifies AI, Generative AI, Prompt
              Engineering, Large Language Models (LLMs), Agentic AI, and
              future AI careers.
            </p>

            {/* CTA Button */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={openAskOxyBook}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] text-[#1B053A] font-extrabold text-sm shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                type="button"
              >
                <BookOpen size={17} className="transition-transform group-hover:scale-110" />
                <span>Buy Now</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
