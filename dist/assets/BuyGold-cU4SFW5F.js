import{u as K,b as Q,a as X,c as O,r as g,j as e,A as L}from"./index-Bti0KOuG.js";import{apiCall as k}from"./tokenManager-BEtaPY4e.js";import{g as Z}from"./userUtils-7c406hZg.js";const ee=`${L}/oxygold-api/digital-gold/preview-buy`,ae=`${L}/oxygold-api/digital-gold/transactions`,te=`${L}/oxygold-api/digital-gold/wallet`,ce=({onDataPass:se,portfolioData:U})=>{var R;const A=K(),Y=Q(),{buyPrice:B,loading:I,error:oe}=X(),{setPurchasePrice:W}=O(),[c,E]=g.useState("rupees"),[w,v]=g.useState(""),[$,M]=g.useState(!1),[T,b]=g.useState(""),[V,N]=g.useState([]),[q,F]=g.useState(!0),[p,P]=g.useState(null),[y,z]=g.useState(!0),{purchasePrice:re}=O();(R=Y.state)!=null&&R.portfolioData;const _=()=>{let o=0,n=0;return V.forEach(t=>{if(t.status!=="Completed")return;const s=parseFloat(t.grams),a=t.amount;if(t.type==="Buy")o+=s,n+=a;else if(t.type==="Sell"&&(o-=s,o+s>0)){const i=n/(o+s);n-=s*i}}),{goldBalance:Math.max(0,o),investedAmount:Math.max(0,n)}},l=B||0,G=_(),m=p&&!y?p.goldBalanceGrams||0:G.goldBalance,d=p&&!y&&p.totalInvestedAmount?p.totalInvestedAmount:p&&!y&&p.investedAmount?p.investedAmount:G.investedAmount,u=Math.round(m*l*100)/100,x=Math.round((u-d)*100)/100,D=d>0?Math.round(x/d*100*100)/100:0,f=x>=0,j=f?"Profit":"Loss",H=m>0?Math.round(d/m*100)/100:0;console.log("=== BUYGOLD PORTFOLIO PERFORMANCE ==="),console.log("📊 Input Data:"),console.log(`   Gold Balance: ${m} grams`),console.log(`   Live Price: ₹${l}/gram`),console.log(`   Total Invested (from wallet API): ₹${d}`),console.log("📈 Calculations:"),console.log(`   Current Value = ${m} × ₹${l} = ₹${u}`),console.log(`   ${j} = ₹${u} - ₹${d} = ₹${Math.abs(x)}`),console.log(`   Return % = (₹${x} ÷ ₹${d}) × 100 = ${D}%`),console.log(`   Average Buy Price: ₹${H}/gram`),console.log("💡 Result:",f?`🟢 ${j}`:`🔴 ${j}`);const S=()=>Z();g.useEffect(()=>{(async()=>{var n,t;try{z(!0);const s=S(),a=await k(`${te}/${s}`);if(a.success)P(a.data);else if((n=a.message)!=null&&n.includes("not found")||(t=a.message)!=null&&t.includes("No wallet"))P({goldBalanceGrams:0,investedAmount:0});else throw new Error(a.message||"Failed to fetch wallet data")}catch(s){console.error("Error fetching wallet data:",s),P({goldBalanceGrams:0,investedAmount:0})}finally{z(!1)}})()},[]),g.useEffect(()=>{(async()=>{var n,t;try{F(!0);const s=S(),a=await k(`${ae}?userId=${s}`);if(a.success){const i=(a.data||[]).filter(r=>r.status!=="PENDING").map(r=>({date:new Date(r.createdAt).toLocaleDateString("en-IN",{year:"numeric",month:"2-digit",day:"2-digit"}),type:r.type==="BUY"?"Buy":"Sell",grams:parseFloat(r.grams).toFixed(6),amount:r.amount,status:r.status==="SUCCESS"?"Completed":r.status,pricePerGram:r.pricePerGram,transactionId:r.transactionId}));N(i)}else if((n=a.message)!=null&&n.includes("not found")||(t=a.message)!=null&&t.includes("No transactions"))N([]);else throw new Error(a.message||"Failed to fetch transactions")}catch(s){console.error("Error fetching transactions:",s),N([])}finally{F(!1)}})()},[]);const C=(o,n)=>{const t=parseFloat(o);if(!t||t<=0)return null;if(n==="rupees"){const s=Math.round(t*100)/100,a=Math.round(s*.03*100)/100,i=Math.round((s-a)*100)/100,r=i/l;return{buyMode:"rupees",amount:s,grams:r,rupees:i,gst:a,total:s,goldRate:l}}else{const s=Math.round(t*1e6)/1e6,a=Math.round(s*l*100)/100,i=Math.round(a*.03*100)/100,r=Math.round((a+i)*100)/100;return{buyMode:"grams",amount:r,grams:s,rupees:a,gst:i,total:r,goldRate:l}}},J=async()=>{const o=parseFloat(w);if(!o||o<=0){b("Please enter a valid amount");return}const n=S();M(!0),b("");try{const t=B,s=Date.now();console.log("Price locked at:",t,"Time:",new Date(s).toLocaleTimeString());const a=C(w,c);if(!a)throw new Error("Invalid calculation");const i={...a,goldRate:t,grams:a.grams,rupees:a.rupees,gst:a.gst,total:a.total},r=await k(ee,{method:"POST",body:JSON.stringify({userId:n,purchaseType:c==="rupees"?"AMOUNT":"GRAMS",amount:c==="rupees"?i.total:0,grams:c==="grams"?i.grams:0,paymentMode:"WALLET",pergramPrice:t,productId:4})});if(!r.success)throw new Error(r.message||"Preview failed");W(t),A("/review-order",{state:{preview:r.data,buyMode:c,userId:n,amount:i.total,grams:i.grams,rupees:i.rupees,gst:i.gst,total:i.total,goldRate:t,lockedTime:s,timeLeft:300}})}catch(t){b(t instanceof Error?t.message:"Something went wrong")}finally{M(!1)}},h=C(w,c);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bg-page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
        }

        /* ── BANNER ── */
        .bg-banner {
          background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
          padding: 24px 64px;
          border-bottom: 1px solid rgba(240,187,58,0.1);
        }
        .bg-banner-in {
          max-width: 1200px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 5px; text-align: center;
        }
        .bg-banner-title {
          font-size: 1.45rem; font-weight: 600; color: #fff; line-height: 1.2;
        }
        .bg-banner-sub {
          font-size: 0.82rem; color: rgba(255,255,255,0.48); font-weight: 400;
        }
        .bg-live {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 0.78rem; color: rgba(255,255,255,0.55);
        }
        .bg-live-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #4ade80; animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4);}50%{box-shadow:0 0 0 5px rgba(74,222,128,0);} }
        .bg-live-price { font-weight: 600; color: #f0bb3a; }

        /* ── LAYOUT ── */
        .bg-main {
          max-width: 960px; margin: 0 auto;
          padding: 28px 40px 52px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          align-items: start;
        }

        /* ── CARD ── */
        .bg-card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 20px 22px;
          position: relative;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .bg-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }
        .bg-card-lbl {
          font-size: 0.6rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #9eaab8; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .bg-card-lbl::after { content: ''; flex: 1; height: 1px; background: #f0f2f5; }

        .bg-left { display: flex; flex-direction: column; gap: 16px; }

        /* ── PORTFOLIO ── */
        .bg-port-val {
          font-size: 1.65rem; font-weight: 600;
          color: #c8900a; letter-spacing: -0.01em;
          line-height: 1; margin-bottom: 5px;
        }
        .bg-port-grams {
          font-size: 0.74rem; color: #9eaab8; margin-bottom: 12px; font-weight: 400;
        }
        .bg-port-gain {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 5px;
          font-size: 0.71rem; font-weight: 500;
        }
        .bg-port-gain.gain { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .bg-port-gain.loss { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        
        /* Portfolio card hover effect */
        .bg-card[style*="cursor: pointer"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
        }

        /* ── WHY BUY ── */
        .bg-feat {
          display: flex; align-items: flex-start; gap: 11px;
          padding: 10px 0; border-bottom: 1px solid #f4f5f7;
        }
        .bg-feat:last-child { border-bottom: none; padding-bottom: 0; }
        .bg-feat:first-child { padding-top: 0; }
        .bg-feat-num {
          font-size: 0.58rem; font-weight: 500; color: #c8c0b0;
          width: 16px; flex-shrink: 0; margin-top: 2px;
        }
        .bg-feat-title { font-size: 0.81rem; font-weight: 600; color: #1c2b3a; margin-bottom: 2px; }
        .bg-feat-desc { font-size: 0.71rem; color: #8a96a3; line-height: 1.55; font-weight: 400; }

        /* ── BUY FORM ── */
        .bg-right { position: sticky; top: 20px; }

        .bg-rate-row {
          display: flex; align-items: center; justify-content: space-between;
          background: #fffcf2; border: 1px solid #f0e0a0;
          border-radius: 7px; padding: 9px 13px; margin-bottom: 13px;
        }
        .bg-rate-label {
          font-size: 0.64rem; color: #b8900a; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .bg-rate-val { font-size: 0.86rem; font-weight: 600; color: #b8720a; }

        .bg-toggle {
          display: flex; background: #f4f5f7;
          border: 1px solid #e4e7eb; border-radius: 7px;
          padding: 3px; margin-bottom: 13px;
        }
        .bg-tgl-btn {
          flex: 1; padding: 7px 10px; border-radius: 5px;
          font-family: 'Sora', sans-serif;
          font-size: 0.77rem; font-weight: 400;
          border: none; cursor: pointer;
          background: transparent; color: #9eaab8; transition: all 0.18s;
        }
        .bg-tgl-btn.active {
          background: #fff; color: #1c2b3a; font-weight: 600;
          border: 1px solid #e0e4e8;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .bg-input {
          width: 100%; padding: 10px 13px;
          background: #fafbfc; border: 1px solid #e0e4e8;
          border-radius: 7px;
          font-family: 'Sora', sans-serif;
          font-size: 0.86rem; color: #1c2b3a; font-weight: 400;
          outline: none; margin-bottom: 10px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .bg-input:focus {
          border-color: #1a3060;
          box-shadow: 0 0 0 3px rgba(26,48,96,0.07);
          background: #fff;
        }
        .bg-input::placeholder { color: #bcc5cf; }

        .bg-quick { display: flex; gap: 6px; margin-bottom: 13px; flex-wrap: wrap; }
        .bg-q-btn {
          flex: 1; min-width: 64px; padding: 7px 8px;
          background: #f7f8fa; border: 1px solid #e4e7eb;
          border-radius: 6px;
          font-family: 'Sora', sans-serif;
          font-size: 0.74rem; font-weight: 500;
          color: #4a5a6a; cursor: pointer;
          transition: all 0.16s; text-align: center;
        }
        .bg-q-btn:hover { border-color: #d9a020; color: #b8720a; background: #fffcf0; }

        .bg-calc {
          background: #fafbfc; border: 1px solid #e8ecf0;
          border-radius: 8px; padding: 11px 13px; margin-bottom: 13px;
        }
        .bg-calc-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.74rem; color: #9eaab8; padding: 3px 0; font-weight: 400;
        }
        .bg-calc-row.total {
          border-top: 1px solid #eaecef;
          margin-top: 6px; padding-top: 8px;
          font-size: 0.8rem; font-weight: 600; color: #1c2b3a;
        }
        .bg-calc-val { font-weight: 500; color: #3a4a5a; }
        .bg-calc-gold { font-weight: 600; color: #b8720a; }

        .bg-error {
          font-size: 0.74rem; color: #dc2626;
          padding: 7px 11px; border-radius: 6px;
          background: #fef2f2; border: 1px solid rgba(220,38,38,0.12);
          margin-bottom: 11px;
        }

        .bg-spin {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid rgba(28,43,58,0.15); border-top-color: #1c2b3a;
          animation: spin 0.65s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .bg-buy-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%);
          color: #0d1f3c;
          font-family: 'Sora', sans-serif;
          font-size: 0.88rem; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
          margin-bottom: 10px;
          box-shadow: 0 3px 14px rgba(217,160,32,0.24);
          letter-spacing: 0.01em;
        }
        .bg-buy-btn:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(217,160,32,0.36);
          transform: translateY(-1px);
        }
        .bg-buy-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .bg-footnote { text-align: center; font-size: 0.64rem; color: #bcc5cf; font-weight: 400; }

        .price-spinner {
          width: 9px; height: 9px; border-radius: 50%;
          border: 1.5px solid rgba(217,160,32,0.2); border-top-color: #d9a020;
          animation: spin 0.6s linear infinite; display: inline-block;
        }

        @media (max-width: 768px) {
          .bg-banner { padding: 16px 20px; }
          .bg-main { grid-template-columns: 1fr; padding: 16px 16px 40px; gap: 14px; }
          .bg-right { position: static; }
          .bg-live { display: none; }
        }
      `}),e.jsxs("div",{className:"bg-page",children:[e.jsx("section",{className:"bg-banner",children:e.jsxs("div",{className:"bg-banner-in",children:[e.jsx("h1",{className:"bg-banner-title",children:"Buy Digital Gold"}),e.jsx("p",{className:"bg-banner-sub",children:"24K · 999 Purity · Secure Vault Storage"}),e.jsxs("div",{className:"bg-live",children:[e.jsx("span",{className:"bg-live-dot"}),e.jsx("span",{children:"Live Rate:"}),e.jsxs("span",{className:"bg-live-price",children:["₹",l==null?void 0:l.toFixed(2)," / gram"]}),I&&e.jsx("span",{className:"price-spinner",style:{marginLeft:"8px"}})]})]})}),e.jsxs("main",{className:"bg-main",children:[e.jsxs("div",{className:"bg-left",children:[e.jsxs("div",{className:"bg-card",onClick:()=>A("/portfolio"),style:{cursor:"pointer"},children:[e.jsx("div",{className:"bg-card-lbl",children:"Your Gold Portfolio"}),q||y?e.jsx("div",{style:{padding:"20px 0",textAlign:"center"},children:e.jsx("span",{className:"bg-spin"})}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"bg-port-val",children:["₹",u==null?void 0:u.toLocaleString("en-IN",{maximumFractionDigits:2})]}),e.jsxs("div",{className:"bg-port-grams",children:[m.toFixed(6)," grams · Invested: ₹",d==null?void 0:d.toLocaleString("en-IN",{maximumFractionDigits:0})]}),e.jsxs("div",{className:`bg-port-gain ${f?"gain":"loss"}`,children:[f?"▲":"▼"," ",f?"+":"-","₹",Math.abs(x).toLocaleString("en-IN",{maximumFractionDigits:2})," (",f?"+":"",D,"% ",j.toLowerCase(),")"]})]})]}),e.jsxs("div",{className:"bg-card",children:[e.jsx("div",{className:"bg-card-lbl",children:"Why Buy With Us"}),[{t:"Bank-Grade Security",d:"Your gold is 100% secure in insured vaults"},{t:"Instant Trading",d:"Buy and sell anytime at live market prices"},{t:"Transparent Pricing",d:"All taxes and charges included upfront"}].map((o,n)=>e.jsxs("div",{className:"bg-feat",children:[e.jsxs("span",{className:"bg-feat-num",children:["0",n+1]}),e.jsxs("div",{children:[e.jsx("div",{className:"bg-feat-title",children:o.t}),e.jsx("div",{className:"bg-feat-desc",children:o.d})]})]},n))]})]}),e.jsx("div",{className:"bg-right",children:e.jsxs("div",{className:"bg-card",children:[e.jsx("div",{className:"bg-card-lbl",children:"Buy Gold"}),e.jsxs("div",{className:"bg-rate-row",children:[e.jsx("span",{className:"bg-rate-label",children:"Live Rate"}),e.jsx("span",{className:"bg-rate-val",children:I?e.jsx("span",{className:"price-spinner"}):`₹${l==null?void 0:l.toFixed(2)} / gram`})]}),e.jsxs("div",{className:"bg-toggle",children:[e.jsx("button",{className:`bg-tgl-btn${c==="rupees"?" active":""}`,onClick:()=>{E("rupees"),v(""),b("")},children:"Buy in Rupees"}),e.jsx("button",{className:`bg-tgl-btn${c==="grams"?" active":""}`,onClick:()=>{E("grams"),v(""),b("")},children:"Buy in Grams"})]}),e.jsx("input",{type:"number",className:"bg-input",placeholder:c==="rupees"?"Enter amount in ₹":"Enter grams",value:w,onChange:o=>{v(o.target.value),b("")}}),c==="rupees"&&e.jsx("div",{className:"bg-quick",children:[100,500,1e3,1e4].map(o=>e.jsxs("button",{className:"bg-q-btn",onClick:()=>{v(o.toString()),b("")},children:["₹",o.toLocaleString()]},o))}),h&&e.jsxs("div",{className:"bg-calc",children:[e.jsxs("div",{className:"bg-calc-row",children:[e.jsx("span",{children:"Gold Value"}),e.jsxs("span",{className:"bg-calc-val",children:["₹",h.rupees.toFixed(2)]})]}),e.jsxs("div",{className:"bg-calc-row",children:[e.jsx("span",{children:"GST (3%)"}),e.jsxs("span",{className:"bg-calc-val",children:["₹",h.gst.toFixed(2)]})]}),e.jsxs("div",{className:"bg-calc-row",children:[e.jsx("span",{children:"You receive"}),e.jsxs("span",{className:"bg-calc-gold",children:[h.grams.toFixed(6)," g"]})]}),e.jsxs("div",{className:"bg-calc-row total",children:[e.jsx("span",{children:"Total Payable"}),e.jsxs("span",{children:["₹",h.total.toFixed(2)]})]})]}),T&&e.jsx("div",{className:"bg-error",children:T}),e.jsx("button",{className:"bg-buy-btn",onClick:J,disabled:$,children:$?e.jsx("span",{className:"bg-spin"}):"Proceed to Payment →"}),e.jsx("div",{className:"bg-footnote",children:"Minimum purchase ₹100 · GST included"})]})})]})]})]})};export{ce as default};
