import {
  Coins,
  Boxes,
  Sparkles,
  Lock,
  ShieldCheck,
  CalendarDays,
  Truck,
  Wallet,
  Landmark,
  Scale,
  CheckCircle2,
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

import SectionHeader from "./ui/SectionHeader";
import ModuleCard from "./ui/ModuleCard";
import GoldRatesTickerStrip from "./ui/GoldRatesTickerStrip";
import BuySilverSection from "./BuySilverSection";
import GoldProductsLanding from "./GoldProductsLanding";

type AssetMap = {
  logo: string;
  heroPoster: string;
  personCutout: string;
  partnerLogos: string[];
};

type Props = {
  assets?: Partial<AssetMap>;
};

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
    icon: <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />,
    hoverBorder: "hover:border-[#D4AF37]/50",
    iconBg: "from-[#D4AF37]/20 to-[#D4AF37]/5 text-[#F5D36C] border-[#D4AF37]/40",
  },
  {
    title: "AI-DRIVEN TRUST LAYER",
    desc: "Track & trace readiness, audit-friendly records, compliance focus.",
    icon: <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />,
    hoverBorder: "hover:border-[#8A5BFF]/50",
    iconBg: "from-[#8A5BFF]/20 to-[#8A5BFF]/5 text-[#A78BFA] border-[#8A5BFF]/40",
  },
  {
    title: "SECURE VAULTING",
    desc: "Vault-grade security aligned with wealth authority.",
    icon: <Lock className="h-5 w-5 sm:h-6 sm:w-6" />,
    hoverBorder: "hover:border-[#D4AF37]/50",
    iconBg: "from-[#D4AF37]/20 to-[#D4AF37]/5 text-[#F5D36C] border-[#D4AF37]/40",
  },
  {
    title: "INSTANT LIQUIDITY",
    desc: "Buy/Sell anytime with smooth settlement flow.",
    icon: <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />,
    hoverBorder: "hover:border-emerald-400/50",
    iconBg: "from-emerald-400/20 to-emerald-400/5 text-emerald-400 border-emerald-400/40",
  },
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
  {
    title: "BUY ETF",
    subtitle: "Market exposure",
    icon: Landmark,
    tag: "NEW",
  },
  {
    title: "BUY PURE GOLD",
    subtitle: "999+ purity",
    icon: Scale,
    tag: "NEW",
  },
];

