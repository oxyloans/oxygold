import silverBanner from "../assets/silverbanner.png";
import { useNavigate } from "react-router-dom";

export default function BuySilverSection() {
  const navigate = useNavigate();
  const handleBuyNow = () => {
    navigate("/login");
  };
  return (
    <section className="buy-silver-section" aria-labelledby="silver-title">
      <div className="buy-silver-container">
        <div className="buy-silver-card">
          <div className="buy-silver-grid">
            {/* LEFT: Silver product image */}
            <div className="buy-silver-visual">
              <span className="silver-visual-glow" aria-hidden="true" />
              <span
                className="silver-spark silver-spark-one"
                aria-hidden="true"
              />
              <span
                className="silver-spark silver-spark-two"
                aria-hidden="true"
              />

              <img
                className="buy-silver-image"
                src={silverBanner}
                alt="OXYGOLD 999 pure silver 10 gram coin and 20 gram bar"
              />
            </div>

            {/* RIGHT: Silver content */}
            <div className="buy-silver-content">
              <p className="buy-silver-eyebrow">999 PURE SILVER</p>

              <h2 id="silver-title" className="buy-silver-title">
                Pure Silver for Every <span>Precious Moment</span>
              </h2>

              <p className="buy-silver-subtitle">
                Timeless value. Beautifully crafted.
              </p>

              <p className="buy-silver-description">
                Choose finely crafted 10 gram silver coins and 20 gram silver
                bars—perfect for gifting, celebrations, and lasting value.
              </p>

              <div
                className="buy-silver-details"
                aria-label="Silver product details"
              >
                <div className="silver-detail">
                  <strong>10 g</strong>
                  <span>Silver Coin</span>
                </div>

                <span className="silver-detail-divider" aria-hidden="true" />

                <div className="silver-detail">
                  <strong>20 g</strong>
                  <span>Silver Bar</span>
                </div>

                <span className="silver-detail-divider" aria-hidden="true" />

                <div className="silver-detail">
                  <strong>BIS</strong>
                  <span>Certified</span>
                </div>
              </div>

              {/* <a
                className="buy-silver-button"
                href={BUY_SILVER_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buy 999 pure silver on OXYGOLD.AI"
              >
                Buy Silver Now <span aria-hidden="true">→</span>
              </a> */}
              <div
                className="buy-silver-button cursor-pointer"
                aria-label="Buy 999 pure silver on OXYGOLD.AI"
              >
                <button
                  onClick={handleBuyNow}
                  className="buy-silver-cta cursor-pointer"
                  type="button"
                >
                  Buy Silver Coins Now →
                </button>
              </div>
              <p className="buy-silver-note">
                <span aria-hidden="true">✓</span>
                Secure purchase on OXYGOLD.AI
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{responsiveStyles}</style>
    </section>
  );
}

