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
    Trash2,
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
    deleteAddress,
    fetchUserOrders,
    getInvoicePreviewUrl,
    verifyPan,
} from "./physicalGoldService";
import { Order } from "./physicalGoldData";
import PhysicalGoldHeader from "./components/Header";
import Toast, { ToastType } from "./components/Toast";
import Dropdown from "./components/Dropdown";
import { validateEmail, validateMobileNumber, formatMobileNumber, validatePincode, formatPincode } from "./utils/validations";

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
    isVerifyingPan: boolean;
    profileForm: {
        firstName: string;
        lastName: string;
        email: string;
        alternativeNumber: string;
        whatsappNumber: string;
        mobileNumber: string;
        gender: string;
        panNumber: string;
        panName: string;
        panVerified: boolean;
    };
    profileErrors: Record<string, string>;
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
    toast: { message: string; type: ToastType } | null;
    deleteConfirmation: { show: boolean; addressId: string | null };
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
    <div className="flex flex-col sm:flex-row sm:items-center border-b border-[#F0EBE1] py-3.5 last:border-b-0 gap-1 sm:gap-0">
        <span className="w-full sm:w-36 text-[12px] text-[#8A8A8A] shrink-0">{label}</span>
        <span className="text-[13px] font-semibold text-[#1A1A1A] break-all">{value || "—"}</span>
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
        isVerifyingPan: false,
        profileForm: {
            firstName: "",
            lastName: "",
            email: "",
            alternativeNumber: "",
            whatsappNumber: "",
            mobileNumber: "",
            gender: "",
            panNumber: "",
            panName: "",
            panVerified: false,
        },
        profileErrors: {},
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
        toast: null,
        deleteConfirmation: { show: false, addressId: null },
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
                    gender: profile.gender || "",
                    panNumber: profile.panNumber || "",
                    panName: profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : "",
                    panVerified: profile.panVerified || false,
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
                        gender: profile.gender || "",
                        panNumber: profile.panNumber || "",
                        panName: profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : "",
                        panVerified: profile.panVerified || false,
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
                pinCode: a.pincode || "",
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
        navigate("/login", { replace: true });
    };

    const validatePan = (pan: string): boolean => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan);
    };

    const handleSaveProfile = async () => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId || userData?.userId;
        if (!uid) return;

        const { profileForm } = s;
        const errors: Record<string, string> = {};

        // Required field validations
        if (!profileForm.firstName.trim()) errors.firstName = "First name is required";
        if (!profileForm.lastName.trim()) errors.lastName = "Last name is required";
        if (!profileForm.email.trim()) {
            errors.email = "Email is required";
        } else if (!validateEmail(profileForm.email)) {
            errors.email = "Invalid email format";
        }
        if (!profileForm.alternativeNumber.trim()) {
            errors.alternativeNumber = "Alternative number is required";
        } else if (!validateMobileNumber(profileForm.alternativeNumber)) {
            errors.alternativeNumber = "Invalid mobile number (10 digits, starting with 6-9)";
        }
        if (!profileForm.gender) errors.gender = "Gender is required";

        // PAN validation
        if (!profileForm.panNumber.trim()) {
            errors.panNumber = "PAN number is required";
        } else if (!validatePan(profileForm.panNumber.toUpperCase())) {
            errors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
        }

        if (!profileForm.panVerified && profileForm.panNumber.trim()) {
            if (!profileForm.panName.trim()) {
                errors.panName = "Name as per PAN is required for verification";
            }
        }

        // Optional WhatsApp number validation
        if (profileForm.whatsappNumber.trim() && !validateMobileNumber(profileForm.whatsappNumber)) {
            errors.whatsappNumber = "Invalid mobile number (10 digits, starting with 6-9)";
        }

        if (Object.keys(errors).length) {
            patch({ profileErrors: errors, toast: { message: "Please fix the errors in the form", type: "error" } });
            return;
        }

        patch({ isSavingProfile: true, profileErrors: {} });
        try {
            // Verify PAN if not verified
            if (!profileForm.panVerified) {
                patch({ isVerifyingPan: true });
                try {
                    await verifyPan(uid, profileForm.panName, profileForm.panNumber.toUpperCase());
                    patch({ isVerifyingPan: false });
                } catch (panErr: any) {
                    patch({
                        isVerifyingPan: false,
                        isSavingProfile: false,
                        profileErrors: { panNumber: panErr.message || "PAN verification failed" },
                        toast: { message: "PAN verification failed. Please check your details.", type: "error" }
                    });
                    return;
                }
            }

            await saveUserProfile({
                userId: uid,
                email: profileForm.email,
                alternativeNumber: profileForm.alternativeNumber,
                whatsappNumber: profileForm.whatsappNumber,
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
                gender: profileForm.gender,
                panNumber: profileForm.panNumber.toUpperCase(),
            });
            const updatedUser = JSON.parse(JSON.stringify(userData));
            const profile = updatedUser.data?.body || updatedUser;
            profile.firstName = profileForm.firstName;
            profile.lastName = profileForm.lastName;
            profile.email = profileForm.email;
            profile.alternativeNumber = profileForm.alternativeNumber;
            profile.gender = profileForm.gender;
            profile.panNumber = profileForm.panNumber.toUpperCase();
            profile.panVerified = true;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            patch({ isEditingProfile: false, toast: { message: "Profile updated successfully", type: "success" } });
        } catch (err) {
            console.error("Failed to save profile:", err);
            patch({ toast: { message: "Failed to save profile. Please try again.", type: "error" } });
        } finally {
            patch({ isSavingProfile: false, isVerifyingPan: false });
        }
    };

    const handleSaveAddr = async () => {
        const { addrForm, editingAddress } = s;
        const errors: Record<string, string> = {};

        // Required field validations
        if (!addrForm.flatNo.trim()) errors.flatNo = "Flat No is required";
        if (!addrForm.landMark.trim()) errors.landMark = "Landmark is required";
        if (!addrForm.address.trim()) errors.address = "Complete address is required";
        if (!addrForm.pinCode.trim()) {
            errors.pinCode = "Pin code is required";
        } else if (!validatePincode(addrForm.pinCode)) {
            errors.pinCode = "Invalid pin code (6 digits)";
        }

        if (Object.keys(errors).length) {
            patch({ addrErrors: errors, toast: { message: "Please fix the errors in the form", type: "error" } });
            return;
        }

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

        patch({ isAddressLoading: true, addrErrors: {} });
        try {
            if (editingAddress) await updateAddress(payload);
            else await addAddress(payload);
            await loadAddresses();
            patch({
                isAddingAddress: false, editingAddress: null,
                addrForm: { flatNo: "", landMark: "", address: "", pinCode: "", state: "", type: "Home", latitude: "", longitude: "", typeDropdownOpen: false },
                toast: { message: editingAddress ? "Address updated successfully" : "Address added successfully", type: "success" },
            });
        } catch (err) {
            console.error("Failed to save address:", err);
            patch({ toast: { message: "Failed to save address. Please try again.", type: "error" } });
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

    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            patch({ toast: { message: "Geolocation is not supported by your browser", type: "error" } });
            return;
        }

        patch({ isFetchingLocation: true, locationError: "" });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                patchAddrForm({
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                });
                patch({ isFetchingLocation: false, toast: { message: "Location captured successfully", type: "success" } });
            },
            (error) => {
                console.error("Geolocation error:", error);
                patch({
                    isFetchingLocation: false,
                    locationError: "Unable to fetch location",
                    toast: { message: "Failed to get location. Please enable location access.", type: "error" }
                });
            }
        );
    };

    const cancelAddrForm = () =>
        patch({
            isAddingAddress: false, editingAddress: null, addrErrors: {},
            addrForm: { flatNo: "", landMark: "", address: "", pinCode: "", state: "", type: "Home", latitude: "", longitude: "", typeDropdownOpen: false },
        });

    const handleDeleteAddress = async (addressId: string) => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId;
        if (!uid) return;

        patch({ isAddressLoading: true, deleteConfirmation: { show: false, addressId: null } });
        try {
            await deleteAddress(uid, addressId);
            await loadAddresses();
            patch({ toast: { message: "Address deleted successfully", type: "success" } });
        } catch (err) {
            console.error("Failed to delete address:", err);
            patch({ toast: { message: "Failed to delete address. Please try again.", type: "error" } });
        } finally {
            patch({ isAddressLoading: false });
        }
    };

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

            {/* Toast */}
            {s.toast && (
                <Toast
                    message={s.toast.message}
                    type={s.toast.type}
                    onClose={() => patch({ toast: null })}
                />
            )}

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
                <div className="bg-white border border-[#E8E0D5] rounded-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-1 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-[#F5EDD6] flex items-center justify-center text-[#8B6914] shrink-0">
                            <User className="h-5 w-5" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-[15px] font-semibold text-[#1A1A1A] leading-tight truncate">{displayName}</h1>
                            <p className="text-[11px] text-[#8A8A8A] mt-0.5 truncate">
                                {displayEmail}{displayPhone ? ` · ${displayPhone}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setSearchParams({ tab: "info" });
                            patch({ activeTab: "info", isEditingProfile: true });
                        }}
                        className="inline-flex items-center justify-center gap-1.5 border border-[#E8E0D5] rounded-lg px-3.5 py-1.5 text-[11px] font-medium text-[#1A1A1A] hover:bg-[#F5F2EE] transition shrink-0 w-full sm:w-auto"
                    >
                        <Pencil className="h-3 w-3" />
                        Edit Profile
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white border border-[#E8E0D5] border-t-0 rounded-b-xl shadow-sm mb-6">
                    <div className="flex border-b border-[#F0EBE1] overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>First Name<span className="text-rose-500 ml-1">*</span></label>
                                            <input
                                                value={s.profileForm.firstName}
                                                onChange={(e) => {
                                                    patchProfile({ firstName: e.target.value });
                                                    if (s.profileErrors.firstName && e.target.value.trim()) {
                                                        const newErrors = { ...s.profileErrors };
                                                        delete newErrors.firstName;
                                                        patch({ profileErrors: newErrors });
                                                    }
                                                }}
                                                className={`${inputCls} ${s.profileErrors.firstName ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            />
                                            {s.profileErrors.firstName && <p className="text-[11px] text-rose-500 mt-1">{s.profileErrors.firstName}</p>}
                                        </div>
                                        <div>
                                            <label className={labelCls}>Last Name<span className="text-rose-500 ml-1">*</span></label>
                                            <input
                                                value={s.profileForm.lastName}
                                                onChange={(e) => {
                                                    patchProfile({ lastName: e.target.value });
                                                    if (s.profileErrors.lastName && e.target.value.trim()) {
                                                        const newErrors = { ...s.profileErrors };
                                                        delete newErrors.lastName;
                                                        patch({ profileErrors: newErrors });
                                                    }
                                                }}
                                                className={`${inputCls} ${s.profileErrors.lastName ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            />
                                            {s.profileErrors.lastName && <p className="text-[11px] text-rose-500 mt-1">{s.profileErrors.lastName}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Email<span className="text-rose-500 ml-1">*</span></label>
                                        <input
                                            type="email"
                                            value={s.profileForm.email}
                                            onChange={(e) => {
                                                patchProfile({ email: e.target.value });
                                                if (s.profileErrors.email) {
                                                    if (e.target.value.trim() && validateEmail(e.target.value)) {
                                                        const newErrors = { ...s.profileErrors };
                                                        delete newErrors.email;
                                                        patch({ profileErrors: newErrors });
                                                    }
                                                }
                                            }}
                                            className={`${inputCls} ${s.profileErrors.email ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                        />
                                        {s.profileErrors.email && <p className="text-[11px] text-rose-500 mt-1">{s.profileErrors.email}</p>}
                                    </div>
                                    <Dropdown
                                        label="Gender"
                                        value={s.profileForm.gender}
                                        options={[
                                            { value: "male", label: "Male" },
                                            { value: "female", label: "Female" },
                                        ]}
                                        onChange={(value) => {
                                            patchProfile({ gender: value });
                                            if (s.profileErrors.gender && value) {
                                                const newErrors = { ...s.profileErrors };
                                                delete newErrors.gender;
                                                patch({ profileErrors: newErrors });
                                            }
                                        }}
                                        required
                                        error={s.profileErrors.gender}
                                    />
                                    <div>
                                        <label className={labelCls}>Mobile Number</label>
                                        <input
                                            type="tel"
                                            value={s.profileForm.mobileNumber}
                                            disabled
                                            className={`${inputCls} bg-[#F5F2EE] cursor-not-allowed opacity-60`}
                                        />
                                        <p className="text-[11px] text-[#8A8A8A] mt-1">Mobile number cannot be changed. Contact support if needed.</p>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Alternative Number<span className="text-rose-500 ml-1">*</span></label>
                                        <input
                                            type="tel"
                                            value={s.profileForm.alternativeNumber}
                                            onChange={(e) => {
                                                const formatted = formatMobileNumber(e.target.value);
                                                if (formatted.length <= 10) {
                                                    patchProfile({ alternativeNumber: formatted });
                                                    if (s.profileErrors.alternativeNumber) {
                                                        if (formatted.trim() && validateMobileNumber(formatted)) {
                                                            const newErrors = { ...s.profileErrors };
                                                            delete newErrors.alternativeNumber;
                                                            patch({ profileErrors: newErrors });
                                                        }
                                                    }
                                                }
                                            }}
                                            placeholder="10-digit mobile number"
                                            className={`${inputCls} ${s.profileErrors.alternativeNumber ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                        />
                                        {s.profileErrors.alternativeNumber && <p className="text-[11px] text-rose-500 mt-1">{s.profileErrors.alternativeNumber}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            value={s.profileForm.whatsappNumber}
                                            onChange={(e) => {
                                                const formatted = formatMobileNumber(e.target.value);
                                                if (formatted.length <= 10) {
                                                    patchProfile({ whatsappNumber: formatted });
                                                    if (s.profileErrors.whatsappNumber) {
                                                        if (!formatted.trim() || validateMobileNumber(formatted)) {
                                                            const newErrors = { ...s.profileErrors };
                                                            delete newErrors.whatsappNumber;
                                                            patch({ profileErrors: newErrors });
                                                        }
                                                    }
                                                }
                                            }}
                                            placeholder="10-digit mobile number (optional)"
                                            className={`${inputCls} ${s.profileErrors.whatsappNumber ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                        />
                                        {s.profileErrors.whatsappNumber && <p className="text-[11px] text-rose-500 mt-1">{s.profileErrors.whatsappNumber}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            PAN Number<span className="text-rose-500 ml-1">*</span>
                                            {s.profileForm.panVerified && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
                                                    <CheckCircle2 className="h-3 w-3" /> Verified
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            value={s.profileForm.panNumber}
                                            onChange={(e) => {
                                                const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                if (formatted.length <= 10) {
                                                    patchProfile({ panNumber: formatted });
                                                    if (s.profileErrors.panNumber && formatted.trim()) {
                                                        const newErrors = { ...s.profileErrors };
                                                        delete newErrors.panNumber;
                                                        patch({ profileErrors: newErrors });
                                                    }
                                                }
                                            }}
                                            placeholder="ABCDE1234F"
                                            maxLength={10}
                                            disabled={s.profileForm.panVerified}
                                            className={`${inputCls} ${s.profileForm.panVerified ? "bg-[#F5F2EE] cursor-not-allowed opacity-60" : ""} ${s.profileErrors.panNumber ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                        />
                                        {s.profileErrors.panNumber && <p className="text-[11px] text-rose-500 mt-1">{s.profileErrors.panNumber}</p>}
                                        {s.profileForm.panVerified && <p className="text-[11px] text-[#8A8A8A] mt-1">PAN is verified and cannot be changed.</p>}
                                    </div>
                                    {!s.profileForm.panVerified && s.profileForm.panNumber.trim() && (
                                        <div>
                                            <label className={labelCls}>Name as per PAN<span className="text-rose-500 ml-1">*</span></label>
                                            <input
                                                type="text"
                                                value={s.profileForm.panName}
                                                onChange={(e) => {
                                                    patchProfile({ panName: e.target.value });
                                                    if (s.profileErrors.panName && e.target.value.trim()) {
                                                        const newErrors = { ...s.profileErrors };
                                                        delete newErrors.panName;
                                                        patch({ profileErrors: newErrors });
                                                    }
                                                }}
                                                placeholder="Full name as per PAN card"
                                                className={`${inputCls} ${s.profileErrors.panName ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            />
                                            {s.profileErrors.panName && <p className="text-[11px] text-rose-500 mt-1">{s.profileErrors.panName}</p>}
                                            <p className="text-[11px] text-[#8A8A8A] mt-1">Required for PAN verification</p>
                                        </div>
                                    )}
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => patch({ isEditingProfile: false, profileErrors: {} })} className="px-5 py-2 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#8A8A8A] hover:bg-[#F5F2EE] transition">Cancel</button>
                                        <button onClick={handleSaveProfile} disabled={s.isSavingProfile || s.isVerifyingPan} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition disabled:opacity-60">
                                            {s.isVerifyingPan ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Verifying PAN...
                                                </>
                                            ) : s.isSavingProfile ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-2xl">
                                    <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">Personal Information</h3>
                                    <div className="divide-y divide-[#F0EBE1]">
                                        <InfoRow label="Full Name" value={`${s.profileForm.firstName} ${s.profileForm.lastName}`.trim()} />
                                        <InfoRow label="Email" value={s.profileForm.email} />
                                        <InfoRow label="Gender" value={s.profileForm.gender ? s.profileForm.gender.charAt(0).toUpperCase() + s.profileForm.gender.slice(1) : "—"} />
                                        <InfoRow label="Mobile Number" value={s.profileForm.mobileNumber} />
                                        <InfoRow label="Alt. Number" value={s.profileForm.alternativeNumber} />
                                        <InfoRow label="WhatsApp" value={s.profileForm.whatsappNumber} />
                                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-[#F0EBE1] py-3.5 last:border-b-0 gap-1 sm:gap-0">
                                            <span className="w-full sm:w-36 text-[12px] text-[#8A8A8A] shrink-0">PAN Number</span>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[13px] font-semibold text-[#1A1A1A] break-all">
                                                    {s.profileForm.panNumber ? (
                                                        s.profileForm.panVerified ?
                                                            `${s.profileForm.panNumber.slice(0, 5)}****${s.profileForm.panNumber.slice(-1)}` :
                                                            s.profileForm.panNumber
                                                    ) : "—"}
                                                </span>
                                                {s.profileForm.panVerified && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold shrink-0">
                                                        <CheckCircle2 className="h-3 w-3" /> Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Flat No<span className="text-rose-500 ml-1">*</span></label>
                                            <input
                                                value={s.addrForm.flatNo}
                                                onChange={(e) => {
                                                    patchAddrForm({ flatNo: e.target.value });
                                                    if (s.addrErrors.flatNo && e.target.value.trim()) {
                                                        const newErrors = { ...s.addrErrors };
                                                        delete newErrors.flatNo;
                                                        patch({ addrErrors: newErrors });
                                                    }
                                                }}
                                                className={`${inputCls} ${s.addrErrors.flatNo ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            />
                                            {s.addrErrors.flatNo && <p className="text-[11px] text-rose-500 mt-1">{s.addrErrors.flatNo}</p>}
                                        </div>
                                        <div>
                                            <label className={labelCls}>Landmark<span className="text-rose-500 ml-1">*</span></label>
                                            <input
                                                value={s.addrForm.landMark}
                                                onChange={(e) => {
                                                    patchAddrForm({ landMark: e.target.value });
                                                    if (s.addrErrors.landMark && e.target.value.trim()) {
                                                        const newErrors = { ...s.addrErrors };
                                                        delete newErrors.landMark;
                                                        patch({ addrErrors: newErrors });
                                                    }
                                                }}
                                                className={`${inputCls} ${s.addrErrors.landMark ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            />
                                            {s.addrErrors.landMark && <p className="text-[11px] text-rose-500 mt-1">{s.addrErrors.landMark}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Complete Address<span className="text-rose-500 ml-1">*</span></label>
                                        <textarea
                                            value={s.addrForm.address}
                                            onChange={(e) => {
                                                patchAddrForm({ address: e.target.value });
                                                if (s.addrErrors.address && e.target.value.trim()) {
                                                    const newErrors = { ...s.addrErrors };
                                                    delete newErrors.address;
                                                    patch({ addrErrors: newErrors });
                                                }
                                            }}
                                            className={`${inputCls} resize-none ${s.addrErrors.address ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            rows={2}
                                        />
                                        {s.addrErrors.address && <p className="text-[11px] text-rose-500 mt-1">{s.addrErrors.address}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Pin Code<span className="text-rose-500 ml-1">*</span></label>
                                            <input
                                                value={s.addrForm.pinCode}
                                                onChange={(e) => {
                                                    const formatted = formatPincode(e.target.value);
                                                    patchAddrForm({ pinCode: formatted });
                                                    if (s.addrErrors.pinCode) {
                                                        if (formatted.trim() && validatePincode(formatted)) {
                                                            const newErrors = { ...s.addrErrors };
                                                            delete newErrors.pinCode;
                                                            patch({ addrErrors: newErrors });
                                                        }
                                                    }
                                                }}
                                                placeholder="6-digit pin code"
                                                className={`${inputCls} ${s.addrErrors.pinCode ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            />
                                            {s.addrErrors.pinCode && <p className="text-[11px] text-rose-500 mt-1">{s.addrErrors.pinCode}</p>}
                                        </div>
                                        <div>
                                            <label className={labelCls}>State</label>
                                            <input
                                                value={s.addrForm.state}
                                                onChange={(e) => patchAddrForm({ state: e.target.value })}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                    <div className="border-t border-[#E8E0D5] pt-4">
                                        <button
                                            type="button"
                                            onClick={fetchCurrentLocation}
                                            disabled={s.isFetchingLocation}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#1A1A1A] hover:bg-[#F5F2EE] transition disabled:opacity-60"
                                        >
                                            {s.isFetchingLocation ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <MapPinned className="h-3.5 w-3.5" />
                                            )}
                                            {s.isFetchingLocation ? "Fetching..." : "Capture Current Location"}
                                        </button>
                                        {(s.addrForm.latitude && s.addrForm.longitude) && (
                                            <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Location captured: {parseFloat(s.addrForm.latitude).toFixed(6)}, {parseFloat(s.addrForm.longitude).toFixed(6)}
                                            </p>
                                        )}
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
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button onClick={() => handleEditAddress(addr)} className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#E8E0D5] text-[#8A8A8A] hover:bg-[#F5EDD6] hover:text-[#8B6914] hover:border-[#C9B87A] transition">
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => patch({ deleteConfirmation: { show: true, addressId: addr.id } })}
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#E8E0D5] text-[#8A8A8A] hover:bg-rose-50 hover:text-rose-500 hover:border-rose-300 transition"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
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
                                                {/* Order Header */}
                                                <div className="flex items-start gap-3 px-4 py-4">
                                                    <div className="h-9 w-9 rounded-lg bg-[#F5EDD6] flex items-center justify-center text-[#8B6914] shrink-0 mt-0.5">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-1.5">
                                                        {/* Order number — truncated on small screens */}
                                                        <p className="text-[11px] text-[#8A8A8A] truncate">
                                                            Order #{order.orderNumber}
                                                        </p>
                                                        {/* Date */}
                                                        <p className="text-[11px] font-medium text-[#1A1A1A]">
                                                            {formatDate(order.paymentExpiry)}
                                                        </p>
                                                        {/* Badges + amount — all in flow, wraps naturally */}
                                                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(order.orderStatus)}`}>
                                                                Order: {order.orderStatus}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(order.paymentStatus)}`}>
                                                                Payment: {order.paymentStatus}
                                                            </span>
                                                            <span className="text-[13px] font-semibold text-[#1A1A1A] ml-auto whitespace-nowrap">
                                                                {DISPLAY_INR(order.totalAmount)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {order.paymentStatus !== 'PENDING' && (
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
                                                )}


                                                {/* Expanded Details */}
                                                {isExp && (
                                                    <div className="border-t border-[#F0EBE1] bg-[#FAFAF8] px-5 py-4 space-y-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
                                                                Items · {order.totalItems} piece{order.totalItems > 1 ? "s" : ""}
                                                            </p>
                                                            <p className="text-[11px] text-[#8A8A8A]">{formatDate(order.paymentExpiry)}</p>
                                                        </div>

                                                        {order.items?.map((item: any, i: number) => (
                                                            <div key={i} className="bg-white border border-[#E8E0D5] rounded-lg px-4 py-3">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="h-9 w-9 rounded-lg bg-[#F5EDD6] flex items-center justify-center text-[#8B6914] shrink-0 mt-0.5">
                                                                            <Package className="h-4 w-4" />
                                                                        </div>
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-[13px] font-semibold text-[#1A1A1A]">
                                                                                {item.productName || `Product #${item.productId}`}
                                                                            </p>
                                                                            {item.variant && (
                                                                                <p className="text-[11px] text-[#8B6914] font-medium">{item.variant}</p>
                                                                            )}
                                                                            <p className="text-[11px] text-[#8A8A8A]">
                                                                                Qty: {item.quantity} · {DISPLAY_INR(item.price)} per pc
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <p className="text-[13px] font-semibold text-[#1A1A1A]">{DISPLAY_INR(item.subtotal)}</p>
                                                                        {item.quantity > 1 && (
                                                                            <p className="text-[10px] text-[#8A8A8A] mt-0.5">
                                                                                {item.quantity} × {DISPLAY_INR(item.price)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Order Summary Row */}
                                                        <div className="flex items-center justify-between bg-white border border-[#E8E0D5] rounded-lg px-4 py-3">
                                                            <p className="text-[11px] text-[#8A8A8A]">
                                                                {order.totalItems} item{order.totalItems > 1 ? "s" : ""} total
                                                            </p>
                                                            <p className="text-[13px] font-semibold text-[#1A1A1A]">{DISPLAY_INR(order.totalAmount)}</p>
                                                        </div>

                                                        {/* Payment Info */}
                                                        <div className="flex items-center justify-between bg-[#1A1200] text-white rounded-lg px-4 py-3 mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-3.5 w-3.5 text-[#C9A84C]" />
                                                                <span className="text-[11px] font-medium">{order.paymentMode}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.paymentStatus)}`}>
                                                                    {order.paymentStatus}
                                                                </span>
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

            {/* Delete Confirmation Modal */}
            {s.deleteConfirmation.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center">
                                <Trash2 className="h-5 w-5 text-rose-500" />
                            </div>
                            <h3 className="text-[16px] font-semibold text-[#1A1A1A]">Delete Address</h3>
                        </div>
                        <p className="text-[13px] text-[#8A8A8A] mb-6">
                            Are you sure you want to delete this address? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => patch({ deleteConfirmation: { show: false, addressId: null } })}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-[#E8E0D5] text-[13px] font-medium text-[#1A1A1A] hover:bg-[#F5F2EE] transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => s.deleteConfirmation.addressId && handleDeleteAddress(s.deleteConfirmation.addressId)}
                                disabled={s.isAddressLoading}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-rose-500 text-white text-[13px] font-medium hover:bg-rose-600 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
                            >
                                {s.isAddressLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;