// import { useNavigate } from 'react-router-dom';
//   import { useEffect, useState } from 'react';
//   import { requireAuth } from '../utils/auth';
//   import { useGoldPrice } from '../context/GoldPriceContext';

//   const Landing = () => {
//     const navigate = useNavigate();
//     const { buyPrice: livePrice } = useGoldPrice();
//     const goldRate = livePrice;
//     const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
//     const [showImageModal, setShowImageModal] = useState(false);
//     const [modalImage, setModalImage] = useState('');
//     const [user, setUser] = useState<any>(null);

//     useEffect(() => {
//       const userData = localStorage.getItem('user');
//       setUser(userData ? JSON.parse(userData) : null);
      
//       const obs = new IntersectionObserver(
//         (entries) => entries.forEach(e => {
//           if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.id]: true }));
//         }),
//         { threshold: 0.08 }
//       );
//       document.querySelectorAll('.obs').forEach(el => obs.observe(el));
//       return () => obs.disconnect();
//     }, []);

//     const handleBuyGoldClick = () => {
//       if (!user) {
//         requireAuth(navigate, '/buy-gold');
//         return;
//       }
//       navigate('/buy-gold');
//     };

//     const openImageModal = (imgSrc: string) => {
//       setModalImage(imgSrc);
//       setShowImageModal(true);
//     };

//     const rv = (id: string, delay = 0): React.CSSProperties => ({
//       opacity: visible[id] ? 1 : 0,
//       transform: visible[id] ? 'translateY(0)' : 'translateY(20px)',
//       transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
//     });

//     return (
//       <>
//         <style>{`
//           @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
//           *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//           :root {
//             --p1: #0d1f3c;
//             --p2: #112347;
//             --p3: #1a3060;
//             --p4: #2a4e9e;
//             --g1: #f0bb3a;
//             --g2: #d9a020;
//             --w: #ffffff;
//             --t2: rgba(255,255,255,0.80);
//             --t3: rgba(255,255,255,0.52);
//             --off: #f4f0ff;
//             --bp: rgba(42,78,158,0.22);
//             --bg: rgba(217,160,32,0.24);
//           }

//           html { scroll-behavior: smooth; }
//           body {
//             font-family: 'Sora', sans-serif;
//             background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
//             color: var(--w);
//             overflow-x: hidden;
//             line-height: 1.6;
//           }

//           /* ══════════════════════════════════
//             HERO
//           ══════════════════════════════════ */
//           .hero {
//             display: grid;
//             grid-template-columns: 1.2fr 0.8fr;
//             align-items: center;
//             min-height: 90vh;
//             padding: 80px 72px 80px 80px;
//             gap: 64px;
//             background: linear-gradient(135deg, #0d1f3c 0%, #112347 60%, #0f2954 100%);
//             position: relative;
//             overflow: hidden;
//           }
//           .hero::before {
//             content: '';
//             position: absolute;
//             width: 650px; height: 650px; border-radius: 50%;
//             background: radial-gradient(circle, rgba(42,78,158,0.28) 0%, transparent 68%);
//             left: -160px; top: 50%; transform: translateY(-50%);
//             pointer-events: none; z-index: 0;
//           }
//           .hero::after {
//             content: '';
//             position: absolute;
//             width: 360px; height: 360px; border-radius: 50%;
//             background: radial-gradient(circle, rgba(240,187,58,0.10) 0%, transparent 70%);
//             right: 60px; top: 15%;
//             pointer-events: none; z-index: 0;
//           }

//           /* LEFT */
//           .hero-left {
//             position: relative; z-index: 2;
//             display: flex; flex-direction: column; align-items: flex-start;
//           }

//           .h-tag {
//             display: inline-flex; align-items: center; gap: 8px;
//             font-size: 0.7rem; font-weight: 600; color: var(--g1);
//             letter-spacing: 0.1em; text-transform: uppercase;
//             margin-bottom: 20px;
//             animation: fu 0.5s ease 0.1s both;
//           }
//           .h-tdot {
//             width: 6px; height: 6px; border-radius: 50%;
//             background: var(--g1); flex-shrink: 0;
//             box-shadow: 0 0 8px rgba(240,187,58,0.65);
//             animation: lp 2s ease-in-out infinite;
//           }

//           .h-title {
//             font-size: clamp(2.4rem, 3.4vw, 3.7rem);
//             font-weight: 800; line-height: 1.09;
//             color: var(--w); margin-bottom: 18px;
//             letter-spacing: -0.025em;
//             animation: fu 0.5s ease 0.16s both;
//             transition: all 0.3s ease;
//           }
//           .h-title span {
//             background: linear-gradient(118deg, #f6cc50 0%, var(--g1) 45%, #e8920a 100%);
//             -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
//           }
//           .title-char {
//             display: inline-block;
//             animation: charReveal 0.5s ease forwards;
//           }
//           @keyframes charReveal {
//             0% { opacity: 0; transform: translateY(10px); }
//             100% { opacity: 1; transform: translateY(0); }
//           }

//           .h-desc {
//             font-size: 0.9rem; color: var(--t2);
//             margin-bottom: 28px; line-height: 1.78;
//             animation: fu 0.5s ease 0.22s both;
//           }

//           /* price ticker */
//           .ptick {
//             display: inline-flex; align-items: stretch;
//             border: 1px solid rgba(240,187,58,0.30); border-radius: 10px;
//             overflow: hidden; margin-bottom: 28px;
//             background: rgba(13,31,60,0.72); backdrop-filter: blur(18px);
//             animation: fu 0.5s ease 0.3s both;
//           }
//           .pt-c {
//             padding: 12px 20px; display: flex; flex-direction: column; gap: 4px;
//             border-right: 1px solid rgba(240,187,58,0.12);
//           }
//           .pt-c:last-child { border-right: none; }
//           .pt-l { font-size: 0.59rem; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: 0.07em; }
//           .pt-v { font-size: 1.18rem; font-weight: 700; color: var(--g1); line-height: 1.15; }
//           .pt-s { font-size: 0.84rem; font-weight: 600; color: var(--t2); }
//           .pt-live { display: flex; align-items: center; gap: 6px; font-size: 0.73rem; font-weight: 600; color: #4ade80; }
//           .ldot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: lp 1.8s ease-in-out infinite; }
//           @keyframes lp { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.5);}50%{box-shadow:0 0 0 6px rgba(74,222,128,0);} }

//           /* buttons */
//           .h-btns {
//             display: flex; align-items: center; gap: 12px;
//             margin-bottom: 24px; flex-wrap: wrap;
//             animation: fu 0.5s ease 0.38s both;
//           }
//           .btn-g {
//             display: inline-flex; align-items: center; gap: 8px;
//             padding: 13px 28px;
//             background: linear-gradient(135deg, var(--g1) 0%, var(--g2) 100%);
//             color: var(--p1); font-family: 'Sora', sans-serif;
//             font-size: 0.84rem; font-weight: 700; border: none;
//             border-radius: 8px; cursor: pointer; transition: all 0.25s;
//             box-shadow: 0 4px 18px rgba(217,160,32,0.32); letter-spacing: 0.01em;
//           }
//           .btn-g:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(217,160,32,0.46); filter: brightness(1.06); }
//           .btn-o {
//             display: inline-flex; align-items: center; gap: 8px;
//             padding: 13px 22px; background: rgba(255,255,255,0.07); color: var(--t2);
//             font-family: 'Sora', sans-serif; font-size: 0.84rem; font-weight: 500;
//             border: 1px solid rgba(255,255,255,0.18); border-radius: 8px;
//             cursor: pointer; transition: all 0.25s;
//           }
//           .btn-o:hover { border-color: var(--g1); color: var(--g1); background: rgba(240,187,58,0.06); }

//           @keyframes fu { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }

//           /* RIGHT — floating image card */
//           .hero-right {
//             position: relative; z-index: 2;
//             display: flex; align-items: center; justify-content: center;
//             animation: fu 0.7s ease 0.28s both;
//           }

//           .img-glow {
//             position: absolute; inset: -24px; border-radius: 36px;
//             background: radial-gradient(ellipse at center, rgba(240,187,58,0.16) 0%, transparent 65%);
//             pointer-events: none; z-index: 0;
//           }

//           .img-card {
//             position: relative; z-index: 1;
//             width: 100%; max-width: 990px;
//             border-radius: 22px; overflow: hidden;
//             box-shadow:
//               0 0 0 1px rgba(240,187,58,0.22),
//               0 28px 70px rgba(0,0,0,0.55),  
//               0 8px 24px rgba(0,0,0,0.30);
//             background: var(--p2);
//             transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
//             transition: transform 0.5s ease, box-shadow 0.5s ease;
//             cursor: pointer;
//           }
//           .img-card:hover {
//             transform: perspective(1000px) rotateY(-1deg) rotateX(0deg) translateY(-5px);
//             box-shadow:
//               0 0 0 1px rgba(240,187,58,0.35),
//               0 36px 80px rgba(0,0,0,0.6),
//               0 12px 32px rgba(240,187,58,0.14);
//           }
//           .img-card::before {
//             content: '';
//             position: absolute; top: 0; left: 0; right: 0; height: 2px;
//             background: linear-gradient(90deg, transparent 0%, var(--g1) 40%, var(--g2) 60%, transparent 100%);
//             z-index: 4;
//           }

//           .img-card img {
//             display: block; width: 100%; height: auto;
//             aspect-ratio: 3/2; object-fit: cover; object-position: center;
//           }

