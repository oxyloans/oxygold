import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SafetyCertificateOutlined, ArrowLeftOutlined, DownloadOutlined, FullscreenOutlined } from "@ant-design/icons";
import hallmarkPDF from "../assets/Hall_Mark_CERTIFICATE.pdf";

const BIS_PDF_URL: string = hallmarkPDF;

export default function BISCertificate() {
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div style={styles.page}>
      {/* Header Bar */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)} type="button">
          <ArrowLeftOutlined style={{ fontSize: 16 }} />
          <span>Back</span>
        </button>

        <div style={styles.titleGroup}>
          <SafetyCertificateOutlined style={styles.titleIcon} />
          <span style={styles.titleText}>BIS Hallmark Certificate</span>
        </div>

        {/* <div style={styles.actions}>
          <button
            style={styles.actionBtn}
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            title="Toggle fullscreen"
          >
            <FullscreenOutlined style={{ fontSize: 15 }} />
            <span>{fullscreen ? "Exit" : "Fullscreen"}</span>
          </button>
          <a
            href={BIS_PDF_URL}
            download="BIS_Hallmark_Certificate.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.downloadBtn}
          >
            <DownloadOutlined style={{ fontSize: 15 }} />
            <span>Download</span>
          </a>
        </div> */}
      </div>

      {/* Trust Badge */}
      <div style={styles.badgeBar}>
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Issued by Bureau of Indian Standards (BIS) · Government of India
        </div>
      </div>

      {/* PDF Viewer */}
      <div style={fullscreen ? styles.viewerFullscreen : styles.viewerWrapper}>
        <iframe
          src={`${BIS_PDF_URL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          style={styles.iframe}
          title="BIS Hallmark Certificate"
        />
      </div>

      {/* Footer note */}
      {!fullscreen && (
        <p style={styles.note}>
          This certificate is issued by the Bureau of Indian Standards (BIS), Government of India.
          All gold sold on this platform is BIS Hallmark certified for guaranteed purity.
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 700px at 20% 10%, rgba(138,91,255,0.18) 0%, rgba(43,10,89,1) 60%), linear-gradient(180deg, #2B0A59 0%, #160537 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "0",
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(12px)",
    flexWrap: "wrap",
    gap: "12px",
  },

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "10px",
    color: "#fff",
    padding: "9px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  titleIcon: {
    fontSize: "22px",
    color: "#F5D36C",
  },

  titleText: {
    fontSize: "17px",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "0.2px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "10px",
    color: "#fff",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    border: "none",
    borderRadius: "10px",
    color: "#2B0A59",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: 900,
    cursor: "pointer",
    textDecoration: "none",
    boxShadow: "0 4px 14px rgba(212,175,55,0.30)",
    transition: "all 0.2s ease",
  },

  badgeBar: {
    padding: "12px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(212,175,55,0.10)",
    border: "1px solid rgba(212,175,55,0.35)",
    borderRadius: "999px",
    padding: "7px 16px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#F5D36C",
  },

  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #D4AF37, #F5D36C)",
    flexShrink: 0,
  },

  viewerWrapper: {
    flex: 1,
    padding: "20px 28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  viewerFullscreen: {
    position: "fixed" as const,
    inset: 0,
    zIndex: 9999,
    background: "#000",
    padding: 0,
    display: "flex",
  },

  iframe: {
    flex: 1,
    width: "80%",
    minHeight: "100vh",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "16px",
    background: "#fff",
  },

  note: {
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: "12.5px",
    padding: "14px 28px 24px",
    margin: 0,
    lineHeight: 1.6,
  },
};
