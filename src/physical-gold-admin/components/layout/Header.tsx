import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30">
      {/* Mobile + Tablet Only */}
      <div className="flex w-full items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-50 rounded-md transition-all text-slate-600"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col items-end text-right">
          <span
            className="text-[16px] font-extrabold leading-tight tracking-wide bg-gradient-to-r from-[#7A4E00] via-[#D4AF37] to-[#F8E38A] bg-clip-text text-transparent"
            style={{
              textShadow: "0 1px 2px rgba(212,175,55,0.15)",
            }}
          >
            OXY<span className="font-black">GOLD</span>
          </span>
        </div>
      </div>

      {/* Desktop Empty Same */}
      <div className="hidden lg:block"></div>

      <div className="hidden lg:flex items-center gap-2">
        <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
      </div>
    </header>
  );
};

export default Header;
