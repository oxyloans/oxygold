import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import OxyBricksLogo from "../assets/oxybrickslogo.png";
import OxyLoansLogo from "../assets/oxyloanslogo.png";
import AskOxyLogo from "../assets/askoxylogo.png";
import globallogo from "../assets/global logo.png";
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
  {
    id: "oxyglobal",
    name: "Oxyglobal.tech",
    logo: globallogo,
    url: "https://www.oxyglobal.tech/",
  },
];

const OxyEcosystem: React.FC = () => {
  const handleCardClick = (url: string) => window.open(url, "_blank");

  const settings = {
    dots: true,
    infinite: true,
    speed: 900,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 9000,
    cssEase: "linear",
    pauseOnHover: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <>
      <style>{`
        .oxy-img-btn {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
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
        .slick-dots li button:before {
          color: #f5a623 !important;
        }
        .slick-dots li.slick-active button:before {
          color: #f5a623 !important;
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

        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 40px",
          }}
        >
          <Slider {...settings}>
            {ecosystemCards.map((card) => (
              <div key={card.id} style={{ padding: "0 15px" }}>
                <button
                  className="oxy-img-btn"
                  onClick={() => handleCardClick(card.url)}
                  aria-label={`Visit ${card.name}`}
                >
                  <img
                    src={card.logo}
                    alt={card.name}
                    style={{
                      width: "100%",
                      maxWidth: 280,
                      height: 200,
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </button>
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </>
  );
};

export default OxyEcosystem;