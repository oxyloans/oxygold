import{u as ge,a as he,c as be,r as p,j as e,A as se}from"./index-Bti0KOuG.js";import{apiCall as ne}from"./tokenManager-BEtaPY4e.js";import{g as ue}from"./userUtils-7c406hZg.js";const Te=()=>{var J,K;const z=ge(),{buyPrice:oe,loading:re,error:R,lastUpdated:ye}=he(),{purchasePrice:je}=be(),[D,M]=p.useState([]),[v,W]=p.useState(!0),[O,H]=p.useState(""),[m,G]=p.useState(null),[B,U]=p.useState(!0),[V,Y]=p.useState(""),[c,_]=p.useState(null),[ie,X]=p.useState(!1),le=`${se}/oxygold-api/digital-gold/transactions`,de=`${se}/oxygold-api/digital-gold/wallet`,N=ue();if(!N)return z("/login"),null;const Q=(()=>{let s=0,d=0;return D.forEach(n=>{if(n.status!=="Completed")return;const t=parseFloat(n.grams),g=n.amount;if(n.type==="Buy")s+=t,d+=g;else if(n.type==="Sell"&&(s-=t,s+t>0)){const a=d/(s+t);d-=t*a}}),{goldBalance:Math.max(0,s),investedAmount:Math.max(0,d)}})(),h=m&&!B?m.goldBalanceGrams||0:Q.goldBalance,l=m&&!B&&m.totalInvestedAmount?m.totalInvestedAmount:m&&!B&&m.investedAmount?m.investedAmount:Q.investedAmount,b=oe||0,x=Math.round(h*b*100)/100,w=Math.round((x-l)*100)/100,Z=l>0?Math.round(w/l*100*100)/100:0,f=w>=0,T=f?"Profit":"Loss",ce=h>0?Math.round(l/h*100)/100:0;console.log("=== PORTFOLIO PERFORMANCE ==="),console.log("📊 Input Data:"),console.log(`   Gold Balance: ${h} grams`),console.log(`   Live Price: ₹${b}/gram`),console.log(`   Total Invested (from wallet API): ₹${l}`),console.log("📈 Calculations:"),console.log(`   Current Value = ${h} × ₹${b} = ₹${x}`),console.log(`   ${T} = ₹${x} - ₹${l} = ₹${Math.abs(w)}`),console.log(`   Return % = (₹${w} ÷ ₹${l}) × 100 = ${Z}%`),console.log(`   Average Buy Price: ₹${ce}/gram`),console.log("💡 Result:",f?`🟢 ${T}`:`🔴 ${T}`);const i=(()=>{const s=D.filter(a=>a.status==="Completed");if(s.length===0)return[];const d=[...s].sort((a,k)=>{const[F,u,A]=a.date.split("/").map(Number),[P,S,$]=k.date.split("/").map(Number);return new Date(A,u-1,F).getTime()-new Date($,S-1,P).getTime()});let n=0,t=0;const g=[];return d.forEach(a=>{const k=parseFloat(a.grams);a.type==="Buy"?(n+=k,t+=a.amount):n-=k;const[F,u]=a.date.split("/");g.push({label:`${F}/${u}`,value:n*b,invested:t})}),g.push({label:"Now",value:x,invested:l}),g})();p.useEffect(()=>{(async()=>{var d,n;try{U(!0),Y("");const t=await ne(`${de}/${N}`);if(t.success)G(t.data);else if((d=t.message)!=null&&d.includes("not found")||(n=t.message)!=null&&n.includes("No wallet"))G({goldBalanceGrams:0,investedAmount:0});else throw new Error(t.message||"Failed to fetch wallet data")}catch(t){console.error("Error fetching wallet data:",t),G({goldBalanceGrams:0,investedAmount:0}),Y("")}finally{U(!1)}})()},[N]),p.useEffect(()=>{(async()=>{var d,n;try{W(!0),H("");const t=await ne(`${le}?userId=${N}`);if(t.success){const g=(t.data||[]).filter(a=>a.status!=="PENDING").map(a=>({date:new Date(a.createdAt).toLocaleDateString("en-IN",{year:"numeric",month:"2-digit",day:"2-digit"}),type:a.type==="BUY"?"Buy":"Sell",grams:parseFloat(a.grams).toFixed(6),amount:a.amount,status:a.status==="SUCCESS"?"Completed":a.status,pricePerGram:a.pricePerGram,transactionId:a.transactionId,paymentDetails:{paymentMethod:a.paymentMethod||"UPI",paymentId:a.paymentId||a.transactionId,orderId:a.orderId||a.transactionId,gst:a.gst||a.amount*.03,netAmount:a.netAmount||a.amount-a.amount*.03,grossAmount:a.amount,timestamp:a.createdAt}}));M(g)}else if((d=t.message)!=null&&d.includes("not found")||(n=t.message)!=null&&n.includes("No transactions"))M([]);else throw new Error(t.message||"Failed to fetch transactions")}catch(t){console.error("Error fetching transactions:",t),M([]),H("")}finally{W(!1)}})()},[N]);const E=D,pe=s=>{_(s),X(!0)},q=()=>{X(!1),_(null)};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pf-page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
        }

        /* ── BANNER ── */
        .pf-banner {
          background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
          padding: 24px 64px;
          border-bottom: 1px solid rgba(240,187,58,0.1);
        }
        .pf-banner-in {
          max-width: 1200px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 5px; text-align: center;
        }
        .pf-banner-title {
          font-size: 1.45rem; font-weight: 600; color: #fff; line-height: 1.2;
        }
        .pf-banner-sub { font-size: 0.82rem; color: rgba(255,255,255,0.48); font-weight: 400; }
        .pf-rate {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 0.78rem; color: rgba(255,255,255,0.55);
        }
        .pf-rate-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #4ade80; animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4);}50%{box-shadow:0 0 0 5px rgba(74,222,128,0);} }
        .pf-rate-val { font-weight: 600; color: #f0bb3a; }
        .pf-rate-loading {
          display: inline-block; width: 10px; height: 10px;
          border: 1.5px solid rgba(255,255,255,0.25); border-top-color: #f0bb3a;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── MAIN ── */
        .pf-main {
          max-width: 1100px; margin: 0 auto;
          padding: 28px 48px 56px;
        }

        .error-msg {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 10px 14px;
          margin-bottom: 18px; font-size: 0.74rem; color: #dc2626; font-weight: 400;
        }

        /* ── OVERVIEW ── */
        .pf-overview {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; margin-bottom: 16px;
        }

        /* ── CARD ── */
        .pf-card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          position: relative; overflow: hidden;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .pf-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }
        .pf-card-head {
          padding: 16px 20px 12px;
          border-bottom: 1px solid #f0f2f5;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pf-card-title {
          font-size: 0.6rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em; color: #9eaab8;
          display: flex; align-items: center; gap: 6px;
        }
        .pf-card-title-dot { width: 4px; height: 4px; border-radius: 50%; background: #d9a020; opacity: 0.8; }
        .pf-card-body { padding: 18px 20px; }

        /* ── PORTFOLIO SUMMARY ── */
        .port-val {
          font-size: 1.65rem; font-weight: 600;
          color: #1c2b3a; letter-spacing: -0.01em;
          line-height: 1; margin-bottom: 4px;
        }
        .port-val-label { font-size: 0.74rem; color: #9eaab8; margin-bottom: 14px; font-weight: 400; }

        .port-gain-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .port-gain-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 0.71rem; font-weight: 500;
        }
        .port-gain-badge.gain { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .port-gain-badge.loss { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .port-gain-pct { font-size: 0.71rem; color: #9eaab8; font-weight: 400; }

        .port-mini-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .port-mini-stat {
          background: #fafbfc; border: 1px solid #e8ecf0;
          border-radius: 8px; padding: 10px 12px;
        }
        .port-mini-label { font-size: 0.58rem; color: #9eaab8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; font-weight: 500; }
        .port-mini-val { font-size: 0.86rem; font-weight: 600; color: #1c2b3a; }
        .port-mini-val.gold { color: #c8900a; }

        /* ── CHART ── */
        .chart-empty {
          text-align: center; padding: 40px 20px;
          color: #bcc5cf; font-size: 0.78rem; font-weight: 400;
        }
        .chart-legend { display: flex; gap: 14px; align-items: center; }
        .chart-legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.64rem; color: #9eaab8; }
        .chart-legend-line { width: 14px; height: 2px; border-radius: 2px; }

        /* ── ACTIONS ── */
        .pf-actions { display: flex; gap: 10px; margin-bottom: 16px; }
        .pf-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #0d1f3c;
          font-family: 'Sora', sans-serif;
          font-size: 0.83rem; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .pf-btn-primary:hover { box-shadow: 0 6px 18px rgba(217,160,32,0.34); transform: translateY(-1px); }
        .pf-btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 20px;
          background: #fff; color: #2a4060;
          font-family: 'Sora', sans-serif;
          font-size: 0.83rem; font-weight: 500;
          border: 1px solid #e0e4e8; border-radius: 8px; cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
        }
        .pf-btn-secondary:hover { border-color: #d9a020; background: #fffcf0; color: #b8720a; }

        /* ── TRANSACTIONS ── */
        .pf-txn {
          background: #fff; border: 1px solid #e8ecf0;
          border-radius: 12px; overflow: hidden; position: relative;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .pf-txn::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020); opacity: 0.7;
        }
        .pf-txn-hd {
          padding: 14px 20px; border-bottom: 1px solid #f0f2f5;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pf-txn-title { font-size: 0.84rem; font-weight: 600; color: #1c2b3a; }
        .pf-txn-count {
          font-size: 0.66rem; font-weight: 500; color: #9eaab8;
          background: #f4f5f7; border: 1px solid #e4e7eb;
          padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em;
        }

        .pf-table { width: 100%; border-collapse: collapse; font-size: 0.81rem; }
        .pf-table thead tr { background: #fafbfc; border-bottom: 1px solid #f0f2f5; }
        .pf-table th {
          text-align: left; padding: 9px 18px;
          font-size: 0.6rem; font-weight: 600;
          color: #9eaab8; text-transform: uppercase;
          letter-spacing: 0.09em; white-space: nowrap;
        }
        .pf-table tbody tr { border-bottom: 1px solid #f7f8fa; transition: background 0.12s; cursor: pointer; }
        .pf-table tbody tr:last-child { border-bottom: none; }
        .pf-table tbody tr:hover { background: #fafbfc; }
        .pf-table td { padding: 12px 18px; color: #1c2b3a; vertical-align: middle; }
        .pf-date { color: #9eaab8; font-size: 0.76rem; font-variant-numeric: tabular-nums; font-weight: 400; }
        .pf-grams { font-variant-numeric: tabular-nums; font-weight: 500; }
        .pf-amount { font-weight: 600; font-variant-numeric: tabular-nums; }

        .badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 20px;
          font-size: 0.66rem; font-weight: 500; letter-spacing: 0.02em;
        }
        .badge::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
        .badge-buy  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-sell { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .badge-done { background: #f0f4ff; color: #2a4e9e; border: 1px solid #c7d4f5; }

        .loading-spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(13,31,60,0.12); border-top-color: #1a3060;
          border-radius: 50%; animation: spin 0.65s linear infinite;
        }
        .stat-loading { display: flex; align-items: center; gap: 8px; padding: 12px 0; }
        .empty-state { text-align: center; padding: 40px 20px; color: #9eaab8; font-size: 0.8rem; font-weight: 400; }
        .empty-state-title { font-size: 0.9rem; font-weight: 600; color: #1c2b3a; margin-bottom: 6px; }

        /* ── TRANSACTION MODAL ── */
        .txn-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease;
        }
        .txn-modal {
          background: #fff; border-radius: 12px;
          width: 90%; max-width: 360px; max-height: 80vh;
          overflow-y: auto; position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.4s ease;
        }
        .txn-modal-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid #f0f2f5;
          display: flex; align-items: center; justify-content: space-between;
        }
        .txn-modal-title {
          font-size: 1rem; font-weight: 500; color: #1c2b3a;
        }
        .txn-modal-close {
          width: 28px; height: 28px; border-radius: 50%;
          background: #f4f5f7; border: none;
          color: #9eaab8; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .txn-modal-close:hover { background: #e8ecf0; color: #1c2b3a; }
        .txn-modal-body { padding: 16px 20px 20px; }
        .txn-detail-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; border-bottom: 1px solid #f7f8fa;
        }
        .txn-detail-row:last-child { border-bottom: none; }
        .txn-detail-label {
          font-size: 0.8rem; color: #9eaab8; font-weight: 400;
        }
        .txn-detail-value {
          font-size: 0.85rem; color: #1c2b3a; font-weight: 400;
          text-align: right; max-width: 60%;
        }
        .txn-detail-value.success { color: #16a34a; }
        .txn-detail-value.buy { color: #16a34a; }
        .txn-detail-value.sell { color: #dc2626; }
        .txn-id {
          font-family: 'Courier New', monospace;
          font-size: 0.75rem; background: #f4f5f7;
          padding: 2px 6px; border-radius: 3px;
          font-weight: 400; word-break: break-all;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 768px) {
          .pf-banner { padding: 16px 20px; }
          .pf-main { padding: 16px 16px 40px; }
          .pf-overview { grid-template-columns: 1fr; }
          .pf-rate { display: none; }
          .pf-table { font-size: 0.73rem; }
          .pf-table th, .pf-table td { padding: 8px 12px; }
        }
      `}),e.jsxs("div",{className:"pf-page",children:[e.jsx("section",{className:"pf-banner",children:e.jsxs("div",{className:"pf-banner-in",children:[e.jsx("h1",{className:"pf-banner-title",children:"Your Portfolio"}),e.jsx("p",{className:"pf-banner-sub",children:"Track your digital gold investments"}),e.jsxs("div",{className:"pf-rate",children:[re?e.jsx("span",{className:"pf-rate-loading"}):e.jsx("span",{className:"pf-rate-dot"}),e.jsx("span",{children:"Live Rate:"}),e.jsxs("span",{className:"pf-rate-val",children:["₹",b==null?void 0:b.toLocaleString("en-IN",{maximumFractionDigits:2})," ","/ gram"]})]})]})}),e.jsxs("main",{className:"pf-main",children:[R&&e.jsxs("div",{className:"error-msg",children:[e.jsx("strong",{children:"Gold Price:"})," ",R]}),V&&e.jsxs("div",{className:"error-msg",children:[e.jsx("strong",{children:"Wallet:"})," ",V]}),O&&e.jsxs("div",{className:"error-msg",children:[e.jsx("strong",{children:"Transactions:"})," ",O]}),e.jsxs("div",{className:"pf-overview",children:[e.jsxs("div",{className:"pf-card",children:[e.jsx("div",{className:"pf-card-head",children:e.jsxs("div",{className:"pf-card-title",children:[e.jsx("span",{className:"pf-card-title-dot"}),"Portfolio Summary"]})}),e.jsx("div",{className:"pf-card-body",children:v?e.jsxs("div",{className:"stat-loading",children:[e.jsx("span",{className:"loading-spinner"}),e.jsx("span",{style:{fontSize:"0.74rem",color:"#9eaab8"},children:"Loading..."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"port-val",children:["₹",x==null?void 0:x.toLocaleString("en-IN",{maximumFractionDigits:2})]}),e.jsx("div",{className:"port-val-label",children:"Current Portfolio Value"}),e.jsxs("div",{className:"port-gain-row",children:[e.jsxs("div",{className:`port-gain-badge ${f?"gain":"loss"}`,children:[f?"▲":"▼"," ",f?"+":"-","₹",Math.abs(w).toLocaleString("en-IN",{maximumFractionDigits:2})]}),e.jsxs("span",{className:"port-gain-pct",children:[f?"+":"",Z,"% ",T.toLowerCase()]})]}),e.jsxs("div",{className:"port-mini-stats",children:[e.jsxs("div",{className:"port-mini-stat",children:[e.jsx("div",{className:"port-mini-label",children:"Gold Held"}),e.jsxs("div",{className:"port-mini-val gold",children:[h.toFixed(4)," g"]})]}),e.jsxs("div",{className:"port-mini-stat",children:[e.jsx("div",{className:"port-mini-label",children:"Invested"}),e.jsxs("div",{className:"port-mini-val",children:["₹",l.toLocaleString("en-IN",{maximumFractionDigits:0})]})]})]})]})})]}),e.jsxs("div",{className:"pf-card",children:[e.jsxs("div",{className:"pf-card-head",children:[e.jsxs("div",{className:"pf-card-title",children:[e.jsx("span",{className:"pf-card-title-dot"}),"Portfolio Value Over Time"]}),!v&&i.length>=2&&e.jsxs("div",{className:"chart-legend",children:[e.jsxs("div",{className:"chart-legend-item",children:[e.jsx("div",{className:"chart-legend-line",style:{background:f?"#16a34a":"#dc2635"}}),e.jsx("span",{children:"Value"})]}),e.jsxs("div",{className:"chart-legend-item",children:[e.jsx("div",{className:"chart-legend-line",style:{background:"#d9a020",borderTop:"2px dashed #d9a020",height:0}}),e.jsx("span",{children:"Invested"})]})]})]}),v?e.jsx("div",{className:"pf-card-body",children:e.jsxs("div",{className:"stat-loading",children:[e.jsx("span",{className:"loading-spinner"}),e.jsx("span",{style:{fontSize:"0.74rem",color:"#9eaab8"},children:"Loading chart..."})]})}):i.length<2?e.jsxs("div",{className:"chart-empty",children:["No chart data yet.",e.jsx("br",{}),"Buy gold to see your growth."]}):(()=>{const u=i.map(o=>o.value),A=l>0?[...u,l]:u,P=Math.min(...A),S=Math.max(...A),$=(S-P)*.15||S*.1,C=P-$,ee=S+$,I=o=>62+o/(i.length-1)*382,y=o=>16+(1-(o-C)/(ee-C))*132,ae=i.map((o,r)=>`${r===0?"M":"L"}${I(r).toFixed(1)},${y(o.value).toFixed(1)}`).join(" "),xe=`${ae} L${I(i.length-1).toFixed(1)},${148 .toFixed(1)} L${62 .toFixed(1)},${148 .toFixed(1)} Z`,j=f?"#16a34a":"#dc2635",te=4,me=Array.from({length:te+1},(o,r)=>{const L=C+r/te*(ee-C);return{y:y(L),label:`₹${L>=1e3?(L/1e3).toFixed(1)+"k":L.toFixed(0)}`}}).reverse(),fe=Math.ceil(i.length/5);return e.jsxs("svg",{viewBox:"0 0 460 180",style:{width:"100%",height:"auto",display:"block",padding:"8px 8px 4px"},children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"pfGrad2",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:j,stopOpacity:"0.14"}),e.jsx("stop",{offset:"100%",stopColor:j,stopOpacity:"0.01"})]}),e.jsx("clipPath",{id:"chartClip",children:e.jsx("rect",{x:62,y:16,width:382,height:132})})]}),me.map((o,r)=>e.jsxs("g",{children:[e.jsx("line",{x1:62,y1:o.y.toFixed(1),x2:444,y2:o.y.toFixed(1),stroke:"#f0f2f5",strokeWidth:"1"}),e.jsx("text",{x:56,y:(o.y+3.5).toFixed(1),textAnchor:"end",style:{fontSize:"9px",fill:"#bcc5cf",fontFamily:"Sora, sans-serif"},children:o.label})]},r)),l>0&&e.jsx("line",{x1:62,y1:y(l).toFixed(1),x2:444,y2:y(l).toFixed(1),stroke:"#d9a020",strokeWidth:"1.5",strokeDasharray:"5,4",opacity:"0.6",clipPath:"url(#chartClip)"}),e.jsx("path",{d:xe,fill:"url(#pfGrad2)",clipPath:"url(#chartClip)"}),e.jsx("path",{d:ae,fill:"none",stroke:j,strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",clipPath:"url(#chartClip)"}),i.map((o,r)=>e.jsx("circle",{cx:I(r).toFixed(1),cy:y(o.value).toFixed(1),r:r===i.length-1?"4.5":"3",fill:r===i.length-1?j:"#fff",stroke:j,strokeWidth:"2"},r)),e.jsxs("text",{x:(I(i.length-1)-4).toFixed(1),y:(y(i[i.length-1].value)-9).toFixed(1),textAnchor:"end",style:{fontSize:"9.5px",fill:j,fontWeight:600,fontFamily:"Sora, sans-serif"},children:["₹",x.toLocaleString("en-IN",{maximumFractionDigits:0})]}),i.map((o,r)=>r===0||r===i.length-1||i.length>2&&r%fe===0?e.jsx("text",{x:I(r).toFixed(1),y:166 .toFixed(1),textAnchor:"middle",style:{fontSize:"9px",fill:"#bcc5cf",fontFamily:"Sora, sans-serif"},children:o.label},r):null),e.jsx("line",{x1:62,y1:148,x2:444,y2:148,stroke:"#f0f2f5",strokeWidth:"1"})]})})()]})]}),e.jsxs("div",{className:"pf-actions",children:[e.jsx("button",{className:"pf-btn-primary",onClick:()=>z("/buy-gold",{state:{portfolioData:{goldBalanceGrams:h,currentValue:x,totalInvestedAmount:l}}}),children:"+ Buy More Gold"}),e.jsx("button",{className:"pf-btn-secondary",onClick:()=>z("/sell-gold"),children:"Sell Gold"})]}),e.jsxs("div",{className:"pf-txn",children:[e.jsxs("div",{className:"pf-txn-hd",children:[e.jsx("span",{className:"pf-txn-title",children:"Transaction History"}),e.jsx("span",{className:"pf-txn-count",children:v?e.jsx("span",{className:"loading-spinner"}):`${E.length} transactions`})]}),e.jsx("div",{style:{overflowX:"auto"},children:v?e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"loading-spinner",style:{margin:"0 auto 12px"}}),e.jsx("div",{className:"empty-state-title",children:"Loading transactions..."})]}):E.length===0?e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-state-title",children:"No transactions yet"}),e.jsx("p",{children:"Start by buying your first gold"})]}):e.jsxs("table",{className:"pf-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Date"}),e.jsx("th",{children:"Type"}),e.jsx("th",{children:"Quantity"}),e.jsx("th",{children:"Amount"}),e.jsx("th",{children:"Rate / gram"}),e.jsx("th",{children:"Status"})]})}),e.jsx("tbody",{children:E.map((s,d)=>{var n;return e.jsxs("tr",{onClick:()=>pe(s),children:[e.jsx("td",{className:"pf-date",children:s.date}),e.jsx("td",{children:e.jsx("span",{className:`badge ${s.type==="Buy"?"badge-buy":"badge-sell"}`,children:s.type})}),e.jsxs("td",{className:"pf-grams",children:[s.grams," g"]}),e.jsxs("td",{className:"pf-amount",children:["₹",s.amount.toLocaleString("en-IN")]}),e.jsxs("td",{className:"pf-date",children:["₹",(n=s.pricePerGram)==null?void 0:n.toLocaleString("en-IN",{maximumFractionDigits:2})]}),e.jsx("td",{children:e.jsx("span",{className:"badge badge-done",children:s.status})})]},d)})})]})})]})]}),ie&&c&&e.jsx("div",{className:"txn-modal-overlay",onClick:q,children:e.jsxs("div",{className:"txn-modal",onClick:s=>s.stopPropagation(),children:[e.jsxs("div",{className:"txn-modal-header",children:[e.jsx("h3",{className:"txn-modal-title",children:"Payment Details"}),e.jsx("button",{className:"txn-modal-close",onClick:q,children:"×"})]}),e.jsxs("div",{className:"txn-modal-body",children:[e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"ID"}),e.jsx("span",{className:"txn-detail-value",children:e.jsx("span",{className:"txn-id",children:c.transactionId})})]}),e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"Date"}),e.jsx("span",{className:"txn-detail-value",children:c.date})]}),e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"Type"}),e.jsx("span",{className:`txn-detail-value ${c.type.toLowerCase()}`,children:c.type})]}),e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"Gold"}),e.jsxs("span",{className:"txn-detail-value",children:[parseFloat(c.grams).toFixed(3),"g"]})]}),e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"Rate"}),e.jsxs("span",{className:"txn-detail-value",children:["₹",(J=c.pricePerGram)==null?void 0:J.toLocaleString("en-IN",{maximumFractionDigits:0})]})]}),e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"Amount"}),e.jsxs("span",{className:"txn-detail-value",children:["₹",(K=c.amount)==null?void 0:K.toLocaleString("en-IN")]})]}),c.paymentDetails&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"GST"}),e.jsxs("span",{className:"txn-detail-value",children:["₹",Math.round(c.paymentDetails.gst||0)]})]}),e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"Method"}),e.jsx("span",{className:"txn-detail-value",children:c.paymentDetails.paymentMethod})]})]}),e.jsxs("div",{className:"txn-detail-row",children:[e.jsx("span",{className:"txn-detail-label",children:"Status"}),e.jsx("span",{className:"txn-detail-value success",children:c.status})]})]})]})})]})]})};export{Te as default};