//           .img-strip {
//             position: absolute; bottom: 0; left: 0; right: 0;
//             padding: 22px 18px 18px;
//             background: linear-gradient(to top, rgba(8,16,36,0.94) 0%, rgba(8,16,36,0.55) 55%, transparent 100%);
//             z-index: 3;
//             display: flex; align-items: flex-end; justify-content: space-between;
//           }
//           .img-strip-val { font-size: 1.28rem; font-weight: 800; color: var(--g1); line-height: 1; margin-bottom: 3px; }
//           .img-strip-lbl { font-size: 0.63rem; font-weight: 500; color: var(--t3); text-transform: uppercase; letter-spacing: 0.06em; }
//           .img-live-pill {
//             display: flex; align-items: center; gap: 5px;
//             font-size: 0.68rem; font-weight: 600; color: #4ade80;
//             background: rgba(0,0,0,0.4); padding: 5px 10px;
//             border-radius: 20px; border: 1px solid rgba(74,222,128,0.22);
//           }
//           .strip-ldot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: lp 1.8s ease-in-out infinite; }

//           .img-badge {
//             position: absolute; top: 14px; right: 14px; z-index: 4;
//             background: rgba(8,16,36,0.72); backdrop-filter: blur(14px);
//             border: 1px solid rgba(240,187,58,0.35); border-radius: 11px;
//             padding: 9px 14px; text-align: center;
//           }
//           .img-badge-num { display: block; font-size: 1.08rem; font-weight: 800; color: var(--g1); line-height: 1; margin-bottom: 2px; }
//           .img-badge-lbl { font-size: 0.58rem; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: 0.07em; }

//           /* ══ MARQUEE ══ */
//           .mq { background: linear-gradient(90deg,var(--g2) 0%,var(--g1) 50%,var(--g2) 100%); padding: 11px 0; overflow: hidden; }
//           .mq-t { display: flex; animation: ms 24s linear infinite; white-space: nowrap; }
//           @keyframes ms { from{transform:translateX(0);}to{transform:translateX(-50%);} }
//           .mq-i { display: inline-flex; align-items: center; gap: 8px; padding: 0 24px; font-size: 0.72rem; font-weight: 700; color: var(--p1); border-right: 1px solid rgba(13,31,60,0.16); letter-spacing: 0.02em; }

//           /* ══ WHAT IS DIGITAL GOLD ══ */
//           .what-is {
//             padding: 72px 64px;
//             background: linear-gradient(180deg, #112347 0%, #162d57 100%);
//           }
//           .what-container {
//             max-width: 1160px;
//             margin: 0 auto;
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 48px;
//             align-items: center;
//           }
//           .what-content h2 {
//             font-size: clamp(1.8rem, 2.6vw, 2.4rem);
//             font-weight: 700;
//             color: var(--w);
//             margin-bottom: 16px;
//             line-height: 1.2;
//           }
//           .what-content h2 span {
//             color: var(--g1);
//           }
//           .what-content p {
//             font-size: 0.92rem;
//             color: var(--t2);
//             line-height: 1.8;
//             margin-bottom: 14px;
//           }
//           .what-content ul {
//             list-style: none;
//             padding: 0;
//             margin: 24px 0;
//           }
//           .what-content ul li {
//             font-size: 0.88rem;
//             color: var(--t2);
//             line-height: 1.7;
//             margin-bottom: 12px;
//             padding-left: 28px;
//             position: relative;
//           }
//           .what-content ul li::before {
//             content: '✓';
//             position: absolute;
//             left: 0;
//             color: var(--g1);
//             font-weight: 700;
//             font-size: 1.1rem;
//           }
//           .what-image {
//             position: relative;
//             border-radius: 16px;
//             overflow: hidden;
//             box-shadow: 0 20px 60px rgba(0,0,0,0.4);
//             cursor: pointer;
//             transition: transform 0.3s ease;
//           }
//           .what-image:hover {
//             transform: translateY(-8px);
//           }
//           .what-image img {
//             width: 100%;
//             height: auto;
//             display: block;
//           }

//           /* ══ COMPARISON SECTION ══ */
//           .comparison {
//             padding: 72px 64px;
//             background: linear-gradient(180deg, #0d1f3c 0%, #112347 100%);
//           }
//           .comparison-container {
//             max-width: 1160px;
//             margin: 0 auto;
//           }
//           .comparison-grid {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 48px;
//             align-items: center;
//             margin-top: 40px;
//           }
//           .comparison-image {
//             position: relative;
//             border-radius: 16px;
//             overflow: hidden;
//             box-shadow: 0 20px 60px rgba(0,0,0,0.4);
//             cursor: pointer;
//             transition: transform 0.3s ease;
//           }
//           .comparison-image:hover {
//             transform: translateY(-8px);
//           }
//           .comparison-image img {
//             width: 100%;
//             height: auto;
//             display: block;
//           }
//           .comparison-content h3 {
//             font-size: 1.6rem;
//             font-weight: 700;
//             color: var(--w);
//             margin-bottom: 20px;
//           }
//           .comparison-content h3 span {
//             color: var(--g1);
//           }
//           .comparison-list {
//             list-style: none;
//             padding: 0;
//           }
//           .comparison-list li {
//             font-size: 0.88rem;
//             color: var(--t2);
//             line-height: 1.7;
//             margin-bottom: 16px;
//             padding-left: 32px;
//             position: relative;
//           }
//           .comparison-list li::before {
//             content: '★';
//             position: absolute;
//             left: 0;
//             color: var(--g1);
//             font-size: 1.2rem;
//           }

//           /* ══ INVESTMENT INFO ══ */
//           .invest-info {
//             padding: 64px;
//             background: linear-gradient(135deg, #162d57 0%, #1a3060 100%);
//           }
//           .invest-container {
//             max-width: 960px;
//             margin: 0 auto;
//             text-align: center;
//           }
//           .invest-container h2 {
//             font-size: 2rem;
//             font-weight: 700;
//             color: var(--w);
//             margin-bottom: 16px;
//           }
//           .invest-container h2 span {
//             color: var(--g1);
//           }
//           .invest-container p {
//             font-size: 0.94rem;
//             color: var(--t2);
//             line-height: 1.8;
//             margin-bottom: 12px;
//           }
//           .info-cards {
//             display: grid;
//             grid-template-columns: repeat(3, 1fr);
//             gap: 24px;
//             margin-top: 40px;
//           }
//           .info-card {
//             background: rgba(13,31,60,0.55);
//             border: 1px solid rgba(42,78,158,0.35);
//             border-radius: 12px;
//             padding: 28px 22px;
//             transition: all 0.3s;
//           }
//           .info-card:hover {
//             background: rgba(13,31,60,0.75);
//             border-color: rgba(240,187,58,0.40);
//             transform: translateY(-4px);
//             box-shadow: 0 12px 36px rgba(0,0,0,0.25);
//           }
//           .info-icon {
//             font-size: 2.2rem;
//             margin-bottom: 12px;
//           }
//           .info-card h4 {
//             font-size: 1.05rem;
//             font-weight: 600;
//             color: var(--w);
//             margin-bottom: 8px;
//           }
//           .info-card p {
//             font-size: 0.82rem;
//             color: var(--t2);
//             line-height: 1.6;
//             margin-bottom: 0;
//           }

//           /* ══ SECTIONS ══ */
//           .sec { padding: 72px 64px; }
//           .s-dark { background: linear-gradient(180deg, #0d1f3c 0%, #112347 100%); }
//           .s-mid  { background: linear-gradient(180deg, #112347 0%, #162d57 100%); }
//           .s-lite { background: #f4f0ff; }
//           .s-hd { text-align: center; margin-bottom: 48px; }
//           .s-lbl { display: block; font-size: 0.72rem; font-weight: 600; color: var(--g1); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
//           .s-lbl.dk { color: var(--p4); }
//           .s-h { font-size: clamp(1.45rem,2.4vw,2rem); font-weight: 700; line-height: 1.25; color: var(--w); margin-bottom: 8px; }
//           .s-h.dk { color: var(--p1); }
//           .s-h span { color: var(--g1); }
//           .s-h.dk span { color: var(--p4); }
//           .s-p { font-size: 0.88rem; color: var(--t2); line-height: 1.7; }
//           .s-p.dk { color: rgba(13,31,60,0.62); }

//           /* ══ FEATURE CARDS ══ */
//           .fg { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; max-width: 1160px; margin: 0 auto; background: var(--bp); border: 1px solid var(--bp); border-radius: 10px; overflow: hidden; }
//           .fc { background: #112347; padding: 30px 22px; position: relative; overflow: hidden; transition: background 0.3s; }
//           .fc::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--p4),var(--g2),var(--p4)); opacity:0; transition:opacity 0.3s; }
//           .fc:hover { background: #1a3060; }
//           .fc:hover::before { opacity: 1; }
//           .fc-n { font-size:1.8rem; font-weight:700; color:rgba(42,78,158,0.14); line-height:1; margin-bottom:14px; display:block; }
//           .fc-ico { width:38px; height:38px; border:1px solid var(--bg); border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; margin-bottom:12px; background:rgba(240,187,58,0.06); transition:all 0.3s; }
//           .fc:hover .fc-ico { border-color:rgba(240,187,58,0.42); background:rgba(240,187,58,0.12); }
//           .fc-t { font-size:0.88rem; font-weight:600; color:var(--w); margin-bottom:6px; }
//           .fc-d { font-size:0.8rem; color:var(--t2); line-height:1.68; }

//           /* ══ HOW IT WORKS ══ */
//           .hw { background: linear-gradient(180deg, #112347 0%, #162d57 100%); padding: 72px 64px; }
//           .how-row { display: grid; grid-template-columns: repeat(5,1fr); gap: 0; max-width: 1160px; margin: 0 auto; position: relative; }
//           .how-row::before { content:''; position:absolute; top:26px; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,var(--bg),var(--g1),var(--bg),transparent); z-index:0; }
//           .hw-s { display:flex; flex-direction:column; align-items:center; text-align:center; padding:0 10px; position:relative; z-index:1; }
//           .hw-c { width:52px; height:52px; border-radius:50%; background:#1a3060; border:2px solid var(--g2); display:flex; align-items:center; justify-content:center; font-size:1.25rem; margin-bottom:16px; box-shadow:0 0 0 4px #112347; transition:all 0.3s; }
//           .hw-s:hover .hw-c { background:var(--g2); box-shadow:0 0 0 4px #112347,0 0 16px rgba(217,160,32,0.35); }
//           .hw-t { font-size:0.84rem; font-weight:600; color:var(--w); margin-bottom:5px; line-height:1.3; }
//           .hw-d { font-size:0.76rem; color:var(--t2); line-height:1.6; }

