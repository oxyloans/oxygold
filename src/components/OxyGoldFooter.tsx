import React from "react";
import Logo from "../assets/oxygoldlogo.png";
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
  address1 = "OXYKART TECHNOLOGIES PVT LTD, CC-02, Indu Fortune Fields, KPHB, Hyderabad, Telangana - 500085",
  address2 = "AI Research Center, Entrance D, SE02 Concourse, Miyapur Metro Station, Hyderabad, Telangana 500049",
  phones = ["+91 81432 71103"],
  email = "VThatavarti16@oxygold.ai",
  links = DEFAULT_LINKS,
  year = new Date().getFullYear(),
}: OxyGoldFooterProps) {
  return (
    <footer className="w-full border-t border-white/10 pt-12 pb-6 text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Column 1: Logo + About */}
          <div className="space-y-5">
            <img 
              src={Logo} 
              alt="OxyGold Logo" 
              className="w-58 h-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-300" 
            />
            <p className="text-gray-300/90 text-base leading-relaxed max-w-md">
              {aboutText}
            </p>
          </div>

          {/* Column 2: Contact Us */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white/95 tracking-wide">Contact Us</h3>
            <div className="flex flex-col gap-5">
              <div className="flex gap-3 items-start">
                <EnvironmentOutlined className="mt-1 text-yellow-500 text-xl flex-shrink-0" />
                <p className="text-gray-300/90 text-base leading-relaxed m-0">{address1}</p>
              </div>
              <div className="flex gap-3 items-start">
                <EnvironmentOutlined className="mt-1 text-yellow-500 text-xl flex-shrink-0" />
                <p className="text-gray-300/90 text-base leading-relaxed m-0">{address2}</p>
              </div>
              <div className="flex gap-3 items-start">
                <MailOutlined className="mt-1 text-yellow-500 text-xl flex-shrink-0" />
                <a 
                  href={`mailto:${email}`} 
                  className="text-gray-300/90 text-base hover:text-yellow-400 transition-colors"
                >
                  {email}
                </a>
              </div>
              <div className="flex gap-3 items-start">
                <PhoneOutlined className="mt-1 text-yellow-500 text-xl flex-shrink-0" />
                <p className="text-gray-300/90 text-base m-0">{phones.join(" , ")}</p>
              </div>
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
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-between  text-center items-center gap-4">
          <p className="text-xs text-center  text-gray-400/80 m-0">
            © {year}-{year+1 } OXYGOLD.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