const responsiveStyles = `
  .buy-silver-section,
  .buy-silver-section *,
  .buy-silver-section *::before,
  .buy-silver-section *::after {
    box-sizing: border-box;
  }

  .buy-silver-section {
    width: 100%;
    position: relative;
    overflow: hidden;
    padding: 0 clamp(16px, 3vw, 32px);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: transparent;
  }

  .buy-silver-container {
    width: min(100%, 1400px);
    margin: 0 auto;
  }

  .buy-silver-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.045);
    box-shadow: 0 12px 32px rgba(8, 2, 24, 0.20);
    margin: 0;
  }

  .buy-silver-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.96fr) minmax(0, 1.04fr);
    align-items: center;
    gap: clamp(28px, 4vw, 64px);
    min-height: 486px;
    padding: 28px clamp(34px, 4vw, 64px);
  }

  .buy-silver-visual {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    min-height: 410px;
    isolation: isolate;
  }

  .silver-visual-glow {
    position: absolute;
    z-index: -1;
    top: 50%;
    left: 42%;
    width: min(90%, 490px);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(238, 242, 250, 0.20) 0%,
      rgba(168, 139, 198, 0.10) 48%,
      transparent 72%
    );
    filter: blur(8px);
    transform: translate(-50%, -50%);
  }

  .buy-silver-image {
    position: relative;
    z-index: 1;
    display: block;
    width: 115%;
    max-width: 680px;
    height: auto;
    max-height: 440px;
    object-fit: contain;
    object-position: left center;
    filter: drop-shadow(0 14px 24px rgba(8, 2, 24, 0.24));
  }

  .buy-silver-content {
    min-width: 0;
    text-align: left;
  }

  .buy-silver-eyebrow {
    margin: 0 0 12px;
    background: linear-gradient(90deg, #ffffff 0%, #f5d36c 88%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-size: 13px;
    font-weight: 900;
    line-height: 1.4;
    letter-spacing: 1.3px;
  }

  .buy-silver-title {
    max-width: 650px;
    margin: 0;
    color: #ffffff;
    font-size: clamp(32px, 3.4vw, 48px);
    font-weight: 900;
    line-height: 1.13;
    letter-spacing: -0.7px;
  }

  .buy-silver-title span {
    background: linear-gradient(135deg, #d4af37, #f5d36c);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .buy-silver-subtitle {
    margin: 14px 0 0;
    color: rgba(255, 255, 255, 0.88);
    font-size: 16px;
    font-weight: 800;
    line-height: 1.5;
  }

  .buy-silver-description {
    max-width: 590px;
    margin: 10px 0 0;
    color: rgba(255, 255, 255, 0.74);
    font-size: 15px;
    line-height: 1.65;
  }

  .buy-silver-details {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin: 24px 0 26px;
  }

  .silver-detail {
    display: flex;
    align-items: baseline;
    gap: 7px;
    white-space: nowrap;
  }

  .silver-detail strong {
    color: #f5d36c;
    font-size: 16px;
    font-weight: 900;
  }

  .silver-detail span {
    color: rgba(255, 255, 255, 0.75);
    font-size: 13px;
    font-weight: 700;
  }

  .silver-detail-divider {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(245, 211, 108, 0.7);
  }

  .buy-silver-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 54px;
    padding: 14px 28px;
    border-radius: 14px;
    color: #2b0a59;
    background: linear-gradient(135deg, #d4af37, #f5d36c);
    box-shadow: 0 8px 20px rgba(212, 175, 55, 0.20);
    font-size: 15px;
    font-weight: 900;
    line-height: 1;
    text-decoration: none;
    transition: transform 180ms ease, filter 180ms ease, box-shadow 180ms ease;
  }

  .buy-silver-button span {
    font-size: 19px;
    transition: transform 180ms ease;
  }

  .buy-silver-note {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.62);
    font-size: 12px;
    font-weight: 700;
  }

  .buy-silver-note span {
    color: #f5d36c;
  }

  @media (hover: hover) {
    .buy-silver-button:hover {
      color: #2b0a59;
      filter: brightness(1.05);
      transform: translateY(-2px);
      box-shadow: 0 11px 25px rgba(212, 175, 55, 0.26);
    }

    .buy-silver-button:hover span {
      transform: translateX(3px);
    }
  }

  .buy-silver-button:focus-visible {
    outline: 3px solid rgba(255, 239, 165, 0.8);
    outline-offset: 4px;
  }

  .buy-silver-button:active {
    transform: scale(0.98);
  }

  @media (max-width: 980px) {
    .buy-silver-grid {
      grid-template-columns: 1fr;
      gap: 8px;
      min-height: 0;
      padding: 28px 36px 40px;
    }

    .buy-silver-visual {
      min-height: 380px;
      justify-content: center;
    }

    .buy-silver-image {
      width: min(100%, 650px);
      max-height: 400px;
      object-position: center;
    }

    .buy-silver-content {
      max-width: 680px;
    }
  }

  @media (max-width: 640px) {
    .buy-silver-section {
      padding: 0 16px;
    }

    .buy-silver-card {
      border-radius: 18px;
      margin: 0;
    }

    .buy-silver-grid {
      gap: 4px;
      padding: 18px 16px 26px;
    }

    .buy-silver-visual {
      min-height: 250px;
    }

    .buy-silver-image {
      width: 100%;
      max-width: 520px;
      max-height: 270px;
    }

    .silver-spark-one {
      right: 8%;
    }

    .buy-silver-eyebrow {
      margin-bottom: 10px;
      font-size: 11px;
      letter-spacing: 1px;
    }

    .buy-silver-title {
      font-size: clamp(30px, 9.4vw, 40px);
      letter-spacing: -0.5px;
    }

    .buy-silver-subtitle {
      margin-top: 12px;
      font-size: 15px;
    }

    .buy-silver-description {
      font-size: 14px;
    }

    .buy-silver-details {
      gap: 10px;
      margin: 20px 0 24px;
    }

    .buy-silver-button {
      width: 100%;
      min-height: 54px;
    }
  }

  @media (max-width: 380px) {
    .silver-detail-divider {
      display: none;
    }

    .silver-detail {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .buy-silver-button,
    .buy-silver-button span {
      transition: none;
    }
  }
`;
