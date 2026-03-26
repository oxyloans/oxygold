import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowUpRight,
    Briefcase,
    CheckCircle2,
    History,
    Loader2,
    LogOut,
    MapPin,
    MapPinned,
    Pencil,
    Plus,
    User,
    Wallet,
    X,
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
} from "./physicalGoldService";
import PhysicalGoldHeader from "./PhysicalGoldHeader";

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

type Tab = "info" | "address" | "wallet";

interface PageState {
    activeTab: Tab;
    // Profile
    isEditingProfile: boolean;
    isSavingProfile: boolean;
    isProfileLoading: boolean;
    profileForm: {
        firstName: string;
        lastName: string;
        email: string;
        alterMobileNumber: string;
        whatsappNumber: string;
        mobileNumber: string;
    };
    // Address
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
    // Wallet
    walletBalance: number;
    walletTransactions: any[];
    isWalletLoading: boolean;
}

/* ────────────────────────────────────────────────────────── */
/*  Helpers                                                   */
/* ────────────────────────────────────────────────────────── */
const formatINR = (v: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(v);

const GET_USER_DATA = () => {
    try {
        const s = localStorage.getItem("user");
        return s ? JSON.parse(s) : null;
    } catch {
        return null;
    }
};

const ADDRESS_ICONS: Record<Address["type"], React.ElementType> = {
    Home: MapPin,
    Work: Briefcase,
    Other: MapPinned,
};

const fieldCls =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-900 placeholder-zinc-300 outline-none focus:border-[#2b0a59] focus:ring-1 focus:ring-purple-500/20 transition shadow-sm font-medium";
const labelCls = "block text-[11px] font-black text-zinc-400 mb-1.5 uppercase tracking-wider";

/* ────────────────────────────────────────────────────────── */
/*  ProfilePage                                               */
/* ────────────────────────────────────────────────────────── */
const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
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
            alterMobileNumber: "",
            whatsappNumber: "",
            mobileNumber: "",
        },
        addresses: [],
        isAddressLoading: false,
        isAddingAddress: false,
        editingAddress: null,
        addrForm: {
            flatNo: "",
            landMark: "",
            address: "",
            pinCode: "",
            state: "",
            type: "Home",
            latitude: "",
            longitude: "",
            typeDropdownOpen: false,
        },
        addrErrors: {},
        isFetchingLocation: false,
        locationError: "",
        walletBalance: 0,
        walletTransactions: [],
        isWalletLoading: false,
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

    /* ── update tab if query param changes ── */
    useEffect(() => {
        const tab = searchParams.get("tab") as Tab;
        if (tab && tab !== s.activeTab) {
            patch({ activeTab: tab, isAddingAddress: false, isEditingProfile: false });
        }
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps


    /* ── seed profile form from user data ── */
    useEffect(() => {
        if (user) {
            const profile = user.data?.body || user;
            patch({
                profileForm: {
                    firstName: profile.firstName || "",
                    lastName: profile.lastName || "",
                    email: profile.email || "",
                    alterMobileNumber: profile.alterMobileNumber || "",
                    whatsappNumber: profile.whatsappNumber || "",
                    mobileNumber:
                        profile.mobileNumber || profile.phone || profile.phoneNumber || "",
                },
            });
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── fetch data when tab changes ── */
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
                        alterMobileNumber: profile.alterMobileNumber || "",
                        whatsappNumber: profile.whatsappNumber || "",
                        mobileNumber: profile.mobileNumber || "",
                    },
                });
                const freshUser = {
                    ...userData,
                    data: { ...userData.data, body: profile },
                };
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

    useEffect(() => {
        if (s.activeTab === "info") fetchProfile();
        if (s.activeTab === "address") loadAddresses();
        if (s.activeTab === "wallet") fetchWalletInfo();
    }, [s.activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── actions ── */
    const handleLogout = async () => {
        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                const ud = JSON.parse(stored);
                if (ud.data?.accessToken) await logout(ud.data.accessToken);
            }
        } catch (e) {
            console.error("Logout failed:", e);
        }
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
                alternativeNumber: profileForm.alterMobileNumber,
                whatsappNumber: profileForm.whatsappNumber,
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
            });
            const updatedUser = JSON.parse(JSON.stringify(userData));
            const profile = updatedUser.data?.body || updatedUser;
            profile.firstName = profileForm.firstName;
            profile.lastName = profileForm.lastName;
            profile.email = profileForm.email;
            profile.alterMobileNumber = profileForm.alterMobileNumber;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            patch({ isEditingProfile: false });
        } catch (err) {
            console.error("Failed to save profile:", err);
            alert("Failed to save profile. Please try again.");
        } finally {
            patch({ isSavingProfile: false });
        }
    };

    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            patchAddrForm({});
            patch({ locationError: "Geolocation not supported by your browser." });
            return;
        }
        patch({ isFetchingLocation: true, locationError: "" });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                patchAddrForm({
                    latitude: pos.coords.latitude.toString(),
                    longitude: pos.coords.longitude.toString(),
                });
                patch({ isFetchingLocation: false });
            },
            () => {
                patch({
                    isFetchingLocation: false,
                    locationError: "Unable to fetch location. Please allow access.",
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSaveAddr = async () => {
        const { addrForm, editingAddress } = s;
        const errors: Record<string, string> = {};
        if (!addrForm.flatNo.trim()) errors.flatNo = "Flat / house number is required";
        if (!addrForm.landMark.trim()) errors.landMark = "Landmark is required";
        if (!addrForm.address.trim()) errors.address = "Complete address is required";
        if (!addrForm.pinCode.trim()) errors.pinCode = "PIN code is required";
        if (!addrForm.state.trim()) errors.state = "State is required";
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
                isAddingAddress: false,
                editingAddress: null,
                addrErrors: {},
                addrForm: {
                    flatNo: "", landMark: "", address: "", pinCode: "",
                    state: "", type: "Home", latitude: "", longitude: "",
                    typeDropdownOpen: false,
                },
            });
        } catch (err) {
            console.error("Failed to save address:", err);
            alert("Failed to save address. Please try again.");
        } finally {
            patch({ isAddressLoading: false });
        }
    };

    const handleEditAddress = (addr: Address) => {
        patch({ editingAddress: addr, isAddingAddress: true, addrErrors: {} });
        patchAddrForm({
            flatNo: addr.flatNo,
            landMark: addr.landMark,
            address: addr.address,
            pinCode: addr.pinCode,
            state: addr.state,
            type: addr.type,
            latitude: addr.latitude,
            longitude: addr.longitude,
            typeDropdownOpen: false,
        });
    };

    const cancelAddrForm = () =>
        patch({
            isAddingAddress: false,
            editingAddress: null,
            addrErrors: {},
            addrForm: {
                flatNo: "", landMark: "", address: "", pinCode: "",
                state: "", type: "Home", latitude: "", longitude: "",
                typeDropdownOpen: false,
            },
        });

    const patchProfile = (partial: Partial<PageState["profileForm"]>) =>
        setS((prev) => ({ ...prev, profileForm: { ...prev.profileForm, ...partial } }));

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "info", label: "Profile", icon: User },
        { id: "address", label: "Addresses", icon: MapPin },
        { id: "wallet", label: "Wallet", icon: Wallet },
    ];

    const displayName = user
        ? `${user.data?.body?.firstName || user.firstName || ""}${user.data?.body?.lastName || user.lastName ? ` ${user.data?.body?.lastName || user.lastName}` : ""}`.trim() || "My Account"
        : "My Account";

    return (
        <div className="min-h-screen bg-[#FBF8F3] text-zinc-900">
            <PhysicalGoldHeader
                cartItemCount={0}
            />

            <main className="pt-20 sm:pt-24 pb-12">
                <div className="mx-auto max-w-4xl px-3 sm:px-5 lg:px-8">

                    {/* Back navigation */}
                    <button
                        type="button"
                        onClick={() => navigate("/physical-gold")}
                        className="cursor-pointer mb-5 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-[#2b0a59] group font-semibold"
                    >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white transition group-hover:bg-zinc-50 shadow-sm">
                            <ArrowLeft className="h-3.5 w-3.5" />
                        </span>
                        Back to Store
                    </button>

                    {/* Page header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2b0a59] shadow-xl shadow-purple-900/10 flex-shrink-0">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{displayName}</h1>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                {user?.data?.body?.mobileNumber || user?.data?.body?.email || "Account Management"}
                            </p>
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-1.5 mb-6 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => patch({ activeTab: id, isAddingAddress: false, isEditingProfile: false })}
                                className={[
                                    "cursor-pointer flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest transition-all",
                                    s.activeTab === id
                                        ? "bg-[#2b0a59] text-white shadow-lg shadow-purple-900/10"
                                        : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50",
                                ].join(" ")}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ═══════════════════════════
                        TAB: PROFILE INFO
                    ═══════════════════════════ */}
                    {s.activeTab === "info" && (
                        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    Personal Details
                                </span>
                                {!s.isEditingProfile && !s.isProfileLoading && (
                                    <button
                                        onClick={() => patch({ isEditingProfile: true })}
                                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-600 transition hover:bg-zinc-50 shadow-sm"
                                    >
                                        <Pencil className="h-3 w-3" /> Edit Profile
                                    </button>
                                )}
                            </div>

                            {s.isProfileLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-zinc-200" />
                                </div>
                            ) : (
                                <div className="p-5 sm:p-6 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>First Name <span className="text-rose-500">*</span></label>
                                            <input
                                                readOnly={!s.isEditingProfile}
                                                value={s.profileForm.firstName}
                                                onChange={(e) => patchProfile({ firstName: e.target.value })}
                                                placeholder="e.g. Rahul"
                                                className={`${fieldCls} ${!s.isEditingProfile ? "bg-zinc-50/50 border-zinc-100 text-zinc-500 cursor-default shadow-none" : ""}`}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Last Name</label>
                                            <input
                                                readOnly={!s.isEditingProfile}
                                                value={s.profileForm.lastName}
                                                onChange={(e) => patchProfile({ lastName: e.target.value })}
                                                placeholder="e.g. Sharma"
                                                className={`${fieldCls} ${!s.isEditingProfile ? "bg-zinc-50/50 border-zinc-100 text-zinc-500 cursor-default shadow-none" : ""}`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Email Address</label>
                                        <input
                                            readOnly={!s.isEditingProfile}
                                            value={s.profileForm.email}
                                            onChange={(e) => patchProfile({ email: e.target.value })}
                                            placeholder="rahul@example.com"
                                            className={`${fieldCls} ${!s.isEditingProfile ? "bg-zinc-50/50 border-zinc-100 text-zinc-500 cursor-default shadow-none" : ""}`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Primary Mobile <span className="text-zinc-300 font-bold">(Fixed)</span></label>
                                            <input
                                                readOnly
                                                value={s.profileForm.mobileNumber}
                                                className={`${fieldCls} bg-zinc-50/50 border-zinc-100 text-zinc-400 cursor-not-allowed shadow-none font-bold`}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Alternate Mobile</label>
                                            <input
                                                readOnly={!s.isEditingProfile}
                                                value={s.profileForm.alterMobileNumber}
                                                onChange={(e) => patchProfile({ alterMobileNumber: e.target.value })}
                                                placeholder="Optional secondary number"
                                                className={`${fieldCls} ${!s.isEditingProfile ? "bg-zinc-50/50 border-zinc-100 text-zinc-500 cursor-default shadow-none" : ""}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                        <button
                                            onClick={handleLogout}
                                            className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50/30 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                                        >
                                            <LogOut className="h-3.5 w-3.5" /> Logout Session
                                        </button>

                                        {s.isEditingProfile ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => patch({ isEditingProfile: false })}
                                                    className="cursor-pointer rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 transition hover:bg-zinc-50 shadow-sm"
                                                >
                                                    Discard
                                                </button>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={s.isSavingProfile}
                                                    className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#2b0a59] px-6 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xl shadow-purple-900/10 transition hover:bg-[#150b33] disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {s.isSavingProfile
                                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                                                        : <><CheckCircle2 className="h-3.5 w-3.5" /> Save Changes</>}
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════
                        TAB: ADDRESSES
                    ═══════════════════════════ */}
                    {s.activeTab === "address" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Header / Add Button */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                                    Saved Shipping Locations
                                </h2>
                                {!s.isAddingAddress && (
                                    <button
                                        onClick={() => {
                                            patch({ isAddingAddress: true, editingAddress: null, addrErrors: {} });
                                            patchAddrForm({ flatNo: "", landMark: "", address: "", pinCode: "", state: "", type: "Home", latitude: "", longitude: "", typeDropdownOpen: false });
                                        }}
                                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-[#2b0a59] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-xl shadow-purple-900/10 transition hover:bg-[#150b33]"
                                    >
                                        <Plus className="h-3 w-3" /> Add New Address
                                    </button>
                                )}
                            </div>

                            {/* Add address form */}
                            {s.isAddingAddress && (
                                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                            {s.editingAddress ? "Update Location" : "New Shipping Location"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={cancelAddrForm}
                                            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-600 shadow-sm"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelCls}>Flat / House No. <span className="text-rose-500">*</span></label>
                                                <input value={s.addrForm.flatNo} onChange={(e) => patchAddrForm({ flatNo: e.target.value })} className={fieldCls} placeholder="e.g. 4B" />
                                                {s.addrErrors.flatNo && <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-tight">{s.addrErrors.flatNo}</p>}
                                            </div>
                                            <div>
                                                <label className={labelCls}>Landmark</label>
                                                <input value={s.addrForm.landMark} onChange={(e) => patchAddrForm({ landMark: e.target.value })} className={fieldCls} placeholder="Nearby landmark" />
                                                {s.addrErrors.landMark && <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-tight">{s.addrErrors.landMark}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Complete Address <span className="text-rose-500">*</span></label>
                                            <textarea rows={2} value={s.addrForm.address} onChange={(e) => patchAddrForm({ address: e.target.value })} className={`${fieldCls} resize-none min-h-[80px]`} placeholder="Street, area, city" />
                                            {s.addrErrors.address && <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-tight">{s.addrErrors.address}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelCls}>State <span className="text-rose-500">*</span></label>
                                                <input value={s.addrForm.state} onChange={(e) => patchAddrForm({ state: e.target.value })} className={fieldCls} placeholder="e.g. Telangana" />
                                                {s.addrErrors.state && <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-tight">{s.addrErrors.state}</p>}
                                            </div>
                                            <div>
                                                <label className={labelCls}>PIN Code <span className="text-rose-500">*</span></label>
                                                <input value={s.addrForm.pinCode} onChange={(e) => patchAddrForm({ pinCode: e.target.value })} maxLength={6} className={fieldCls} placeholder="6-digit PIN" />
                                                {s.addrErrors.pinCode && <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-tight">{s.addrErrors.pinCode}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelCls}>Address Type</label>
                                            <div className="flex gap-2">
                                                {(["Home", "Work", "Other"] as const).map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => patchAddrForm({ type: t })}
                                                        className={[
                                                            "cursor-pointer flex-1 rounded-xl border py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
                                                            s.addrForm.type === t
                                                                ? "border-[#2b0a59] bg-purple-50/30 text-[#2b0a59]"
                                                                : "border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200",
                                                        ].join(" ")}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className={labelCls}>Location <span className="text-zinc-300 font-bold">(Optional)</span></label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={fetchCurrentLocation}
                                                    disabled={s.isFetchingLocation}
                                                    className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#2b0a59] shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
                                                >
                                                    {s.isFetchingLocation
                                                        ? <><Loader2 className="h-3 w-3 animate-spin" /> Fetching…</>
                                                        : <><MapPin className="h-3 w-3" /> Use Current Location</>}
                                                </button>
                                                {s.addrForm.latitude && s.addrForm.longitude && (
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">
                                                        ✓ GPS Linked
                                                    </span>
                                                )}
                                            </div>
                                            {s.locationError && <p className="mt-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-tight">{s.locationError}</p>}
                                        </div>

                                        <div className="flex gap-3 pt-4 border-t border-zinc-100">
                                            <button
                                                type="button"
                                                onClick={cancelAddrForm}
                                                className="cursor-pointer flex-1 rounded-full border border-zinc-200 bg-white py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 transition hover:bg-zinc-50 shadow-sm"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveAddr}
                                                disabled={s.isAddressLoading}
                                                className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#2b0a59] py-3 text-[10px] font-black uppercase tracking-wider text-white shadow-xl shadow-purple-900/10 transition hover:bg-[#150b33] disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {s.isAddressLoading
                                                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                                                    : <><CheckCircle2 className="h-3.5 w-3.5" /> {s.editingAddress ? "Update Address" : "Confirm Address"}</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Address List */}
                            {!s.isAddingAddress && (
                                <div className="grid grid-cols-1 gap-3">
                                    {s.isAddressLoading && s.addresses.length === 0 ? (
                                        <div className="flex justify-center py-20 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                                            <Loader2 className="h-8 w-8 animate-spin text-zinc-200" />
                                        </div>
                                    ) : s.addresses.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                                            <MapPin className="mb-3 h-10 w-10 text-zinc-200" />
                                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">No addresses found</p>
                                        </div>
                                    ) : (
                                        s.addresses.map((addr) => {
                                            const Icon = ADDRESS_ICONS[addr.type] || MapPin;
                                            return (
                                                <div
                                                    key={addr.id}
                                                    className="group relative flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#2b0a59]/30 hover:shadow-md"
                                                >
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400 group-hover:bg-purple-50 group-hover:text-[#2b0a59] transition-colors">
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2b0a59]">
                                                                {addr.type}
                                                            </span>
                                                            <div className="h-1 w-1 rounded-full bg-zinc-200" />
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                                                                {addr.state}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-zinc-900 leading-snug">{addr.address}</p>
                                                        <p className="mt-1 text-xs text-zinc-500 font-medium leading-relaxed">
                                                            {[addr.landMark, addr.flatNo].filter(Boolean).join(", ")} — {addr.pinCode}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditAddress(addr)}
                                                            className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-200"
                                                            title="Edit Address"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════
                        TAB: WALLET
                    ═══════════════════════════ */}
                    {s.activeTab === "wallet" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Balance Card */}
                            <div className="relative overflow-hidden rounded-[2rem] bg-[#2b0a59] p-8 text-white shadow-2xl shadow-purple-900/20">
                                <div className="absolute -right-6 -top-6 opacity-10">
                                    <Wallet size={160} />
                                </div>
                                <div className="relative z-10">
                                    <div className="mb-6 flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                                            <Wallet className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
                                            Available Balance
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black tracking-tighter">
                                            {s.isWalletLoading
                                                ? "..."
                                                : formatINR(s.walletBalance)}
                                        </span>
                                    </div>
                                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                            OxyGold Secure Wallet
                                        </p>
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        Recent Activity
                                    </h2>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                                        <History className="h-3 w-3" /> Filter
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                                    {s.isWalletLoading && s.walletTransactions.length === 0 ? (
                                        <div className="flex justify-center py-20">
                                            <Loader2 className="h-8 w-8 animate-spin text-zinc-200" />
                                        </div>
                                    ) : s.walletTransactions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-200">
                                                <History className="h-6 w-6" />
                                            </div>
                                            <p className="text-[11px] font-bold uppercase tracking-tight text-zinc-300">No history found</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-zinc-100">
                                            {s.walletTransactions.map((tx: any) => {
                                                const isCredit = tx.type === "LOAD";
                                                return (
                                                    <div key={tx.transactionId} className="group flex items-center justify-between px-5 py-4 transition hover:bg-zinc-50/50">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${isCredit
                                                                ? "bg-emerald-50 text-emerald-600"
                                                                : "bg-rose-50 text-rose-600"
                                                                }`}>
                                                                <ArrowUpRight className={`h-5 w-5 ${!isCredit ? "rotate-90" : ""}`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[13px] font-bold text-zinc-900">
                                                                    {isCredit ? "Added to Wallet" : "Product Purchase"}
                                                                </p>
                                                                <p className="text-[10px] font-bold uppercase tracking-tight text-zinc-400">
                                                                    {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                                                        day: "2-digit", month: "short", year: "numeric",
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-sm font-black tracking-tight ${isCredit ? "text-emerald-600" : "text-zinc-900"}`}>
                                                                {isCredit ? "+" : "−"}{formatINR(tx.amount)}
                                                            </p>
                                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                                <div className={`h-1 w-1 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                                <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-300">{tx.status}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default ProfilePage;