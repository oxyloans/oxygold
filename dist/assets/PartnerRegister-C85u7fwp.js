import{u as E,r as a,j as e}from"./index-Bti0KOuG.js";import{d as j,e as I}from"./partnerService-DHqGgP6n.js";const G=()=>{const h=E(),[u,y]=a.useState("phone"),[l,v]=a.useState(""),[d,g]=a.useState(["","","","","",""]),[k,N]=a.useState(""),[p,i]=a.useState(""),[f,m]=a.useState(!1),[b,w]=a.useState(0),c=a.useRef([]);a.useEffect(()=>{if(b<=0)return;const t=setTimeout(()=>w(n=>n-1),1e3);return()=>clearTimeout(t)},[b]);const x=async()=>{var t,n;if(i(""),!/^[6-9]\d{9}$/.test(l)){i("Enter a valid 10-digit mobile number");return}m(!0);try{const r=await j({phoneNumber:l,registrationType:"mobile",userType:"Register",userRole:"partner",whatsappNumber:""});N((r==null?void 0:r.mobileOtpSessionId)||((t=r==null?void 0:r.data)==null?void 0:t.mobileOtpSessionId)||((n=r==null?void 0:r.result)==null?void 0:n.mobileOtpSessionId)||""),y("otp"),w(30),setTimeout(()=>{var s;return(s=c.current[0])==null?void 0:s.focus()},100)}catch(r){i(r.message||"Something went wrong. Please try again.")}finally{m(!1)}},O=async()=>{var n,r,s;i("");const t=d.join("");if(t.length<6){i("Enter the 6-digit OTP");return}m(!0);try{const o=await j({phoneNumber:l,registrationType:"mobile",userType:"Register",mobileOtpSessionId:k,mobileOtpValue:t,userRole:"partner",whatsappNumber:""}),P=(o==null?void 0:o.token)||((n=o==null?void 0:o.data)==null?void 0:n.token)||((r=o==null?void 0:o.result)==null?void 0:r.token)||(o==null?void 0:o.accessToken)||((s=o==null?void 0:o.data)==null?void 0:s.accessToken)||"";localStorage.setItem("partner",JSON.stringify({phone:l,isLoggedIn:!0,token:P,role:"partner",...o}));try{await I("partner")}catch(C){console.error("Role creation failed:",C)}h("/partner/dashboard")}catch(o){i(o.message||"Verification failed. Please try again.")}finally{m(!1)}},z=(t,n)=>{var s;if(!/^\d?$/.test(n))return;const r=[...d];r[t]=n,g(r),i(""),n&&t<5&&((s=c.current[t+1])==null||s.focus())},R=(t,n)=>{var r;n.key==="Backspace"&&!d[t]&&t>0&&((r=c.current[t-1])==null||r.focus())},S=t=>{var r;const n=t.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);n.length===6&&(g(n.split("")),(r=c.current[5])==null||r.focus()),t.preventDefault()},T=()=>{g(["","","","","",""]),i(""),x()};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-scene {
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
        .rg-card {
          display: grid;
          grid-template-columns: 340px 320px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.10),
            0 32px 64px rgba(0,0,0,0.08);
        }

        /* LEFT PANEL — Image side */
        .rg-left {
          position: relative;
          overflow: hidden;
          background: #1a1208;
        }
        .rg-left-img {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(8,6,2,0.72) 0%, rgba(8,6,2,0.45) 40%, rgba(8,6,2,0.82) 100%),
            url('https://images.unsplash.com/photo-1624365168968-f283d506c6b6?w=700&q=80') center/cover no-repeat;
        }
        .rg-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 32px;
        }
        .rg-logo-mark {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rg-logo-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #d4a843, #f0c96e);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .rg-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.04em;
        }
        .rg-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.95rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .rg-tagline em {
          color: #f0c96e;
          font-style: normal;
        }
        .rg-left-desc {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          margin-bottom: 24px;
        }

        /* RIGHT PANEL — Form side */
        .rg-right {
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 36px;
        }

        .rg-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: #12100a;
          margin-bottom: 3px;
          letter-spacing: -0.01em;
        }
        .rg-form-sub {
          font-size: 0.75rem;
          color: #b8b0a4;
          margin-bottom: 24px;
          font-weight: 300;
        }

        .rg-field { margin-bottom: 14px; }
        .rg-lbl {
          display: block;
          font-size: 0.65rem;
          font-weight: 600;
          color: #b8b0a4;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .rg-phone-wrap {
          display: flex;
          align-items: center;
          border: 1.5px solid #ede9e2;
          border-radius: 10px;
          overflow: hidden;
          background: #faf8f5;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .rg-phone-wrap:focus-within {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .rg-phone-prefix {
          padding: 10px 12px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #888;
          border-right: 1.5px solid #ede9e2;
          background: #f5f1eb;
          flex-shrink: 0;
        }
        .rg-phone-input {
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
        .rg-phone-input::-webkit-outer-spin-button,
        .rg-phone-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .rg-phone-input::placeholder { color: #d0cabc; }

        /* OTP */
        .rg-otp-row {
          display: flex;
          gap: 7px;
          margin-bottom: 8px;
          width: 100%;
        }
        .rg-otp-box {
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
        .rg-otp-box::-webkit-outer-spin-button,
        .rg-otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }
        .rg-otp-box:focus {
          border-color: #c9993a;
          box-shadow: 0 0 0 3px rgba(201,153,58,0.1);
          background: #fff;
        }
        .rg-otp-box.filled {
          border-color: #c9993a;
          background: #fdf8ee;
        }

        .rg-otp-hint {
          font-size: 0.7rem;
          color: #b8b0a4;
          margin-top: 8px;
          margin-bottom: 14px;
          font-weight: 300;
        }
        .rg-otp-hint span { font-weight: 600; color: #12100a; }
        .rg-resend-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: inherit;
          color: #c9993a;
          font-weight: 600;
          transition: color 0.14s;
        }
        .rg-resend-btn:disabled { color: #d0cabc; cursor: default; }
        .rg-resend-btn:not(:disabled):hover { color: #a37828; }

        .rg-change-phone {
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
        .rg-change-phone:hover { color: #555; background: #ede9e2; }

        .rg-error {
          font-size: 0.72rem;
          color: #b94040;
          padding: 8px 11px;
          border-radius: 8px;
          background: #fdf4f4;
          border: 1px solid rgba(185,64,64,0.14);
          margin-bottom: 12px;
        }

        .rg-btn {
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
        .rg-btn:hover:not(:disabled) { opacity: 0.9; }
        .rg-btn:active:not(:disabled) { transform: scale(0.99); }
        .rg-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        .rg-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 0 0;
        }
        .rg-divider-line { flex: 1; height: 1px; background: #ede9e2; }
        .rg-divider-txt { font-size: 0.65rem; color: #d0cabc; }

        .rg-footer {
          margin-top: 12px;
          text-align: center;
          font-size: 0.75rem;
          color: #b8b0a4;
          font-weight: 300;
        }
        .rg-link {
          color: #c9993a;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: inherit;
          transition: color 0.14s;
        }
        .rg-link:hover { color: #a37828; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .rg-spin {
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
        .rg-animate { animation: slideIn 0.25s ease both; }

        @media (max-width: 720px) {
          .rg-card { grid-template-columns: 1fr; max-width: 340px; }
          .rg-left { display: none; }
          .rg-right { padding: 36px 28px; }
        }
      `}),e.jsx("div",{className:"rg-scene",children:e.jsxs("div",{className:"rg-card",children:[e.jsxs("div",{className:"rg-left",children:[e.jsx("div",{className:"rg-left-img"}),e.jsxs("div",{className:"rg-left-content",children:[e.jsxs("div",{className:"rg-logo-mark",children:[e.jsx("div",{className:"rg-logo-icon",children:"✦"}),e.jsx("span",{className:"rg-logo-name",children:"OxyGold Partner"})]}),e.jsxs("div",{className:"rg-left-bottom",children:[e.jsxs("div",{className:"rg-tagline",children:["Join the",e.jsx("br",{}),e.jsx("em",{children:"Partner team,"}),e.jsx("br",{}),"digitally."]}),e.jsx("div",{className:"rg-left-desc",children:"Register as an partneristrator to manage the OxyGold platform."})]})]})]}),e.jsxs("div",{className:"rg-right",children:[u==="phone"&&e.jsxs("div",{className:"rg-animate",children:[e.jsx("div",{className:"rg-form-title",children:"Create Partner account"}),e.jsx("div",{className:"rg-form-sub",children:"Enter your mobile to get started"}),e.jsxs("div",{className:"rg-field",children:[e.jsx("label",{className:"rg-lbl",children:"Mobile Number"}),e.jsxs("div",{className:"rg-phone-wrap",children:[e.jsx("span",{className:"rg-phone-prefix",children:"+91"}),e.jsx("input",{className:"rg-phone-input",type:"number",placeholder:"98765 43210",value:l,onChange:t=>{v(t.target.value.slice(0,10)),i("")},onKeyDown:t=>t.key==="Enter"&&x()})]})]}),p&&e.jsx("div",{className:"rg-error",children:p}),e.jsx("button",{className:"rg-btn",onClick:x,disabled:f,children:f?e.jsx("span",{className:"rg-spin"}):"Send OTP →"}),e.jsxs("div",{className:"rg-divider",children:[e.jsx("div",{className:"rg-divider-line"}),e.jsx("span",{className:"rg-divider-txt",children:"OR"}),e.jsx("div",{className:"rg-divider-line"})]}),e.jsxs("div",{className:"rg-footer",children:["Already an partner?"," ",e.jsx("button",{className:"rg-link",onClick:()=>h("/partner/login"),children:"Sign in"})]})]}),u==="otp"&&e.jsxs("div",{className:"rg-animate",children:[e.jsx("div",{className:"rg-form-title",children:"Verify OTP"}),e.jsx("div",{className:"rg-form-sub",children:"Code sent to your mobile"}),e.jsxs("button",{className:"rg-change-phone",onClick:()=>{y("phone"),g(["","","","","",""]),i("")},children:["← +91 ",l]}),e.jsxs("div",{className:"rg-field",children:[e.jsx("label",{className:"rg-lbl",children:"Enter 6-digit OTP"}),e.jsx("div",{className:"rg-otp-row",onPaste:S,children:d.map((t,n)=>e.jsx("input",{ref:r=>{c.current[n]=r},className:`rg-otp-box ${t?"filled":""}`,type:"number",inputMode:"numeric",maxLength:1,value:t,onChange:r=>z(n,r.target.value.slice(-1)),onKeyDown:r=>R(n,r)},n))}),e.jsxs("div",{className:"rg-otp-hint",children:["Didn't receive it?"," ",b>0?e.jsxs(e.Fragment,{children:["Resend in ",e.jsxs("span",{children:[b,"s"]})]}):e.jsx("button",{className:"rg-resend-btn",onClick:T,children:"Resend OTP"})]})]}),p&&e.jsx("div",{className:"rg-error",children:p}),e.jsx("button",{className:"rg-btn",onClick:O,disabled:f||d.join("").length<6,children:f?e.jsx("span",{className:"rg-spin"}):"Verify & Continue →"})]})]})]})})]})};export{G as default};
