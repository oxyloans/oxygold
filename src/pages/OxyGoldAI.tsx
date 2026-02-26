import React from "react";
import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Sparkles,
  Lock,
  Wallet,
  Boxes,
  Landmark,
  BookOpen,
  FileScan,
  Truck,
  Scale,
  Coins,
} from "lucide-react";
import heroImage from "../assets/hero.png";
import BuyGoldCoins from "../components/BuyGoldCoins";
import OxyGoldFooter from "../components/OxyGoldFooter";
import GoldRatesDashboard from "../components/GoldRatesDashboard";
import AIBookSection from "../components/AIBookSection";
import DesignGoldOrnaments from "../components/DesignGoldOrnaments";

type AssetMap = {
  logo: string;
  heroPoster: string;
  personCutout: string;
  partnerLogos: string[];
};

type Props = { assets?: Partial<AssetMap> };

const BRAND = {
  purple: {
    primary: "#5B2EFF",
    deepBg: "#2B0A59",
    luxuryDark: "#3D0B7A",
    soft: "#8A5BFF",
    lightUI: "#EDE7FF",
  },
  gold: {
    primary: "#D4AF37",
    dark: "#B8962E",
    bright: "#F5D36C",
    softBg: "#FFF6D8",
    rich: "#C9A227",
  },
};

const DEFAULT_ASSETS: AssetMap = {
  logo: "/assets/oxygold-logo.png",
  heroPoster: heroImage,
  personCutout: "/assets/person.png",
  partnerLogos: ["/assets/brand-1.png", "/assets/brand-2.png", "/assets/brand-3.png", "/assets/brand-4.png"],
};

