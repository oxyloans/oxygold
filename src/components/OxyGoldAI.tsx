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
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import heroImage from "../assets/hero.png";
import BuyGoldCoins from "./BuyGoldCoins";
import OxyGoldFooter from "./OxyGoldFooter";
import GoldRatesDashboard from "./GoldRatesDashboard";
import AIBookSection from "./AIBookSection";
import DesignGoldOrnaments from "./DesignGoldOrnaments";
import LandingHeader from "../pages/LandingpageHeader";
import IBJAPartnerSection from "./Ibjapage";
import OxyEcosystem from "./OxyPlatforms";
import TrackTrace from "./TracknTrace";
import OurTeam from "./OurTeam";

import BackgroundSystem from "./backgrounds/BackgroundSystem";
import HeroLocalPattern from "./backgrounds/HeroLocalPattern";
import MiniCircuit from "./backgrounds/MiniCircuit";
import SectionHeader from "./ui/SectionHeader";
import GlassCard from "./ui/GlassCard";
import InfoChip from "./ui/InfoChip";
import BadgePill from "./ui/BadgePill";
import ModuleCard from "./ui/ModuleCard";
import GoldRatesTickerStrip from "./ui/GoldRatesTickerStrip";
import BuySilverSection from "./BuySilverSection";

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

  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300); // show after scrolling 300px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div
      id="top"
      className="min-h-screen text-white font-poppins overflow-x-hidden"
      style={{
        background: `linear-gradient(180deg, ${BRAND.purple.deepBg} 0%, #07061A 70%, #050412 100%)`,
      }}
    >
      <BackgroundSystem />

      <LandingHeader offsetPx={106} />

      <GoldRatesTickerStrip fixed top={72} height={34} />

      {/* ✅ Single real spacing (no extra blank container) */}
      <div
        className="mx-auto max-w-7xl px-4 sm:px-7 lg:px-8"
        style={{ paddingTop: 80 }}
      >
        {/* HERO SECTION */}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-7 lg:px-8">
        {/* HERO */}

        <section className="py-2 sm:py-12 lg:py-20">
          <TrackTrace />
        </section>
        <section
          id="hero"
          className="relative grid items-center gap-6 sm:gap-8 lg:gap-12 pb-4 sm:pb-8 lg:pb-10 pt-2 sm:pt-6 lg:pt-8 lg:grid-cols-2"
        >
          <HeroLocalPattern />

          {/* LEFT */}
          <div className="text-center lg:text-left px-2 pt-0 sm:px-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] sm:leading-tight font-playfair">
              Powering the Future of{" "}
              <span className="inline-block">
                Gold Intell
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${BRAND.gold.bright}, ${BRAND.gold.primary})`,
                  }}
                >
                  AI
                </span>
                gence
              </span>
            </h1>

            <p className="mt-4 mx-auto lg:mx-0 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-white/85">
              OXYGOLD.AI is engineering a next-generation gold ecosystem where
              benchmark pricing, compliance frameworks, and AI intelligence
              converge to modernize how gold is owned, validated, and scaled.
            </p>

            <p className="mt-3 mx-auto lg:mx-0 max-w-xl text-sm sm:text-base leading-relaxed text-white/65">
              We are building the foundational infrastructure layer powering
              trust in the modern gold economy.
            </p>

            {/* Leadership Section */}
            <div className="mt-6 sm:mt-8 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <p className="text-sm sm:text-base font-medium tracking-widest text-white/60">
                  CO-FOUNDERS
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center justify-center lg:justify-start gap-2 rounded-xl border border-white/15 bg-white/5 px-3 sm:px-4 py-3 text-xs sm:text-sm lg:text-base text-white/90 text-center lg:text-left">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 shrink-0" />
                  <div className="leading-snug">
                    <p className="font-medium">Radhakrishna Thatavarti</p>
                    <p className="text-white/60 text-[11px] sm:text-xs lg:text-sm">
                      Co-Founder & CEO
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2 rounded-xl border border-white/15 bg-white/5 px-3 sm:px-4 py-3 text-xs sm:text-sm lg:text-base text-white/90 text-center lg:text-left">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 shrink-0" />
                  <div className="leading-snug">
                    <p className="font-medium">Ramadevi Thatavarti</p>
                    <p className="text-white/60 text-[11px] sm:text-xs lg:text-sm">
                      Co-Founder & CTO
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center lg:justify-end pt-0">
            <img
              src={A.heroPoster}
              alt="Hero Poster"
              className="w-full max-w-sm sm:max-w-md lg:max-w-xl object-contain"
              draggable={false}
            />
          </div>
        </section>

        {/* ✅ Live Gold Rate */}
        <section id="live-rate" className="py-0 sm:py-8 lg:py-16">
          <GoldRatesDashboard />
        </section>

        {/* ✅ AI Book */}
        <section id="ai-book" className="py-0 sm:py-8 lg:py-12">
          <AIBookSection />
        </section>

        {/* ✅ Buy Gold Coins */}
        <section id="buy-coins" className="py-0 sm:py-8 lg:py-12">
          <BuyGoldCoins />
        </section>

        
        {/* ✅ Buy Gold Coins */}
        <section id="buy-coins" className="py-0 sm:py-8 lg:py-12">
          <BuySilverSection />
        </section>

        {/* ✅ IBJA */}
        <section id="ibja-partner" className="py-0 sm:py-8 lg:py-12">
          <IBJAPartnerSection />
        </section>

        {/* ✅ Design Jewellery */}
        <section id="design-jewellery" className="py-0 sm:py-8 lg:py-12">
          <DesignGoldOrnaments />
        </section>

        {/* ✅ Leadership Team */}
        <section id="leadership" className="py-2 sm:py-8 lg:py-12">
          <OurTeam />
        </section>

        {/* MAIN CONTENT SECTIONS */}
        <div className="space-y-0 sm:space-y-6">
          {/* ✅ What We Provide */}
          <section id="provide" className="py-2 sm:py-10">
            <SectionHeader
              kicker=""
              title="What We Provide"
              subtitle="Digital gold + AI-driven trust layer for multiple sectors — designed like a premium bank-grade platform."
            />

            <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {provideCards.map((c) => (
                <div
                  key={c.title}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 sm:p-5 transition hover:bg-white/10"
                >
                  <div className="relative flex items-start gap-3 sm:gap-4">
                    <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl border border-yellow-400/40 bg-gradient-to-br from-yellow-300/30 via-white/10 to-purple-500/20 text-yellow-400">
                      <div className="scale-95 sm:scale-100">{c.icon}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-white">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/70">
                        {c.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ✅ Modules */}
          <section id="modules" className="py-0 sm:py-6">
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
                <div className="text-center">
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-semibold leading-tight">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${BRAND.gold.bright}, ${BRAND.gold.primary})`,
                      }}
                    >
                      OXYGOLD.AI
                    </span>{" "}
                    Modules
                  </h2>

                  <p className="mt-2 sm:mt-3 mx-auto max-w-2xl text-xs sm:text-sm lg:text-base leading-relaxed text-white/70">
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
              </div>
            </div>
          </section>
        </div>

        {/* ✅ Platforms */}
        <section id="platforms" className="py-0 sm:py-8 lg:py-12">
          <OxyEcosystem />
          {/* OPTIONAL: If you want dropdown sub-links to scroll inside this section,
          add these anchors near each platform card inside OxyEcosystem component:
          <div id="platform-oxygold" />
          <div id="platform-askoxy" />
          <div id="platform-oxyloans" />
          <div id="platform-oxybricks" />
      */}
        </section>
      </div>

      {/* ✅ About/Footer */}
      <section id="about">
        <OxyGoldFooter />
      </section>

      {/* Scroll To Top Button */}
      {showScroll && (
        <button
          aria-label="scrollarrow"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${BRAND.purple.primary}, ${BRAND.gold.primary})`,
            }}
          >
            <ArrowUp className="text-white h-5 w-5" />
          </div>
        </button>
      )}
    </div>
  );
}
