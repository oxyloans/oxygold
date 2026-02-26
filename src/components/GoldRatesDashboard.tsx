
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
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
  heroPoster: "/assets/namaste-mumbai.png",
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

const testimonials = [
  { name: "Sarah Chen", role: "Investor", text: "Premium feel + secure vaulting. Clean fintech UI.", rating: 5 },
  { name: "Aparna Isha", role: "Professional", text: "Transparent pricing and trust-first experience.", rating: 5 },
  { name: "Caites Ruiz", role: "Trader", text: "Fast workflow. Smooth settlement.", rating: 4 },
];

/* =========================
   ✅ SECTION-4: GOLD RATES DASHBOARD (YOUR CODE)
   ========================= */

type ShopRate = {
  id: string;
  companyName: string;
  rate22kt: number | null;
  rate24kt: number | null;
  silverprice: number | null;
  updatedTime: number | null;
};

type IbjaRate = {
  purity999: string | null;
  purity995: string | null;
  purity916: string | null;
  purity750: string | null;
  purity585: string | null;
  fetchDate: string;
  source: string;
};

const API_SHOPS =
  "https://meta.oxyloans.com/api/product-service/all-different-gold-rates";
const API_IBJA =
  "https://meta.oxyloans.com/api/oxybrick-service/getIbjGoldRates";

// ✅ keep as you provided (but best practice: move to env var)
const ACCESS_TOKEN =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4N2ZmMWE2My1jY2MyLTQ4MjQtOGQwMy1mMWEyYmVmODMzYjQiLCJpYXQiOjE3NzA4ODIyNjIsImV4cCI6MTc3MTc0NjI2Mn0.G-tBfedu0p0tsi9XVk6FQLT9xDqmpp4_Zkz0eT-lbad6_1OAXfUrrIMQ3d4vdEtkAbFjSr6GVlPOxvolAuoF0w";

function formatINR(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-IN").format(n);
}

function formatDateLabel(fetchDate: string) {
  const datePart = fetchDate?.split(" ")?.[0] ?? fetchDate;
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return fetchDate;
  return `${d}/${m}`;
}

function formatUpdatedTime(ms: number | null | undefined) {
  if (!ms) return "—";
  const dt = new Date(ms);
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortName(name: string) {
  const n = (name || "").trim();
  if (!n) return "—";
  if (n.length <= 12) return n;
  const first = n.split(" ")[0];
  return first.length >= 6 ? first : n.slice(0, 12) + "…";
}

function safeNum(x: string | null) {
  if (!x) return null;
  const v = Number(x);
  return Number.isFinite(v) ? v : null;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  variant,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  variant: "ibja" | "shops";
}) => {
  if (!active || !payload?.length) return null;

  const items = payload
    .filter((p) => p?.value !== null && p?.value !== undefined)
    .map((p) => ({
      name: p.name,
      value: p.value,
      stroke: p.stroke || p.fill,
    }));

  return (
    <div className="oxy-tip">
      <div className="oxy-tip-title">{label}</div>

      <div className="oxy-tip-rows">
        {items.map((it) => (
          <div className="oxy-tip-row" key={it.name}>
            <span className="oxy-tip-dot" style={{ background: it.stroke }} />
            <span className="oxy-tip-k">{it.name}</span>
            <span className="oxy-tip-v">₹{formatINR(it.value)}</span>
          </div>
        ))}
      </div>

      <div className="oxy-tip-foot">OXYGOLD.AI • Price Intelligence</div>
    </div>
  );
};

