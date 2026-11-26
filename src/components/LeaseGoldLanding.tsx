import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgePercent,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileCheck2,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Maximize2,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Wallet,
  X,
} from "lucide-react";
import LandingHeader from "../pages/LandingpageHeader";
import GoldRatesTickerStrip from "./ui/GoldRatesTickerStrip";
import OxyGoldFooter from "./OxyGoldFooter";
import leaseGoldVideo from "../assets/lease_Gold&sliver.mp4";

type PayoutFrequency = "Monthly" | "Quarterly" | "Half-Yearly" | "Yearly";
type MetalChoice = "Gold" | "Silver";
type FaqCategory =
  | "All"
  | "Getting Started"
  | "Returns & Payouts"
  | "TDS & Taxation"
  | "Safety & Terms";

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, "All">;
  question: string;
  answer: string;
}

const ULP_PORTAL_URL = "https://www.ulp.oxybricks.world";

const LEASE_BENEFITS = [
  {
    title: "Gold & Silver Leasing",
    desc: "Put eligible Gold and Silver holdings to productive use instead of leaving them idle.",
    icon: Layers,
  },
  {
    title: "Passive Income Opportunity",
    desc: "Explore indicative returns of 0.75% – 1% monthly or 9% – 13% annually based on plan terms.",
    icon: TrendingUp,
  },
  {
    title: "Flexible Payout Options",
    desc: "Select Monthly, Quarterly, Half-Yearly, or Yearly payout intervals aligned to your goals.",
    icon: CalendarDays,
  },
  {
    title: "Utilize Idle Precious Metals",
    desc: "Retain exposure to precious metals while unlocking structured leasing yield potential.",
    icon: Sparkles,
  },
];

const PAYOUT_OPTIONS: {
  label: PayoutFrequency;
  periodsPerYear: number;
  note: string;
}[] = [
  { label: "Monthly", periodsPerYear: 12, note: "12 payouts / yr" },
  { label: "Quarterly", periodsPerYear: 4, note: "4 payouts / yr" },
  { label: "Half-Yearly", periodsPerYear: 2, note: "2 payouts / yr" },
  { label: "Yearly", periodsPerYear: 1, note: "1 payout / yr" },
];

const PARTICIPATION_STEPS = [
  {
    step: "01",
    title: "Access ULP – OxyBricks & Complete KYC",
    desc: "Register or sign in on ULP – OxyBricks and complete PAN, Aadhaar, and bank verification for payouts and TDS reporting.",
    highlights: ["PAN & KYC verification", "Verified bank linking"],
    icon: UserCheck,
  },
  {
    step: "02",
    title: "Select Precious Metal & Holding",
    desc: "Choose Gold or Silver and allocate your eligible holding for collection by Radhakrishna Jewellery And Gold Finance under the leasing plan.",
    highlights: ["Gold & Silver eligible", "Transparent valuation"],
    icon: Wallet,
  },
  {
    step: "03",
    title: "Choose Plan & Payout Frequency",
    desc: "Pick your tenure and schedule — Monthly, Quarterly, Half-Yearly, or Yearly — with indicative 9% – 13% annual returns.",
    highlights: ["4 flexible payout cycles", "Indicative 9% – 13% p.a."],
    icon: CalendarDays,
  },
  {
    step: "04",
    title: "Review Terms & Sign Lease Agreement",
    desc: "Review lease terms with Radhakrishna Jewellery And Gold Finance, including custody, risk disclosures, lock-in rules, and statutory TDS deductions.",
    highlights: ["Digital lease agreement", "Clear risk & TDS terms"],
    icon: FileText,
  },
  {
    step: "05",
    title: "Receive Payouts & TDS Certificates",
    desc: "Net payouts credit directly to your verified bank account, with TDS reported against your PAN in Form 16A & Form 26AS / AIS.",
    highlights: ["Direct bank settlement", "Form 16A & 26AS reflection"],
    icon: FileCheck2,
  },
];

const SAMPLE_TDS_ROWS = [
  {
    quarter: "Q1 (Apr – Jun)",
    dateCredited: "30 Jun 2026",
    grossAmount: 15000,
    tdsRate: "10%",
    tdsDeducted: 1500,
    netCredited: 13500,
    challanRef: "BSR-0510002 / CHL-00418",
  },
  {
    quarter: "Q2 (Jul – Sep)",
    dateCredited: "30 Sep 2026",
    grossAmount: 15000,
    tdsRate: "10%",
    tdsDeducted: 1500,
    netCredited: 13500,
    challanRef: "BSR-0510002 / CHL-00792",
  },
  {
    quarter: "Q3 (Oct – Dec)",
    dateCredited: "31 Dec 2026",
    grossAmount: 15000,
    tdsRate: "10%",
    tdsDeducted: 1500,
    netCredited: 13500,
    challanRef: "BSR-0510002 / CHL-01145",
  },
  {
    quarter: "Q4 (Jan – Mar)",
    dateCredited: "31 Mar 2027",
    grossAmount: 15000,
    tdsRate: "10%",
    tdsDeducted: 1500,
    netCredited: 13500,
    challanRef: "BSR-0510002 / CHL-01580",
  },
];

