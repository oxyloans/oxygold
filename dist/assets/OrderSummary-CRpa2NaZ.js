import{u as e,j as r}from"./index-Bti0KOuG.js";const s=()=>{const a=e();return r.jsxs(r.Fragment,{children:[r.jsx("style",{children:`
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
          max-width: 800px; margin: 0 auto;
          padding: 32px 48px 56px;
        }
        
        .card {
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        
        .title {
          font-size: 1.2rem; font-weight: 600;
          color: #1c2b3a; margin-bottom: 16px;
        }
        
        .content {
          color: #9eaab8; font-size: 0.9rem;
        }
      `}),r.jsxs("div",{className:"page",children:[r.jsx("section",{className:"ro-topbar",children:r.jsxs("div",{className:"ro-topbar-in",children:[r.jsx("button",{className:"ro-back",onClick:()=>a(-1),children:"←"}),r.jsx("span",{className:"ro-topbar-sep"}),r.jsx("span",{className:"ro-topbar-title",children:"Order Summary"}),r.jsx("span",{className:"ro-topbar-sep"}),r.jsx("span",{className:"ro-topbar-sub",children:"Review your order details"})]})}),r.jsx("main",{className:"main",children:r.jsxs("div",{className:"card",children:[r.jsx("h1",{className:"title",children:"Order Summary"}),r.jsx("p",{className:"content",children:"Order summary details will be displayed here."})]})})]})]})};export{s as default};
