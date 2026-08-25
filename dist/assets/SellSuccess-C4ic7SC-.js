import{u as p,b as m,j as e}from"./index-Bti0KOuG.js";const b=()=>{const s=p(),l=m().state;if(!l)return s("/sell-gold"),null;const{transactionId:n,amount:o,grams:i,sellRate:t,paymentStatus:r,pergramSellingPrice:d}=l,c=d||t,a=r==="FAILED"||r==="UNKNOWN",x=new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!0}).replace(" at ",", ");return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page { min-height: 100vh; background: #f7f8fa; font-family: 'Sora', sans-serif; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; padding: 24px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .icon { width: 48px; height: 48px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .icon.success { background: #f0fdf4; border: 2px solid #16a34a; }
        .icon.failed { background: #fef2f2; border: 2px solid #dc2626; }
        .title { font-size: 1.1rem; font-weight: 600; color: #1c2b3a; margin-bottom: 16px; }
        .summary { background: #fafbfc; border: 1px solid #e8ecf0; border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: left; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.8rem; }
        .row:not(:last-child) { border-bottom: 1px solid #f0f2f5; margin-bottom: 6px; }
        .label { color: #9eaab8; }
        .value { font-weight: 600; color: #1c2b3a; }
        .value.failed { color: #dc2626; }
        .value.success { color: #16a34a; }
        .actions { display: flex; gap: 10px; }
        .btn { flex: 1; padding: 10px 16px; border: none; border-radius: 7px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-secondary { background: #fff; color: #1c2b3a; border: 1px solid #e0e4e8; }
        .btn-secondary:hover { border-color: #d9a020; background: #fffcf0; }
        .btn-primary { background: linear-gradient(135deg, #f0bb3a, #d9a020); color: #0d1f3c; box-shadow: 0 3px 12px rgba(217,160,32,0.22); }
        .btn-primary:hover { box-shadow: 0 6px 18px rgba(217,160,32,0.32); transform: translateY(-1px); }
      `}),e.jsx("div",{className:"page",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:`icon ${a?"failed":"success"}`,children:a?e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M18 6L6 18M6 6L18 18",stroke:"#dc2626",strokeWidth:"2",strokeLinecap:"round"})}):e.jsx("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:e.jsx("path",{d:"M20 6L9 17L4 12",stroke:"#16a34a",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("h1",{className:"title",children:a?"Payment Failed":"Gold Sold Successfully"}),e.jsxs("div",{className:"summary",children:[e.jsxs("div",{className:"row",children:[e.jsx("span",{className:"label",children:"Amount"}),e.jsxs("span",{className:"value",children:["₹",parseFloat(o).toFixed(2)]})]}),e.jsxs("div",{className:"row",children:[e.jsx("span",{className:"label",children:"Gold Sold"}),e.jsxs("span",{className:"value",children:[parseFloat(i).toFixed(3)," grams"]})]}),e.jsxs("div",{className:"row",children:[e.jsx("span",{className:"label",children:"Sell Rate"}),e.jsxs("span",{className:"value",children:["₹",parseFloat(c).toFixed(2)," / gram"]})]}),e.jsxs("div",{className:"row",children:[e.jsx("span",{className:"label",children:"Transaction ID"}),e.jsx("span",{className:"value",children:n})]}),e.jsxs("div",{className:"row",children:[e.jsx("span",{className:"label",children:"Status"}),e.jsx("span",{className:`value ${a?"failed":"success"}`,children:a?"FAILED":"SUCCESS"})]}),e.jsxs("div",{className:"row",children:[e.jsx("span",{className:"label",children:"Date & Time"}),e.jsx("span",{className:"value",children:x})]})]}),e.jsxs("div",{className:"actions",children:[e.jsx("button",{className:"btn btn-secondary",onClick:()=>s("/portfolio"),children:"View Portfolio"}),e.jsx("button",{className:"btn btn-primary",onClick:()=>s("/sell-gold"),children:"Sell More →"})]})]})})]})};export{b as default};
