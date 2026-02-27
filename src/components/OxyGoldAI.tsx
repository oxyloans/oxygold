import {
  Coins,
  Boxes,
  Sparkles,
  Lock,
  MapPin,
  ShieldCheck,
  CalendarDays,
  Truck,
  Wallet,
  Landmark,
  Scale,
} from "lucide-react";

import heroImage from "../assets/hero.png";
import BuyGoldCoins from "./BuyGoldCoins";
import OxyGoldFooter from "./OxyGoldFooter";
import GoldRatesDashboard from "./GoldRatesDashboard";
import AIBookSection from "./AIBookSection";
import DesignGoldOrnaments from "./DesignGoldOrnaments";
import LandingHeader from "../pages/LandingpageHeader";
import IBJAPartnerSection from "./Ibjapage";
import OxyEcosystem from "./OxyPlatforms";

import BackgroundSystem from "./backgrounds/BackgroundSystem";
import HeroLocalPattern from "./backgrounds/HeroLocalPattern";
import MiniCircuit from "./backgrounds/MiniCircuit";
import SectionHeader from "./ui/SectionHeader";
import GlassCard from "./ui/GlassCard";
import InfoChip from "./ui/InfoChip";
import BadgePill from "./ui/BadgePill";
import ModuleCard from "./ui/ModuleCard";

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
  partnerLogos: [
    "/assets/brand-1.png",
    "/assets/brand-2.png",
    "/assets/brand-3.png",
    "/assets/brand-4.png",
  ],
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
  {
    title: "DIGITAL GOLD",
    subtitle: "Buy • Sell • Store",
    icon: Coins,
    tag: "NEW",
  },
  {
    title: "GOLD SIP",
    subtitle: "Systematic investing",
    icon: Boxes,
    tag: "NEW",
  },
  {
    title: "GOLD INSURANCE",
    subtitle: "Protection layer",
    icon: ShieldCheck,
    tag: "NEW",
  },
  {
    title: "GOLD SAVINGS",
    subtitle: "Goal-based saving plans",
    icon: CalendarDays,
    tag: "NEW",
  },
  {
    title: "GOLD LOGISTICS",
    subtitle: "Secure movement",
    icon: Truck,
    tag: "NEW",
  },
  {
    title: "GOLD LOAN",
    subtitle: "Instant credit line",
    icon: Wallet,
    tag: "NEW",
  },
  { title: "BUY ETF", subtitle: "Market exposure", icon: Landmark, tag: "NEW" },
  { title: "BUY PURE GOLD", subtitle: "999+ purity", icon: Scale, tag: "NEW" },
];

