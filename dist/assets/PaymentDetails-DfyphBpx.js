import{u,b as f,j as e}from"./index-Bti0KOuG.js";const N=()=>{const r=u(),d=f(),l=d.state;console.log("PaymentDetails - location.state:",d.state),console.log("PaymentDetails - transactionData:",l);let a=l;if(!a){const o=sessionStorage.getItem("paymentSuccessData");o&&(a=JSON.parse(o),console.log("PaymentDetails - restored from sessionStorage:",a))}if(!a)return console.log("PaymentDetails - no data found, redirecting to portfolio"),r("/portfolio"),null;const i=(a==null?void 0:a.transactionId)||(a==null?void 0:a.orderId)||"";a!=null&&a.orderId||a!=null&&a.transactionId;const t=parseFloat(a==null?void 0:a.processingFee)||0,n=parseFloat(a==null?void 0:a.total)||0,c=n+t,p=parseFloat(a==null?void 0:a.grams)>0?parseFloat(a.grams).toFixed(6):(a==null?void 0:a.grams)||"0",m=parseFloat(a==null?void 0:a.goldRate)>0?parseFloat(a.goldRate).toLocaleString("en-IN",{maximumFractionDigits:2}):null,x=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!0}),g=()=>{const o=`
DIGITAL GOLD PURCHASE RECEIPT
================================

Transaction ID: ${i}
Date & Time: ${x}
Payment Method: ${l.paymentMethod==="upi"?"UPI (Cashfree)":"Wallet"}

ORDER DETAILS
-------------
Quantity: ${p} grams
Gold Rate: ₹${m||"N/A"} / gram
Purity: 24K · 999

PAYMENT BREAKDOWN
-----------------
Subtotal: ₹${n.toLocaleString()}${t>0?`
Processing Fee: ₹${t.toFixed(2)}`:""}
Total Amount: ₹${c.toLocaleString()}

Status: SUCCESS
================================
Thank you for your purchase!
    `.trim(),h=new Blob([o],{type:"text/plain"}),b=URL.createObjectURL(h),s=document.createElement("a");s.href=b,s.download=`gold-purchase-${i}.txt`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(b)};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
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
        
        .main {
          max-width: 600px; margin: 0 auto;
          padding: 32px 40px 56px;
        }
        
        .card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          position: relative;
        }
        
        .card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }
        
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f2f5;
          margin-bottom: 24px;
        }
        
        .title {
          font-size: 1.1rem; font-weight: 600;
          color: #1c2b3a; margin-bottom: 4px;
        }
        
        .subtitle {
          font-size: 0.8rem; color: #9eaab8;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 0.6rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #9eaab8; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #f0f2f5; }
        
        .detail-row {
          display: flex; justify-content: space-between;
          padding: 8px 0; font-size: 0.85rem;
        }
        .detail-row:not(:last-child) {
          border-bottom: 1px solid #f7f8fa;
          margin-bottom: 8px;
        }
        .detail-label { color: #9eaab8; }
        .detail-value { font-weight: 600; color: #1c2b3a; }
        .detail-value.txn-id {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          word-break: break-all;
          color: #b8720a;
        }
        .detail-value.total {
          font-size: 1rem;
          color: #b8720a;
        }
        
        .actions {
          display: flex; gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #f0f2f5;
        }
        
        .btn {
          flex: 1; padding: 12px 16px;
          border: none; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        
        .btn-secondary {
          background: #fff;
          color: #1c2b3a;
          border: 1px solid #e0e4e8;
        }
        .btn-secondary:hover {
          border-color: #d9a020;
          background: #fffcf0;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #0d1f3c;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
        }
        .btn-primary:hover {
          box-shadow: 0 6px 18px rgba(217,160,32,0.32);
          transform: translateY(-1px);
        }
      `}),e.jsxs("div",{className:"page",children:[e.jsx("section",{className:"ro-topbar",children:e.jsxs("div",{className:"ro-topbar-in",children:[e.jsx("button",{className:"ro-back",onClick:()=>r(-1),children:"←"}),e.jsx("span",{className:"ro-topbar-sep"}),e.jsx("span",{className:"ro-topbar-title",children:"Payment Details"}),e.jsx("span",{className:"ro-topbar-sep"}),e.jsx("span",{className:"ro-topbar-sub",children:"Complete transaction information"})]})}),e.jsx("main",{className:"main",children:e.jsxs("div",{className:"card",children:[e.jsxs("div",{className:"header",children:[e.jsx("h1",{className:"title",children:"Payment Receipt"}),e.jsx("p",{className:"subtitle",children:x})]}),e.jsxs("div",{className:"section",children:[e.jsx("div",{className:"section-title",children:"Transaction Details"}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Transaction ID"}),e.jsx("span",{className:"detail-value txn-id",children:i})]}),a.paymentMethod&&e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Payment Method"}),e.jsx("span",{className:"detail-value",children:a.paymentMethod==="upi"?"UPI (Cashfree)":`Wallet (${a.wallet||"Wallet"})`})]})]}),e.jsxs("div",{className:"section",children:[e.jsx("div",{className:"section-title",children:"Order Details"}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Quantity"}),e.jsxs("span",{className:"detail-value",children:[p," grams"]})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Gold Rate"}),e.jsxs("span",{className:"detail-value",children:["₹",m||"N/A"," / gram"]})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Purity"}),e.jsx("span",{className:"detail-value",children:"24K · 999"})]})]}),e.jsxs("div",{className:"section",children:[e.jsx("div",{className:"section-title",children:"Payment Breakdown"}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Subtotal"}),e.jsxs("span",{className:"detail-value",children:["₹",n.toLocaleString()]})]}),t>0&&e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Processing Fee"}),e.jsxs("span",{className:"detail-value",children:["₹",t.toFixed(2)]})]}),e.jsxs("div",{className:"detail-row",children:[e.jsx("span",{className:"detail-label",children:"Total Amount"}),e.jsxs("span",{className:"detail-value total",children:["₹",c.toLocaleString()]})]})]}),e.jsxs("div",{className:"actions",children:[e.jsx("button",{className:"btn btn-secondary",onClick:()=>r("/portfolio"),children:"Back to Portfolio"}),e.jsx("button",{className:"btn btn-primary",onClick:g,children:"📄 Download Receipt"})]})]})})]})]})};export{N as default};
