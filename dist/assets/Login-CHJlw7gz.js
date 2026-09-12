import{u as K,b as _,t as q,$ as H,r as n,T as L,j as e,A as U}from"./index-C6ScifuI.js";const A=`${U}/oxygold-api/auth/userLoginOrRegister`,ee=()=>{const g=K(),N=_(),{refreshCart:C}=q(),{refreshWishlist:E}=H(),[S,T]=n.useState("phone"),[l,R]=n.useState(""),[c,m]=n.useState(["","","","","",""]),[D,M]=n.useState(""),[h,a]=n.useState(""),[d,x]=n.useState(!1),[b,I]=n.useState(0),[p,W]=n.useState(!1),[Y,O]=n.useState(!1),f=n.useRef([]),u=n.useRef(L.getInstance().isLoggedIn()).current,v=N.state||{},B=sessionStorage.getItem("redirectAfterLogin"),y=v.redirectTo||v.from||B||"/physical-gold",w=y.startsWith("/")&&!y.startsWith("//")?y:"/physical-gold",G=n.useMemo(()=>{try{const t=sessionStorage.getItem("redirectAfterLoginState");return t?JSON.parse(t):void 0}catch{return}},[N.key]),j=v.productState||G,V=()=>{sessionStorage.removeItem("redirectAfterLogin"),sessionStorage.removeItem("redirectAfterLoginState")};if(n.useEffect(()=>{if(b<=0)return;const t=setTimeout(()=>I(o=>o-1),1e3);return()=>clearTimeout(t)},[b]),n.useEffect(()=>{u&&(sessionStorage.removeItem("redirectAfterLogin"),sessionStorage.removeItem("redirectAfterLoginState"),g(w,{replace:!0,state:j}))},[u,g,w,j]),u)return null;const k=async()=>{var t;if(a(""),!/^[6-9]\d{9}$/.test(l)){a("Enter a valid 10-digit mobile number");return}x(!0);try{const o=await fetch(A,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phoneNumber:l,registrationType:"mobile",userType:"Login",userRole:"user",whatsappNumber:""})}),s=await o.json();if(!o.ok)throw new Error((s==null?void 0:s.message)||"Failed to send OTP");M((s==null?void 0:s.mobileOtpSessionId)||((t=s==null?void 0:s.data)==null?void 0:t.mobileOtpSessionId)||""),O(!0),setTimeout(()=>O(!1),3e3),T("otp"),I(30),setTimeout(()=>{var i;return(i=f.current[0])==null?void 0:i.focus()},100)}catch(o){a(o.message||"Something went wrong. Please try again.")}finally{x(!1)}},P=async()=>{var o,s;if(d||p)return;a("");const t=c.join("");if(t.length<6){a("Enter the 6-digit OTP");return}x(!0);try{const i=await fetch(A,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phoneNumber:l,registrationType:"mobile",userType:"Login",mobileOtpSessionId:D,mobileOtpValue:t})}),r=await i.json();if(!i.ok)throw new Error((r==null?void 0:r.message)||"Invalid OTP");const Z=L.getInstance();if(r.data&&r.data.accessToken&&r.data.refreshToken)Z.setTokens({accessToken:r.data.accessToken,refreshToken:r.data.refreshToken,expiresIn:r.data.expiresIn,userId:r.data.userId,tokenType:r.data.tokenType||"Bearer"});else{localStorage.removeItem("user");const z=((o=r==null?void 0:r.data)==null?void 0:o.userId)||(r==null?void 0:r.userId)||((s=r==null?void 0:r.data)==null?void 0:s.id)||(r==null?void 0:r.id)||null;if(z)localStorage.setItem("user",JSON.stringify({phone:l,isLoggedIn:!0,userId:z,...r}));else throw new Error("No user ID found in response")}W(!0),V(),g(w,{replace:!0,state:j}),Promise.allSettled([C(),E()])}catch(i){a(i.message||"OTP verification failed. Please try again.")}finally{x(!1)}},$=(t,o)=>{var i;if(!/^\d?$/.test(o))return;const s=[...c];s[t]=o,m(s),a(""),o&&t<5&&((i=f.current[t+1])==null||i.focus())},F=(t,o)=>{var s;if(o.key==="Enter"){o.preventDefault(),c.join("").length===6&&!d&&!p&&P();return}o.key==="Backspace"&&!c[t]&&t>0&&((s=f.current[t-1])==null||s.focus())},J=t=>{var s;const o=t.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);o.length===6&&(m(o.split("")),(s=f.current[5])==null||s.focus()),t.preventDefault()},X=()=>{m(["","","","","",""]),a(""),k()};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .lg-scene {
            min-height: 100vh;
            background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px 16px;
            font-family: 'Sora', sans-serif;
            position: relative;
            overflow: hidden;
          }
          .lg-scene::before {
            content: '';
            position: absolute;
            width: 600px; height: 600px; border-radius: 50%;
            background: radial-gradient(circle, rgba(42,78,158,0.25) 0%, transparent 65%);
            left: -150px; top: 50%; transform: translateY(-50%);
            pointer-events: none;
          }
          .lg-scene::after {
            content: '';
            position: absolute;
            width: 400px; height: 400px; border-radius: 50%;
            background: radial-gradient(circle, rgba(240,187,58,0.07) 0%, transparent 65%);
            right: -80px; top: 20%;
            pointer-events: none;
          }

          header { display: none !important; }

          .lg-card {
            display: grid;
            grid-template-columns: 320px 400px;
            border-radius: 18px;
            overflow: hidden;
            position: relative; z-index: 1;
            box-shadow:
              0 0 0 1px rgba(240,187,58,0.12),
              0 8px 32px rgba(0,0,0,0.5),
              0 32px 72px rgba(0,0,0,0.3);
          }

          /* LEFT PANEL */
          .lg-left {
            position: relative;
            overflow: hidden;
            background: #060f1e;
          }
          .lg-left-img {
            position: absolute; inset: 0;
            background:
              linear-gradient(to bottom, rgba(6,15,30,0.6), rgba(6,15,30,0.75)),
              url('https://i.ibb.co/pv179ZZ9/Chat-GPT-Image-Aug-28-2026-07-03-48-PM.png');
              url('https://i.ibb.co/pv179ZZ9/Chat-GPT-Image-Aug-28-2026-07-03-48-PM.png');
            background-size: cover;
            background-position: center;
          }
          .lg-left-content {
            position: relative; z-index: 2; height: 100%;
            display: flex; flex-direction: column;
            justify-content: space-between;
            padding: 32px 28px;
          }
          .lg-logo-name {
            font-size: 1rem; font-weight: 700; color: #f0bb3a;
            letter-spacing: 0.04em;
          }
          .lg-tagline {
            font-size: 1.7rem; font-weight: 700;
            color: #fff; line-height: 1.2; margin-bottom: 10px;
            letter-spacing: -0.02em;
          }
          .lg-tagline em { font-style: normal; }
          .lg-gold-text { color: #f0bb3a; }
          .lg-silver-text { color: #d4d9e2; }
          .lg-tagline em { font-style: normal; }
          .lg-gold-text { color: #f0bb3a; }
          .lg-silver-text { color: #d4d9e2; }
          .lg-left-desc {
            font-size: 0.73rem; color: rgba(255,255,255,0.42);
            line-height: 1.65; margin-bottom: 22px; font-weight: 400;
          }
          .lg-promo { transform: translateY(-18px); }
          .lg-promo { transform: translateY(-18px); }
          .lg-stats { display: flex; gap: 18px; }
          .lg-stat { display: flex; flex-direction: column; gap: 2px; }
          .lg-stat-val {
            font-size: 1.2rem; font-weight: 700;
            color: #f0bb3a; line-height: 1;
          }
          .lg-stat-lbl {
            font-size: 0.58rem; color: rgba(255,255,255,0.32);
            text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;
          }

          /* RIGHT PANEL */
          .lg-right {
            background: #f7f8fa;
            display: flex; flex-direction: column;
            justify-content: center;
            padding: 40px 40px;
          }

          .lg-form-title {
            font-size: 1.3rem; font-weight: 700;
            color: #0d1f3c; margin-bottom: 3px;
            letter-spacing: -0.02em;
          }
          .lg-form-sub {
            font-size: 0.74rem; color: #9eaab8;
            margin-bottom: 22px; font-weight: 400;
          }

          .lg-field { margin-bottom: 13px; }
          .lg-lbl {
            display: block; font-size: 0.6rem; font-weight: 600;
            color: #9eaab8; letter-spacing: 0.11em;
            text-transform: uppercase; margin-bottom: 6px;
          }

          .lg-phone-wrap {
            display: flex; align-items: center;
            border: 1.5px solid #e0e4e8;
            border-radius: 9px; overflow: hidden;
            background: #fff;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .lg-phone-wrap:focus-within {
            border-color: #1a3060;
            box-shadow: 0 0 0 3px rgba(26,48,96,0.08);
          }
          .lg-phone-prefix {
            padding: 10px 12px; font-size: 0.8rem; font-weight: 600;
            color: #6b82a8; border-right: 1.5px solid #e0e4e8;
            background: #f4f5f7; flex-shrink: 0;
          }
          .lg-phone-input {
            flex: 1; padding: 10px 12px; border: none; outline: none;
            font-family: 'Sora', sans-serif; font-size: 0.86rem;
            color: #0d1f3c; background: transparent;
            -moz-appearance: textfield;
          }
          .lg-phone-input::-webkit-outer-spin-button,
          .lg-phone-input::-webkit-inner-spin-button { -webkit-appearance: none; }
          .lg-phone-input::placeholder { color: #bcc5cf; }

          /* OTP */
          .lg-otp-row {
            display: flex; gap: 6px; margin-bottom: 8px; width: 100%;
          }
          .lg-otp-box {
            width: 0; flex: 1; min-width: 0; height: 42px;
            padding: 0; border: 1.5px solid #e0e4e8; border-radius: 9px;
            text-align: center; font-family: 'Sora', sans-serif;
            font-size: 1rem; font-weight: 600; color: #0d1f3c;
            background: #fff; outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
            -moz-appearance: textfield;
          }
          .lg-otp-box::-webkit-outer-spin-button,
          .lg-otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }
          .lg-otp-box:focus {
            border-color: #1a3060;
            box-shadow: 0 0 0 3px rgba(26,48,96,0.08);
          }
          .lg-otp-box.filled {
            border-color: #d9a020;
            background: #fffcf2;
          }

          .lg-otp-hint {
            font-size: 0.7rem; color: #9eaab8;
            margin-top: 8px; margin-bottom: 13px; font-weight: 400;
          }
          .lg-otp-hint span { font-weight: 600; color: #1c2b3a; }
          .lg-resend-btn {
            background: none; border: none; cursor: pointer;
            font-family: 'Sora', sans-serif; font-size: inherit;
            color: #d9a020; font-weight: 600; transition: color 0.14s;
          }
          .lg-resend-btn:disabled { color: #bcc5cf; cursor: default; }
          .lg-resend-btn:not(:disabled):hover { color: #b8720a; }

          .lg-change-phone {
            display: inline-flex; align-items: center; gap: 5px;
            font-size: 0.71rem; color: #6b82a8;
            background: #f0f2f5; border: 1px solid #e4e7eb;
            border-radius: 20px; padding: 4px 12px; cursor: pointer;
            font-family: 'Sora', sans-serif; margin-bottom: 18px;
            transition: color 0.14s, background 0.14s; font-weight: 400;
          }
          .lg-change-phone:hover { color: #1c2b3a; background: #e8ecf0; }

          .lg-success {
            font-size: 0.71rem; color: #16a34a;
            padding: 8px 11px; border-radius: 7px;
            background: #f0fdf4; border: 1px solid #bbf7d0;
            margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
          }
          .lg-success-icon {
            width: 14px; height: 14px; border-radius: 50%;
            background: #16a34a; color: white;
            display: flex; align-items: center; justify-content: center;
            font-size: 9px; flex-shrink: 0;
          }

          .lg-error {
            font-size: 0.71rem; color: #dc2626;
            padding: 8px 11px; border-radius: 7px;
            background: #fef2f2; border: 1px solid rgba(220,38,38,0.15);
            margin-bottom: 12px; font-weight: 400;
          }

          .lg-btn {
            width: 100%; padding: 11px; border: none; border-radius: 9px;
            font-family: 'Sora', sans-serif; font-size: 0.84rem; font-weight: 600;
            cursor: pointer;
            background: linear-gradient(135deg, #f0bb3a 0%, #d9a020 100%);
            color: #0d1f3c;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            transition: box-shadow 0.2s, transform 0.1s;
            margin-top: 4px;
            box-shadow: 0 4px 16px rgba(217,160,32,0.28);
          }
          .lg-btn:hover:not(:disabled) {
            box-shadow: 0 6px 22px rgba(217,160,32,0.42);
            transform: translateY(-1px);
          }
          .lg-btn:active:not(:disabled) { transform: scale(0.99); }
          .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

          .lg-divider {
            display: flex; align-items: center; gap: 10px; margin: 14px 0 0;
          }
          .lg-divider-line { flex: 1; height: 1px; background: #e8ecf0; }
          .lg-divider-txt { font-size: 0.62rem; color: #bcc5cf; }

          .lg-footer {
            margin-top: 10px; text-align: center;
            font-size: 0.73rem; color: #9eaab8; font-weight: 400;
          }
          .lg-link {
            color: #d9a020; font-weight: 600; background: none; border: none;
            cursor: pointer; font-family: 'Sora', sans-serif; font-size: inherit;
            transition: color 0.14s;
          }
          .lg-link:hover { color: #b8720a; }

          .lg-back {
            display: block; width: 100%; margin-top: 8px; padding: 9px;
            border: 1.5px solid #e0e4e8; border-radius: 9px;
            font-family: 'Sora', sans-serif; font-size: 0.73rem;
            color: #9eaab8; background: transparent; cursor: pointer;
            transition: color 0.14s, border-color 0.14s; font-weight: 400;
          }
          .lg-back:hover { color: #4a5a6a; border-color: #bcc5cf; }

          @keyframes spin { to { transform: rotate(360deg); } }
          .lg-spin {
            width: 14px; height: 14px; border-radius: 50%;
            border: 2px solid rgba(13,31,60,0.2); border-top-color: #0d1f3c;
            animation: spin 0.65s linear infinite;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(12px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .lg-animate { animation: slideIn 0.25s ease both; }

          @media (max-width: 720px) {
            .lg-card { grid-template-columns: 1fr; max-width: 360px; }
            .lg-left { display: none; }
            .lg-right { padding: 36px 28px; }
          }
        `}),e.jsx("div",{className:"lg-scene",children:e.jsxs("div",{className:"lg-card",children:[e.jsxs("div",{className:"lg-left",children:[e.jsx("div",{className:"lg-left-img"}),e.jsxs("div",{className:"lg-left-content",children:[e.jsx("div",{className:"lg-logo-name",children:"OXYGOLD.AI"}),e.jsxs("div",{className:"lg-promo",children:[e.jsxs("div",{className:"lg-tagline",children:["Welcome Back to",e.jsx("br",{}),e.jsx("em",{children:e.jsx("span",{className:"lg-gold-text",children:"OXYGOLD.AI"})})]}),e.jsx("div",{className:"lg-left-desc",children:"Access your account to explore gold and silver products, check live rates, and manage your account securely."}),e.jsxs("div",{className:"lg-stats",children:[e.jsxs("div",{className:"lg-stat",children:[e.jsx("span",{className:"lg-stat-val",children:"999.9"}),e.jsx("span",{className:"lg-stat-lbl",children:"Purity"})]}),e.jsxs("div",{className:"lg-stat",children:[e.jsx("span",{className:"lg-stat-val",children:"₹100"}),e.jsx("span",{className:"lg-stat-lbl",children:"Market Rates"})]}),e.jsxs("div",{className:"lg-stat",children:[e.jsx("span",{className:"lg-stat-val",children:"Secure"}),e.jsx("span",{className:"lg-stat-lbl",children:"Access"})]})]})]})]})]}),e.jsxs("div",{className:"lg-right",children:[S==="phone"&&e.jsxs("div",{className:"lg-animate",children:[e.jsx("div",{className:"lg-form-title",children:"Welcome back"}),e.jsx("div",{className:"lg-form-sub",children:"Sign in with your mobile number"}),e.jsxs("div",{className:"lg-field",children:[e.jsx("label",{className:"lg-lbl",children:"Mobile Number"}),e.jsxs("div",{className:"lg-phone-wrap",children:[e.jsx("span",{className:"lg-phone-prefix",children:"+91"}),e.jsx("input",{className:"lg-phone-input",type:"number",placeholder:"Enter 10-digit mobile number",value:l,onChange:t=>{R(t.target.value.slice(0,10)),a("")},onKeyDown:t=>t.key==="Enter"&&k()})]})]}),h&&e.jsx("div",{className:"lg-error",children:h}),e.jsx("button",{className:"lg-btn",onClick:k,disabled:d,children:d?e.jsx("span",{className:"lg-spin"}):"Send OTP →"}),e.jsxs("div",{className:"lg-divider",children:[e.jsx("div",{className:"lg-divider-line"}),e.jsx("span",{className:"lg-divider-txt",children:"OR"}),e.jsx("div",{className:"lg-divider-line"})]}),e.jsxs("div",{className:"lg-footer",children:["No account?"," ",e.jsx("button",{className:"lg-link",onClick:()=>g("/register"),children:"Create one"})]}),e.jsx("button",{className:"lg-back",onClick:()=>g("/"),children:"← Back to home"})]}),S==="otp"&&e.jsxs("div",{className:"lg-animate",children:[e.jsx("div",{className:"lg-form-title",children:"Verify OTP"}),e.jsx("div",{className:"lg-form-sub",children:"Code sent to your mobile"}),Y&&e.jsxs("div",{className:"lg-success",children:[e.jsx("span",{className:"lg-success-icon",children:"✓"}),"OTP sent to +91 ",l]}),e.jsxs("button",{className:"lg-change-phone",onClick:()=>{T("phone"),m(["","","","","",""]),a("")},children:["← +91 ",l]}),e.jsxs("div",{className:"lg-field",children:[e.jsx("label",{className:"lg-lbl",children:"Enter 6-digit OTP"}),e.jsx("div",{className:"lg-otp-row",onPaste:J,children:c.map((t,o)=>e.jsx("input",{ref:s=>{f.current[o]=s},className:`lg-otp-box ${t?"filled":""}`,type:"text",inputMode:"numeric",autoComplete:o===0?"one-time-code":"off",maxLength:1,value:t,onChange:s=>$(o,s.target.value.slice(-1)),onKeyDown:s=>F(o,s)},o))}),e.jsxs("div",{className:"lg-otp-hint",children:["Didn't receive it?"," ",b>0?e.jsxs(e.Fragment,{children:["Resend in ",e.jsxs("span",{children:[b,"s"]})]}):e.jsx("button",{className:"lg-resend-btn",onClick:X,children:"Resend OTP"})]})]}),p&&e.jsxs("div",{className:"lg-success",children:[e.jsx("span",{className:"lg-success-icon",children:"✓"}),"Login successful! Redirecting..."]}),h&&e.jsx("div",{className:"lg-error",children:h}),e.jsx("button",{className:"lg-btn",onClick:P,disabled:d||c.join("").length<6||p,children:d?e.jsx("span",{className:"lg-spin"}):p?"Success!":"Verify & Sign In →"})]})]})]})})]})};export{ee as default};
