import React from 'react';

const Footer = () => {
  return (
    <>
      <style>{`
        .footer {
          background: #060f1e;
          border-top: 1px solid rgba(240,187,58,0.08);
          padding: 48px 60px 24px;
          font-family: 'Sora', sans-serif;
        }
        .footer-container {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 48px;
          margin-bottom: 32px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .footer-brand { max-width: 520px; }
        .footer-logo {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f0bb3a;
          margin-bottom: 14px;
          letter-spacing: 0.02em;
        }
        .footer-tagline {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.42);
          line-height: 1.72;
          font-weight: 400;
        }
        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .footer-contact-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          margin-bottom: 2px;
        }
        .footer-addresses {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-address {
          font-size: 0.76rem;
          color: rgba(255,255,255,0.38);
          line-height: 1.65;
          font-weight: 400;
        }
        .footer-address strong {
          color: rgba(255,255,255,0.58);
          font-weight: 600;
        }
        .footer-contact-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .footer-email, .footer-phone {
          font-size: 0.8rem;
          color: #d9a020;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .footer-email:hover, .footer-phone:hover { color: #f0bb3a; }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-disclaimer {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.3);
          line-height: 1.65;
          font-weight: 400;
        }
        .footer-disclaimer strong {
          color: rgba(255,255,255,0.48);
          font-weight: 600;
        }
        .footer-copyright {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.22);
          text-align: center;
          font-weight: 400;
        }

        @media (max-width: 960px) {
          .footer { padding: 36px 28px 20px; }
          .footer-container { grid-template-columns: 1fr; gap: 28px; margin-bottom: 24px; }
        }
        @media (max-width: 560px) {
          .footer { padding: 28px 20px 16px; }
          .footer-addresses { gap: 10px; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">OXYGOLD.AI</div>
            <p className="footer-tagline">
              OXYGOLD.AI is India's Digital Gold Bank — a secure, tech-driven platform designed to bring transparency, trust, and traceability to the gold ecosystem. Built for investors, bullion traders, and institutions seeking vault-grade digital authority.
            </p>
          </div>

          <div className="footer-contact">
            <h4 className="footer-contact-title">Contact Us</h4>
            <div className="footer-addresses">
              <div className="footer-address">
                <strong>OXYKART TECHNOLOGIES PVT LTD</strong><br />
                CC-02, Indu Fortune Fields, KPHB,<br />
                Hyderabad, Telangana - 500085
              </div>
              <div className="footer-address">
                <strong>AI Research Center</strong><br />
                Entrance D, SE02 Concourse,<br />
                Miyapur Metro Station,<br />
                Hyderabad, Telangana 500049
              </div>
            </div>
            <div className="footer-contact-info">
              <a href="mailto:VThatavarti16@oxygold.ai" className="footer-email">VThatavarti16@oxygold.ai</a>
              <a href="tel:+918143271103" className="footer-phone">+91 81432 71103</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-disclaimer">
            <strong>Disclaimer:</strong> OXYGOLD.AI provides digital infrastructure only and does not assume physical custody unless specified. Users are responsible for due diligence prior to transactions.
          </div>
          <div className="footer-copyright">
            © 2026-2027 OXYGOLD.AI. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;