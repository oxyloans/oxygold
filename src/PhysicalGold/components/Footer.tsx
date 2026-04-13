import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import "../styles.css";

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: "hsl(20, 30%, 10%)", color: "hsl(20, 8%, 45%)" }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-4 text-gradient-gold">
              OXYGOLD
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(20, 8%, 45%)" }}>
              Your trusted destination for authentic 22K hallmarked gold jewellery.
              Crafted with precision, delivered with care.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: "hsl(20, 20%, 15%)" }}>
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: "hsl(20, 20%, 15%)" }}>
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: "hsl(20, 20%, 15%)" }}>
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "white" }}>
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>About Us</a></li>
              <li><a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>Our Story</a></li>
              <li><a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>Certifications</a></li>
              <li><a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>Blog</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "white" }}>
              Customer Service
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>Contact Us</a></li>
              <li><a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>Shipping Policy</a></li>
              <li><a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>Return Policy</a></li>
              <li><a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>FAQs</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "white" }}>
              Contact Info
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: "hsl(38, 80%, 45%)" }} />
                <span>123 Gold Street, Mumbai, Maharashtra 400001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" style={{ color: "hsl(38, 80%, 45%)" }} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0" style={{ color: "hsl(38, 80%, 45%)" }} />
                <span>support@oxygold.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ borderTop: "1px solid hsl(20, 20%, 15%)" }}>
          <p style={{ color: "hsl(20, 8%, 45%)" }}>
            © 2024 OxyGold. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>
              Privacy Policy
            </a>
            <a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>
              Terms of Service
            </a>
            <a href="#" className="transition-colors" style={{ color: "hsl(20, 8%, 45%)" }}>
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