export default function OxyGoldLandingPage({ assets }: Props) {
  const A = { ...DEFAULT_ASSETS, ...(assets || {}) };

  return (
    <div
      className="min-h-screen text-white font-poppins overflow-x-hidden"
      style={{
        background: `linear-gradient(180deg, ${BRAND.purple.deepBg} 0%, #07061A 70%, #050412 100%)`,
      }}
    >
      <BackgroundSystem />
      <LandingHeader />

      <div className="mx-auto  max-w-7xl px-4 sm:px-7 lg:px-8">
        {/* HERO (CLEAN IMAGE + PROPER SPACING) */}
        <section className="relative grid items-center gap-6 sm:gap-10 lg:gap-16 pb-8 sm:pb-10 pt-16 sm:pt-20 lg:pt-24 lg:grid-cols-2">
          <HeroLocalPattern />

          {/* LEFT */}
          <div className="text-center lg:text-left px-2 pt-10 sm:px-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight font-playfair">
              Namaste{" "}
              <span
                className="relative inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${BRAND.gold.bright} 0%, ${BRAND.gold.primary} 28%, ${BRAND.purple.soft} 62%, #ffffff 100%)`,
                  filter: "drop-shadow(0 10px 28px rgba(212,175,55,0.22))",
                }}
              >
                Mumbai
                <span
                  className="pointer-events-none absolute -inset-x-2 -bottom-1 h-[8px] sm:h-[10px] rounded-full opacity-70"
                  style={{
                    background: `linear-gradient(90deg, ${BRAND.gold.primary}40, ${BRAND.gold.bright}55, ${BRAND.purple.soft}35)`,
                    filter: "blur(8px)",
                  }}
                />
              </span>
            </h1>

            <p className="mt-3 sm:mt-4 mx-auto lg:mx-0 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-white/90 p-2 rounded-lg">
              Our{" "}
              <span className="font-extrabold text-yellow-400 bg-yellow-400/10 px-1 rounded">
                Co-Founders
              </span>{" "}
              Are Attending the{" "}
              <span className="font-extrabold text-white bg-white/10 px-1 rounded">
                11th India International Bullion Summit
              </span>{" "}
              <span className="font-bold text-yellow-300 bg-yellow-300/10 px-1 rounded">
                (IIBS 11)
              </span>
              <br className="hidden sm:block" />
              <span className="inline sm:inline"> </span>
              <span className="font-bold text-white/80">Join Us</span> & Be Part
              of the Experience.
            </p>

            <div className="mt-4 sm:mt-5 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
              <p className="text-xs font-semibold tracking-widest text-white/60">
                CO-FOUNDERS
              </p>
              <div className="mt-2 sm:mt-3 flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                <BadgePill text="RADHAKRISHNA T • CO-FOUNDER" />
                <BadgePill text="RAMADEVI T • CO-FOUNDER" />
              </div>
            </div>

            <div className="mt-3 sm:mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
              <InfoChip
                icon={<CalendarDays className="h-4 w-4" />}
                label="27–28 Feb 2025"
              />
              <InfoChip
                icon={<MapPin className="h-4 w-4" />}
                label="The Westin Mumbai Powai Lake"
              />
            </div>
          </div>

          {/* RIGHT — PLAIN IMAGE */}
          <div className="flex justify-center lg:justify-end pt-6 lg:mt-0">
            <img
              src={A.heroPoster}
              alt="Hero Poster"
              className="w-full max-w-sm sm:max-w-md lg:max-w-xl object-contain"
              draggable={false}
            />
          </div>
        </section>

        <div className="py-4 sm:py-8 lg:py-16">
          <GoldRatesDashboard />
        </div>

        <div className="  py-4 sm:py-8 lg:py-12">
          <AIBookSection />
        </div>
        <div className="py-4 sm:py-8 lg:py-12">
          <BuyGoldCoins />
        </div>
        <div className="py-4 sm:py-8 lg:py-12">
          <DesignGoldOrnaments />
        </div>

        {/* MAIN CONTENT SECTIONS */}
        <div className="space-y-4 sm:space-y-6">
          {/* 4) MODULES (premium gold-line glossy) */}
          <section id="modules" className="py-4 sm:py-6">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[20px] border border-white/10 bg-white/5">
              <div
                className="pointer-events-none absolute -left-12 sm:-left-20 lg:-left-24 -top-12 sm:-top-20 lg:-top-24 h-40 w-40 sm:h-56 sm:w-56 lg:h-72 lg:w-72 rounded-full blur-3xl opacity-30"
                style={{ backgroundColor: `${BRAND.purple.primary}55` }}
              />
              <div
                className="pointer-events-none absolute -right-12 sm:-right-20 lg:-right-24 -bottom-12 sm:-bottom-20 lg:-bottom-24 h-40 w-40 sm:h-56 sm:w-56 lg:h-72 lg:w-72 rounded-full blur-3xl opacity-25"
                style={{ backgroundColor: `${BRAND.gold.primary}55` }}
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-35" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-12 sm:h-20 lg:h-24 bg-gradient-to-b from-white/10 to-transparent opacity-40" />

              <div className="relative px-3 py-4 sm:p-6 lg:p-10">
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-semibold leading-tight">
                    OXYGOLD.AI Modules
                  </h2>
                  <p className="mt-2 sm:mt-3 mx-auto sm:mx-0 max-w-2xl text-xs sm:text-sm lg:text-base leading-relaxed text-white/70">
                    A premium ecosystem for bullion and allied sectors — built
                    like a{" "}
                    <span className="text-white/90 font-semibold">
                      Digital Gold Bank
                    </span>
                    .
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 lg:mt-8 grid gap-2.5 sm:gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {modules8.map((m) => (
                    <ModuleCard key={m.title} {...m} />
                  ))}
                </div>

                <div className="mt-5 sm:mt-8 lg:mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          </section>

          {/* 3) WHAT WE PROVIDE (glossy modern) */}
          <section id="provide" className="py-4 sm:py-6">
            <SectionHeader
              kicker=""
              title="What We Provide"
              subtitle="Digital gold + AI-driven trust layer for multiple sectors — designed like a premium bank-grade platform."
            />

            <div className="mt-5 sm:mt-6 lg:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {provideCards.map((c) => (
                <GlassCard key={c.title}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-lg sm:rounded-xl border"
                      style={{
                        borderColor: `${BRAND.gold.primary}55`,
                        background: `linear-gradient(135deg, rgba(255,246,216,0.9), rgba(255,255,255,0.9))`,
                        color: BRAND.purple.luxuryDark,
                      }}
                    >
                      <div className="scale-90 sm:scale-100">{c.icon}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-white/95">
                        {c.title}
                      </h3>
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-white/65">
                        {c.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-35">
                    <MiniCircuit />
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        </div>

        <div className="py-4 sm:py-8 lg:py-12">
          <IBJAPartnerSection />
        </div>
        <div className="py-4 sm:py-8 lg:py-12">
          <OxyEcosystem />
        </div>
      </div>

      <OxyGoldFooter />
    </div>
  );
}
