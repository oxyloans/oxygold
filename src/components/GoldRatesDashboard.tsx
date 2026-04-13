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
  Legend,
} from "recharts";

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

import { API_BASE_URL } from "../Config";
const API_SHOPS =
  `${API_BASE_URL}/product-service/all-different-gold-rates`;
const API_IBJA =
  `${API_BASE_URL}/oxybrick-service/getIbjGoldRates`;

/** last fallback only (keep yours if needed) */
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

const Tip = ({
  label,
  rows,
}: {
  label: string;
  rows: { name: string; value: number; stroke: string }[];
}) => {
  return (
    <div className="tip">
      <div className="tipTitle">{label}</div>
      <div className="tipRows">
        {rows.map((r) => (
          <div className="tipRow" key={r.name}>
            <span className="dot" style={{ background: r.stroke }} />
            <span className="k">{r.name}</span>
            <span className="v">₹{formatINR(r.value)}</span>
          </div>
        ))}
      </div>
      <div className="tipFoot">OXYGOLD.AI • Gold Intelligence</div>
    </div>
  );
};

function GoldToggle({
  left,
  right,
  value,
  onChange,
}: {
  left: string;
  right: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="goldSeg">
      <button
        type="button"
        className={value === left ? "on" : ""}
        onClick={() => onChange(left)}
      >
        {left}
      </button>
      <button
        type="button"
        className={value === right ? "on" : ""}
        onClick={() => onChange(right)}
      >
        {right}
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

  useEffect(() => {
    let alive = true;

    const getToken = () => {
      // 1) sessionStorage (your app usually uses this)
      const s = sessionStorage.getItem("accessToken");
      if (s && s.trim()) return s.trim();

      // 2) Vite env var (optional)
      const envTok = (import.meta as any)?.env?.VITE_OXY_ACCESS_TOKEN;
      if (typeof envTok === "string" && envTok.trim()) return envTok.trim();

      // 3) hardcoded fallback (last)
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

        // Only attach Authorization if token exists
        if (token) headers.Authorization = `Bearer ${token}`;

        const [shopsRes, ibjaRes] = await Promise.all([
          fetch(API_SHOPS, { headers }),
          fetch(API_IBJA, { headers }),
        ]);

        // If either failed, show proper status
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
        setErr(e?.message || "Something went wrong");
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
      v999: safeNum(r.purity999),
      v916: safeNum(r.purity916),
    }));
  }, [ibja]);

  const ibjaStats = useMemo(() => {
    const key = ibjaMode === "24KT" ? "v999" : "v916";
    const values = ibjaChartData
      .map((d: any) => d[key])
      .filter((x: any) => typeof x === "number") as number[];
    const last = ibjaChartData[ibjaChartData.length - 1] as any;
    const current = last ? last[key] : null;
    if (!values.length) return { current: null, min: null, max: null };
    return { current, min: Math.min(...values), max: Math.max(...values) };
  }, [ibjaChartData, ibjaMode]);

  const shopsChartData = useMemo(() => {
    const key = shopsMode === "24KT" ? "rate24kt" : "rate22kt";
    const rows = (shops || [])
      .map((s) => ({
        name: s.companyName,
        v: safeNum((s as any)[key]),
      }))
      .filter((x) => typeof x.v === "number") as { name: string; v: number }[];

    rows.sort((a, b) => b.v - a.v);

    return rows.map((r) => ({
      name: r.name,
      rate24: r.v,
      rate22: r.v,
    }));
  }, [shops, shopsMode]);

  const retry = () => window.location.reload();

  return (
    <div className="grdRoot">
      <div className="page">
        <div className="panel">
          <div className="topSpace" />

          <div
            className="header"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "14px",
              marginBottom: "28px",
            }}
          >
            {/* TITLE */}
            <h1
              style={{
                margin: 0,
               fontSize: "clamp(22px, 3.4vw, 44px)",
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: "0.2px",
                color: "#ffffff",
              }}
            >
              Smart{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Gold Rate Analytics
              </span>
            </h1>

            {/* SUBTITLE */}
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                maxWidth: "600px",
              }}
            >
              Clean comparison of Shop rates vs IBJA trend intelligence.
            </p>

          </div>

          <div className="controls">
            <div className="controlGroup">
              <div className="controlLabel">IBJA</div>
              <GoldToggle
                left="24KT"
                right="22KT"
                value={ibjaMode}
                onChange={(v) => setIbjaMode(v as any)}
              />
            </div>

            <div className="controlGroup">
              <div className="controlLabel">Shops</div>
              <GoldToggle
                left="24KT"
                right="22KT"
                value={shopsMode}
                onChange={(v) => setShopsMode(v as any)}
              />
            </div>
          </div>

          {loading && (
            <div className="state">
              <div className="spinner" />
              <div className="meta">Fetching latest rates…</div>
            </div>
          )}

          {!loading && err && (
            <div className="state">
              <div className="error">⚠ {err}</div>
              <div className="meta">
                If token is missing, set <b>sessionStorage.accessToken</b> or
                add <b>VITE_OXY_ACCESS_TOKEN</b> in your Vite env.
              </div>
              <button className="retry" onClick={retry} type="button">
                Retry
              </button>
            </div>
          )}

          {!loading && !err && (
            <div className="grid">
              <div className="card">
                <div className="cardHead">
                  <div>
                    <div className="st">IBJA Trend</div>
                    <div className="big">
                      {ibjaStats.current !== null
                        ? `₹${formatINR(ibjaStats.current)}`
                        : "--"}
                    </div>
                    <div className="meta">
                      Min:{" "}
                      {ibjaStats.min !== null
                        ? `₹${formatINR(ibjaStats.min)}`
                        : "--"}{" "}
                      • Max:{" "}
                      {ibjaStats.max !== null
                        ? `₹${formatINR(ibjaStats.max)}`
                        : "--"}
                    </div>
                  </div>
                  <div className="chip">
                    {ibjaMode === "24KT" ? "24KT (999)" : "22KT (916)"}
                  </div>
                </div>

                <div className="chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ibjaChartData}>
                      <defs>
                        <linearGradient
                          id="gPurple"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="rgba(91,46,255,0.55)" />
                          <stop
                            offset="100%"
                            stopColor="rgba(91,46,255,0.06)"
                          />
                        </linearGradient>
                        <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(212,175,55,0.50)" />
                          <stop
                            offset="100%"
                            stopColor="rgba(212,175,55,0.06)"
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="rgba(255,255,255,0.08)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{
                          fill: "rgba(255,255,255,0.55)",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={10}
                        angle={-20}
                        textAnchor="end"
                        height={40}
                      />
                      <YAxis
                        tick={{
                          fill: "rgba(255,255,255,0.55)",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                      />
                      <Tooltip
                        content={({ active, label, payload }: any) => {
                          if (!active || !payload?.length) return null;
                          const rows = payload
                            .filter((p: any) => typeof p.value === "number")
                            .map((p: any) => ({
                              name: p.name,
                              value: p.value,
                              stroke: p.stroke || p.color || "#fff",
                            }));
                          return <Tip label={label} rows={rows} />;
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "rgba(255,255,255,0.75)",
                          fontWeight: 700,
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey={ibjaMode === "24KT" ? "v999" : "v916"}
                        name={ibjaMode === "24KT" ? "IBJA 999" : "IBJA 916"}
                        stroke={ibjaMode === "24KT" ? "#D4AF37" : "#5B2EFF"}
                        fill={
                          ibjaMode === "24KT" ? "url(#gGold)" : "url(#gPurple)"
                        }
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="cardHead">
                  <div>
                    <div className="st">Shop Comparison</div>
                    <div className="meta">
                      Highest to lowest across selected shops.
                    </div>
                  </div>
                  <div className="chip">{shopsMode}</div>
                </div>

                <div className="chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shopsChartData}>
                      <defs>
                        <linearGradient
                          id="barGold"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="rgba(212,175,55,0.95)" />
                          <stop
                            offset="100%"
                            stopColor="rgba(212,175,55,0.20)"
                          />
                        </linearGradient>
                        <linearGradient
                          id="barPurple"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="rgba(91,46,255,0.95)" />
                          <stop
                            offset="100%"
                            stopColor="rgba(91,46,255,0.22)"
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="rgba(255,255,255,0.08)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "rgba(255,255,255,0.55)",
                          fontSize: 9,
                        }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={65}
                      />
                      <YAxis
                        tick={{
                          fill: "rgba(255,255,255,0.55)",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                      />
                      <Tooltip
                        content={({ active, label, payload }: any) => {
                          if (!active || !payload?.length) return null;
                          const rows = payload
                            .filter((p: any) => typeof p.value === "number")
                            .map((p: any) => ({
                              name: p.name,
                              value: p.value,
                              stroke: p.fill || p.color || "#fff",
                            }));
                          return <Tip label={label} rows={rows} />;
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: "rgba(255,255,255,0.75)",
                          fontWeight: 700,
                        }}
                      />

                      <Bar
                        dataKey="rate24"
                        name={shopsMode === "24KT" ? "24KT" : "Selected"}
                        fill="url(#barGold)"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={34}
                      />
                      <Bar
                        dataKey="rate22"
                        name="22KT"
                        fill="url(#barPurple)"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={34}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="bottomSpace" />
        </div>

        <style>{styles}</style>
      </div>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.grdRoot .page{ padding: 0px; }

.grdRoot .panel{
  font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.10);
  background:
    radial-gradient(900px 420px at 20% 0%, rgba(91,46,255,0.22), transparent 55%),
    radial-gradient(700px 360px at 90% 20%, rgba(212,175,55,0.16), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  padding: 12px;
  overflow: hidden;
}

.grdRoot .topSpace{ height: 0; }
.grdRoot .bottomSpace{ height: 0; }

.grdRoot .header{
  display:flex; align-items:flex-start; justify-content:space-between;
  gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
}

.grdRoot .title{
  margin: 0; font-size: 16px; font-weight: 900; letter-spacing: 0.2px;
  color: rgba(255,255,255,0.94);
}

.grdRoot .subtitle{
  margin: 3px 0 0 0; font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.62);
}

.grdRoot .rightPill{
  display:flex; align-items:center; gap: 6px;
  border: 1px solid rgba(255,255,255,0.10);
  padding: 6px 10px; border-radius: 999px;
  background: rgba(0,0,0,0.12);
  color: rgba(255,255,255,0.82);
  font-weight: 800; font-size: 10px; white-space: nowrap;
}

.grdRoot .pillDot{
  width: 8px; height: 8px; border-radius: 999px;
  background: rgba(212,175,55,0.95);
  box-shadow: 0 0 0 3px rgba(83, 82, 78, 0.14);
}

.grdRoot .controls{
  display:flex; align-items:center; justify-content:space-between;
  gap: 8px; padding: 8px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 10px; flex-wrap: wrap;
}

.grdRoot .controlGroup{ display:flex; align-items:center; gap: 8px; }
.grdRoot .controlLabel{
  font-size: 10px; font-weight: 900; letter-spacing: 0.5px;
  color: rgba(255,255,255,0.70);
}

.grdRoot .goldSeg{
  display:flex;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 999px;
  overflow:hidden;
  background: rgba(0,0,0,0.18);
}

.grdRoot .goldSeg button{
  appearance:none; border:0; background: transparent;
  color: rgba(255,255,255,0.74);
  font-weight: 900; font-size: 10px;
  padding: 7px 10px; cursor:pointer;
  transition: all .15s ease;
}

.grdRoot .goldSeg button.on{
  background: linear-gradient(180deg, rgba(212,175,55,0.95), rgba(212,175,55,0.72));
  color: rgba(43,10,89,0.98);
}

.grdRoot .state{
  display:flex; align-items:center; justify-content:center;
  flex-direction: column; gap: 8px; padding: 16px 0;
}

.grdRoot .spinner{
  width: 34px; height: 34px; border-radius: 999px;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: rgba(212,175,55,0.95);
  animation: grdSpin 1s linear infinite;
}

@keyframes grdSpin{ to{ transform: rotate(360deg); } }

.grdRoot .error{ color: rgba(255,255,255,0.90); font-weight: 900; }
.grdRoot .retry{
  border: 0; cursor: pointer; border-radius: 12px;
  padding: 10px 14px; font-weight: 900;
  background: linear-gradient(180deg, rgba(91,46,255,0.95), rgba(61,11,122,0.85));
  color: rgba(255,255,255,0.92);
  box-shadow: 0 14px 34px rgba(0,0,0,0.28);
}

.grdRoot .grid{ display:grid; grid-template-columns: 1fr; gap: 10px; }

.grdRoot .card{
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.10);
  background:
    radial-gradient(700px 360px at 20% 10%, rgba(91,46,255,0.20), transparent 55%),
    radial-gradient(650px 300px at 90% 10%, rgba(212,175,55,0.12), transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,0.18), rgba(255,255,255,0.03));
  padding: 10px;
  overflow:hidden;
}

.grdRoot .cardHead{
  display:flex; align-items:flex-start; justify-content:space-between;
  gap: 8px; margin-bottom: 8px; flex-wrap: wrap;
}

.grdRoot .st{
  font-size: 10px; font-weight: 900;
  color: rgba(255,255,255,0.70);
  letter-spacing: 0.4px;
}

.grdRoot .big{
  font-size: 16px; font-weight: 900;
  color: rgba(255,255,255,0.94);
  margin-top: 4px;
}

.grdRoot .meta{
  margin-top: 4px; font-size: 10px; font-weight: 800;
  color: rgba(255,255,255,0.60);
}

.grdRoot .chip{
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(0,0,0,0.16);
  padding: 6px 8px; border-radius: 999px;
  color: rgba(255,255,255,0.82);
  font-weight: 900; font-size: 10px;
  white-space: nowrap;
}

.grdRoot .chart{ height: 220px; }

.grdRoot .tip{
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(10,8,22,0.92);
  backdrop-filter: blur(10px);
  padding: 10px 10px;
  min-width: 210px;
  color: #fff;
  box-shadow: 0 18px 50px rgba(0,0,0,0.35);
}

.grdRoot .tipTitle{
  font-weight: 900; font-size: 12px;
  margin-bottom: 8px; color: rgba(255,255,255,0.92);
}

.grdRoot .tipRows{ display:flex; flex-direction: column; gap: 6px; }
.grdRoot .tipRow{ display:flex; align-items:center; gap: 8px; }
.grdRoot .tipRow .dot{ width: 10px; height: 10px; border-radius: 999px; }
.grdRoot .tipRow .k{ flex: 1; font-weight: 800; font-size: 12px; color: rgba(255,255,255,0.70); }
.grdRoot .tipRow .v{ font-weight: 900; font-size: 12px; color: rgba(255,255,255,0.92); }

.grdRoot .tipFoot{
  margin-top: 8px; padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.10);
  font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.60);
}

@media (min-width: 640px){
  .grdRoot .panel{ padding: 14px; border-radius: 18px; }
  .grdRoot .title{ font-size: 18px; }
  .grdRoot .subtitle{ font-size: 12px; }
  .grdRoot .big{ font-size: 18px; }
  .grdRoot .chart{ height: 250px; }
  .grdRoot .rightPill{ font-size: 11px; padding: 7px 11px; }
  .grdRoot .controlLabel{ font-size: 11px; }
  .grdRoot .goldSeg button{ font-size: 11px; padding: 8px 11px; }
}

@media (min-width: 1024px){
  .grdRoot .panel{ padding: 16px; border-radius: 20px; }
  .grdRoot .title{ font-size: 20px; }
  .grdRoot .subtitle{ font-size: 13px; }
  .grdRoot .big{ font-size: 20px; }
  .grdRoot .grid{ grid-template-columns: 1.1fr 1fr; }
  .grdRoot .chart{ height: 280px; }
  .grdRoot .rightPill{ font-size: 12px; padding: 8px 12px; }
  .grdRoot .controlLabel{ font-size: 12px; }
  .grdRoot .goldSeg button{ font-size: 12px; padding: 9px 12px; }
}
`;
