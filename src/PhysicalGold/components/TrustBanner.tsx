import React from "react";
import { Shield, Truck, RefreshCw, Award } from "lucide-react";
import "../styles.css";

const TrustBanner: React.FC = () => {
  const badges = [
    { icon: Shield, title: "BIS Hallmarked", desc: "Certified 22K purity" },
    { icon: Truck, title: "Insured Delivery", desc: "Safe & secure shipping" },
    { icon: RefreshCw, title: "Easy Returns", desc: "15-day return policy" },
    { icon: Award, title: "Lifetime Exchange", desc: "100% exchange value" },
  ];

  return (
    <div className="py-12 bg-[#3D251E] mt-0">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 max-w-5xl mx-auto">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-3 group">
              <div className="w-14 h-14 rounded-full border border-[#C29B27]/40 flex items-center justify-center mb-1 group-hover:border-[#C29B27] transition-all bg-[#3D251E] shadow-sm">
                <badge.icon size={22} className="text-[#C29B27]" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[#C29B27] font-serif text-[15px] font-bold mb-1 tracking-wide">{badge.title}</h4>
                <p className="text-[#C29B27]/70 text-xs font-semibold uppercase tracking-wider">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBanner;
