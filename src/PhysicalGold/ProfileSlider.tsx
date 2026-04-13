import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Briefcase,
    CheckCircle2,
    History,
    Loader2,
    LogOut,
    MapPin,
    MapPinned,
    Pencil,
    Plus,
    Minus,
    Package,
    ChevronDown,
    ChevronUp,
    CreditCard,
    FileText,
    ShoppingBag,
    User,
    Wallet,
    Settings,
} from "lucide-react";
import {
    addAddress,
    fetchAddresses,
    fetchWalletBalance,
    fetchWalletTransactions,
    getUserProfile,
    logout,
    saveUserProfile,
    updateAddress,
    fetchUserOrders,
    getInvoicePreviewUrl,
} from "./physicalGoldService";
import { Order } from "./physicalGoldData";
import PhysicalGoldHeader from "./components/Header";

const DISPLAY_INR = (v: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(v);

/* ────────────────────────────────────────────────────────── */
/*  Types                                                     */
/* ────────────────────────────────────────────────────────── */
interface Address {
    id: string;
    type: "Home" | "Work" | "Other";
    flatNo: string;
    landMark: string;
    address: string;
    pinCode: string;
    state: string;
    longitude: string;
    latitude: string;
}

type Tab = "info" | "address" | "wallet" | "orders";

interface PageState {
    activeTab: Tab;
    isEditingProfile: boolean;
    isSavingProfile: boolean;
    isProfileLoading: boolean;
    profileForm: {
        firstName: string;
        lastName: string;
        email: string;
        alternativeNumber: string;
        whatsappNumber: string;
        mobileNumber: string;
    };
    addresses: Address[];
    isAddressLoading: boolean;
    isAddingAddress: boolean;
    editingAddress: Address | null;
    addrForm: {
        flatNo: string;
        landMark: string;
        address: string;
        pinCode: string;
        state: string;
        type: Address["type"];
        latitude: string;
        longitude: string;
        typeDropdownOpen: boolean;
    };
    addrErrors: Record<string, string>;
    isFetchingLocation: boolean;
    locationError: string;
    walletBalance: number;
    walletTransactions: any[];
    isWalletLoading: boolean;
    orders: Order[];
    isOrdersLoading: boolean;
    expandedOrderId: number | null;
}

/* ────────────────────────────────────────────────────────── */
/*  Helpers                                                   */
/* ────────────────────────────────────────────────────────── */
const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case "CONFIRMED": return "text-emerald-700 bg-emerald-50";
        case "PENDING": return "text-amber-700 bg-amber-50";
        case "CANCELLED": return "text-rose-700 bg-rose-50";
        default: return "text-zinc-600 bg-zinc-100";
    }
};

const GET_USER_DATA = () => {
    try {
        const s = localStorage.getItem("user");
        return s ? JSON.parse(s) : null;
    } catch { return null; }
};

/* ────────────────────────────────────────────────────────── */
/*  Shared input styles                                       */
/* ────────────────────────────────────────────────────────── */
const inputCls =
    "w-full border border-[#E8E0D5] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] bg-white placeholder-[#BEB5AA] outline-none focus:border-[#8B6914] focus:ring-2 focus:ring-[#8B6914]/10 transition";

const labelCls = "block text-[11px] font-semibold text-[#8A8A8A] mb-1";

/* ────────────────────────────────────────────────────────── */
/*  InfoRow — used for read-only profile fields               */
/* ────────────────────────────────────────────────────────── */
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex items-center border-b border-[#F0EBE1] py-3.5 last:border-b-0">
        <span className="w-36 text-[12px] text-[#8A8A8A] shrink-0">{label}</span>
        <span className="text-[13px] font-semibold text-[#1A1A1A]">{value || "—"}</span>
    </div>
);