const provideCards = [
  {
    title: "FRACTIONAL DIGITAL GOLD",
    desc: "Start small. Grow securely with transparent pricing.",
    icon: <Wallet className="h-6 w-6" />,
  },
  {
    title: "AI-DRIVEN TRUST LAYER",
    desc: "Track & trace readiness, audit-friendly records, compliance focus.",
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  {
    title: "SECURE VAULTING",
    desc: "Vault-grade security aligned with wealth authority.",
    icon: <Lock className="h-6 w-6" />,
  },
  {
    title: "INSTANT LIQUIDITY",
    desc: "Buy/Sell anytime with smooth settlement flow.",
    icon: <Sparkles className="h-6 w-6" />,
  },
];

const trustBullets = [
  "Purple-first UI for authority & security",
  "Gold accents only for premium highlights (20% rule)",
  "Clean fintech experience (not jewelry / not flashy retail)",
  "Audit-ready, scalable platform architecture",
];

const modules8 = [
  { title: "DIGITAL GOLD", subtitle: "Buy • Sell • Store", icon: <Coins className="h-6 w-6" />, tag: "NEW" },
  { title: "GOLD SIP", subtitle: "Systematic investing", icon: <Boxes className="h-6 w-6" />, tag: "NEW" },
  { title: "GOLD INSURANCE", subtitle: "Protection layer", icon: <ShieldCheck className="h-6 w-6" />, tag: "NEW" },
  { title: "EDUCATION", subtitle: "Learn & grow", icon: <BookOpen className="h-6 w-6" />, tag: "NEW" },
  { title: "GOLD LOGISTICS", subtitle: "Secure movement", icon: <Truck className="h-6 w-6" />, tag: "NEW" },
  { title: "DOCUMENT SCANNING", subtitle: "KYC & records", icon: <FileScan className="h-6 w-6" />, tag: "NEW" },
  { title: "BUY ETF", subtitle: "Market exposure", icon: <Landmark className="h-6 w-6" />, tag: "NEW" },
  { title: "BUY PURE GOLD", subtitle: "999+ purity", icon: <Scale className="h-6 w-6" />, tag: "NEW" },
];

const testimonials = [
  { name: "Sarah Chen", role: "Investor", text: "Premium feel + secure vaulting. Clean fintech UI.", rating: 5 },
  { name: "Aparna Isha", role: "Professional", text: "Transparent pricing and trust-first experience.", rating: 5 },
  { name: "Caites Ruiz", role: "Trader", text: "Fast workflow. Smooth settlement.", rating: 4 },
];

export default function OxyGoldLandingPage({ assets }: Props) {
  const A = { ...DEFAULT_ASSETS, ...(assets || {}) };

  return (
    <div
      className="min-h-screen text-white font-poppins"
      style={{
        background: `radial-gradient(1200px 700px at 10% 10%, ${BRAND.purple.primary}24 0%, transparent 62%),
                     radial-gradient(900px 520px at 90% 18%, ${BRAND.gold.primary}14 0%, transparent 62%),
                     linear-gradient(180deg, ${BRAND.purple.deepBg} 0%, #07061A 70%, #050412 100%)`,
      }}
    >
      <BackgroundSystem />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* 2) HERO */}
        <section className="relative grid items-center gap-10 pb-14 pt-14 lg:grid-cols-2">
          <HeroLocalPattern />

          <div>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: `${BRAND.gold.primary}55`,
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND.gold.primary }} />
              IIBS 11 • INDIA INTERNATIONAL BULLION SUMMIT
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight font-playfair">
              Namaste{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${BRAND.gold.bright}, #ffffff, ${BRAND.purple.lightUI})`,
                }}
              >
                Mumbai
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-white/70">
              OXYGOLD.AI is building a{" "}
              <span className="font-semibold text-white/90">tech-driven gold platform</span> for multiple sectors —
              premium, secure, and audit-ready. (Not jewelry. Not flashy retail.)
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoChip icon={<CalendarDays className="h-4 w-4" />} label="27–28 February 2026" />
              <InfoChip icon={<MapPin className="h-4 w-4" />} label="The Westin Mumbai Powai Lake" />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold tracking-widest text-white/60">CO-FOUNDERS</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <BadgePill text="RADHAKRISHNA T • CO-FOUNDER" />
                <BadgePill text="RAMADEVI T • CO-FOUNDER" />
              </div>
            </div>

          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl blur-2xl"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple.primary}30, ${BRAND.gold.primary}18)` }}
            />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/40">
              <img src={A.heroPoster} alt="Hero Poster" className="w-full rounded-2xl object-cover" draggable={false} />
              <GlossSheen />
            </div>
          </div>
        </section>

        {/* 3) WHAT WE PROVIDE (glossy modern) */}
        <section id="provide" className="py-10">
          <SectionHeader
            kicker="OVERVIEW"
            title="What We Provide"
            subtitle="Digital gold + AI-driven trust layer for multiple sectors — designed like a premium bank-grade platform."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {provideCards.map((c) => (
              <GlassCard key={c.title}>
                <div className="flex items-start gap-4">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl border"
                    style={{
                      borderColor: `${BRAND.gold.primary}55`,
                      background: `linear-gradient(135deg, rgba(255,246,216,0.9), rgba(255,255,255,0.9))`,
                      color: BRAND.purple.luxuryDark,
                    }}
                  >
                    {c.icon}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold tracking-wide text-white/95">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{c.desc}</p>
                  </div>
                </div>

                <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-35">
                  <MiniCircuit />
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* 4) MODULES (premium gold-line glossy) */}
        <section id="modules" className="py-12">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
            <GoldFrameLines />

            <div
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: `${BRAND.purple.primary}55` }}
            />
            <div
              className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl opacity-25"
              style={{ backgroundColor: `${BRAND.gold.primary}55` }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-35" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent opacity-40" />

            <div className="relative p-6 sm:p-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.28em] text-white/55">
                    MULTI-SECTOR GOLD + AI PLATFORM
                  </p>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">OXYGOLD.AI Modules</h2>
                  <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">
                    A premium ecosystem for bullion and allied sectors — built like a{" "}
                    <span className="text-white/90 font-semibold">Digital Gold Bank</span>.
                  </p>
                </div>

                <div
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold"
                  style={{
                    borderColor: `${BRAND.gold.primary}55`,
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: BRAND.gold.bright }} />
                  GOLD-LINE • GLOSSY • MODERN
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {modules8.map((m) => (
                  <ModuleCard key={m.title} {...m} />
                ))}
              </div>

              <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </section>

        <div>
          <GoldRatesDashboard/>
        </div>

        <div className="py-10">
          <AIBookSection/>
        </div>


        {/* 5) TRUST */}
        <section id="trust" className="py-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
            <div className="pointer-events-none absolute -right-40 -top-40 opacity-50">
              <RingLines />
            </div>
            <div
              className="pointer-events-none absolute -left-32 bottom-[-120px] h-64 w-64 rounded-full blur-3xl"
              style={{ backgroundColor: `${BRAND.gold.primary}22` }}
            />
            <GlossSheen />

            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] text-white/60">TRUST & SECURITY</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">Trusted by Investors worldwide</h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/70">
                  Royal + modern + secure. Purple-first UI for authority and gold accents only for premium highlights.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {trustBullets.map((b) => (
                    <div key={b} className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <ShieldCheck className="mt-0.5 h-5 w-5" style={{ color: BRAND.gold.bright }} />
                      <p className="text-sm text-white/75">{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div
                  className="pointer-events-none absolute -inset-6 rounded-3xl blur-2xl"
                  style={{ background: `linear-gradient(135deg, ${BRAND.purple.primary}25, ${BRAND.gold.primary}16)` }}
                />
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="absolute -right-10 -top-10 opacity-35">
                    <WaveLines />
                  </div>
                  <div className="mx-auto grid place-items-center">
                    <div className="relative h-[320px] w-[320px] sm:h-[360px] sm:w-[360px]">
                      <div
                        className="absolute inset-0 rounded-full border"
                        style={{
                          borderColor: "rgba(255,255,255,0.12)",
                          background: `radial-gradient(circle at 30% 30%, ${BRAND.purple.primary}22, transparent 60%),
                                       radial-gradient(circle at 70% 70%, ${BRAND.gold.primary}18, transparent 55%)`,
                        }}
                      />
                      <div className="absolute inset-10 rounded-full border border-white/10 bg-white/5" />
                      <img
                        src={A.personCutout}
                        alt="Person"
                        className="absolute bottom-0 left-1/2 w-[80%] -translate-x-1/2 object-contain drop-shadow-2xl"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6) REVIEWS */}
        <section id="reviews" className="py-12">
          <SectionHeader kicker="REVIEWS" title="Loved by Investors" subtitle="Premium trust experience with clean fintech authority." />

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" style={{ color: BRAND.gold.bright, fill: BRAND.gold.bright }} />
              ))}
            </div>
            <span className="text-sm text-white/70">4.9 average rating</span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-5 relative overflow-hidden">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: `${BRAND.purple.primary}22` }} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/55">{t.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5" style={{ color: BRAND.gold.bright, fill: BRAND.gold.bright }} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </section>

        <BuyGoldCoins />

        <div className="py-10">
          <DesignGoldOrnaments/>
        </div>

        <section className="py-10">
        </section>

        <OxyGoldFooter/>
      </div>
    </div>
  );
}

