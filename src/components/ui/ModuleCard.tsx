import React from "react";

const BRAND = {
  purple: { deepBg: "#2B0A59", luxuryDark: "#3D0B7A" },
  gold: { primary: "#D4AF37", bright: "#F5D36C" },
};

type Props = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
};

export default function ModuleCard({ title, subtitle, icon: Icon, tag }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/7">
      <div
        className="pointer-events-none absolute left-0 top-0 h-[2px] w-full opacity-70"
        style={{
          background: `linear-gradient(90deg, transparent, ${BRAND.gold.primary}, ${BRAND.gold.bright}, transparent)`,
        }}
      />

      <div
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-35"
        style={{ backgroundColor: `${BRAND.gold.primary}55` }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-25" />

      <div className="relative flex items-start gap-4">
        <div
          className="grid h-12 w-12 place-items-center rounded-xl border"
          style={{
            borderColor: `${BRAND.gold.primary}55`,
            background: `linear-gradient(135deg, rgba(255,246,216,0.9), rgba(255,255,255,0.9))`,
            color: BRAND.purple.luxuryDark,
          }}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold tracking-wide text-white/95">
              {title}
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest"
              style={{
                background: `linear-gradient(90deg, ${BRAND.gold.primary}, ${BRAND.gold.bright})`,
                color: BRAND.purple.deepBg,
              }}
            >
              {tag}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/60">{subtitle}</p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[1px] w-full opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent, ${BRAND.gold.primary}, transparent)`,
        }}
      />
    </div>
  );
}
