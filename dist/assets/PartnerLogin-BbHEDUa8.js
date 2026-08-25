import{u as T,r as a,j as e}from"./index-Bti0KOuG.js";import{d as w}from"./partnerService-DHqGgP6n.js";const I=()=>{const b=T(),[x,h]=a.useState("phone"),[i,j]=a.useState(""),[s,d]=a.useState(["","","","","",""]),[v,N]=a.useState(""),[c,r]=a.useState(""),[g,p]=a.useState(!1),[f,u]=a.useState(0),l=a.useRef([]);a.useEffect(()=>{if(f<=0)return;const n=setTimeout(()=>u(t=>t-1),1e3);return()=>clearTimeout(n)},[f]);const m=async()=>{var n;if(r(""),!/^[6-9]\d{9}$/.test(i)){r("Enter a valid 10-digit mobile number");return}p(!0);try{const t=await w({phoneNumber:i,registrationType:"mobile",userType:"Login",userRole:"partner",whatsappNumber:""});N((t==null?void 0:t.mobileOtpSessionId)||((n=t==null?void 0:t.data)==null?void 0:n.mobileOtpSessionId)||""),h("otp"),u(30),setTimeout(()=>{var o;return(o=l.current[0])==null?void 0:o.focus()},100)}catch(t){r(t.message||"Something went wrong. Please try again.")}finally{p(!1)}},k=async()=>{r("");const n=s.join("");if(n.length<6){r("Enter the 6-digit OTP");return}p(!0);try{const t=await w({phoneNumber:i,registrationType:"mobile",userType:"Login",mobileOtpSessionId:v,mobileOtpValue:n,userRole:"partner",whatsappNumber:""});localStorage.setItem("partner",JSON.stringify({phone:i,isLoggedIn:!0,...t})),b("/partner/dashboard")}catch(t){r(t.message||"OTP verification failed. Please try again.")}finally{p(!1)}},O=(n,t)=>{var y;if(!/^\d?$/.test(t))return;const o=[...s];o[n]=t,d(o),r(""),t&&n<5&&((y=l.current[n+1])==null||y.focus())},z=(n,t)=>{var o;t.key==="Backspace"&&!s[n]&&n>0&&((o=l.current[n-1])==null||o.focus())},S=n=>{var o;const t=n.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);t.length===6&&(d(t.split("")),(o=l.current[5])==null||o.focus()),n.preventDefault()},P=()=>{d(["","","","","",""]),r(""),m()};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-scene {
          min-height: 100vh;
          background: #F1F3F9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          font-family: 'Outfit', sans-serif;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(180,150,100,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(120,90,50,0.06) 0%, transparent 50%);
        }

        header { display: none !important; }

        /* CARD */
        .lg-card {
          display: grid;
          grid-template-columns: 340px 320px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.10),
            0 32px 64px rgba(0,0,0,0.08);
        }

        /* LEFT PANEL */
        .lg-left {
          position: relative;
          overflow: hidden;
          background: #1a1208;
        }
        .lg-left-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(8,6,2,0.72) 0%, rgba(8,6,2,0.45) 40%, rgba(8,6,2,0.82) 100%),
            url('https://images.unsplash.com/photo-1624365168968-f283d506c6b6?w=700&q=80') center/cover no-repeat;
        }
        .lg-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 32px;
        }
        .lg-logo-mark {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lg-logo-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #d4a843, #f0c96e);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .lg-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.04em;
        }
        .lg-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.95rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .lg-tagline em {
          color: #f0c96e;
          font-style: normal;
        }
        .lg-left-desc {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          margin-bottom: 24px;
        }

        /* RIGHT PANEL */
        .lg-right {
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 36px;
        }

        .lg-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: #12100a;
          margin-bottom: 3px;
          letter-spacing: -0.01em;
        }
        .lg-form-sub {
          font-size: 0.75rem;
          color: #b8b0a4;
          margin-bottom: 24px;
          font-weight: 300;
        }

        .lg-field { margin-bottom: 14px; }
        .lg-lbl {
          display: block;
          font-size: 0.65rem;
          font-weight: 600;
          color: #b8b0a4;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .lg-phone-wrap {
          display: flex;
          align-items: center;
          border: 1.5px solid #ede9e2;
          border-radius: 10px;
          overflow: hidden;
          background: #faf8f5;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lg-phone-wrap:focus-within {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .lg-phone-prefix {
          padding: 10px 12px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #888;
          border-right: 1.5px solid #ede9e2;
          background: #f5f1eb;
          flex-shrink: 0;
        }
        .lg-phone-input {
          flex: 1;
          padding: 10px 13px;
          border: none;
          outline: none;
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: #12100a;
          background: transparent;
          -moz-appearance: textfield;
        }
        .lg-phone-input::-webkit-outer-spin-button,
        .lg-phone-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .lg-phone-input::placeholder { color: #d0cabc; }

        /* OTP */
        .lg-otp-row {
          display: flex;
          gap: 7px;
          margin-bottom: 8px;
          width: 100%;
        }
        .lg-otp-box {
          width: 0;
          flex: 1;
          min-width: 0;
          height: 42px;
          padding: 0;
          border: 1.5px solid #ede9e2;
          border-radius: 10px;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #12100a;
          background: #faf8f5;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          -moz-appearance: textfield;
        }
        .lg-otp-box::-webkit-outer-spin-button,
        .lg-otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }
        .lg-otp-box:focus {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .lg-otp-box.filled {
          border-color: #c9993a;
          background: #fdf8ee;
        }

        .lg-otp-hint {
          font-size: 0.7rem;
          color: #b8b0a4;
          margin-top: 8px;
          margin-bottom: 14px;
          font-weight: 300;
        }
        .lg-otp-hint span { font-weight: 600; color: #12100a; }
        .lg-resend-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: inherit;
          color: #c9993a;
          font-weight: 600;
          transition: color 0.14s;
        }
        .lg-resend-btn:disabled { color: #d0cabc; cursor: default; }
        .lg-resend-btn:not(:disabled):hover { color: #a37828; }

        .lg-change-phone {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: #b8b0a4;
          background: #f5f1eb;
          border: 1px solid #ede9e2;
          border-radius: 20px;
          padding: 4px 12px;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 20px;
          transition: color 0.14s, background 0.14s;
          font-weight: 400;
        }
        .lg-change-phone:hover { color: #555; background: #ede9e2; }

        .lg-error {
          font-size: 0.72rem;
          color: #b94040;
          padding: 8px 11px;
          border-radius: 8px;
          background: #fdf4f4;
          border: 1px solid rgba(185,64,64,0.14);
          margin-bottom: 12px;
        }

        .lg-btn {
          width: 100%;
          padding: 11px;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #c9993a, #d4a843);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.18s, transform 0.1s;
          margin-top: 4px;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 14px rgba(201,153,58,0.3);
        }
        .lg-btn:hover:not(:disabled) { opacity: 0.9; }
        .lg-btn:active:not(:disabled) { transform: scale(0.99); }
        .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        .lg-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 0 0;
        }
        .lg-divider-line { flex: 1; height: 1px; background: #ede9e2; }
        .lg-divider-txt { font-size: 0.65rem; color: #d0cabc; }

        .lg-footer {
          margin-top: 12px;
          text-align: center;
          font-size: 0.75rem;
          color: #b8b0a4;
          font-weight: 300;
        }
        .lg-link {
          color: #c9993a;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: inherit;
          transition: color 0.14s;
        }
        .lg-link:hover { color: #a37828; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .lg-spin {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.65s linear infinite;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .lg-animate { animation: slideIn 0.25s ease both; }

        @media (max-width: 720px) {
          .lg-card { grid-template-columns: 1fr; max-width: 340px; }
          .lg-left { display: none; }
          .lg-right { padding: 36px 28px; }
        }
      `}),e.jsx("div",{className:"lg-scene",children:e.jsxs("div",{className:"lg-card",children:[e.jsxs("div",{className:"lg-left",children:[e.jsx("div",{className:"lg-left-img"}),e.jsxs("div",{className:"lg-left-content",children:[e.jsxs("div",{className:"lg-logo-mark",children:[e.jsx("div",{className:"lg-logo-icon",children:"✦"}),e.jsx("span",{className:"lg-logo-name",children:"OxyGold Partner"})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"lg-tagline",children:["Manage your",e.jsx("br",{}),e.jsx("em",{children:"gold catalog"}),e.jsx("br",{}),"seamlessly."]}),e.jsx("div",{className:"lg-left-desc",children:"Partner portal for OxyGold physical gold and digital assets."})]})]})]}),e.jsxs("div",{className:"lg-right",children:[x==="phone"&&e.jsxs("div",{className:"lg-animate",children:[e.jsx("div",{className:"lg-form-title",children:"Partner Sign In"}),e.jsx("div",{className:"lg-form-sub",children:"Sign in with your mobile number"}),e.jsxs("div",{className:"lg-field",children:[e.jsx("label",{className:"lg-lbl",children:"Mobile Number"}),e.jsxs("div",{className:"lg-phone-wrap",children:[e.jsx("span",{className:"lg-phone-prefix",children:"+91"}),e.jsx("input",{className:"lg-phone-input",type:"number",placeholder:"98765 43210",value:i,onChange:n=>{j(n.target.value.slice(0,10)),r("")},onKeyDown:n=>n.key==="Enter"&&m()})]})]}),c&&e.jsx("div",{className:"lg-error",children:c}),e.jsx("button",{className:"lg-btn",onClick:m,disabled:g,children:g?e.jsx("span",{className:"lg-spin"}):"Send OTP →"}),e.jsxs("div",{className:"lg-divider",children:[e.jsx("div",{className:"lg-divider-line"}),e.jsx("span",{className:"lg-divider-txt",children:"OR"}),e.jsx("div",{className:"lg-divider-line"})]}),e.jsxs("div",{className:"lg-footer",children:["No partner account?"," ",e.jsx("button",{className:"lg-link",onClick:()=>b("/partner/register"),children:"Register"})]})]}),x==="otp"&&e.jsxs("div",{className:"lg-animate",children:[e.jsx("div",{className:"lg-form-title",children:"Verify OTP"}),e.jsx("div",{className:"lg-form-sub",children:"Code sent to your mobile"}),e.jsxs("button",{className:"lg-change-phone",onClick:()=>{h("phone"),d(["","","","","",""]),r("")},children:["← +91 ",i]}),e.jsxs("div",{className:"lg-field",children:[e.jsx("label",{className:"lg-lbl",children:"Enter 6-digit OTP"}),e.jsx("div",{className:"lg-otp-row",onPaste:S,children:s.map((n,t)=>e.jsx("input",{ref:o=>{l.current[t]=o},className:`lg-otp-box ${n?"filled":""}`,type:"number",inputMode:"numeric",maxLength:1,value:n,onChange:o=>O(t,o.target.value.slice(-1)),onKeyDown:o=>z(t,o)},t))}),e.jsxs("div",{className:"lg-otp-hint",children:["Didn't receive it?"," ",f>0?e.jsxs(e.Fragment,{children:["Resend in ",e.jsxs("span",{children:[f,"s"]})]}):e.jsx("button",{className:"lg-resend-btn",onClick:P,children:"Resend OTP"})]})]}),c&&e.jsx("div",{className:"lg-error",children:c}),e.jsx("button",{className:"lg-btn",onClick:k,disabled:g||s.join("").length<6,children:g?e.jsx("span",{className:"lg-spin"}):"Verify & Sign In →"})]})]})]})})]})};export{I as default};