//           /* ══ STATS ══ */
//           .sg { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; max-width:960px; margin:0 auto; background:var(--bp); border:1px solid var(--bp); border-radius:10px; overflow:hidden; }
//           .si { background:#112347; padding:38px 24px; text-align:center; transition:background 0.3s; }
//           .si:hover { background:#1a3060; }
//           .sv { font-size:2rem; font-weight:700; color:var(--g1); line-height:1; margin-bottom:7px; }
//           .sl { font-size:0.76rem; color:var(--t2); }

//           /* ══ TESTIMONIALS ══ */
//           .tg { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; max-width:1100px; margin:0 auto; }
//           .tc { background:#fff; border-radius:10px; padding:28px 24px; border:1px solid rgba(42,78,158,0.10); position:relative; overflow:hidden; transition:transform 0.3s,box-shadow 0.3s; }
//           .tc::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--p4),var(--g2)); }
//           .tc:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(13,31,60,0.12); }
//           .tc-q { font-size:2.2rem; font-weight:700; line-height:0.8; color:rgba(42,78,158,0.14); margin-bottom:10px; display:block; }
//           .tc-t { font-size:0.84rem; line-height:1.72; color:rgba(13,31,60,0.72); margin-bottom:18px; }
//           .tc-a { display:flex; align-items:center; gap:9px; }
//           .tc-av { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,var(--p4),var(--g2)); display:flex; align-items:center; justify-content:center; font-size:0.78rem; font-weight:600; color:#fff; }
//           .tc-nm { font-size:0.8rem; font-weight:600; color:var(--p1); }
//           .tc-ct { font-size:0.7rem; color:rgba(13,31,60,0.42); margin-top:1px; }
//           .tc-st { color:var(--g2); font-size:0.68rem; letter-spacing:2px; margin-left:auto; }

//           /* ══ CTA ══ */
//           .cta { position:relative; padding:96px 64px; text-align:center; background:linear-gradient(135deg, #0d1f3c 0%, #112347 100%); overflow:hidden; }
//           .cta-gl { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(42,78,158,0.28),transparent 70%); left:-50px; top:50%; transform:translateY(-50%); pointer-events:none; }
//           .cta-gr { position:absolute; width:320px; height:320px; border-radius:50%; background:radial-gradient(circle,rgba(240,187,58,0.09),transparent 70%); right:-40px; top:50%; transform:translateY(-50%); pointer-events:none; }
//           .cta-in { position:relative; z-index:2; max-width:520px; margin:0 auto; }
//           .cta-div { display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:18px; }
//           .cta-ln { width:56px; height:1px; background:linear-gradient(to right,transparent,rgba(240,187,58,0.42)); }
//           .cta-ln.r { background:linear-gradient(to left,transparent,rgba(240,187,58,0.42)); }
//           .cta-dm { width:6px; height:6px; background:var(--g1); transform:rotate(45deg); }
//           .cta-h { font-size:clamp(1.5rem,2.8vw,2.2rem); font-weight:700; color:var(--w); line-height:1.2; margin-bottom:12px; }
//           .cta-h span { color:var(--g1); }
//           .cta-p { font-size:0.88rem; color:var(--t2); line-height:1.72; margin-bottom:32px; }
//           .cta-bs { display:flex; justify-content:center; gap:10px; }

//           /* ══ FOOTER ══ */
//           .foot {
//             background: #060f1e;
//             border-top: 1px solid rgba(42,78,158,0.22);
//             padding: 48px 60px 24px;
//           }
//           .f-container {
//             display: grid;
//             grid-template-columns: 1.2fr 0.8fr;
//             gap: 48px;
//             margin-bottom: 32px;
//             max-width: 1200px;
//             margin-left: auto;
//             margin-right: auto;
//           }
//           .f-brand {
//             max-width: 520px;
//           }
//           .f-logo {
//             font-size: 1.4rem;
//             font-weight: 800;
//             color: var(--g1);
//             margin-bottom: 16px;
//             letter-spacing: 0.02em;
//           }
//           .f-tagline {
//             font-size: 0.85rem;
//             color: rgba(255,255,255,0.58);
//             line-height: 1.7;
//           }
//           .f-contact {
//             display: flex;
//             flex-direction: column;
//             gap: 20px;
//           }
//           .f-contact-title {
//             font-size: 1.1rem;
//             font-weight: 600;
//             color: var(--w);
//             margin-bottom: 4px;
//           }
//           .f-addresses {
//             display: flex;
//             flex-direction: column;
//             gap: 16px;
//           }
//           .f-address {
//             font-size: 0.8rem;
//             color: rgba(255,255,255,0.48);
//             line-height: 1.6;
//           }
//           .f-address strong {
//             color: rgba(255,255,255,0.70);
//             font-weight: 600;
//           }
//           .f-contact-info {
//             display: flex;
//             flex-direction: column;
//             gap: 8px;
//           }
//           .f-email, .f-phone {
//             font-size: 0.85rem;
//             color: var(--g1);
//             text-decoration: none;
//             font-weight: 500;
//             transition: color 0.2s;
//           }
//           .f-email:hover, .f-phone:hover {
//             color: var(--g2);
//           }
//           .f-bottom {
//             border-top: 1px solid rgba(255,255,255,0.08);
//             padding-top: 24px;
//             display: flex;
//             flex-direction: column;
//             gap: 16px;
//             max-width: 1200px;
//             margin: 0 auto;
//           }
//           .f-disclaimer {
//             font-size: 0.75rem;
//             color: rgba(255,255,255,0.38);
//             line-height: 1.6;
//           }
//           .f-disclaimer strong {
//             color: rgba(255,255,255,0.58);
//           }
//           .f-copyright {
//             font-size: 0.8rem;
//             color: rgba(255,255,255,0.28);
//             text-align: center;
//           }

//           /* ══ IMAGE MODAL ══ */
//           .modal-overlay {
//             position: fixed; inset: 0; background: rgba(0,0,0,0.85);
//             display: flex; align-items: center; justify-content: center;
//             z-index: 1000; backdrop-filter: blur(4px);
//             animation: fadeIn 0.3s ease;
//           }
//           .modal-content {
//             position: relative; max-width: 90vw; max-height: 90vh;
//             border-radius: 16px; overflow: hidden;
//             box-shadow: 0 20px 60px rgba(0,0,0,0.8);
//             animation: slideUp 0.4s ease;
//           }
//           .modal-content img {
//             width: 100%; height: 100%; object-fit: contain;
//           }
//           .modal-close {
//             position: absolute; top: 16px; right: 16px;
//             width: 40px; height: 40px; border-radius: 50%;
//             background: rgba(0,0,0,0.6); border: none;
//             color: white; font-size: 24px; cursor: pointer;
//             display: flex; align-items: center; justify-content: center;
//             transition: all 0.2s;
//             z-index: 1001;
//           }
//           .modal-close:hover { background: rgba(0,0,0,0.9); }
//           @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//           @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

//           /* ══ RESPONSIVE ══ */
//           @media (max-width: 960px) {
//             .hero { grid-template-columns: 1fr; padding: 56px 32px 48px; gap: 40px; min-height: auto; }
//             .img-card { max-width: 480px; transform: none; }
//             .what-container, .comparison-grid { grid-template-columns: 1fr; gap: 32px; }
//             .info-cards { grid-template-columns: 1fr; }
//             .fg { grid-template-columns: 1fr 1fr; }
//             .how-row { grid-template-columns: 1fr 1fr; gap: 20px; }
//             .how-row::before { display: none; }
//             .sg { grid-template-columns: 1fr 1fr; }
//             .tg { grid-template-columns: 1fr; }
//             .sec, .what-is, .comparison, .invest-info { padding: 52px 28px; }
//             .hw  { padding: 52px 28px; }
//             .cta { padding: 60px 28px; }
//             .foot { padding: 36px 28px 20px; }
//             .f-container { grid-template-columns: 1fr; gap: 32px; margin-bottom: 24px; }
//           }
//           @media (max-width: 560px) {
//             .hero { padding: 40px 20px 36px; gap: 32px; }
//             .h-title { font-size: 2rem; }
//             .ptick { flex-wrap: wrap; }
//             .pt-c { flex: 1; min-width: 88px; }
//             .h-btns { flex-direction: column; width: 100%; }
//             .btn-g, .btn-o { width: 100%; justify-content: center; }
//             .fg { grid-template-columns: 1fr; }
//             .how-row { grid-template-columns: 1fr; }
//             .sec, .what-is, .comparison, .invest-info { padding: 40px 20px; }
//             .hw  { padding: 40px 20px; }
//             .cta { padding: 48px 20px; }
//             .cta-bs { flex-direction: column; width: 100%; }
//             .f-lks { flex-wrap: wrap; justify-content: center; }
//           }
//         `}</style>

//         {/* ══ HERO ══ */}
//         <section className="hero">
//           <div className="hero-left">
//             <div className="h-tag">
//               <span className="h-tdot" />
//               India's Premier Digital Gold Platform
//             </div>

//             <h1 className="h-title">
//               Buy{' '}
//               <span>
//                 {"Digital Gold".split('').map((char, i) => (
//                   <span key={i} className="title-char" style={{ animationDelay: `${i * 0.05}s` }}>
//                     {char}
//                   </span>
//                 ))}
//               </span>
//               <br />
//               Starting from ₹
//               <span>
//                 {"100".split('').map((char, i) => (
//                   <span key={`num-${i}`} className="title-char" style={{ animationDelay: `${13 * 0.05 + i * 0.05}s` }}>
//                     {char}
//                   </span>
//                 ))}
//               </span>
//             </h1>

//             <p className="h-desc">
//               999.9 certified purity · Stored in insured vaults<br />
//               Buy anytime, sell anytime at live market rates
//             </p>