/* ────────────────────────────────────────────────────────── */
/*  ProfilePage                                               */
/* ────────────────────────────────────────────────────────── */
const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get("tab") as Tab) || "info";

    const [user, setUser] = useState<any>(GET_USER_DATA());

    const [s, setS] = useState<PageState>({
        activeTab: initialTab,
        isEditingProfile: false,
        isSavingProfile: false,
        isProfileLoading: false,
        profileForm: {
            firstName: "",
            lastName: "",
            email: "",
            alternativeNumber: "",
            whatsappNumber: "",
            mobileNumber: "",
        },
        addresses: [],
        isAddressLoading: false,
        isAddingAddress: false,
        editingAddress: null,
        addrForm: {
            flatNo: "", landMark: "", address: "", pinCode: "",
            state: "", type: "Home", latitude: "", longitude: "",
            typeDropdownOpen: false,
        },
        addrErrors: {},
        isFetchingLocation: false,
        locationError: "",
        walletBalance: 0,
        walletTransactions: [],
        isWalletLoading: false,
        orders: [],
        isOrdersLoading: false,
        expandedOrderId: null,
    });

    const patch = useCallback(
        (partial: Partial<PageState>) => setS((prev) => ({ ...prev, ...partial })),
        []
    );

    const patchAddrForm = useCallback(
        (partial: Partial<PageState["addrForm"]>) =>
            setS((prev) => ({ ...prev, addrForm: { ...prev.addrForm, ...partial } })),
        []
    );

    const patchProfile = (partial: Partial<PageState["profileForm"]>) =>
        setS((prev) => ({ ...prev, profileForm: { ...prev.profileForm, ...partial } }));

    useEffect(() => {
        const tab = searchParams.get("tab") as Tab;
        if (tab && tab !== s.activeTab) {
            patch({ activeTab: tab, isAddingAddress: false, isEditingProfile: false });
        }
    }, [searchParams, patch, s.activeTab]);

    useEffect(() => {
        if (user) {
            const profile = user.data?.body || user;
            patch({
                profileForm: {
                    firstName: profile.firstName || "",
                    lastName: profile.lastName || "",
                    email: profile.email || "",
                    alternativeNumber: profile.alternativeNumber || "",
                    whatsappNumber: profile.whatsappNumber || "",
                    mobileNumber: profile.mobileNumber || profile.phone || profile.phoneNumber || "",
                },
            });
        }
    }, [user, patch]);

    /* ── fetch helpers ── */
    const fetchProfile = useCallback(async () => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId || userData?.userId;
        if (!uid) return;
        patch({ isProfileLoading: true });
        try {
            const res = await getUserProfile(uid);
            const profile = res.data?.body || res.data;
            if (res.success && profile) {
                patch({
                    profileForm: {
                        firstName: profile.firstName || "",
                        lastName: profile.lastName || "",
                        email: profile.email || "",
                        alternativeNumber: profile.alternativeNumber || "",
                        whatsappNumber: profile.whatsappNumber || "",
                        mobileNumber: profile.mobileNumber || "",
                    },
                });
                const freshUser = { ...userData, data: { ...userData.data, body: profile } };
                localStorage.setItem("user", JSON.stringify(freshUser));
                setUser(freshUser);
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        } finally {
            patch({ isProfileLoading: false });
        }
    }, [patch]);

    const loadAddresses = useCallback(async () => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId;
        if (!uid) return;
        patch({ isAddressLoading: true });
        try {
            const res = await fetchAddresses(uid);
            const mapped: Address[] = (res.data || res || []).map((a: any) => ({
                id: String(a.id),
                type: a.type || "Home",
                flatNo: a.flatNo || "",
                landMark: a.landMark || "",
                address: a.address || "",
                pinCode: a.pinCode || "",
                state: a.state || "",
                longitude: a.longitude || "",
                latitude: a.latitude || "",
            }));
            patch({ addresses: mapped });
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
        } finally {
            patch({ isAddressLoading: false });
        }
    }, [patch]);

    const fetchWalletInfo = useCallback(async () => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId;
        if (!uid) return;
        patch({ isWalletLoading: true });
        try {
            const [balRes, txRes] = await Promise.all([
                fetchWalletBalance(uid),
                fetchWalletTransactions(uid),
            ]);
            patch({
                walletBalance: balRes?.data?.balance || 0,
                walletTransactions: txRes?.data || [],
            });
        } catch (err) {
            console.error("Failed to fetch wallet:", err);
        } finally {
            patch({ isWalletLoading: false });
        }
    }, [patch]);

    const loadOrders = useCallback(async () => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId;
        if (!uid) return;
        patch({ isOrdersLoading: true });
        try {
            const data = await fetchUserOrders(uid);
            patch({ orders: data });
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            patch({ isOrdersLoading: false });
        }
    }, [patch]);

    useEffect(() => {
        if (s.activeTab === "info") fetchProfile();
        if (s.activeTab === "address") loadAddresses();
        if (s.activeTab === "wallet") fetchWalletInfo();
        if (s.activeTab === "orders") loadOrders();
    }, [s.activeTab, fetchProfile, loadAddresses, fetchWalletInfo, loadOrders]);

    /* ── actions ── */
    const handleLogout = async () => {
        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                const ud = JSON.parse(stored);
                if (ud.data?.accessToken) await logout(ud.data.accessToken);
            }
        } catch (e) { console.error("Logout failed:", e); }
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleSaveProfile = async () => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId || userData?.userId;
        if (!uid) return;
        const { profileForm } = s;
        patch({ isSavingProfile: true });
        try {
            await saveUserProfile({
                userId: uid,
                email: profileForm.email,
                alternativeNumber: profileForm.alternativeNumber,
                whatsappNumber: profileForm.whatsappNumber,
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
            });
            const updatedUser = JSON.parse(JSON.stringify(userData));
            const profile = updatedUser.data?.body || updatedUser;
            profile.firstName = profileForm.firstName;
            profile.lastName = profileForm.lastName;
            profile.email = profileForm.email;
            profile.alternativeNumber = profileForm.alternativeNumber;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            patch({ isEditingProfile: false });
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            patch({ isSavingProfile: false });
        }
    };

    const handleSaveAddr = async () => {
        const { addrForm, editingAddress } = s;
        const errors: Record<string, string> = {};
        if (!addrForm.flatNo.trim()) errors.flatNo = "Required";
        if (!addrForm.landMark.trim()) errors.landMark = "Required";
        if (!addrForm.address.trim()) errors.address = "Required";
        if (!addrForm.pinCode.trim()) errors.pinCode = "Required";
        if (!addrForm.state.trim()) errors.state = "Required";
        if (Object.keys(errors).length) { patch({ addrErrors: errors }); return; }

        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId;
        if (!uid) return;

        const payload = {
            id: editingAddress?.id,
            userId: uid,
            flatNo: addrForm.flatNo,
            address: addrForm.address,
            state: addrForm.state,
            pinCode: addrForm.pinCode,
            landMark: addrForm.landMark,
            longitude: addrForm.longitude || "",
            latitude: addrForm.latitude || "",
        };

        patch({ isAddressLoading: true });
        try {
            if (editingAddress) await updateAddress(payload);
            else await addAddress(payload);
            await loadAddresses();
            patch({
                isAddingAddress: false, editingAddress: null, addrErrors: {},
                addrForm: { flatNo: "", landMark: "", address: "", pinCode: "", state: "", type: "Home", latitude: "", longitude: "", typeDropdownOpen: false },
            });
        } catch (err) {
            console.error("Failed to save address:", err);
        } finally {
            patch({ isAddressLoading: false });
        }
    };

    const handleEditAddress = (addr: Address) => {
        patch({ editingAddress: addr, isAddingAddress: true, addrErrors: {} });
        patchAddrForm({
            flatNo: addr.flatNo, landMark: addr.landMark, address: addr.address,
            pinCode: addr.pinCode, state: addr.state, type: addr.type,
            latitude: addr.latitude, longitude: addr.longitude, typeDropdownOpen: false,
        });
    };

    const cancelAddrForm = () =>
        patch({
            isAddingAddress: false, editingAddress: null, addrErrors: {},
            addrForm: { flatNo: "", landMark: "", address: "", pinCode: "", state: "", type: "Home", latitude: "", longitude: "", typeDropdownOpen: false },
        });

    const toggleOrderExpand = (orderId: number) => {
        patch({ expandedOrderId: s.expandedOrderId === orderId ? null : orderId });
    };

    const displayName = user
        ? `${user.data?.body?.firstName || user.firstName || ""} ${user.data?.body?.lastName || user.lastName || ""}`.trim() || "My Account"
        : "My Account";

    const displayEmail = user?.data?.body?.email || user?.email || "";
    const displayPhone = user?.data?.body?.mobileNumber || user?.phone || "";

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "info", label: "Profile", icon: User },
        { id: "orders", label: "My Orders", icon: Package },
        { id: "address", label: "Addresses", icon: MapPin },
        { id: "wallet", label: "Wallet", icon: Wallet },
    ];

    return (
        <div className="min-h-screen bg-[#F5F2EE] text-[#1A1A1A]">
            <PhysicalGoldHeader />

            <main className="pt-40 pb-16 max-w-5xl mx-auto px-4 sm:px-6">

                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate("/physical-gold")}
                    className="mb-2 mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#8A8A8A] hover:text-[#8B6914] transition"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Shopping
                </button>

                {/* Profile Header Card */}
                <div className="bg-white border border-[#E8E0D5] rounded-xl px-6 py-4 flex items-center justify-between mb-1 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-[#F5EDD6] flex items-center justify-center text-[#8B6914]">
                            <User className="h-5 w-5" strokeWidth={1.8} />
                        </div>
                        <div>
                            <h1 className="text-[15px] font-semibold text-[#1A1A1A] leading-tight">{displayName}</h1>
                            <p className="text-[11px] text-[#8A8A8A] mt-0.5">
                                {displayEmail}{displayPhone ? ` · ${displayPhone}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setSearchParams({ tab: "info" });
                            patch({ activeTab: "info", isEditingProfile: true });
                        }}
                        className="inline-flex items-center gap-1.5 border border-[#E8E0D5] rounded-lg px-3.5 py-1.5 text-[11px] font-medium text-[#1A1A1A] hover:bg-[#F5F2EE] transition"
                    >
                        <Pencil className="h-3 w-3" />
                        Edit Profile
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white border border-[#E8E0D5] border-t-0 rounded-b-xl shadow-sm mb-6">
                    <div className="flex border-b border-[#F0EBE1]">
                        {tabs.map(({ id, label, icon: Icon }) => {
                            const isActive = s.activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => {
                                        setSearchParams({ tab: id });
                                        patch({ activeTab: id, isAddingAddress: false, isEditingProfile: false });
                                    }}
                                    className={`flex items-center gap-1.5 px-5 py-3 text-[14px] font-medium border-b-2 transition-all ${isActive ? "border-[#8B6914] text-[#8B6914]" : "border-transparent text-[#8A8A8A] hover:text-[#1A1A1A]"}`}
                                >
                                    <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.5 : 1.8} />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── PROFILE TAB ── */}
                    {s.activeTab === "info" && (
                        <div className="p-6">
                            {s.isProfileLoading ? (
                                <div className="flex items-center justify-center py-16 gap-2 text-[#8A8A8A]">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-[12px]">Loading...</span>
                                </div>
                            ) : s.isEditingProfile ? (
                                <div className="space-y-5 max-w-2xl">
                                    <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>First Name</label>
                                            <input value={s.profileForm.firstName} onChange={(e) => patchProfile({ firstName: e.target.value })} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Last Name</label>
                                            <input value={s.profileForm.lastName} onChange={(e) => patchProfile({ lastName: e.target.value })} className={inputCls} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Email</label>
                                        <input value={s.profileForm.email} onChange={(e) => patchProfile({ email: e.target.value })} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>WhatsApp Number</label>
                                        <input value={s.profileForm.whatsappNumber} onChange={(e) => patchProfile({ whatsappNumber: e.target.value })} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Alternative Number</label>
                                        <input value={s.profileForm.alternativeNumber} onChange={(e) => patchProfile({ alternativeNumber: e.target.value })} className={inputCls} />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => patch({ isEditingProfile: false })} className="px-5 py-2 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#8A8A8A] hover:bg-[#F5F2EE] transition">Cancel</button>
                                        <button onClick={handleSaveProfile} disabled={s.isSavingProfile} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition disabled:opacity-60">
                                            {s.isSavingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-2xl">
                                    <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">Personal Information</h3>
                                    <div className="divide-y divide-[#F0EBE1]">
                                        <InfoRow label="Full Name" value={`${s.profileForm.firstName} ${s.profileForm.lastName}`.trim()} />
                                        <InfoRow label="Email" value={s.profileForm.email} />
                                        <InfoRow label="Phone" value={s.profileForm.mobileNumber} />
                                        <InfoRow label="WhatsApp" value={s.profileForm.whatsappNumber} />
                                        <InfoRow label="Alt. Number" value={s.profileForm.alternativeNumber} />
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t border-[#F0EBE1] pt-4">
                                        <button onClick={() => patch({ isEditingProfile: true })} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#1A1A1A] hover:bg-[#F5F2EE] transition">
                                            <Pencil className="h-3 w-3" /> Edit Information
                                        </button>
                                        <button onClick={handleLogout} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-rose-500 hover:text-rose-600 transition">
                                            <LogOut className="h-3.5 w-3.5" /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ADDRESSES TAB ── */}
                    {s.activeTab === "address" && (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Saved Addresses</h3>
                                {!s.isAddingAddress && (
                                    <button onClick={() => patch({ isAddingAddress: true, editingAddress: null, addrErrors: {} })} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8B6914] text-white text-[11px] font-medium hover:bg-[#7A5C10] transition">
                                        <Plus className="h-3 w-3" strokeWidth={2.5} /> Add Address
                                    </button>
                                )}
                            </div>

                            {s.isAddingAddress && (
                                <div className="border border-[#E8E0D5] rounded-xl p-5 mb-5 space-y-4 bg-[#FAFAF8]">
                                    <h4 className="text-[12px] font-semibold text-[#1A1A1A]">{s.editingAddress ? "Edit Address" : "New Address"}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Flat No {s.addrErrors.flatNo && <span className="text-rose-500 ml-1">{s.addrErrors.flatNo}</span>}</label>
                                            <input value={s.addrForm.flatNo} onChange={(e) => patchAddrForm({ flatNo: e.target.value })} className={`${inputCls} ${s.addrErrors.flatNo ? "border-rose-400" : ""}`} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Landmark {s.addrErrors.landMark && <span className="text-rose-500 ml-1">{s.addrErrors.landMark}</span>}</label>
                                            <input value={s.addrForm.landMark} onChange={(e) => patchAddrForm({ landMark: e.target.value })} className={`${inputCls} ${s.addrErrors.landMark ? "border-rose-400" : ""}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Complete Address {s.addrErrors.address && <span className="text-rose-500 ml-1">{s.addrErrors.address}</span>}</label>
                                        <textarea value={s.addrForm.address} onChange={(e) => patchAddrForm({ address: e.target.value })} className={`${inputCls} resize-none ${s.addrErrors.address ? "border-rose-400" : ""}`} rows={2} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Pin Code {s.addrErrors.pinCode && <span className="text-rose-500 ml-1">{s.addrErrors.pinCode}</span>}</label>
                                            <input value={s.addrForm.pinCode} onChange={(e) => patchAddrForm({ pinCode: e.target.value })} className={`${inputCls} ${s.addrErrors.pinCode ? "border-rose-400" : ""}`} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>State {s.addrErrors.state && <span className="text-rose-500 ml-1">{s.addrErrors.state}</span>}</label>
                                            <input value={s.addrForm.state} onChange={(e) => patchAddrForm({ state: e.target.value })} className={`${inputCls} ${s.addrErrors.state ? "border-rose-400" : ""}`} />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-1">
                                        <button onClick={cancelAddrForm} className="px-4 py-2 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#8A8A8A] hover:bg-[#F5F2EE] transition">Cancel</button>
                                        <button onClick={handleSaveAddr} disabled={s.isAddressLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition disabled:opacity-60">
                                            {s.isAddressLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                            {s.editingAddress ? "Update" : "Save Address"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {s.isAddressLoading && !s.isAddingAddress ? (
                                <div className="flex items-center justify-center py-12 gap-2 text-[#8A8A8A]">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-[12px]">Loading addresses...</span>
                                </div>
                            ) : s.addresses.length === 0 && !s.isAddingAddress ? (
                                <div className="text-center py-16">
                                    <MapPin className="h-8 w-8 text-[#D1C7BB] mx-auto mb-3" />
                                    <p className="text-[12px] text-[#8A8A8A]">No addresses saved yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {s.addresses.map((addr) => (
                                        <div key={addr.id} className="flex items-start gap-4 border border-[#E8E0D5] rounded-xl px-5 py-4 bg-white hover:border-[#C9B87A] transition">
                                            <div className="h-8 w-8 rounded-lg bg-[#F5EDD6] flex items-center justify-center text-[#8B6914] shrink-0 mt-0.5">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{addr.address}</p>
                                                <p className="text-[11px] text-[#8A8A8A] mt-0.5">{[addr.flatNo, addr.landMark, addr.state, addr.pinCode].filter(Boolean).join(" · ")}</p>
                                            </div>
                                            <button onClick={() => handleEditAddress(addr)} className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#E8E0D5] text-[#8A8A8A] hover:bg-[#F5EDD6] hover:text-[#8B6914] hover:border-[#C9B87A] transition shrink-0">
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── WALLET TAB ── */}
                    {s.activeTab === "wallet" && (
                        <div className="p-6">
                            {s.isWalletLoading ? (
                                <div className="flex items-center justify-center py-16 gap-2 text-[#8A8A8A]">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-[12px]">Loading wallet...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Balance Card */}
                                    <div className="rounded-xl bg-[#1A1200] text-white px-6 py-5 mb-5 flex items-center justify-between shadow-md">
                                        <div>
                                            <p className="text-[10px] font-medium text-[#8A7A50] uppercase tracking-widest mb-1">Wallet Balance</p>
                                            <p className="text-[26px] font-semibold tracking-tight">{DISPLAY_INR(s.walletBalance)}</p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-[#8B6914]/20 flex items-center justify-center">
                                            <Wallet className="h-5 w-5 text-[#C9A84C]" />
                                        </div>
                                    </div>

                                    {/* Transactions */}
                                    <h4 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">Transaction History</h4>
                                    {s.walletTransactions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <History className="h-8 w-8 text-[#D1C7BB] mx-auto mb-3" />
                                            <p className="text-[12px] text-[#8A8A8A]">No transactions yet</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[#F0EBE1] border border-[#E8E0D5] rounded-xl overflow-hidden">
                                            {s.walletTransactions.map((tx, i) => (
                                                <div key={i} className="flex items-center justify-between px-5 py-3.5 bg-white hover:bg-[#FAFAF8] transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center ${tx.type === "CREDIT" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                                            {tx.type === "CREDIT" ? <Plus size={12} /> : <Minus size={12} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-medium text-[#1A1A1A]">{tx.description || "Transaction"}</p>
                                                            <p className="text-[11px] text-[#8A8A8A]">{formatDate(tx.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[13px] font-semibold ${tx.type === "CREDIT" ? "text-emerald-600" : "text-[#1A1A1A]"}`}>
                                                        {tx.type === "CREDIT" ? "+" : "−"}{tx.amount?.toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── ORDERS TAB ── */}
                    {s.activeTab === "orders" && (
                        <div className="p-6">
                            <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-5">Order History</h3>
                            {s.isOrdersLoading ? (
                                <div className="flex items-center justify-center py-16 gap-2 text-[#8A8A8A]">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-[12px]">Loading orders...</span>
                                </div>
                            ) : s.orders.length === 0 ? (
                                <div className="text-center py-16">
                                    <ShoppingBag className="h-8 w-8 text-[#D1C7BB] mx-auto mb-3" />
                                    <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">No orders yet</p>
                                    <p className="text-[12px] text-[#8A8A8A] mb-5">Explore our collection and place your first order</p>
                                    <button onClick={() => navigate("/physical-gold")} className="px-5 py-2 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition">Explore Collection</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {s.orders.map((order) => {
                                        const isExp = s.expandedOrderId === order.orderId;
                                        return (
                                            <div key={order.orderId} className="border border-[#E8E0D5] rounded-xl overflow-hidden bg-white">
                                                {/* Order Header */}
                                                <div className="flex items-center gap-4 px-5 py-4">
                                                    <div className="h-10 w-10 rounded-lg bg-[#F5EDD6] flex items-center justify-center text-[#8B6914] shrink-0">
                                                        <Package className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] text-[#8A8A8A]">Order #{order.orderNumber}</p>
                                                        <p className="text-[12px] font-medium text-[#1A1A1A] mt-0.5">{formatDate(order.paymentExpiry)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                                                        <span className="text-[14px] font-semibold text-[#1A1A1A]">{DISPLAY_INR(order.totalAmount)}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 px-5 pb-4 border-t border-[#F0EBE1] pt-3">
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                const res = await getInvoicePreviewUrl(order.orderNumber);
                                                                const b = await res.blob();
                                                                const u = URL.createObjectURL(b);
                                                                window.open(u, "_blank");
                                                            } catch (err) { console.error(err); }
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E8E0D5] text-[11px] font-medium text-[#8A8A8A] hover:bg-[#F5F2EE] transition"
                                                    >
                                                        <FileText className="h-3 w-3" /> Invoice
                                                    </button>
                                                    <button
                                                        onClick={() => toggleOrderExpand(order.orderId)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E8E0D5] text-[11px] font-medium text-[#1A1A1A] hover:bg-[#F5F2EE] transition ml-auto"
                                                    >
                                                        {isExp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                        {isExp ? "Hide Details" : "View Details"}
                                                    </button>
                                                </div>

                                                {/* Expanded Details */}
                                                {isExp && (
                                                    <div className="border-t border-[#F0EBE1] bg-[#FAFAF8] px-5 py-4 space-y-3">
                                                        <p className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider mb-2">Items</p>
                                                        {order.items?.map((item: any, i: number) => (
                                                            <div key={i} className="flex items-center justify-between bg-white border border-[#E8E0D5] rounded-lg px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-lg bg-[#F5EDD6] flex items-center justify-center text-[#8B6914]">
                                                                        <Package className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[12px] font-medium text-[#1A1A1A]">Product #{item.productId}</p>
                                                                        <p className="text-[11px] text-[#8A8A8A]">Qty: {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[13px] font-semibold text-[#1A1A1A]">{DISPLAY_INR(item.subtotal)}</p>
                                                            </div>
                                                        ))}
                                                        <div className="flex items-center justify-between bg-[#1A1200] text-white rounded-lg px-4 py-3 mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-3.5 w-3.5 text-[#C9A84C]" />
                                                                <span className="text-[11px] font-medium">{order.paymentMode}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                                                                <span className="text-[10px] text-[#8A7A50]">Verified</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;