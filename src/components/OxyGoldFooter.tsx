import React from "react";
import Logo from "../assets/oxygoldlogo1.jpg.jpeg";
import {
  FacebookFilled,
  LinkedinFilled,
  TwitterSquareFilled,
  YoutubeFilled,
  InstagramFilled,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

type LinkItem = { label: string; href: string };

type OxyGoldFooterProps = {
  aboutText?: string;
  address1?: string;
  address2?: string;
  phones?: string[];
  email?: string;
  websiteLabel?: string;
  websiteHref?: string;
  social?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
  };
  links?: LinkItem[];
  year?: number;
  onReadMore?: () => void;
};

const DEFAULT_LINKS: LinkItem[] = [
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function OxyGoldFooter({
  aboutText = `OXYGOLD.AI is India's Digital Gold Bank — a secure, tech-driven platform designed to bring transparency, trust, and traceability to the gold ecosystem. Built for investors, bullion traders, and institutions seeking vault-grade digital authority.`,
  address1 = "OXYKART TECHNOLOGIES PVT LTD, CC-02, Indu Fortune Fields, KPHB, Hyderabad, Telangana - 500085",
  address2 = "AI Research Center, Entrance D, SE02 Concourse, Miyapur Metro Station, Hyderabad, Telangana 500049",
  phones = ["+91 81432 71103", "+91 91105 64106"],
  email = "support@askoxy.ai",
  websiteLabel = "www.oxygold.ai",
  websiteHref = "https://www.oxygold.ai",
  social = {
    facebook: "https://www.facebook.com/profile.php?id=61572388385568",
    linkedin: "https://www.linkedin.com/in/askoxy-ai-5a2157349/",
    twitter: "https://x.com/RadhakrishnaIND/status/1951525686373421101",
    youtube: "https://www.youtube.com/@askoxyDOTai",
    instagram: "https://www.instagram.com/askoxy.ai/",
  },
  links = DEFAULT_LINKS,
  year = new Date().getFullYear(),
  onReadMore,
}: OxyGoldFooterProps) {
  return (
    <>
      <footer style={styles.footer}>
        <div style={styles.container} className="oxy-footer-container">
          {/* Top row */}
          <div style={styles.grid} className="oxy-footer-grid">
            {/* Left */}
            <div style={styles.leftSection}>
              <img src={Logo} alt="OxyGold Logo" style={styles.logo} />

              {/* Contact items */}
              <div style={styles.contactList}>
                <div style={styles.contactItem} className="oxy-contact-item">
                  <EnvironmentOutlined style={styles.icon} />
                  <p style={styles.contactText}>{address1}</p>
                </div>

                <div style={styles.contactItem} className="oxy-contact-item">
                  <EnvironmentOutlined style={styles.icon} />
                  <p style={styles.contactText}>{address2}</p>
                </div>

                <div style={styles.contactItem} className="oxy-contact-item">
                  <PhoneOutlined style={styles.icon} />
                  <p style={styles.contactText}>
                    {phones?.filter(Boolean).join(" / ")}
                  </p>
                </div>

                <div style={styles.contactItem} className="oxy-contact-item">
                  <MailOutlined style={styles.icon} />
                  <a style={styles.link} href={`mailto:${email}`}>
                    {email}
                  </a>
                </div>

                <div style={styles.contactItem} className="oxy-contact-item">
                  <GlobalOutlined style={styles.icon} />
                  <a
                    style={styles.link}
                    href={websiteHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {websiteLabel}
                  </a>
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={styles.rightSection}>
              {/* Social icons - align to top-right like IBJA */}
              <div
                style={styles.socialContainer}
                className="oxy-social-container"
              >
                <SocialIcon href={social.facebook} label="Facebook">
                  <FacebookFilled />
                </SocialIcon>
                <SocialIcon href={social.linkedin} label="LinkedIn">
                  <LinkedinFilled />
                </SocialIcon>
                <SocialIcon href={social.twitter} label="Twitter/X">
                  <TwitterSquareFilled />
                </SocialIcon>
                <SocialIcon href={social.youtube} label="YouTube">
                  <YoutubeFilled />
                </SocialIcon>
                <SocialIcon href={social.instagram} label="Instagram">
                  <InstagramFilled />
                </SocialIcon>
              </div>

              <h3 style={styles.aboutTitle}>
                About <span style={styles.goldText}>OXYGOLD.AI</span>
              </h3>
              <div style={styles.divider} />

              <p style={styles.aboutText}>{aboutText}</p>

              <button
                type="button"
                onClick={onReadMore}
                style={styles.readMoreBtn}
              >
                READ MORE
              </button>
            </div>
          </div>

          {/* Bottom / disclaimer */}
          <div style={styles.bottomSection}>
            <p style={styles.disclaimer}>
              <span style={styles.disclaimerBold}>Disclaimer:</span> OXYGOLD.AI
              provides a secure digital infrastructure platform. The company
              does not directly handle physical custody unless explicitly
              stated. Users must exercise due diligence before executing any
              gold transaction.
            </p>

            <div style={styles.linksContainer} className="oxy-links-container">
              {links?.map((l, idx) => (
                <React.Fragment key={l.href + idx}>
                  <a href={l.href} style={styles.footerLink}>
                    {l.label}
                  </a>
                  {idx !== links.length - 1 && (
                    <span style={styles.separator}>|</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <p style={styles.copyright}>
              © {year} OXYGOLD.AI. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ✅ Updated CSS that actually applies */}
      <style>{responsiveStyles}</style>
    </>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  const safeHref = href && href.trim() ? href : "#";
  return (
    <a
      href={safeHref}
      aria-label={label}
      target={safeHref === "#" ? undefined : "_blank"}
      rel={safeHref === "#" ? undefined : "noreferrer"}
      style={styles.socialIcon}
      className="social-icon"
    >
      <span style={styles.socialIconInner}>{children}</span>
    </a>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    width: "100%",
    background: "#2B0A59",
    color: "#fff",
  },
  container: {
    padding: "28px 24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px",
    alignItems: "start",
  },
  leftSection: { width: "100%" },
  logo: {
    width: "180px",
    height: "auto",
    marginBottom: "20px",
    borderRadius: "8px",
  },
  connectHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: "14px",
    flexWrap: "wrap",
  },
  connectText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(28px, 5vw, 44px)",
    letterSpacing: "0.12em",
    margin: 0,
    fontWeight: 700,
  },
  withText: {
    fontSize: "clamp(16px, 3vw, 20px)",
    fontWeight: 500,
    opacity: 0.9,
  },
  usText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(28px, 5vw, 44px)",
    letterSpacing: "0.12em",
    color: "#D4AF37",
    margin: 0,
    fontWeight: 700,
  },
  contactList: {
    marginTop: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  contactItem: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  icon: { marginTop: "4px", color: "#D4AF37", fontSize: "18px" },
  contactText: {
    color: "#EDE7FF",
    lineHeight: 1.65,
    margin: 0,
    fontSize: "15px",
  },
  link: { color: "#EDE7FF", textDecoration: "none", fontSize: "15px" },

  rightSection: { width: "100%" },
  socialContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  socialIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#D4AF37",
    textDecoration: "none",
  },
  socialIconInner: { fontSize: "20px" },

  aboutTitle: {
    fontSize: "clamp(22px, 4vw, 32px)",
    fontWeight: 600,
    margin: 0,
  },
  goldText: { color: "#D4AF37" },
  divider: {
    marginTop: "12px",
    height: "3px",
    width: "64px",
    background: "#D4AF37",
  },
  aboutText: {
    marginTop: "14px",
    color: "#EDE7FF",
    lineHeight: 1.5,
    fontSize: "14px",
  },

  readMoreBtn: {
    marginTop: "16px",
    padding: "10px 18px",
    borderRadius: "6px",
    background: "#D4AF37",
    color: "#2B0A59",
    fontWeight: 700,
    letterSpacing: "0.08em",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
  },

  bottomSection: {
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid #3D0B7A",
    textAlign: "center",
  },
  disclaimer: {
    fontSize: "13px",
    color: "#EDE7FF",
    lineHeight: 1.5,
    maxWidth: "1100px",
    margin: "0 auto",
  },
  disclaimerBold: { fontWeight: 700, color: "#D4AF37" },

  linksContainer: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    fontSize: "14px",
  },
  footerLink: { color: "#D4AF37", textDecoration: "none" },
  separator: { color: "#8A5BFF" },

  copyright: { marginTop: "10px", fontSize: "11px", color: "#C9A227" },
};

const responsiveStyles = `
  /* Hover effects */
  .social-icon:hover {
    background: rgba(255,255,255,0.16);
    color: #F5D36C;
    transform: translateY(-2px);
    transition: all 0.25s ease;
  }

  .oxy-footer-container a:hover {
    color: #F5D36C !important;
    transition: color 0.2s ease;
  }

  .oxy-footer-container button:hover {
    background: #F5D36C !important;
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }

  /* Desktop: 2 columns like IBJA */
  @media (min-width: 1024px) {
    .oxy-footer-grid {
      grid-template-columns: 1fr 1fr !important;
      column-gap: 60px !important;
    }
    .oxy-social-container {
      justify-content: flex-end !important;
      margin-top: -6px;
    }
  }

  /* Tablet & Mobile */
  @media (max-width: 768px) {
    .oxy-footer-container {
      padding: 34px 16px !important;
    }
    .oxy-connect-header {
      justify-content: center !important;
      text-align: center !important;
    }
    .oxy-social-container {
      justify-content: center !important;
    }
    .oxy-contact-item {
      flex-direction: row !important;
      justify-content: center !important;
      text-align: left !important;
    }
  }

  /* Small mobile */
  @media (max-width: 480px) {
    .oxy-links-container {
      flex-direction: column !important;
      gap: 6px !important;
    }
    .oxy-links-container span {
      display: none !important;
    }
  }
`;
