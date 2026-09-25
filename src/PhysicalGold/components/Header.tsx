import React, { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import oxygoldLogo from "../../assets/oxygoldlogo.png";
import Toast from "./Toast";
import TokenManager from "../../utils/tokenManager";
import { logout } from "../physicalGoldService";
import "../styles.css";

const ALL_CATEGORY_ID = "__all__";

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = TokenManager.getInstance().isLoggedIn();

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const ud = JSON.parse(stored);
        if (ud.data?.accessToken) await logout(ud.data.accessToken);
      }
    } catch (e) { console.error("Logout failed:", e); }
    TokenManager.getInstance().clearTokens();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keep the promotional strip visible only at the top of the page.
  // Once the user starts scrolling, the header becomes more compact and
  // receives a subtle shadow so it stays visually separated from content.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${isScrolled ? "shadow-[0_8px_24px_rgba(17,24,39,0.10)]" : "shadow-none"
          }`}
      >
        {cartNotification && <Toast message={cartNotification.message} type={cartNotification.type} onClose={dismissCartNotification} />}
        {/* Top promotional banner: visible at page top, hidden after scrolling */}
        <div
          aria-hidden={isScrolled}
          className={`overflow-hidden bg-accent transition-[max-height,opacity,transform] duration-300 ease-out ${isScrolled
              ? "max-h-0 -translate-y-1 opacity-0"
              : "max-h-10 translate-y-0 border-b border-gray-200 opacity-100"
            }`}
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-2 text-center sm:px-5 md:px-6 lg:px-8">
            <p className="text-xs font-medium tracking-wide text-white">
              Free Shipping on Orders Above ₹50,000
            </p>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-white" style={{ borderBottom: "0.5px solid hsl(40, 20%, 88%)" }}>
          <div className="mx-auto h-14 w-full max-w-7xl ">
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

                {/* Profile Icon */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
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
                    if (!isLoggedIn) {
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

                {/* Logout */}
                {isLoggedIn && (
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="hidden md:flex p-2 transition-colors cursor-pointer text-foreground hover:text-rose-500"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Category Navigation */}
        {categories.length > 0 && (
          <nav
            className="hidden bg-white md:block"
            style={{
              borderBottom: "0.5px solid hsl(40, 20%, 90%)",
            }}
          >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 py-2.5">
                

                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => onCategoryClick?.(cat.id)}
                    className={`relative cursor-pointer pb-1 font-sans text-[13px] uppercase tracking-wide transition-all duration-300 ${selectedCategoryId === cat.id
                      ? "font-semibold text-primary"
                      : "text-[#27272A] hover:text-primary"
                      }`}
                  >
                    {cat.name}
                    <span
                      className={`absolute bottom-0 left-0 h-[3px] rounded-t bg-primary transition-all duration-300 ${selectedCategoryId === cat.id ? "w-full" : "w-0"
                        }`}
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
                    <div className="ml-4 mt-1 flex flex-col space-y-1 border-l-2 border-gray-100 pl-4">
                      {/* <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsCategoriesOpen(false);
                          onCategoryClick?.(ALL_CATEGORY_ID);
                        }}
                        className={`rounded-md px-4 py-2 text-left font-sans text-sm font-semibold uppercase tracking-wide transition-colors ${!selectedCategoryId || selectedCategoryId === ALL_CATEGORY_ID
                          ? "bg-secondary text-primary"
                          : "text-foreground hover:bg-secondary hover:text-primary"
                          }`}
                      >
                        All
                      </button> */}

                      {categories.map((cat) => (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsCategoriesOpen(false);
                            onCategoryClick?.(cat.id);
                          }}
                          className={`rounded-md px-4 py-2 text-left font-sans text-sm uppercase tracking-wide transition-colors ${selectedCategoryId === cat.id
                            ? "bg-secondary font-semibold text-primary"
                            : "text-foreground hover:bg-secondary hover:text-primary"
                            }`}
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

              {isLoggedIn && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setShowLogoutConfirm(true); }}
                  className="py-3 px-4 text-sm font-sans rounded-md transition-colors uppercase tracking-wide text-left text-rose-500 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <LogOut className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Sign Out</h3>
            </div>
            <p className="text-[13px] text-[#6B6B6B] mb-5 leading-relaxed">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#6B6B6B] hover:bg-[#F5F2EE] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-lg bg-rose-500 text-white text-[12px] font-medium hover:bg-rose-600 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
