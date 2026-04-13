import React, { useEffect, useMemo, useState } from "react";

type ShopRate = {
  companyName: string;
  rate22kt: number | string | null;
  rate24kt: number | string | null;
};

type Props = {
  fixed?: boolean;
  top?: number;
  height?: number;
  speedSeconds?: number;
  maxShops?: number;
};

import { API_BASE_URL } from "../../Config";

const API_SHOPS =
  `${API_BASE_URL}/product-service/all-different-gold-rates`;
const API_IBJA =
  `${API_BASE_URL}/oxybrick-service/getIbjGoldRates`;

// ✅ SAME fallback style like GoldRatesDashboard.tsx
const HARDCODE_FALLBACK_TOKEN =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4N2ZmMWE2My1jY2MyLTQ4MjQtOGQwMy1mMWEyYmVmODMzYjQiLCJpYXQiOjE3NzA4ODIyNjIsImV4cCI6MTc3MTc0NjI2Mn0.G-tBfedu0p0tsi9XVk6FQLT9xDqmpp4_Zkz0eT-lbad6_1OAXfUrrIMQ3d4vdEtkAbFjSr6GVlPOxvolAuoF0w";

const safeNum = (v: any) => {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

// ✅ No commas in number format: ₹17142
const formatINRNoComma = (v: number | null) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return "--";
  return String(Math.round(v));
};

// ✅ IBJA response can be array OR wrapped OR nested
const extractIbjaLatest = (raw: any) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.length ? raw[raw.length - 1] : null;
  if (Array.isArray(raw.data)) return raw.data.length ? raw.data[raw.data.length - 1] : null;
  if (Array.isArray(raw.result)) return raw.result.length ? raw.result[raw.result.length - 1] : null;
  if (typeof raw === "object") return raw;
  return null;
};

const findIbjaRates = (raw: any): { r24: number | null; r22: number | null } => {
  const latest = extractIbjaLatest(raw);

  // Try common keys first
  const r24 =
    safeNum(latest?.purity999) ??
    safeNum(latest?.gold24k) ??
    safeNum(latest?.rate24kt) ??
    safeNum(latest?.rate_24) ??
    safeNum(latest?.goldRate24);

  const r22 =
    safeNum(latest?.purity916) ??
    safeNum(latest?.gold22k) ??
    safeNum(latest?.rate22kt) ??
    safeNum(latest?.rate_22) ??
    safeNum(latest?.goldRate22);

  // If still not found, do deep scan
  if (r24 !== null || r22 !== null) return { r24, r22 };

  const c24: number[] = [];
  const c22: number[] = [];

  const walk = (obj: any) => {
    if (!obj) return;
    if (Array.isArray(obj)) return obj.forEach(walk);
    if (typeof obj !== "object") return;

    for (const [k, v] of Object.entries(obj)) {
      const key = String(k).toLowerCase();
      const num = safeNum(v);

      if (num !== null) {
        if (
          key.includes("purity999") ||
          key.includes("999") ||
          key.includes("24k") ||
          key.includes("24kt") ||
          key.includes("rate24") ||
          key.includes("gold24")
        )
          c24.push(num);

        if (
          key.includes("purity916") ||
          key.includes("916") ||
          key.includes("22k") ||
          key.includes("22kt") ||
          key.includes("rate22") ||
          key.includes("gold22")
        )
          c22.push(num);
      }

      if (typeof v === "object") walk(v);
    }
  };

  walk(raw);
  return {
    r24: c24.length ? Math.max(...c24) : null,
    r22: c22.length ? Math.max(...c22) : null,
  };
};

const getToken = () => {
  // 1) sessionStorage
  const s = sessionStorage.getItem("accessToken");
  if (s && s.trim()) return s.trim();

  // 2) localStorage (some pages use this)
  const l = localStorage.getItem("accessToken");
  if (l && l.trim()) return l.trim();

  // 3) env
  const envTok = (import.meta as any)?.env?.VITE_OXY_ACCESS_TOKEN;
  if (typeof envTok === "string" && envTok.trim()) return envTok.trim();

  // 4) fallback
  if (HARDCODE_FALLBACK_TOKEN && HARDCODE_FALLBACK_TOKEN.trim())
    return HARDCODE_FALLBACK_TOKEN.trim();

  return "";
};