/* ----------------------- UI helpers ----------------------- */

function SectionHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold tracking-[0.25em] text-white/55">{kicker}</p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">{subtitle}</p>
      <div
        className="mx-auto mt-5 h-[3px] w-20 rounded-full"
        style={{ background: `linear-gradient(90deg, ${BRAND.purple.soft}, ${BRAND.gold.bright})` }}
      />
    </div>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/25">
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      {children}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
        style={{ background: `linear-gradient(180deg, transparent, ${BRAND.purple.primary}12)` }}
      />
    </div>
  );
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
      <span className="text-white/80">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function BadgePill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/85">
      <BadgeCheck className="h-4 w-4 text-white/80" />
      {text}
    </span>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold tracking-wide">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-white/60">
        {items.map((it) => (
          <li key={it}>
            <a href="#" className="hover:text-white">{it}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------- Modules UI ----------------------- */

function ModuleCard({
  title,
  subtitle,
  icon,
  tag,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tag: string;
}) {
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
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold tracking-wide text-white/95">{title}</p>
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
        style={{ background: `linear-gradient(90deg, transparent, ${BRAND.gold.primary}, transparent)` }}
      />
    </div>
  );
}

function GoldFrameLines() {
  return (
    <>
      <svg className="pointer-events-none absolute left-0 top-0 opacity-55" width="520" height="260" viewBox="0 0 520 260" fill="none">
        <path d="M30 200 C 120 60, 260 40, 500 110" stroke="rgba(212,175,55,0.45)" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 225 C 140 85, 270 70, 500 140" stroke="rgba(245,211,108,0.22)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="225" r="4" fill="rgba(212,175,55,0.35)" />
        <circle cx="500" cy="140" r="4" fill="rgba(245,211,108,0.28)" />
      </svg>

      <svg className="pointer-events-none absolute bottom-0 right-0 opacity-55" width="520" height="260" viewBox="0 0 520 260" fill="none">
        <path d="M20 120 C 240 200, 360 210, 490 40" stroke="rgba(212,175,55,0.40)" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 150 C 250 220, 380 230, 500 70" stroke="rgba(245,211,108,0.20)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="150" r="4" fill="rgba(212,175,55,0.35)" />
        <circle cx="500" cy="70" r="4" fill="rgba(245,211,108,0.28)" />
      </svg>

      <div
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-40"
        style={{
          boxShadow: `inset 0 0 0 1px rgba(212,175,55,0.10), 0 0 0 1px rgba(255,255,255,0.03)`,
        }}
      />
    </>
  );
}

/* -------------------- Background / patterns -------------------- */

function BackgroundSystem() {
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

      <div className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full blur-2xl opacity-60" style={{ backgroundColor: `${BRAND.purple.primary}22` }} />
      <div className="absolute right-[12%] top-[38%] h-16 w-16 rounded-full blur-2xl opacity-55" style={{ backgroundColor: `${BRAND.gold.primary}22` }} />
      <div className="absolute left-[18%] bottom-[18%] h-20 w-20 rounded-full blur-2xl opacity-45" style={{ backgroundColor: `${BRAND.gold.primary}18` }} />

      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(135deg,#ffffff_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>
  );
}

function HeroLocalPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute right-[6%] top-[10%] hidden lg:block opacity-30">
        <RingLines />
      </div>

      <div className="absolute left-[-60px] top-[60px] hidden md:block opacity-30">
        <VerticalTechLines />
      </div>

      <div className="absolute left-[-120px] top-[40px] h-[240px] w-[240px] rounded-full blur-3xl opacity-35" style={{ backgroundColor: `${BRAND.purple.primary}33` }} />
      <div className="absolute left-[28%] bottom-[-100px] h-[260px] w-[260px] rounded-full blur-3xl opacity-25" style={{ backgroundColor: `${BRAND.gold.primary}22` }} />
    </div>
  );
}

