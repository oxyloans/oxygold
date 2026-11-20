import React from "react";
import Logo from "../assets/oxygoldlogo-wk.webp";
import { PhoneCall } from "lucide-react";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";

type LinkItem = { label: string; href: string };

type OxyGoldFooterProps = {
  aboutText?: string;
  address1?: string;
  address2?: string;
  phones?: string[];
  email?: string;
  links?: LinkItem[];
  year?: number;
};

const DEFAULT_LINKS: LinkItem[] = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact Us", href: "/contact" },
];

export default function OxyGoldFooter({
  aboutText = `OXYGOLD.AI is India's Digital Gold Bank — a secure, tech-driven platform designed to bring transparency, trust, and traceability to the gold ecosystem. Built for investors, bullion traders, and institutions seeking vault-grade digital authority.`,
  address1 = "OXYIDEAS PARTNERS LLP, CC-02, Indu Fortune Fields, KPHB, Hyderabad, Telangana - 500085",
  address2 = "AI Research Center, Entrance D, SE02 Concourse, Miyapur Metro Station, Hyderabad, Telangana 500049",
  phones = ["+91 81432 71103"],
  email = "support@oxygold.ai",
  links = DEFAULT_LINKS,
  year = new Date().getFullYear(),
}: OxyGoldFooterProps) {
  return (
    <footer className="w-full border-t border-white/10 pt-12 pb-6 text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto sm:px-4 px-2  relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Column 1: Logo + About */}
          <div className="space-y-5">
            <img  
              src={Logo} 
              alt="OxyGold Logo" 
              width={180}
              height={64}
              className="h-14 md:h-16 w-auto object-contain cursor-pointer"
            />
            <p className="text-gray-300/90 text-base leading-relaxed max-w-md">
              {aboutText}
            </p>

            {/* Google Play Store Badge */}
            <a
              href="https://play.google.com/store/apps/details?id=com.oxygold.ai&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download OXYGOLD App on Google Play Store"
              className="inline-block transition-transform duration-200 hover:scale-105"
            >
              <img
                src="https://s2.rdbuz.com/web/images/homeV2/appinstall/playStore.svg"
                alt="Get it on Google Play"
                loading="lazy"
                width={128}
                height={38}
                className="w-28 sm:w-32 h-auto"
              />
            </a>
          </div>

          {/* Column 2: Office Address & Contact */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-300/80">
              OFFICE ADDRESS
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight m-0">
              Visit us in Hyderabad
            </h3>

            <div className="flex flex-col gap-3 text-gray-300/90 text-sm sm:text-base leading-relaxed pt-1">
              <div className="flex gap-2.5 items-start">
                <EnvironmentOutlined className="mt-1 text-amber-400 text-base flex-shrink-0" />
                <p className="m-0 leading-relaxed">{address1}</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <EnvironmentOutlined className="mt-1 text-amber-400 text-base flex-shrink-0" />
                <p className="m-0 leading-relaxed text-gray-400 text-xs sm:text-sm">{address2}</p>
              </div>
            </div>

            {/* Toll Free Pill Button (matching design in reference image) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="tel:04041897778"
                className="inline-flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02] text-decoration-none group"
                style={{
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F5D36C 50%, #E8B949 100%)',
                  color: '#2A1202',
                }}
                title="Click to call Toll Free: 040 4189 7778"
              >
                <PhoneCall size={18} className="text-[#2A1202] group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base font-bold tracking-wide">
                  Toll Free: 040 4189 7778
                </span>
                <span
                  className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold border border-black/10"
                  style={{
                    background: 'rgba(42, 18, 2, 0.1)',
                    color: '#2A1202',
                  }}
                >
                  24/7 · 365 Days
                </span>
              </a>

              {/* Email Glass Pill Button (matching design in reference image) */}
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-gray-200 hover:text-white transition-all duration-300 text-sm sm:text-base group text-decoration-none shadow-sm"
                title="Email Us"
              >
                <MailOutlined className="text-amber-400 group-hover:scale-110 transition-transform text-base" />
                <span className="font-medium">{email}</span>
              </a>
            </div>

            <div className="pt-1 flex items-center gap-2 text-xs text-gray-400">
              <PhoneOutlined className="text-amber-400 flex-shrink-0" />
              <span>Direct lines: {phones.join(" , ")}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="mt-10 p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 backdrop-blur-sm">
          <p className="text-sm text-gray-300/80 leading-relaxed text-center max-w-6xl mx-auto">
            <span className="font-semibold text-yellow-400">Disclaimer:</span>{" "}
           OXYGOLD.AI provides digital infrastructure only and does not assume physical custody unless specified. Users are responsible for due diligence prior to transactions.
          </p>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400/80 w-full">
          <p className="m-0 text-left">
            © {year}-{year + 1} OXYGOLD.AI. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {links.map((link, idx) => (
              <React.Fragment key={link.href}>
                {idx > 0 && <span className="text-gray-600">|</span>}
                <a href={link.href} className="hover:text-amber-400 transition-colors">
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

