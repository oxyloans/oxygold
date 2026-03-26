import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TRUST_BADGES = [
  { icon: '🔒', label: '100% Secure' },
  { icon: '✅', label: '24K Certified' },
  { icon: '⚡', label: 'Instant Access' },
];

const COMPARE_ROWS = [
  ['Purity',           '22K / 24K',    '24K guaranteed'],
  ['Storage',          'Self / locker', 'Secured vault'],
  ['Min. Buy',         '₹1,000+',       '₹10'],
  ['Liquidity',        'Moderate',      'Instant'],
  ['Making Charges',   'Yes',           'No'],
];

const CARDS = [
  {
    id: 'physical',
    route: '/physical-gold',
    emoji: '🪙',
    title: 'Physical Gold',
    subtitle: 'Own tangible gold in physical form',
    features: ['Physical possession', 'Storage required', 'Making charges applicable'],
    cta: 'Buy Physical Gold',
    tag: 'Coins & Bars',
    highlight: false,
  },
  {
    id: 'digital',
    route: '/buy-gold',
    emoji: '📱',
    title: 'Digital Gold',
    subtitle: 'Invest in 24K gold digitally with secure storage',
    features: ['24K purity guaranteed', 'No storage hassle', 'Instant buy & sell'],
    cta: 'Buy Digital Gold',
    tag: 'Most Popular',
    highlight: true,
  },
];

export default function GoldSelection() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center px-5 py-14 overflow-hidden">

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.08)_0%,transparent_70%)] blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,183,0,0.06)_0%,transparent_70%)] blur-3xl animate-pulse [animation-delay:1.5s]" />

      {/* Content */}
      <div
        className={`relative z-10 w-full max-w-4xl flex flex-col items-center gap-10 transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >

        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-yellow-400">
            OXYGOLD.AI
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-yellow-400 bg-clip-text text-transparent">
            Choose Your Gold Investment
          </h1>
          <p className="text-sm text-white/40 font-normal">
            Select how you want to invest in gold
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {TRUST_BADGES.map(b => (
              <span
                key={b.label}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-yellow-400/[0.07] border border-yellow-400/20 text-yellow-300/80 text-[11px] font-medium"
              >
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              onClick={() => navigate(card.route)}
              style={{ transitionDelay: `${i * 100}ms` }}
              className={`
                group relative flex flex-col gap-4 p-8 rounded-2xl cursor-pointer overflow-hidden
                border backdrop-blur-md
                transition-all duration-300 ease-out
                hover:-translate-y-2 hover:scale-[1.02]
                ${card.highlight
                  ? 'bg-yellow-400/[0.06] border-yellow-400/25 hover:border-yellow-400/55 hover:shadow-[0_0_50px_rgba(255,215,0,0.25)]'
                  : 'bg-white/[0.04] border-white/[0.08] hover:border-yellow-400/30 hover:shadow-[0_0_35px_rgba(255,215,0,0.15)]'
                }
              `}
            >
              {/* Popular ribbon */}
              {card.highlight && (
                <div className="absolute top-4 -right-7 rotate-[35deg] bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[10px] font-bold px-9 py-1 tracking-widest uppercase">
                  ⭐ Popular
                </div>
              )}

              {/* Icon */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <span className="text-4xl relative z-10 group-hover:animate-bounce">{card.emoji}</span>
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.15)_0%,transparent_70%)]" />
              </div>

              {/* Tag */}
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-yellow-400/70">
                {card.tag}
              </span>

              {/* Title & desc */}
              <h2 className="text-2xl font-bold text-white tracking-tight">{card.title}</h2>
              <p className="text-sm text-white/40 leading-relaxed">{card.subtitle}</p>

              {/* Features */}
              <ul className="flex flex-col gap-2 flex-1">
                {card.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-white/60">
                    <span className="text-yellow-400 text-[10px]">✦</span> {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={e => { e.stopPropagation(); navigate(card.route); }}
                className={`
                  w-full mt-2 py-3 rounded-xl text-sm font-bold tracking-wide
                  transition-all duration-200 active:scale-95
                  ${card.highlight
                    ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-black shadow-[0_4px_20px_rgba(255,215,0,0.35)] hover:shadow-[0_6px_28px_rgba(255,215,0,0.55)]'
                    : 'bg-transparent border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/70'
                  }
                `}
              >
                {card.cta} →
              </button>

              {/* Shimmer sweep */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(105deg,transparent_40%,rgba(255,215,0,0.06)_50%,transparent_60%)] bg-[length:200%_100%] group-hover:animate-[shimmer_1.4s_ease_infinite]" />
            </div>
          ))}
        </div>

        {/* ── Compare toggle ── */}
        <div className="w-full flex flex-col items-center gap-4">
          <button
            onClick={() => setCompare(v => !v)}
            className="px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-white/40 text-xs font-medium hover:text-yellow-400 hover:border-yellow-400/30 hover:bg-yellow-400/[0.05] transition-all duration-200"
          >
            {compare ? '▲ Hide Comparison' : '⇄ Compare Options'}
          </button>

          {compare && (
            <div className="w-full overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.03] animate-[fadeDown_0.3s_ease_both]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Feature', 'Physical Gold', 'Digital Gold'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/30">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map(([feat, phys, dig]) => (
                    <tr key={feat} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-5 py-3 text-[12px] text-white/35">{feat}</td>
                      <td className="px-5 py-3 text-[13px] text-white/55">{phys}</td>
                      <td className="px-5 py-3 text-[13px] font-semibold text-yellow-400">{dig}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
