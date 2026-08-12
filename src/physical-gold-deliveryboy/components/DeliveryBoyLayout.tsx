import React, { useEffect, useRef, useState } from "react";
import { DeliveryDialog } from "./DeliveryFeedback";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Truck,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  deliveryBoyLogout,
  getDeliveryBoySession,
} from "../services/deliveryBoyService";

const DeliveryBoyLayout: React.FC = () => {
  const navigate = useNavigate();
  const session = getDeliveryBoySession();
  const avatarInitial = session?.email?.trim().charAt(0).toUpperCase() || "D";
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const menu = [
    {
      label: "Dashboard",
      path: "/delivery-boy/dashboard",
      icon: LayoutDashboard,
    },
    { label: "Deliveries", path: "/delivery-boy/deliveries", icon: Package },
  ];
  const logout = () => {
    deliveryBoyLogout();
    navigate("/delivery-boy/login", { replace: true });
  };

  useEffect(() => {
    const closeProfile = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setProfileOpen(false);
    document.addEventListener("mousedown", closeProfile);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeProfile);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-800">
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#EEE5CE] px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F8E38A] text-[#5C430B]">
              <Truck size={19} />
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-[#74570F]">
                OxyGold
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#B38B22]">
                Delivery Portal
              </p>
            </div>
          </div>
          <button
            className="text-slate-400 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={19} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-[#FBF7EC] text-[#8B6914] ring-1 ring-[#E8D8A8]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={() => setShowLogout(true)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-bold">Delivery Portal</p>
          </div>
          <div ref={profileRef} className="relative ml-auto">
            <button type="button" aria-label="Open profile" aria-expanded={profileOpen} onClick={() => setProfileOpen(value => !value)} className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#A8791F] to-[#D4AF37] text-sm font-bold text-white shadow-sm ring-2 ring-white transition ${profileOpen ? 'outline outline-2 outline-offset-1 outline-[#CBAA4B]' : 'hover:brightness-95'}`}>{avatarInitial}</button>
            {profileOpen && <div className="absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
              <div className="flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#A8791F] to-[#D4AF37] text-sm font-bold text-white">{avatarInitial}</div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Partner</p><p className="mt-1 break-all text-sm font-semibold text-slate-800">{session?.email || 'Email unavailable'}</p></div></div>
            </div>}
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-slate-200 bg-white/95 px-3 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,.08)] backdrop-blur lg:hidden">
        {menu.map(item => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${isActive ? 'bg-[#FBF7EC] text-[#8B6914]' : 'text-slate-500'}`}><Icon size={18}/>{item.label}</NavLink>; })}
      </nav>
      <DeliveryDialog open={showLogout} title="Sign out?" description="You will need to sign in again to view deliveries." confirmLabel="Sign out" cancelLabel="Cancel" destructive onConfirm={logout} onCancel={() => setShowLogout(false)} />
    </div>
  );
};

export default DeliveryBoyLayout;
