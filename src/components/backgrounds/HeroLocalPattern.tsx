import React from "react";
import RingLines from "./RingLines";
import VerticalTechLines from "./VerticalTechLines";

const BRAND = {
  purple: { primary: "#5B2EFF" },
  gold: { primary: "#D4AF37" },
};

export default function HeroLocalPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute right-[6%] top-[10%] hidden lg:block opacity-30">
        <RingLines />
      </div>

      <div className="absolute left-[-60px] top-[60px] hidden md:block opacity-30">
        <VerticalTechLines />
      </div>

      <div
        className="absolute left-[-120px] top-[40px] h-[240px] w-[240px] rounded-full blur-3xl opacity-35"
        style={{ backgroundColor: `${BRAND.purple.primary}33` }}
      />
      <div
        className="absolute left-[28%] bottom-[-100px] h-[260px] w-[260px] rounded-full blur-3xl opacity-25"
        style={{ backgroundColor: `${BRAND.gold.primary}22` }}
      />
    </div>
  );
}
