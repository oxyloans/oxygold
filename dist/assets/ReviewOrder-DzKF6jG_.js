import{u,b as j,a as k,r as s,j as r}from"./index-Bti0KOuG.js";const F=()=>{const o=u(),e=j().state,{buyPrice:w}=k(),[a,m]=s.useState((e==null?void 0:e.timeLeft)??300),[v,y]=s.useState(!1),[z,P]=s.useState(!1),[t,c]=s.useState(!1);if(!e)return o("/buy-gold"),null;s.useEffect(()=>{if(a<=0){c(!0);return}const i=setInterval(()=>{m(d=>{const b=Math.max(0,d-1);return b===0&&c(!0),b})},1e3);return()=>clearInterval(i)},[a]);const n=i=>{const d=parseFloat(i);return isNaN(d)?0:d},p=i=>`${Math.floor(i/60)}:${(i%60).toString().padStart(2,"0")}`,f=a<=60,x=a/300*100,l=e.goldRate,g=()=>{if(t){alert("Price has expired. Redirecting to fetch new price..."),o("/buy-gold");return}o("/payment-method",{state:{...e,timeLeft:a,goldRate:l,lockedTime:e.lockedTime}})},h=()=>{o("/buy-gold")};return r.jsxs(r.Fragment,{children:[r.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ro-page {
          min-height: 100vh;
          background: #f8f6fb;
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
        }

        .ro-topbar {
          background: rgba(26, 48, 120, 0.96);
          border-bottom: 1px solid rgba(132, 128, 6, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px 56px;
        }
        .ro-topbar-in {
          max-width: 1000px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; gap: 12px;
        }
        .ro-back {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: rgba(240,187,58,0.08); border: 1px solid rgba(240,187,58,0.28);
          border-radius: 7px; cursor: pointer;
          color: rgba(255,255,255,0.8); font-size: 0.9rem; flex-shrink: 0;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .ro-back:hover { 
          background: rgba(240,187,58,0.12); 
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
        }
        .ro-topbar-sep { width: 1px; height: 14px; background: rgba(240,187,58,0.18); flex-shrink: 0; }
        .ro-topbar-title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .ro-topbar-sub { font-size: 0.78rem; color: rgba(255,255,255,0.58); }

        .ro-main {
          max-width: 760px; margin: 0 auto;
          padding: 28px 48px 56px;
        }

        .ro-timer {
          border-radius: 8px; padding: 12px 16px;
          margin-bottom: 20px;
          border: 1px solid;
        }
        .ro-timer.ok { background: #ffffff; border-color: #e8e0f0; }
        .ro-timer.urgent { background: #fffbeb; border-color: rgba(217,119,6,0.28); }
        .ro-timer.expired { background: #fef2f2; border-color: rgba(220,38,38,0.28); }
        .ro-timer-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 8px;
        }
        .ro-timer-txt { font-size: 0.8rem; font-weight: 500; }
        .ro-timer-txt.ok { color: #7c3aed; }
        .ro-timer-txt.urgent { color: #d97706; }
        .ro-timer-txt.expired { color: #dc2626; }
        .ro-timer-pill {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
          padding: 2px 10px; border-radius: 20px;
        }
        .ro-timer-pill.ok { background: rgba(124,58,237,0.1); color: #7c3aed; }
        .ro-timer-pill.urgent { background: rgba(217,119,6,0.1); color: #d97706; }
        .ro-timer-pill.expired { background: rgba(220,38,38,0.1); color: #dc2626; }
        .ro-timer-bar-wrap { height: 3px; background: rgba(0,0,0,0.06); border-radius: 99px; }
        .ro-timer-bar { height: 100%; border-radius: 99px; transition: width 1s linear; }
        .ro-timer-bar.ok { background: #7c3aed; }
        .ro-timer-bar.urgent { background: #d97706; }
        .ro-timer-bar.expired { background: #dc2626; }

        .ro-card {
          background: #ffffff;
          border: 1px solid #ede8f5;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .ro-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #7c3aed, #d9a020, #f0bb3a);
          opacity: 0.5;
        }

        .ro-warn-strip {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 20px;
          background: #fffbeb;
          border-bottom: 1px solid rgba(217,119,6,0.15);
          font-size: 0.72rem; color: #d97706; line-height: 1.55;
        }

        .ro-content {
          padding: 22px 20px;
        }

        .ro-sec-title {
          font-size: 0.84rem; font-weight: 600;
          color: #1a1a2e; margin-bottom: 16px;
        }

        .ro-detail {
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0; border-bottom: 1px solid #f5f0fc;
        }
        .ro-detail:last-of-type { border-bottom: none; }
        .ro-d-lbl { font-size: 0.76rem; color: #999; font-weight: 500; }
        .ro-d-val { font-size: 0.78rem; font-weight: 600; color: #1a1a2e; }
        .ro-d-val.gold { color: #b8860b; }

        .ro-total-box {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px; margin-top: 14px;
          background: #faf8ff;
          border: 1px solid #ede8f5; border-radius: 7px;
        }
        .ro-total-lbl { font-size: 0.84rem; font-weight: 600; color: #1a1a2e; }
        .ro-total-val { font-size: 1.1rem; font-weight: 700; color: #b8860b; }

        .ro-divider { height: 1px; background: #f0eaf8; margin: 0 20px; }

        .ro-bottom {
          padding: 18px 20px 20px;
          background: #faf8ff;
          border-top: 1px solid #f0eaf8;
        }

        .ro-terms-label {
          display: flex; align-items: flex-start; gap: 8px;
          cursor: pointer; margin-bottom: 4px;
        }
        .ro-checkbox {
          width: 15px; height: 15px; margin-top: 2px;
          accent-color: #d9a020; cursor: pointer; flex-shrink: 0;
        }
        .ro-terms-txt { font-size: 0.78rem; color: #888; line-height: 1.5; }
        .ro-terms-err { font-size: 0.72rem; color: #dc2626; font-weight: 500; margin-top: 4px; }

        .ro-btn-group {
          display: flex; gap: 10px; margin-top: 14px;
        }
        .ro-btn {
          flex: 1; padding: 11px 16px;
          border: none; border-radius: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem; font-weight: 700; cursor: pointer;
          transition: box-shadow 0.18s, filter 0.18s;
          letter-spacing: 0.01em;
        }
        .ro-btn-confirm {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #1a0d05;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .ro-btn-confirm:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
        }
        .ro-btn-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ro-btn-cancel {
          background: #f5f0fc;
          color: #3d2470;
          border: 1px solid #e0d8f0;
        }
        .ro-btn-cancel:hover {
          border-color: #9b72cf;
          background: #faf8ff;
        }
        .ro-btn-refresh {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          box-shadow: 0 3px 12px rgba(124,58,237,0.22);
        }
        .ro-btn-refresh:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 18px rgba(124,58,237,0.32);
        }

        @media (max-width: 768px) {
          .ro-main { padding: 20px 24px 40px; }
          .ro-btn-group { flex-direction: column; }
        }
      `}),r.jsxs("div",{className:"ro-page",children:[r.jsx("section",{className:"ro-topbar",children:r.jsxs("div",{className:"ro-topbar-in",children:[r.jsx("button",{className:"ro-back",onClick:()=>o(-1),children:"←"}),r.jsx("span",{className:"ro-topbar-sep"}),r.jsx("span",{className:"ro-topbar-title",children:"Review Order"}),r.jsx("span",{className:"ro-topbar-sep"}),r.jsx("span",{className:"ro-topbar-sub",children:"Confirm your purchase details"})]})}),r.jsxs("main",{className:"ro-main",children:[t&&r.jsxs("div",{className:"ro-timer expired",children:[r.jsxs("div",{className:"ro-timer-row",children:[r.jsx("span",{className:"ro-timer-txt expired",children:"⚠️ Price Expired"}),r.jsx("span",{className:"ro-timer-pill expired",children:"EXPIRED"})]}),r.jsx("div",{className:"ro-timer-bar-wrap",children:r.jsx("div",{className:"ro-timer-bar expired",style:{width:`${x}%`}})})]}),!t&&f&&r.jsxs("div",{className:"ro-timer urgent",children:[r.jsxs("div",{className:"ro-timer-row",children:[r.jsx("span",{className:"ro-timer-txt urgent",children:"⏰ Hurry! Price expires soon"}),r.jsx("span",{className:"ro-timer-pill urgent",children:p(a)})]}),r.jsx("div",{className:"ro-timer-bar-wrap",children:r.jsx("div",{className:"ro-timer-bar urgent",style:{width:`${x}%`}})})]}),r.jsxs("div",{className:"ro-card",children:[r.jsxs("div",{className:"ro-warn-strip",children:[r.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 16 16",fill:"none",style:{flexShrink:0,marginTop:1},children:[r.jsx("path",{d:"M8 1L1 15H15L8 1Z",stroke:"#d97706",strokeWidth:"1.5",strokeLinejoin:"round"}),r.jsx("path",{d:"M8 6V9M8 11V11.5",stroke:"#d97706",strokeWidth:"1.5",strokeLinecap:"round"})]}),r.jsx("span",{children:t?"Price has expired. Please fetch a new price to continue.":`Price locked for ${p(a)} · Transaction cannot be cancelled once confirmed`})]}),r.jsxs("div",{className:"ro-content",children:[r.jsx("div",{className:"ro-sec-title",children:"Order Details"}),r.jsxs("div",{className:"ro-detail",children:[r.jsx("span",{className:"ro-d-lbl",children:"Gold Rate (Locked)"}),r.jsxs("span",{className:"ro-d-val gold",children:["₹",l==null?void 0:l.toFixed(2)," / gram"]})]}),r.jsxs("div",{className:"ro-detail",children:[r.jsx("span",{className:"ro-d-lbl",children:"Quantity"}),r.jsxs("span",{className:"ro-d-val",children:[n(e.grams).toFixed(6)," grams"]})]}),r.jsxs("div",{className:"ro-detail",children:[r.jsx("span",{className:"ro-d-lbl",children:"Gold Value"}),r.jsxs("span",{className:"ro-d-val",children:["₹",n(e.rupees).toFixed(2)]})]}),r.jsxs("div",{className:"ro-detail",children:[r.jsx("span",{className:"ro-d-lbl",children:"GST (3%)"}),r.jsxs("span",{className:"ro-d-val",children:["₹",n(e.gst).toFixed(2)]})]}),r.jsxs("div",{className:"ro-total-box",children:[r.jsx("span",{className:"ro-total-lbl",children:"Total Amount"}),r.jsxs("span",{className:"ro-total-val",children:["₹",n(e.total).toFixed(2)]})]})]}),r.jsx("div",{className:"ro-divider"}),r.jsx("div",{className:"ro-bottom",children:r.jsx("div",{className:"ro-btn-group",children:t?r.jsxs(r.Fragment,{children:[r.jsx("button",{className:"ro-btn ro-btn-cancel",onClick:()=>o("/buy-gold"),children:"Go Back"}),r.jsx("button",{className:"ro-btn ro-btn-refresh",onClick:h,children:"Fetch New Price"})]}):r.jsxs(r.Fragment,{children:[r.jsx("button",{className:"ro-btn ro-btn-cancel",onClick:()=>o(-1),children:"Cancel"}),r.jsx("button",{className:"ro-btn ro-btn-confirm",onClick:g,disabled:t,children:"Confirm & Pay"})]})})})]})]})]})]})};export{F as default};