const fetchJson = async (url: string, headers: Record<string, string>) => {
  const res = await fetch(url, { headers });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
};

export default function GoldRatesTickerStrip({
  fixed = true,
  top = 72,
  height = 34,
  speedSeconds = 26,
  maxShops = 6,
}: Props) {
  const [items, setItems] = useState<string[]>(["Loading live gold rates…"]);

  const headersAuth = useMemo(() => {
    const token = getToken();
    const h: Record<string, string> = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  const headersNoAuth = useMemo(() => {
    return { Accept: "application/json" };
  }, []);

  useEffect(() => {
    let alive = true;

    const buildTicker = (shops: ShopRate[], ibjaRaw: any) => {
      const list: string[] = [];

      const { r24, r22 } = findIbjaRates(ibjaRaw);

      // ✅ IBJA should never disappear now
      list.push(`IBJA 24K (999): ₹${formatINRNoComma(r24)}`);
      list.push(`IBJA 22K (916): ₹${formatINRNoComma(r22)}`);

      const topShops = (Array.isArray(shops) ? shops : [])
        .filter((s) => s?.companyName)
        .slice(0, maxShops);

      topShops.forEach((s) => {
        const v24 = safeNum(s.rate24kt);
        const v22 = safeNum(s.rate22kt);

        // ✅ no commas + remove comma between values
        list.push(
          `${s.companyName} 24K: ₹${formatINRNoComma(v24)} • 22K: ₹${formatINRNoComma(v22)}`
        );
      });

      return list.length ? list : ["Live rates unavailable right now"];
    };

    const load = async () => {
      try {
        // Shops: use auth headers
        const shops = await fetchJson(API_SHOPS, headersAuth);
        const shopsArr = Array.isArray(shops.json) ? shops.json : [];

        // IBJA: try with auth, if fails -> retry without auth
        let ibja = await fetchJson(API_IBJA, headersAuth);
        if (!ibja.ok) {
          ibja = await fetchJson(API_IBJA, headersNoAuth);
        }

        if (!alive) return;
        setItems(buildTicker(shopsArr, ibja.json));
      } catch {
        if (!alive) return;
        setItems(["Live rates unavailable right now"]);
      }
    };

    load();
    const t = window.setInterval(load, 60 * 1000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [headersAuth, headersNoAuth, maxShops]);

  const loopItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      style={{
        position: fixed ? "fixed" : "relative",
        top: fixed ? top : undefined,
        left: 0,
        right: 0,
        zIndex: 55,
        height,
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(90deg, rgba(212,175,55,0.95) 0%, rgba(245,211,108,0.95) 45%, rgba(212,175,55,0.95) 100%)",
        borderTop: "1px solid rgba(255,255,255,0.10)",
        borderBottom: "1px solid rgba(0,0,0,0.20)",
        color: "#2B0A59",
        overflow: "hidden",
        width: "100%",
        fontFamily: "inherit",
      }}
      aria-label="Live gold rates ticker"
    >
      <div style={{ width: "100%", overflow: "hidden" }}>
        <div
          className="og-ticker-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            whiteSpace: "nowrap",
            willChange: "transform",
            padding: "0 18px",
            animation: `ogTickerScroll ${speedSeconds}s linear infinite`,
            fontSize: 13,
            fontWeight: 500, // ✅ font-medium
          }}
        >
          {loopItems.map((t, idx) => (
            <div
              key={idx}
              style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
            >
              <span style={{ lineHeight: 1.1 }}>{t}</span>
              <span style={{ opacity: 0.55, fontWeight: 600 }}>|</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ogTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .og-ticker-track { animation: none !important; }
        }
        @media (max-width: 560px) {
          .og-ticker-track { padding: 0 12px !important; font-size: 12px !important; }
        }
      `}</style>
    </div>
  );
}