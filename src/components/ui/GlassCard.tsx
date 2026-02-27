import React from "react";

const BRAND = {
  purple: { primary: "#5B2EFF" },
};

type Props = {
  children: React.ReactNode;
};

export default function GlassCard({ children }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/25">
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      {children}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
        style={{
          background: `linear-gradient(180deg, transparent, ${BRAND.purple.primary}12)`,
        }}
      />
    </div>
  );
}
