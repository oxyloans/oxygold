import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer style={{ backgroundColor: "hsl(20, 30%, 10%)", color: "hsl(30, 15%, 70%)" }}>
      <div className="container mx-auto px-4 md:px-8 lg:px-8 sm:px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-4 text-gradient-gold">
              OXYGOLD
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(30, 15%, 70%)" }}>
              Your trusted destination for authentic 22K hallmarked gold jewellery.
              Crafted with precision, delivered with care.
            </p>
            {/* <div className="flex gap-3 mt-4">
              <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#C29B27]" style={{ backgroundColor: "hsl(20, 20%, 15%)", color: "hsl(30, 15%, 70%)" }}>
                <Facebook size={16} />
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#C29B27]" style={{ backgroundColor: "hsl(20, 20%, 15%)", color: "hsl(30, 15%, 70%)" }}>
                <Instagram size={16} />
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#C29B27]" style={{ backgroundColor: "hsl(20, 20%, 15%)", color: "hsl(30, 15%, 70%)" }}>
                <Twitter size={16} />
              </button>
            </div> */}
          </div>

          {/* Quick Links */}
          {/* <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "hsl(38, 80%, 55%)" }}>
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors hover:text-[#C29B27]" style={{ color: "hsl(30, 15%, 70%)" }}>About Us</a></li>
              <li><a href="#" className="transition-colors hover:text-[#C29B27]" style={{ color: "hsl(30, 15%, 70%)" }}>Our Story</a></li>
              <li><a href="#" className="transition-colors hover:text-[#C29B27]" style={{ color: "hsl(30, 15%, 70%)" }}>Certifications</a></li>
              <li><a href="#" className="transition-colors hover:text-[#C29B27]" style={{ color: "hsl(30, 15%, 70%)" }}>Blog</a></li>
            </ul>
          </div> */}

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "hsl(38, 80%, 55%)" }}>
              Policies
            </h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate("/physical-gold/privacy-policy")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>Privacy Policy</button></li>
              <li><button onClick={() => navigate("/physical-gold/terms-conditions")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>Terms & Conditions</button></li>
              <li><button onClick={() => navigate("/physical-gold/shipping-policy")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>Shipping Policy</button></li>
              <li><button onClick={() => navigate("/physical-gold/return-refund-policy")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>Return & Refund Policy</button></li>
              <li><button onClick={() => navigate("/physical-gold/faq")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>FAQs</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "hsl(38, 80%, 55%)" }}>
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: "hsl(30, 15%, 70%)" }}>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: "hsl(38, 80%, 55%)" }} />
                <span>OXYIDEAS PARTNERS LLP, CC-03, Indu Fortune Fields, KPHB, Hyderabad, Telangana - 500085</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: "hsl(38, 80%, 55%)" }} />
                <span>AI Research Center, Entrance D, SE02 Concourse, Miyapur Metro Station, Hyderabad, Telangana 500049</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" style={{ color: "hsl(38, 80%, 55%)" }} />
                <span>+91 81432 71103</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0" style={{ color: "hsl(38, 80%, 55%)" }} />
                <span>support@askoxy.ai</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ borderTop: "1px solid hsl(20, 20%, 20%)" }}>
          <p style={{ color: "hsl(30, 15%, 60%)" }}>
            © 2026 OxyGold by OXYIDEAS PARTNERS LLP. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <button onClick={() => navigate("/physical-gold/privacy-policy")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>
              Privacy Policy
            </button>
            <button onClick={() => navigate("/physical-gold/terms-conditions")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>
              Terms & Conditions
            </button>
            <button onClick={() => navigate("/physical-gold/cookie-policy")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>
              Cookie Policy
            </button>
            <button onClick={() => navigate("/physical-gold/cancellation-policy")} className="transition-colors hover:text-[#C29B27] cursor-pointer" style={{ color: "hsl(30, 15%, 70%)" }}>
              Cancellation Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
