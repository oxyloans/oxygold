import React from "react";
import RingLines from "./RingLines";
import WaveLines from "./WaveLines";

const BRAND = {
  purple: { primary: "#5B2EFF" },
  gold: { primary: "#D4AF37" },
};

export default function BackgroundSystem() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="absolute -right-48 -top-48 opacity-45">
        <RingLines />
      </div>
      <div className="absolute -left-56 top-[20%] opacity-28">
        <RingLines />
      </div>

      <div className="absolute left-0 top-0 opacity-16">
        <WaveLines />
      </div>
      <div className="absolute right-0 bottom-0 opacity-12 scale-x-[-1]">
        <WaveLines />
      </div>

      <div
        className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full blur-2xl opacity-60"
        style={{ backgroundColor: `${BRAND.purple.primary}22` }}
      />
      <div
        className="absolute right-[12%] top-[38%] h-16 w-16 rounded-full blur-2xl opacity-55"
        style={{ backgroundColor: `${BRAND.gold.primary}22` }}
      />
      <div
        className="absolute left-[18%] bottom-[18%] h-20 w-20 rounded-full blur-2xl opacity-45"
        style={{ backgroundColor: `${BRAND.gold.primary}18` }}
      />

      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(135deg,#ffffff_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>
  );
}