//             <div className="ptick">
//               <div className="pt-c">
//                 <span className="pt-l">24K Gold / gram</span>
//                 <span className="pt-v">₹{goldRate?.toFixed(2)}</span>
//               </div>
//               <div className="pt-c">
//                 <span className="pt-l">Purity</span>
//                 <span className="pt-s">999.9 Pure</span>
//               </div>
//               <div className="pt-c">
//                 <span className="pt-l">Market</span>
//                 <div className="pt-live"><div className="ldot" />Live</div>
//               </div>
//             </div>

//             <div className="h-btns">
//               <button className="btn-g" onClick={handleBuyGoldClick}>
//                 Buy Digital Gold
//                 <svg width="13" height="10" viewBox="0 0 14 10" fill="none">
//                   <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </button>
//               <button className="btn-o" onClick={() => navigate('/how-it-works')}>How It Works</button>
//             </div>
//           </div>

//           <div className="hero-right">
//             <div className="img-glow" />
//             <div className="img-card" onClick={() => openImageModal('https://assets.gadgets360cdn.com/img/gold/digital-gold-og-image.png')}>
//               <img
//                 src="https://assets.gadgets360cdn.com/img/gold/digital-gold-og-image.png"
//                 alt="Digital Gold Investment"
//               />
//               <div className="img-strip">
//                 <div>
//                   <div className="img-strip-val">₹{goldRate?.toFixed(2)}</div>
//                   <div className="img-strip-lbl">24K Gold · per gram</div>
//                 </div>
//                 <div className="img-live-pill">
//                   <span className="strip-ldot" />
//                   Live Market
//                 </div>
//               </div>
//               <div className="img-badge">
//                 <span className="img-badge-num">24K</span>
//                 <span className="img-badge-lbl">999 Pure</span>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ══ MARQUEE ══ */}
//         <div className="mq">
//           <div className="mq-t">
//             {[...Array(2)].map((_, r) =>
//               ['999 Pure Gold', 'Instant Buy & Sell', 'Insured Vaults', 'Start from ₹100', 'BIS Certified', 'Live Market Prices', '24/7 Access', 'Zero Storage Fees'].map((t, i) => (
//                 <div className="mq-i" key={`${r}-${i}`}>★ {t}</div>
//               ))
//             )}
//           </div>
//         </div>

//           {/* ══ HOW IT WORKS ══ */}
//         <section className="hw">
//           <div className="s-hd">
//             <span id="hwl" className="obs s-lbl" style={rv('hwl')}>How It Works</span>
//             <div id="hwh" className="obs" style={rv('hwh', 0.07)}>
//               <h2 className="s-h">Buy Digital Gold in <span>5 simple steps</span></h2>
//               <p className="s-p">From checking live prices to gold secured in your vault — it takes just minutes.</p>
//             </div>
//           </div>
//           <div className="how-row">
//             {[
//               { n:1, ic:'📈', t:'Check Live Price',     d:'View real-time gold rates updated every minute' },
//               { n:2, ic:'💰', t:'Choose Amount',        d:'Buy in rupees or grams from just ₹100' },
//               { n:3, ic:'🔒', t:'Pay Securely',         d:'Complete payment via secure payment gateway' },
//               { n:4, ic:'🏦', t:'Gold Stored in Vault', d:'Your gold stored in insured, certified vaults' },
//               { n:5, ic:'📊', t:'Track & Sell Anytime', d:'Monitor your gold value and sell at live rates' },
//             ].map((s, i) => (
//               <div key={s.n} id={`hs${s.n}`} className="obs hw-s" style={rv(`hs${s.n}`, i * 0.09)}>
//                 <div className="hw-c">{s.ic}</div>
//                 <div className="hw-t">{s.t}</div>
//                 <div className="hw-d">{s.d}</div>
//               </div>
//             ))}
//           </div>
//           <div style={{ textAlign:'center', marginTop:40 }}>
//             <button className="btn-g" onClick={handleBuyGoldClick}>
//               Buy Digital Gold Now
//               <svg width="13" height="10" viewBox="0 0 14 10" fill="none">
//                 <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             </button>
//           </div>
//         </section>

//         {/* ══ WHAT IS DIGITAL GOLD ══ */}
//         <section className="what-is">
//           <div className="what-container">
//             <div id="wc" className="obs what-content" style={rv('wc')}>
//               <h2>What is <span>Digital Gold?</span></h2>
//              <p>
//   Digital gold means buying real gold online using a website or mobile app without keeping the gold physically.
// </p>

// <p>
//   The gold you buy is safely stored in secure vaults, and you can invest in small amounts easily using digital platforms.
// </p>
// <ul>
//   <li><strong>Real Gold:</strong> Your money is used to buy real 24K gold.</li>
//   <li><strong>Flexible Investment:</strong> You can start investing from ₹100 and buy or sell anytime.</li>
//   <li><strong>Safe & Secure:</strong> Your gold is stored safely and fully insured.</li>
//   <li><strong>Easy to Sell:</strong> You can sell your gold anytime and get money in your bank account the same day.</li>
// </ul>
//             </div>
//             <div id="wi" className="obs what-image" style={rv('wi', 0.2)} onClick={() => openImageModal('https://d1fow5xdcuw86u.cloudfront.net/assets/blog/Digital_Gold_A_071020251243279663034.webp')}>
//               <img 
//                 src="https://d1fow5xdcuw86u.cloudfront.net/assets/blog/Digital_Gold_A_071020251243279663034.webp" 
//                 alt="What is Digital Gold"
//               />
//             </div>
//           </div>
//         </section>

//         {/* ══ COMPARISON SECTION ══ */}
//         <section className="comparison">
//           <div className="comparison-container">
//             <div className="s-hd">
//               <span id="csl" className="obs s-lbl" style={rv('csl')}>Digital vs Traditional</span>
//               <div id="csh" className="obs" style={rv('csh', 0.07)}>
//                 <h2 className="s-h">Why <span>Digital Gold</span> is Better</h2>
//                 <p className="s-p">Discover the advantages of digital gold over traditional gold investments</p>
//               </div>
//             </div>
            
//             <div className="comparison-grid">
//               <div id="ci" className="obs comparison-image" style={rv('ci')} onClick={() => openImageModal('https://www.paisabazaar.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2018/09/Digital-gold-outsorced-traditional-gold.jpg.webp')}>
//                 <img 
//                   src="https://www.paisabazaar.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2018/09/Digital-gold-outsorced-traditional-gold.jpg.webp" 
//                   alt="Digital vs Traditional Gold Comparison"
//                 />
//               </div>
//               <div id="cc" className="obs comparison-content" style={rv('cc', 0.2)}>
//                 <h3>Advantages of <span>Digital Gold</span></h3>
//                 <ul className="comparison-list">
//                   <li><strong>No Storage Worries:</strong> Your gold is stored in certified vaults with 24/7 security — no lockers, no tension</li>
//                   <li><strong>Start Small:</strong> Invest from just ₹100, unlike traditional gold jewelry that requires larger amounts</li>
//                   <li><strong>Zero Making Charges:</strong> Pay only for gold at live market rates with no hidden costs or wastage charges</li>
//                   <li><strong>100% Pure Gold:</strong> Guaranteed 999.9 purity with BIS certification, unlike jewelry which has making charges</li>
//                   <li><strong>Instant Liquidity:</strong> Sell anytime at market rates and get money in your account the same day</li>
//                   <li><strong>24/7 Access:</strong> Buy or sell gold anytime from your phone — no need to visit jewelry shops</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ══ INVESTMENT INFO ══ */}
//         <section className="invest-info">
//           <div id="ic" className="obs invest-container" style={rv('ic')}>
//             <h2>Is it Good to Invest in <span>Digital Gold?</span></h2>
//             <p>
//               Digital gold is a convenient, low-cost investment for owning 24-karat gold without storage, security, or purity worries. 
//               It allows small-ticket investments starting from just ₹100 through mobile apps and offers high liquidity.
//             </p>
//             <p>
//               It acts as an excellent inflationary hedge and is ideal for short-to-medium-term wealth accumulation. 
//               The platform provides complete transparency with live market rates and instant buy/sell capabilities.
//             </p>
            
//             <div className="info-cards">
//               <div id="ica1" className="obs info-card" style={rv('ica1', 0.1)}>
                
//                 <h4>Low Investment</h4>
//                 <p>Start your gold journey with as little as ₹100. Perfect for beginners and systematic investment planning.</p>
//               </div>
//               <div id="ica2" className="obs info-card" style={rv('ica2', 0.2)}>

//                 <h4>High Liquidity</h4>
//                 <p>Sell your gold anytime at live market rates. Money credited to your bank account within 24 hours.</p>
//               </div>
//               <div id="ica3" className="obs info-card" style={rv('ica3', 0.3)}>
              
//                 <h4>Inflation Hedge</h4>
//                 <p>Gold historically maintains value during inflation, protecting your wealth from currency devaluation.</p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ══ FEATURES ══ */}
//         <section className="sec s-dark">
//           <div className="s-hd">
//             <span id="fl" className="obs s-lbl" style={rv('fl')}>Why Choose Digital Gold</span>
//             <div id="fh" className="obs" style={rv('fh', 0.07)}>
//               <h2 className="s-h">Everything you need to <span>own gold</span></h2>
//               <p className="s-p">No locker. No worries. Buy, track and sell from your phone.</p>
//             </div>
//           </div>
//           <div className="fg">
//             {[
//               { n:'01', ic:'🔐', t:'Insured Vault Storage',  d:'Your gold is stored in certified, fully insured vaults with bank-grade security and 24/7 monitoring.', id:'fc1' },
//               { n:'02', ic:'✦',  t:'999.9 Pure Gold',        d:'Every gram is BIS-certified 24K gold. Purity is verified and guaranteed before it enters your account.', id:'fc2' },
//               { n:'03', ic:'⚡', t:'Instant Buy & Sell',     d:'Buy or sell at live market rates any time. Funds credited to your bank account the same day.', id:'fc3' },
//               { n:'04', ic:'📊', t:'Track Your Portfolio',   d:'Monitor your gold value in real time, set price alerts, and view your complete transaction history.', id:'fc4' },
//             ].map((c, i) => (
//               <div key={c.id} id={c.id} className="obs fc" style={rv(c.id, i * 0.07)}>
//                 <span className="fc-n">{c.n}</span>
//                 <div className="fc-ico">{c.ic}</div>
//                 <h3 className="fc-t">{c.t}</h3>
//                 <p className="fc-d">{c.d}</p>
//               </div>
//             ))}
//           </div>
//         </section>

      