const FAQS: FaqItem[] = [
  {
    id: "what-is-leasing",
    category: "Getting Started",
    question: "What is Gold & Silver Leasing with OXYGOLD.AI?",
    answer:
      "Gold & Silver leasing enables owners of eligible precious metals to earn potential passive income instead of letting their metals sit idle. Leased metals are collected by Radhakrishna Jewellery And Gold Finance, while digital onboarding and tracking are managed via ULP – OxyBricks.",
  },
  {
    id: "oxygold-vs-ulp",
    category: "Getting Started",
    question:
      "What are the roles of Radhakrishna Jewellery And Gold Finance and ULP – OxyBricks?",
    answer:
      "Radhakrishna Jewellery And Gold Finance is the collecting Jewellery & Gold Finance company participating in the lease program, while ULP – OxyBricks (ulp.oxybricks.world) serves as our dedicated digital platform for KYC onboarding, lease agreements, and payout tracking.",
  },
  {
    id: "eligibility-kyc",
    category: "Getting Started",
    question: "Who can participate and what KYC documents are required?",
    answer:
      "Resident individuals and eligible entities meeting the onboarding requirements on ULP – OxyBricks can participate. You will typically need a valid PAN card (essential for TDS reporting), Aadhaar/identity verification, and an active bank account in your own name for receiving payouts.",
  },
  {
    id: "indicative-returns",
    category: "Returns & Payouts",
    question: "What are the indicative returns on Gold & Silver leasing?",
    answer:
      "The program highlights indicative monthly returns of 0.75% – 1% and advertised annual returns of 9% – 13%. Actual returns depend on the specific leasing plan, metal type, tenure, and terms accepted at the time of agreement. Returns are indicative and not guaranteed.",
  },
  {
    id: "payout-frequencies",
    category: "Returns & Payouts",
    question: "What payout frequencies can I choose from?",
    answer:
      "You can select from four flexible payout options based on your financial goals: Monthly, Quarterly, Half-Yearly, or Yearly. Payouts are settled to your verified bank account as per the schedule defined in your lease agreement.",
  },
  {
    id: "guaranteed-returns",
    category: "Returns & Payouts",
    question: "Are the leasing returns guaranteed?",
    answer:
      "No. Returns are indicative and subject to applicable leasing terms, market conditions, counterparty and operational risks, and statutory TDS deductions. Always review the complete lease agreement carefully before committing.",
  },
  {
    id: "how-tds-works",
    category: "TDS & Taxation",
    question: "How does TDS (Tax Deduction at Source) apply to lease payouts?",
    answer:
      "Lease income is subject to Tax Deduction at Source (TDS) as per applicable provisions of the Income Tax Act, 1961. Radhakrishna Jewellery And Gold Finance (the deductor) deducts applicable TDS before crediting the net payout to your bank account and deposits it with the Government against your PAN.",
  },
  {
    id: "sample-tds-certificate",
    category: "TDS & Taxation",
    question: "Will I receive a TDS certificate for my lease earnings?",
    answer:
      "Yes. For deducted TDS, a statutory TDS certificate (such as Form 16A) is issued for the relevant quarter/period, and the tax credit is reflected in your Form 26AS and Annual Information Statement (AIS) linked to your PAN. You can view our Sample TDS Certificate section above to see the exact fields included.",
  },
  {
    id: "pan-importance",
    category: "TDS & Taxation",
    question: "What happens if my PAN is invalid or not linked?",
    answer:
      "Under Indian tax regulations, failure to furnish a valid PAN (or an inoperative PAN) can attract a higher TDS deduction rate (such as 20% under Section 206AA) and delay credit reflection in Form 26AS. Ensure your PAN is valid and linked before starting a lease.",
  },
  {
    id: "claim-tds-refund",
    category: "TDS & Taxation",
    question:
      "Can I adjust or claim deducted TDS when filing my Income Tax Return?",
    answer:
      "Yes. Any TDS deposited against your PAN appears in your Form 26AS / AIS and can be claimed as tax credit against your total income tax liability (or claimed as a refund if eligible) when filing your annual ITR. Consult a qualified tax advisor for personalized advice.",
  },
  {
    id: "risks-and-terms",
    category: "Safety & Terms",
    question:
      "What risks should I understand before leasing Gold or Silver?",
    answer:
      "Precious metal leasing carries market price risk (gold and silver prices fluctuate), counterparty/lessee credit risk, liquidity or lock-in restrictions during the lease tenure, and regulatory or tax changes. Unlike bank fixed deposits, leasing plans are not RBI-insured deposits.",
  },
  {
    id: "maturity-exit",
    category: "Safety & Terms",
    question:
      "What happens at the end of the lease tenure or if I want to exit early?",
    answer:
      "Upon maturity, you can choose to renew your lease or settle/redeem your holdings in accordance with the terms of your executed lease agreement on ULP – OxyBricks. Early exit conditions, notice periods, or adjustments—if permitted—are governed strictly by the specific plan's lease contract.",
  },
];

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

