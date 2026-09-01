import React, { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import oxygoldLogo from "../../assets/oxygoldlogo.png";
import Toast from "./Toast";
import TokenManager from "../../utils/tokenManager";
import "../styles.css";

interface HeaderProps {
  categories?: Array<{ id: string; name: string }>;
  onCategoryClick?: (categoryId: string) => void;
  onLogoClick?: () => void;
  selectedCategoryId?: string;
}

const Header: React.FC<HeaderProps> = ({
  categories = [],
  onCategoryClick,
  onLogoClick,
  selectedCategoryId,
}) => {
  const navigate = useNavigate();
  const { totalItems, cartNotification, dismissCartNotification } = useCart();
  const { wishlistCount } = useWishlist();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md ">
      {cartNotification && <Toast message={cartNotification.message} type={cartNotification.type} onClose={dismissCartNotification} />}
      {/* Top Banner */}
      <div className="bg-accent border-b border-gray-200">
        <div className="container mx-auto px-8 py-2 text-center">
          <p className="text-xs font-medium tracking-wide text-white">
            Free Shipping on Orders Above ₹50,000
          </p>
        </div>
      </div>

      {/* Main Header */}
      <div style={{ borderBottom: "0.5px solid hsl(40, 20%, 88%)" }}>
        <div className="container mx-auto px-4 md:px-8 sm:px-4 lg:px-8 h-14">
          <div className="flex items-center justify-between h-12 md:h-12">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 transition-colors text-foreground hover:text-primary"
              aria-label="Toggle menu"
              title="Menu"
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
              <img 
                src={oxygoldLogo} 
                alt="OxyGold" 
                className="h-4 md:h-7 w-auto object-contain"
              />
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-5">
              {/* Digital Gold Button */}
              {/* <button
                onClick={() => navigate("/buy-gold")}
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 cursor-pointer rounded-lg bg-[#C29B27] text-white text-[12px] font-semibold hover:bg-[#A88820] transition-all shadow-sm"
              >
                Digital Gold
              </button> */}

              {/* Wishlist */}
              <button
                onClick={() => {
                    if (!TokenManager.getInstance().isLoggedIn()) {
                    navigate("/login");
                  } else {
                    navigate("/physical-gold/wishlist");
                  }
                }}
                className="hidden md:block p-2 cursor-pointer transition-colors relative text-foreground hover:text-primary"
                aria-label="Wishlist"
                title="Wishlist"
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
                  onClick={() => {
                    if (!TokenManager.getInstance().isLoggedIn()) {
                      navigate("/login");
                    } else {
                      navigate("/physical-gold/profile");
                    }
                  }}
                  className="p-2 transition-colors cursor-pointer text-foreground hover:text-primary"
                  aria-label="Account"
                  title="Account"
                >
                  <User size={20} />
                </button>
              </div>

              {/* Cart */}
              <button
                onClick={() => {
                  if (!TokenManager.getInstance().isLoggedIn()) {
                    navigate("/login");
                  } else {
                    navigate("/physical-gold/cart");
                  }
                }}
                className="p-2 transition-colors cursor-pointer relative text-foreground hover:text-primary"
                aria-label="Cart"
                title="Cart"
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
          <div className="container mx-auto px-8">
            <div className="flex items-center justify-center gap-8 py-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryClick?.(cat.id)}
                  className={`text-[13px] font-sans cursor-pointer tracking-wide uppercase relative pb-1 transition-all duration-300
                    ${
                      selectedCategoryId === cat.id
                        ? "text-primary font-semibold"
                        : "text-foreground hover:text-primary"
                    }`}
                >
                  {cat.name}
                  <span
                    className={`absolute bottom-0 left-0 h-[3px] bg-primary rounded-t transition-all duration-300 
                      ${selectedCategoryId === cat.id ? "w-full" : "w-0"}
                    `}
                  />
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute inset-x-0 top-full shadow-lg z-50 bg-background border-b border-gray-200 max-h-[70vh] overflow-y-auto">
          <nav className="flex flex-col p-4 gap-1">
            {/* <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate("/buy-gold");
              }}
              className="py-3 px-4 text-sm font-sans rounded-md transition-colors uppercase tracking-wide text-left text-foreground hover:text-primary hover:bg-secondary"
            >
              Digital Gold
            </button> */}

            {categories.length > 0 && (
              <div className="flex flex-col">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center justify-between py-3 px-4 text-sm font-sans rounded-md transition-colors uppercase tracking-wide text-left text-foreground hover:text-primary hover:bg-secondary"
                >
                  Jewellery Categories
                  {isCategoriesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isCategoriesOpen && (
                  <div className="flex flex-col pl-4 border-l-2 border-gray-100 ml-4 mt-1 space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsCategoriesOpen(false);
                          onCategoryClick?.(cat.id);
                        }}
                        className="py-2 px-4 text-sm font-sans rounded-md transition-colors uppercase tracking-wide text-left text-foreground hover:text-primary hover:bg-secondary"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
