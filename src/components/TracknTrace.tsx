import React from "react";
import trackImage from "../assets/trackImage.png";

export default function TracknTrace() {
  return (
    <section className="w-full">
      <div className="grid items-center gap-4 sm:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT CONTENT */}
        <div className="flex flex-col justify-center text-center lg:text-left px-3 sm:px-4 lg:px-0 py-6 sm:py-8 lg:py-0">
        

          <h1 className="mt-2 text-[28px] sm:text-[40px] md:text-[48px] lg:text-[60px] leading-[1.15] font-black text-white">
            Track & Trace{" "}
            <span className="bg-gradient-to-br from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
              Gold
            </span>
          </h1>
  <p className="pt-8 sm:pt-0 text-[11px] sm:text-[13px] font-extrabold tracking-[1.5px] uppercase bg-gradient-to-r from-white to-[#D4AF37] bg-clip-text text-transparent">
            Building Trust in the Gold Ecosystem
          </p>
          <p className="mt-3 text-[15px] sm:text-[18px] lg:text-[20px] font-semibold text-white/85 leading-[1.6] max-w-[760px] mx-auto lg:mx-0">
            A transparent platform designed for 5 million+ trusted customers
          </p>

          <p className="mt-3 text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.8] text-white/75 max-w-[760px] mx-auto lg:mx-0">
            We are building a Gold Track & Trace Platform designed to bring
            transparency, authenticity, and trust to the gold supply chain.
          </p>

          <p className="mt-2 text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.8] text-white/75 max-w-[760px] mx-auto lg:mx-0">
            Every stage of gold — from origin to customer purchase — will be
            securely recorded. This enables customers to verify the true journey
            of their gold and builds confidence across the entire ecosystem.
          </p>

          <div className="mt-4 sm:mt-6">
            <p className="mb-3 text-[13px] sm:text-[15px] font-extrabold text-[#F5D36C] leading-[1.5]">
              We invite industry participants to join our platform:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {[
                "Mining Companies",
                "Refineries",
                "Importers",
                "Jewellery Retailers",
                "Bullion Companies",
                "Digital Gold Platforms",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-2.5 py-2.5 text-white text-[11px] sm:text-[14px] font-semibold text-center leading-[1.3]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.8] text-white/75 max-w-[760px] mx-auto lg:mx-0">
            By joining our platform, you can build credibility, transparency,
            and direct trust with millions of customers.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center lg:justify-end pt-0">
          <div className="w-full max-w-[330px] sm:max-w-[430px] lg:max-w-[540px]">
            <img
              src={trackImage}
              alt="Track and Trace Gold"
              className="w-full h-auto object-contain block drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
