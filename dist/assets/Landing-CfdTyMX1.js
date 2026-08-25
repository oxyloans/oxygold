import{u as j,a as y,r as n,j as e}from"./index-Bti0KOuG.js";const N=()=>{const l=j(),{buyPrice:m}=y(),r=m,[g,h]=n.useState({}),[x,d]=n.useState(!1),[b,f]=n.useState(""),[u,v]=n.useState(null);n.useEffect(()=>{const t=localStorage.getItem("user");v(t?JSON.parse(t):null);const i=new IntersectionObserver(s=>s.forEach(o=>{o.isIntersecting&&h(w=>({...w,[o.target.id]:!0}))}),{threshold:.08});return document.querySelectorAll(".obs").forEach(s=>i.observe(s)),()=>i.disconnect()},[]);const c=()=>{if(!u){window.location.href="/login";return}l("/buy-gold")},p=t=>{f(t),d(!0)},a=(t,i=0)=>({opacity:g[t]?1:0,transform:g[t]?"translateY(0)":"translateY(20px)",transition:`opacity 0.6s ease ${i}s, transform 0.6s ease ${i}s`});return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
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
        `}),e.jsxs("section",{className:"hero",children:[e.jsxs("div",{className:"hero-left",children:[e.jsxs("div",{className:"h-tag",children:[e.jsx("span",{className:"h-tdot"}),"India's Premier Digital Gold Platform"]}),e.jsxs("h1",{className:"h-title",children:["Buy"," ",e.jsx("span",{children:"Digital Gold".split("").map((t,i)=>e.jsx("span",{className:"title-char",style:{animationDelay:`${i*.05}s`},children:t},i))}),e.jsx("br",{}),"Starting from ₹",e.jsx("span",{children:"100".split("").map((t,i)=>e.jsx("span",{className:"title-char",style:{animationDelay:`${13*.05+i*.05}s`},children:t},`n-${i}`))})]}),e.jsx("p",{className:"h-desc",children:"999.9 certified purity · Insured vault storage · Live market rates"}),e.jsxs("div",{className:"ptick",children:[e.jsxs("div",{className:"pt-c",children:[e.jsx("span",{className:"pt-l",children:"24K Gold / gram"}),e.jsxs("span",{className:"pt-v",children:["₹",r==null?void 0:r.toFixed(2)]})]}),e.jsxs("div",{className:"pt-c",children:[e.jsx("span",{className:"pt-l",children:"Purity"}),e.jsx("span",{className:"pt-s",children:"999.9 Pure"})]}),e.jsxs("div",{className:"pt-c",children:[e.jsx("span",{className:"pt-l",children:"Market"}),e.jsxs("div",{className:"pt-live",children:[e.jsx("div",{className:"ldot"}),"Live"]})]})]}),e.jsxs("div",{className:"h-btns",children:[e.jsxs("button",{className:"btn-g",onClick:c,children:["Buy Digital Gold",e.jsx("svg",{width:"13",height:"10",viewBox:"0 0 14 10",fill:"none",children:e.jsx("path",{d:"M1 5h12M8 1l4 4-4 4",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]}),e.jsx("button",{className:"btn-o",onClick:()=>l("/how-it-works"),children:"How It Works"})]})]}),e.jsxs("div",{className:"hero-right",children:[e.jsx("div",{className:"img-glow"}),e.jsxs("div",{className:"img-card",onClick:()=>p("https://assets.gadgets360cdn.com/img/gold/digital-gold-og-image.png"),children:[e.jsx("img",{src:"https://assets.gadgets360cdn.com/img/gold/digital-gold-og-image.png",alt:"Digital Gold Investment"}),e.jsxs("div",{className:"img-strip",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"img-strip-val",children:["₹",r==null?void 0:r.toFixed(2)]}),e.jsx("div",{className:"img-strip-lbl",children:"24K Gold · per gram"})]}),e.jsxs("div",{className:"img-live-pill",children:[e.jsx("span",{className:"strip-ldot"}),"Live Market"]})]}),e.jsxs("div",{className:"img-badge",children:[e.jsx("span",{className:"img-badge-num",children:"24K"}),e.jsx("span",{className:"img-badge-lbl",children:"999 Pure"})]})]})]})]}),e.jsx("div",{className:"mq",children:e.jsx("div",{className:"mq-t",children:[...Array(2)].map((t,i)=>["999 Pure Gold","Instant Buy & Sell","Insured Vaults","Start from ₹100","BIS Certified","Live Market Prices","24/7 Access","Zero Storage Fees"].map((s,o)=>e.jsxs("div",{className:"mq-i",children:["★ ",s]},`${i}-${o}`)))})}),e.jsxs("section",{className:"hw",children:[e.jsxs("div",{className:"s-hd",children:[e.jsx("span",{id:"hwl",className:"obs s-lbl",style:a("hwl"),children:"How It Works"}),e.jsxs("div",{id:"hwh",className:"obs",style:a("hwh",.07),children:[e.jsxs("h2",{className:"s-h",children:["Buy gold in ",e.jsx("span",{children:"5 simple steps"})]}),e.jsx("p",{className:"s-p",children:"From live price to vault — takes just minutes."})]})]}),e.jsx("div",{className:"how-row",children:[{n:1,ic:"📈",t:"Check Price",d:"Live 24K rate, updated every minute"},{n:2,ic:"💰",t:"Enter Amount",d:"Rupees or grams, from ₹100"},{n:3,ic:"🔒",t:"Pay Securely",d:"UPI, card or net banking"},{n:4,ic:"🏦",t:"Gold in Vault",d:"Stored in certified insured vaults"},{n:5,ic:"📊",t:"Sell Anytime",d:"Live rates, same-day bank credit"}].map((t,i)=>e.jsxs("div",{id:`hs${t.n}`,className:"obs hw-s",style:a(`hs${t.n}`,i*.09),children:[e.jsx("div",{className:"hw-c",children:t.ic}),e.jsx("div",{className:"hw-t",children:t.t}),e.jsx("div",{className:"hw-d",children:t.d})]},t.n))}),e.jsx("div",{style:{textAlign:"center",marginTop:36},children:e.jsxs("button",{className:"btn-g",onClick:c,children:["Buy Digital Gold",e.jsx("svg",{width:"13",height:"10",viewBox:"0 0 14 10",fill:"none",children:e.jsx("path",{d:"M1 5h12M8 1l4 4-4 4",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]})})]}),e.jsx("section",{className:"what-is",children:e.jsxs("div",{className:"what-container",children:[e.jsxs("div",{id:"wc",className:"obs what-content",style:a("wc"),children:[e.jsxs("h2",{children:["What is ",e.jsx("span",{children:"Digital Gold?"})]}),e.jsx("p",{children:"Buy real 24K gold online — no physical storage needed. Your gold is held in insured vaults and you can sell anytime."}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Real Gold:"})," Backed by physical 24K gold."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Start Small:"})," Invest from just ₹100."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Fully Insured:"})," Stored safely in certified vaults."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Instant Sell:"})," Cash in your bank the same day."]})]})]}),e.jsx("div",{id:"wi",className:"obs what-image",style:a("wi",.2),onClick:()=>p("https://d1fow5xdcuw86u.cloudfront.net/assets/blog/Digital_Gold_A_071020251243279663034.webp"),children:e.jsx("img",{src:"https://d1fow5xdcuw86u.cloudfront.net/assets/blog/Digital_Gold_A_071020251243279663034.webp",alt:"What is Digital Gold"})})]})}),e.jsx("section",{className:"comparison",children:e.jsxs("div",{className:"comparison-container",children:[e.jsxs("div",{className:"s-hd",children:[e.jsx("span",{id:"csl",className:"obs s-lbl",style:a("csl"),children:"Digital vs Traditional"}),e.jsxs("div",{id:"csh",className:"obs",style:a("csh",.07),children:[e.jsxs("h2",{className:"s-h",children:["Why ",e.jsx("span",{children:"Digital Gold"})," wins"]}),e.jsx("p",{className:"s-p",children:"No making charges. No storage hassle. No minimum order."})]})]}),e.jsxs("div",{className:"comparison-grid",children:[e.jsx("div",{id:"ci",className:"obs comparison-image",style:a("ci"),onClick:()=>p("https://www.paisabazaar.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2018/09/Digital-gold-outsorced-traditional-gold.jpg.webp"),children:e.jsx("img",{src:"https://www.paisabazaar.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2018/09/Digital-gold-outsorced-traditional-gold.jpg.webp",alt:"Digital vs Traditional Gold"})}),e.jsxs("div",{id:"cc",className:"obs comparison-content",style:a("cc",.2),children:[e.jsxs("h3",{children:["Advantages of ",e.jsx("span",{children:"Digital Gold"})]}),e.jsxs("ul",{className:"comparison-list",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"No Storage Worries"})," — certified vaults, 24/7 security"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Start from ₹100"})," — no large upfront commitment"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Zero Making Charges"})," — pay only live market rate"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"999.9 Purity"})," — BIS certified, guaranteed"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Instant Liquidity"})," — sell anytime, same-day cash"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"24/7 Access"})," — buy or sell from your phone"]})]})]})]})]})}),e.jsx("section",{className:"invest-info",children:e.jsxs("div",{id:"ic",className:"obs invest-container",style:a("ic"),children:[e.jsxs("h2",{children:["Is ",e.jsx("span",{children:"Digital Gold"})," a good investment?"]}),e.jsx("p",{children:"Low cost, high liquidity, and a natural inflation hedge — starting from just ₹100."}),e.jsxs("div",{className:"info-cards",children:[e.jsxs("div",{id:"ica1",className:"obs info-card",style:a("ica1",.1),children:[e.jsx("h4",{children:"Low Entry"}),e.jsx("p",{children:"Start from ₹100. Build wealth at your own pace."})]}),e.jsxs("div",{id:"ica2",className:"obs info-card",style:a("ica2",.2),children:[e.jsx("h4",{children:"High Liquidity"}),e.jsx("p",{children:"Sell anytime. Money in your bank within 24 hours."})]}),e.jsxs("div",{id:"ica3",className:"obs info-card",style:a("ica3",.3),children:[e.jsx("h4",{children:"Inflation Hedge"}),e.jsx("p",{children:"Gold holds value when currency doesn't."})]})]})]})}),e.jsxs("section",{className:"sec s-dark",children:[e.jsxs("div",{className:"s-hd",children:[e.jsx("span",{id:"fl",className:"obs s-lbl",style:a("fl"),children:"Why Choose Us"}),e.jsxs("div",{id:"fh",className:"obs",style:a("fh",.07),children:[e.jsxs("h2",{className:"s-h",children:["Everything you need to ",e.jsx("span",{children:"own gold"})]}),e.jsx("p",{className:"s-p",children:"No locker. No worries. Buy, track and sell from your phone."})]})]}),e.jsx("div",{className:"fg",children:[{n:"01",ic:"🔐",t:"Insured Vaults",d:"Certified, bank-grade vaults with 24/7 monitoring.",id:"fc1"},{n:"02",ic:"✦",t:"999.9 Pure Gold",d:"BIS-certified 24K. Purity guaranteed every gram.",id:"fc2"},{n:"03",ic:"⚡",t:"Instant Buy & Sell",d:"Trade at live rates anytime. Same-day bank credit.",id:"fc3"},{n:"04",ic:"📊",t:"Track Portfolio",d:"Real-time value, price alerts, full history.",id:"fc4"}].map((t,i)=>e.jsxs("div",{id:t.id,className:"obs fc",style:a(t.id,i*.07),children:[e.jsx("span",{className:"fc-n",children:t.n}),e.jsx("div",{className:"fc-ico",children:t.ic}),e.jsx("h3",{className:"fc-t",children:t.t}),e.jsx("p",{className:"fc-d",children:t.d})]},t.id))})]}),e.jsx("section",{className:"sec s-dark",style:{padding:"52px 64px"},children:e.jsx("div",{className:"sg",children:[{v:"₹100",l:"Minimum Purchase",id:"s0"},{v:"999.9",l:"Gold Purity",id:"s1"},{v:"100%",l:"Insured Assets",id:"s2"},{v:"24/7",l:"Market Access",id:"s3"}].map((t,i)=>e.jsxs("div",{id:t.id,className:"obs si",style:a(t.id,i*.09),children:[e.jsx("div",{className:"sv",children:t.v}),e.jsx("div",{className:"sl",children:t.l})]},t.id))})}),e.jsxs("section",{className:"sec s-lite",children:[e.jsxs("div",{className:"s-hd",style:{marginBottom:32},children:[e.jsx("span",{id:"tl",className:"obs s-lbl dk",style:a("tl"),children:"Customer Reviews"}),e.jsx("div",{id:"th",className:"obs",style:a("th",.07),children:e.jsxs("h2",{className:"s-h dk",children:["Trusted by thousands ",e.jsx("span",{children:"across India"})]})})]}),e.jsx("div",{className:"tg",children:[{q:"Started with ₹500 and now have a solid gold portfolio. Purity guarantee and instant sell are unmatched.",nm:"Hari Babu",ct:"Mumbai",av:"H"},{q:"KYC took 90 seconds and I bought my first gram the same evening. Seamless experience.",nm:"Rahul Verma",ct:"Bangalore",av:"R"},{q:"Feels premium. Live price tracker and same-day withdrawal make it a no-brainer.",nm:"Ananya Patel",ct:"Hyderabad",av:"A"}].map((t,i)=>e.jsxs("div",{id:`tc${i}`,className:"obs tc",style:a(`tc${i}`,i*.09),children:[e.jsx("span",{className:"tc-q",children:'"'}),e.jsx("p",{className:"tc-t",children:t.q}),e.jsxs("div",{className:"tc-a",children:[e.jsx("div",{className:"tc-av",children:t.av}),e.jsxs("div",{children:[e.jsx("div",{className:"tc-nm",children:t.nm}),e.jsx("div",{className:"tc-ct",children:t.ct})]}),e.jsx("div",{className:"tc-st",children:"★★★★★"})]})]},i))})]}),e.jsxs("section",{className:"cta",children:[e.jsx("div",{className:"cta-gl"}),e.jsx("div",{className:"cta-gr"}),e.jsxs("div",{id:"cta",className:"obs cta-in",style:a("cta"),children:[e.jsxs("div",{className:"cta-div",children:[e.jsx("div",{className:"cta-ln"}),e.jsx("div",{className:"cta-dm"}),e.jsx("div",{className:"cta-ln r"})]}),e.jsxs("h2",{className:"cta-h",children:["Start buying ",e.jsx("span",{children:"Digital Gold"})," today"]}),e.jsx("p",{className:"cta-p",children:"From ₹100. No lock-in. No hidden fees. Sell anytime."}),e.jsxs("div",{className:"cta-bs",children:[e.jsxs("button",{className:"btn-g",onClick:c,children:["Buy Digital Gold",e.jsx("svg",{width:"13",height:"10",viewBox:"0 0 14 10",fill:"none",children:e.jsx("path",{d:"M1 5h12M8 1l4 4-4 4",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]}),e.jsx("button",{className:"btn-o",onClick:()=>l("/how-it-works"),children:"Learn More"})]})]})]}),x&&e.jsx("div",{className:"modal-overlay",onClick:()=>d(!1),children:e.jsxs("div",{className:"modal-content",onClick:t=>t.stopPropagation(),children:[e.jsx("img",{src:b,alt:"Digital Gold"}),e.jsx("button",{className:"modal-close",onClick:()=>d(!1),children:"×"})]})})]})};export{N as default};
