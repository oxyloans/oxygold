import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PhysicalGoldHeaderProps {
  cartItemCount: number;
  searchQuery?: string;
  onSearchChange?: (v: string) => void;
}

const PhysicalGoldHeader: React.FC<PhysicalGoldHeaderProps> = ({
  cartItemCount,
  searchQuery = "",
  onSearchChange,
}) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchExpanded) searchRef.current?.focus();
  }, [searchExpanded]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#2b0a59] via-[#3d1576] to-[#2b0a59] border-b border-amber-200/25 shadow-lg shadow-[#2b0a59]/20">
      <div className="flex items-center justify-between gap-3 max-w-screen-2xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30">
            <Sparkles className="h-4 w-4 text-[#2b0a59]" />
            <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/40 bg-white/10 mix-blend-screen opacity-40" />
          </div>
          <div className="leading-none">
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
              OxyGold
              <span className="ml-1.5 text-[10px] font-medium text-yellow-400/80">
                Store
              </span>
            </h1>
            <p className="hidden md:block text-[9px] text-white/40 tracking-wider mt-0.5">
              Hallmarked gold · Coins &amp; jewellery
            </p>
          </div>
        </div>

        {/* Search Bar – desktop (always visible) */}
        <div className="hidden sm:flex flex-1 max-w-xs lg:max-w-md items-center gap-2 bg-white/8 border border-white/15 rounded-full px-3 py-1.5 hover:border-white/30 transition-colors">
          <Search className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search jewellery, coins..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/35 outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.("")}
              className="text-white/40 hover:text-white/70 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Vedika AI */}
          <button
            type="button"
            onClick={() => navigate("/voiceAssistant")}
            className="cursor-pointer hidden lg:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.03] focus:outline-none"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Vedika AI</span>
          </button>

          {/* Digital Gold */}
          <button
            type="button"
            onClick={() => navigate("/how-it-works")}
            className="cursor-pointer hidden lg:inline-flex items-center gap-1.5 rounded-full 
  bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 
  px-3.5 py-1.5 text-[11px] font-bold text-black 
  shadow-lg shadow-yellow-500/30 
  transition hover:scale-[1.05] hover:shadow-yellow-500/50 
  focus:outline-none"
          >
            {/* <Sparkles className="h-3.5 w-3.5 text-yellow-900" /> */}
            <span>Buy Digital Gold</span>
          </button>

          {/* Search button – mobile */}
          <button
            type="button"
            onClick={() => setSearchExpanded((s) => !s)}
            className="sm:hidden cursor-pointer relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 shadow-lg transition hover:border-white/40 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Cart */}
          <button
            type="button"
            onClick={() => navigate("/physical-gold/cart")}
            aria-label="Open cart"
            className="cursor-pointer relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-yellow-300/25 bg-black/30 text-yellow-200 shadow-lg transition hover:scale-105 hover:border-yellow-300/50 focus:outline-none"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {cartItemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#150b33]">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((o) => !o)}
              aria-label="Toggle profile menu"
              className="cursor-pointer inline-flex h-9 items-center gap-1 px-2.5 rounded-full border border-white/15 bg-black/30 text-white/80 shadow-lg transition hover:scale-105 hover:border-white/35 hover:text-white"
            >
              <UserCircle className="h-5 w-5" />
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-50 origin-top-right rounded-2xl border border-white/15 bg-[#1b103a]/97 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="py-1.5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/physical-gold/profile");
                    }}
                    className="cursor-pointer flex w-full items-center gap-3 px-4 py-3 text-sm text-white/85 hover:bg-white/8 transition-colors"
                  >
                    <User className="h-4 w-4 text-yellow-400" />
                    <span className="font-semibold">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/physical-gold/orders");
                    }}
                    className="cursor-pointer flex w-full items-center gap-3 px-4 py-3 text-sm text-white/85 hover:bg-white/8 transition-colors"
                  >
                    <Package className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold">My Orders</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {searchExpanded && (
        <div className="sm:hidden mt-2 flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-3 py-2">
          <Search className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search jewellery, coins..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/35 outline-none font-medium"
          />
          <button
            onClick={() => {
              setSearchExpanded(false);
              onSearchChange?.("");
            }}
            className="text-white/50 hover:text-white/80 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};

export default PhysicalGoldHeader;