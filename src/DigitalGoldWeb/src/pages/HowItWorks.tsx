import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { requireAuth } from '../utils/auth';

const HowItWorks = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActiveStep(p => (p + 1) % 5), 3000);
    return () => clearInterval(t);
  }, [paused]);

  const handleBuyGoldClick = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    navigate('/buy-gold');
  };

  const handleStepClick = (i: number) => {
    setActiveStep(i);
    setPaused(true);
  };

  const steps = [
    {
      number: '01',
      title: 'Check the live gold price',
      desc: 'The app shows you the real-time 24K gold rate, updated every minute — so you always know exactly what you\'re paying.',
      detail: 'Live price, updated every minute',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Enter how much you want to buy',
      desc: 'Type an amount in ₹ or in grams — whichever is easier for you. You can start with as little as ₹100.',
      detail: 'Minimum ₹100',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Pay securely',
      desc: 'Complete your payment using UPI, Debit/Credit Card, or Net Banking. All transactions are encrypted with bank-grade security.',
      detail: 'UPI · Card · Net Banking',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Gold is stored in your vault',
      desc: 'As soon as payment is confirmed, 999.9 pure gold equal to your purchase is allocated to your personal vault — certified and fully insured.',
      detail: '999.9 purity · 100% insured',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      number: '05',
      title: 'Sell whenever you want',
      desc: 'Need cash? Tap Sell, enter the amount, and money is credited to your bank account within the same business day.',
      detail: 'Same-day bank transfer',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
  ];

  const faqs = [
    { q: 'Is my gold really safe and insured?', a: 'Yes — your gold is stored in certified, insured vaults with 24/7 security and full insurance coverage.' }, 
    { q: 'How quickly can I get cash when I sell?', a: 'Money is credited to your bank account within the same business day, usually within a few hours.' },
    { q: 'Are there any hidden charges or fees?', a: 'No hidden fees. You pay the live gold price + 3% GST as per government regulations. That\'s it.' },
    { q: 'What is the minimum amount I can invest?', a: 'You can start with as little as ₹100 or 0.001 grams of gold.' },
    { q: 'How is the gold price determined?', a: 'Prices are sourced from live commodity market feeds and updated every minute for accuracy.' },
    { q: 'Can I get physical gold delivered?', a: 'Yes, you can convert your digital gold to physical gold coins or bars and get them delivered.' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy1:  #0d1f3c;
          --navy2:  #112347;
          --navy3:  #1a3060;
          --gold1:  #f0bb3a;
          --gold2:  #d9a020;
          --bg-page: #f0f4ff;
          --bg-card: #ffffff;
          --bg-alt:  #e8edf8;
          --tx1:    #0d1f3c;
          --tx2:    #2a4060;
          --tx3:    #6b82a8;
          --bd:     rgba(42,78,158,0.13);
          --blu-lt: rgba(42,78,158,0.07);
          --blu-bd: rgba(42,78,158,0.18);
        }

        html { scroll-behavior: smooth; }
        .hiw { font-family: 'Sora', sans-serif; background: var(--bg-page); color: var(--tx1); overflow-x: hidden; }

        /* ── HERO ── */
        .hero {
          background: linear-gradient(135deg, var(--navy1) 0%, var(--navy3) 100%);
          padding: 64px 48px 56px; text-align: center;
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .hero-glow {
          position: absolute; width: 480px; height: 480px; border-radius: 50%;
          background: radial-gradient(circle, rgba(42,78,158,0.3) 0%, transparent 65%);
          left: 50%; top: 50%; transform: translate(-50%,-50%); pointer-events: none;
        }
        .hero-inner { position: relative; z-index: 2; max-width: 560px; margin: 0 auto; }
        .hero-eyebrow {
          font-size: 0.62rem; font-weight: 600; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--gold1); margin-bottom: 14px;
          animation: up 0.6s ease both;
        }
        .hero-h1 {
          font-size: clamp(2rem,4vw,3rem); font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 12px;
          animation: up 0.6s ease 0.08s both;
        }
        .hero-h1 em {
          font-style: normal;
          background: linear-gradient(118deg,#fcd34d 0%,#f0bb3a 50%,#e8920a 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          font-size: 0.85rem; color: rgba(255,255,255,0.52);
          line-height: 1.7; margin-bottom: 32px; animation: up 0.6s ease 0.14s both;
        }
        .hero-pills {
          display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;
          animation: up 0.6s ease 0.2s both;
        }
        .hero-pill {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 9px 16px;
          display: flex; flex-direction: column; align-items: center;
        }
        .hero-pill-val { font-size: 1rem; font-weight: 800; color: var(--gold1); line-height: 1; }
        .hero-pill-lbl { font-size: 0.54rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-top: 3px; }

        @keyframes up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        /* ── SHARED ── */
        .sec { padding: 56px 48px; }
        .sec.alt   { background: var(--bg-alt); }
        .sec.white { background: var(--bg-card); }
        .sec.page  { background: var(--bg-page); }
        .wrap { max-width: 800px; margin: 0 auto; }
        .sec-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.58rem; font-weight: 700; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--gold2); margin-bottom: 6px;
        }
        .sec-tag-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold2); }
        .sec-h2 {
          font-size: clamp(1.3rem,2.2vw,1.75rem); font-weight: 700; color: var(--tx1);
          line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 6px;
        }
        .sec-h2 span { color: #2a4e9e; }
        .sec-p { font-size: 0.82rem; color: var(--tx2); line-height: 1.65; }
        .sec-hd { margin-bottom: 32px; }
        .sec-hd.center { text-align: center; }
        .sec-hd.center .sec-tag { justify-content: center; }

        /* ── STEPPER ── */
        .stepper-wrap { max-width: 680px; margin: 0 auto; }
        .stepper-tabs { display: flex; align-items: center; margin-bottom: 0; }
        .stepper-tab {
          flex: 1; position: relative; cursor: pointer;
          display: flex; flex-direction: column; align-items: center;
          background: none; border: none; font-family: 'Sora', sans-serif;
          padding: 0 0 16px; gap: 6px;
        }
        .stepper-tab:not(:last-child)::after {
          content: ''; position: absolute; top: 17px;
          left: calc(50% + 18px); right: calc(-50% + 18px);
          height: 2px; background: var(--bd); transition: background 0.4s;
        }
        .stepper-tab.done:not(:last-child)::after { background: #2a4e9e; }

        .stepper-circle {
          width: 34px; height: 34px; border-radius: 50%;
          border: 2px solid var(--bd); background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.62rem; font-weight: 800; color: var(--tx3);
          transition: all 0.3s; z-index: 1; flex-shrink: 0;
        }
        .stepper-tab.active .stepper-circle {
          border-color: #2a4e9e; background: #2a4e9e; color: #fff;
          box-shadow: 0 0 0 4px rgba(42,78,158,0.14);
        }
        .stepper-tab.done .stepper-circle { border-color: #2a4e9e; background: #2a4e9e; color: #fff; }

        .stepper-tab-label {
          font-size: 0.6rem; font-weight: 600; color: var(--tx3);
          transition: color 0.3s; text-align: center; line-height: 1.3; white-space: nowrap;
        }
        .stepper-tab.active .stepper-tab-label { color: #2a4e9e; }
        .stepper-tab.done .stepper-tab-label { color: var(--tx2); }

        .stepper-card {
          background: var(--bg-card); border: 1px solid var(--bd);
          border-radius: 14px; overflow: hidden;
        }
        .stepper-progress-track { height: 3px; background: var(--bg-alt); }
        .stepper-progress-fill {
          height: 3px;
          background: linear-gradient(90deg, #2a4e9e, var(--gold1));
          transition: width 0.35s ease;
        }
        .stepper-content {
          padding: 26px 28px; display: flex; align-items: flex-start; gap: 18px;
          animation: stepIn 0.3s ease both;
        }
        @keyframes stepIn { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }

        .stepper-icon-wrap {
          width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
          background: var(--blu-lt); border: 1px solid var(--blu-bd);
          display: flex; align-items: center; justify-content: center; color: #2a4e9e;
        }
        .stepper-text { flex: 1; }
        .stepper-step-label {
          font-size: 0.56rem; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--gold2); margin-bottom: 4px;
        }
        .stepper-title { font-size: 0.98rem; font-weight: 700; color: var(--tx1); margin-bottom: 6px; }
        .stepper-desc { font-size: 0.82rem; color: var(--tx2); line-height: 1.7; margin-bottom: 8px; }
        .stepper-detail {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.72rem; font-weight: 600; color: var(--gold2);
          background: rgba(240,187,58,0.08); border: 1px solid rgba(240,187,58,0.2);
          border-radius: 6px; padding: 4px 10px;
        }
        .stepper-detail::before {
          content: '✓'; font-size: 0.7rem; color: var(--gold2);
        }

        .stepper-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 20px; border-top: 1px solid var(--bd); background: var(--bg-alt);
        }
        .stepper-nav-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.7rem; font-weight: 600; color: var(--tx3);
          background: none; border: none; cursor: pointer; padding: 5px 9px;
          border-radius: 6px; transition: all 0.2s; font-family: 'Sora', sans-serif;
        }
        .stepper-nav-btn:hover:not(:disabled) { color: #2a4e9e; background: var(--blu-lt); }
        .stepper-nav-btn:disabled { opacity: 0.25; cursor: not-allowed; }
        .stepper-counter { font-size: 0.68rem; font-weight: 600; color: var(--tx3); }
        .stepper-counter span { color: #2a4e9e; }
        .stepper-pause-hint { font-size: 0.58rem; color: var(--tx3); text-align: center; margin-top: 10px; }
        .stepper-pause-hint span { color: #2a4e9e; cursor: pointer; text-decoration: underline; }

        /* ── BENEFITS ── */
        .benefits-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .benefit-card {
          background: var(--bg-card); border: 1px solid var(--bd);
          border-radius: 12px; padding: 18px 16px; transition: all 0.2s;
        }
        .benefit-card:hover { border-color: rgba(240,187,58,0.35); box-shadow: 0 4px 16px rgba(13,31,60,0.07); transform: translateY(-2px); }
        .benefit-stat { font-size: 1.5rem; font-weight: 800; color: #2a4e9e; line-height: 1; margin-bottom: 1px; }
        .benefit-stat-lbl { font-size: 0.54rem; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--tx3); display: block; margin-bottom: 8px; }
        .benefit-title { font-size: 0.8rem; font-weight: 700; color: var(--tx1); margin-bottom: 4px; }
        .benefit-p { font-size: 0.73rem; color: var(--tx2); line-height: 1.6; }

        /* ── FAQ ── */
        .faq-list { border: 1px solid var(--bd); border-radius: 12px; overflow: hidden; background: var(--bg-card); }
        .faq-row { border-bottom: 1px solid var(--bd); }
        .faq-row:last-child { border-bottom: none; }
        .faq-btn {
          width: 100%; background: none; border: none; padding: 15px 20px; cursor: pointer;
          display: flex; align-items: center; gap: 12px; text-align: left;
          font-family: 'Sora', sans-serif; transition: background 0.18s;
        }
        .faq-btn:hover { background: rgba(240,187,58,0.05); }
        .faq-idx {
          width: 24px; height: 24px; border-radius: 6px; background: var(--blu-lt);
          border: 1px solid var(--blu-bd); display: flex; align-items: center; justify-content: center;
          font-size: 0.56rem; font-weight: 700; color: #2a4e9e; flex-shrink: 0; transition: all 0.2s;
        }
        .faq-row.open .faq-idx { background: rgba(240,187,58,0.1); border-color: rgba(240,187,58,0.3); color: var(--gold2); }
        .faq-q { flex: 1; font-size: 0.84rem; font-weight: 600; color: var(--tx2); line-height: 1.4; transition: color 0.18s; }
        .faq-row.open .faq-q { color: var(--tx1); }
        .faq-arrow { color: var(--tx3); flex-shrink: 0; transition: transform 0.28s, color 0.2s; }
        .faq-row.open .faq-arrow { transform: rotate(180deg); color: var(--gold2); }
        .faq-ans-wrap { max-height: 0; overflow: hidden; transition: max-height 0.32s ease, opacity 0.24s ease; opacity: 0; }
        .faq-row.open .faq-ans-wrap { max-height: 140px; opacity: 1; }
        .faq-ans { padding: 0 20px 14px 56px; font-size: 0.79rem; color: var(--tx2); line-height: 1.72; }

        /* ── CTA ── */
        .cta-sec {
          background: linear-gradient(135deg, var(--navy1) 0%, var(--navy3) 100%);
          padding: 72px 48px; text-align: center; position: relative; overflow: hidden;
        }
        .cta-sec::before {
          content: ''; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .cta-glow {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(42,78,158,0.25) 0%, transparent 65%);
          left: 50%; top: 50%; transform: translate(-50%,-50%); pointer-events: none;
        }
        .cta-inner { position: relative; z-index: 2; max-width: 440px; margin: 0 auto; }
        .cta-eyebrow { font-size: 0.58rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold1); margin-bottom: 12px; }
        .cta-h2 { font-size: clamp(1.6rem,2.6vw,2.2rem); font-weight: 800; color: #fff; line-height: 1.12; letter-spacing: -0.03em; margin-bottom: 10px; }
        .cta-h2 span { color: var(--gold1); }
        .cta-p { font-size: 0.82rem; color: rgba(255,255,255,0.5); line-height: 1.72; margin-bottom: 28px; }
        .cta-btns { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
          background: linear-gradient(135deg, var(--gold1) 0%, var(--gold2) 100%);
          color: var(--navy1); font-family: 'Sora',sans-serif; font-size: 0.83rem; font-weight: 700;
          border: none; border-radius: 8px; cursor: pointer; transition: all 0.22s;
          box-shadow: 0 4px 18px rgba(217,160,32,0.3);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(217,160,32,0.46); }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px;
          background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.55);
          font-family: 'Sora',sans-serif; font-size: 0.83rem; font-weight: 500;
          border: 1px solid rgba(255,255,255,0.14); border-radius: 8px;
          cursor: pointer; transition: all 0.22s;
        }
        .btn-ghost:hover { border-color: rgba(240,187,58,0.4); color: var(--gold1); }

        /* ── RESPONSIVE ── */
        @media (max-width: 720px) {
          .hero, .sec, .cta-sec { padding: 48px 20px; }
          .benefits-grid { grid-template-columns: 1fr 1fr; }
          .stepper-tab-label { display: none; }
          .stepper-content { padding: 20px 18px; }
        }
        @media (max-width: 480px) {
          .benefits-grid { grid-template-columns: 1fr; }
          .cta-btns { flex-direction: column; }
          .btn-primary, .btn-ghost { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="hiw">

        {/* HERO */}
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-inner">
            <p className="hero-eyebrow">Simple · Secure · Transparent</p>
            <h1 className="hero-h1">How to Buy<br /><em>Digital Gold</em></h1>
            <p className="hero-sub">Buy real 24K gold in 5 simple steps. Stored safely, sell anytime.</p>
            <div className="hero-pills">
              {[
                { val: '5 Steps', lbl: 'Process' },
                { val: '₹100',   lbl: 'Start from' },
                { val: '999.9',  lbl: 'Purity' },
                { val: '24/7',   lbl: 'Access' },
                { val: '100%',   lbl: 'Insured' },
              ].map((p, i) => (
                <div className="hero-pill" key={i}>
                  <span className="hero-pill-val">{p.val}</span>
                  <span className="hero-pill-lbl">{p.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section className="sec alt">
          <div className="wrap">
            <div className="sec-hd center">
              <div className="sec-tag"><span className="sec-tag-dot" /> The Process</div>
              <h2 className="sec-h2">How it works in <span>5 simple steps</span></h2>
              <p className="sec-p">Click any step below to learn more about the process.</p>
            </div>

            <div className="stepper-wrap">
              <div className="stepper-tabs">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    className={`stepper-tab${activeStep === i ? ' active' : ''}${i < activeStep ? ' done' : ''}`}
                    onClick={() => handleStepClick(i)}
                  >
                    <div className="stepper-circle">
                      {i < activeStep
                        ? <svg width="11" height="9" viewBox="0 0 14 10" fill="none"><path d="M1 5.5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : step.number
                      }
                    </div>
                    <span className="stepper-tab-label">{step.title}</span>
                  </button>
                ))}
              </div>

              <div className="stepper-card">
                <div className="stepper-progress-track">
                  <div className="stepper-progress-fill" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} />
                </div>
                <div className="stepper-content" key={activeStep}>
                  <div className="stepper-icon-wrap">{steps[activeStep].icon}</div>
                  <div className="stepper-text">
                    <div className="stepper-step-label">Step {steps[activeStep].number}</div>
                    <div className="stepper-title">{steps[activeStep].title}</div>
                    <p className="stepper-desc">{steps[activeStep].desc}</p>
                    <div className="stepper-detail">{steps[activeStep].detail}</div>
                  </div>
                </div>
                <div className="stepper-nav">
                  <button className="stepper-nav-btn" disabled={activeStep === 0}
                    onClick={() => { setActiveStep(p => p - 1); setPaused(true); }}>
                    <svg width="12" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M13 5H1M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Prev
                  </button>
                  <span className="stepper-counter"><span>{activeStep + 1}</span> / {steps.length}</span>
                  <button className="stepper-nav-btn" disabled={activeStep === steps.length - 1}
                    onClick={() => { setActiveStep(p => p + 1); setPaused(true); }}>
                    Next
                    <svg width="12" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {paused && (
                <p className="stepper-pause-hint">
                  Auto-play paused. <span onClick={() => setPaused(false)}>Resume</span>
                </p>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button className="btn-primary" onClick={handleBuyGoldClick}
                style={{ background: 'linear-gradient(135deg,#f0bb3a,#d9a020)', color: '#0d1f3c' }}>
                Start buying gold
                <svg width="13" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="sec white">
          <div className="wrap">
            <div className="sec-hd center">
              <div className="sec-tag"><span className="sec-tag-dot" /> Why Digital Gold</div>
              <h2 className="sec-h2">What you <span>get with us</span></h2>
            </div>
            <div className="benefits-grid">
              {[
                { stat: '0%',    lbl: 'Hidden fees',   title: 'No Making Charges',    p: 'Zero wastage, zero hidden fees.' },
                { stat: '₹100', lbl: 'Minimum buy',   title: 'Start from ₹100',      p: 'Invest at your own pace.' },
                { stat: '24/7', lbl: 'Market access',  title: '24/7 Trading',         p: 'Buy or sell any time of day.' },
                { stat: '24K',  lbl: 'Purity',         title: '999.9 Certified Gold', p: 'BIS-certified, independently verified.' },
                { stat: '100%', lbl: 'Insured',        title: 'Fully Insured',        p: 'Protected against all unforeseen events.' },
                { stat: '1 Day',lbl: 'Cash out',       title: 'Instant Liquidity',    p: 'Cash in your bank by next business day.' },
              ].map((b, i) => (
                <div className="benefit-card" key={i}>
                  <div className="benefit-stat">{b.stat}</div>
                  <span className="benefit-stat-lbl">{b.lbl}</span>
                  <div className="benefit-title">{b.title}</div>
                  <p className="benefit-p">{b.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="sec page">
          <div className="wrap">
            <div className="sec-hd center">
              <div className="sec-tag"><span className="sec-tag-dot" /> FAQ</div>
              <h2 className="sec-h2">Common <span>Questions</span></h2>
            </div>
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className={`faq-row${openFaq === i ? ' open' : ''}`}>
                  <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div className="faq-idx">{String(i + 1).padStart(2, '0')}</div>
                    <span className="faq-q">{faq.q}</span>
                    <svg className="faq-arrow" width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="faq-ans-wrap">
                    <p className="faq-ans">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-sec">
          <div className="cta-glow" />
          <div className="cta-inner">
            <p className="cta-eyebrow">Start Today</p>
            <h2 className="cta-h2">Ready for your<br /><span>Gold Journey?</span></h2>
            <p className="cta-p">Start from ₹100. No lock-in, no hidden fees.</p>
            <div className="cta-btns">
              <button className="btn-primary" onClick={handleBuyGoldClick}>
                Buy Digital Gold
                <svg width="13" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="btn-ghost" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default HowItWorks;