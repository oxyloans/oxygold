import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronRight,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { clearPartnerAdminData } from "../services/partnerAdminService";
import oxygoldLogo from "../../assets/oxygoldlogo-bk.png";

export const PartnerAdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const activeCat = searchParams.get("cat");
  const activeStock = searchParams.get("stock");

  const handleConfirmLogout = () => {
    clearPartnerAdminData();
    setShowLogoutConfirm(false);
    navigate("/partner-admin/login");
  };

  const menuItems = [
    {
      title: "Products & Stock Inventory",
      icon: <Package size={18} />,
      path: "/partner-admin/products",
      isActive: location.pathname === "/partner-admin/products" && (!activeCat || activeCat === "ALL") && (!activeStock || activeStock === "ALL"),
    },
    {
      title: "Low Stock Alerts",
      icon: <AlertTriangle size={18} />,
      path: "/partner-admin/products?stock=LOW_STOCK",
      isActive: activeStock === "LOW_STOCK",
    },
    {
      title: "Gold Catalog",
      icon: <Sparkles size={18} />,
      path: "/partner-admin/products?cat=Gold",
      isActive: activeCat === "Gold",
    },
    {
      title: "Silver Catalog",
      icon: <Layers size={18} />,
      path: "/partner-admin/products?cat=Silver",
      isActive: activeCat === "Silver",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] font-sans flex">
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* FIXED LEFT SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:z-40 lg:translate-x-0 lg:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* LOGO IMAGE HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <Link to="/partner-admin/products" className="flex items-center">
            <img
              src={oxygoldLogo}
              alt="OXYGOLD Logo"
              className="h-12 w-44 object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all ${
                    item.isActive
                      ? "bg-[#FBF7EC] font-bold text-[#8B6914] ring-1 ring-[#E8D8A8]"
                      : "font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={`shrink-0 transition-colors ${item.isActive ? "text-[#8B6914]" : "text-slate-400 group-hover:text-[#B38B22]"}`}>
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <ChevronRight
                    className={`shrink-0 transition-opacity ${item.isActive ? "opacity-100 text-[#8B6914]" : "opacity-0 group-hover:opacity-40"}`}
                    size={14}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* LOGOUT & VERSION */}
        <div className="border-t border-slate-100 p-4 space-y-2">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-rose-600 transition-all hover:bg-rose-50"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          
          <div className="text-center text-[10px] font-medium text-slate-400">
            Version 1.0.0 (Partner Portal)
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* MOBILE TOP BAR */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <Link to="/partner-admin/products" className="flex items-center">
              <img
                src={oxygoldLogo}
                alt="OXYGOLD Logo"
                className="h-10 w-36 object-contain"
              />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL DIALOG */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Confirm Logout</h3>
                <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to log out of Partner Portal?</p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-4.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerAdminLayout;


