const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/tokenManager-BEtaPY4e.js","assets/index-Bti0KOuG.js","assets/index-DAReG4rN.css"])))=>i.map(i=>d[i]);
import{u as w,b as y,r as g,j as e,A,_ as E}from"./index-Bti0KOuG.js";import{g as N}from"./userUtils-7c406hZg.js";import"./tokenManager-BEtaPY4e.js";const B=()=>{const c=w(),i=y().state,[l,m]=g.useState(""),[d,b]=g.useState(""),[p,n]=g.useState(""),[f,u]=g.useState(!1),x=`${A}/oxygold-api/auth/saveBankDetails`;if(!i)return c("/sell-gold"),null;const v=async()=>{if(!l||!d){n("Please fill all fields");return}if(l.length<9||l.length>18){n("Invalid account number (9–18 digits)");return}if(!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(d)){n("Invalid IFSC code format (e.g. SBIN0001234)");return}const a=(i==null?void 0:i.userId)||N();if(!a){c("/login");return}try{u(!0),n("");const r={userId:parseInt(a.toString()),accountNumber:l.trim(),ifsc:d.trim().toUpperCase(),beneActive:!1};console.log("=== SAVE BANK DETAILS API CALL START ==="),console.log("API URL:",x),console.log("Request Body:",JSON.stringify(r,null,2)),console.log("=== GETTING ACCESS TOKEN ===");const t=(await E(async()=>{const{default:k}=await import("./tokenManager-BEtaPY4e.js");return{default:k}},__vite__mapDeps([0,1,2]))).default.getInstance();if(!t.isLoggedIn())throw new Error("User not logged in");const h=await t.getValidAccessToken();console.log("Access token obtained:",h?"Yes":"No"),console.log("=== MAKING API CALL ===");const o=await fetch(x,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${h}`},body:JSON.stringify(r)});console.log("=== SAVE BANK DETAILS API RESPONSE ==="),console.log("Response status:",o.status),console.log("Response ok:",o.ok),console.log("Response statusText:",o.statusText),console.log("Response headers:",Object.fromEntries(o.headers.entries()));const s=await o.text();if(console.log("Response text length:",s.length),console.log("Response text:",s),!o.ok)throw console.error("=== API CALL FAILED ==="),console.error("Status:",o.status),console.error("Status Text:",o.statusText),console.error("Response:",s),o.status===401?new Error("Authentication failed. Please login again."):o.status===400?new Error(`Invalid request: ${s||"Please check your bank details"}`):o.status===500?new Error(`Server error: ${s||"Please try again later"}`):o.status===404?new Error("Service not available. Please try again later."):o.status>=500?new Error("Server error. Please try again later."):new Error(`Failed to save bank details (${o.status}): ${s||"Please try again"}`);if(s==="Bank verification successful"||s.includes("Bank verification successful"))console.log("=== BANK DETAILS SAVED SUCCESSFULLY ==="),c("/sell-summary",{state:{...i,userId:a,bankDetailsAdded:!0,newBankDetails:{accountNumber:l,ifsc:d,userId:parseInt(a.toString())}}});else throw console.error("=== UNEXPECTED RESPONSE FORMAT ==="),console.error("Response text:",s),new Error(`Bank verification failed - unexpected response: ${s}`)}catch(r){console.error("=== SAVE BANK DETAILS ERROR ==="),console.error("Error type:",typeof r),console.error("Error:",r),r instanceof Error&&(console.error("Error message:",r.message),console.error("Error stack:",r.stack));let t="Failed to save bank details";r instanceof Error?r.message.includes("Failed to fetch")||r.message.includes("NetworkError")?t="Network error. Please check your connection and try again.":r.message.includes("Authentication")?t="Authentication failed. Please login again.":t=r.message:typeof r=="string"&&(t=r),console.error("Final error message:",t),n(t)}finally{u(!1)}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold-400: #d4a017;
          --gold-500: #b8860b;
          --cream:    #faf7f0;
          --border:   rgba(212,160,23,0.22);
          --text:     #1a1612;
          --muted:    #7a6a55;
          --dim:      #b0a090;
          --success:  #16a34a;
          --s-bg:     #f0fdf4;
          --error:    #dc2626;
          --e-bg:     #fef2f2;
        }

        body { background: var(--cream); }
        .page { min-height: 100vh; background: var(--cream); }

        .main-wrap {
          max-width: 580px;
          margin: 0 auto;
          padding: 32px 20px 48px;
        }

        .page-header { text-align: center; margin-bottom: 20px; }
        .page-title  { font-size: 1.25rem; font-weight: 700; color: var(--text); font-family: inherit; }
        .page-sub    { font-size: 0.8rem; color: var(--muted); margin-top: 3px; }

        /* Card */
        .card {
          background: #fff;
          border: 1px solid var(--border);
          border-top: 3px solid var(--gold-400);
          border-radius: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .card-head {
          padding: 14px 22px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, #fdf9f0, #fff);
          border-radius: 11px 11px 0 0;
          display: flex; align-items: center; gap: 8px;
        }
        .card-title { font-size: 0.9375rem; font-weight: 600; color: var(--text); }

        .info-strip {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 22px;
          background: var(--s-bg);
          border-bottom: 1px solid rgba(22,163,74,0.15);
          font-size: 0.78rem; color: var(--success); font-weight: 500;
        }

        /* Field rows */
        .field-row {
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(212,160,23,0.12);
        }
        .field-row:last-of-type { border-bottom: none; }

        .field-label {
          flex: 0 0 180px;
          padding: 15px 22px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--muted);
          border-right: 1px solid rgba(212,160,23,0.12);
          background: #fdfaf4;
          white-space: nowrap;
          user-select: none;
        }

        .field-colon {
          padding: 15px 10px;
          color: var(--dim);
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .field-input {
          flex: 1;
          padding: 15px 12px 15px 4px;
          border: none;
          outline: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
          background: transparent;
          font-family: inherit;
          min-width: 0;
        }
        .field-input::placeholder { color: #ccc; font-weight: 400; }

        /* Error */
        .error-msg {
          font-size: 0.8rem; color: var(--error); font-weight: 500;
          padding: 10px 22px;
          background: var(--e-bg);
          border-top: 1px solid rgba(220,38,38,0.15);
          display: flex; align-items: center; gap: 6px;
        }

        /* Footer */
        .card-footer {
          padding: 16px 22px;
          border-top: 1px solid var(--border);
          background: var(--cream);
          border-radius: 0 0 11px 11px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .back-btn {
          flex: 1; padding: 11px;
          background: #fff; color: var(--muted);
          border: 1px solid var(--border); border-radius: 8px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.2s;
        }
        .back-btn:hover { border-color: var(--gold-400); color: var(--gold-400); background: #fdf9f0; }
        .submit-btn {
          flex: 1; padding: 11px;
          background: linear-gradient(135deg, var(--gold-400), var(--gold-500));
          color: #fff; border: none; border-radius: 8px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: opacity 0.2s;
        }
        .submit-btn:hover { opacity: 0.9; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}),e.jsx("div",{className:"page",children:e.jsxs("main",{className:"main-wrap",children:[e.jsxs("div",{className:"page-header",children:[e.jsx("h1",{className:"page-title",children:"Bank Account Details"}),e.jsx("p",{className:"page-sub",children:"Where should we send your funds?"})]}),e.jsxs("div",{className:"card",children:[e.jsxs("div",{className:"card-head",children:[e.jsxs("svg",{width:"15",height:"15",viewBox:"0 0 16 16",fill:"none",children:[e.jsx("rect",{x:"1",y:"5",width:"14",height:"9",rx:"1.5",stroke:"#d4a017",strokeWidth:"1.4"}),e.jsx("path",{d:"M4 5V3.5C4 2.12 5.12 1 6.5 1h3C10.88 1 12 2.12 12 3.5V5",stroke:"#d4a017",strokeWidth:"1.4"})]}),e.jsx("span",{className:"card-title",children:"Enter Bank Details"})]}),e.jsxs("div",{className:"info-strip",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 16 16",fill:"none",style:{flexShrink:0},children:[e.jsx("circle",{cx:"8",cy:"8",r:"7",stroke:"#16a34a",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 7V11M8 5V5.5",stroke:"#16a34a",strokeWidth:"1.5",strokeLinecap:"round"})]}),"Funds will be credited within T+1 working day"]}),e.jsxs("div",{className:"field-row",children:[e.jsx("span",{className:"field-label",children:"Account Number"}),e.jsx("span",{className:"field-colon",children:":"}),e.jsx("input",{type:"text",className:"field-input",placeholder:"9–18 digit number",value:l,onChange:a=>{m(a.target.value),n("")}})]}),e.jsxs("div",{className:"field-row",children:[e.jsx("span",{className:"field-label",children:"IFSC Code"}),e.jsx("span",{className:"field-colon",children:":"}),e.jsx("input",{type:"text",className:"field-input",placeholder:"e.g. SBIN0001234",value:d,onChange:a=>{b(a.target.value.toUpperCase()),n("")}})]}),p&&e.jsxs("div",{className:"error-msg",children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 16 16",fill:"none",children:[e.jsx("circle",{cx:"8",cy:"8",r:"7",stroke:"#dc2626",strokeWidth:"1.5"}),e.jsx("path",{d:"M8 5V9M8 11V11.5",stroke:"#dc2626",strokeWidth:"1.5",strokeLinecap:"round"})]}),p]}),e.jsxs("div",{className:"card-footer",children:[e.jsx("button",{className:"back-btn",onClick:()=>c("/sell-summary",{state:i}),children:"← Back"}),e.jsx("button",{className:"submit-btn",onClick:v,disabled:f,children:f?e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"inline-block",width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 1s linear infinite",marginRight:"6px"}}),"Saving..."]}):"Confirm & Proceed →"})]})]})]})})]})};export{B as default};