export default function LeaseGoldLanding() {
  const [metal, setMetal] = useState<MetalChoice>("Gold");
  const [principal, setPrincipal] = useState<number>(500000);
  const [annualRate, setAnnualRate] = useState<number>(11);
  const [payoutFrequency, setPayoutFrequency] =
    useState<PayoutFrequency>("Quarterly");
  const [tdsRatePercent, setTdsRatePercent] = useState<number>(10);

  const [faqCategory, setFaqCategory] = useState<FaqCategory>("All");
  const [allExpanded, setAllExpanded] = useState<boolean>(false);
  const faqContainerRef = useRef<HTMLDivElement>(null);

  const tdsDialogRef = useRef<HTMLDialogElement>(null);
  const videoDialogRef = useRef<HTMLDialogElement>(null);

  const mainHeadingId = useId();
  const tdsDialogTitleId = useId();
  const videoDialogTitleId = useId();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.slice(1);
      const timer = window.setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 60);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.hash]);

  // Light-dismiss fallback for browsers without <dialog closedby="any">
  useEffect(() => {
    if ("closedBy" in HTMLDialogElement.prototype) return;

    const cleanups: Array<() => void> = [];
    const dialogs = [tdsDialogRef.current, videoDialogRef.current].filter(
      (d): d is HTMLDialogElement => Boolean(d)
    );

    for (const dialog of dialogs) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };

      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e)) {
          dialog.close();
        }
      };

      dialog.addEventListener("pointerdown", onPointerDown);
      dialog.addEventListener("pointerup", onPointerUp);
      cleanups.push(() => {
        dialog.removeEventListener("pointerdown", onPointerDown);
        dialog.removeEventListener("pointerup", onPointerUp);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const filteredFaqs = useMemo(() => {
    if (faqCategory === "All") return FAQS;
    return FAQS.filter((item) => item.category === faqCategory);
  }, [faqCategory]);

  const syncAllExpandedState = () => {
    const container = faqContainerRef.current;
    if (!container) return;
    const detailsList = Array.from(
      container.querySelectorAll<HTMLDetailsElement>(":scope > details")
    );
    setAllExpanded(
      detailsList.length > 0 && detailsList.every((el) => el.open)
    );
  };

  const handleToggleAllFaqs = () => {
    const container = faqContainerRef.current;
    if (!container) return;
    const nextState = !allExpanded;
    for (const el of container.querySelectorAll<HTMLDetailsElement>(
      ":scope > details"
    )) {
      el.open = nextState;
    }
    setAllExpanded(nextState);
  };

  useEffect(() => {
    syncAllExpandedState();
  }, [faqCategory]);

  const estimator = useMemo(() => {
    const selectedOption =
      PAYOUT_OPTIONS.find((o) => o.label === payoutFrequency) ??
      PAYOUT_OPTIONS[1];
    const annualGross = (principal * annualRate) / 100;
    const periodGross = annualGross / selectedOption.periodsPerYear;
    const periodTds = (periodGross * tdsRatePercent) / 100;
    const periodNet = periodGross - periodTds;
    const annualTds = (annualGross * tdsRatePercent) / 100;
    const annualNet = annualGross - annualTds;
    const monthlyEquivalentRate = (annualRate / 12).toFixed(2);

    return {
      periodsPerYear: selectedOption.periodsPerYear,
      periodGross,
      periodTds,
      periodNet,
      annualGross,
      annualTds,
      annualNet,
      monthlyEquivalentRate,
    };
  }, [principal, annualRate, payoutFrequency, tdsRatePercent]);

  const openTdsDialog = () => {
    tdsDialogRef.current?.showModal();
  };

  const openVideoDialog = () => {
    videoDialogRef.current?.showModal();
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
      <a href={`#${mainHeadingId}`} className="lease-skip-link">
        Skip to main content
      </a>

      <LandingHeader offsetPx={106} />
      <GoldRatesTickerStrip fixed top={72} height={34} />

      <main className="relative z-10 pt-[124px] pb-14 sm:pt-[132px] sm:pb-16 lg:pt-[140px] lg:pb-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-3 sm:gap-16 sm:px-6 lg:gap-20">
          {/* 1. HERO SECTION (Open Landing View — No Outer Card) */}
          <section
            id="lease-overview"
            className="scroll-mt-32 relative py-2 sm:py-4 lg:py-6"
          >
            {/* Subtle Ambient Hero Glows */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -left-24 -z-10 h-80 w-80 rounded-full bg-[#5B2EFF]/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-10 right-0 -z-10 h-80 w-80 rounded-full bg-[#D4AF37]/15 blur-3xl"
            />

            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left: Clean Editorial Hero Content */}
              <div className="flex min-w-0 flex-col lg:col-span-7">
                <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/12 px-3.5 py-1 text-[11px] font-semibold text-[#F5D36C] sm:text-xs">
                  <Sparkles size={13} />
                  <span>Make Your Precious Metals Work for You</span>
                </div>

                <h1
                  id={mainHeadingId}
                  tabIndex={-1}
                  className="font-playfair text-3xl font-extrabold leading-[1.1] tracking-tight text-white outline-none sm:text-5xl lg:text-[54px]"
                >
                  Lease Your{" "}
                  <span className="bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] bg-clip-text text-transparent">
                    GOLD &amp; SILVER
                  </span>
                </h1>

                <p className="mt-3 text-base font-semibold text-[#F5D36C] sm:text-lg lg:text-xl">
                  Your Precious Metals. Your Earning Potential.
                </p>

                <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                  Unlock passive income potential from idle Gold &amp; Silver
                  collected by{" "}
                  <strong className="text-white">
                    Radhakrishna Jewellery And Gold Finance
                  </strong>{" "}
                  through <strong className="text-white">OXYGOLD.AI</strong> and{" "}
                  <strong className="text-[#F5D36C]">ULP – OxyBricks</strong> —
                  with flexible payout cycles, clear participation steps, and
                  statutory TDS reporting.
                </p>

                {/* Crisp 3-Metric Summary Bar */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#D4AF37]/30 bg-white/[0.04] p-3.5 backdrop-blur-sm sm:p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/65 sm:text-xs">
                      <TrendingUp
                        size={14}
                        className="shrink-0 text-[#F5D36C]"
                      />
                      <span>Monthly Returns</span>
                    </div>
                    <p className="mt-1 text-xl font-extrabold tracking-tight text-[#F5D36C] sm:text-2xl">
                      0.75% – 1%
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/50">
                      Indicative monthly
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#D4AF37]/30 bg-white/[0.04] p-3.5 backdrop-blur-sm sm:p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/65 sm:text-xs">
                      <CalendarDays
                        size={14}
                        className="shrink-0 text-[#F5D36C]"
                      />
                      <span>Annual Returns</span>
                    </div>
                    <p className="mt-1 text-xl font-extrabold tracking-tight text-[#F5D36C] sm:text-2xl">
                      9% – 13%
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/50">
                      Advertised annual
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl border border-white/15 bg-white/[0.04] p-3.5 backdrop-blur-sm sm:col-span-1 sm:p-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/65 sm:text-xs">
                      <BadgePercent
                        size={14}
                        className="shrink-0 text-emerald-400"
                      />
                      <span>Payout Options</span>
                    </div>
                    <p className="mt-1 text-base font-bold text-white sm:text-lg">
                      4 Flexible Cycles
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/55">
                      Monthly · Quarterly · Half-Yearly · Yearly
                    </p>
                  </div>
                </div>

                {/* Focused Primary + Secondary CTAs */}
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <a
                    href={ULP_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] px-6 py-3 text-sm font-extrabold text-[#1B053A] shadow-[0_6px_22px_rgba(212,175,55,0.32)] transition hover:scale-[1.02] active:scale-[0.99] sm:w-auto"
                  >
                    <span>Start Leasing on ULP – OxyBricks</span>
                    <ExternalLink size={16} />
                  </a>

                  <a
                    href="#steps-to-participate"
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-white/[0.06] px-5 py-3 text-sm font-bold text-[#F5D36C] transition hover:bg-[#D4AF37]/15 sm:w-auto"
                  >
                    <span>How to Participate</span>
                    <ArrowRight size={16} />
                  </a>

                  <button
                    type="button"
                    onClick={openTdsDialog}
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/90 transition hover:border-[#D4AF37]/50 hover:text-[#F5D36C] sm:w-auto"
                  >
                    <FileCheck2 size={16} />
                    <span>Sample TDS</span>
                  </button>

                  <Link
                    to="/certificates"
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/90 transition hover:border-[#D4AF37]/50 hover:text-[#F5D36C] sm:w-auto"
                  >
                    <Award size={16} className="text-[#F5D36C]" />
                    <span>View Certificates</span>
                  </Link>
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-white/55 sm:text-xs">
                  *Returns are indicative and subject to applicable leasing
                  terms, associated risks and TDS deductions. Returns are not
                  guaranteed. Please review the lease agreement before
                  proceeding.
                </p>
              </div>

              {/* Right: Clean 9:16 Vertical Reel Video Showcase */}
              <div className="flex flex-col items-center lg:col-span-5 lg:items-end">
                <div className="relative w-full max-w-[270px] sm:max-w-[300px] lg:max-w-[315px]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-3 rounded-[30px] bg-gradient-to-b from-[#D4AF37]/25 via-[#8A5BFF]/20 to-[#D4AF37]/15 blur-2xl opacity-75"
                  />
                  <div className="relative overflow-hidden rounded-[24px] border border-[#D4AF37]/35 bg-[#0A0416] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
                    <div className="overflow-hidden rounded-[18px] bg-black">
                      <video
                        src={leaseGoldVideo}
                        controls
                        playsInline
                        preload="metadata"
                        aria-label="Lease Gold and Silver overview reel video"
                        className="block aspect-[9/16] w-full bg-black object-contain"
                      >
                        Your browser does not support video playback.
                      </video>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-2 pt-2.5 pb-1">
                      <span className="text-[11px] font-medium text-white/70">
                        Program Reel (0:50)
                      </span>
                      <button
                        type="button"
                        onClick={openVideoDialog}
                        className="inline-flex min-h-[30px] items-center gap-1 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-[#F5D36C] transition hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15"
                      >
                        <Maximize2 size={12} />
                        <span>Expand</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. WHY LEASE & PAYOUT CYCLES */}
          <section
            aria-labelledby="why-lease-heading"
            className="flex flex-col gap-6 sm:gap-8"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5D36C]">
                Program Highlights
              </p>
              <h2
                id="why-lease-heading"
                className="mt-2 font-playfair text-2xl font-bold text-white sm:text-3xl"
              >
                Why Lease with OXYGOLD.AI?
              </h2>
              <p className="mt-2 text-sm text-white/70 sm:text-base">
                Unlock passive yield potential from idle Gold &amp; Silver while
                choosing a payout cadence that fits your plan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {LEASE_BENEFITS.map((benefit) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:border-[#D4AF37]/45 hover:bg-white/[0.07]"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#F5D36C]">
                      <IconComponent size={20} />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-white">
                      {benefit.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/70 sm:text-sm">
                      {benefit.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Flexible Payout Bar */}
            <div className="rounded-2xl border border-[#D4AF37]/25 bg-gradient-to-r from-[#D4AF37]/10 via-white/[0.03] to-[#8A5BFF]/10 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F5D36C]">
                    <Award size={18} />
                    <span>Flexible Payout Options</span>
                  </div>
                  <p className="mt-1 text-xs text-white/70 sm:text-sm">
                    Receive lease payouts directly to your verified bank account
                    on the schedule you prefer.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {PAYOUT_OPTIONS.map((option) => (
                    <div
                      key={option.label}
                      className="rounded-xl border border-[#D4AF37]/30 bg-black/25 px-3.5 py-2.5 text-center"
                    >
                      <div className="text-xs font-bold text-[#F5D36C] sm:text-sm">
                        {option.label}
                      </div>
                      <div className="text-[11px] text-white/60">
                        {option.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. ILLUSTRATIVE PAYOUT & TDS ESTIMATOR */}
          <section
            id="payout-estimator"
            aria-labelledby="estimator-heading"
            className="scroll-mt-32 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:rounded-3xl sm:p-8 lg:p-10"
          >
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#F5D36C]">
                  <Calculator size={15} />
                  <span>Illustrative Calculator</span>
                </div>
                <h2
                  id="estimator-heading"
                  className="mt-1 font-playfair text-2xl font-bold text-white sm:text-3xl"
                >
                  Indicative Payout &amp; TDS Estimator
                </h2>
              </div>
              <span className="self-start rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-[#F5D36C] lg:self-auto">
                Illustrative Example Only — Not Guaranteed
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              {/* Inputs */}
              <div className="flex flex-col gap-5 lg:col-span-6">
                <div>
                  <span className="mb-2 block text-xs font-semibold text-white/75">
                    Select Precious Metal
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(["Gold", "Silver"] as MetalChoice[]).map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        aria-pressed={metal === choice}
                        onClick={() => setMetal(choice)}
                        className={`min-h-[44px] rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                          metal === choice
                            ? "border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] text-[#1B053A]"
                            : "border-white/15 bg-white/[0.04] text-white/80 hover:border-[#D4AF37]/40"
                        }`}
                      >
                        {choice} Leasing
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                    <label htmlFor="lease-value-range" className="text-white/75">
                      Estimated {metal} Value Leased
                    </label>
                    <span className="text-sm font-bold text-[#F5D36C]">
                      {formatINR(principal)}
                    </span>
                  </div>
                  <input
                    id="lease-value-range"
                    type="range"
                    min={50000}
                    max={5000000}
                    step={50000}
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-[#D4AF37]"
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-white/50">
                    <span>₹50,000</span>
                    <span>₹25,00,000</span>
                    <span>₹50,00,000</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold">
                    <label htmlFor="lease-rate-range" className="text-white/75">
                      Indicative Annual Rate (9% – 13%)
                    </label>
                    <span className="shrink-0 text-sm font-bold text-[#F5D36C]">
                      {annualRate}% p.a. (~{estimator.monthlyEquivalentRate}%/mo)
                    </span>
                  </div>
                  <input
                    id="lease-rate-range"
                    type="range"
                    min={9}
                    max={13}
                    step={0.5}
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-[#D4AF37]"
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-white/50">
                    <span>9% p.a. (0.75%/mo)</span>
                    <span>11% p.a.</span>
                    <span>13% p.a. (~1.08%/mo)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-2 block text-xs font-semibold text-white/75">
                      Payout Frequency
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYOUT_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          aria-pressed={payoutFrequency === opt.label}
                          onClick={() => setPayoutFrequency(opt.label)}
                          className={`min-h-[42px] rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            payoutFrequency === opt.label
                              ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#F5D36C]"
                              : "border-white/15 bg-white/[0.04] text-white/75 hover:border-white/30"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="tds-rate-select"
                      className="mb-2 block text-xs font-semibold text-white/75"
                    >
                      Illustrative TDS Assumption
                    </label>
                    <select
                      id="tds-rate-select"
                      value={tdsRatePercent}
                      onChange={(e) =>
                        setTdsRatePercent(Number(e.target.value))
                      }
                      className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#160832] px-3 py-2.5 text-xs text-white outline-none focus:border-[#D4AF37] sm:text-sm"
                    >
                      <option value={10}>10% (Standard PAN Linked Sample)</option>
                      <option value={20}>20% (No PAN / Higher TDS Case)</option>
                      <option value={0}>0% (Gross Before TDS View)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Output Summary */}
              <div className="flex flex-col gap-4 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/12 via-black/35 to-[#5B2EFF]/15 p-4 sm:p-6 lg:col-span-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5D36C]">
                    Estimated {payoutFrequency} Payout ({metal})
                  </span>
                  <span className="text-xs text-white/60">
                    {estimator.periodsPerYear} payout(s) / year
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3.5 sm:block">
                    <div className="text-xs text-white/65 sm:text-[11px]">
                      Gross / {payoutFrequency}
                    </div>
                    <div className="text-base font-bold text-white sm:mt-1 sm:text-xl">
                      {formatINR(estimator.periodGross)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3.5 sm:block">
                    <div className="text-xs text-white/65 sm:text-[11px]">
                      Illustrative TDS ({tdsRatePercent}%)
                    </div>
                    <div className="text-base font-bold text-amber-300 sm:mt-1 sm:text-xl">
                      -{formatINR(estimator.periodTds)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3.5 sm:block">
                    <div className="text-xs text-emerald-200 sm:text-[11px]">
                      Net Credited / {payoutFrequency}
                    </div>
                    <div className="text-base font-extrabold text-emerald-300 sm:mt-1 sm:text-xl">
                      {formatINR(estimator.periodNet)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/25 p-4 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2 text-white/75">
                    <span>Estimated Annual Gross Lease Payout</span>
                    <span className="shrink-0 font-semibold text-white">
                      {formatINR(estimator.annualGross)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 text-white/75">
                    <span>Estimated Annual TDS Deposited to PAN</span>
                    <span className="shrink-0 font-semibold text-amber-300">
                      {formatINR(estimator.annualTds)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-white/10 pt-2 text-white">
                    <span className="font-bold">Estimated Annual Net Payout</span>
                    <span className="shrink-0 font-extrabold text-[#F5D36C]">
                      {formatINR(estimator.annualNet)}
                    </span>
                  </div>
                </div>

                <p className="m-0 text-[11px] leading-relaxed text-white/55">
                  Note: Figures above are purely mathematical illustrations based
                  on your selected inputs. Actual yield, eligible valuation, and
                  statutory TDS rate are governed by your executed lease
                  agreement on ULP – OxyBricks.
                </p>
              </div>
            </div>
          </section>

          {/* 4. STEPS TO PARTICIPATE (Balanced 3 + 2 Grid with Proper Gap) */}
          <section
            id="steps-to-participate"
            aria-labelledby="steps-heading"
            className="scroll-mt-32 flex flex-col gap-8"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5D36C]">
                How It Works
              </p>
              <h2
                id="steps-heading"
                className="mt-2 font-playfair text-2xl font-bold text-white sm:text-3xl"
              >
                Steps to Participate in Gold &amp; Silver Leasing
              </h2>
              <p className="mt-2 text-sm text-white/70 sm:text-base">
                Follow this straightforward 5-step process to get started via
                ULP – OxyBricks.
              </p>
            </div>

            <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-6 lg:gap-5">
              {PARTICIPATION_STEPS.map((item, idx) => {
                const StepIcon = item.icon;
                const spanClass =
                  idx < 3
                    ? "lg:col-span-2"
                    : idx === 3
                    ? "lg:col-span-3"
                    : "md:col-span-2 lg:col-span-3";

                return (
                  <li
                    key={item.step}
                    className={`flex flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.04] p-5 sm:p-6 transition hover:border-[#D4AF37]/45 hover:bg-white/[0.07] ${spanClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center justify-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/15 px-3 py-1 text-xs font-extrabold text-[#F5D36C]">
                          Step {item.step}
                        </span>
                        <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-[#F5D36C]">
                          <StepIcon size={18} />
                        </div>
                      </div>

                      <h3 className="mt-4 text-base font-bold leading-snug text-white sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-white/75 sm:text-sm">
                        {item.desc}
                      </p>
                    </div>

                    <ul className="m-0 mt-4 flex list-none flex-wrap gap-x-4 gap-y-2 border-t border-white/10 p-0 pt-3.5">
                      {item.highlights.map((hl) => (
                        <li
                          key={hl}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300"
                        >
                          <CheckCircle2 size={14} className="shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ol>

            <div className="flex justify-center pt-1">
              <a
                href={ULP_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] px-7 py-3.5 text-sm font-extrabold text-[#1B053A] shadow-[0_6px_22px_rgba(212,175,55,0.3)] transition hover:scale-[1.02] sm:w-auto"
              >
                <span>Begin Step 1 on ULP – OxyBricks</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </section>

          {/* 5. SAMPLE TDS CERTIFICATE */}
          <section
            id="sample-tds"
            aria-labelledby="tds-heading"
            className="scroll-mt-32 flex flex-col gap-8"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5D36C]">
                Tax Transparency
              </p>
              <h2
                id="tds-heading"
                className="mt-2 font-playfair text-2xl font-bold text-white sm:text-3xl"
              >
                Sample TDS Certificate (Specimen)
              </h2>
              <p className="mt-2 text-sm text-white/70 sm:text-base">
                Lease payouts are subject to statutory TDS deductions. Below is
                an illustrative Form 16A specimen showing how your gross payout,
                TDS deducted, and net credited amount are documented.
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              {/* Left: Embedded Specimen Card */}
              <div className="min-w-0 overflow-hidden rounded-2xl border border-[#D4AF37]/35 bg-[#FDFBF5] text-[#1A132B] shadow-2xl lg:col-span-8">
                {/* Certificate Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#D4AF37] bg-[#1B063D] px-4 py-3.5 text-white sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 size={18} className="shrink-0 text-[#F5D36C]" />
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-[#F5D36C]">
                        Form 16A — Sample TDS Certificate
                      </div>
                      <div className="text-[11px] text-white/70">
                        Illustrative specimen for Gold &amp; Silver lease
                        payouts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-amber-400/50 bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F5D36C]">
                      Sample Specimen
                    </span>
                    <button
                      type="button"
                      onClick={openTdsDialog}
                      className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      <Maximize2 size={13} />
                      <span>Expand</span>
                    </button>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="relative flex flex-col gap-5 p-4 sm:p-7">
                  {/* Subtle Diagonal Watermark */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden opacity-[0.06]"
                  >
                    <span className="rotate-[-24deg] text-4xl font-black tracking-[0.2em] text-[#2B0A59] sm:text-6xl">
                      SAMPLE SPECIMEN
                    </span>
                  </div>

                  <div className="relative flex flex-col justify-between gap-3 border-b border-slate-300 pb-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#5B2EFF]">
                        Certificate Under Section 203 of the Income-tax Act,
                        1961
                      </p>
                      <h3 className="mt-1 text-base font-extrabold text-slate-900 sm:text-lg">
                        Tax Deducted at Source on Lease Payouts
                      </h3>
                    </div>
                    <div className="flex flex-col gap-0.5 text-xs text-slate-700 sm:text-right">
                      <div>
                        <strong>Certificate No:</strong> SAMPLE-TDS-2026-0001
                      </div>
                      <div>
                        <strong>Assessment Year:</strong> AY 2027–28 (Sample)
                      </div>
                    </div>
                  </div>

                  {/* Deductor / Deductee Grid */}
                  <div className="relative grid grid-cols-1 gap-3.5 text-xs sm:grid-cols-2 sm:gap-4">
                    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-3.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Name &amp; Address of the Deductor
                      </div>
                      <div className="font-bold text-slate-900">
                        Radhakrishna Jewellery And Gold Finance
                      </div>
                      <div className="text-slate-600">
                        Collecting &amp; Leasing Partner • OXYGOLD.AI / ULP –
                        OxyBricks Ecosystem, Hyderabad
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-slate-700">
                        <span>
                          <strong>TAN:</strong> HYDR00000X (Sample)
                        </span>
                        <span>
                          <strong>PAN:</strong> AAACR0000X (Sample)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-3.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Name &amp; Details of the Deductee (Lessor)
                      </div>
                      <div className="font-bold text-slate-900">
                        Sample Gold / Silver Lessor
                      </div>
                      <div className="text-slate-600">
                        Registered KYC Address (Per Participant Profile)
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-slate-700">
                        <span>
                          <strong>PAN:</strong> ABCDE1234F (Sample)
                        </span>
                        <span>
                          <strong>Plan:</strong> Gold Lease (Quarterly)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Horizontal Scroll Hint */}
                  <p className="m-0 text-[11px] font-medium text-slate-500 sm:hidden">
                    Swipe table horizontally to view all columns →
                  </p>

                  {/* Summary Table */}
                  <div className="relative min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                      <caption className="sr-only">
                        Sample quarterly lease payout and TDS deduction
                        breakdown
                      </caption>
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th scope="col" className="px-3.5 py-2.5 font-bold">
                            Period
                          </th>
                          <th scope="col" className="px-3.5 py-2.5 font-bold">
                            Credit Date
                          </th>
                          <th
                            scope="col"
                            className="px-3.5 py-2.5 text-right font-bold"
                          >
                            Gross Payout
                          </th>
                          <th
                            scope="col"
                            className="px-3.5 py-2.5 text-center font-bold"
                          >
                            TDS Rate
                          </th>
                          <th
                            scope="col"
                            className="px-3.5 py-2.5 text-right font-bold"
                          >
                            TDS Deducted
                          </th>
                          <th
                            scope="col"
                            className="px-3.5 py-2.5 text-right font-bold"
                          >
                            Net Credited
                          </th>
                          <th scope="col" className="px-3.5 py-2.5 font-bold">
                            Challan Ref (Sample)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {SAMPLE_TDS_ROWS.map((row) => (
                          <tr key={row.quarter}>
                            <td className="whitespace-nowrap px-3.5 py-2.5 font-semibold">
                              {row.quarter}
                            </td>
                            <td className="whitespace-nowrap px-3.5 py-2.5">
                              {row.dateCredited}
                            </td>
                            <td className="px-3.5 py-2.5 text-right tabular-nums">
                              {formatINR(row.grossAmount)}
                            </td>
                            <td className="px-3.5 py-2.5 text-center">
                              {row.tdsRate}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-semibold tabular-nums text-amber-700">
                              {formatINR(row.tdsDeducted)}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-emerald-700">
                              {formatINR(row.netCredited)}
                            </td>
                            <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-[11px] text-slate-600">
                              {row.challanRef}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t border-slate-300 bg-slate-50 font-bold text-slate-900">
                        <tr>
                          <td colSpan={2} className="px-3.5 py-2.5">
                            Annual Sample Total
                          </td>
                          <td className="px-3.5 py-2.5 text-right tabular-nums">
                            {formatINR(60000)}
                          </td>
                          <td className="px-3.5 py-2.5 text-center">10%</td>
                          <td className="px-3.5 py-2.5 text-right tabular-nums text-amber-700">
                            {formatINR(6000)}
                          </td>
                          <td className="px-3.5 py-2.5 text-right tabular-nums text-emerald-700">
                            {formatINR(54000)}
                          </td>
                          <td className="px-3.5 py-2.5 text-[11px] text-slate-500">
                            Reflected in 26AS / AIS
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <p className="relative m-0 text-[11px] leading-relaxed text-slate-600">
                    <strong>Disclaimer:</strong> This is an illustrative sample
                    TDS certificate specimen to demonstrate payout &amp; tax
                    reporting structure. Actual Form 16A certificates are
                    generated via TRACES after quarterly TDS return filing and
                    depend on applicable statutory rates and your PAN status.
                  </p>
                </div>
              </div>

              {/* Right: TDS Key Takeaways */}
              <div className="flex flex-col gap-4 lg:col-span-4">
                <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F5D36C]">
                    <Building2 size={18} />
                    <span>Understanding TDS on Lease Returns</span>
                  </div>

                  <ul className="m-0 flex list-none flex-col gap-3 p-0 text-xs text-white/75 sm:text-sm">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />
                      <span>
                        <strong className="text-white">
                          Statutory Deduction:
                        </strong>{" "}
                        Applicable TDS is deducted from your gross lease payout
                        before settlement to your verified bank account.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />
                      <span>
                        <strong className="text-white">
                          PAN &amp; Form 26AS / AIS:
                        </strong>{" "}
                        Every rupee of TDS deducted is deposited against your
                        PAN and visible in Form 26AS &amp; AIS on the Income Tax
                        portal.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />
                      <span>
                        <strong className="text-white">
                          Claim Credit in ITR:
                        </strong>{" "}
                        You can offset deducted TDS against your final tax
                        liability or claim a refund while filing your ITR.
                      </span>
                    </li>
                  </ul>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={openTdsDialog}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-4 py-2.5 text-xs font-bold text-[#F5D36C] transition hover:bg-[#D4AF37]/25 sm:text-sm"
                    >
                      <FileCheck2 size={16} />
                      <span>Inspect Full Sample Certificate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openTdsDialog();
                        setTimeout(() => window.print(), 150);
                      }}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/85 transition hover:border-white/30 sm:text-sm"
                    >
                      <Printer size={16} />
                      <span>Print / Save Specimen</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
                  <Info size={18} className="mt-0.5 shrink-0 text-[#F5D36C]" />
                  <p className="m-0 text-xs leading-relaxed text-white/75">
                    Keep your PAN active and Aadhaar-linked to avoid higher TDS
                    rates (such as 20% under Section 206AA) and ensure seamless
                    tax credit reflection.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. FREQUENTLY ASKED QUESTIONS (Semantic <details> Accordion) */}
          <section
            id="lease-faqs"
            aria-labelledby="faq-heading"
            className="scroll-mt-32 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#F5D36C]">
                  <HelpCircle size={15} />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2
                  id="faq-heading"
                  className="mt-1.5 font-playfair text-2xl font-bold text-white sm:text-3xl"
                >
                  Everything You Need to Know
                </h2>
              </div>

              <button
                type="button"
                aria-expanded={allExpanded}
                onClick={handleToggleAllFaqs}
                className="min-h-[40px] self-start rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold text-[#F5D36C] transition hover:bg-[#D4AF37]/20 sm:text-sm md:self-auto"
              >
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>

            {/* Category Filter Buttons */}
            <div
              className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Filter FAQs by topic"
            >
              {(
                [
                  "All",
                  "Getting Started",
                  "Returns & Payouts",
                  "TDS & Taxation",
                  "Safety & Terms",
                ] as FaqCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={faqCategory === cat}
                  onClick={() => setFaqCategory(cat)}
                  className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    faqCategory === cat
                      ? "border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] text-[#1B053A]"
                      : "border-white/15 bg-white/[0.04] text-white/75 hover:border-[#D4AF37]/40 hover:text-[#F5D36C]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion Container */}
            <div
              ref={faqContainerRef}
              className="lease-faq-accordion flex flex-col gap-3"
            >
              {filteredFaqs.map((faq) => (
                <details
                  key={faq.id}
                  onToggle={syncAllExpandedState}
                  className="lease-faq-item rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-[#D4AF37]/40"
                >
                  <summary className="lease-faq-summary min-h-[52px] select-none px-4 py-4 text-sm font-semibold text-white sm:px-6 sm:text-base">
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className="lease-faq-chevron shrink-0 text-[#F5D36C]"
                    />
                    <span className="flex-1">{faq.question}</span>
                    <span className="hidden rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-white/60 sm:inline-block">
                      {faq.category}
                    </span>
                  </summary>
                  <div className="lease-faq-answer px-4 pb-5 pt-1 text-xs leading-relaxed text-white/75 sm:px-6 sm:text-sm">
                    <p className="m-0 border-t border-white/10 pt-3">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* 7. RISK DISCLOSURE & FINAL CTA */}
          <section
            aria-labelledby="final-cta-heading"
            className="flex flex-col items-center gap-5 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/12 via-[#1B063D]/90 to-[#5B2EFF]/15 p-6 text-center sm:rounded-3xl sm:p-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-[#F5D36C]">
              <ShieldCheck size={15} />
              <span>
                Radhakrishna Jewellery And Gold Finance • ULP – OxyBricks
              </span>
            </div>

            <h2
              id="final-cta-heading"
              className="m-0 font-playfair text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl"
            >
              Ready to Explore Gold &amp; Silver Leasing?
            </h2>

            <p className="m-0 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              Proceed to{" "}
              <strong className="text-[#F5D36C]">ULP – OxyBricks</strong> to
              complete KYC, allocate your metal with{" "}
              <strong className="text-white">
                Radhakrishna Jewellery And Gold Finance
              </strong>
              , and select your preferred payout cycle.
            </p>

            <div className="flex w-full flex-col items-center justify-center gap-3 pt-1 sm:w-auto sm:flex-row sm:flex-wrap">
              <a
                href={ULP_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D36C] to-[#C9A227] px-7 py-3.5 text-sm font-extrabold text-[#1B053A] shadow-[0_6px_25px_rgba(212,175,55,0.35)] transition hover:scale-[1.02] sm:w-auto"
              >
                <span>Explore Gold &amp; Silver Leasing</span>
                <ExternalLink size={17} />
              </a>

              <Link
                to="/certificates"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-white/[0.05] px-5 py-3.5 text-sm font-bold text-[#F5D36C] transition hover:bg-[#D4AF37]/15 sm:w-auto"
              >
                <Award size={16} />
                <span>View Our Certificates</span>
              </Link>

              <Link
                to="/"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-white/85 transition hover:border-[#D4AF37]/50 hover:text-[#F5D36C] sm:w-auto"
              >
                <ArrowLeft size={16} />
                <span>Return to OXYGOLD.AI</span>
              </Link>
            </div>

            <div className="flex w-full max-w-4xl items-start gap-3 rounded-xl border border-white/10 bg-black/25 p-4 text-left">
              <ShieldAlert
                size={18}
                className="mt-0.5 shrink-0 text-amber-300"
              />
              <p className="m-0 text-[11px] leading-relaxed text-white/60 sm:text-xs">
                <strong className="text-white/85">Important Disclosure:</strong>{" "}
                Returns of 0.75% – 1% monthly (9% – 13% annually) are indicative
                and subject to applicable leasing terms, counterparty and market
                risks, and statutory TDS deductions. Returns are not guaranteed.
                Please read the complete lease agreement and tax terms on ULP –
                OxyBricks before participating.
              </p>
            </div>
          </section>
        </div>
      </main>

      <OxyGoldFooter />

      {/* Native <dialog> Modal: Full Sample TDS Certificate */}
      <dialog
        ref={tdsDialogRef}
        aria-labelledby={tdsDialogTitleId}
        {...({ closedby: "any" } as Record<string, string>)}
        className="lease-dialog max-h-[90dvh] w-[min(96vw,920px)] overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#FDFBF5] p-0 text-[#1A132B] shadow-2xl"
      >
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b-2 border-[#D4AF37] bg-[#1B063D] px-5 py-4 text-white">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#F5D36C]">
                OXYGOLD.AI • Sample Tax Specimen
              </span>
              <h1
                id={tdsDialogTitleId}
                className="m-0 text-base font-bold text-white sm:text-lg"
              >
                Sample TDS Certificate (Form 16A Format)
              </h1>
            </div>

            <form method="dialog" className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                type="submit"
                autoFocus
                aria-label="Close sample TDS certificate"
                className="rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </form>
          </div>

          <div className="relative flex flex-col gap-5 overflow-y-auto p-5 sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden opacity-[0.06]"
            >
              <span className="rotate-[-24deg] text-5xl font-black tracking-[0.2em] text-[#2B0A59] sm:text-7xl">
                SAMPLE SPECIMEN
              </span>
            </div>

            <div className="relative grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-[11px] font-bold uppercase text-slate-500">
                  Deductor
                </div>
                <div className="font-bold text-slate-900">
                  Radhakrishna Jewellery And Gold Finance
                </div>
                <div className="text-slate-600">
                  Collecting &amp; Leasing Partner • OXYGOLD.AI / ULP –
                  OxyBricks Ecosystem, Hyderabad
                </div>
                <div className="pt-1 text-slate-700">
                  TAN: HYDR00000X (Sample) • PAN: AAACR0000X (Sample)
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-[11px] font-bold uppercase text-slate-500">
                  Deductee (Lessor)
                </div>
                <div className="font-bold text-slate-900">
                  Sample Participant Name
                </div>
                <div className="text-slate-600">
                  Certificate No: SAMPLE-TDS-2026-0001 • AY 2027–28
                </div>
                <div className="pt-1 text-slate-700">
                  PAN: ABCDE1234F (Sample) • Status: Resident Individual
                </div>
              </div>
            </div>

            <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                <caption className="sr-only">
                  Full sample TDS deduction schedule
                </caption>
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th scope="col" className="px-3.5 py-2.5 font-bold">
                      Quarter
                    </th>
                    <th scope="col" className="px-3.5 py-2.5 font-bold">
                      Credit Date
                    </th>
                    <th
                      scope="col"
                      className="px-3.5 py-2.5 text-right font-bold"
                    >
                      Gross Amount
                    </th>
                    <th
                      scope="col"
                      className="px-3.5 py-2.5 text-center font-bold"
                    >
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="px-3.5 py-2.5 text-right font-bold"
                    >
                      TDS Deposited
                    </th>
                    <th
                      scope="col"
                      className="px-3.5 py-2.5 text-right font-bold"
                    >
                      Net Paid
                    </th>
                    <th scope="col" className="px-3.5 py-2.5 font-bold">
                      Challan Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {SAMPLE_TDS_ROWS.map((row) => (
                    <tr key={row.quarter}>
                      <td className="px-3.5 py-2.5 font-semibold">
                        {row.quarter}
                      </td>
                      <td className="px-3.5 py-2.5">{row.dateCredited}</td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums">
                        {formatINR(row.grossAmount)}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        {row.tdsRate}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-semibold tabular-nums text-amber-700">
                        {formatINR(row.tdsDeducted)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-bold tabular-nums text-emerald-700">
                        {formatINR(row.netCredited)}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-600">
                        {row.challanRef}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="relative m-0 text-xs leading-relaxed text-slate-600">
              This specimen is for educational reference only. Actual TDS
              certificates are issued post quarterly TDS return filing and
              verified via TRACES / Form 26AS.
            </p>
          </div>
        </div>
      </dialog>

      {/* Native <dialog> Modal: Portrait 9:16 Reel Player */}
      <dialog
        ref={videoDialogRef}
        aria-labelledby={videoDialogTitleId}
        {...({ closedby: "any" } as Record<string, string>)}
        onClose={() => {
          const video = videoDialogRef.current?.querySelector("video");
          if (video) video.pause();
        }}
        className="lease-dialog max-h-[92dvh] w-[min(94vw,430px)] overflow-hidden rounded-2xl border border-[#D4AF37]/35 bg-[#0F081D] p-0 text-white shadow-2xl"
      >
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#160B2C] px-4 py-3">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                OXYGOLD.AI
              </span>
              <h1
                id={videoDialogTitleId}
                className="m-0 text-sm font-bold text-white"
              >
                Lease Gold &amp; Silver
              </h1>
            </div>
            <form method="dialog">
              <button
                type="submit"
                autoFocus
                aria-label="Close video dialog"
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center bg-black p-2.5">
            <video
              src={leaseGoldVideo}
              controls
              playsInline
              preload="metadata"
              className="block aspect-[9/16] max-h-[76dvh] w-full rounded-xl bg-black object-contain"
            >
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      </dialog>

      <style>{`
        .lease-skip-link {
          position: absolute;
          left: -9999px;
          top: 12px;
          z-index: 200;
          padding: 10px 16px;
          border-radius: 10px;
          background: #F5D36C;
          color: #1B053A;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
        }
        .lease-skip-link:focus {
          left: 16px;
        }

        /* Native <dialog> scroll containment & backdrop */
        dialog.lease-dialog:modal {
          margin: auto;
          overscroll-behavior: contain;
        }
        dialog.lease-dialog::backdrop {
          background: rgba(5, 2, 14, 0.8);
          backdrop-filter: blur(6px);
          overflow: hidden;
          overscroll-behavior: contain;
        }

        /* Native <details> FAQ Accordion */
        .lease-faq-summary {
          list-style: none;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .lease-faq-summary::-webkit-details-marker {
          display: none;
        }
        .lease-faq-chevron {
          transform: rotate(-90deg);
        }
        .lease-faq-item[open] > .lease-faq-summary .lease-faq-chevron {
          transform: rotate(0deg);
        }
        .lease-faq-item::details-content {
          interpolate-size: allow-keywords;
          overflow: clip;
          contain: layout;
        }
        .lease-faq-item:not([open])::details-content {
          block-size: 0;
        }

        @media (prefers-reduced-motion: no-preference) {
          .lease-faq-chevron {
            transition: transform 0.2s ease;
          }
          .lease-faq-item::details-content {
            transition: block-size, content-visibility, display;
            transition-duration: 0.28s;
            transition-timing-function: ease-in-out;
            transition-behavior: allow-discrete;
          }
        }
      `}</style>
    </div>
  );
}