function GlossSheen() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-40" />
      <div className="pointer-events-none absolute -left-40 top-10 h-64 w-64 rotate-12 rounded-full bg-white/10 blur-3xl opacity-30" />
    </>
  );
}

function RingLines() {
  return (
    <svg width="520" height="520" viewBox="0 0 520 520" fill="none" aria-hidden="true">
      <circle cx="260" cy="260" r="210" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      <circle cx="260" cy="260" r="170" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      <circle cx="260" cy="260" r="130" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      <circle cx="260" cy="260" r="90" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      <path d="M260 50 A210 210 0 0 1 450 210" stroke="rgba(212,175,55,0.22)" strokeWidth="2" strokeLinecap="round" />
      <path d="M70 310 A210 210 0 0 0 260 470" stroke="rgba(91,46,255,0.20)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WaveLines() {
  return (
    <svg width="560" height="560" viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <path d="M80 220 C 170 120, 300 120, 420 220 C 520 300, 520 420, 420 500" stroke="rgba(255,255,255,0.10)" strokeWidth="1.2" />
      <path d="M120 240 C 200 150, 320 150, 430 240 C 520 310, 520 420, 430 490" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
      <path d="M160 260 C 230 180, 340 180, 440 260 C 520 320, 520 420, 440 480" stroke="rgba(255,255,255,0.06)" strokeWidth="1.2" />
      <path d="M160 140 C 250 90, 360 90, 460 160" stroke="rgba(212,175,55,0.18)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function VerticalTechLines() {
  return (
    <svg width="160" height="380" viewBox="0 0 160 380" fill="none" aria-hidden="true">
      <path d="M30 10 V370" stroke="rgba(255,255,255,0.12)" />
      <path d="M60 30 V350" stroke="rgba(255,255,255,0.10)" />
      <path d="M90 10 V370" stroke="rgba(255,255,255,0.08)" />
      <path d="M120 30 V350" stroke="rgba(255,255,255,0.06)" />
      <circle cx="30" cy="90" r="5" fill="rgba(212,175,55,0.25)" />
      <circle cx="60" cy="210" r="4" fill="rgba(91,46,255,0.25)" />
      <circle cx="90" cy="140" r="4" fill="rgba(212,175,55,0.18)" />
      <circle cx="120" cy="280" r="5" fill="rgba(91,46,255,0.18)" />
    </svg>
  );
}

function MiniCircuit() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden="true">
      <path d="M40 40 H150 V90 H90 V160" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      <path d="M70 55 H135" stroke="rgba(212,175,55,0.22)" strokeWidth="2" />
      <circle cx="40" cy="40" r="6" fill="rgba(212,175,55,0.25)" />
      <circle cx="150" cy="40" r="6" fill="rgba(91,46,255,0.25)" />
      <circle cx="90" cy="160" r="6" fill="rgba(212,175,55,0.18)" />
    </svg>
  );
}