export default function OxyGoldLandingPage({ assets }: Props) {
  const A = { ...DEFAULT_ASSETS, ...(assets || {}) };

  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
      className="min-h-screen w-full overflow-x-hidden bg-[#0B021D] font-poppins text-white"
      style={{
        backgroundColor: "#0B021D",
        background:
          "linear-gradient(180deg, #2B0A59 0%, #1B063D 50%, #0B021D 100%)",
      }}
    >
      {/* Header */}
      <LandingHeader offsetPx={106} />

      {/* Gold Rates Ticker */}
      <GoldRatesTickerStrip fixed top={72} height={34} />

      {/* Main Content */}
      <main className="relative z-10 space-y-10 sm:space-y-14 lg:space-y-20">

        {/* Gold Jewellery Products */}
        <section
          id="gold-products"
          className="scroll-mt-28"
        >
          <GoldProductsLanding />
        </section>

        {/* Buy Gold Coins */}
        {/* <section
          id="buy-coins"
          className="scroll-mt-28"
        >
          <BuyGoldCoins />
        </section> */}

        {/* Main Container */}
        <div className="mx-auto w-full max-w-7xl sm:px-4 px-2">

          <div className="space-y-10 sm:space-y-14 lg:space-y-20">

            {/* HERO */}
            <section
              id="hero"
              className="
                relative
                grid
                items-center
                gap-8
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-white/[0.035]
                px-4
                py-8
                sm:gap-10
                sm:rounded-3xl
                sm:px-8
                sm:py-12
                lg:grid-cols-2
                lg:gap-14
                lg:px-12
                lg:py-16
              "
            >

              {/* LEFT CONTENT */}
              <div className="px-2 pt-0 text-center sm:px-0 lg:text-left">

                <h1
                  className="
                    font-playfair
                    text-2xl
                    font-extrabold
                    leading-[1.15]
                    sm:text-3xl
                    md:text-4xl
                    lg:text-5xl
                    sm:leading-tight
                  "
                >
                  Powering the Future of{" "}

                  <span className="inline-block">
                    Gold Intell

                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(
                          90deg,
                          ${BRAND.gold.bright},
                          ${BRAND.gold.primary}
                        )`,
                      }}
                    >
                      AI
                    </span>

                    gence
                  </span>
                </h1>

                <p
                  className="
                    mx-auto
                    mt-4
                    max-w-xl
                    text-sm
                    leading-relaxed
                    text-white/85
                    sm:text-base
                    lg:mx-0
                    lg:text-lg
                  "
                >
                  OXYGOLD.AI is engineering a next-generation gold ecosystem
                  where benchmark pricing, compliance frameworks, and AI
                  intelligence converge to modernize how gold is owned,
                  validated, and scaled.
                </p>

                <p
                  className="
                    mx-auto
                    mt-3
                    max-w-xl
                    text-sm
                    leading-relaxed
                    text-white/65
                    sm:text-base
                    lg:mx-0
                  "
                >
                  We are building the foundational infrastructure layer
                  powering trust in the modern gold economy.
                </p>

                {/* Leadership */}
                <div className="mx-auto mt-6 max-w-xl sm:mt-8 lg:mx-0">

                  {/* Clean Heading - No Decorative Lines */}
                  <div className="mb-4 text-center lg:text-left">
                    <p
                      className="
                        text-sm
                        font-medium
                        tracking-[0.25em]
                        text-white/60
                        sm:text-base
                      "
                    >
                      CO-FOUNDERS
                    </p>
                  </div>

                  {/* Founder Cards */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">

                    {/* Founder 1 */}
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.045]
                        px-3
                        py-3
                        text-center
                        text-xs
                        text-white/90
                        transition
                        duration-200
                        hover:border-white/20
                        hover:bg-white/[0.065]
                        sm:px-4
                        sm:text-sm
                        lg:justify-start
                        lg:text-left
                        lg:text-base
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          shrink-0
                          rounded-full
                          bg-yellow-400
                        "
                      />

                      <div className="leading-snug">
                        <p className="font-medium">
                          Radhakrishna Thatavarti
                        </p>

                        <p
                          className="
                            text-[11px]
                            text-white/60
                            sm:text-xs
                            lg:text-sm
                          "
                        >
                          Co-Founder & CEO
                        </p>
                      </div>
                    </div>

                    {/* Founder 2 */}
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.045]
                        px-3
                        py-3
                        text-center
                        text-xs
                        text-white/90
                        transition
                        duration-200
                        hover:border-white/20
                        hover:bg-white/[0.065]
                        sm:px-4
                        sm:text-sm
                        lg:justify-start
                        lg:text-left
                        lg:text-base
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          shrink-0
                          rounded-full
                          bg-yellow-400
                        "
                      />

                      <div className="leading-snug">
                        <p className="font-medium">
                          Ramadevi Thatavarti
                        </p>

                        <p
                          className="
                            text-[11px]
                            text-white/60
                            sm:text-xs
                            lg:text-sm
                          "
                        >
                          Co-Founder & CTO
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* RIGHT - HERO IMAGE */}
              <div className="flex justify-center pt-0 lg:justify-end">
                <img
                  src={A.heroPoster}
                  alt="Hero Poster"
                  className="
                    w-full
                    max-w-sm
                    object-contain
                    sm:max-w-md
                    lg:max-w-xl
                  "
                  draggable={false}
                />
              </div>

            </section>

            {/* Track & Trace */}
            <section className="scroll-mt-28">
              <TrackTrace />
            </section>

            {/* Buy Silver Coins */}
            {/* <section
              id="buy-silver-coins"
              className="-mx-4 w-[calc(100%+2rem)] scroll-mt-28 sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]"
            >
              <BuySilverSection />
            </section> */}

            {/* AI Book */}
            <section
              id="ai-book"
              className="py-0"
            >
              <AIBookSection />
            </section>

            {/* Live Gold Rate */}
            <section
              id="live-rate"
              className="py-0"
            >
              <GoldRatesDashboard />
            </section>

            {/* IBJA Partner */}
            <section
              id="ibja-partner"
              className="py-0"
            >
              <IBJAPartnerSection />
            </section>

            {/* Design Jewellery */}
            <section
              id="design-jewellery"
              className="py-0"
            >
              <DesignGoldOrnaments />
            </section>

            {/* Leadership Team */}
            <section
              id="leadership"
              className="py-0"
            >
              <OurTeam />
            </section>

            {/* Main Content Sections */}
            <div className="space-y-10 sm:space-y-14 lg:space-y-20">

              {/* What We Provide */}
              <section
                id="provide"
                className="relative py-4 sm:py-12"
              >
                {/* Background Ambient Glows */}
                <div className="pointer-events-none absolute -top-12 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#5B2EFF]/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 right-1/4 -z-10 h-72 w-72 rounded-full bg-[#D4AF37]/15 blur-3xl" />

                <SectionHeader
                  kicker=""
                  title="What We Provide"
                  subtitle="Digital gold + AI-driven trust layer for multiple sectors — designed like a premium bank-grade platform."
                />

                <div
                  className="
                    mt-8
                    grid
                    grid-cols-1
                    gap-4
                    sm:mt-10
                    sm:grid-cols-2
                    sm:gap-5
                    lg:grid-cols-4
                  "
                >
                  {provideCards.map((c) => (
                    <div
                      key={c.title}
                      className={`
                        group
                        relative
                        flex
                        flex-col
                        justify-between
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                        bg-gradient-to-b
                        from-white/[0.06]
                        to-white/[0.02]
                        p-5
                        sm:p-6
                        backdrop-blur-md
                        transition-all
                        duration-300
                        hover:-translate-y-1.5
                        hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]
                        ${c.hoverBorder}
                      `}
                    >
                      {/* Top Accent Gradient Line */}
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Content */}
                      <div>
                        {/* Glowing Icon Container */}
                        <div
                          className={`
                            grid
                            h-12
                            w-12
                            place-items-center
                            rounded-xl
                            border
                            bg-gradient-to-br
                            shadow-sm
                            transition-all
                            duration-300
                            group-hover:scale-105
                            ${c.iconBg}
                          `}
                        >
                          {c.icon}
                        </div>

                        {/* Title */}
                        <h3
                          className="
                            mt-4
                            text-sm
                            font-bold
                            tracking-wide
                            text-white
                            transition-colors
                            duration-200
                            group-hover:text-[#F5D36C]
                            sm:text-base
                          "
                        >
                          {c.title}
                        </h3>

                        {/* Description */}
                        <p
                          className="
                            mt-2
                            text-xs
                            leading-relaxed
                            text-white/70
                            sm:text-sm
                          "
                        >
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Modules */}
              <section
                id="modules"
                className="py-0 sm:py-6"
              >
                <div
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.035]
                    sm:rounded-2xl
                    lg:rounded-[20px]
                  "
                >

                  <div className="px-3 py-4 sm:p-6 lg:p-10">

                    {/* Intro */}
                    <div className="text-center">
                      <p
                        className="
                          mx-auto
                          mt-2
                          max-w-2xl
                          text-xs
                          leading-relaxed
                          text-white/70
                          sm:mt-3
                          sm:text-sm
                          lg:text-base
                        "
                      >
                        A premium ecosystem for bullion and allied sectors —
                        built like a{" "}

                        <span className="font-semibold text-white/90">
                          Digital Gold Bank
                        </span>
                        .
                      </p>
                    </div>

                    {/* Module Cards */}
                    <div
                      className="
                        mt-4
                        grid
                        grid-cols-1
                        gap-2.5
                        sm:mt-6
                        sm:grid-cols-2
                        sm:gap-3
                        lg:mt-8
                        lg:grid-cols-4
                        lg:gap-4
                      "
                    >
                      {modules8.map((m) => (
                        <ModuleCard
                          key={m.title}
                          {...m}
                        />
                      ))}
                    </div>

                  </div>
                </div>
              </section>

            </div>

            {/* Platforms */}
            <section
              id="platforms"
              className="scroll-mt-[106px] py-0"
            >
              <OxyEcosystem />
            </section>

          </div>
        </div>
      </main>

      {/* About / Footer */}
      <section
        id="about"
        className="
          relative
          z-10
          mt-10
          scroll-mt-[106px]
          sm:mt-14
          lg:mt-20
        "
      >
        <OxyGoldFooter />
      </section>

      {/* Scroll To Top */}
      {showScroll && (
        <button
          aria-label="scrollarrow"
          onClick={scrollToTop}
          className="
            group
            fixed
            bottom-6
            right-6
            z-50
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border
              border-white/15
              shadow-[0_10px_28px_rgba(12,2,35,0.28)]
              transition-all
              duration-300
              hover:scale-105
            "
            style={{
              background: `linear-gradient(
                135deg,
                ${BRAND.purple.primary},
                ${BRAND.gold.primary}
              )`,
            }}
          >
            <ArrowUp className="h-5 w-5 text-white" />
          </div>
        </button>
      )}
    </div>
  );
}
