import{u as O,b as D,r as s,j as e,A as W}from"./index-Bti0KOuG.js";import{T as B}from"./TermsModal-BXCvZgl2.js";import{l as $}from"./script.esm-B7mpbZSe.js";import F,{apiCall as U}from"./tokenManager-BEtaPY4e.js";const Y=({onDataPass:_})=>{const l=O(),v=D(),[x,P]=s.useState(null),r=v.state||JSON.parse(localStorage.getItem("tempPaymentData")||"{}"),[o,S]=s.useState(""),[c,b]=s.useState(""),[i,I]=s.useState((r==null?void 0:r.timeLeft)??300),[h,u]=s.useState(!1),[y,M]=s.useState(!1),[T,w]=s.useState(!1),[z,k]=s.useState(!1),E=`${W}/oxygold-api/digital-gold/buy`;s.useEffect(()=>{(!r||!Object.keys(r).length)&&l("/buy-gold")},[]),s.useEffect(()=>{(async()=>{try{const t=await $({mode:"production"});P(t)}catch(t){console.error("Cashfree initialization failed:",t)}})()},[]),s.useEffect(()=>{if(i<=0){l("/buy-gold",{state:{error:"Price lock expired. Please try again."}});return}const a=setInterval(()=>{I(t=>Math.max(0,t-1))},1e3);return()=>clearInterval(a)},[i,l]);const p=a=>{const t=parseFloat(a);return isNaN(t)?0:t},R=a=>`${Math.floor(a/60)}:${(a%60).toString().padStart(2,"0")}`,j=[{id:"upi",name:"UPI",desc:"Google Pay, PhonePe, Paytm or any UPI app",recommended:!0,fee:0},{id:"wallet",name:"Wallets",desc:"Paytm, Amazon Pay, Mobikwik",recommended:!1,fee:0}],A=["Paytm","Amazon Pay","Mobikwik"],C=async(a,t)=>{if(!x)throw new Error("Payment system not ready. Please refresh and try again.");const n={...r,orderId:t,transactionId:t,paymentMethod:"upi"};sessionStorage.setItem("paymentSuccessData",JSON.stringify(n)),console.log("[doPayment] Saved to sessionStorage:",{grams:n.grams,goldRate:n.goldRate,total:n.total});const f=`${window.location.origin}/payment-success?order_id=${t}`;try{await x.checkout({paymentSessionId:a,redirectTarget:"_self",returnUrl:f})}catch(m){throw console.error("Cashfree checkout error:",m),new Error("Failed to initialize payment. Please try again.")}},L=async()=>{var t,n,f;if(!o||!y||o==="wallet"&&!c||i<=0){k(!0),setTimeout(()=>k(!1),3e3);return}if(!F.getInstance().isLoggedIn()){l("/login",{state:{from:"/payment-method"}});return}u(!0);try{const m=o==="upi"?"CASHFREE":"WALLET",d=await U(E,{method:"POST",body:JSON.stringify({userId:r.userId,purchaseType:r.buyMode==="rupees"?"AMOUNT":"GRAMS",amount:r.buyMode==="rupees"?Math.round(p(r.amount)*100)/100:0,grams:r.buyMode==="grams"?Math.round(p(r.grams)*100)/100:0,paymentMode:m,pergramPrice:r.goldRate,productId:4,returnUrl:`${window.location.origin}/payment-success?order_id={ORDER_ID}`})});if(!d.success)throw new Error(d.message||"Buy API failed");const N=((t=d.data)==null?void 0:t.transactionId)||((n=d.data)==null?void 0:n.id)||d.message;if(!N)throw new Error("No transaction ID in Buy API response");if(o==="upi"){if(!((f=d.data)!=null&&f.paymentSessionId))throw new Error("No paymentSessionId in Buy API response");await C(d.data.paymentSessionId,N);return}throw new Error("Wallet payments not implemented yet")}catch(m){l("/payment-success",{state:{status:"failure",message:m.message||"Payment failed",paymentMethod:o,...r}})}finally{u(!1)}},g=j.find(a=>a.id===o);return g!=null&&g.fee,e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pm-page {
          min-height: 100vh;
          background: #f8f6fb;
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
        }

        /* ── TIMER BANNER ── */
        .pm-timer {
          border-radius: 8px; padding: 12px 16px;
          margin-bottom: 20px;
          border: 1px solid;
        }
        .pm-timer.ok      { background: #f0fdf4; border-color: rgba(22,163,74,0.22); }
        .pm-timer.urgent  { background: #fffbeb; border-color: rgba(217,119,6,0.28); }
        .pm-timer-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 8px;
        }
        .pm-timer-txt { font-size: 0.8rem; font-weight: 500; }
        .pm-timer-txt.ok      { color: #16a34a; }
        .pm-timer-txt.urgent  { color: #d97706; }
        .pm-timer-pill {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
          padding: 2px 10px; border-radius: 20px;
        }
        .pm-timer-pill.ok     { background: rgba(22,163,74,0.1);  color: #16a34a; }
        .pm-timer-pill.urgent { background: rgba(217,119,6,0.1);  color: #d97706; }
        .pm-timer-bar-wrap { height: 3px; background: rgba(0,0,0,0.06); border-radius: 99px; }
        .pm-timer-bar { height: 100%; border-radius: 99px; transition: width 1s linear; }
        .pm-timer-bar.ok     { background: #16a34a; }
        .pm-timer-bar.urgent { background: #d97706; }

        /* ── TOP BAR ── */
        .pm-topbar {
          background: rgba(26, 48, 120, 0.96);
          border-bottom: 1px solid rgba(132, 128, 6, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 16px 56px;
        }
        .pm-topbar-in {
          max-width: 1000px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; gap: 12px;
        }
        .pm-back {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: rgba(240,187,58,0.08); border: 1px solid rgba(240,187,58,0.28);
          border-radius: 7px; cursor: pointer;
          color: rgba(255,255,255,0.8); font-size: 0.9rem; flex-shrink: 0;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .pm-back:hover { 
          background: rgba(240,187,58,0.12); 
          border-color: rgba(240,187,58,0.55);
          color: #f0bb3a;
        }
        .pm-topbar-sep { width: 1px; height: 14px; background: rgba(240,187,58,0.18); flex-shrink: 0; }
        .pm-topbar-title { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .pm-topbar-sub { font-size: 0.78rem; color: rgba(255,255,255,0.58); }

        /* ── MAIN ── */
        .pm-main {
          max-width: 1000px; margin: 0 auto;
          padding: 28px 48px 56px;
        }

        /* ── CARD ── */
        .pm-card {
          background: #ffffff;
          border: 1px solid #ede8f5;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .pm-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #7c3aed, #d9a020, #f0bb3a);
          opacity: 0.5;
        }

        /* ── WARN STRIP ── */
        .pm-warn-strip {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 20px;
          background: #fffbeb;
          border-bottom: 1px solid rgba(217,119,6,0.15);
          font-size: 0.72rem; color: #d97706; line-height: 1.55;
        }

        /* ── GRID ── */
        .pm-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0; padding: 22px 20px;
        }
        .pm-grid-left {
          padding-right: 24px;
          border-right: 1px solid #f0eaf8;
        }
        .pm-grid-right {
          padding-left: 24px;
        }

        .pm-sec-title {
          font-size: 0.84rem; font-weight: 600;
          color: #1a1a2e; margin-bottom: 16px;
        }

        /* ── ORDER DETAIL ROWS ── */
        .pm-detail {
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0; border-bottom: 1px solid #f5f0fc;
        }
        .pm-detail:last-of-type { border-bottom: none; }
        .pm-d-lbl {
          font-size: 0.76rem; color: #999; font-weight: 500;
        }
        .pm-d-val { font-size: 0.78rem; font-weight: 600; color: #1a1a2e; }
        .pm-d-val.gold { color: #b8860b; }

        /* total box */
        .pm-total-box {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 12px; margin-top: 14px;
          background: #faf8ff;
          border: 1px solid #ede8f5; border-radius: 7px;
        }
        .pm-total-lbl { font-size: 0.84rem; font-weight: 600; color: #1a1a2e; }
        .pm-total-val { font-size: 1.1rem; font-weight: 700; color: #b8860b; }

        /* ── PAYMENT METHOD ROWS ── */
        .pm-methods-list {
          display: flex; flex-direction: column; gap: 7px;
        }
        .pm-method-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 11px;
          border: 1.5px solid #ede8f5;
          border-radius: 8px; cursor: pointer;
          transition: border-color 0.16s, background 0.16s;
          background: #fff;
        }
        .pm-method-item:hover {
          border-color: rgba(124,58,237,0.3);
          background: #faf8ff;
        }
        .pm-method-item.selected {
          border-color: #7c3aed;
          background: #faf8ff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.06);
        }
        .pm-radio { display: none; }
        .pm-radio-circle {
          width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
          border: 1.5px solid #d0c8e8;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.16s; background: #fff;
        }
        .pm-method-item.selected .pm-radio-circle {
          border-color: #7c3aed; background: #7c3aed;
        }
        .pm-radio-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #fff; opacity: 0; transition: opacity 0.16s;
        }
        .pm-method-item.selected .pm-radio-dot { opacity: 1; }

        .pm-method-info { flex: 1; min-width: 0; }
        .pm-method-name-row {
          display: flex; align-items: center; gap: 6px; margin-bottom: 1px;
        }
        .pm-method-name { font-size: 0.8rem; font-weight: 600; color: #1a1a2e; }
        .pm-method-badge {
          font-size: 0.63rem; font-weight: 700; letter-spacing: 0.04em;
          padding: 1px 7px; border-radius: 20px;
          background: #f0fdf4; color: #16a34a;
          border: 1px solid rgba(22,163,74,0.2);
        }
        .pm-method-desc { font-size: 0.71rem; color: #aaa; }

        /* wallet chips */
        .pm-wallet-sub {
          margin-top: 6px; padding: 9px 11px;
          background: #f9f7fe; border: 1px solid #ede8f5;
          border-radius: 7px; display: flex; gap: 7px; flex-wrap: wrap;
        }
        .pm-wallet-chip {
          padding: 3px 11px; border-radius: 20px;
          font-size: 0.71rem; font-weight: 600;
          border: 1.5px solid #ede8f5;
          background: #fff; cursor: pointer; color: #555;
          transition: all 0.15s; font-family: 'Inter', sans-serif;
        }
        .pm-wallet-chip:hover { border-color: #9b72cf; color: #3d2470; }
        .pm-wallet-chip.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }

        /* ── DIVIDER ── */
        .pm-divider { height: 1px; background: #f0eaf8; margin: 0 20px; }

        /* ── BOTTOM ── */
        .pm-bottom {
          padding: 18px 20px 20px;
          background: #faf8ff;
          border-top: 1px solid #f0eaf8;
        }

        /* Fee breakdown */
        .pm-fee-breakdown {
          background: #fff;
          border: 1px solid #ede8f5;
          border-radius: 7px;
          padding: 12px;
          margin-bottom: 14px;
          font-size: 0.75rem;
        }
        .pm-fee-row {
          display: flex; justify-content: space-between;
          padding: 4px 0;
        }
        .pm-fee-row:not(:last-child) {
          border-bottom: 1px solid #f5f0fc;
          margin-bottom: 4px;
          padding-bottom: 4px;
        }
        .pm-fee-lbl { color: #888; }
        .pm-fee-val { font-weight: 600; color: #1a1a2e; }
        .pm-fee-val.total { color: #b8860b; font-size: 0.8rem; }

        .pm-proceed-btn {
          width: 100%; padding: 11px 16px;
          border: none; border-radius: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem; font-weight: 700; cursor: pointer;
          transition: box-shadow 0.18s, filter 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          letter-spacing: 0.01em;
        }
        .pm-proceed-btn.active {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #1a0d05;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .pm-proceed-btn.active:hover {
          filter: brightness(1.05);
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
        }
        .pm-proceed-btn.inactive {
          background: #ede8f5; color: #bbb; cursor: not-allowed;
        }
        .pm-terms-label {
          display: flex; align-items: flex-start; gap: 8px;
          cursor: pointer; margin-bottom: 4px;
        }
        .pm-checkbox {
          width: 15px; height: 15px; margin-top: 2px;
          accent-color: #d9a020; cursor: pointer; flex-shrink: 0;
        }
        .pm-terms-txt { font-size: 0.78rem; color: #888; line-height: 1.5; }
        .pm-terms-link {
          color: #b8860b; font-weight: 600;
          background: none; border: none; cursor: pointer;
          text-decoration: underline; text-underline-offset: 2px;
          font-size: inherit;
        }
        .pm-terms-link:hover { color: #d9a020; }
        .pm-terms-err { font-size: 0.72rem; color: #dc2626; font-weight: 500; margin-top: 4px; }

        .pm-secure {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          margin-top: 10px; font-size: 0.7rem; color: #bbb;
        }

        .pm-spin {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(26,13,5,0.2);
          border-top-color: #1a0d05;
          animation: spin 0.65s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .pm-main { padding: 20px 24px 40px; }
          .pm-grid { grid-template-columns: 1fr; }
          .pm-grid-left {
            padding-right: 0; border-right: none;
            border-bottom: 1px solid #f0eaf8;
            padding-bottom: 18px; margin-bottom: 18px;
          }
          .pm-grid-right { padding-left: 0; }
        }
      `}),e.jsxs("div",{className:"pm-page",children:[e.jsx("section",{className:"pm-topbar",children:e.jsxs("div",{className:"pm-topbar-in",children:[e.jsx("button",{className:"pm-back",onClick:()=>l(-1),children:"←"}),e.jsx("span",{className:"pm-topbar-sep"}),e.jsx("span",{className:"pm-topbar-title",children:"Select Payment Method"}),e.jsx("span",{className:"pm-topbar-sep"}),e.jsx("span",{className:"pm-topbar-sub",children:"Choose how you'd like to pay"})]})}),e.jsx("main",{className:"pm-main",children:e.jsxs("div",{className:"pm-card",children:[e.jsxs("div",{className:"pm-warn-strip",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 16 16",fill:"none",style:{flexShrink:0,marginTop:1},children:[e.jsx("path",{d:"M8 1L1 15H15L8 1Z",stroke:"#d97706",strokeWidth:"1.5",strokeLinejoin:"round"}),e.jsx("path",{d:"M8 6V9M8 11V11.5",stroke:"#d97706",strokeWidth:"1.5",strokeLinecap:"round"})]}),e.jsxs("span",{children:["Price locked for ",R(i),"  •  Transaction cannot be cancelled once confirmed"]})]}),e.jsxs("div",{className:"pm-grid",children:[e.jsxs("div",{className:"pm-grid-left",children:[e.jsx("div",{className:"pm-sec-title",children:"Order Details"}),e.jsxs("div",{className:"pm-detail",children:[e.jsx("span",{className:"pm-d-lbl",children:"Gold Rate"}),e.jsxs("span",{className:"pm-d-val gold",children:["₹",r.goldRate.toLocaleString()," / gram"]})]}),e.jsxs("div",{className:"pm-detail",children:[e.jsx("span",{className:"pm-d-lbl",children:"Quantity"}),e.jsxs("span",{className:"pm-d-val",children:[p(r.grams).toFixed(3)," grams"]})]}),e.jsxs("div",{className:"pm-detail",children:[e.jsx("span",{className:"pm-d-lbl",children:"Purity"}),e.jsx("span",{className:"pm-d-val",children:"24K · 999"})]}),e.jsxs("div",{className:"pm-detail",children:[e.jsx("span",{className:"pm-d-lbl",children:"Gold Value"}),e.jsxs("span",{className:"pm-d-val",children:["₹",p(r.rupees).toLocaleString()]})]}),e.jsxs("div",{className:"pm-detail",children:[e.jsx("span",{className:"pm-d-lbl",children:"GST (3%)"}),e.jsxs("span",{className:"pm-d-val",children:["₹",p(r.gst).toFixed(2)]})]}),e.jsxs("div",{className:"pm-total-box",children:[e.jsx("span",{className:"pm-total-lbl",children:"Total Amount"}),e.jsxs("span",{className:"pm-total-val",children:["₹",p(r.total).toLocaleString()]})]})]}),e.jsxs("div",{className:"pm-grid-right",children:[e.jsx("div",{className:"pm-sec-title",children:"Payment Method"}),e.jsx("div",{className:"pm-methods-list",children:j.map(a=>e.jsxs("div",{children:[e.jsxs("label",{className:`pm-method-item ${o===a.id?"selected":""}`,children:[e.jsx("input",{type:"radio",name:"payment-method",value:a.id,className:"pm-radio",checked:o===a.id,onChange:()=>{S(a.id),b("")}}),e.jsx("div",{className:"pm-radio-circle",children:e.jsx("div",{className:"pm-radio-dot"})}),e.jsxs("div",{className:"pm-method-info",children:[e.jsxs("div",{className:"pm-method-name-row",children:[e.jsx("span",{className:"pm-method-name",children:a.name}),a.recommended&&e.jsx("span",{className:"pm-method-badge",children:"Recommended"})]}),e.jsx("span",{className:"pm-method-desc",children:a.desc})]})]}),a.id==="wallet"&&o==="wallet"&&e.jsx("div",{className:"pm-wallet-sub",children:A.map(t=>e.jsx("button",{className:`pm-wallet-chip ${c===t?"active":""}`,onClick:()=>b(t),children:t},t))})]},a.id))})]})]}),e.jsx("div",{className:"pm-divider"}),e.jsxs("div",{className:"pm-bottom",children:[e.jsxs("label",{className:"pm-terms-label",children:[e.jsx("input",{type:"checkbox",className:"pm-checkbox",checked:y,onChange:a=>M(a.target.checked)}),e.jsxs("span",{className:"pm-terms-txt",children:["I agree to the"," ",e.jsx("button",{type:"button",className:"pm-terms-link",onClick:()=>w(!0),children:"Terms & Conditions"})]})]}),z&&e.jsx("div",{className:"pm-terms-err",children:o==="wallet"&&!c?"Please select a wallet to continue":i<=0?"Price lock expired. Please start over.":"Please accept the Terms & Conditions to continue"}),e.jsx("button",{className:`pm-proceed-btn ${o&&(o!=="wallet"||c)&&i>0?"active":"inactive"}`,onClick:L,disabled:!o||o==="wallet"&&!c||h||i<=0,children:h?e.jsx("span",{className:"pm-spin"}):i<=0?"Price Lock Expired":o?"Proceed to Payment →":"Select a Payment Method"}),e.jsxs("div",{className:"pm-secure",children:[e.jsxs("svg",{width:"11",height:"11",viewBox:"0 0 16 16",fill:"none",children:[e.jsx("rect",{x:"3",y:"7",width:"10",height:"7",rx:"1",stroke:"#ccc",strokeWidth:"1.3"}),e.jsx("path",{d:"M5 7V5C5 3.34 6.34 2 8 2C9.66 2 11 3.34 11 5V7",stroke:"#ccc",strokeWidth:"1.3",strokeLinecap:"round"})]}),"Secured by 256-bit SSL encryption"]})]})]})})]}),e.jsx(B,{isOpen:T,onClose:()=>w(!1),flowType:"buy"})]})};export{Y as default};
