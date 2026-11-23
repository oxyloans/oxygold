import React from 'react';
import { PhoneCall } from 'lucide-react';

interface TollFreeHelplineBadgeProps {
  phoneNumber?: string;
  displayNumber?: string;
  className?: string;
}

const TollFreeHelplineBadge: React.FC<TollFreeHelplineBadgeProps> = ({
  phoneNumber = '04041897778',
  displayNumber = '040 4189 7778',
  className = '',
}) => {
  return (
    <aside
      aria-label="Toll Free Helpline"
      className={`fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-[9999] transition-all duration-300 opacity-100 pointer-events-auto translate-y-0 visible ${className}`}
    >
      <a
        href={`tel:${phoneNumber}`}
        aria-label="Call 24/7 Toll Free Helpline 040 4189 7778"
        title="Call 24/7 Toll Free Helpline: 040 4189 7778"
        className="group relative inline-flex items-center gap-2 sm:gap-2.5 rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-xl border border-amber-500/35 hover:border-amber-400 shadow-[0_6px_24px_rgba(15,3,38,0.65)] hover:shadow-[0_10px_28px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-[1.03] text-decoration-none"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 10, 46, 0.94) 0%, rgba(15, 3, 30, 0.97) 100%)',
        }}
      >
        {/* Subtle gold/purple ambient glow behind badge */}
        <span
          className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-600/15 to-transparent blur-sm opacity-60 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        />

        {/* Circular Phone Icon Badge - Existing Gold Theme */}
        <div
          className="relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full shadow-md group-hover:scale-105 transition-transform duration-200"
          style={{
            background: 'linear-gradient(135deg, #F5D36C 0%, #D4AF37 50%, #B8962E 100%)',
          }}
        >
          <PhoneCall size={14} className="text-[#3D0B7A]" />
        </div>

        {/* Text Details */}
        <div className="relative z-10 flex flex-col items-start text-left leading-tight">
          {/* Top Row: Label */}
          <div className="text-[8.5px] sm:text-[9.5px] font-bold tracking-wider text-gray-300 uppercase">
            <span className="text-gray-300 group-hover:text-amber-200 transition-colors">
              TOLL FREE HELPLINE • 24/7
            </span>
          </div>

          {/* Bottom Row: Toll Free Phone Number */}
          <div className="mt-0.5 text-[11px] sm:text-xs font-extrabold tracking-wide text-white group-hover:text-[#F5D36C] transition-colors">
            {displayNumber}
          </div>
        </div>
      </a>
    </aside>
  );
};

export default TollFreeHelplineBadge;
