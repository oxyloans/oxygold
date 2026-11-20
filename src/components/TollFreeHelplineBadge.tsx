import React, { useEffect, useState } from 'react';
import { PhoneCall } from 'lucide-react';
import TokenManager from '../utils/tokenManager';

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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setIsScrolled(scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If user is logged in ("inside that login"), do not display
  if (TokenManager.getInstance().isLoggedIn()) {
    return null;
  }

  return (
    <aside
      aria-label="Toll Free Helpline"
      className={`fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-[9999] transition-all duration-300 ${
        isScrolled
          ? 'opacity-0 pointer-events-none translate-y-4 invisible'
          : 'opacity-100 pointer-events-auto translate-y-0 visible'
      } ${className}`}
    >
      <a
        href={`tel:${phoneNumber}`}
        aria-label="Call 24/7 Toll Free Helpline 040 4189 7778"
        title="Call 24/7 Toll Free Helpline: 040 4189 7778"
        className="group relative inline-flex items-center gap-2.5 sm:gap-3 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-xl border border-amber-500/35 hover:border-amber-400 shadow-[0_8px_32px_rgba(15,3,38,0.65)] hover:shadow-[0_12px_36px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-[1.03] text-decoration-none"
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
          className="relative z-10 flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full shadow-md group-hover:scale-105 transition-transform duration-200"
          style={{
            background: 'linear-gradient(135deg, #F5D36C 0%, #D4AF37 50%, #B8962E 100%)',
          }}
        >
          <PhoneCall size={17} className="text-[#3D0B7A]" />
        </div>

        {/* Text Details */}
        <div className="relative z-10 flex flex-col items-start text-left leading-tight">
          {/* Top Row: Green live dot + label */}
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-gray-300 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            </span>
            <span className="text-gray-300 group-hover:text-amber-200 transition-colors">
              TOLL FREE HELPLINE • 24/7
            </span>
          </div>

          {/* Bottom Row: Toll Free Phone Number */}
          <div className="mt-0.5 text-xs sm:text-sm font-extrabold tracking-wide text-white group-hover:text-[#F5D36C] transition-colors">
            {displayNumber}
          </div>
        </div>
      </a>
    </aside>
  );
};

export default TollFreeHelplineBadge;
