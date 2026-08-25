import{u as g,r as n,j as e}from"./index-Bti0KOuG.js";const u=()=>{const i=localStorage.getItem("user");if(!i)return window.location.href="/login",!1;try{const a=JSON.parse(i);return!a.data||!a.data.accessToken?(window.location.href="/login",!1):!0}catch(a){return console.error("Error parsing user data:",a),localStorage.removeItem("user"),window.location.href="/login",!1}},h=()=>{const i=g(),[a,o]=n.useState(null),[s,l]=n.useState(null);n.useEffect(()=>{const t=localStorage.getItem("user");l(t?JSON.parse(t):null)},[]);const d=()=>{if(!s){u();return}i("/buy-gold")},c=[{question:"What is Digital Gold?",answer:"Digital Gold allows you to buy gold online. Every gram you purchase is backed by physical gold stored securely with a trusted partner."},{question:"Who is the gold partner?",answer:"The physical gold is stored with an authorized and trusted gold partner in insured vaults, as per their terms and conditions."},{question:"Is Digital Gold regulated by RBI or SEBI?",answer:"No. Digital Gold is not regulated by RBI or SEBI. It is backed by physical gold stored with a partner, but it is not a regulated investment product."},{question:"How can I buy Digital Gold?",answer:"You can buy Digital Gold instantly using Indian Rupees (₹) or by selecting the quantity in grams. Just confirm the live price and complete the payment."},{question:"What is the minimum amount required to buy Digital Gold?",answer:"You can start buying Digital Gold with a very small amount, making it accessible even for first-time investors."},{question:"At what price is Digital Gold bought?",answer:"Digital Gold is bought at the live market price at the time of purchase, which may include partner charges."},{question:"Where is my Digital Gold stored?",answer:"Your gold is stored safely in insured vaults managed by the gold partner. You don't need to worry about storage or security."},{question:"Can I track my Digital Gold value?",answer:"Yes. The value of your Digital Gold updates in real time based on current gold market prices."},{question:"Can I sell Digital Gold anytime?",answer:"Yes. You can sell your Digital Gold anytime through the app, subject to partner availability and terms."},{question:"At what price is Digital Gold sold?",answer:"Digital Gold is sold at the live market price at the time of selling."},{question:"How will I receive money after selling Digital Gold?",answer:"The sale amount is credited to your linked bank account or wallet as per the app's payout flow."},{question:"Are there any charges for buying or selling?",answer:"Partner charges such as spread, GST, or minting charges (for physical conversion) may apply. These are shown during the transaction."},{question:"Is my Digital Gold insured?",answer:"Yes. The physical gold stored with the partner is insured as per their storage policy."},{question:"Can I convert Digital Gold into physical gold?",answer:"Depending on the partner's terms, you may be able to convert Digital Gold into physical gold coins or jewellery. Additional charges may apply."},{question:"What are the risks of Digital Gold?",answer:"The value of Digital Gold depends on market prices and may fluctuate. Since it is not regulated by RBI or SEBI, users should understand the risks before investing."}],p=[{title:"Trusted Vault Partners",desc:"Gold stored in certified, insured vaults with regular audits"},{title:"Advanced Security",desc:"Bank-grade encryption and multi-factor authentication"},{title:"Compliance",desc:"Designed in line with Indian regulatory and RBI guidelines"},{title:"Complete Transparency",desc:"Real-time pricing and detailed transaction history"}];return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .faq-page {
          min-height: 100vh;
          background: #f7f8fa;
          font-family: 'Sora', sans-serif;
          color: #1c2b3a;
        }

        /* ── BANNER ── */
        .faq-banner {
          background: linear-gradient(135deg, #0d1f3c 0%, #1a3060 100%);
          border-bottom: 1px solid rgba(240,187,58,0.1);
          padding: 24px 64px;
        }
        .faq-banner-in {
          max-width: 1200px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 5px; text-align: center;
        }
        .faq-banner-title {
          font-size: 1.45rem; font-weight: 600; color: #fff; line-height: 1.2;
        }
        .faq-banner-sub {
          font-size: 0.82rem; color: rgba(255,255,255,0.48); font-weight: 400;
        }

        /* ── CONTENT ── */
        .faq-content {
          max-width: 760px; margin: 0 auto;
          padding: 32px 24px 56px;
        }

        /* ── SECTION LABEL ── */
        .faq-sec-lbl {
          font-size: 0.6rem; font-weight: 600;
          letter-spacing: 0.13em; text-transform: uppercase;
          color: #b8900a; margin-bottom: 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .faq-sec-lbl::after {
          content: ''; flex: 1; height: 1px; background: #e8ecf0;
        }

        /* ── FAQ LIST ── */
        .faq-list {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 28px;
          position: relative;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .faq-list::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7;
        }

        .faq-item { border-bottom: 1px solid #f0f2f5; }
        .faq-item:last-child { border-bottom: none; }

        .faq-btn {
          width: 100%; padding: 14px 20px;
          display: flex; justify-content: space-between; align-items: center;
          background: transparent; border: none; cursor: pointer;
          text-align: left; gap: 16px; font-family: 'Sora', sans-serif;
          transition: background 0.15s;
        }
        .faq-btn:hover { background: #fafbfc; }

        .faq-question {
          font-size: 0.83rem; font-weight: 500;
          color: #1c2b3a; line-height: 1.45; flex: 1;
          transition: color 0.18s;
        }
        .faq-item.open .faq-question { color: #1a3060; font-weight: 600; }

        .faq-icon {
          width: 20px; height: 20px; flex-shrink: 0;
          border-radius: 50%;
          border: 1px solid #e0e4e8;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; color: #9eaab8;
          background: #fff;
          transition: all 0.22s;
        }
        .faq-item.open .faq-icon {
          background: #d9a020; border-color: #d9a020;
          color: #fff; transform: rotate(45deg);
        }

        .faq-answer {
          padding: 0 20px 14px 20px;
          font-size: 0.79rem; line-height: 1.76; font-weight: 400;
          color: #6a7a8a;
          border-top: 1px solid #f0f2f5;
          background: #fafbfc;
        }

        /* ── TRUST GRID ── */
        .trust-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: #e8ecf0;
          border: 1px solid #e8ecf0; border-radius: 12px;
          overflow: hidden; margin-bottom: 24px;
          position: relative;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .trust-grid::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020);
          opacity: 0.7; z-index: 1;
        }
        .trust-card {
          background: #fff; padding: 18px 20px;
          transition: background 0.15s;
        }
        .trust-card:hover { background: #fafbfc; }
        .trust-num {
          font-size: 0.58rem; font-weight: 500;
          color: #c8c0b0; margin-bottom: 7px; display: block;
        }
        .trust-title {
          font-size: 0.82rem; font-weight: 600;
          color: #1c2b3a; margin-bottom: 4px;
        }
        .trust-desc {
          font-size: 0.74rem; color: #8a96a3; line-height: 1.55; font-weight: 400;
        }

        /* ── CTA ── */
        .faq-cta {
          background: #fff; border: 1px solid #e8ecf0;
          border-radius: 12px; padding: 28px 24px;
          text-align: center; position: relative; overflow: hidden;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .faq-cta::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, #1a3060, #d9a020); opacity: 0.7;
        }
        .faq-cta-div {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-bottom: 12px;
        }
        .faq-cta-ln { width: 36px; height: 1px; background: linear-gradient(to right, transparent, #d9a020); opacity: 0.5; }
        .faq-cta-ln.r { background: linear-gradient(to left, transparent, #d9a020); }
        .faq-cta-dm { width: 4px; height: 4px; background: #d9a020; transform: rotate(45deg); opacity: 0.7; }
        .faq-cta-title {
          font-size: 1rem; font-weight: 600;
          color: #1c2b3a; margin-bottom: 5px;
        }
        .faq-cta-sub {
          font-size: 0.8rem; color: #9eaab8; margin-bottom: 18px; font-weight: 400;
        }
        .faq-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px;
          background: linear-gradient(135deg, #f0bb3a, #d9a020);
          color: #0d1f3c;
          font-family: 'Sora', sans-serif;
          font-size: 0.83rem; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer;
          box-shadow: 0 3px 12px rgba(217,160,32,0.22);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .faq-btn-primary:hover {
          box-shadow: 0 6px 18px rgba(217,160,32,0.34);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .faq-banner  { padding: 16px 20px; }
          .faq-content { padding: 20px 16px 40px; }
          .trust-grid  { grid-template-columns: 1fr; }
          .faq-banner-sub { display: none; }
        }
      `}),e.jsxs("div",{className:"faq-page",children:[e.jsx("section",{className:"faq-banner",children:e.jsxs("div",{className:"faq-banner-in",children:[e.jsx("h1",{className:"faq-banner-title",children:"FAQ"}),e.jsx("p",{className:"faq-banner-sub",children:"Everything you need to know about Digital Gold"})]})}),e.jsxs("main",{className:"faq-content",children:[e.jsx("div",{className:"faq-sec-lbl",children:"Frequently Asked Questions"}),e.jsx("div",{className:"faq-list",children:c.map((t,r)=>e.jsxs("div",{className:`faq-item${a===r?" open":""}`,children:[e.jsxs("button",{className:"faq-btn",onClick:()=>o(a===r?null:r),children:[e.jsx("span",{className:"faq-question",children:t.question}),e.jsx("span",{className:"faq-icon",children:"+"})]}),a===r&&e.jsx("div",{className:"faq-answer",children:t.answer})]},r))}),e.jsx("div",{className:"faq-sec-lbl",children:"Security & Trust"}),e.jsx("div",{className:"trust-grid",children:p.map((t,r)=>e.jsxs("div",{className:"trust-card",children:[e.jsxs("span",{className:"trust-num",children:["0",r+1]}),e.jsx("div",{className:"trust-title",children:t.title}),e.jsx("div",{className:"trust-desc",children:t.desc})]},r))}),e.jsxs("div",{className:"faq-cta",children:[e.jsxs("div",{className:"faq-cta-div",children:[e.jsx("div",{className:"faq-cta-ln"}),e.jsx("div",{className:"faq-cta-dm"}),e.jsx("div",{className:"faq-cta-ln r"})]}),e.jsx("h2",{className:"faq-cta-title",children:"Still have questions?"}),e.jsx("p",{className:"faq-cta-sub",children:"Start your Gold journey today"}),e.jsx("button",{className:"faq-btn-primary",onClick:d,children:"Start Your Gold Journey →"})]})]})]})]})};export{h as default};
