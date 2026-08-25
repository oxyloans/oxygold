const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/tokenManager-BEtaPY4e.js","assets/index-Bti0KOuG.js","assets/index-DAReG4rN.css"])))=>i.map(i=>d[i]);
import{u as te,b as ae,r as l,j as e,A as M,_ as F}from"./index-Bti0KOuG.js";import{T as re}from"./TermsModal-BXCvZgl2.js";import{apiCall as se}from"./tokenManager-BEtaPY4e.js";import{g as v}from"./userUtils-7c406hZg.js";const pe=()=>{const m=te(),p=ae().state;if(!p)return m("/sell-gold"),null;const{amount:U,grams:$,sellRate:g,sellMode:x,preview:B,userId:k,lockedTime:P,timeLeft:G,gst:ne}=p,[f,V]=l.useState(G||300),[A,K]=l.useState(!0),[N,W]=l.useState(!1),[Y,C]=l.useState(!1),[q,E]=l.useState(!1),[n,w]=l.useState(null),[J,I]=l.useState(!1),[j,L]=l.useState(!1),[D,S]=l.useState(!1),[H,u]=l.useState(!1),[_,d]=l.useState(null),T=l.useRef(!1),b=$,h=U,R=`${M}/oxygold-api/auth/getBankDetailsByuserId`,z=`${M}/oxygold-api/digital-gold/sell/initiate`;l.useEffect(()=>{if(f<=0)return;const s=setInterval(()=>{V(t=>t<=1?(K(!1),0):t-1)},1e3);return()=>clearInterval(s)},[f]),l.useEffect(()=>{(async()=>{try{I(!0),d(null);const t=k||v();if(!t){m("/login");return}if(p!=null&&p.newBankDetails){console.log("=== USING NEW BANK DETAILS FROM STATE ==="),w(p.newBankDetails),S(!0),u(!0),setTimeout(()=>u(!1),3e3);return}console.log("=== FETCHING BANK DETAILS FROM API ==="),console.log("API URL:",`${R}?userId=${t}`);const i=await(await F(async()=>{const{default:c}=await import("./tokenManager-BEtaPY4e.js");return{default:c}},__vite__mapDeps([0,1,2]))).default.getInstance().getValidAccessToken(),r=await fetch(`${R}?userId=${t}`,{method:"GET",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"}});if(console.log("=== BANK DETAILS API RESPONSE ==="),console.log("Response status:",r.status),console.log("Response ok:",r.ok),r.ok){const c=r.headers.get("content-type");let a;if(c&&c.includes("application/json"))a=await r.json();else{const y=await r.text();console.log("Bank details response text:",y),a=y}console.log("Bank details data:",a),console.log("Data type:",typeof a),a&&a.data&&Array.isArray(a.data)&&a.data.length>0?(console.log("Found bank details in data array:",a.data[0]),w(a.data[0]),S(!0),u(!0),setTimeout(()=>u(!1),3e3)):Array.isArray(a)&&a.length>0?(console.log("Found bank details in direct array:",a[0]),w(a[0]),S(!0),u(!0),setTimeout(()=>u(!1),3e3)):a&&typeof a=="object"&&a.accountNumber?(console.log("Found bank details as direct object:",a),w(a),S(!0),u(!0),setTimeout(()=>u(!1),3e3)):(console.log("No valid bank details found in response"),console.log("Response structure:",JSON.stringify(a,null,2)))}else console.log("Bank details API returned non-ok status:",r.status),r.status===401?d("Authentication failed. Please login again."):r.status===404?console.log("No bank details found for user"):r.status>=500?d("Server error. Please try again later."):d(`Failed to load bank details (Error ${r.status})`)}catch(t){console.error("Failed to fetch bank details:",t),t instanceof Error?t.message.includes("Failed to fetch")||t.message.includes("NetworkError")?d("Network error. Please check your connection and try again."):t.message.includes("Authentication")?d("Authentication failed. Please login again."):d("Failed to load bank details. Please try again."):d("An unexpected error occurred. Please try again.")}finally{I(!1)}})()},[k,p==null?void 0:p.newBankDetails]);const O=s=>{const t=Math.floor(s/60),o=s%60;return`${t}:${o.toString().padStart(2,"0")}`},Q=async()=>{if(A){if(!N){E(!0),setTimeout(()=>E(!1),3e3);return}if(!n){alert("Please add bank account details before proceeding.");return}if(j||T.current){console.log("=== DUPLICATE CALL BLOCKED - ALREADY PROCESSING ===");return}T.current=!0,L(!0);try{await Z()}catch(s){throw T.current=!1,L(!1),s}}},Z=async()=>{E(!1);const s=k||v();if(!s){m("/login");return}try{const t=`SELL_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;if(console.log(`=== STARTING SELL CALL ${t} ===`),!h||!b||!g||!s)throw new Error("Missing required data for sell initiation");const o={userId:parseInt(s.toString()),amount:parseFloat(h.toString()),grams:parseFloat(b.toString()),purchaseType:(x==null?void 0:x.toUpperCase())==="GRAMS"?"GRAMS":"AMOUNT",pergramPrice:parseFloat(g.toString()),pergramSellingPrice:parseFloat(g.toString()),paymentMode:"BANK",productId:4};if(o.amount<=0||o.grams<=0)throw new Error("Amount and grams must be greater than 0");if(o.pergramPrice<=0||o.pergramSellingPrice<=0)throw new Error("Price per gram must be greater than 0");if(isNaN(o.amount)||isNaN(o.grams)||isNaN(o.pergramPrice)||isNaN(o.pergramSellingPrice))throw new Error("Invalid numeric values in request");console.log(`=== SELL INITIATE API CALL START ${t} ===`),console.log("Sell Initiate Request:",o),console.log("Request Body JSON:",JSON.stringify(o,null,2)),console.log("API URL:",z);const i=await se(z,{method:"POST",body:JSON.stringify(o)});if(console.log(`=== SELL INITIATE API CALL END ${t} ===`),console.log("Sell Initiate Response:",i),i&&i.success&&i.data){const{transactionId:r,beneficiaryId:c,status:a}=i.data;console.log("=== SELL INITIATE SUCCESS ==="),console.log("Transaction ID:",r),console.log("Beneficiary ID:",c),console.log("Status:",a),m("/sell-processing",{state:{transactionId:r,beneficiaryId:c,status:a,amount:h,grams:b,sellRate:g,bankDetails:n,message:i.message,userId:s,purchaseType:(x==null?void 0:x.toUpperCase())==="GRAMS"?"GRAMS":"AMOUNT",paymentMode:"BANK",productId:4}})}else throw console.error("=== SELL INITIATE FAILED ==="),console.error("Response:",i),new Error((i==null?void 0:i.message)||"Sell initiation failed - invalid response")}catch(t){console.error("=== SELL INITIATE ERROR ==="),console.error("Sell initiate error:",t),console.error("Error details:",{message:t instanceof Error?t.message:"Unknown error",stack:t instanceof Error?t.stack:void 0}),console.error("=== END ERROR LOG ==="),alert("Transaction failed: "+(t instanceof Error?t.message:"Unknown error"))}finally{console.log("=== SELL LOADING SET TO FALSE ==="),T.current=!1,L(!1)}},X=f/300*100,ee=f<=60;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
        }



        /* ── BANNER ── */
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
          font-family: 'Sora', sans-serif;
        }
        .ro-back:hover { 
          background: rgba(240,187,58,0.12); 
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
        }
        .ro-topbar-sep { width: 1px; height: 14px; background: rgba(240,187,58,0.18); flex-shrink: 0; }
        .ro-topbar-title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .ro-topbar-sub { font-size: 0.78rem; color: rgba(255,255,255,0.58); }

        /* ── MAIN ── */
        .main-wrap {
          max-width: 760px; margin: 0 auto;
          padding: 24px 32px 50px;
          position: relative; z-index: 1;
        }

        /* ── TIMER BANNER ── */
        .timer-banner {
          border-radius: 20px; padding: 12px 16px;
          margin-bottom: 29px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; border: 1px solid;
          animation: fadeUp 0.4s ease both;
        }
        .timer-banner.locked-ok {
          background: #fff; border-color: #e8ecf0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .timer-banner.locked-urgent {
          background: #fffbeb; border-color: rgba(217,119,6,0.25);
          box-shadow: 0 2px 8px rgba(217,119,6,0.08);
        }
        .timer-banner.expired {
          background: #fef2f2; border-color: rgba(220,38,38,0.2);
          box-shadow: 0 2px 8px rgba(220,38,38,0.08);
        }
        .timer-left { display: flex; align-items: center; gap: 10px; }
        .timer-icon { font-size: 1rem; }
        .timer-text { font-size: 0.8rem; font-weight: 500; }
        .timer-text.ok { color: #1a3060; }
        .timer-text.urgent { color: #d97706; }
        .timer-text.expired { color: #dc2626; }
        .timer-pill {
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em;
          padding: 4px 10px; border-radius: 100px;
        }
        .timer-pill.ok { background: rgba(26,48,96,0.1); color: #1a3060; }
        .timer-pill.urgent { 
          background: rgba(217,119,6,0.12); color: #d97706; 
          animation: pulse-warn 1.5s ease-in-out infinite; 
        }
        @keyframes pulse-warn { 0%,100% { opacity:1; } 50% { opacity:0.7; } }

        .timer-bar-wrap { height: 3px; background: rgba(0,0,0,0.06); border-radius: 99px; margin-top: 8px; }
        .timer-bar {
          height: 100%; border-radius: 99px;
          transition: width 1s linear;
        }
        .timer-bar.ok { background: #1a3060; }
        .timer-bar.urgent { background: #d97706; }

        /* ── ORDER CARD ── */
        .order-card {
          background: #fff; border: 1px solid #e8ecf0;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          position: relative;
        }
        .order-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.8;
        }

        /* ── WARNING BANNER ── */
        .card-warning {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 18px; background: #fffbeb;
          border-bottom: 1px solid rgba(217,119,6,0.12);
          font-size: 0.72rem; color: #d97706; line-height: 1.5;
        }

        /* ── DETAILS GRID ── */
        .details-grid {
          padding: 18px 20px;
        }

        .section-title {
          font-size: 0.58rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #9eaab8; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #f0f2f5; }

        .detail-row { 
          margin-bottom: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0; border-bottom: 1px solid #f4f5f7;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label {
          font-size: 0.76rem; font-weight: 400;
          color: #8a96a3;
        }
        .detail-value {
          font-size: 0.78rem; font-weight: 500;
          color: #1c2b3a;
        }
        .detail-value.gold { color: #b8720a; font-weight: 600; }

        /* ── TOTAL ROW ── */
        .total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; margin-top: 12px;
          background: #fffcf2; border-radius: 8px;
          border: 1px solid #f0e0a0;
        }
        .total-label { font-size: 0.82rem; font-weight: 600; color: #1c2b3a; }
        .total-value { font-size: 1.1rem; font-weight: 600; color: #b8720a; }

        /* ── CARD BOTTOM ── */
        .card-bottom {
          padding: 16px 20px 18px;
          border-top: 1px solid #f0f2f5;
          background: #fafbfc;
        }

        .card-divider { height: 1px; background: #f0f2f5; margin: 0 20px; }

        /* ── TERMS ── */
        .terms-label {
          display: flex; align-items: flex-start; gap: 10px;
          cursor: pointer; margin-bottom: 6px;
        }
        .terms-checkbox {
          width: 16px; height: 16px; margin-top: 2px;
          accent-color: #d9a020; cursor: pointer; flex-shrink: 0;
        }
        .terms-text { font-size: 0.8rem; color: #8a96a3; line-height: 1.5; font-weight: 400; }
        .terms-link {
          color: #1a3060; font-weight: 600;
          background: none; border: none; cursor: pointer;
          text-decoration: underline; text-underline-offset: 2px;
          font-size: inherit;
          transition: color 0.2s;
        }
        .terms-link:hover { color: #d9a020; }
        .terms-error { font-size: 0.74rem; color: #dc2626; font-weight: 500; margin-top: 6px; }

        /* ── BUTTONS ── */
        .proceed-btn {
          width: 100%; padding: 12px 18px;
          border: none; border-radius: 8px; margin-top: 16px;
          font-size: 0.88rem; font-weight: 600; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.01em;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Sora', sans-serif;
        }
        .proceed-btn.active {
          background: linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%);
          color: #0d1f3c;
          box-shadow: 0 3px 14px rgba(217,160,32,0.24);
        }
        .proceed-btn.active:hover:not(:disabled) { 
          box-shadow: 0 6px 20px rgba(217,160,32,0.36);
          transform: translateY(-1px);
        }
        .proceed-btn.active:disabled { opacity: 0.65; cursor: not-allowed; }
        .proceed-btn.refresh {
          background: linear-gradient(135deg, #1a3060, #0d1f3c);
          color: #fff;
          box-shadow: 0 3px 14px rgba(26,48,96,0.24);
        }
        .proceed-btn.refresh:hover { 
          box-shadow: 0 6px 20px rgba(26,48,96,0.36);
          transform: translateY(-1px);
        }

        /* ── BANK SUCCESS BANNER ── */
        .bank-success-banner {
          background: #f0fdf4;
          border: 1px solid rgba(22,163,74,0.2);
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 14px;
          animation: slideDown 0.3s ease;
        }
        .success-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .success-icon {
          color: #16a34a;
          font-weight: bold;
          font-size: 0.85rem;
        }
        .success-text {
          color: #16a34a;
          font-size: 0.78rem;
          font-weight: 500;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── BANK SELECTION ── */
        .bank-selection {
          margin-top: 14px;
          padding: 12px;
          background: #fafbfc;
          border-radius: 8px;
          border: 1px solid #e8ecf0;
        }
        .selection-title {
          font-size: 0.78rem;
          font-weight: 600;
          color: #1c2b3a;
          margin-bottom: 10px;
          text-align: center;
        }
        .selection-buttons {
          display: flex;
          justify-content: center;
        }
        .select-btn {
          padding: 7px 14px;
          border: none;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-family: 'Sora', sans-serif;
        }
        .select-btn.change {
          background: #f4f5f7;
          color: #1a3060;
          border: 1px solid #e4e7eb;
        }
        .select-btn.change:hover {
          background: #e8ecf0;
          border-color: #1a3060;
        }
        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(13,31,60,0.2);
          border-top: 2px solid #0d1f3c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ro-topbar { padding: 14px 20px; }
          .main-wrap { padding: 20px 16px 36px; }
          .order-card { border-radius: 10px; }
          .details-grid { padding: 16px 16px; }
          .card-bottom { padding: 14px 16px; }
        }
      `}),e.jsxs("div",{className:"page",children:[e.jsx("section",{className:"ro-topbar",children:e.jsxs("div",{className:"ro-topbar-in",children:[e.jsx("button",{className:"ro-back",onClick:()=>m("/sell-gold"),children:"←"}),e.jsx("span",{className:"ro-topbar-sep"}),e.jsx("span",{className:"ro-topbar-title",children:"Review Sell Order"}),e.jsx("span",{className:"ro-topbar-sep"}),e.jsx("span",{className:"ro-topbar-sub",children:"Confirm your sell details"})]})}),e.jsxs("main",{className:"main-wrap",children:[!A&&e.jsx("div",{className:"timer-banner expired",children:e.jsx("div",{children:e.jsxs("div",{className:"timer-left",children:[e.jsx("span",{className:"timer-icon",children:"⚠️"}),e.jsx("span",{className:"timer-text expired",children:"Price lock expired — please refresh to get a new price"})]})})}),A&&ee&&e.jsx("div",{className:"timer-banner locked-urgent",children:e.jsxs("div",{children:[e.jsxs("div",{className:"timer-left",children:[e.jsx("span",{className:"timer-icon",children:"🔒"}),e.jsx("span",{className:"timer-text urgent",children:"Price locked — expires in"}),e.jsx("span",{className:"timer-pill urgent",children:O(f)})]}),e.jsx("div",{className:"timer-bar-wrap",children:e.jsx("div",{className:"timer-bar urgent",style:{width:`${X}%`}})})]})}),e.jsxs("div",{className:"order-card",children:[e.jsxs("div",{className:"card-warning",children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",style:{flexShrink:0,marginTop:1},children:[e.jsx("path",{d:"M8 1L1 15H15L8 1Z",stroke:"#d97706",strokeWidth:"1.5",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6V9M8 11V11.5",stroke:"#d97706",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsxs("span",{children:["Price locked for ",O(f),"  •  Transaction cannot be cancelled once confirmed"]})]}),e.jsxs("div",{className:"details-grid",children:[e.jsx("div",{className:"section-title",children:"Sell Details"}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Sell Rate (Locked)"}),e.jsxs("span",{className:"detail-value gold",children:["₹",g==null?void 0:g.toFixed(2)," / gram"]})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Quantity"}),e.jsxs("span",{className:"detail-value",children:[b==null?void 0:b.toFixed(3)," grams"]})]}),e.jsxs("div",{className:"total-row",children:[e.jsx("span",{className:"total-label",children:"You Will Receive"}),e.jsxs("span",{className:"total-value",children:["₹",h==null?void 0:h.toLocaleString("en-IN",{maximumFractionDigits:2})]})]}),e.jsx("div",{style:{fontSize:"0.68rem",color:"#999",marginTop:"6px",fontStyle:"italic"},children:"* Selling price is GST-adjusted as per regulations"})]}),e.jsx("div",{className:"card-divider"}),e.jsxs("div",{className:"details-grid",children:[e.jsx("div",{className:"section-title",children:"Bank Details"}),H&&e.jsx("div",{className:"bank-success-banner",children:e.jsxs("div",{className:"success-content",children:[e.jsx("span",{className:"success-icon",children:"✓"}),e.jsx("span",{className:"success-text",children:"Bank verification successful"})]})}),J?e.jsxs("div",{style:{padding:"16px 0",textAlign:"center",color:"#999"},children:[e.jsx("div",{style:{display:"inline-block",width:"14px",height:"14px",border:"2px solid #e0e0e0",borderTop:"2px solid #7c3aed",borderRadius:"50%",animation:"spin 1s linear infinite"}}),e.jsx("span",{style:{marginLeft:"6px",fontSize:"0.76rem"},children:"Loading..."})]}):_?e.jsxs("div",{style:{padding:"12px",textAlign:"center",background:"#fef2f2",border:"1px solid rgba(220,38,38,0.2)",borderRadius:"6px",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",marginBottom:"6px"},children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",children:[e.jsx("circle",{cx:"8",cy:"8",r:"7",stroke:"#dc2626",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 5V9M8 11V11.5",stroke:"#dc2626",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsx("span",{style:{fontSize:"0.76rem",color:"#dc2626",fontWeight:"500"},children:_})]}),e.jsx("button",{className:"select-btn change",onClick:()=>{d(null),(async()=>{try{I(!0),d(null);const t=k||v();if(!t)return;const i=await(await F(async()=>{const{default:c}=await import("./tokenManager-BEtaPY4e.js");return{default:c}},__vite__mapDeps([0,1,2]))).default.getInstance().getValidAccessToken(),r=await fetch(`${R}?userId=${t}`,{method:"GET",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"}});if(r.ok){const c=r.headers.get("content-type");let a;if(c&&c.includes("application/json")?a=await r.json():a=await r.text(),a&&a.success!==!1){const y=a.data||a;y&&typeof y=="object"&&(w(y),S(!0))}}else throw new Error(`API returned ${r.status}`)}catch{d("Failed to retry. Please try again.")}finally{I(!1)}})()},style:{fontSize:"0.72rem",padding:"5px 10px"},children:"Retry"})]}):n?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Account Holder"}),e.jsx("span",{className:"detail-value",children:n.nameAtBank})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Account Number"}),e.jsx("span",{className:"detail-value",children:n.accountNumber})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Bank Name"}),e.jsx("span",{className:"detail-value",children:n.bankName})]}),n.branch&&n.city&&e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Branch"}),e.jsxs("span",{className:"detail-value",children:[n.branch,", ",n.city]})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"IFSC Code"}),e.jsx("span",{className:"detail-value",children:n.ifsc})]}),D&&e.jsxs("div",{className:"bank-selection",children:[e.jsx("div",{className:"selection-title",children:"Proceed with this bank account?"}),e.jsx("div",{className:"selection-buttons",children:e.jsx("button",{className:"select-btn change",onClick:()=>m("/bank-account",{state:{grams:b,amount:h,sellRate:g,userId:k||v(),lockedTime:P,timeLeft:f,sellMode:x,preview:B,returnTo:"sell-summary"}}),children:"Change Account"})})]})]}):e.jsxs("div",{style:{padding:"12px 0",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:"0.76rem",color:"#999",marginBottom:"10px"},children:"No bank account added"}),e.jsx("button",{className:"select-btn change",onClick:()=>m("/bank-account",{state:{grams:b,amount:h,sellRate:g,userId:k||v(),lockedTime:P,timeLeft:f,sellMode:x,preview:B,returnTo:"sell-summary"}}),style:{margin:"0 auto",display:"block"},children:"+ Add Bank Account"})]})]}),e.jsx("div",{className:"card-divider"}),e.jsxs("div",{className:"card-bottom",children:[e.jsxs("label",{className:"terms-label",children:[e.jsx("input",{type:"checkbox",className:"terms-checkbox",checked:N,onChange:s=>W(s.target.checked)}),e.jsxs("span",{className:"terms-text",children:["I agree to the"," ",e.jsx("button",{type:"button",className:"terms-link",onClick:()=>C(!0),children:"Terms & Conditions"})]})]}),q&&!N&&e.jsx("div",{className:"terms-error",children:"Please accept the Terms & Conditions to continue"}),A?e.jsx("button",{className:"proceed-btn active",onClick:Q,disabled:j||!N||!n,style:{opacity:j||!N||!n?.6:1,cursor:j||!N||!n?"not-allowed":"pointer"},children:j?e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(26,13,5,0.3)",borderTop:"2px solid #1a0d05",borderRadius:"50%",animation:"spin 1s linear infinite"}}),"Processing..."]}):D?"Yes, Proceed with This Account →":"Confirm & Sell Gold →"}):e.jsx("button",{className:"proceed-btn refresh",onClick:()=>m("/sell-gold"),children:"↺ Get Fresh Price & Try Again"})]})]})]})]}),e.jsx(re,{isOpen:Y,onClose:()=>C(!1),flowType:"sell"})]})};export{pe as default};
