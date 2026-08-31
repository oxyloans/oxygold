import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import {
  LogOut,
  ChevronRight,
  User,
  ShoppingBag,
  UploadCloud,
  LayoutDashboard,
  HelpCircle,
  Bike,
  Truck,
  MessageSquareText,
  X,
} from "lucide-react";
import { logout } from "../../services/adminService";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const [isLogout, setIsLogout] = useState(false);

  const menuItems = [
    {
      title: "Dashboard Overview",
      icon: <LayoutDashboard size={18} />,
      path: "/admin/dashboard",
    },
    {
      title: "Catalog Upload",
      icon: <UploadCloud size={18} />,
      path: "/admin/catalog-upload",
    },
    { title: "Registered Users", icon: <User size={18} />, path: "/admin/users" },
    { title: "Orders Management", icon: <ShoppingBag size={18} />, path: "/admin/orders" },
    { title: "Delivery Boy List", icon: <Bike size={18} />, path: "/admin/delivery" },
    { title: "Delivery Pricing", icon: <Truck size={18} />, path: "/admin/delivery-pricing" },
    { title: "Reviews & Ratings", icon: <MessageSquareText size={18} />, path: "/admin/reviews" },
    { title: "All User Queries", icon: <HelpCircle size={18} />, path: "/admin/helpdesk" },
  ];

  const handleLogoutVerify = async () => {
    const response = await logout();
    if (response.success) {
      localStorage.removeItem("admin");
      window.location.href = "/admin/login";
      setIsLogout(false);
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:z-40 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between  p-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5E00] via-[#D4AF37] to-[#F8E38A] shadow-md shadow-[#D4AF37]/30">
              <span className="text-sm font-black tracking-wide text-white">
                OG
              </span>
            </div>

            {/* Title */}
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-[#8B5E00] via-[#D4AF37] to-[#F8E38A] bg-clip-text text-[17px] font-extrabold tracking-wide text-transparent">
                OXYGOLD
              </span>

              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8B6B1F]">
                Admin Panel
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all ${
                      isActive
                        ? "bg-[#FBF7EC] font-bold text-[#8B6914] ring-1 ring-[#E8D8A8]"
                        : "font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <span className="shrink-0 transition-colors group-hover:text-[#B38B22]">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <ChevronRight
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-40"
                    size={14}
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-red-500 transition-all hover:bg-red-50"
            onClick={() => setIsLogout(true)}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <div className="mt-3 text-center text-[10px] font-medium text-slate-300">
            Version 1.0.0
          </div>
        </div>
      </aside>

      <Modal
        isOpen={isLogout}
        onClose={() => setIsLogout(false)}
        title="Confirm Logout"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsLogout(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleLogoutVerify}>
              Logout
            </Button>
          </div>
        }
      >
        <p className="text-sm font-normal">Are you sure you want to Logout?</p>
      </Modal>
    </>
  );
};

export default Sidebar;
