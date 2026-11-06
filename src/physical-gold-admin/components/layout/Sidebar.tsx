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
  Tag,
  PackageCheck,
  X,
  Zap,
} from "lucide-react";
import { logout } from "../../services/adminService";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const [isLogout, setIsLogout] = useState(false);

  const menuItems: MenuItem[] = [
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
    {
      title: "New Orders",
      icon: <ShoppingBag size={18} />,
      path: "/admin/orders",
    },
    {
      title: "Active Orders",
      icon: <Zap size={18} />,
      path: "/admin/active-orders",
    },
    {
      title: "Assigned Orders",
      icon: <Truck size={18} />,
      path: "/admin/assigned-orders",
    },
    {
      title: "All Orders",
      icon: <PackageCheck size={18} />,
      path: "/admin/all-orders",
    },
    {
      title: "Coupons Management",
      icon: <Tag size={18} />,
      path: "/admin/coupons",
    },
    {
      title: "All User Queries",
      icon: <HelpCircle size={18} />,
      path: "/admin/helpdesk",
    },
    {
      title: "Delivery Boy List",
      icon: <Bike size={18} />,
      path: "/admin/delivery",
    },
    {
      title: "Registered Users",
      icon: <User size={18} />,
      path: "/admin/users",
    },
    {
      title: "Delivery Pricing",
      icon: <Truck size={18} />,
      path: "/admin/delivery-pricing",
    },
    {
      title: "Reviews & Ratings",
      icon: <MessageSquareText size={18} />,
      path: "/admin/reviews",
    },
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200/80 bg-white shadow-xl transition-transform duration-300 lg:z-40 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5E00] via-[#D4AF37] to-[#F8E38A] shadow-md shadow-[#D4AF37]/25">
              <span className="text-sm font-black tracking-wider text-white">
                OG
              </span>
            </div>

            {/* Title */}
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-[#8B5E00] via-[#D4AF37] to-[#F8E38A] bg-clip-text text-[17px] font-extrabold tracking-wide text-transparent">
                OXYGOLD
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B6B1F]">
                Admin Panel
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-3.5 scrollbar-thin">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all ${
                      isActive
                        ? "bg-[#FBF7EC] font-bold text-[#8B6914] shadow-2xs"
                        : "font-semibold text-slate-600 hover:bg-slate-50/90 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-[#8B6914]"
                            : "text-slate-400 group-hover:text-[#B38B22]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.title}
                      </span>
                      <ChevronRight
                        className={`shrink-0 transition-all ${
                          isActive
                            ? "text-[#8B6914] opacity-80"
                            : "text-slate-300 opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5"
                        }`}
                        size={14}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-rose-600 transition-all hover:bg-rose-50"
            onClick={() => setIsLogout(true)}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <div className="mt-3 text-center text-[10px] font-medium text-slate-400">
            OxyGold Admin • v1.0.0
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
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
        <p className="text-sm font-normal text-slate-600">
          Are you sure you want to log out of your session?
        </p>
      </Modal>
    </>
  );
};

export default Sidebar;