//         {/* ══ STATS ══ */}
//         <section className="sec s-dark" style={{ padding:'60px 64px' }}>
//           <div className="sg">
//             {[
//               { v:'₹100',  l:'Minimum Purchase', id:'s0' },
//               { v:'999.9', l:'Gold Purity',       id:'s1' },
//               { v:'100%',  l:'Insured Assets',    id:'s2' },
//               { v:'24/7',  l:'Market Access',     id:'s3' },
//             ].map((s, i) => (
//               <div key={s.id} id={s.id} className="obs si" style={rv(s.id, i * 0.09)}>
//                 <div className="sv">{s.v}</div>
//                 <div className="sl">{s.l}</div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ══ TESTIMONIALS ══ */}
//         <section className="sec s-lite">
//           <div className="s-hd" style={{ marginBottom:36 }}>
//             <span id="tl" className="obs s-lbl dk" style={rv('tl')}>Customer Reviews</span>
//             <div id="th" className="obs" style={rv('th', 0.07)}>
//               <h2 className="s-h dk">Trusted by thousands <span>across India</span></h2>
//             </div>
//           </div>
//           <div className="tg">
//             {[
//               { q:'Started with ₹500 and now have a solid gold portfolio. The purity guarantee and instant sell feature are genuinely unmatched.', nm:'Hari Babu', ct:'Mumbai', av:'P' },
//               { q:'KYC took 90 seconds and I bought my first gram the same evening. The whole experience is seamless and professional.', nm:'Rahul Verma', ct:'Bangalore', av:'R' },
//               { q:'Finally a gold platform that feels premium. The live price tracker and same-day withdrawal make it a complete no-brainer.', nm:'Ananya Patel', ct:'Hyderabad', av:'A' },
//             ].map((t, i) => (
//               <div key={i} id={`tc${i}`} className="obs tc" style={rv(`tc${i}`, i * 0.09)}>
//                 <span className="tc-q">"</span>
//                 <p className="tc-t">{t.q}</p>
//                 <div className="tc-a">
//                   <div className="tc-av">{t.av}</div>
//                   <div>
//                     <div className="tc-nm">{t.nm}</div>
//                     <div className="tc-ct">{t.ct}</div>
//                   </div>
//                   <div className="tc-st">★★★★★</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ══ CTA ══ */}
//         <section className="cta">
//           <div className="cta-gl" /><div className="cta-gr" />
//           <div id="cta" className="obs cta-in" style={rv('cta')}>
//             <div className="cta-div">
//               <div className="cta-ln" /><div className="cta-dm" /><div className="cta-ln r" />
//             </div>
//             <h2 className="cta-h">Start buying <span>Digital Gold</span> today</h2>
//             <p className="cta-p">
//               Join over 50,000 Indians securing their wealth with 999 certified digital gold.<br />
//               Start from just ₹100 — no lock-in, no hidden fees, sell anytime.
//             </p>
//             <div className="cta-bs">
//               <button className="btn-g" onClick={handleBuyGoldClick}>
//                 Buy Digital Gold
//                 <svg width="13" height="10" viewBox="0 0 14 10" fill="none">
//                   <path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </button>
//               <button className="btn-o" onClick={() => navigate('/how-it-works')}>Learn More</button>
//             </div>
//           </div>
//         </section>


//         {/* ══ IMAGE MODAL ══ */}
//         {showImageModal && (
//           <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
//             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//               <img
//                 src={modalImage}
//                 alt="Digital Gold"
//               />
//               <button className="modal-close" onClick={() => setShowImageModal(false)}>×</button>
//             </div>
//           </div>
//         )}
//       </>
//     );
//   };

//   export default Landing;













