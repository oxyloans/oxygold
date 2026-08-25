import{u as R,b as D,r as i,j as e,A as N}from"./index-Bti0KOuG.js";import{g as $}from"./userUtils-7c406hZg.js";import{apiCall as j}from"./tokenManager-BEtaPY4e.js";const _=()=>{const s=R(),h=D().state,[m,g]=i.useState(1),[f,S]=i.useState(""),[F,I]=i.useState("PENDING"),[k,x]=i.useState("Processing your sell order...");if(!h)return s("/sell-gold"),null;const{transactionId:t,beneficiaryId:b,status:v,amount:o,grams:c,sellRate:a,bankDetails:l,message:E,userId:y}=h,T=`${N}/oxygold-api/digital-gold/sell/execute`,A=`${N}/oxygold-api/digital-gold/payout/status`;return i.useEffect(()=>{const d=y||$();if(!d){s("/login");return}const w=setTimeout(async()=>{try{g(1),x("Executing sell order...");const n=await j(`${T}?txnId=${t}`,{method:"POST"});if(console.log("Sell Execute Response:",n),n.success&&n.data){const{transferId:p,status:U,message:P}=n.data;S(p),g(2),x(P||"Bank payout initiated..."),setTimeout(async()=>{try{g(3),x("Checking payment status...");const r=await j(`${A}?transferId=${p}&txnId=${t}`,{method:"GET"});if(console.log("Payout Status Response:",r),r.success&&r.data){const{status:u,message:M}=r.data;I(u),setTimeout(()=>{s("/sell-success",{state:{transactionId:t,transferId:p,beneficiaryId:b,status:u,amount:o,grams:c,sellRate:a,bankDetails:l,message:M,userId:d,paymentStatus:u==="UNKNOWN"?"FAILED":u,pergramSellingPrice:a,purchaseType:"GRAMS",paymentMode:"BANK",productId:4}})},2e3)}else throw new Error("Failed to check payment status")}catch(r){console.error("Status check failed:",r),s("/sell-success",{state:{transactionId:t,transferId:p,beneficiaryId:b,status:"FAILED",amount:o,grams:c,sellRate:a,bankDetails:l,message:"Payment status check failed",userId:d,paymentStatus:"FAILED",pergramSellingPrice:a,purchaseType:"GRAMS",paymentMode:"BANK",productId:4}})}},3e3)}else throw new Error(n.message||"Sell execution failed")}catch(n){console.error("Transaction processing failed:",n),s("/sell-success",{state:{transactionId:t,beneficiaryId:b,status:"FAILED",amount:o,grams:c,sellRate:a,bankDetails:l,message:"Transaction processing failed",userId:d,paymentStatus:"FAILED",pergramSellingPrice:a,purchaseType:"GRAMS",paymentMode:"BANK",productId:4}})}},1e3);return()=>clearTimeout(w)},[s,t,v,o,c,a,l,E,y]),e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #faf7f0;
          font-family: 'Inter', sans-serif;
          color: #1a1612;
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

        .content {
          text-align: center;
        }

        /* Spinner */
        .spinner-wrap {
          display: flex; justify-content: center; margin-bottom: 24px;
        }
        .spinner {
          position: relative; width: 56px; height: 56px;
        }
        .spinner-ring {
          position: absolute; inset: 0;
          border: 3px solid transparent;
          border-top-color: #d4a017;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .title {
          font-size: 1.25rem; font-weight: 700;
          color: #1a1612; margin-bottom: 8px;
        }
        .subtitle {
          font-size: 0.875rem; color: #8a7a65;
          margin-bottom: 24px;
        }

        /* Steps */
        .steps {
          display: flex; flex-direction: column; gap: 12px;
        }
        .step {
          display: flex; align-items: center; gap: 12px;
          font-size: 0.875rem; color: #8a7a65;
        }
        .step-dot {
          width: 6px; height: 6px;
          background: #d4a017; border-radius: 50%;
          flex-shrink: 0;
        }
        .step.inactive .step-dot {
          background: #ddd;
        }
      `}),e.jsxs("div",{className:"page",children:[e.jsx("section",{className:"banner",children:e.jsxs("div",{className:"banner-in",children:[e.jsx("button",{className:"back-btn",onClick:()=>s("/bank-account"),children:"←"}),e.jsx("span",{className:"banner-sep"}),e.jsx("span",{className:"banner-title",children:"Processing Your Sell Order"}),e.jsx("span",{className:"banner-sep"}),e.jsx("span",{className:"banner-sub",children:"Please wait..."})]})}),e.jsx("main",{className:"main",children:e.jsxs("div",{className:"content",children:[e.jsx("div",{className:"spinner-wrap",children:e.jsx("div",{className:"spinner",children:e.jsx("div",{className:"spinner-ring"})})}),e.jsx("h1",{className:"title",children:"Processing Your Sell Order"}),e.jsx("p",{className:"subtitle",children:k}),e.jsxs("p",{className:"subtitle",children:["Transaction ID: ",t||"Generating..."]}),f&&e.jsxs("p",{className:"subtitle",children:["Transfer ID: ",f]}),e.jsxs("div",{className:"steps",children:[e.jsxs("div",{className:`step${m>=1?"":" inactive"}`,children:[e.jsx("div",{className:"step-dot"}),e.jsx("span",{children:"Executing sell order"})]}),e.jsxs("div",{className:`step${m>=2?"":" inactive"}`,children:[e.jsx("div",{className:"step-dot"}),e.jsx("span",{children:"Initiating bank payout"})]}),e.jsxs("div",{className:`step${m>=3?"":" inactive"}`,children:[e.jsx("div",{className:"step-dot"}),e.jsx("span",{children:"Verifying payment status"})]})]})]})})]})]})};export{_ as default};
