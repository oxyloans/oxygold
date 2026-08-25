import{u as U,a as _,c as Y,r as c,j as e,A as P}from"./index-Bti0KOuG.js";import{apiCall as L}from"./tokenManager-BEtaPY4e.js";import{g as v}from"./userUtils-7c406hZg.js";const X=({onDataPass:V})=>{const g=U(),{buyPrice:I,sellPrice:F,loading:j}=_(),{purchasePrice:D}=Y(),a=F,b=100,E=`${P}/oxygold-api/digital-gold/preview-sell`,$=`${P}/oxygold-api/digital-gold/wallet`;if(!v())return g("/login"),null;const[t,N]=c.useState("rupees"),[o,h]=c.useState(""),[p,i]=c.useState(""),[k,S]=c.useState(!1),[n,M]=c.useState(null),[C,A]=c.useState(!0),l=(n==null?void 0:n.goldBalanceGrams)||0,d=l*a,u=s=>{if(t==="rupees"){if(s&&!/^\d*\.?\d{0,2}$/.test(s))return}else if(s&&!/^\d{0,4}(\.\d{0,3})?$/.test(s)||s.replace(".","").length>4)return;h(s),i("");const r=parseFloat(s);if(!(!s||isNaN(r)||r<=0)){if(t==="rupees"&&r<b){i(`Minimum sell amount is ₹${b}`);return}t==="grams"&&r>l?i(`Insufficient balance. Available: ${l.toFixed(3)} grams`):t==="rupees"&&r>d&&i(`Insufficient balance. Available: ₹${d==null?void 0:d.toFixed(2)}`)}};n!=null&&n.totalInvestedAmount;const y=a&&l?Math.round(l*a*100)/100:(n==null?void 0:n.currentValue)||0,w=o&&!p&&parseFloat(o)>0,G=()=>{const s=v();return s||(g("/login"),null)};c.useEffect(()=>{(async()=>{try{A(!0);const r=G();if(!r)return;const f=await L(`${$}/${r}`);f.success&&M(f.data)}catch(r){console.error("Wallet fetch error:",r)}finally{A(!1)}})()},[]);const R=async()=>{if(!o||parseFloat(o)<=0){i("Please enter a valid amount");return}if(p)return;const s=v();if(!s){g("/login");return}S(!0),i("");try{const r=parseFloat(o),f=t==="rupees"?r/a:r,W=t==="grams"?r*a:r,z={userId:parseInt(s),amount:W,grams:f,purchaseType:t==="rupees"?"AMOUNT":"GRAMS",pergramPrice:I,pergramSellingPrice:a,paymentMode:"BANK",productId:4};console.log("Preview Sell Request:",z);const m=await L(E,{method:"POST",body:JSON.stringify(z)});if(console.log("Preview Sell API Response:",m),!m.success)throw new Error(m.message||"Preview failed");const x=m.data,B=x.amount,q=x.grams,O=x.pergramSellingPrice,T=x.gst||0;g("/sell-summary",{state:{amount:B,grams:q,sellRate:O,sellMode:t,availableGold:l,preview:x,userId:s,gst:T,lockedTime:Date.now(),timeLeft:300}})}catch(r){console.error("Preview Sell Error:",r),i(r instanceof Error?r.message:"Something went wrong")}finally{S(!1)}};return l===0?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .empty-page {
            min-height: 100vh; background: #f7f8fa;
            font-family: 'Sora', sans-serif;
            display: flex; align-items: center; justify-content: center; padding: 48px;
          }
          .empty-card {
            background: #fff; border: 1px solid #e8ecf0;
            border-radius: 12px; padding: 48px 40px; text-align: center;
            max-width: 400px; width: 100%;
            position: relative; overflow: hidden;
            box-shadow: 0 1px 6px rgba(0,0,0,0.04);
          }
          .empty-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
            border-radius: 12px 12px 0 0;
            background: linear-gradient(90deg, #1a3060, #d9a020); opacity: 0.7;
          }
          .empty-title { font-size: 1.1rem; font-weight: 600; color: #1c2b3a; margin-bottom: 10px; }
          .empty-desc { font-size: 0.81rem; color: #9eaab8; margin-bottom: 28px; line-height: 1.65; font-weight: 400; }
          .empty-btn {
            width: 100%; padding: 12px 24px;
            background: linear-gradient(135deg, #f0bb3a, #d9a020);
            color: #0d1f3c; border: none; border-radius: 8px;
            font-family: 'Sora', sans-serif; font-size: 0.86rem; font-weight: 600; cursor: pointer;
            box-shadow: 0 3px 12px rgba(217,160,32,0.24);
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .empty-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(217,160,32,0.34); }
        `}),e.jsx("div",{className:"empty-page",children:e.jsxs("div",{className:"empty-card",children:[e.jsx("h2",{className:"empty-title",children:"No Gold Available"}),e.jsx("p",{className:"empty-desc",children:"You don't have any gold in your portfolio to sell. Start investing today to build your digital gold holdings."}),e.jsx("button",{className:"empty-btn",onClick:()=>g("/buy-gold"),children:"Buy Gold Now"})]})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sg-page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
        }

        /* ── BANNER ── */
        .sg-banner {
          background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
          padding: 24px 64px;
          border-bottom: 1px solid rgba(240,187,58,0.1);
        }
        .sg-banner-in {
          max-width: 1200px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 5px; text-align: center;
        }
        .sg-banner-title {
          font-size: 1.45rem; font-weight: 600; color: #fff; line-height: 1.2;
        }
        .sg-banner-sub {
          font-size: 0.82rem; color: rgba(255,255,255,0.48); font-weight: 400;
        }
        .sg-live {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 0.78rem; color: rgba(255,255,255,0.55);
        }
        .sg-live-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #4ade80; animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4);}50%{box-shadow:0 0 0 5px rgba(74,222,128,0);} }
        .sg-live-val { font-weight: 600; color: #f0bb3a; }

        /* ── LAYOUT ── */
        .sg-main {
          max-width: 960px; margin: 0 auto;
          padding: 28px 40px 52px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 18px; align-items: start;
        }

        /* ── CARD ── */
        .sg-card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 20px 22px;
          position: relative;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .sg-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }
        .sg-card-lbl {
          font-size: 0.6rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #9eaab8; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .sg-card-lbl::after { content: ''; flex: 1; height: 1px; background: #f0f2f5; }

        .sg-left { display: flex; flex-direction: column; gap: 16px; }

        /* ── BALANCE ── */
        .sg-bal-val {
          font-size: 1.65rem; font-weight: 600;
          color: #c8900a; letter-spacing: -0.01em;
          line-height: 1; margin-bottom: 5px;
        }
        .sg-bal-sub { font-size: 0.88rem; color: #08b124; margin-bottom: 4px; font-weight: 400; }
        .sg-gain-loss {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 5px;
          font-size: 0.71rem; font-weight: 500; margin-top: 10px;
        }
        .sg-gain-loss.gain { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .sg-gain-loss.loss { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        
        /* Portfolio card hover effect */
        .sg-card[style*="cursor: pointer"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
        }

        /* ── WHY SELL ── */
        .sg-feat {
          display: flex; align-items: flex-start; gap: 11px;
          padding: 10px 0; border-bottom: 1px solid #f4f5f7;
        }
        .sg-feat:last-child { border-bottom: none; padding-bottom: 0; }
        .sg-feat:first-child { padding-top: 0; }
        .sg-feat-num { font-size: 0.58rem; font-weight: 500; color: #c8c0b0; width: 16px; flex-shrink: 0; margin-top: 2px; }
        .sg-feat-title { font-size: 0.81rem; font-weight: 600; color: #1c2b3a; margin-bottom: 2px; }
        .sg-feat-desc  { font-size: 0.71rem; color: #8a96a3; line-height: 1.55; font-weight: 400; }

        /* ── SELL FORM ── */
        .sg-right { position: sticky; top: 20px; }

        .sg-rate-row {
          display: flex; align-items: center; justify-content: space-between;
          background: #fffcf2; border: 1px solid #f0e0a0;
          border-radius: 7px; padding: 9px 13px; margin-bottom: 13px;
        }
        .sg-rate-label { font-size: 0.64rem; color: #b8900a; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
        .sg-rate-val { font-size: 0.86rem; font-weight: 600; color: #b8720a; }

        .sg-toggle {
          display: flex; background: #f4f5f7;
          border: 1px solid #e4e7eb; border-radius: 7px;
          padding: 3px; margin-bottom: 13px;
        }
        .sg-tgl-btn {
          flex: 1; padding: 7px 10px; border-radius: 5px;
          font-family: 'Sora', sans-serif; font-size: 0.77rem; font-weight: 400;
          border: none; cursor: pointer; background: transparent; color: #9eaab8;
          transition: all 0.18s;
        }
        .sg-tgl-btn.active {
          background: #fff; color: #1c2b3a; font-weight: 600;
          border: 1px solid #e0e4e8;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .sg-input {
          width: 100%; padding: 10px 13px;
          background: #fafbfc; border: 1px solid #e0e4e8;
          border-radius: 7px;
          font-family: 'Sora', sans-serif; font-size: 0.86rem;
          color: #1c2b3a; font-weight: 400;
          outline: none; margin-bottom: 8px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .sg-input:focus { border-color: #1a3060; box-shadow: 0 0 0 3px rgba(26,48,96,0.07); background: #fff; }
        .sg-input.has-error { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.06); }
        .sg-input::placeholder { color: #bcc5cf; }

        .sg-error { font-size: 0.72rem; color: #dc2626; font-weight: 500; margin-bottom: 8px; }

        .sg-hint {
          font-size: 0.74rem; color: #6a7a60;
          padding: 6px 10px; margin-bottom: 10px;
          background: #f7fcf4; border-left: 2px solid #b8d9a0;
          border-radius: 0 5px 5px 0; font-weight: 400;
        }

        .sg-quick { display: flex; gap: 6px; margin-bottom: 13px; flex-wrap: wrap; }
        .sg-q-btn {
          flex: 1; min-width: 64px; padding: 7px 8px;
          background: #f7f8fa; border: 1px solid #e4e7eb;
          border-radius: 6px;
          font-family: 'Sora', sans-serif; font-size: 0.74rem; font-weight: 500;
          color: #4a5a6a; cursor: pointer; text-align: center;
          transition: all 0.16s;
        }
        .sg-q-btn:hover { border-color: #d9a020; color: #b8720a; background: #fffcf0; }
        .sg-q-btn.sell-all {
          background: #fffcf0; border-color: rgba(217,160,32,0.3);
          color: #b8720a; font-weight: 600;
        }
        .sg-q-btn.sell-all:hover { border-color: #d9a020; }

        .sg-note {
          display: flex; align-items: flex-start; gap: 7px;
          padding: 8px 10px; background: #fafbfc;
          border: 1px solid #e8ecf0; border-radius: 6px; margin-bottom: 13px;
          font-size: 0.69rem; color: #9eaab8; line-height: 1.5; font-weight: 400;
        }

        .sg-sell-btn {
          width: 100%; padding: 12px;
          font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer;
          margin-bottom: 10px; letter-spacing: 0.01em;
          transition: box-shadow 0.2s, transform 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .sg-sell-btn.active {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #0d1f3c;
          box-shadow: 0 3px 14px rgba(217,160,32,0.24);
        }
        .sg-sell-btn.active:hover {
          box-shadow: 0 6px 20px rgba(217,160,32,0.36);
          transform: translateY(-1px);
        }
        .sg-sell-btn.disabled {
          background: #f0f2f5; color: #b0bac4; cursor: not-allowed;
        }

        .sg-footnote { text-align: center; font-size: 0.64rem; color: #bcc5cf; font-weight: 400; }

        .sg-spin {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid rgba(13,31,60,0.15); border-top-color: #0d1f3c;
          animation: spin 0.65s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .price-spinner {
          width: 9px; height: 9px; border-radius: 50%;
          border: 1.5px solid rgba(217,160,32,0.2); border-top-color: #d9a020;
          animation: spin 0.6s linear infinite; display: inline-block;
        }

        @media (max-width: 768px) {
          .sg-banner { padding: 16px 20px; }
          .sg-main   { grid-template-columns: 1fr; padding: 16px 16px 40px; gap: 14px; }
          .sg-right  { position: static; }
          .sg-live   { display: none; }
        }
      `}),e.jsxs("div",{className:"sg-page",children:[e.jsx("section",{className:"sg-banner",children:e.jsxs("div",{className:"sg-banner-in",children:[e.jsx("h1",{className:"sg-banner-title",children:"Sell Digital Gold"}),e.jsx("p",{className:"sg-banner-sub",children:"Get instant credit at live market rates"}),e.jsxs("div",{className:"sg-live",children:[e.jsx("span",{className:"sg-live-dot"}),e.jsx("span",{children:"Sell Rate:"}),e.jsxs("span",{className:"sg-live-val",children:["₹",a==null?void 0:a.toFixed(2)," / gram"]}),j&&e.jsx("span",{className:"price-spinner",style:{marginLeft:"8px"}})]})]})}),e.jsxs("main",{className:"sg-main",children:[e.jsxs("div",{className:"sg-left",children:[e.jsxs("div",{className:"sg-card",onClick:()=>g("/portfolio"),style:{cursor:"pointer"},children:[e.jsx("div",{className:"sg-card-lbl",children:"Available Balance"}),C?e.jsx("div",{style:{padding:"20px 0",textAlign:"center"},children:e.jsx("span",{className:"sg-spin"})}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"sg-bal-val",children:[l.toFixed(3)," gram"]}),e.jsxs("div",{className:"sg-bal-sub",children:["Current Value: ₹",y==null?void 0:y.toLocaleString("en-IN",{maximumFractionDigits:2})]})]})]}),e.jsxs("div",{className:"sg-card",children:[e.jsx("div",{className:"sg-card-lbl",children:"Why Sell With Us"}),[{t:"Instant Settlement",d:"T+1 working day bank credit"},{t:"Live Market Rates",d:"Best prices guaranteed"},{t:"Secure & Compliant",d:"RBI regulated process"}].map((s,r)=>e.jsxs("div",{className:"sg-feat",children:[e.jsxs("span",{className:"sg-feat-num",children:["0",r+1]}),e.jsxs("div",{children:[e.jsx("div",{className:"sg-feat-title",children:s.t}),e.jsx("div",{className:"sg-feat-desc",children:s.d})]})]},r))]})]}),e.jsx("div",{className:"sg-right",children:e.jsxs("div",{className:"sg-card",children:[e.jsx("div",{className:"sg-card-lbl",children:"Sell Gold"}),e.jsxs("div",{className:"sg-rate-row",children:[e.jsx("span",{className:"sg-rate-label",children:"Sell Rate"}),e.jsx("span",{className:"sg-rate-val",children:j?e.jsx("span",{className:"price-spinner"}):`₹${a==null?void 0:a.toFixed(2)} / gram`})]}),e.jsxs("div",{className:"sg-toggle",children:[e.jsx("button",{className:`sg-tgl-btn${t==="rupees"?" active":""}`,onClick:()=>{N("rupees"),h(""),i("")},children:"Sell in Rupees"}),e.jsx("button",{className:`sg-tgl-btn${t==="grams"?" active":""}`,onClick:()=>{N("grams"),h(""),i("")},children:"Sell in Grams"})]}),e.jsx("input",{type:"text",inputMode:"decimal",className:`sg-input${p?" has-error":""}`,placeholder:t==="rupees"?`Min ₹${b}`:"Max 4 digits (e.g. 0.500)",value:o,onChange:s=>u(s.target.value)}),p&&e.jsx("div",{className:"sg-error",children:p}),o&&!p&&e.jsx("div",{className:"sg-hint",children:t==="rupees"?`≈ ${(parseFloat(o)/a).toFixed(6)} grams of 24K gold`:`≈ ₹${(parseFloat(o)*a).toFixed(2)}`}),e.jsxs("div",{className:"sg-quick",children:[["100","500","5000"].map(s=>e.jsxs("button",{className:"sg-q-btn",onClick:()=>u(s),children:["₹",parseInt(s).toLocaleString()]},s)),e.jsx("button",{className:"sg-q-btn sell-all",onClick:()=>u(d==null?void 0:d.toFixed(2)),children:"Sell All"})]}),e.jsxs("div",{className:"sg-note",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 16 16",fill:"none",style:{flexShrink:0,marginTop:1},children:[e.jsx("circle",{cx:"8",cy:"8",r:"7",stroke:"#bcc5cf",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 7V11M8 5V5.5",stroke:"#bcc5cf",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Sell price is based on live market rate and may change"]}),e.jsx("button",{className:`sg-sell-btn${w?" active":" disabled"}`,onClick:R,disabled:!w||k,children:k?e.jsx("span",{className:"sg-spin"}):w?"Review Sell Order":"Enter Valid Amount"}),e.jsx("div",{className:"sg-footnote",children:"Funds credited to your registered bank account"})]})})]})]})]})};export{X as default};
