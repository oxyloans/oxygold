import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag,
  Plus,
  Edit2,
  Users,
  Search,
  Calendar,
  Percent,
  Layers,
  CheckCircle2,
  XCircle,
  Sparkles,
  Ticket,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Switch from "../components/ui/Switch";
import Select from "../components/ui/Select";
import Toast from "../../PhysicalGold/components/Toast";
import * as adminService from "../services/adminService";
import { CouponData, CouponPayload } from "../services/adminService";

const formatDateTimeForInput = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    let parseableStr = dateStr;
    if (
      dateStr.includes("T") &&
      !dateStr.endsWith("Z") &&
      !dateStr.includes("+") &&
      !dateStr.slice(10).includes("-")
    ) {
      parseableStr = dateStr + "Z";
    }
    const d = new Date(parseableStr);
    if (isNaN(d.getTime())) {
      const sliced = dateStr.slice(0, 19);
      return sliced.length === 16 ? sliced + ":00" : sliced;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  } catch {
    return dateStr;
  }
};

const formatDateTimeForPayload = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {}
  return dateStr || "";
};

const formatDateTimeIST = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    // Ensure server ISO strings without timezone offsets are parsed as UTC and converted to IST
    let parseableStr = dateStr;
    if (
      dateStr.includes("T") &&
      !dateStr.endsWith("Z") &&
      !dateStr.includes("+") &&
      !dateStr.slice(10).includes("-")
    ) {
      parseableStr = dateStr + "Z";
    }
    const d = new Date(parseableStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const Coupons: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    code: "",
    name: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minimumOrderAmount: "",
    maximumDiscountAmount: "",
    applyTo: "ALL",
    categoryId: 0,
    startDateTime: "",
    endDateTime: "",
    usageLimit: "",
    usageLimitPerUser: "",
    active: true,
  });

  // Confirm Status Toggle State
  const [confirmToggle, setConfirmToggle] = useState<{ open: boolean; coupon: CouponData | null }>({
    open: false,
    coupon: null,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.fetchCoupons();
      setCoupons(data);
    } catch (error: any) {
      console.error("Failed to load coupons:", error);
      setToast({ message: error.message || "Failed to load coupons", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const res = await adminService.fetchMainCategories("ACTIVE");
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      // Clean and filter active categories
      const activeList = list.filter((c: any) => c && c.id && c.name);
      setCategories(activeList);
    } catch (error) {
      console.error("Failed to load active categories:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    const nowStr = formatDateTimeForInput(new Date().toISOString());
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minimumOrderAmount: "",
      maximumDiscountAmount: "",
      applyTo: "ALL",
      categoryId: 0,
      startDateTime: nowStr,
      endDateTime: "",
      usageLimit: "",
      usageLimitPerUser: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: CouponData) => {
    setIsEditing(true);
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: coupon.discountValue !== undefined && coupon.discountValue !== null ? coupon.discountValue : "",
      minimumOrderAmount: coupon.minimumOrderAmount !== undefined && coupon.minimumOrderAmount !== null ? coupon.minimumOrderAmount : "",
      maximumDiscountAmount: coupon.maximumDiscountAmount !== undefined && coupon.maximumDiscountAmount !== null ? coupon.maximumDiscountAmount : "",
      applyTo: coupon.applyTo || "ALL",
      categoryId: coupon.categoryId ?? 0,
      startDateTime: formatDateTimeForInput(coupon.startDateTime),
      endDateTime: formatDateTimeForInput(coupon.endDateTime),
      usageLimit: coupon.usageLimit !== undefined && coupon.usageLimit !== null ? coupon.usageLimit : "",
      usageLimitPerUser: coupon.usageLimitPerUser !== undefined && coupon.usageLimitPerUser !== null ? coupon.usageLimitPerUser : 1,
      active: coupon.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = (formData.code || "").trim().toUpperCase();
    if (!code) {
      setToast({ message: "Please enter a valid coupon code.", type: "warning" });
      return;
    }

    const name = (formData.name || "").trim();
    if (!name) {
      setToast({ message: "Please enter a valid coupon name.", type: "warning" });
      return;
    }

    if (formData.discountValue === "" || formData.discountValue === undefined || formData.discountValue === null) {
      setToast({ message: "Please enter a discount value.", type: "warning" });
      return;
    }

    const discountVal = Number(formData.discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      setToast({ message: "Discount value must be greater than 0.", type: "warning" });
      return;
    }

    if (formData.discountType === "PERCENTAGE" && discountVal > 100) {
      setToast({ message: "Percentage discount cannot exceed 100%.", type: "warning" });
      return;
    }

    const applyTo = formData.applyTo || "ALL";
    const categoryId = applyTo === "CATEGORY" ? Number(formData.categoryId || 0) : 0;
    if (applyTo === "CATEGORY" && (!categoryId || categoryId === 0)) {
      setToast({ message: "Please select an active category for this coupon.", type: "warning" });
      return;
    }

    let startTime: number | null = null;
    let endTime: number | null = null;

    if (formData.startDateTime) {
      startTime = new Date(formData.startDateTime).getTime();
      if (isNaN(startTime)) {
        setToast({ message: "Please select a valid start date and time.", type: "warning" });
        return;
      }
    }

    if (formData.endDateTime) {
      endTime = new Date(formData.endDateTime).getTime();
      if (isNaN(endTime)) {
        setToast({ message: "Please select a valid end date and time.", type: "warning" });
        return;
      }
    }

    if (startTime !== null && endTime !== null && endTime <= startTime) {
      setToast({ message: "End Date & Time must be after Start Date & Time.", type: "warning" });
      return;
    }

    const minOrder = Number(formData.minimumOrderAmount || 0);
    if (minOrder < 0) {
      setToast({ message: "Minimum order amount cannot be negative.", type: "warning" });
      return;
    }

    const maxCap = Number(formData.maximumDiscountAmount || 0);
    if (maxCap < 0) {
      setToast({ message: "Maximum discount cap cannot be negative.", type: "warning" });
      return;
    }

    const usageLim = Number(formData.usageLimit || 0);
    if (usageLim < 0) {
      setToast({ message: "Total usage limit cannot be negative.", type: "warning" });
      return;
    }

    const userLim = Number(formData.usageLimitPerUser || 1);
    if (userLim < 1) {
      setToast({ message: "Usage limit per user must be at least 1.", type: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CouponPayload = {
        code,
        name,
        description: (formData.description || "").trim(),
        discountType: formData.discountType || "PERCENTAGE",
        discountValue: discountVal,
        minimumOrderAmount: minOrder,
        maximumDiscountAmount: maxCap,
        applyTo,
        categoryId,
        startDateTime: formatDateTimeForPayload(formData.startDateTime),
        endDateTime: formatDateTimeForPayload(formData.endDateTime),
        usageLimit: usageLim,
        usageLimitPerUser: userLim,
        active: formData.active ?? true,
      };

      if (isEditing && editingId) {
        await adminService.updateCoupon(editingId, payload);
        setToast({ message: "Coupon updated successfully!", type: "success" });
      } else {
        await adminService.createCoupon(payload);
        setToast({ message: "New coupon created successfully!", type: "success" });
      }

      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      setToast({ message: error.message || "Action failed. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (coupon: CouponData) => {
    try {
      const newActive = !coupon.active;
      await adminService.updateCouponStatus(coupon.id, newActive);
      setToast({
        message: `Coupon '${coupon.code}' is now ${newActive ? "Active" : "Inactive"}.`,
        type: "success",
      });
      loadData();
    } catch (error: any) {
      setToast({ message: error.message || "Failed to update status", type: "error" });
    }
  };

  // Stats summary calculations
  const stats = useMemo(() => {
    const total = coupons.length;
    const activeCount = coupons.filter((c) => c.active).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const categoryCoupons = coupons.filter((c) => c.applyTo === "CATEGORY").length;
    return { total, activeCount, totalRedemptions, categoryCoupons };
  }, [coupons]);

  const categoryOptions = useMemo(() => {
    const opts = categories.map((c) => ({
      label: `${c.name}`,
      value: String(c.id),
    }));
    return [{ label: "-- Select Active Category --", value: "0" }, ...opts];
  }, [categories]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.categoryName && c.categoryName.toLowerCase().includes(q));
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? c.active
          : !c.active;
      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchQuery, statusFilter]);

  const columns = [
    {
      header: "ID",
      key: "id",
      width: "60px",
      render: (id: number) => <span className="font-mono text-xs font-semibold text-slate-500">#{id}</span>,
    },
    {
      header: "Coupon Code",
      key: "code",
      width: "140px",
      render: (code: string) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/90 text-xs font-bold font-mono uppercase tracking-wide shadow-2xs">
          <Ticket size={12} className="text-amber-600 shrink-0" />
          {code}
        </span>
      ),
    },
    {
      header: "Discount",
      key: "discountValue",
      width: "120px",
      render: (_: any, item: CouponData) => {
        const valStr =
          item.discountType === "FIXED"
            ? `₹${item.discountValue?.toLocaleString("en-IN")}`
            : `${item.discountValue}% OFF`;
        return (
          <div className="text-xs">
            <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
              {valStr}
            </span>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mt-0.5">
              {item.discountType || "PERCENTAGE"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Min Order & Cap",
      key: "minimumOrderAmount",
      width: "140px",
      render: (_: any, item: CouponData) => (
        <div className="text-[11px] space-y-0.5 text-slate-600">
          <p className="flex items-center gap-1">
            <span className="text-slate-400">Min:</span>
            <span className="font-bold text-slate-800">
              {item.minimumOrderAmount > 0 ? `₹${item.minimumOrderAmount.toLocaleString("en-IN")}` : "No Min"}
            </span>
          </p>
          <p className="flex items-center gap-1">
            <span className="text-slate-400">Cap:</span>
            <span className="font-semibold text-slate-700">
              {item.maximumDiscountAmount > 0 ? `₹${item.maximumDiscountAmount.toLocaleString("en-IN")}` : "Unlimited"}
            </span>
          </p>
        </div>
      ),
    },
    {
      header: "Scope / Category",
      key: "applyTo",
      width: "130px",
      render: (val: string, item: CouponData) => {
        if (val === "CATEGORY") {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-900 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
              <Layers size={11} className="text-purple-600" />
              {item.categoryName || `Cat #${item.categoryId}`}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
            {val || "ALL"}
          </span>
        );
      },
    },
    {
      header: "Usage & Limits",
      key: "usedCount",
      width: "140px",
      render: (_: any, item: CouponData) => {
        const limitStr = item.usageLimit > 0 ? item.usageLimit : "∞";
        const isFull = item.usageLimit > 0 && (item.usedCount || 0) >= item.usageLimit;
        return (
          <div className="text-[11px] space-y-1 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-normal">Used:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${
                  isFull
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-slate-100 text-slate-800 border border-slate-200"
                }`}
              >
                {item.usedCount || 0} / {limitStr}
              </span>
            </div>
            <p className="text-slate-600">
              <span className="text-slate-400 font-normal">Per User:</span>{" "}
              <span className="font-semibold text-slate-800">{item.usageLimitPerUser ?? 1}</span>
            </p>
          </div>
        );
      },
    },
    {
      header: "Validity Period ",
      key: "startDateTime",
      width: "210px",
      render: (_: any, item: CouponData) => {
        const start = formatDateTimeIST(item.startDateTime);
        const end = formatDateTimeIST(item.endDateTime);
        const isExpired = item.endDateTime && new Date(item.endDateTime).getTime() < new Date().getTime();
        return (
          <div className="text-[11px] text-slate-600 space-y-1 py-0.5">
            <div className="flex items-start gap-1.5">
              
              <div className="space-y-0.5">
                <p className="font-medium text-slate-800"><span className="text-slate-400 font-normal">From:</span> {start}</p>
                <p className="font-medium text-slate-800"><span className="text-slate-400 font-normal">To:</span> {end}</p>
              </div>
            </div>
           
          </div>
        );
      },
    },
    {
      header: "Created / Updated",
      key: "createdAt",
      width: "210px",
      render: (_: any, item: CouponData) => {
        const created = formatDateTimeIST(item.createdAt);
        const updated = formatDateTimeIST(item.updatedAt);
        return (
          <div className="text-[11px] text-slate-600 space-y-0.5 py-0.5">
            <p><span className="text-slate-400 font-normal">Created:</span> <span className="font-medium text-slate-800">{created}</span></p>
            {item.updatedAt && (
              <p><span className="text-slate-400 font-normal">Updated:</span> <span className="font-medium text-slate-700">{updated}</span></p>
            )}
          </div>
        );
      },
    },
    {
      header: "Active",
      key: "active",
      width: "80px",
      align: "center" as const,
      render: (val: boolean, item: CouponData) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={Boolean(val)}
            onChange={() => setConfirmToggle({ open: true, coupon: item })}
          />
        </div>
      ),
    },
    {
      header: "Actions",
      key: "id",
      width: "110px",
      align: "center" as const,
      render: (_: any, item: CouponData) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-emerald-700 transition-all border border-transparent hover:border-slate-200"
            title="Edit Coupon"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/coupons/${item.id}/users`);
            }}
            className="p-1.5 hover:bg-amber-50 rounded-lg text-slate-500 hover:text-amber-800 transition-all border border-transparent hover:border-amber-200 flex items-center gap-1"
            title="View Applied Users"
          >
            <Users size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Clean Standard Header matching existing admin pages */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col w-full sm:w-auto min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
              <Tag className="text-emerald-600" size={20} />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight truncate">
              Coupons Management
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button onClick={openCreateModal} className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <Plus size={16} />
            <span className="whitespace-nowrap">Create Coupon</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Coupons</p>
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
            <Tag size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Offers</p>
            <p className="text-2xl font-black text-emerald-600">{stats.activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Redemptions</p>
            <p className="text-2xl font-black text-purple-700">{stats.totalRedemptions}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category Offers</p>
            <p className="text-2xl font-black text-blue-700">{stats.categoryCoupons}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700">
            <Layers size={18} />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search code, offer name, or category..."
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

        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto justify-center shrink-0">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-white text-amber-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table Component */}
      <Table
        columns={columns}
        data={filteredCoupons}
        isLoading={isLoading}
        emptyMessage="No promotional coupons match your search or filter."
      />

      {/* Create / Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Coupon: ${formData.code || ""}` : "Create New Coupon"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Row 1: Code, Name, Discount Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Input
              label="Coupon Code *"
              placeholder="e.g. GOLD10"
              value={formData.code || ""}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
            <Input
              label="Coupon Name *"
              placeholder="e.g. Festive Gold Discount"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Discount Type"
              options={[
                { label: "Percentage (%)", value: "PERCENTAGE" },
                { label: "Fixed Amount (₹)", value: "FIXED" },
              ]}
              value={formData.discountType || "PERCENTAGE"}
              onChange={(val) => setFormData({ ...formData, discountType: val as string })}
            />
          </div>

          {/* Row 2: Discount Value, Min Order, Max Cap */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Input
              label={`Discount Value (${formData.discountType === "FIXED" ? "₹" : "%"}) *`}
              type="number"
              min="0.01"
              step="0.01"
              placeholder={formData.discountType === "FIXED" ? "e.g. 500" : "e.g. 10"}
              value={formData.discountValue ?? ""}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
            />
            <Input
              label="Minimum Order Amount (₹)"
              type="number"
              min="0"
              placeholder="e.g. 1000 (0 for no minimum)"
              value={formData.minimumOrderAmount ?? ""}
              onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
            />
            <Input
              label="Maximum Discount Cap (₹)"
              type="number"
              min="0"
              placeholder="e.g. 500 (0 for no cap)"
              value={formData.maximumDiscountAmount ?? ""}
              onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: e.target.value })}
            />
          </div>

          {/* Row 3: Apply Scope, Select Category (if CATEGORY), Active Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Select
              label="Apply Scope"
              options={[
                { label: "All Products (Store-wide)", value: "ALL" },
                { label: "Specific Category Only", value: "CATEGORY" },
              ]}
              value={formData.applyTo || "ALL"}
              onChange={(val) => {
                const newApplyTo = val as "ALL" | "CATEGORY";
                setFormData({
                  ...formData,
                  applyTo: newApplyTo,
                  categoryId: newApplyTo === "CATEGORY" ? Number(formData.categoryId || 0) : 0,
                });
              }}
            />

            {formData.applyTo === "CATEGORY" ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Select Active Category *</label>
                  {isCategoriesLoading && (
                    <span className="text-[10px] text-amber-700 font-bold animate-pulse">Loading...</span>
                  )}
                </div>
                {categories.length > 0 ? (
                  <Select
                    options={categoryOptions}
                    value={String(formData.categoryId || "0")}
                    onChange={(val) => setFormData({ ...formData, categoryId: Number(val) })}
                  />
                ) : (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                    No active categories found.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Target Category</label>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 font-medium h-[38px] flex items-center">
                  Store-wide (All Categories)
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Coupon Status</label>
              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 h-[38px]">
                <span className="text-xs font-bold text-slate-700">
                  {formData.active ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={Boolean(formData.active)}
                  onChange={() => setFormData({ ...formData, active: !formData.active })}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Start DateTime, End DateTime, Total Usage Limit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              step="1"
              value={formData.startDateTime || ""}
              onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              step="1"
              value={formData.endDateTime || ""}
              onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
            />
            <Input
              label="Total Usage Limit"
              type="number"
              min="0"
              placeholder="e.g. 100 (0 for unlimited)"
              value={formData.usageLimit ?? ""}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            />
          </div>

          {/* Row 5: Usage Limit Per User & Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Input
              label="Usage Limit Per User"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={formData.usageLimitPerUser ?? ""}
              onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                placeholder="Brief description of the coupon offer terms..."
                rows={2}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Status Toggle Modal */}
      <Modal
        isOpen={confirmToggle.open}
        onClose={() => setConfirmToggle({ open: false, coupon: null })}
        title="Confirm Status Change"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmToggle({ open: false, coupon: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmToggle.coupon) handleStatusToggle(confirmToggle.coupon);
                setConfirmToggle({ open: false, coupon: null });
              }}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to {confirmToggle.coupon?.active ? "deactivate" : "activate"} coupon{" "}
          <strong className="text-amber-900 font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            {confirmToggle.coupon?.code}
          </strong>?
        </p>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Coupons;
