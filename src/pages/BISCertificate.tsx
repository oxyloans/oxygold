import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import hallmarkPDF from "../assets/Hall_Mark_CERTIFICATE.pdf";

const BIS_PDF_URL: string = hallmarkPDF;

export default function BISCertificate() {
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  return (
    <main className="bis-page">
      <style>{`
        .bis-page,
        .bis-page * {
          box-sizing: border-box;
        }

        .bis-page {
          min-height: 100dvh;
          background:
            radial-gradient(900px 520px at 15% 5%, rgba(138, 91, 255, 0.18), transparent 62%),
            linear-gradient(180deg, #2b0a59 0%, #160537 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
        }

        .bis-topbar {
          min-height: 70px;
          padding: 12px clamp(16px, 3vw, 32px);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .bis-back,
        .bis-action {
          min-height: 42px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 14px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .bis-back {
          justify-self: start;
        }

        .bis-back:hover,
        .bis-action:hover {
          transform: translateY(-1px);
          border-color: rgba(245, 211, 108, 0.65);
          background: rgba(255, 255, 255, 0.12);
        }

        .bis-title {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 0;
          text-align: center;
        }

        .bis-title-icon {
          color: #f5d36c;
          font-size: 22px;
          flex: 0 0 auto;
        }

        .bis-title-text {
          font-size: clamp(15px, 1.5vw, 18px);
          font-weight: 900;
          letter-spacing: 0.2px;
        }

        .bis-actions {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bis-download {
          color: #2b0a59;
          border-color: transparent;
          background: linear-gradient(135deg, #d4af37, #f5d36c);
          box-shadow: 0 5px 16px rgba(212, 175, 55, 0.25);
        }

        .bis-download:hover {
          color: #2b0a59;
          background: linear-gradient(135deg, #dfbd4d, #ffe284);
        }

        .bis-mobile-label {
          display: none;
        }

        .bis-badge-row {
          padding: 10px clamp(16px, 3vw, 32px) 0;
          display: flex;
          justify-content: center;
        }

        .bis-badge {
          max-width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.1);
          color: #f5d36c;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.4;
          text-align: center;
        }

        .bis-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex: 0 0 auto;
          background: linear-gradient(135deg, #d4af37, #f5d36c);
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
        }

        .bis-viewer-wrap {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px clamp(16px, 3vw, 32px) 10px;
        }

        .bis-viewer-wrap.is-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          max-width: none;
          padding: 0;
          background: #111;
        }

        .bis-fullscreen-close {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          background: rgba(22, 5, 55, 0.9);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .bis-frame {
          display: block;
          width: 100%;
          height: clamp(560px, calc(100dvh - 190px), 900px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 18px 48px rgba(7, 1, 22, 0.3);
        }

        .is-fullscreen .bis-frame {
          width: 100%;
          height: 100dvh;
          border: 0;
          border-radius: 0;
        }

        .bis-note {
          width: min(850px, calc(100% - 32px));
          margin: 0 auto;
          padding: 4px 0 18px;
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 700px) {
          .bis-page {
            min-height: 100dvh;
            height: auto;
            overflow-x: hidden;
          }

          .bis-topbar {
            min-height: 60px;
            grid-template-columns: 40px minmax(0, 1fr) 40px;
            padding: 9px 12px;
            gap: 8px;
          }

          .bis-back {
            width: 40px;
            min-height: 40px;
            padding: 0;
          }

          .bis-back-label,
          .bis-actions .bis-fullscreen-label,
          .bis-actions .bis-mobile-label,
          .bis-download-label {
            display: none;
          }

          .bis-title {
            justify-content: center;
            gap: 7px;
            overflow: hidden;
          }

          .bis-title-icon {
            font-size: 18px;
          }

          .bis-title-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 14px;
          }

          .bis-actions {
            justify-self: end;
            display: block;
          }

          .bis-actions > button {
            display: none;
          }

          .bis-download {
            width: 40px;
            min-height: 40px;
            padding: 0;
            border-radius: 10px;
          }

          .bis-badge-row {
            flex: 0 0 auto;
            padding: 7px 10px 0;
          }

          .bis-badge {
            width: 100%;
            border-radius: 8px;
            padding: 6px 9px;
            font-size: 9.5px;
            line-height: 1.3;
          }

          .bis-dot {
            width: 6px;
            height: 6px;
          }

          .bis-viewer-wrap {
            flex: 0 0 auto;
            padding: 7px 8px 8px;
            display: block;
          }

          .bis-frame {
            display: block;
            width: 100%;
            height: calc((100vw - 16px) * 1.4142);
            min-height: 0;
            border-radius: 8px;
          }

          .bis-viewer-wrap.is-fullscreen .bis-frame {
            height: 100dvh;
          }

          .bis-note {
            display: none;
          }
        }

        @media (max-width: 380px) {
          .bis-title-text {
            font-size: 12.5px;
          }
        }
      `}</style>

      <header className="bis-topbar">
        <button
          className="bis-back"
          onClick={() => navigate(-1)}
          type="button"
          aria-label="Go back"
        >
          <ArrowLeftOutlined />
          <span className="bis-back-label">Back</span>
        </button>

        <div className="bis-title">
          <SafetyCertificateOutlined className="bis-title-icon" />
          <span className="bis-title-text">BIS Hallmark Certificate</span>
        </div>

        <div className="bis-actions">
          <button
            className="bis-action"
            type="button"
            onClick={() => setFullscreen(true)}
          >
            <FullscreenOutlined />
            <span className="bis-fullscreen-label">Fullscreen</span>
            <span className="bis-mobile-label">View Fullscreen</span>
          </button>

          <a
            className="bis-action bis-download"
            href={BIS_PDF_URL}
            download="BIS_Hallmark_Certificate.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadOutlined />
            <span className="bis-download-label">Download PDF</span>
          </a>
        </div>
      </header>

      <div className="bis-badge-row">
        <div className="bis-badge">
          <span className="bis-dot" />
          <span>Issued by the Bureau of Indian Standards (BIS), Government of India</span>
        </div>
      </div>

      <section
        className={`bis-viewer-wrap${fullscreen ? " is-fullscreen" : ""}`}
        aria-label="Certificate preview"
      >
        {fullscreen && (
          <button
            className="bis-action bis-fullscreen-close"
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Exit fullscreen"
          >
            <FullscreenExitOutlined />
            <span>Exit</span>
          </button>
        )}

        <iframe
          className="bis-frame"
          src={`${BIS_PDF_URL}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          title="BIS Hallmark Certificate"
        />
      </section>

      {!fullscreen && (
        <p className="bis-note">
          This certificate is issued by the Bureau of Indian Standards (BIS),
          Government of India. Gold products sold on this platform are BIS
          Hallmark certified for verified purity.
        </p>
      )}
    </main>
  );
}
