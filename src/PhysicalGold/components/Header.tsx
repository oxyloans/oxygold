import React, { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, User, Heart, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import "../styles.css";

interface HeaderProps {
  categories?: Array<{ id: string; name: string }>;
  searchQuery?: string;
  onSearchChange?: (v: string) => void;
  onCategoryClick?: (categoryId: string) => void;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  categories = [],
  searchQuery = "",
  onSearchChange,
  onCategoryClick,
  onLogoClick,
}) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
      {/* Top Banner */}
      <div className="bg-accent border-b border-gray-200">
        <div className="container mx-auto px-4 py-2 text-center">
          <p className="text-xs font-medium tracking-wide text-white">
            Free Shipping on Orders Above ₹50,000
          </p>
        </div>
      </div>

      {/* Main Header */}
      <div style={{ borderBottom: "1px solid hsl(30, 20%, 88%)" }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 transition-colors text-foreground hover:text-primary"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <button
              onClick={() => {
                if (onLogoClick) {
                  onLogoClick();
                } else {
                  navigate("/physical-gold");
                }
                window.scrollTo(0, 0);
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-serif font-semibold text-xl md:text-2xl tracking-tight text-primary">
                OXYGOLD
              </span>
            </button>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  placeholder="Search jewellery..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-secondary border border-gray-200 text-foreground"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-5">
              {/* Mobile Search */}
              <button className="md:hidden p-2 cursor-pointer transition-colors text-foreground hover:text-primary">
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => navigate("/physical-gold/wishlist")}
                className="hidden md:block p-2 cursor-pointer transition-colors relative text-foreground hover:text-primary"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center font-semibold bg-primary text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => navigate("/physical-gold/profile")}
                  className="p-2 transition-colors cursor-pointer text-foreground hover:text-primary"
                  aria-label="Account"
                >
                  <User size={20} />
                </button>
              </div>

              {/* Cart */}
              <button
                onClick={() => navigate("/physical-gold/cart")}
                className="p-2 transition-colors cursor-pointer relative text-foreground hover:text-primary"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center font-semibold bg-primary text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Category Navigation */}
      {categories.length > 0 && (
        <nav className="hidden md:block" style={{ borderBottom: "1px solid hsl(30, 20%, 88%)", backgroundColor: "hsl(30, 15%, 97%)" }}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-8 py-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryClick?.(cat.id)}
                  className="text-[13px] font-sans cursor-pointer tracking-wide transition-colors uppercase text-foreground hover:text-primary"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute inset-x-0 top-full shadow-lg z-50 bg-background border-b border-gray-200">
          <nav className="flex flex-col p-4 gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onCategoryClick?.(cat.id);
                }}
                className="py-3 px-4 text-sm font-sans rounded-md transition-colors uppercase tracking-wide text-left text-foreground hover:text-primary hover:bg-secondary"
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/physical-gold/wishlist");
              }}
              className="py-3 px-4 text-sm font-sans rounded-md transition-colors uppercase tracking-wide text-left text-foreground hover:text-primary hover:bg-secondary"
            >
              Wishlist
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
