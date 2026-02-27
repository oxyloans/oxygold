import React, { useState, useEffect, useRef } from "react";
import OxyBricksLogo from "../assets/oxybrickslogo.png";
import OxyLoansLogo from "../assets/oxyloanslogo.png";
import AskOxyLogo from "../assets/askoxylogo.png";

const ecosystemCards = [
  {
    id: "oxybricks",
    name: "OxyBricks",
    logo: OxyBricksLogo,
    url: "https://www.oxybricks.world/",
  },
  {
    id: "oxyloans",
    name: "OxyLoans",
    logo: OxyLoansLogo,
    url: "https://www.oxyloans.com/",
  },
  {
    id: "askoxy",
    name: "AskOxy.ai",
    logo: AskOxyLogo,
    url: "https://www.askoxy.ai/",
  },
];

const OxyEcosystem: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkViewMode = () => {
      const width = window.innerWidth;
      if (width <= 768) setViewMode('mobile');
      else if (width <= 1024) setViewMode('tablet');
      else setViewMode('desktop');
    };
    checkViewMode();
    window.addEventListener("resize", checkViewMode);
    return () => window.removeEventListener("resize", checkViewMode);
  }, []);

  useEffect(() => {
    if (viewMode === 'desktop') return; // No auto-slide on desktop
    
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        if (viewMode === 'tablet') return (prev + 1) % 2;
        return (prev + 1) % ecosystemCards.length;
      });
    }, 3000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [viewMode]);

  const handleCardClick = (url: string) => window.open(url, "_blank");

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    if (viewMode === 'desktop') return;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        if (viewMode === 'tablet') return (prev + 1) % 2;
        return (prev + 1) % ecosystemCards.length;
      });
    }, 3000);
  };

  return (
    <>
      <style>{`
        .oxy-dot {
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .oxy-dot.active {
          background: #f5a623 !important;
          transform: scale(1.35);
        }
        .oxy-img-btn {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          -webkit-tap-highlight-color: transparent;
        }
        .oxy-img-btn:focus {
          outline: none;
        }
        .oxy-img-btn img {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .oxy-img-btn:hover img {
          opacity: 0.85;
          transform: scale(1.05);
        }
        .oxy-img-btn:active img {
          transform: scale(0.95);
        }
        @media (max-width: 768px) {
          .oxy-dot {
            width: 10px !important;
            height: 10px !important;
          }
        }
      `}</style>

      <section
        style={{
          width: "100%",
          padding: "clamp(24px, 5vw, 48px) 0",
          // background: "#0a0a0a",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "clamp(20px, 4vw, 40px)" }}>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.2,
              padding: "0 16px",
            }}
          >
            Explore Our <span style={{ color: "#f5a623" }}>Platforms</span>
          </h2>
        </div>

        {viewMode === 'mobile' ? (
          /* ── MOBILE: one image at a time, auto-slides ── */
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              padding: "0 16px",
            }}
          >
            {/* Slider viewport */}
            <div style={{ width: "100%", maxWidth: 320, overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  transform: `translateX(-${currentSlide * 100}%)`,
                  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  willChange: "transform",
                }}
              >
                {ecosystemCards.map((card) => (
                  <button
                    key={card.id}
                    className="oxy-img-btn"
                    onClick={() => handleCardClick(card.url)}
                    style={{ flex: "0 0 100%", width: "100%", padding: "12px 0" }}
                    aria-label={`Visit ${card.name}`}
                  >
                    <img
                      src={card.logo}
                      alt={card.name}
                      style={{
                        width: "75%",
                        maxWidth: 220,
                        height: "auto",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "8px 0" }}>
              {ecosystemCards.map((_, index) => (
                <span
                  key={index}
                  className={`oxy-dot${currentSlide === index ? " active" : ""}`}
                  onClick={() => handleDotClick(index)}
                  role="button"
                  aria-label={`Go to slide ${index + 1}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#444444",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── DESKTOP / TABLET: carousel with navigation ── */
          <div
            style={{
              width: "100%",
              maxWidth: viewMode === 'desktop' ? 1200 : 700,
              margin: "0 auto",
              padding: "0 60px",
              position: "relative",
            }}
          >
            <div style={{ overflow: "hidden", borderRadius: 12 }}>
              <div
                ref={sliderRef}
                style={{
                  display: "flex",
                  transform: `translateX(-${currentSlide * (viewMode === 'desktop' ? 0 : 50)}%)`,
                  transition: "transform 1s ease-in-out",
                }}
              >
                {ecosystemCards.map((card) => (
                  <button
                    key={card.id}
                    className="oxy-img-btn"
                    onClick={() => handleCardClick(card.url)}
                    style={{ 
                      flex: viewMode === 'desktop' ? "0 0 33.333%" : "0 0 50%", 
                      padding: "24px 12px" 
                    }}
                    aria-label={`Visit ${card.name}`}
                  >
                    <img
                      src={card.logo}
                      alt={card.name}
                      style={{
                        width: "85%",
                        maxWidth: 280,
                        height: "auto",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
              {viewMode === 'desktop' ? null : (
                viewMode === 'tablet' ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <span
                      key={index}
                      className={`oxy-dot${currentSlide === index ? " active" : ""}`}
                      onClick={() => handleDotClick(index)}
                      role="button"
                      aria-label={`Go to slide ${index + 1}`}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#444444",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                    />
                  ))
                ) : (
                  ecosystemCards.map((_, index) => (
                    <span
                      key={index}
                      className={`oxy-dot${currentSlide === index ? " active" : ""}`}
                      onClick={() => handleDotClick(index)}
                      role="button"
                      aria-label={`Go to slide ${index + 1}`}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#444444",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                    />
                  ))
                )
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default OxyEcosystem;