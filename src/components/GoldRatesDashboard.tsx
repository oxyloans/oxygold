import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Sparkles,
  Store,
  BarChart3,
  ListFilter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import SubscribeLivePrice from "./SubscribeLivePrice";
import { API_BASE_URL } from "../Config";

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

const API_SHOPS = `${API_BASE_URL}/product-service/all-different-gold-rates`;
const API_IBJA = `${API_BASE_URL}/oxybrick-service/getIbjGoldRates`;

const HARDCODE_FALLBACK_TOKEN =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4N2ZmMWE2My1jY2MyLTQ4MjQtOGQwMy1mMWEyYmVmODMzYjQiLCJpYXQiOjE3NzA4ODIyNjIsImV4cCI6MTc3MTc0NjI2Mn0.G-tBfedu0p0tsi9XVk6FQLT9xDqmpp4_Zkz0eT-lbad6_1OAXfUrrIMQ3d4vdEtkAbFjSr6GVlPOxvolAuoF0w";

const safeNum = (v: any) => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const formatINR = (v: number | null) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return "--";
  try {
    return new Intl.NumberFormat("en-IN").format(Math.round(v));
  } catch {
    return String(Math.round(v));
  }
};

const formatDateLabel = (s: string) => {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

function PurityToggle({
  value,
  onChange,
}: {
  value: "24KT" | "22KT";
  onChange: (v: "24KT" | "22KT") => void;
}) {
  return (
    <div className="inline-flex p-0.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onChange("24KT")}
        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
          value === "24KT"
            ? "bg-gradient-to-b from-[#F5D36C] to-[#D4AF37] text-[#1B053A] shadow-md scale-[1.02]"
            : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
      >
        24KT
      </button>
      <button
        type="button"
        onClick={() => onChange("22KT")}
        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
          value === "22KT"
            ? "bg-gradient-to-b from-[#F5D36C] to-[#D4AF37] text-[#1B053A] shadow-md scale-[1.02]"
            : "text-white/70 hover:text-white hover:bg-white/5"
        }`}
      >
        22KT
      </button>
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "chart" | "table";
  onChange: (v: "chart" | "table") => void;
}) {
  return (
    <div className="inline-flex p-0.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onChange("chart")}
        title="Bar Chart View"
        className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
          view === "chart"
            ? "bg-gradient-to-b from-[#F5D36C] to-[#D4AF37] text-[#1B053A] shadow-md"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        <BarChart3 size={14} />
        <span className="hidden sm:inline text-[11px]">Chart</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        title="Rankings List View"
        className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
          view === "table"
            ? "bg-gradient-to-b from-[#F5D36C] to-[#D4AF37] text-[#1B053A] shadow-md"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        <ListFilter size={14} />
        <span className="hidden sm:inline text-[11px]">Ranking</span>
      </button>
    </div>
  );
}

export default function GoldRatesDashboard() {
  const [shops, setShops] = useState<ShopRate[]>([]);
  const [ibja, setIbja] = useState<IbjaRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [ibjaMode, setIbjaMode] = useState<"24KT" | "22KT">("24KT");
  const [shopsMode, setShopsMode] = useState<"24KT" | "22KT">("24KT");
  const [shopsView, setShopsView] = useState<"chart" | "table">("chart");

  useEffect(() => {
    let alive = true;

    const getToken = () => {
      const s = sessionStorage.getItem("accessToken");
      if (s && s.trim()) return s.trim();

      const envTok = (import.meta as any)?.env?.VITE_OXY_ACCESS_TOKEN;
      if (typeof envTok === "string" && envTok.trim()) return envTok.trim();

      if (HARDCODE_FALLBACK_TOKEN && HARDCODE_FALLBACK_TOKEN.trim())
        return HARDCODE_FALLBACK_TOKEN.trim();

      return "";
    };

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const token = getToken();
        const headers: Record<string, string> = {
          Accept: "application/json",
        };

        if (token) headers.Authorization = `Bearer ${token}`;

        const [shopsRes, ibjaRes] = await Promise.all([
          fetch(API_SHOPS, { headers }),
          fetch(API_IBJA, { headers }),
        ]);

        if (!shopsRes.ok || !ibjaRes.ok) {
          const sMsg = !shopsRes.ok
            ? `Shops API failed (${shopsRes.status})`
            : "";
          const iMsg = !ibjaRes.ok ? `IBJA API failed (${ibjaRes.status})` : "";
          throw new Error([sMsg, iMsg].filter(Boolean).join(" • "));
        }

        const shopsJson = await shopsRes.json().catch(() => []);
        const ibjaJson = await ibjaRes.json().catch(() => []);

        if (!alive) return;

        setShops(Array.isArray(shopsJson) ? shopsJson : []);
        setIbja(Array.isArray(ibjaJson) ? ibjaJson : []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Unable to fetch live rates");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const ibjaChartData = useMemo(() => {
    const list = [...(ibja || [])].reverse();
    return list.map((r) => ({
      label: formatDateLabel(r.fetchDate),
      fullDate: r.fetchDate,
      v999: safeNum(r.purity999),
      v916: safeNum(r.purity916),
      v995: safeNum(r.purity995),
      v750: safeNum(r.purity750),
    }));
  }, [ibja]);

  const ibjaStats = useMemo(() => {
    const key = ibjaMode === "24KT" ? "v999" : "v916";
    const values = ibjaChartData
      .map((d: any) => d[key])
      .filter((x: any) => typeof x === "number") as number[];
    const last = ibjaChartData[ibjaChartData.length - 1] as any;
    const prev =
      ibjaChartData.length > 1
        ? (ibjaChartData[ibjaChartData.length - 2] as any)
        : null;

    const current = last ? last[key] : null;
    const previous = prev ? prev[key] : null;
    const change = current && previous ? current - previous : 0;

    if (!values.length) {
      return {
        current: null,
        min: null,
        max: null,
        change: 0,
        date: "",
      };
    }

    return {
      current,
      min: Math.min(...values),
      max: Math.max(...values),
      change,
      date: last?.label || "",
    };
  }, [ibjaChartData, ibjaMode]);

  const shopsChartData = useMemo(() => {
    const key = shopsMode === "24KT" ? "rate24kt" : "rate22kt";
    const rows = (shops || [])
      .map((s) => ({
        id: s.id,
        name: s.companyName,
        rate: safeNum((s as any)[key]),
      }))
      .filter(
        (
          x
        ): x is {
          id: string;
          name: string;
          rate: number;
        } => typeof x.rate === "number"
      );

    // Sorted from most competitive (lowest) to highest
    rows.sort((a, b) => a.rate - b.rate);
    return rows;
  }, [shops, shopsMode]);

  const retry = () => window.location.reload();

  return (
    <div className="w-full py-6 sm:py-8 lg:py-10">
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-3.5 sm:p-6 lg:p-8"
        style={{
          background:
            "radial-gradient(900px 420px at 20% 0%, rgba(91,46,255,0.22), transparent 55%), radial-gradient(700px 360px at 90% 20%, rgba(212,175,55,0.16), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        }}
      >
        {/* Header with Title and Live Subscribe Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D36C] text-[10px] sm:text-[11px] font-semibold mb-2">
              <Sparkles size={12} className="animate-pulse" />
              <span>Live Market Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Smart{" "}
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5D36C] bg-clip-text text-transparent">
                Gold Rate Analytics
              </span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/70">
              Clean comparison of leading retail shops vs official IBJA benchmark rates.
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <SubscribeLivePrice />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-3 border-white/20 border-t-[#D4AF37] animate-spin" />
            <p className="text-xs sm:text-sm text-white/70 font-medium">
              Fetching real-time gold rates…
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && err && (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
            <AlertCircle className="w-9 h-9 text-rose-400" />
            <p className="text-sm font-semibold text-white/90">{err}</p>
            <p className="text-xs text-white/50 max-w-md">
              Please check your connection or retry fetching the latest data.
            </p>
            <button
              onClick={retry}
              type="button"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B2EFF] to-[#3D0B7A] text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Content Section */}
        {!loading && !err && (
          <>
            {/* Analytics Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Card 1: IBJA Benchmark Trend */}
              <div
                className="rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg backdrop-blur-md transition-all hover:border-white/20"
                style={{
                  background:
                    "radial-gradient(700px 360px at 20% 10%, rgba(91,46,255,0.20), transparent 55%), radial-gradient(650px 300px at 90% 10%, rgba(212,175,55,0.12), transparent 60%), linear-gradient(180deg, rgba(15,8,28,0.7), rgba(10,5,20,0.85))",
                }}
              >
                <div>
                  {/* Card Header & Controls */}
                  <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#F5D36C] shadow-[0_0_8px_#F5D36C]" />
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                          IBJA Benchmark Trend
                        </h3>
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-[#F5D36C]">
                          {ibjaStats.current !== null
                            ? `₹${formatINR(ibjaStats.current)}`
                            : "--"}
                        </span>
                        <span className="text-xs text-white/50">/ gram</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-white/50 mt-0.5">
                        Min: ₹{formatINR(ibjaStats.min)} • Max: ₹{formatINR(ibjaStats.max)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white/60 hidden sm:inline font-semibold">
                        Purity:
                      </span>
                      <PurityToggle value={ibjaMode} onChange={setIbjaMode} />
                    </div>
                  </div>

                  {/* AreaChart */}
                  <div className="h-[280px] sm:h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={ibjaChartData}
                        margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                      >
                        <defs>
                          <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F5D36C" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="areaPurple" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.06)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                          tickLine={false}
                          minTickGap={15}
                          angle={-25}
                          textAnchor="end"
                          height={40}
                        />
                        <YAxis
                          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          domain={["dataMin - 150", "dataMax + 150"]}
                          tickFormatter={(v) => `₹${formatINR(v)}`}
                        />
                        <Tooltip
                          content={({ active, label, payload }: any) => {
                            if (!active || !payload?.length) return null;
                            const item = payload[0];
                            const fullDate = item.payload.fullDate;
                            return (
                              <div className="rounded-xl border border-white/20 bg-[#0F081D]/95 backdrop-blur-md p-3 text-xs shadow-2xl min-w-[190px]">
                                <div className="font-semibold text-white/80 border-b border-white/10 pb-1 mb-2 flex items-center justify-between">
                                  <span>
                                    {fullDate
                                      ? new Date(fullDate).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : label}
                                  </span>
                                  <span className="text-[10px] bg-white/10 text-[#F5D36C] px-1.5 py-0.5 rounded-full font-bold">
                                    IBJA {ibjaMode}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                  <span className="text-white/70">Rate:</span>
                                  <span className="font-bold text-[#F5D36C] text-sm">
                                    ₹{formatINR(item.value)} / g
                                  </span>
                                </div>
                                <div className="mt-1 text-[10px] text-white/50 text-right">
                                  Official Benchmark
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey={ibjaMode === "24KT" ? "v999" : "v916"}
                          name={ibjaMode === "24KT" ? "IBJA 24KT (999)" : "IBJA 22KT (916)"}
                          stroke={ibjaMode === "24KT" ? "#F5D36C" : "#A78BFA"}
                          strokeWidth={2.5}
                          fill={ibjaMode === "24KT" ? "url(#areaGold)" : "url(#areaPurple)"}
                          activeDot={{
                            r: 5,
                            fill: ibjaMode === "24KT" ? "#F5D36C" : "#A78BFA",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Card 2: Retail Shops Rate Comparison */}
              <div
                className="rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg backdrop-blur-md transition-all hover:border-white/20"
                style={{
                  background:
                    "radial-gradient(700px 360px at 20% 10%, rgba(91,46,255,0.20), transparent 55%), radial-gradient(650px 300px at 90% 10%, rgba(212,175,55,0.12), transparent 60%), linear-gradient(180deg, rgba(15,8,28,0.7), rgba(10,5,20,0.85))",
                }}
              >
                <div>
                  {/* Card Header & Controls */}
                  <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <Store size={16} className="text-[#F5D36C]" />
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                          Shops Comparison
                        </h3>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-white/50 mt-1">
                        Ranked from lowest (best deal) to highest across retail shops
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <PurityToggle value={shopsMode} onChange={setShopsMode} />
                      <ViewToggle view={shopsView} onChange={setShopsView} />
                    </div>
                  </div>

                  {/* View A: Bar Chart */}
                  {shopsView === "chart" ? (
                    <div className="h-[280px] sm:h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={shopsChartData}
                          margin={{ top: 10, right: 10, left: -15, bottom: 40 }}
                        >
                          <defs>
                            <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F5D36C" />
                              <stop offset="100%" stopColor="#C59B27" />
                            </linearGradient>
                            <linearGradient id="barPurple" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#A78BFA" />
                              <stop offset="100%" stopColor="#6366F1" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            stroke="rgba(255,255,255,0.06)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 9 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                            tickLine={false}
                            interval={0}
                            angle={-32}
                            textAnchor="end"
                            height={55}
                          />
                          <YAxis
                            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            domain={["dataMin - 100", "dataMax + 100"]}
                            tickFormatter={(v) => `₹${formatINR(v)}`}
                          />
                          <Tooltip
                            content={({ active, payload }: any) => {
                              if (!active || !payload?.length) return null;
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-xl border border-white/20 bg-[#0F081D]/95 backdrop-blur-md p-3 text-xs shadow-2xl min-w-[170px]">
                                  <div className="font-bold text-white border-b border-white/10 pb-1.5 mb-2 flex items-center justify-between gap-2">
                                    <span className="truncate max-w-[130px] font-semibold">
                                      {data.name}
                                    </span>
                                    <span className="text-[10px] text-[#F5D36C] font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded-full shrink-0">
                                      {shopsMode}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-1">
                                    <span className="text-white/70 text-[11px]">{shopsMode} Rate:</span>
                                    <span className="font-extrabold text-[#F5D36C] text-sm">
                                      ₹{formatINR(data.rate)}
                                      <span className="text-[10px] text-white/50 font-normal ml-0.5">/g</span>
                                    </span>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar
                            dataKey="rate"
                            name={shopsMode}
                            fill={
                              shopsMode === "24KT"
                                ? "url(#barGold)"
                                : "url(#barPurple)"
                            }
                            radius={[6, 6, 0, 0]}
                            maxBarSize={36}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    /* View B: Ranking List Table */
                    <div className="h-[280px] sm:h-[320px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                      {shopsChartData.map((shop, idx) => {
                        const isBest = idx === 0;
                        return (
                          <div
                            key={shop.id || shop.name}
                            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                              isBest
                                ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.12)]"
                                : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                  isBest
                                    ? "bg-[#D4AF37] text-[#1B053A]"
                                    : idx === 1
                                    ? "bg-slate-300 text-slate-900"
                                    : idx === 2
                                    ? "bg-amber-700 text-amber-100"
                                    : "bg-white/10 text-white/70"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-white text-xs sm:text-sm truncate">
                                  {shop.name}
                                </div>
                                <div className="text-[10px] text-white/50">
                                  Rank #{idx + 1}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-black text-[#F5D36C] text-xs sm:text-sm">
                                ₹{formatINR(shop.rate)}
                                <span className="text-[10px] text-white/50 font-normal ml-0.5">/g</span>
                              </div>
                              {isBest && (
                                <div className="text-[10px] text-emerald-400 font-bold">
                                  Best {shopsMode} Rate
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.4);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.7);
        }
      `}</style>
    </div>
  );
}