function GoldRatesDashboardEmbedded() {
  const [shops, setShops] = useState<ShopRate[]>([]);
  const [ibja, setIbja] = useState<IbjaRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [ibjaMode, setIbjaMode] = useState<"24KT" | "22KT">("24KT");
  const [shopsMode, setShopsMode] = useState<"24KT" | "22KT">("24KT");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const headers = {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        };

        const [shopsRes, ibjaRes] = await Promise.all([
          fetch(API_SHOPS, { headers }).catch(
            () => ({ ok: false, status: 0 } as Response)
          ),
          fetch(API_IBJA, { headers }).catch(
            () => ({ ok: false, status: 0 } as Response)
          ),
        ]);

        const shopsJson: ShopRate[] = shopsRes.ok
          ? await shopsRes.json().catch(() => [])
          : [];
        const ibjaJson: IbjaRate[] = ibjaRes.ok
          ? await ibjaRes.json().catch(() => [])
          : [];

        if (!alive) return;

        setShops(Array.isArray(shopsJson) ? shopsJson : []);
        setIbja(Array.isArray(ibjaJson) ? ibjaJson : []);

        if (
          (!Array.isArray(shopsJson) || shopsJson.length === 0) &&
          (!Array.isArray(ibjaJson) || ibjaJson.length === 0)
        ) {
          setErr("No data available from APIs");
        }
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load data");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const ibjaChartData = useMemo(() => {
    const list = [...(ibja || [])].reverse();
    return list.map((r) => {
      const v999 = safeNum(r.purity999);
      const v916 = safeNum(r.purity916);
      return { label: formatDateLabel(r.fetchDate), v999, v916 };
    });
  }, [ibja]);

  const ibjaLatest = useMemo(() => {
    if (!ibjaChartData.length) return null;
    const last = ibjaChartData[ibjaChartData.length - 1];
    const current = ibjaMode === "24KT" ? last.v999 : last.v916;
    return { ...last, current };
  }, [ibjaChartData, ibjaMode]);

  const ibjaMinMax = useMemo(() => {
    const key = ibjaMode === "24KT" ? "v999" : "v916";
    const values = ibjaChartData
      .map((d: any) => d[key])
      .filter((x: any) => typeof x === "number");
    if (!values.length) return { min: null, max: null };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [ibjaChartData, ibjaMode]);

  const shopsChartData = useMemo(() => {
    const key = shopsMode === "24KT" ? "rate24kt" : "rate22kt";
    const mapped = (shops || [])
      .map((s) => ({
        name: shortName(s.companyName),
        fullName: s.companyName,
        v:
          typeof (s as any)[key] === "number"
            ? ((s as any)[key] as number)
            : null,
        rate24: s.rate24kt,
        rate22: s.rate22kt,
        updatedTime: s.updatedTime,
      }))
      .filter((x) => typeof x.v === "number");

    mapped.sort((a, b) => (b.v! as number) - (a.v! as number));
    return mapped;
  }, [shops, shopsMode]);

  const shopsMinMax = useMemo(() => {
    const values = shopsChartData
      .map((d) => d.v)
      .filter((x) => typeof x === "number") as number[];
    if (!values.length) return { min: null, max: null };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [shopsChartData]);

  const shopsLatestTime = useMemo(() => {
    const times = (shops || [])
      .map((s) => s.updatedTime || 0)
      .filter((t) => t > 0);
    if (!times.length) return "—";
    return formatUpdatedTime(Math.max(...times));
  }, [shops]);

  const pageHasData = (shops?.length || 0) > 0 || (ibja?.length || 0) > 0;

  return (
    <div className="oxyModelWrap">
      {/* Top Title Row (like your model) */}
      <div className="oxyModelTop">
        <div>
          <h2 className="oxyModelTitle">Smart Gold Rate Analytics</h2>
          <p className="oxyModelSub">
            Monitor, analyze, and compare gold prices with real-time shop rates
            and IBJA trend intelligence.
          </p>

          <div className="oxyModelPill">
            <span className="oxyBolt">⚡</span>
            <span>Fast And Responsive</span>
          </div>
        </div>

        <div className="oxyModelRightControls">
          <div className="oxyModelSelect">
            <span className="dot" />
            <span>This Year</span>
            <span className="caret">▾</span>
          </div>
          <button className="oxyModelMore" aria-label="More">
            ⋯
          </button>
        </div>
      </div>

      {/* Tabs row (Cash Flow like model) */}
      <div className="oxyModelTabs">
        <button className="oxyTab isActive">Cash Flow</button>

        <div className="oxyLegendToggles">
          <div className="oxyLegendItem">
            <span className="sq sqIncome" />
            <span>IBJA</span>
            <div className="oxyMiniSwitch">
              <button
                className={ibjaMode === "24KT" ? "on" : ""}
                onClick={() => setIbjaMode("24KT")}
              >
                24KT
              </button>
              <button
                className={ibjaMode === "22KT" ? "on" : ""}
                onClick={() => setIbjaMode("22KT")}
              >
                22KT
              </button>
            </div>
          </div>

          <div className="oxyLegendItem">
            <span className="sq sqExpense" />
            <span>Shops</span>
            <div className="oxyMiniSwitch">
              <button
                className={shopsMode === "24KT" ? "on" : ""}
                onClick={() => setShopsMode("24KT")}
              >
                24KT
              </button>
              <button
                className={shopsMode === "22KT" ? "on" : ""}
                onClick={() => setShopsMode("22KT")}
              >
                22KT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="oxyModelState">
          <div className="oxySpinner" />
          <div>Loading gold rates…</div>
        </div>
      ) : err && !pageHasData ? (
        <div className="oxyModelState oxyModelError">
          <div className="t">Unable to load data</div>
          <div className="m">{err}</div>
          <button className="oxyRetry" onClick={() => window.location.reload()}>
            RETRY
          </button>
        </div>
      ) : !pageHasData ? (
        <div className="oxyModelState">
          <div className="t">No Data Available</div>
          <div className="m">Rates will appear once APIs return data.</div>
        </div>
      ) : (
        <div className="oxyModelGrid">
          {/* LEFT: IBJA (line style like model) */}
          <div className="oxyModelCard">
            <div className="oxyCardHead">
              <div>
                <div className="k">IBJA Trend</div>
                <div className="v">
                  ₹{formatINR(ibjaLatest?.current ?? null)}
                  <span className="chip">
                    High ₹{formatINR(ibjaMinMax.max)} • Low ₹{formatINR(ibjaMinMax.min)}
                  </span>
                </div>
              </div>
              <div className="meta">Updated by feed</div>
            </div>

            <div className="oxyChartShell2">
              <div className="oxyChartGlow" />
              <div className="oxyChartGrid" />
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={ibjaChartData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 6 }}
                >
                  <defs>
                    <linearGradient id="oxyLineFillGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(212,175,55,0.30)" />
                      <stop offset="100%" stopColor="rgba(212,175,55,0.00)" />
                    </linearGradient>
                    <linearGradient id="oxyLineFillPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(138,91,255,0.22)" />
                      <stop offset="100%" stopColor="rgba(138,91,255,0.00)" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.60)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.60)", fontSize: 11 }} width={44} />
                  <Tooltip
                    content={(p) => <CustomTooltip {...(p as any)} variant="ibja" />}
                    cursor={{ stroke: "rgba(255,255,255,0.10)" }}
                  />

                  <Area
                    type="monotone"
                    dataKey="v999"
                    name="999 (24KT)"
                    stroke="rgba(212,175,55,0.95)"
                    strokeWidth={3}
                    fill="url(#oxyLineFillGold)"
                    dot={false}
                    activeDot={{ r: 5 }}
                    hide={ibjaMode !== "24KT"}
                  />
                  <Area
                    type="monotone"
                    dataKey="v916"
                    name="916 (22KT)"
                    stroke="rgba(138,91,255,0.95)"
                    strokeWidth={3}
                    fill="url(#oxyLineFillPurple)"
                    dot={false}
                    activeDot={{ r: 5 }}
                    hide={ibjaMode !== "22KT"}
                  />

                  {/* faint context line */}
                  <Line
                    type="monotone"
                    dataKey={ibjaMode === "24KT" ? "v916" : "v999"}
                    name="Context"
                    stroke="rgba(255,255,255,0.14)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT: Shops (comparison) */}
          <div className="oxyModelCard">
            <div className="oxyCardHead">
              <div>
                <div className="k">Shops Comparison</div>
                <div className="v">
                  Updated: {shopsLatestTime}
                  <span className="chip">
                    High ₹{formatINR(shopsMinMax.max)} • Low ₹{formatINR(shopsMinMax.min)}
                  </span>
                </div>
              </div>
              <div className="meta">Snapshot view</div>
            </div>

            <div className="oxyChartShell2">
              <div className="oxyChartGlow" />
              <div className="oxyChartGrid" />

              <div className="oxyScrollX">
                <div className="oxyMinW">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={shopsChartData}
                      margin={{ top: 10, right: 12, left: 0, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="oxyBarGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(212,175,55,0.95)" />
                          <stop offset="100%" stopColor="rgba(245,211,108,0.40)" />
                        </linearGradient>
                        <linearGradient id="oxyBarPurple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(138,91,255,0.95)" />
                          <stop offset="100%" stopColor="rgba(91,46,255,0.35)" />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "rgba(255,255,255,0.60)", fontSize: 11 }}
                        interval={0}
                        angle={-18}
                        height={52}
                      />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.60)", fontSize: 11 }} width={44} />
                      <Tooltip
                        content={(p) => <CustomTooltip {...(p as any)} variant="shops" />}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }} />

                      <Bar dataKey="rate24" name="24KT" fill="url(#oxyBarGold)" radius={[10, 10, 0, 0]} />
                      <Bar dataKey="rate22" name="22KT" fill="url(#oxyBarPurple)" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{dashCss}</style>
    </div>
  );
}

