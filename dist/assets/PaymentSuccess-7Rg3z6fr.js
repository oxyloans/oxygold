import{u as T,b as L,r as i,A as E,j as e}from"./index-Bti0KOuG.js";import{apiCall as R}from"./tokenManager-BEtaPY4e.js";const F=`${E}/oxygold-api/digital-gold/payments/webhook`,O=({transactionData:S})=>{const l=T(),x=L(),[M,C]=i.useState(!1),[N,f]=i.useState(null),[w,m]=i.useState(!0),[j,I]=i.useState(0),[s,g]=i.useState(null);i.useEffect(()=>{var p,a;const o=new URLSearchParams(x.search).get("order_id");if(o){const t=sessionStorage.getItem("paymentSuccessData");if(t){const d={...JSON.parse(t),orderId:o,transactionId:o};console.log("[PaymentSuccess] Restored from sessionStorage:",{grams:d.grams,goldRate:d.goldRate,total:d.total}),g(d)}else console.warn("[PaymentSuccess] sessionStorage empty, using URL orderId only"),g({orderId:o,transactionId:o});return}const b=x.state||S||null;if(b){sessionStorage.setItem("paymentSuccessData",JSON.stringify(b)),g(b);return}const u=sessionStorage.getItem("paymentSuccessData");if(u){const t=JSON.parse(u),r=(a=(p=JSON.parse(localStorage.getItem("user")||"{}"))==null?void 0:p.data)==null?void 0:a.userId;if(r&&t.userId&&t.userId!==r){sessionStorage.removeItem("paymentSuccessData"),l("/buy-gold");return}g(t)}else l("/buy-gold")},[x.state,x.search,S]);const h=(s==null?void 0:s.transactionId)||(s==null?void 0:s.orderId)||"";s!=null&&s.orderId||s!=null&&s.transactionId;const v=parseFloat(s==null?void 0:s.processingFee)||0,k=(parseFloat(s==null?void 0:s.total)||0)+v,y=parseFloat(s==null?void 0:s.grams)>0?parseFloat(s.grams).toFixed(6):(s==null?void 0:s.grams)||"0",P=parseFloat(s==null?void 0:s.goldRate)>0?parseFloat(s.goldRate).toLocaleString("en-IN",{maximumFractionDigits:2}):null;console.log("PaymentSuccess - transactionData:",s),console.log("PaymentSuccess - calculated values:",{txnId:h,gramsDisplay:y,totalAmount:k,goldRateDisplay:P}),i.useEffect(()=>{if(!s)return;const c=s.orderId||s.transactionId||"";if(c)A(c);else{const o=s.status;f(o==="SUCCESS"||o==="success"?"success":"failure"),m(!1)}},[s]);const A=async c=>{var p;m(!0);for(let a=1;a<=10;a++)try{I(a);const t=await R(`${F}?order_id=${c}`,{method:"POST"}),r=t.status||((p=t.data)==null?void 0:p.status)||"";if(console.log(`[PaymentSuccess] Poll ${a} for ${c}: status=${r}`),r==="SUCCESS"){f("success"),m(!1);return}if(r==="FAILED"||r==="FAILURE"||r==="CANCELLED"){f("failure"),m(!1);return}a<10&&await new Promise(d=>setTimeout(d,3e3))}catch(t){console.error(`[PaymentSuccess] Poll ${a} error:`,t),a<10&&await new Promise(r=>setTimeout(r,3e3))}console.warn("[PaymentSuccess] Still PENDING after max attempts");const u=s==null?void 0:s.status;f(u==="SUCCESS"||u==="success"?"success":"failure"),m(!1)};if(w)return e.jsx("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter, sans-serif"},children:e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{style:{width:"40px",height:"40px",border:"4px solid #f3f3f3",borderTop:"4px solid #d9a020",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}),e.jsx("p",{style:{color:"#1a1a2e",fontWeight:600,marginBottom:6},children:"Verifying payment..."}),j>1&&e.jsxs("p",{style:{color:"#999",fontSize:"0.8rem"},children:["Still checking... attempt ",j,"/10"]}),e.jsx("style",{children:"@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"})]})});const n=N==="success";return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #f8f6fb;
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
        }

        /* ── BANNER ── */
        .banner {
          background: rgba(26, 48, 120, 0.96);
          border-bottom: 1px solid rgba(132, 128, 6, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px 56px;
        }
        .banner-in {
          max-width: 1000px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; gap: 12px;
        }
        .back-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: rgba(240,187,58,0.08); border: 1px solid rgba(240,187,58,0.28);
          border-radius: 7px; cursor: pointer;
          color: rgba(255,255,255,0.8); font-size: 0.9rem; flex-shrink: 0;
          transition: all 0.2s;
        }
        .back-btn:hover { 
          background: rgba(240,187,58,0.12); 
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
        }
        .banner-sep { width: 1px; height: 14px; background: rgba(240,187,58,0.18); flex-shrink: 0; }
        .banner-title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .banner-sub { font-size: 0.78rem; color: rgba(255,255,255,0.58); }

        /* ── MAIN ── */
        .main {
          min-height: calc(100vh - 60px);
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px;
        }

        .card {
          background: #ffffff;
          border: 1px solid #ede8f5;
          border-radius: 12px;
          padding: 32px 28px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
        }

        .icon {
          width: 56px; height: 56px;
          margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
        }
        .icon.success {
          background: #f0fdf4;
          border: 2px solid #16a34a;
        }
        .icon.failure {
          background: #fef2f2;
          border: 2px solid #dc2626;
        }
        .icon svg { width: 32px; height: 32px; }

        .title {
          font-size: 1.25rem; font-weight: 700;
          color: #1a1a2e; margin-bottom: 8px;
        }
        .title.failure { color: #dc2626; }
        .subtitle {
          font-size: 0.875rem; color: #888;
          margin-bottom: 24px;
        }

        /* Summary */
        .summary {
          background: #faf8ff;
          border: 1px solid #ede8f5;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: left;
        }
        .summary-section {
          margin-bottom: 12px;
        }
        .summary-section:last-child {
          margin-bottom: 0;
        }
        .summary-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .summary-row {
          display: flex; justify-content: space-between;
          padding: 6px 0;
          font-size: 0.875rem;
        }
        .summary-row:not(:last-child) {
          border-bottom: 1px solid #f0eaf8;
          margin-bottom: 6px;
          padding-bottom: 6px;
        }
        .summary-label { color: #888; }
        .summary-value { font-weight: 600; color: #1a1a2e; }
        .summary-value.txn-id {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          word-break: break-all;
          color: #b8860b;
        }
        .summary-value.total {
          font-size: 1rem;
          color: #b8860b;
        }

        /* Actions */
        .actions {
          display: flex; gap: 8px;
        }
        .btn {
          flex: 1; padding: 10px 14px;
          border: none; border-radius: 7px;
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .btn-secondary {
          background: #fff;
          color: #1a1a2e;
          border: 1px solid #ede8f5;
        }
        .btn-secondary:hover {
          border-color: #9b72cf;
          background: #faf8ff;
        }
        .btn-details {
          background: #f7f8fa;
          color: #1a3060;
          border: 1px solid #e0e4e8;
        }
        .btn-details:hover {
          border-color: #1a3060;
          background: #f0f4ff;
        }
        .btn-primary {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #1a0d05;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .btn-primary:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
        }

        @media (max-width: 640px) {
          .banner { padding: 12px 20px; }
          .card { padding: 24px 20px; }
        }
      `}),e.jsxs("div",{className:"page",children:[e.jsx("section",{className:"banner",children:e.jsxs("div",{className:"banner-in",children:[e.jsx("button",{className:"back-btn",onClick:()=>l("/portfolio"),children:"←"}),e.jsx("span",{className:"banner-sep"}),e.jsx("span",{className:"banner-title",children:n?"Payment Successful":"Payment Failed"}),e.jsx("span",{className:"banner-sep"}),e.jsxs("span",{className:"banner-sub",children:["Transaction ID: ",h]})]})}),e.jsx("main",{className:"main",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:`icon ${n?"success":"failure"}`,children:n?e.jsxs("svg",{width:"32",height:"32",viewBox:"0 0 48 48",fill:"none",children:[e.jsx("circle",{cx:"24",cy:"24",r:"23",stroke:"#16a34a",strokeWidth:"2"}),e.jsx("path",{d:"M14 24L20 30L34 16",stroke:"#16a34a",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})]}):e.jsxs("svg",{width:"32",height:"32",viewBox:"0 0 48 48",fill:"none",children:[e.jsx("circle",{cx:"24",cy:"24",r:"23",stroke:"#dc2626",strokeWidth:"2"}),e.jsx("path",{d:"M16 16L32 32M32 16L16 32",stroke:"#dc2626",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"})]})}),e.jsx("h1",{className:`title ${n?"":"failure"}`,children:n?"Payment Successful":"Payment Failed"}),e.jsx("p",{className:"subtitle",children:n?`${y} grams added to your account`:"Your payment could not be processed. Please try again."}),e.jsxs("div",{className:"summary",children:[e.jsxs("div",{className:"summary-row",children:[e.jsx("span",{className:"summary-label",children:"Transaction ID"}),e.jsx("span",{className:"summary-value txn-id",children:h})]}),e.jsxs("div",{className:"summary-row",children:[e.jsx("span",{className:"summary-label",children:"Quantity"}),e.jsxs("span",{className:"summary-value",children:[y," grams"]})]}),e.jsxs("div",{className:"summary-row",children:[e.jsx("span",{className:"summary-label",children:"Total Amount"}),e.jsxs("span",{className:"summary-value total",children:["₹",k.toLocaleString()]})]})]}),e.jsxs("div",{className:"actions",children:[e.jsx("button",{className:"btn btn-secondary",onClick:()=>l("/portfolio"),children:"Portfolio"}),e.jsx("button",{className:"btn btn-details",onClick:()=>l("/payment-details",{state:s}),children:"View Payment Details"}),e.jsx("button",{className:"btn btn-primary",onClick:()=>l("/buy-gold"),children:n?"Buy More →":"Try Again →"})]})]})})]})]})};export{O as default};
