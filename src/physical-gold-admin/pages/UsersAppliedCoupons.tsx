import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Ticket,
  Users,
  ShoppingBag,
  Clock,
  Search,
  UserCheck,
  TrendingUp,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import Table from "../components/ui/Table";
import Toast from "../../PhysicalGold/components/Toast";
import * as adminService from "../services/adminService";
import { CouponUsersData, CouponUser } from "../services/adminService";

const UsersAppliedCoupons: React.FC = () => {
  const { couponId } = useParams<{ couponId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CouponUsersData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  const loadData = async () => {
    if (!couponId) return;
    setIsLoading(true);
    try {
      const res = await adminService.fetchCouponUsers(couponId);
      setData(res);
    } catch (error: any) {
      console.error("Failed to load coupon users:", error);
      setToast({ message: error.message || "Failed to load coupon users data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [couponId]);

  const rawUsers = data?.users || [];

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return rawUsers;
    return rawUsers.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.phoneNumber && u.phoneNumber.includes(q)) ||
        (u.orderId && u.orderId.toString().includes(q)) ||
        (u.userId && u.userId.toString().includes(q))
    );
  }, [rawUsers, searchQuery]);

  const columns = [
    {
      header: "User ID",
      key: "userId",
      width: "85px",
      render: (id: number) => <span className="font-mono text-xs font-semibold text-slate-500">#{id}</span>,
    },
    {
      header: "Customer Name",
      key: "name",
      render: (name: string, item: CouponUser) => {
        const initials = name
          ? name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "U";
        return (
          <div className="flex items-center gap-2.5 min-w-0 py-0.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 text-amber-900 font-extrabold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-slate-900 leading-snug truncate">{name || "Unnamed Customer"}</p>
              {item.phoneNumber && (
                <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <PhoneCall size={10} className="text-slate-400" />
                  {item.phoneNumber}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Phone Number",
      key: "phoneNumber",
      width: "140px",
      render: (phone: string) => (
        <span className="text-xs font-mono font-medium text-slate-700">{phone || "-"}</span>
      ),
    },
    {
      header: "Order Reference",
      key: "orderId",
      width: "140px",
      render: (orderId: number) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
          <ShoppingBag size={12} className="text-amber-600 shrink-0" />
          Order #{orderId}
        </span>
      ),
    },
    {
      header: "Discount Saved",
      key: "discountAmount",
      width: "130px",
      render: (amount: number) => (
        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-block">
          ₹{amount?.toLocaleString("en-IN") || 0}
        </span>
      ),
    },
    {
      header: "Applied Date & Time",
      key: "usedAt",
      width: "180px",
      render: (dateStr: string) => {
        if (!dateStr) return <span className="text-xs text-slate-400">-</span>;
        const d = new Date(dateStr);
        return (
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400 shrink-0" />
            <span>
              {d.toLocaleDateString("en-IN")} {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Clean Standard Header matching existing admin pages */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col w-full sm:w-auto min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/coupons")}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 mr-1 shrink-0"
              title="Back to Coupons"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
              <Users className="text-emerald-600" size={20} />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight truncate flex items-center gap-2">
              Applied Coupon Users:{" "}
              <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-sm">
                {data?.couponCode || `ID #${couponId}`}
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Coupon Code</p>
          <p className="text-lg font-black text-amber-950 font-mono tracking-wide">
            {data?.couponCode || "-"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Limit</p>
          <p className="text-xl font-bold text-slate-800">
            {data?.usageLimit ? data.usageLimit : "Unlimited (0)"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Times Used</p>
          <p className="text-xl font-black text-emerald-600">
            {data?.usedCount || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Remaining Capacity</p>
          <p className="text-xl font-black text-amber-700">
            {data?.remainingCount !== undefined ? data.remainingCount : "-"}
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customer name, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium self-center">
          Showing <span className="font-bold text-slate-800">{filteredUsers.length}</span> customer redemption records
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        emptyMessage="No customer redemptions recorded for this coupon code yet."
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UsersAppliedCoupons;