import { useNavigate } from 'react-router-dom';
  import { useEffect, useState } from 'react';
  import { requireAuth } from '../utils/auth';
  import { useGoldPrice } from '../context/GoldPriceContext';

  const Landing = () => {
    const navigate = useNavigate();
    const { buyPrice: livePrice } = useGoldPrice();
    const goldRate = livePrice;
    const [visible, setVisible] = useState<{ [k: string]: boolean }>({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImage, setModalImage] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
      const userData = localStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
      const obs = new IntersectionObserver(
        (entries) => entries.forEach(e => {
          if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.id]: true }));
        }),
        { threshold: 0.08 }
      );
      document.querySelectorAll('.obs').forEach(el => obs.observe(el));
      return () => obs.disconnect();
    }, []);

    const handleBuyGoldClick = () => {
      if (!user) {
        window.location.href = '/login';
        return;
      }
      navigate('/buy-gold');
    };

    const openImageModal = (imgSrc: string) => {
      setModalImage(imgSrc);
      setShowImageModal(true);
    };

    const rv = (id: string, delay = 0): React.CSSProperties => ({
      opacity: visible[id] ? 1 : 0,
      transform: visible[id] ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    });

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --p1: #0d1f3c;
            --p2: #112347;
            --p3: #1a3060;
            --p4: #2a4e9e;
            --g1: #f0bb3a;
            --g2: #d9a020;
            --w: #ffffff;
            --t2: rgba(255,255,255,0.80);
            --t3: rgba(255,255,255,0.52);
            --off: #f4f0ff;
            --bp: rgba(42,78,158,0.22);
            --bg: rgba(217,160,32,0.24);
          }

          html { scroll-behavior: smooth; }
          body {
            font-family: 'Sora', sans-serif;
            background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
            color: var(--w);
            overflow-x: hidden;
            line-height: 1.6;
          }

          .hero {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            align-items: center;
            min-height: 90vh;
            padding: 80px 72px 80px 80px;
            gap: 64px;
            background: linear-gradient(135deg, #0d1f3c 0%, #112347 60%, #0f2954 100%);
            position: relative; overflow: hidden;
          }
          .hero::before {
            content: ''; position: absolute;
            width: 650px; height: 650px; border-radius: 50%;
            background: radial-gradient(circle, rgba(42,78,158,0.28) 0%, transparent 68%);
            left: -160px; top: 50%; transform: translateY(-50%);
            pointer-events: none; z-index: 0;
          }
          .hero::after {
            content: ''; position: absolute;
            width: 360px; height: 360px; border-radius: 50%;
            background: radial-gradient(circle, rgba(240,187,58,0.10) 0%, transparent 70%);
            right: 60px; top: 15%; pointer-events: none; z-index: 0;
          }
          .hero-left {
            position: relative; z-index: 2;
            display: flex; flex-direction: column; align-items: flex-start;
          }
          .h-tag {
            display: inline-flex; align-items: center; gap: 8px;
            font-size: 0.68rem; font-weight: 600; color: var(--g1);
            letter-spacing: 0.1em; text-transform: uppercase;
            margin-bottom: 18px; animation: fu 0.5s ease 0.1s both;
          }
          .h-tdot {
            width: 6px; height: 6px; border-radius: 50%;
            background: var(--g1); flex-shrink: 0;
            box-shadow: 0 0 8px rgba(240,187,58,0.65);
            animation: lp 2s ease-in-out infinite;
          }
          .h-title {
            font-size: clamp(2.4rem, 3.4vw, 3.7rem);
            font-weight: 800; line-height: 1.09;
            color: var(--w); margin-bottom: 14px;
            letter-spacing: -0.025em; animation: fu 0.5s ease 0.16s both;
          }
          .h-title span {
            background: linear-gradient(118deg, #f6cc50 0%, var(--g1) 45%, #e8920a 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          }
          .title-char { display: inline-block; animation: charReveal 0.5s ease forwards; }
          @keyframes charReveal { 0%{opacity:0;transform:translateY(10px);}100%{opacity:1;transform:translateY(0);} }

          .h-desc {
            font-size: 0.86rem; color: var(--t2);
            margin-bottom: 24px; line-height: 1.7;
            animation: fu 0.5s ease 0.22s both;
          }

          .ptick {
            display: inline-flex; align-items: stretch;
            border: 1px solid rgba(240,187,58,0.30); border-radius: 10px;
            overflow: hidden; margin-bottom: 24px;
            background: rgba(13,31,60,0.72); backdrop-filter: blur(18px);
            animation: fu 0.5s ease 0.3s both;
          }
          .pt-c {
            padding: 11px 18px; display: flex; flex-direction: column; gap: 4px;
            border-right: 1px solid rgba(240,187,58,0.12);
          }
          .pt-c:last-child { border-right: none; }
          .pt-l { font-size: 0.57rem; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: 0.07em; }
          .pt-v { font-size: 1.1rem; font-weight: 700; color: var(--g1); line-height: 1.15; }
          .pt-s { font-size: 0.82rem; font-weight: 500; color: var(--t2); }
          .pt-live { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 600; color: #4ade80; }
          .ldot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: lp 1.8s ease-in-out infinite; }
          @keyframes lp { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.5);}50%{box-shadow:0 0 0 6px rgba(74,222,128,0);} }

          .h-btns {
            display: flex; align-items: center; gap: 12px;
            flex-wrap: wrap; animation: fu 0.5s ease 0.38s both;
          }
          .btn-g {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 12px 26px;
            background: linear-gradient(135deg, var(--g1) 0%, var(--g2) 100%);
            color: var(--p1); font-family: 'Sora', sans-serif;
            font-size: 0.83rem; font-weight: 700; border: none;
            border-radius: 8px; cursor: pointer; transition: all 0.25s;
            box-shadow: 0 4px 18px rgba(217,160,32,0.32);
          }
          .btn-g:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(217,160,32,0.46); filter: brightness(1.06); }
          .btn-o {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 12px 20px; background: rgba(255,255,255,0.07); color: var(--t2);
            font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 500;
            border: 1px solid rgba(255,255,255,0.18); border-radius: 8px;
            cursor: pointer; transition: all 0.25s;
          }
          .btn-o:hover { border-color: var(--g1); color: var(--g1); background: rgba(240,187,58,0.06); }

          @keyframes fu { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }

          .hero-right {
            position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: center;
            animation: fu 0.7s ease 0.28s both;
          }
          .img-glow {
            position: absolute; inset: -24px; border-radius: 36px;
            background: radial-gradient(ellipse at center, rgba(240,187,58,0.16) 0%, transparent 65%);
            pointer-events: none; z-index: 0;
          }
          .img-card {
            position: relative; z-index: 1; width: 100%; max-width: 990px;
            border-radius: 22px; overflow: hidden;
            box-shadow: 0 0 0 1px rgba(240,187,58,0.22), 0 28px 70px rgba(0,0,0,0.55);
            background: var(--p2);
            transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
            transition: transform 0.5s ease, box-shadow 0.5s ease; cursor: pointer;
          }
          .img-card:hover {
            transform: perspective(1000px) rotateY(-1deg) rotateX(0deg) translateY(-5px);
            box-shadow: 0 0 0 1px rgba(240,187,58,0.35), 0 36px 80px rgba(0,0,0,0.6);
          }
          .img-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent 0%, var(--g1) 40%, var(--g2) 60%, transparent 100%);
            z-index: 4;
          }
          .img-card img { display: block; width: 100%; height: auto; aspect-ratio: 3/2; object-fit: cover; }
          .img-strip {
            position: absolute; bottom: 0; left: 0; right: 0;
            padding: 20px 16px 16px;
            background: linear-gradient(to top, rgba(8,16,36,0.94) 0%, rgba(8,16,36,0.55) 55%, transparent 100%);
            z-index: 3; display: flex; align-items: flex-end; justify-content: space-between;
          }
          .img-strip-val { font-size: 1.2rem; font-weight: 800; color: var(--g1); line-height: 1; margin-bottom: 2px; }
          .img-strip-lbl { font-size: 0.6rem; font-weight: 500; color: var(--t3); text-transform: uppercase; letter-spacing: 0.06em; }
          .img-live-pill {
            display: flex; align-items: center; gap: 5px;
            font-size: 0.66rem; font-weight: 600; color: #4ade80;
            background: rgba(0,0,0,0.4); padding: 5px 9px;
            border-radius: 20px; border: 1px solid rgba(74,222,128,0.22);
          }
          .strip-ldot { width: 5px; height: 5px; border-radius: 50%; background: #4ade80; animation: lp 1.8s ease-in-out infinite; }
          .img-badge {
            position: absolute; top: 14px; right: 14px; z-index: 4;
            background: rgba(8,16,36,0.72); backdrop-filter: blur(14px);
            border: 1px solid rgba(240,187,58,0.35); border-radius: 11px;
            padding: 8px 12px; text-align: center;
          }
          .img-badge-num { display: block; font-size: 1rem; font-weight: 800; color: var(--g1); line-height: 1; margin-bottom: 2px; }
          .img-badge-lbl { font-size: 0.55rem; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: 0.07em; }

          /* MARQUEE */
          .mq { background: linear-gradient(90deg,var(--g2) 0%,var(--g1) 50%,var(--g2) 100%); padding: 10px 0; overflow: hidden; }
          .mq-t { display: flex; animation: ms 24s linear infinite; white-space: nowrap; }
          @keyframes ms { from{transform:translateX(0);}to{transform:translateX(-50%);} }
          .mq-i { display: inline-flex; align-items: center; gap: 8px; padding: 0 22px; font-size: 0.7rem; font-weight: 700; color: var(--p1); border-right: 1px solid rgba(13,31,60,0.16); }

          /* WHAT IS */
          .what-is { padding: 64px 64px; background: linear-gradient(180deg, #112347 0%, #162d57 100%); }
          .what-container { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
          .what-content h2 { font-size: clamp(1.6rem, 2.4vw, 2.1rem); font-weight: 700; color: var(--w); margin-bottom: 12px; line-height: 1.2; }
          .what-content h2 span { color: var(--g1); }
          .what-content p { font-size: 0.86rem; color: var(--t2); line-height: 1.72; margin-bottom: 10px; }
          .what-content ul { list-style: none; padding: 0; margin: 16px 0 0; }
          .what-content ul li { font-size: 0.84rem; color: var(--t2); line-height: 1.6; margin-bottom: 8px; padding-left: 24px; position: relative; }
          .what-content ul li::before { content: '✓'; position: absolute; left: 0; color: var(--g1); font-weight: 700; }
          .what-image { position: relative; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4); cursor: pointer; transition: transform 0.3s ease; }
          .what-image:hover { transform: translateY(-6px); }
          .what-image img { width: 100%; height: auto; display: block; }

          /* COMPARISON */
          .comparison { padding: 64px; background: linear-gradient(180deg, #0d1f3c 0%, #112347 100%); }
          .comparison-container { max-width: 1100px; margin: 0 auto; }
          .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-top: 36px; }
          .comparison-image { position: relative; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4); cursor: pointer; transition: transform 0.3s ease; }
          .comparison-image:hover { transform: translateY(-6px); }
          .comparison-image img { width: 100%; height: auto; display: block; }
          .comparison-content h3 { font-size: 1.4rem; font-weight: 700; color: var(--w); margin-bottom: 16px; }
          .comparison-content h3 span { color: var(--g1); }
          .comparison-list { list-style: none; padding: 0; }
          .comparison-list li { font-size: 0.84rem; color: var(--t2); line-height: 1.65; margin-bottom: 12px; padding-left: 28px; position: relative; }
          .comparison-list li::before { content: '★'; position: absolute; left: 0; color: var(--g1); font-size: 1rem; }

          /* INVEST */
          .invest-info { padding: 64px; background: linear-gradient(135deg, #162d57 0%, #1a3060 100%); }
          .invest-container { max-width: 900px; margin: 0 auto; text-align: center; }
          .invest-container h2 { font-size: 1.8rem; font-weight: 700; color: var(--w); margin-bottom: 12px; }
          .invest-container h2 span { color: var(--g1); }
          .invest-container p { font-size: 0.86rem; color: var(--t2); line-height: 1.72; margin-bottom: 8px; }
          .info-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 32px; }
          .info-card { background: rgba(13,31,60,0.55); border: 1px solid rgba(42,78,158,0.3); border-radius: 12px; padding: 24px 18px; transition: all 0.3s; }
          .info-card:hover { background: rgba(13,31,60,0.75); border-color: rgba(240,187,58,0.35); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.2); }
          .info-card h4 { font-size: 0.95rem; font-weight: 600; color: var(--w); margin-bottom: 6px; }
          .info-card p { font-size: 0.78rem; color: var(--t2); line-height: 1.6; margin-bottom: 0; }

          /* SECTIONS */
          .sec { padding: 64px; }
          .s-dark { background: linear-gradient(180deg, #0d1f3c 0%, #112347 100%); }
          .s-lite { background: #f0f4ff; }
          .s-hd { text-align: center; margin-bottom: 40px; }
          .s-lbl { display: block; font-size: 0.68rem; font-weight: 600; color: var(--g1); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
          .s-lbl.dk { color: var(--p4); }
          .s-h { font-size: clamp(1.35rem,2.2vw,1.85rem); font-weight: 700; line-height: 1.25; color: var(--w); margin-bottom: 6px; }
          .s-h.dk { color: var(--p1); }
          .s-h span { color: var(--g1); }
          .s-h.dk span { color: var(--p4); }
          .s-p { font-size: 0.84rem; color: var(--t2); line-height: 1.65; }
          .s-p.dk { color: rgba(13,31,60,0.6); }

          /* FEATURES */
          .fg { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; max-width: 1100px; margin: 0 auto; background: var(--bp); border: 1px solid var(--bp); border-radius: 10px; overflow: hidden; }
          .fc { background: #112347; padding: 26px 20px; position: relative; overflow: hidden; transition: background 0.3s; }
          .fc::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--p4),var(--g2),var(--p4)); opacity:0; transition:opacity 0.3s; }
          .fc:hover { background: #1a3060; }
          .fc:hover::before { opacity: 1; }
          .fc-n { font-size:1.6rem; font-weight:700; color:rgba(42,78,158,0.12); line-height:1; margin-bottom:12px; display:block; }
          .fc-ico { width:36px; height:36px; border:1px solid var(--bg); border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:1rem; margin-bottom:10px; background:rgba(240,187,58,0.06); transition:all 0.3s; }
          .fc:hover .fc-ico { border-color:rgba(240,187,58,0.42); background:rgba(240,187,58,0.12); }
          .fc-t { font-size:0.84rem; font-weight:600; color:var(--w); margin-bottom:5px; }
          .fc-d { font-size:0.76rem; color:var(--t2); line-height:1.6; }

          /* HOW IT WORKS */
          .hw { background: linear-gradient(180deg, #112347 0%, #162d57 100%); padding: 64px; }
          .how-row { display: grid; grid-template-columns: repeat(5,1fr); gap: 0; max-width: 1100px; margin: 0 auto; position: relative; }
          .how-row::before { content:''; position:absolute; top:26px; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,var(--bg),var(--g1),var(--bg),transparent); z-index:0; }
          .hw-s { display:flex; flex-direction:column; align-items:center; text-align:center; padding:0 8px; position:relative; z-index:1; }
          .hw-c { width:50px; height:50px; border-radius:50%; background:#1a3060; border:2px solid var(--g2); display:flex; align-items:center; justify-content:center; font-size:1.2rem; margin-bottom:14px; box-shadow:0 0 0 4px #112347; transition:all 0.3s; }
          .hw-s:hover .hw-c { background:var(--g2); box-shadow:0 0 0 4px #112347,0 0 16px rgba(217,160,32,0.35); }
          .hw-t { font-size:0.8rem; font-weight:600; color:var(--w); margin-bottom:4px; line-height:1.3; }
          .hw-d { font-size:0.72rem; color:var(--t2); line-height:1.55; }

          /* STATS */
          .sg { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; max-width:920px; margin:0 auto; background:var(--bp); border:1px solid var(--bp); border-radius:10px; overflow:hidden; }
          .si { background:#112347; padding:32px 20px; text-align:center; transition:background 0.3s; }
          .si:hover { background:#1a3060; }
          .sv { font-size:1.8rem; font-weight:700; color:var(--g1); line-height:1; margin-bottom:6px; }
          .sl { font-size:0.72rem; color:var(--t2); }

          /* TESTIMONIALS */
          .tg { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; max-width:1050px; margin:0 auto; }
          .tc { background:#fff; border-radius:10px; padding:24px 20px; border:1px solid rgba(42,78,158,0.10); position:relative; overflow:hidden; transition:transform 0.3s,box-shadow 0.3s; }
          .tc::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--p4),var(--g2)); }
          .tc:hover { transform:translateY(-4px); box-shadow:0 14px 36px rgba(13,31,60,0.1); }
          .tc-q { font-size:2rem; font-weight:700; line-height:0.8; color:rgba(42,78,158,0.12); margin-bottom:8px; display:block; }
          .tc-t { font-size:0.81rem; line-height:1.7; color:rgba(13,31,60,0.68); margin-bottom:16px; }
          .tc-a { display:flex; align-items:center; gap:9px; }
          .tc-av { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--p4),var(--g2)); display:flex; align-items:center; justify-content:center; font-size:0.74rem; font-weight:600; color:#fff; }
          .tc-nm { font-size:0.78rem; font-weight:600; color:var(--p1); }
          .tc-ct { font-size:0.68rem; color:rgba(13,31,60,0.42); margin-top:1px; }
          .tc-st { color:var(--g2); font-size:0.65rem; letter-spacing:2px; margin-left:auto; }

          /* CTA */
          .cta { position:relative; padding:80px 64px; text-align:center; background:linear-gradient(135deg, #0d1f3c 0%, #112347 100%); overflow:hidden; }
          .cta-gl { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(42,78,158,0.28),transparent 70%); left:-50px; top:50%; transform:translateY(-50%); pointer-events:none; }
          .cta-gr { position:absolute; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(240,187,58,0.08),transparent 70%); right:-40px; top:50%; transform:translateY(-50%); pointer-events:none; }
          .cta-in { position:relative; z-index:2; max-width:480px; margin:0 auto; }
          .cta-div { display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:16px; }
          .cta-ln { width:48px; height:1px; background:linear-gradient(to right,transparent,rgba(240,187,58,0.4)); }
          .cta-ln.r { background:linear-gradient(to left,transparent,rgba(240,187,58,0.4)); }
          .cta-dm { width:5px; height:5px; background:var(--g1); transform:rotate(45deg); }
          .cta-h { font-size:clamp(1.4rem,2.6vw,2rem); font-weight:700; color:var(--w); line-height:1.2; margin-bottom:10px; }
          .cta-h span { color:var(--g1); }
          .cta-p { font-size:0.84rem; color:var(--t2); line-height:1.68; margin-bottom:28px; }
          .cta-bs { display:flex; justify-content:center; gap:10px; }

          /* MODAL */
          .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(4px); animation:fadeIn 0.3s ease; }
          .modal-content { position:relative; max-width:90vw; max-height:90vh; border-radius:16px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.8); animation:slideUp 0.4s ease; }
          .modal-content img { width:100%; height:100%; object-fit:contain; }
          .modal-close { position:absolute; top:16px; right:16px; width:38px; height:38px; border-radius:50%; background:rgba(0,0,0,0.6); border:none; color:white; font-size:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; z-index:1001; }
          .modal-close:hover { background:rgba(0,0,0,0.9); }
          @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
          @keyframes slideUp { from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;} }

          /* RESPONSIVE */
          @media (max-width: 960px) {
            .hero { grid-template-columns: 1fr; padding: 56px 32px 48px; gap: 40px; min-height: auto; }
            .img-card { max-width: 480px; transform: none; }
            .what-container, .comparison-grid { grid-template-columns: 1fr; gap: 28px; }
            .info-cards { grid-template-columns: 1fr; }
            .fg { grid-template-columns: 1fr 1fr; }
            .how-row { grid-template-columns: 1fr 1fr; gap: 20px; }
            .how-row::before { display: none; }
            .sg { grid-template-columns: 1fr 1fr; }
            .tg { grid-template-columns: 1fr; }
            .sec, .what-is, .comparison, .invest-info { padding: 48px 28px; }
            .hw { padding: 48px 28px; }
            .cta { padding: 56px 28px; }
          }
          @media (max-width: 560px) {
            .hero { padding: 40px 20px 36px; gap: 28px; }
            .h-title { font-size: 2rem; }
            .ptick { flex-wrap: wrap; }
            .pt-c { flex: 1; min-width: 84px; }
            
            /* Hero buttons - ensure full visibility */
            .h-btns { 
              display: flex !important;
              flex-direction: column !important; 
              width: 100% !important; 
              gap: 14px !important;
              margin-bottom: 24px !important;
              align-items: stretch !important;
            }
            
            .h-btns .btn-g, 
            .h-btns .btn-o { 
              display: flex !important;
              width: 100% !important; 
              justify-content: center !important;
              align-items: center !important;
              padding: 16px 24px !important;
              font-size: 0.88rem !important;
              font-weight: 700 !important;
              min-height: 52px !important;
              border-radius: 8px !important;
              text-decoration: none !important;
              cursor: pointer !important;
              visibility: visible !important;
              opacity: 1 !important;
              position: relative !important;
              z-index: 10 !important;
              box-sizing: border-box !important;
              -webkit-appearance: none !important;
              -moz-appearance: none !important;
              appearance: none !important;
            }
            
            .h-btns .btn-g {
              background: linear-gradient(135deg, var(--g1) 0%, var(--g2) 100%) !important;
              color: var(--p1) !important;
              border: none !important;
              box-shadow: 0 4px 18px rgba(217,160,32,0.32) !important;
            }
            
            .h-btns .btn-o {
              background: rgba(255,255,255,0.07) !important;
              color: var(--t2) !important;
              border: 1px solid rgba(255,255,255,0.18) !important;
            }
            
            .fg { grid-template-columns: 1fr; }
            .how-row { grid-template-columns: 1fr; }
            .sec, .what-is, .comparison, .invest-info { padding: 36px 18px; }
            .hw { padding: 36px 18px; }
            .cta { padding: 44px 18px; }
            
            /* CTA buttons - ensure full visibility */
            .cta-bs { 
              display: flex !important;
              flex-direction: column !important; 
              width: 100% !important;
              gap: 14px !important;
              align-items: stretch !important;
            }
            
            .cta-bs .btn-g,
            .cta-bs .btn-o {
              display: flex !important;
              width: 100% !important;
              justify-content: center !important;
              align-items: center !important;
              padding: 16px 24px !important;
              font-size: 0.88rem !important;
              font-weight: 700 !important;
              min-height: 52px !important;
              border-radius: 8px !important;
              text-decoration: none !important;
              cursor: pointer !important;
              visibility: visible !important;
              opacity: 1 !important;
              position: relative !important;
              z-index: 10 !important;
              box-sizing: border-box !important;
              -webkit-appearance: none !important;
              -moz-appearance: none !important;
              appearance: none !important;
            }
            
            .cta-bs .btn-g {
              background: linear-gradient(135deg, var(--g1) 0%, var(--g2) 100%) !important;
              color: var(--p1) !important;
              border: none !important;
              box-shadow: 0 4px 18px rgba(217,160,32,0.32) !important;
            }
            
            .cta-bs .btn-o {
              background: rgba(255,255,255,0.07) !important;
              color: var(--t2) !important;
              border: 1px solid rgba(255,255,255,0.18) !important;
            }
          }
        `}</style>

        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <div className="h-tag"><span className="h-tdot" />India's Premier Digital Gold Platform</div>
            <h1 className="h-title">
              Buy{' '}
              <span>{"Digital Gold".split('').map((char, i) => <span key={i} className="title-char" style={{ animationDelay: `${i * 0.05}s` }}>{char}</span>)}</span>
              <br />Starting from ₹<span>{"100".split('').map((char, i) => <span key={`n-${i}`} className="title-char" style={{ animationDelay: `${13 * 0.05 + i * 0.05}s` }}>{char}</span>)}</span>
            </h1>
            <p className="h-desc">999.9 certified purity · Insured vault storage · Live market rates</p>
            <div className="ptick">
              <div className="pt-c">
                <span className="pt-l">24K Gold / gram</span>
                <span className="pt-v">₹{goldRate?.toFixed(2)}</span>
              </div>
              <div className="pt-c">
                <span className="pt-l">Purity</span>
                <span className="pt-s">999.9 Pure</span>
              </div>
              <div className="pt-c">
                <span className="pt-l">Market</span>
                <div className="pt-live"><div className="ldot" />Live</div>
              </div>
            </div>
            <div className="h-btns">
              <button className="btn-g" onClick={handleBuyGoldClick}>
                Buy Digital Gold
                <svg width="13" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn-o" onClick={() => navigate('/how-it-works')}>How It Works</button>
            </div>
          </div>
          <div className="hero-right">
            <div className="img-glow" />
            <div className="img-card" onClick={() => openImageModal('https://assets.gadgets360cdn.com/img/gold/digital-gold-og-image.png')}>
              <img src="https://assets.gadgets360cdn.com/img/gold/digital-gold-og-image.png" alt="Digital Gold Investment" />
              <div className="img-strip">
                <div>
                  <div className="img-strip-val">₹{goldRate?.toFixed(2)}</div>
                  <div className="img-strip-lbl">24K Gold · per gram</div>
                </div>
                <div className="img-live-pill"><span className="strip-ldot" />Live Market</div>
              </div>
              <div className="img-badge">
                <span className="img-badge-num">24K</span>
                <span className="img-badge-lbl">999 Pure</span>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="mq">
          <div className="mq-t">
            {[...Array(2)].map((_, r) =>
              ['999 Pure Gold', 'Instant Buy & Sell', 'Insured Vaults', 'Start from ₹100', 'BIS Certified', 'Live Market Prices', '24/7 Access', 'Zero Storage Fees'].map((t, i) => (
                <div className="mq-i" key={`${r}-${i}`}>★ {t}</div>
              ))
            )}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="hw">
          <div className="s-hd">
            <span id="hwl" className="obs s-lbl" style={rv('hwl')}>How It Works</span>
            <div id="hwh" className="obs" style={rv('hwh', 0.07)}>
              <h2 className="s-h">Buy gold in <span>5 simple steps</span></h2>
              <p className="s-p">From live price to vault — takes just minutes.</p>
            </div>
          </div>
          <div className="how-row">
            {[
              { n:1, ic:'📈', t:'Check Price',    d:'Live 24K rate, updated every minute' },
              { n:2, ic:'💰', t:'Enter Amount',   d:'Rupees or grams, from ₹100' },
              { n:3, ic:'🔒', t:'Pay Securely',   d:'UPI, card or net banking' },
              { n:4, ic:'🏦', t:'Gold in Vault',  d:'Stored in certified insured vaults' },
              { n:5, ic:'📊', t:'Sell Anytime',   d:'Live rates, same-day bank credit' },
            ].map((s, i) => (
              <div key={s.n} id={`hs${s.n}`} className="obs hw-s" style={rv(`hs${s.n}`, i * 0.09)}>
                <div className="hw-c">{s.ic}</div>
                <div className="hw-t">{s.t}</div>
                <div className="hw-d">{s.d}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:36 }}>
            <button className="btn-g" onClick={handleBuyGoldClick}>
              Buy Digital Gold
              <svg width="13" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </section>

        {/* WHAT IS DIGITAL GOLD */}
        <section className="what-is">
          <div className="what-container">
            <div id="wc" className="obs what-content" style={rv('wc')}>
              <h2>What is <span>Digital Gold?</span></h2>
              <p>Buy real 24K gold online — no physical storage needed. Your gold is held in insured vaults and you can sell anytime.</p>
              <ul>
                <li><strong>Real Gold:</strong> Backed by physical 24K gold.</li>
                <li><strong>Start Small:</strong> Invest from just ₹100.</li>
                <li><strong>Fully Insured:</strong> Stored safely in certified vaults.</li>
                <li><strong>Instant Sell:</strong> Cash in your bank the same day.</li>
              </ul>
            </div>
            <div id="wi" className="obs what-image" style={rv('wi', 0.2)} onClick={() => openImageModal('https://d1fow5xdcuw86u.cloudfront.net/assets/blog/Digital_Gold_A_071020251243279663034.webp')}>
              <img src="https://d1fow5xdcuw86u.cloudfront.net/assets/blog/Digital_Gold_A_071020251243279663034.webp" alt="What is Digital Gold" />
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="comparison">
          <div className="comparison-container">
            <div className="s-hd">
              <span id="csl" className="obs s-lbl" style={rv('csl')}>Digital vs Traditional</span>
              <div id="csh" className="obs" style={rv('csh', 0.07)}>
                <h2 className="s-h">Why <span>Digital Gold</span> wins</h2>
                <p className="s-p">No making charges. No storage hassle. No minimum order.</p>
              </div>
            </div>
            <div className="comparison-grid">
              <div id="ci" className="obs comparison-image" style={rv('ci')} onClick={() => openImageModal('https://www.paisabazaar.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2018/09/Digital-gold-outsorced-traditional-gold.jpg.webp')}>
                <img src="https://www.paisabazaar.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2018/09/Digital-gold-outsorced-traditional-gold.jpg.webp" alt="Digital vs Traditional Gold" />
              </div>
              <div id="cc" className="obs comparison-content" style={rv('cc', 0.2)}>
                <h3>Advantages of <span>Digital Gold</span></h3>
                <ul className="comparison-list">
                  <li><strong>No Storage Worries</strong> — certified vaults, 24/7 security</li>
                  <li><strong>Start from ₹100</strong> — no large upfront commitment</li>
                  <li><strong>Zero Making Charges</strong> — pay only live market rate</li>
                  <li><strong>999.9 Purity</strong> — BIS certified, guaranteed</li>
                  <li><strong>Instant Liquidity</strong> — sell anytime, same-day cash</li>
                  <li><strong>24/7 Access</strong> — buy or sell from your phone</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* INVEST INFO */}
        <section className="invest-info">
          <div id="ic" className="obs invest-container" style={rv('ic')}>
            <h2>Is <span>Digital Gold</span> a good investment?</h2>
            <p>Low cost, high liquidity, and a natural inflation hedge — starting from just ₹100.</p>
            <div className="info-cards">
              <div id="ica1" className="obs info-card" style={rv('ica1', 0.1)}>
                <h4>Low Entry</h4>
                <p>Start from ₹100. Build wealth at your own pace.</p>
              </div>
              <div id="ica2" className="obs info-card" style={rv('ica2', 0.2)}>
                <h4>High Liquidity</h4>
                <p>Sell anytime. Money in your bank within 24 hours.</p>
              </div>
              <div id="ica3" className="obs info-card" style={rv('ica3', 0.3)}>
                <h4>Inflation Hedge</h4>
                <p>Gold holds value when currency doesn't.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="sec s-dark">
          <div className="s-hd">
            <span id="fl" className="obs s-lbl" style={rv('fl')}>Why Choose Us</span>
            <div id="fh" className="obs" style={rv('fh', 0.07)}>
              <h2 className="s-h">Everything you need to <span>own gold</span></h2>
              <p className="s-p">No locker. No worries. Buy, track and sell from your phone.</p>
            </div>
          </div>
          <div className="fg">
            {[
              { n:'01', ic:'🔐', t:'Insured Vaults',      d:'Certified, bank-grade vaults with 24/7 monitoring.', id:'fc1' },
              { n:'02', ic:'✦',  t:'999.9 Pure Gold',     d:'BIS-certified 24K. Purity guaranteed every gram.', id:'fc2' },
              { n:'03', ic:'⚡', t:'Instant Buy & Sell',  d:'Trade at live rates anytime. Same-day bank credit.', id:'fc3' },
              { n:'04', ic:'📊', t:'Track Portfolio',     d:'Real-time value, price alerts, full history.', id:'fc4' },
            ].map((c, i) => (
              <div key={c.id} id={c.id} className="obs fc" style={rv(c.id, i * 0.07)}>
                <span className="fc-n">{c.n}</span>
                <div className="fc-ico">{c.ic}</div>
                <h3 className="fc-t">{c.t}</h3>
                <p className="fc-d">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="sec s-dark" style={{ padding:'52px 64px' }}>
          <div className="sg">
            {[
              { v:'₹100',  l:'Minimum Purchase', id:'s0' },
              { v:'999.9', l:'Gold Purity',       id:'s1' },
              { v:'100%',  l:'Insured Assets',    id:'s2' },
              { v:'24/7',  l:'Market Access',     id:'s3' },
            ].map((s, i) => (
              <div key={s.id} id={s.id} className="obs si" style={rv(s.id, i * 0.09)}>
                <div className="sv">{s.v}</div>
                <div className="sl">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sec s-lite">
          <div className="s-hd" style={{ marginBottom:32 }}>
            <span id="tl" className="obs s-lbl dk" style={rv('tl')}>Customer Reviews</span>
            <div id="th" className="obs" style={rv('th', 0.07)}>
              <h2 className="s-h dk">Trusted by thousands <span>across India</span></h2>
            </div>
          </div>
          <div className="tg">
            {[
              { q:'Started with ₹500 and now have a solid gold portfolio. Purity guarantee and instant sell are unmatched.', nm:'Hari Babu', ct:'Mumbai', av:'H' },
              { q:'KYC took 90 seconds and I bought my first gram the same evening. Seamless experience.', nm:'Rahul Verma', ct:'Bangalore', av:'R' },
              { q:'Feels premium. Live price tracker and same-day withdrawal make it a no-brainer.', nm:'Ananya Patel', ct:'Hyderabad', av:'A' },
            ].map((t, i) => (
              <div key={i} id={`tc${i}`} className="obs tc" style={rv(`tc${i}`, i * 0.09)}>
                <span className="tc-q">"</span>
                <p className="tc-t">{t.q}</p>
                <div className="tc-a">
                  <div className="tc-av">{t.av}</div>
                  <div>
                    <div className="tc-nm">{t.nm}</div>
                    <div className="tc-ct">{t.ct}</div>
                  </div>
                  <div className="tc-st">★★★★★</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="cta-gl" /><div className="cta-gr" />
          <div id="cta" className="obs cta-in" style={rv('cta')}>
            <div className="cta-div">
              <div className="cta-ln" /><div className="cta-dm" /><div className="cta-ln r" />
            </div>
            <h2 className="cta-h">Start buying <span>Digital Gold</span> today</h2>
            <p className="cta-p">From ₹100. No lock-in. No hidden fees. Sell anytime.</p>
            <div className="cta-bs">
              <button className="btn-g" onClick={handleBuyGoldClick}>
                Buy Digital Gold
                <svg width="13" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn-o" onClick={() => navigate('/how-it-works')}>Learn More</button>
            </div>
          </div>
        </section>

        {/* IMAGE MODAL */}
        {showImageModal && (
          <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img src={modalImage} alt="Digital Gold" />
              <button className="modal-close" onClick={() => setShowImageModal(false)}>×</button>
            </div>
          </div>
        )}
      </>
    );
  };

  export default Landing;