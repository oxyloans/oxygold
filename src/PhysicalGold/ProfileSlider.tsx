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
    HelpCircle,
    MessageSquare,
    Send,
    Clock,
    CheckCheck,
    Paperclip,
    X,
    AlertTriangle,
    Star,
    ImagePlus,
    Truck,
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
    writeQuery,
    getAllQueries,
    cancelQuery,
    uploadQueryScreenshot,
    createRating,
    updateRating,
    fetchMyRatings,
    fetchRating,
    fetchRatingMedia,
    uploadRatingMedia,
    fetchOrderDeliveryTracking,
    type DeliveryTracking,
    type ProductReview,
    type HelpdeskQuery,
} from "./physicalGoldService";
import { Order, OrderItem } from "./physicalGoldData";
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

const getApiErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

const normaliseAddress = (address: Pick<Address, "flatNo" | "landMark" | "address" | "pinCode" | "state">) =>
    [address.flatNo, address.landMark, address.address, address.pinCode, address.state]
        .map((value) => value.trim().replace(/\s+/g, " ").toLowerCase())
        .join("|");

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

type Tab = "info" | "address" | "wallet" | "orders" | "support";

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
    deliveryTracking: Record<number, DeliveryTracking>;
    trackingLoadingOrderId: number | null;
    trackingErrorOrderId: number | null;
    toast: { message: string; type: ToastType } | null;
    deleteConfirmation: { show: boolean; addressId: string | null };
    // Support/Helpdesk
    queries: HelpdeskQuery[];
    isQueriesLoading: boolean;
    isSubmittingQuery: boolean;
    queryForm: { query: string; comments: string; file: File | null; };
    queryFormErrors: Record<string, string>;
    queryStatusFilter: string;
    showQueryForm: boolean;
    isUploadingFile: boolean;
    cancellingQueryId: number | null;
    profileIncompleteModal: boolean;
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
const REVIEW_TITLE_MIN = 3;
const REVIEW_TEXT_MIN = 10;
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
const REVIEW_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
const REVIEW_RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

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
    const returnTo = searchParams.get("returnTo");

    const [user, setUser] = useState<any>(GET_USER_DATA());
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);
    const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [reviewFile, setReviewFile] = useState<File | null>(null);
    const [reviewError, setReviewError] = useState("");
    const [isSavingReview, setIsSavingReview] = useState(false);

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
        deliveryTracking: {},
        trackingLoadingOrderId: null,
        trackingErrorOrderId: null,
        toast: null,
        deleteConfirmation: { show: false, addressId: null },
        queries: [],
        isQueriesLoading: false,
        isSubmittingQuery: false,
        queryForm: { query: '', comments: '', file: null },
        queryFormErrors: {},
        queryStatusFilter: 'PENDING',
        showQueryForm: false,
        isUploadingFile: false,
        cancellingQueryId: null,
        profileIncompleteModal: false,
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
            const [data, ratingData] = await Promise.all([
                fetchUserOrders(uid),
                fetchMyRatings().catch(() => ({ content: [] as ProductReview[] })),
            ]);
            patch({ orders: data });
            setReviews(ratingData.content || []);
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
        if (s.activeTab === "support") loadQueries();
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
                    await verifyPan({
                        pan: profileForm.panNumber.toUpperCase(),
                        firstName: profileForm.firstName.trim(),
                        lastName: profileForm.lastName.trim(),
                    });
                    patch({ isVerifyingPan: false });
                } catch (panErr: any) {
                    patch({
                        isVerifyingPan: false,
                        isSavingProfile: false,
                        profileErrors: { panNumber: panErr.message || "PAN verification failed" },
                        toast: { message: getApiErrorMessage(panErr, "PAN verification failed. Please check your details."), type: "error" }
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
            profile.whatsappNumber = profileForm.whatsappNumber;
            profile.gender = profileForm.gender;
            profile.panNumber = profileForm.panNumber.toUpperCase();
            profile.panVerified = true;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            patch({ isEditingProfile: false, toast: { message: "Profile updated successfully", type: "success" } });
            if (returnTo === "cart") { setTimeout(() => navigate("/physical-gold/cart"), 800); }
            else if (returnTo === "support") { setTimeout(() => { setSearchParams({ tab: "support" }); patch({ activeTab: "support" }); }, 800); }
        } catch (err) {
            console.error("Failed to save profile:", err);
            const message = getApiErrorMessage(err, "Unable to save profile. Please try again.");
            const profileErrors = /whatsapp/i.test(message)
                ? { whatsappNumber: message }
                : {};
            patch({ profileErrors, toast: { message, type: "error" } });
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
        if (!addrForm.state.trim()) errors.state = "State is required";

        const duplicateAddress = s.addresses.some((savedAddress) =>
            savedAddress.id !== editingAddress?.id &&
            normaliseAddress(savedAddress) === normaliseAddress(addrForm),
        );
        if (duplicateAddress) {
            errors.address = "This address is already saved";
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
            const message = getApiErrorMessage(err, "Failed to save address. Please try again.");
            patch({
                addrErrors: /pin\s*code|pincode|postal/i.test(message) ? { pinCode: message } : {},
                toast: { message, type: "error" },
            });
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
            patch({
                isFetchingLocation: false,
                toast: { message: "Geolocation is not supported by your browser", type: "error" }
            });
            return;
        }

        patch({ isFetchingLocation: true, locationError: "" });
        let completed = false;
        const finish = (updates: Partial<PageState>) => {
            if (completed) return;
            completed = true;
            window.clearTimeout(safetyTimer);
            patch({ ...updates, isFetchingLocation: false });
        };
        const safetyTimer = window.setTimeout(() => {
            finish({
                locationError: "Location request timed out",
                toast: { message: "Location request timed out. Check your device location settings and try again.", type: "error" }
            });
        }, 16000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (completed) return;
                patchAddrForm({
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                });
                finish({
                    locationError: "",
                    toast: { message: "Location captured successfully", type: "success" }
                });
            },
            (error) => {
                console.error("Geolocation error:", error);
                const messages: Record<number, string> = {
                    1: "Location permission was denied. Allow location access in your browser settings.",
                    2: "Your current location is unavailable. Check your device location settings.",
                    3: "Location request timed out. Move to an area with a better GPS signal and try again.",
                };
                const message = messages[error.code] || "Failed to get your current location. Please try again.";
                finish({
                    locationError: message,
                    toast: { message, type: "error" }
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 30000,
            }
        );
    };

    const cancelAddrForm = () =>
        patch({
            isAddingAddress: false, editingAddress: null, addrErrors: {},
            isFetchingLocation: false, locationError: "",
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
            patch({ toast: { message: getApiErrorMessage(err, "Failed to delete address. Please try again."), type: "error" } });
        } finally {
            patch({ isAddressLoading: false });
        }
    };

    const loadDeliveryTracking = async (orderId: number) => {
        if (s.deliveryTracking[orderId] || s.trackingLoadingOrderId === orderId) return;
        const userData = GET_USER_DATA();
        const userId = userData?.data?.userId || userData?.userId;
        if (!userId) return;

        patch({ trackingLoadingOrderId: orderId, trackingErrorOrderId: null });
        try {
            const tracking = await fetchOrderDeliveryTracking(orderId, userId);
            patch({ deliveryTracking: { ...s.deliveryTracking, [orderId]: tracking } });
        } catch (error) {
            console.error("Failed to fetch delivery tracking:", error);
            patch({ trackingErrorOrderId: orderId });
        } finally {
            patch({ trackingLoadingOrderId: null });
        }
    };

    const toggleOrderExpand = (orderId: number) => {
        const isClosing = s.expandedOrderId === orderId;
        patch({ expandedOrderId: isClosing ? null : orderId });
        if (!isClosing) loadDeliveryTracking(orderId);
    };

    const openProductReview = async (item: OrderItem) => {
        const existing = reviews.find((review) => review.productId === item.productId);
        setReviewItem(item);
        setEditingReview(existing || null);
        setReviewRating(existing?.rating || 0);
        setReviewTitle(existing?.title || "");
        setReviewText(existing?.reviewText || "");
        setReviewFile(null);
        setReviewError("");
        if (existing) {
            try {
                const [freshReview, media] = await Promise.all([
                    fetchRating(existing.id),
                    fetchRatingMedia(existing.id).catch(() => existing.media || []),
                ]);
                const completeReview = { ...freshReview, media };
                setEditingReview(completeReview);
                setReviewRating(completeReview.rating);
                setReviewTitle(completeReview.title || "");
                setReviewText(completeReview.reviewText || "");
            } catch {
                setReviewError("We could not refresh this review, but you can still edit the saved version below.");
            }
        }
    };

    const selectReviewFile = (file: File | null) => {
        setReviewError("");
        if (!file) { setReviewFile(null); return; }
        if (!REVIEW_MEDIA_TYPES.includes(file.type)) {
            setReviewFile(null); setReviewError("Use a JPG, PNG, WebP, MP4, or WebM file."); return;
        }
        const maxBytes = file.type.startsWith("video/") ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
        if (file.size > maxBytes) {
            setReviewFile(null); setReviewError(file.type.startsWith("video/") ? "Video must be 50 MB or smaller." : "Image must be 10 MB or smaller."); return;
        }
        setReviewFile(file);
    };

    const closeProductReview = () => {
        if (isSavingReview) return;
        setReviewItem(null); setEditingReview(null); setReviewError("");
    };

    const saveProductReview = async () => {
        if (!reviewItem || reviewRating < 1) { setReviewError("Please select a star rating."); return; }
        if (reviewTitle.trim().length < REVIEW_TITLE_MIN) { setReviewError(`Review title must be at least ${REVIEW_TITLE_MIN} characters.`); return; }
        if (reviewText.trim().length < REVIEW_TEXT_MIN) { setReviewError(`Review must be at least ${REVIEW_TEXT_MIN} characters.`); return; }
        const orderItemId = reviewItem.orderItemId ?? reviewItem.id;
        if (!editingReview && !orderItemId) { setReviewError("Order item information is unavailable. Refresh My Orders and try again."); return; }
        try {
            setIsSavingReview(true); setReviewError("");
            const saved = editingReview
                ? await updateRating(editingReview.id, { rating: reviewRating, title: reviewTitle.trim(), reviewText: reviewText.trim() })
                : await createRating({ orderItemId: orderItemId!, rating: reviewRating, title: reviewTitle.trim(), reviewText: reviewText.trim() });
            let mediaUploadFailed = false;
            if (reviewFile) {
                try { await uploadRatingMedia(saved.id, reviewFile, saved.media?.length || 0); }
                catch { mediaUploadFailed = true; }
            }
            const refreshed = await fetchMyRatings().catch(() => null);
            setReviews(refreshed?.content || [saved, ...reviews.filter((review) => review.id !== saved.id)]);
            setReviewItem(null); setEditingReview(null);
            patch({ toast: { message: mediaUploadFailed ? "Review saved, but the media upload failed. You can edit the review and try again." : editingReview ? "Review updated successfully" : "Thank you! Your review was submitted for moderation.", type: mediaUploadFailed ? "error" : "success" } });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to save your review.";
            setReviewError(message.includes("has not been delivered") ? "You can review this product after the order has been delivered." : message);
        } finally { setIsSavingReview(false); }
    };

    const loadQueries = useCallback(async (statusOverride?: string) => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId;
        if (!uid) return;
        patch({ isQueriesLoading: true });
        try {
            const res = await getAllQueries({
                userId: uid,
                queryStatus: statusOverride ?? s.queryStatusFilter,
                page: 0,
                size: 20,
            });
            const queries = Array.isArray(res?.data)
                ? res.data
                : res?.data?.content || res?.content || [];
            patch({ queries });
        } catch (err) {
            console.error('Failed to fetch queries:', err);
        } finally {
            patch({ isQueriesLoading: false });
        }
    }, [patch, s.queryStatusFilter]);

    const handleSubmitQuery = async () => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId;
        if (!uid) return;

        const errors: Record<string, string> = {};
        const query = s.queryForm.query.trim();
        if (!s.profileForm.email?.trim()) errors.email = 'Email is required.';
        else if (!validateEmail(s.profileForm.email)) errors.email = 'Enter a valid email address.';
        if (!s.profileForm.mobileNumber?.trim()) errors.mobileNumber = 'Mobile number is required.';
        else if (!validateMobileNumber(s.profileForm.mobileNumber)) errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
        if (!query) errors.query = 'Please describe your issue or question.';
        else if (query.length < 10) errors.query = 'Query must contain at least 10 characters.';

        if (Object.keys(errors).length > 0) {
            patch({ queryFormErrors: errors, toast: { message: 'Please correct the highlighted fields.', type: 'error' } });
            return;
        }

        patch({ isSubmittingQuery: true, queryFormErrors: {} });
        try {
            const result = await writeQuery({
                userId: uid,
                query,
                email: s.profileForm.email,
            });

            let attachmentUploaded = true;
            if (s.queryForm.file) {
                patch({ isUploadingFile: true });
                try {
                    // The upload API calls this queryId, but it expects writeQuery's ticketId.
                    await uploadQueryScreenshot(uid, result.ticketId, s.queryForm.file);
                } catch (uploadErr) {
                    console.error('File upload failed:', uploadErr);
                    attachmentUploaded = false;
                } finally {
                    patch({ isUploadingFile: false });
                }
            }

            patch({
                queryForm: { query: '', comments: '', file: null },
                queryFormErrors: {},
                showQueryForm: false,
                queryStatusFilter: 'PENDING',
                toast: attachmentUploaded
                    ? { message: s.queryForm.file ? `Query ${result.randomTicketId || `#${result.ticketId}`} and attachment submitted successfully!` : `Query ${result.randomTicketId || `#${result.ticketId}`} submitted successfully!`, type: 'success' }
                    : { message: 'Query submitted, but the attachment could not be uploaded. Please keep your ticket number and try again later.', type: 'error' },
            });
            // Newly raised queries are pending, so refresh that list explicitly.
            await loadQueries('PENDING');
        } catch (err) {
            console.error('Failed to submit query:', err);
            patch({ toast: { message: getApiErrorMessage(err, 'Failed to submit query. Please try again.'), type: 'error' } });
        } finally {
            patch({ isSubmittingQuery: false });
        }
    };

    const handleCancelQuery = async (queryId: number) => {
        const userData = GET_USER_DATA();
        const uid = userData?.data?.userId;
        if (!uid) return;

        patch({ cancellingQueryId: queryId });
        try {
            await cancelQuery(queryId, uid);
            patch({ toast: { message: 'Query cancelled successfully.', type: 'success' } });
            await loadQueries();
        } catch (err) {
            console.error('Failed to cancel query:', err);
            patch({ toast: { message: getApiErrorMessage(err, 'Failed to cancel query. Please try again.'), type: 'error' } });
        } finally {
            patch({ cancellingQueryId: null });
        }
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
        { id: "support", label: "Contact Support", icon: HelpCircle },
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

            <main className="pt-28 sm:pt-36 pb-12 sm:pb-20 max-w-5xl mx-auto px-3 sm:px-6">

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
                <div className="bg-white border border-[#E8E0D5] rounded-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1 shadow-sm">
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
                    {s.activeTab === 'info' && (
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
                    )}
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
                                                        if (id === "support") {
                                            const p = s.profileForm;
                                            const isProfileFilled = p.firstName.trim() && p.lastName.trim() && p.email.trim() && p.mobileNumber.trim();
                                            if (!isProfileFilled) {
                                                patch({ profileIncompleteModal: true });
                                                return;
                                            }
                                        }
                                        setSearchParams({ tab: id });
                                        patch({ activeTab: id, isAddingAddress: false, isEditingProfile: false });
                                    }}
                                    className={`flex items-center gap-1.5 px-4 py-3.5 text-[13px] font-medium border-b-2 transition-all shrink-0 ${isActive ? "border-[#8B6914] text-[#8B6914]" : "border-transparent text-[#8A8A8A] hover:text-[#1A1A1A]"}`}
                                >
                                    <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.5 : 1.8} />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── PROFILE TAB ── */}
                    {s.activeTab === "info" && (
                        <div className="p-4 sm:p-6">
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
                                <div className="border border-[#E8E0D5] rounded-xl p-4 sm:p-5 mb-5 space-y-4 bg-[#FAFAF8]">
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
                                                    const newErrors = { ...s.addrErrors };
                                                    if (formatted.length === 6 && validatePincode(formatted)) {
                                                        delete newErrors.pinCode;
                                                    } else if (formatted.length > 0) {
                                                        newErrors.pinCode = "Pin code must contain 6 digits";
                                                    }
                                                    patch({ addrErrors: newErrors });
                                                }}
                                                onBlur={() => {
                                                    if (!validatePincode(s.addrForm.pinCode)) {
                                                        patch({ addrErrors: { ...s.addrErrors, pinCode: "Pin code must contain 6 digits" } });
                                                    }
                                                }}
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder="6-digit pin code"
                                                className={`${inputCls} ${s.addrErrors.pinCode ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            />
                                            {s.addrErrors.pinCode && <p className="text-[11px] text-rose-500 mt-1">{s.addrErrors.pinCode}</p>}
                                        </div>
                                        <div>
                                            <label className={labelCls}>State</label>
                                            <input
                                                value={s.addrForm.state}
                                                onChange={(e) => {
                                                    patchAddrForm({ state: e.target.value });
                                                    if (s.addrErrors.state && e.target.value.trim()) {
                                                        const newErrors = { ...s.addrErrors };
                                                        delete newErrors.state;
                                                        patch({ addrErrors: newErrors });
                                                    }
                                                }}
                                                className={`${inputCls} ${s.addrErrors.state ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10" : ""}`}
                                            />
                                            {s.addrErrors.state && <p className="text-[11px] text-rose-500 mt-1">{s.addrErrors.state}</p>}
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
                                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
                                        <button onClick={cancelAddrForm} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#8A8A8A] hover:bg-[#F5F2EE] transition">Cancel</button>
                                        <button onClick={handleSaveAddr} disabled={s.isAddressLoading} className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition disabled:opacity-60">
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
                                        const tracking = s.deliveryTracking[order.orderId];
                                        const isTrackingLoading = s.trackingLoadingOrderId === order.orderId;
                                        const trackingUnavailable = s.trackingErrorOrderId === order.orderId;
                                        return (
                                            <div key={order.orderId} className="border border-[#E8E0D5] rounded-xl overflow-hidden bg-white">
                                                {/* Order Header */}
                                                {/* Order Header */}
                                                <div className="flex items-start gap-3 px-4 py-4">
                                                    <div className="h-10 w-10 rounded-xl bg-[#F5EDD6] flex items-center justify-center text-[#8B6914] shrink-0 mt-0.5">
                                                        <Package className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <p className="text-[12px] font-semibold text-[#1A1A1A] truncate">Order #{order.orderNumber}</p>
                                                                <p className="text-[11px] text-[#8A8A8A] mt-0.5">{formatDate(order.paymentExpiry)}</p>
                                                            </div>
                                                            <span className="text-[14px] font-bold text-[#1A1A1A] shrink-0">{DISPLAY_INR(order.totalAmount)}</span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(order.orderStatus)}`}>
                                                                Order: {order.orderStatus}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(order.paymentStatus)}`}>
                                                                Payment: {order.paymentStatus}
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
                                                            {isExp ? "Hide Details" : "Track Order"}
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

                                                        {isTrackingLoading ? (
                                                            <div className="flex items-center gap-2 rounded-xl border border-[#E8E0D5] bg-white px-4 py-3 text-[12px] text-[#8A8A8A]">
                                                                <Loader2 className="h-4 w-4 animate-spin text-[#8B6914]" /> Loading delivery updates...
                                                            </div>
                                                        ) : tracking ? (
                                                            <section className="rounded-xl border border-[#E8E0D5] bg-white p-4" aria-label="Delivery tracking">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex min-w-0 items-start gap-2.5">
                                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5EDD6] text-[#8B6914]"><Truck className="h-4 w-4" /></div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-[13px] font-semibold text-[#1A1A1A]">{tracking.statusLabel || "Delivery update"}</p>
                                                                            <p className="mt-0.5 text-[11px] leading-4 text-[#6D6D6D]">{tracking.statusDescription || "We will keep you updated as your order moves."}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{tracking.statusLabel || tracking.status}</span>
                                                                </div>

                                                                <div className="mt-3 grid gap-2 border-y border-[#F0EBE1] py-3 text-[11px] sm:grid-cols-2">
                                                                    <p className="text-[#8A8A8A]">Tracking ID <span className="ml-1 font-semibold text-[#1A1A1A]">{tracking.trackingNumber || "—"}</span></p>
                                                                    {tracking.deliveryBoy && <p className="text-[#8A8A8A]">Delivery partner <span className="ml-1 font-semibold text-[#1A1A1A]">{`${tracking.deliveryBoy.firstName || ""} ${tracking.deliveryBoy.lastName || ""}`.trim() || "Assigned"}{tracking.deliveryBoy.vehicleNumber ? ` · ${tracking.deliveryBoy.vehicleNumber}` : ""}</span></p>}
                                                                    {tracking.deliveryAddress && <p className="flex items-start gap-1.5 text-[#8A8A8A] sm:col-span-2"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#8B6914]" /><span className="leading-4">Delivering to {tracking.deliveryAddress}</span></p>}
                                                                </div>

                                                                {tracking.timeline?.length ? (
                                                                    <ol className="mt-3 space-y-3">
                                                                        {tracking.timeline.map((event, index) => (
                                                                            <li key={`${event.status}-${event.timestamp}`} className="relative flex gap-3 pl-1">
                                                                                {index < tracking.timeline!.length - 1 && <span className="absolute left-[7px] top-4 h-[calc(100%+2px)] w-px bg-[#E8E0D5]" />}
                                                                                <CheckCircle2 className="relative z-10 mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                                                                <div className="min-w-0"><p className="text-[11px] font-semibold text-[#1A1A1A]">{event.statusLabel}</p><p className="mt-0.5 text-[11px] leading-4 text-[#8A8A8A]">{event.description}</p><p className="mt-1 text-[10px] text-[#A39A8E]">{formatDate(event.timestamp)}</p></div>
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                ) : null}
                                                            </section>
                                                        ) : trackingUnavailable ? (
                                                            <div className="rounded-xl border border-[#E8E0D5] bg-white px-4 py-3 text-[12px] text-[#6D6D6D]">Delivery tracking will appear here once your order is assigned for delivery.</div>
                                                        ) : null}

                                                        {order.items?.map((item: any, i: number) => {
                                                            const existingReview = reviews.find((r) => r.productId === item.productId);
                                                            return (
                                                            <div key={i} className="bg-white border border-[#E8E0D5] rounded-xl px-4 py-3.5">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="h-9 w-9 rounded-lg bg-[#F5EDD6] flex items-center justify-center text-[#8B6914] shrink-0 mt-0.5">
                                                                        <Package className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <p className="text-[13px] font-semibold text-[#1A1A1A] leading-snug">
                                                                                {item.productName || `Product #${item.productId}`}
                                                                            </p>
                                                                            <p className="text-[13px] font-semibold text-[#1A1A1A] shrink-0">{DISPLAY_INR(item.subtotal)}</p>
                                                                        </div>
                                                                        {item.variant && (
                                                                            <p className="text-[11px] text-[#8B6914] font-medium mt-0.5">{item.variant}</p>
                                                                        )}
                                                                        <p className="text-[11px] text-[#8A8A8A] mt-0.5">
                                                                            Qty: {item.quantity} · {DISPLAY_INR(item.price)} per pc
                                                                        </p>
                                                                        <div className="mt-2 flex items-center justify-between gap-2">
                                                                            {existingReview && (
                                                                            <div className="flex items-center gap-0.5">
                                                                                {[1,2,3,4,5].map((star) => (
                                                                                    <Star key={star} className="h-3.5 w-3.5"
                                                                                        fill={star <= existingReview.rating ? "#F5B301" : "none"}
                                                                                        stroke={star <= existingReview.rating ? "#F5B301" : "#D1C7BB"}
                                                                                    />
                                                                                ))}
                                                                                <span className="ml-1.5 text-[11px] text-[#8A8A8A] font-medium">{REVIEW_RATING_LABELS[existingReview.rating]}</span>
                                                                            </div>
                                                                            )}
                                                                            {order.orderStatus?.toUpperCase() === "DELIVERED" && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openProductReview(item)}
                                                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B6914] hover:text-[#5f470d] shrink-0"
                                                                                >
                                                                                    <Star className="h-3 w-3" fill={existingReview ? "#F5B301" : "none"} stroke="#8B6914" />
                                                                                    {existingReview ? "Edit rating" : "Rate product"}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            );
                                                        })}

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
                    {/* ── SUPPORT TAB ── */}
                    {s.activeTab === "support" && (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Help & Support</h3>
                                {!s.showQueryForm && (
                                    <button
                                        onClick={() => patch({ showQueryForm: true, queryFormErrors: {} })}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8B6914] text-white text-[11px] font-medium hover:bg-[#7A5C10] transition"
                                    >
                                        <Plus className="h-3 w-3" strokeWidth={2.5} /> New Query
                                    </button>
                                )}
                            </div>

                            {/* Status Filter */}
                            {!s.showQueryForm && (
                                <div className="mb-5 max-w-xs">
                                    <label htmlFor="query-status" className={labelCls}>Query status</label>
                                    <div className="relative">
                                        <select
                                            id="query-status"
                                            value={s.queryStatusFilter}
                                            onChange={(event) => {
                                                const status = event.target.value;
                                                patch({ queryStatusFilter: status, queries: [] });
                                                loadQueries(status);
                                            }}
                                            className={`${inputCls} appearance-none pr-9 font-medium cursor-pointer`}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]" />
                                    </div>
                                </div>
                            )}

                            {/* New Query Form */}
                            {s.showQueryForm && (
                                <div className="border border-[#E8E0D5] rounded-xl p-5 mb-5 space-y-4 bg-[#FAFAF8]">
                                    <h4 className="text-[13px] font-semibold text-[#1A1A1A]">Submit a New Query</h4>

                                    {/* Auto-filled contact info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelCls}>Email <span className="text-rose-500">*</span></label>
                                            <input
                                                type="email"
                                                value={s.profileForm.email || ''}
                                                disabled={!!s.profileForm.email && validateEmail(s.profileForm.email)}
                                                onChange={(e) => {
                                                    patchProfile({ email: e.target.value });
                                                    patch({ queryFormErrors: { ...s.queryFormErrors, email: '' } });
                                                }}
                                                placeholder="Enter your email"
                                                className={`${inputCls} ${s.profileForm.email && validateEmail(s.profileForm.email) ? 'bg-[#F5F2EE] cursor-not-allowed opacity-70' : !s.profileForm.email ? 'border-amber-300 focus:border-amber-500' : ''}`}
                                            />
                                            {s.queryFormErrors.email && <p className="text-[11px] text-rose-500 mt-1">{s.queryFormErrors.email}</p>}
                                        </div>
                                        <div>
                                            <label className={labelCls}>Mobile Number <span className="text-rose-500">*</span></label>
                                            <input
                                                type="tel"
                                                value={s.profileForm.mobileNumber || ''}
                                                disabled={!!s.profileForm.mobileNumber && validateMobileNumber(s.profileForm.mobileNumber)}
                                                onChange={(e) => {
                                                    const val = formatMobileNumber(e.target.value);
                                                    if (val.length <= 10) {
                                                        patchProfile({ mobileNumber: val });
                                                        patch({ queryFormErrors: { ...s.queryFormErrors, mobileNumber: '' } });
                                                    }
                                                }}
                                                placeholder="Enter 10-digit mobile number"
                                                maxLength={10}
                                                className={`${inputCls} ${s.profileForm.mobileNumber && validateMobileNumber(s.profileForm.mobileNumber) ? 'bg-[#F5F2EE] cursor-not-allowed opacity-70' : !s.profileForm.mobileNumber ? 'border-amber-300 focus:border-amber-500' : ''}`}
                                            />
                                            {s.queryFormErrors.mobileNumber && <p className="text-[11px] text-rose-500 mt-1">{s.queryFormErrors.mobileNumber}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Your Query <span className="text-rose-500">*</span></label>
                                        <textarea
                                            value={s.queryForm.query}
                                            onChange={(e) => patch({
                                                queryForm: { ...s.queryForm, query: e.target.value },
                                                queryFormErrors: { ...s.queryFormErrors, query: '' },
                                            })}
                                            placeholder="Describe your issue or question..."
                                            className={`${inputCls} resize-none`}
                                            rows={3}
                                        />
                                        {s.queryFormErrors.query && <p className="text-[11px] text-rose-500 mt-1">{s.queryFormErrors.query}</p>}
                                    </div>

                                    {/* File Upload (optional) */}
                                    <div>
                                        <label className={labelCls}>Attach Screenshot <span className="text-[#BEB5AA]">(optional)</span></label>
                                        {s.queryForm.file ? (
                                            <div className="flex items-center gap-2 px-3 py-2 border border-[#E8E0D5] rounded-lg bg-white">
                                                <Paperclip className="h-3.5 w-3.5 text-[#8B6914] shrink-0" />
                                                <span className="text-[12px] text-[#1A1A1A] flex-1 truncate">{s.queryForm.file.name}</span>
                                                <button
                                                    onClick={() => patch({ queryForm: { ...s.queryForm, file: null } })}
                                                    className="text-[#8A8A8A] hover:text-rose-500 transition"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-[#E8E0D5] rounded-lg bg-white cursor-pointer hover:border-[#8B6914] transition">
                                                <Paperclip className="h-3.5 w-3.5 text-[#8A8A8A]" />
                                                <span className="text-[12px] text-[#8A8A8A]">Click to attach a file</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        if (!file) return;
                                                        const allowed = file.type.startsWith('image/');
                                                        if (!allowed) {
                                                            patch({ queryFormErrors: { ...s.queryFormErrors, file: 'Only image files are allowed.' } });
                                                            e.target.value = '';
                                                            return;
                                                        }
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            patch({ queryFormErrors: { ...s.queryFormErrors, file: 'Attachment must be 5 MB or smaller.' } });
                                                            e.target.value = '';
                                                            return;
                                                        }
                                                        patch({
                                                            queryForm: { ...s.queryForm, file },
                                                            queryFormErrors: { ...s.queryFormErrors, file: '' },
                                                        });
                                                    }}
                                                />
                                            </label>
                                        )}
                                        {s.queryFormErrors.file && <p className="text-[11px] text-rose-500 mt-1">{s.queryFormErrors.file}</p>}
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button
                                            onClick={() => patch({ showQueryForm: false, queryForm: { query: '', comments: '', file: null }, queryFormErrors: {} })}
                                            className="px-4 py-2 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#8A8A8A] hover:bg-[#F5F2EE] transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmitQuery}
                                            disabled={s.isSubmittingQuery || s.isUploadingFile}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition disabled:opacity-60"
                                        >
                                            {s.isUploadingFile ? (
                                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                                            ) : s.isSubmittingQuery ? (
                                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...</>
                                            ) : (
                                                <><Send className="h-3.5 w-3.5" /> Submit Query</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Queries List */}
                            {!s.showQueryForm && (s.isQueriesLoading ? (
                                <div className="flex items-center justify-center py-16 gap-2 text-[#8A8A8A]">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-[12px]">Loading queries...</span>
                                </div>
                            ) : s.queries.length === 0 ? (
                                <div className="text-center py-16">
                                    <MessageSquare className="h-8 w-8 text-[#D1C7BB] mx-auto mb-3" />
                                    <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">No queries yet</p>
                                    <p className="text-[12px] text-[#8A8A8A]">Submit a query and our team will get back to you</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {s.queries.map((q) => (
                                        <div key={q.id} className="border border-[#E8E0D5] rounded-xl bg-white overflow-hidden">
                                            <div className="px-4 py-4">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
                                                            #{q.randomTicketId || q.ticketId}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                            q.queryStatus === 'COMPLETED'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : q.queryStatus === 'PENDING'
                                                                ? 'bg-amber-50 text-amber-700'
                                                                : q.queryStatus === 'CANCELLED'
                                                                ? 'bg-rose-50 text-rose-700'
                                                                : 'bg-blue-50 text-blue-700'
                                                        }`}>
                                                            {q.queryStatus}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-[#8A8A8A] shrink-0">
                                                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] font-medium text-[#1A1A1A] mb-1">{q.query}</p>
                                                {q.comments && (
                                                    <p className="text-[12px] text-[#8A8A8A]">{q.comments}</p>
                                                )}
                                                {q.resolvedBy && (
                                                    <div className="mt-3 pt-3 border-t border-[#F0EBE1] flex items-center gap-2">
                                                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                        <p className="text-[12px] text-emerald-700 font-medium">Cancelled by {q.resolvedBy}</p>
                                                    </div>
                                                )}
                                                {/* User Documents */}
                                                {q.userDocuments?.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-[#F0EBE1]">
                                                        <p className="text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-wider mb-2">Attachments</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {q.userDocuments.map((doc: any) => {
                                                                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(doc.fileName || '');
                                                                return (
                                                                    <a
                                                                        key={doc.userDocumentId}
                                                                        href={doc.filePath}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="group relative"
                                                                    >
                                                                        {isImage ? (
                                                                            <div className="h-16 w-16 rounded-lg border border-[#E8E0D5] overflow-hidden bg-[#F5F2EE]">
                                                                                <img
                                                                                    src={doc.filePath}
                                                                                    alt={doc.fileName}
                                                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E0D5] rounded-lg bg-white hover:bg-[#F5F2EE] transition">
                                                                                <Paperclip className="h-3 w-3 text-[#8A8A8A]" />
                                                                                <span className="text-[11px] text-[#1A1A1A] max-w-[100px] truncate">{doc.fileName}</span>
                                                                            </div>
                                                                        )}
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                {q.queryStatus?.toUpperCase() === 'PENDING' && (
                                                    <div className="mt-3 pt-3 border-t border-[#F0EBE1]">
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCancelQuery(q.id)}
                                                                disabled={s.cancellingQueryId === q.id}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-60"
                                                            >
                                                                {s.cancellingQueryId === q.id
                                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    : <X className="h-3.5 w-3.5" />}
                                                                Cancel Query
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {q.userPendingQueries?.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-[#F0EBE1] space-y-2">
                                                        {q.userPendingQueries.map((pq) => (
                                                            <div key={pq.id} className="bg-[#FAFAF8] rounded-lg px-3 py-2">
                                                                <p className="text-[12px] text-[#1A1A1A]">{pq.message || pq.pendingComments}</p>
                                                                <p className="text-[10px] text-[#8A8A8A] mt-1">{pq.createdAt}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {reviewItem && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 sm:items-center sm:p-4" onMouseDown={closeProductReview}>
                    <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-5" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="review-title">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 id="review-title" className="text-[18px] font-semibold text-[#1A1A1A]">{editingReview ? "Edit your review" : "Write a product review"}</h3>
                                <p className="mt-1 text-[12px] text-[#8A8A8A]">Help other customers make a confident choice.</p>
                            </div>
                            <button type="button" onClick={closeProductReview} aria-label="Close review form" className="rounded-lg p-1 text-[#8A8A8A] hover:bg-[#F5F2EE]"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-3 rounded-lg border border-[#EFE7DC] bg-[#FCFAF7] px-3 py-2">
                            <p className="truncate text-[13px] font-semibold text-[#1A1A1A]">{reviewItem.productName || `Product #${reviewItem.productId}`}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Verified purchase</p>
                        </div>
                        <div className="my-3 text-center" aria-label="Choose rating">
                            <p className="mb-1 text-[11px] font-semibold text-[#4A443E]">How would you rate this product?</p>
                            <div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((value) => (
                                <button type="button" key={value} onClick={() => { setReviewRating(value); setReviewError(""); }} aria-label={`${value} star${value > 1 ? "s" : ""}`} className="rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30">
                                    <Star className="h-7 w-7 transition-transform hover:scale-110" fill={value <= reviewRating ? "#F5B301" : "none"} stroke={value <= reviewRating ? "#F5B301" : "#D1C7BB"} />
                                </button>
                            ))}</div>
                            <p className={`mt-1 min-h-4 text-[11px] font-semibold ${reviewRating ? "text-[#8B6914]" : "text-[#A59B90]"}`}>{reviewRating ? REVIEW_RATING_LABELS[reviewRating] : "Tap a star to rate"}</p>
                        </div>
                        <label className={labelCls}>Add a headline <span className="text-rose-500">*</span></label>
                        <input value={reviewTitle} onChange={(event) => { setReviewTitle(event.target.value); setReviewError(""); }} minLength={REVIEW_TITLE_MIN} maxLength={80} placeholder="What stood out most?" className={inputCls} />
                        <p className="mb-2 mt-0.5 flex justify-between text-[9px] text-[#8A8A8A]"><span>Minimum {REVIEW_TITLE_MIN} characters</span><span>{reviewTitle.length}/80</span></p>
                        <label className={labelCls}>Share your experience <span className="text-rose-500">*</span></label>
                        <textarea value={reviewText} onChange={(event) => { setReviewText(event.target.value); setReviewError(""); }} minLength={REVIEW_TEXT_MIN} maxLength={1000} rows={3} placeholder="Share your experience with quality, fit and packaging" className={`${inputCls} resize-none`} />
                        <p className="mt-0.5 flex justify-between text-[9px] text-[#8A8A8A]"><span>Minimum {REVIEW_TEXT_MIN} characters</span><span>{reviewText.length}/1000</span></p>
                        <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#D1C7BB] px-3 py-3 text-[12px] font-medium text-[#6B6B6B] hover:bg-[#FAFAF8]">
                            <ImagePlus className="h-4 w-4 text-[#8B6914]" />
                            <span className="min-w-0 truncate">{reviewFile ? reviewFile.name : "Add photo or video (optional)"}</span>
                            <input type="file" accept=".jpg,.jpeg,.png,.webp,.mp4,.webm" className="hidden" onChange={(event) => selectReviewFile(event.target.files?.[0] || null)} />
                        </label>
                        {reviewFile && <button type="button" onClick={() => setReviewFile(null)} className="mt-2 text-[11px] font-semibold text-rose-600 hover:underline">Remove selected file</button>}
                        <p className="mt-1 text-[10px] text-[#8A8A8A]">Images up to 10 MB · Videos up to 50 MB</p>
                        {reviewError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-600">{reviewError}</p>}
                        <button type="button" onClick={saveProductReview} disabled={isSavingReview} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#8B6914] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#7A5C10] disabled:opacity-60">
                            {isSavingReview && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isSavingReview ? "Saving..." : editingReview ? "Update review" : "Submit review"}
                        </button>
                        <p className="mt-1 text-center text-[9px] text-[#8A8A8A]">Your review will be visible after moderation.</p>
                    </div>
                </div>
            )}

            {/* Profile Incomplete Modal */}
            {s.profileIncompleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Complete Your Profile</h3>
                        </div>
                        <p className="text-[13px] text-[#6B6B6B] mb-5 leading-relaxed">
                            We need your profile details (name, email, mobile) before you can raise a support query.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => patch({ profileIncompleteModal: false })}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-[#E8E0D5] text-[12px] font-medium text-[#6B6B6B] hover:bg-[#F5F2EE] transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    patch({ profileIncompleteModal: false, activeTab: "info", isEditingProfile: true });
                                    setSearchParams({ tab: "info", returnTo: "support" });
                                }}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition"
                            >
                                Complete Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
