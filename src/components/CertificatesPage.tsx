import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Eye, FileCheck2, X } from "lucide-react";

type Certificate = {
  id: number;
  fileId: string;
  title: string;
};

const certificates: Certificate[] = [
  {
    id: 1,
    fileId: "1QaXD2586Y-ajTU2vEdou29XApUpGzUn_",
    title: "Ministry of Micro, Small and Medium Enterprises",
  },
  {
    id: 2,
    fileId: "1Wp-7C2Q7iKTlW1uFNbC8hurVdron_49z",
    title: "OXYIDEAS Hallmark",
  },
  {
    id: 3,
    fileId: "1JXREXS8gMcjc292mMj043yDRG1ohzya8",
    title: "IBJA Platinum Partner",
  },
//   {
//     id: 4,
//     fileId: "1MoJL5NEBqh6YTzQaoHz_pS2O2uwkegMb",
//     title: "Gold Appraisal",
//   },
  {
    id: 4,
    fileId: "1X34Oa6_QMNK1brgVHgEV3GUlxnDiDuBK",
    title: "Trade Licence",
  },
];

const getThumbnailUrl = (fileId: string) =>
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;

const getPreviewUrl = (fileId: string) =>
  `https://drive.google.com/file/d/${fileId}/preview`;

const CertificatesPage: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const closeCertificate = () => setSelectedCertificate(null);

  useEffect(() => {
    if (!selectedCertificate) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCertificate();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedCertificate]);

  const modalNode =
    selectedCertificate && typeof document !== "undefined"
      ? ReactDOM.createPortal(
          <div
            className="cert-modal-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeCertificate();
            }}
          >
            <div
              className="cert-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="certificate-modal-title"
            >
              <div className="cert-modal-header">
                <h3 id="certificate-modal-title">{selectedCertificate.title}</h3>

                <button
                  type="button"
                  className="cert-modal-close"
                  onClick={closeCertificate}
                  aria-label="Close certificate viewer"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="cert-iframe-wrap">
                <iframe
                  src={getPreviewUrl(selectedCertificate.fileId)}
                  title="Certificate"
                  allow="autoplay"
                  loading="eager"
                />

                {/* Covers only Google Drive's pop-out control */}
                <div className="drive-popout-cover" aria-hidden="true" />
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <section className="certificates-page" id="our-certifications">
        <div className="certificates-container">
          <div className="certificates-section-header">
            <h3 className="certificates-title">Our Certificates</h3>
            <div className="certificates-title-accent" aria-hidden="true" />
            <p className="certificates-subtitle">
              Trusted credentials that guarantee authenticity and purity of every piece we offer
            </p>
          </div>

          <div className="certificates-grid">
            {certificates.map((certificate) => (
              <article
                key={certificate.id}
                className="certificate-card"
                role="button"
                tabIndex={0}
                aria-label={`View ${certificate.title}`}
                onClick={() => setSelectedCertificate(certificate)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedCertificate(certificate);
                  }
                }}
              >
                <div className="certificate-preview">
                  {!loadedImages[certificate.id] &&
                    !imageErrors[certificate.id] && (
                      <div className="image-loading">
                        <span className="loading-spinner" />
                      </div>
                    )}

                  {!imageErrors[certificate.id] ? (
                    <img
                      src={getThumbnailUrl(certificate.fileId)}
                      alt={certificate.title}
                      loading="lazy"
                      onLoad={() =>
                        setLoadedImages((prev) => ({
                          ...prev,
                          [certificate.id]: true,
                        }))
                      }
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [certificate.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="certificate-fallback">
                      <FileCheck2 size={38} />
                      <span>Certificate</span>
                    </div>
                  )}

                  <div className="certificate-title-bar">
                    <span>{certificate.title}</span>
                  </div>

                  <div className="certificate-overlay">
                    <div className="overlay-content">
                      <div className="overlay-title">{certificate.title}</div>
                      <div className="view-certificate">
                        <Eye size={18} />
                        <span>View Certificate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {modalNode}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .certificates-page {
          width: 100%;
          background: #12051f;
          padding: 48px 0 72px;
          color: #ffffff;
          font-family: inherit;
        }

        .certificates-container {
          width: min(1240px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* ===========================
           SECTION HEADER
        =========================== */

        .certificates-section-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .certificates-title {
          margin: 0 0 12px;
          font-size: clamp(22px, 3.2vw, 34px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: #ffffff;
          background: linear-gradient(135deg, #f1c95b 0%, #e8a828 50%, #f5d87a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .certificates-title-accent {
          width: 56px;
          height: 3px;
          margin: 0 auto 16px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f1c95b, #e8a828);
          animation: cert-accent-glow 2.4s ease-in-out infinite alternate;
        }

        @keyframes cert-accent-glow {
          0% {
            opacity: 0.7;
            width: 56px;
          }
          100% {
            opacity: 1;
            width: 72px;
          }
        }

        .certificates-subtitle {
          margin: 0 auto;
          max-width: 520px;
          font-size: clamp(13px, 1.6vw, 15px);
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 400;
        }

        /* ===========================
           GRID
        =========================== */

        .certificates-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .certificate-card {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e7e7ea;
          border-radius: 16px;
          background: #1a0b2b;
          cursor: pointer;
          outline: none;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
          transition:
            transform 0.24s ease,
            box-shadow 0.24s ease,
            border-color 0.24s ease;
        }

        .certificate-card:hover {
          transform: translateY(-4px);
          border-color: rgba(96, 53, 147, 0.28);
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.12);
        }

        .certificate-card:focus-visible {
          border-color: #5b2a8a;
          box-shadow:
            0 0 0 4px rgba(91, 42, 138, 0.12),
            0 16px 38px rgba(15, 23, 42, 0.1);
        }

        .certificate-preview {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #1a0b2b;
        }

        .certificate-preview img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center top;
          background: #1a0b2b;
          transition: transform 0.32s ease;
        }

        .certificate-card:hover .certificate-preview img {
          transform: scale(1.025);
        }

        .image-loading {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a0b2b;
        }

        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #ececf0;
          border-top-color: #5b2a8a;
          border-radius: 50%;
          animation: cert-spin 0.8s linear infinite;
        }

        @keyframes cert-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .certificate-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #1a0b2b;
          color: #f1c95b;
          font-size: 14px;
          font-weight: 700;
        }

        .certificate-title-bar {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          padding: 14px 16px;
          background: linear-gradient(
            to top,
            rgba(12, 4, 22, 0.96) 0%,
            rgba(12, 4, 22, 0.82) 62%,
            rgba(12, 4, 22, 0) 100%
          );
          pointer-events: none;
          transition: opacity 0.22s ease;
        }

        .certificate-title-bar span {
          display: block;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 800;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
        }

        .certificate-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(17, 10, 31, 0.68);
          opacity: 0;
          transition: opacity 0.22s ease;
        }

        .overlay-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 13px;
          text-align: center;
        }

        .overlay-title {
          max-width: 92%;
          color: #ffffff;
          font-size: clamp(14px, 1.4vw, 18px);
          line-height: 1.35;
          font-weight: 800;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
        }

        .certificate-card:hover .certificate-overlay,
        .certificate-card:focus-visible .certificate-overlay {
          opacity: 1;
        }

        .certificate-card:hover .certificate-title-bar,
        .certificate-card:focus-visible .certificate-title-bar {
          opacity: 0;
        }

        .view-certificate {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 10px 15px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.97);
          color: #2d1747;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
          transform: translateY(7px);
          transition: transform 0.22s ease;
        }

        .certificate-card:hover .view-certificate,
        .certificate-card:focus-visible .view-certificate {
          transform: translateY(0);
        }

        /* ===========================
           MODAL
        =========================== */

        .cert-modal-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 2147483000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          background: rgba(7, 3, 15, 0.82);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          isolation: isolate;
        }

        .cert-modal {
          width: min(1180px, 96vw);
          height: min(88dvh, 860px);
          max-height: calc(100dvh - 44px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 16px;
          background: #12051f;
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.5);
        }

        .cert-modal-header {
          position: relative;
          z-index: 30;
          flex: 0 0 auto;
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 10px 12px 10px 18px;
          background: #1a0b2b;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }

        .cert-modal-header h3 {
          margin: 0;
          color: #ffffff;
          font-size: 16px;
          line-height: 1.25;
          font-weight: 800;
        }

        .cert-modal-close {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          background: #251038;
          color: #ffffff;
          cursor: pointer;
          transition:
            background 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }

        .cert-modal-close:hover {
          background: #2d1747;
          color: #ffffff;
          border-color: #2d1747;
          transform: scale(1.04);
        }

        .cert-iframe-wrap {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          overflow: hidden;
          background: #202124;
        }

        .cert-iframe-wrap iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          border: 0;
          background: #202124;
        }

        /*
          Google Drive's pop-out button belongs to a cross-origin iframe,
          so normal page CSS cannot style/remove that internal control.
          This small cover hides only the top-right pop-out button area.
        */
        .drive-popout-cover {
          position: absolute;
          top: 8px;
          right: 18px;
          z-index: 10;
          width: 58px;
          height: 58px;
          background: #202124;
          pointer-events: auto;
        }

        /* ===========================
           TABLET  (≤ 1024px)
        =========================== */

        @media (max-width: 1024px) {
          .certificates-page {
            padding: 40px 0 56px;
          }

          .certificates-container {
            width: min(100% - 36px, 960px);
          }

          .certificates-section-header {
            margin-bottom: 32px;
          }

          .certificates-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .cert-modal-overlay {
            padding: 16px;
          }

          .cert-modal {
            width: 100%;
            height: 88dvh;
            max-height: calc(100dvh - 32px);
          }
        }

        /* ===========================
           MOBILE  (≤ 640px)
        =========================== */

        @media (max-width: 640px) {
          .certificates-page {
            padding: 28px 0 40px;
          }

          .certificates-container {
            width: calc(100% - 26px);
          }

          .certificates-section-header {
            margin-bottom: 24px;
          }

          .certificates-subtitle {
            max-width: 340px;
          }

          .certificates-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .certificate-card {
            border-radius: 14px;
          }

          .certificate-card:hover {
            transform: none;
          }

          .certificate-card:hover .certificate-title-bar,
          .certificate-card:focus-visible .certificate-title-bar {
            opacity: 1;
          }

          /*
            Touch devices do not have reliable hover.
            Keep a small View Certificate pill visible at the bottom.
          */
          .certificate-title-bar {
            padding: 12px 12px 54px;
          }

          .certificate-title-bar span {
            font-size: 12px;
          }

          .certificate-overlay {
            align-items: flex-end;
            justify-content: flex-end;
            padding: 10px;
            opacity: 1;
            pointer-events: none;
            background: linear-gradient(
              to top,
              rgba(17, 10, 31, 0.62),
              transparent 58%
            );
          }

          .overlay-content {
            width: 100%;
            align-items: flex-end;
            gap: 0;
          }

          .overlay-title {
            display: none;
          }

          .view-certificate {
            min-height: 36px;
            padding: 8px 11px;
            font-size: 11px;
            border-radius: 8px;
            transform: none;
          }

          .cert-modal-overlay {
            align-items: flex-start;
            padding: 0;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }

          .cert-modal {
            width: 100%;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
          }

          .cert-modal-header {
            min-height: 58px;
            padding:
              max(10px, env(safe-area-inset-top))
              10px
              10px
              14px;
          }

          .cert-modal-header h3 {
            font-size: 14px;
          }

          .cert-modal-close {
            width: 44px;
            height: 44px;
            flex-basis: 44px;
          }

          .drive-popout-cover {
            top: 8px;
            right: 14px;
            width: 56px;
            height: 56px;
          }
        }

        /* ===========================
           SMALL MOBILE  (≤ 380px)
        =========================== */

        @media (max-width: 380px) {
          .certificates-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .certificates-subtitle {
            font-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .certificate-card,
          .certificate-preview img,
          .certificate-overlay,
          .view-certificate,
          .cert-modal-close {
            transition: none !important;
          }

          .loading-spinner,
          .certificates-title-accent {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CertificatesPage;