/* =========================
   ✅ LANDING PAGE (UNCHANGED SECTIONS)
   ========================= */

export default function OxyGoldLandingPage({ assets }: Props) {
  const A = { ...DEFAULT_ASSETS, ...(assets || {}) };

  return (
        <section id="rates" className="py-12">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-10">
            <GoldFrameLines />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-35" />
            <GoldRatesDashboardEmbedded />
          </div>
        </section>
  );
}

/* =========================
   Helpers (unchanged)
   ========================= */

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

const dashCss = `
.oxyModelWrap{
  position: relative;
  padding: 22px 18px;
  border-radius: 26px;
  border: 1px solid rgba(255,255,255,0.10);
  background:
    radial-gradient(900px 420px at 20% 0%, rgba(91,46,255,0.22), transparent 55%),
    radial-gradient(700px 360px at 90% 20%, rgba(212,175,55,0.16), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
  box-shadow:
    0 26px 90px rgba(0,0,0,0.45),
    inset 0 0 0 1px rgba(255,255,255,0.06);
  backdrop-filter: blur(18px);
  overflow: hidden;
}

/* border glow like model */
.oxyModelWrap:before{
  content:"";
  position:absolute;
  inset:-1px;
  border-radius: 26px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(138,91,255,0.55), rgba(255,255,255,0.08), rgba(245,211,108,0.35));
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events:none;
  opacity: 0.75;
}

.oxyModelTop{
  display:flex;
  align-items:flex-start;
  justify-content: space-between;
  gap: 14px;
  position: relative;
  z-index: 2;
}
.oxyModelTitle{
  font-family: "Playfair Display", serif;
  font-weight: 800;
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.15;
  color: rgba(255,255,255,0.95);
  margin: 0;
}
.oxyModelSub{
  margin-top: 8px;
  max-width: 62ch;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255,255,255,0.65);
}
.oxyModelPill{
  margin-top: 12px;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.75);
  font-size: 12px;
  font-weight: 700;
}
.oxyBolt{
  width: 22px;
  height: 22px;
  display:grid;
  place-items:center;
  border-radius: 10px;
  background: rgba(212,175,55,0.18);
  border: 1px solid rgba(212,175,55,0.25);
  color: rgba(245,211,108,0.95);
}

.oxyModelRightControls{
  display:flex;
  align-items:center;
  gap: 10px;
}
.oxyModelSelect{
  display:flex;
  align-items:center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.70);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.oxyModelSelect .dot{
  width: 8px; height: 8px;
  border-radius: 999px;
  background: rgba(138,91,255,0.9);
  box-shadow: 0 0 0 4px rgba(138,91,255,0.15);
}
.oxyModelSelect .caret{ opacity: 0.75; }

.oxyModelMore{
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
  cursor: pointer;
}

.oxyModelTabs{
  margin-top: 16px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 2;
}
.oxyTab{
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.70);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.oxyTab.isActive{
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.92);
  box-shadow: 0 16px 50px rgba(0,0,0,0.25);
}

.oxyLegendToggles{
  display:flex;
  align-items:center;
  gap: 14px;
  flex-wrap: wrap;
}
.oxyLegendItem{
  display:flex;
  align-items:center;
  gap: 8px;
  color: rgba(255,255,255,0.70);
  font-size: 12px;
  font-weight: 800;
}
.sq{
  width: 10px; height: 10px;
  border-radius: 3px;
  display:inline-block;
}
.sqIncome{ background: rgba(138,91,255,0.95); }
.sqExpense{ background: rgba(212,175,55,0.95); }

.oxyMiniSwitch{
  display:flex;
  align-items:center;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.04);
}
.oxyMiniSwitch button{
  padding: 6px 9px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255,255,255,0.65);
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}
.oxyMiniSwitch button.on{
  background: linear-gradient(135deg, rgba(91,46,255,0.95), rgba(138,91,255,0.95));
  color: #fff;
  box-shadow: 0 12px 30px rgba(91,46,255,0.25);
}

/* grid */
.oxyModelGrid{
  margin-top: 14px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 980px){
  .oxyModelGrid{ grid-template-columns: 1fr; }
  .oxyModelRightControls{ display:none; } /* like mobile simplification */
}

.oxyModelCard{
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(0,0,0,0.22);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
  overflow: hidden;
  position: relative;
}
.oxyModelCard:before{
  content:"";
  position:absolute;
  inset:-2px;
  background:
    radial-gradient(520px 240px at 20% 0%, rgba(138,91,255,0.20), transparent 55%),
    radial-gradient(520px 240px at 90% 20%, rgba(212,175,55,0.14), transparent 60%);
  pointer-events:none;
  opacity: 0.7;
}

.oxyCardHead{
  padding: 14px 14px 0;
  position: relative;
  z-index: 2;
  display:flex;
  align-items:flex-start;
  justify-content: space-between;
  gap: 10px;
}
.oxyCardHead .k{
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.60);
}
.oxyCardHead .v{
  margin-top: 6px;
  font-size: 14px;
  font-weight: 900;
  color: rgba(255,255,255,0.92);
}
.oxyCardHead .chip{
  margin-left: 10px;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.05);
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.65);
}
.oxyCardHead .meta{
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
}

.oxyChartShell2{
  position: relative;
  padding: 10px 10px 12px;
  z-index: 2;
}
.oxyChartGlow{
  position:absolute;
  inset:-80px -80px auto auto;
  width: 260px; height: 260px;
  background: radial-gradient(circle at 30% 30%, rgba(212,175,55,0.18), transparent 62%);
  filter: blur(1px);
  pointer-events:none;
}
.oxyChartGrid{
  position:absolute;
  inset: 52px 12px 16px 12px;
  background:
    linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: radial-gradient(700px 320px at 50% 10%, rgba(0,0,0,0.75), transparent 70%);
  pointer-events:none;
  border-radius: 16px;
  opacity: 0.45;
}

/* horizontal scroll for many brands (shops) */
.oxyScrollX{ overflow-x: auto; }
.oxyMinW{ min-width: 720px; }
@media (max-width: 720px){
  .oxyMinW{ min-width: 760px; }
}

/* states */
.oxyModelState{
  margin-top: 18px;
  padding: 26px 14px;
  border-radius: 18px;
  border: 1px dashed rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.05);
  text-align: center;
  color: rgba(255,255,255,0.75);
}
.oxyModelState .t{
  font-weight: 900;
  color: rgba(255,255,255,0.90);
}
.oxyModelState .m{
  margin-top: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.70);
}
.oxySpinner{
  width: 40px; height: 40px;
  margin: 0 auto 10px;
  border-radius: 999px;
  border: 4px solid rgba(138,91,255,0.45);
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}
@keyframes spin{ to{ transform: rotate(360deg); } }

.oxyModelError{
  border-color: rgba(255,0,0,0.25);
  background: rgba(255,0,0,0.06);
}
.oxyRetry{
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(212,175,55,0.35);
  background: linear-gradient(135deg, rgba(212,175,55,0.95), rgba(245,211,108,0.95));
  color: rgba(43,10,89,0.95);
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

/* tooltips */
.oxy-tip{
  border-radius: 14px;
  padding: 12px 12px 10px;
  background: rgba(16,10,36,0.96);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 18px 50px rgba(0,0,0,0.35);
  min-width: 220px;
  color: #fff;
}
.oxy-tip-title{
  font-weight: 900;
  color: rgba(255,255,255,0.92);
  font-size: 13px;
  margin-bottom: 8px;
}
.oxy-tip-rows{ display:flex; flex-direction: column; gap: 6px; }
.oxy-tip-row{ display:flex; align-items:center; gap: 8px; }
.oxy-tip-dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(0,0,0,0.20);
}
.oxy-tip-k{
  flex: 1;
  font-weight: 800;
  font-size: 12px;
  color: rgba(255,255,255,0.70);
}
.oxy-tip-v{
  font-weight: 900;
  font-size: 12px;
  color: rgba(255,255,255,0.92);
}
.oxy-tip-foot{
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.10);
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.60);
}

/* Loading / error / empty */
.oxy-loading{
  padding: 36px 18px;
  border-radius: 18px;
  border: 1px dashed rgba(255,255,255,0.20);
  background: rgba(255,255,255,0.05);
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 12px;
}
.oxy-spinner{
  width: 42px; height: 42px;
  border-radius: 999px;
  border: 4px solid rgba(91,46,255,0.55);
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}
@keyframes spin{ to{ transform: rotate(360deg); } }
.oxy-loadingText{
  font-weight: 800;
  color: rgba(255,255,255,0.85);
}

.oxy-error{
  padding: 34px 18px;
  border-radius: 18px;
  border: 1px solid rgba(255,0,0,0.22);
  background: rgba(255,0,0,0.06);
  text-align: center;
  color: #fff;
}
.oxy-errorIcon{ font-size: 42px; margin-bottom: 10px; }
.oxy-errorTitle{ font-weight: 900; font-size: 18px; margin-bottom: 8px; }
.oxy-errorMsg{ margin: 6px 0 16px; font-size: 14px; opacity: 0.85; }

.oxy-empty{
  padding: 44px 18px;
  border-radius: 18px;
  border: 1px dashed rgba(255,255,255,0.22);
  background: rgba(212,175,55,0.08);
  text-align: center;
  color: #fff;
}
.oxy-emptyIcon{ font-size: 54px; margin-bottom: 10px; }
.oxy-emptyTitle{ font-weight: 900; font-size: 18px; margin-bottom: 8px; }
.oxy-emptyMsg{ font-size: 14px; opacity: 0.85; }

@media (max-width: 720px){
  .oxy-panelHead{
    flex-direction: column;
    align-items:flex-start;
  }
  .oxy-switch{ width: 100%; justify-content: space-between; }
  .oxy-switchBtn{ flex: 1; text-align:center; }
  .oxy-callout{
    right: 12px;
    top: 12px;
    transform: scale(0.95);
    transform-origin: top right;
  }
}
`; 