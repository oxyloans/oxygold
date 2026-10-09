import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    AlertTriangle,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Loader2,
    MapPin,
    Shield,
    ShoppingBag,
    Sparkles,
    Trash2,
    Wallet,
    X,
    ArrowLeft,
    Coins,
    Tag,
    CheckCircle2,
    Plus,
    PartyPopper,
    Gem,
    Pencil,
    Clock,
    Calendar,
    Layers,
    ShoppingCart,
} from "lucide-react";

import { motion } from "framer-motion";
import { load } from "@cashfreepayments/cashfree-js";
import { QuantitySelector } from "./components/ui/QuantitySelector";
import { useCart } from "./CartContext";
import {
    fetchAddresses,
    createOrder,
    fetchWalletBalance,
    confirmOrder,
    getUserProfile,
    fetchGoldSilverRateBreakdown,
    GoldSilverRateBreakdown
} from "./physicalGoldService";

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
    latitude: string;
    longitude: string;
}

interface PageState {
    addresses: Address[];
    selectedAddressId: string;
    paymentMode: "WALLET" | "CASHFREE" | "COD";
    walletBalance: number | null;
    loadingAddresses: boolean;
    loadingCheckout: boolean;
    orderSuccess: { orderNumber: string } | null;
    incrementingId: string | null;
    decrementingId: string | null;
    cartError: string;
    walletConfirmOpen: boolean;
    removeConfirmVariantId: string | null;
    confirmOrderModalOpen: boolean;
    orderId: string | number | null;
    paymentSessionId: string | null;
    txnId: string | null;
    profileReminderOpen: boolean;
    checkoutStep: "cart" | "checkout";
    successModalOpen: boolean;
}

/* ────────────────────────────────────────────────────────── */
/*  Helper Functions                                          */
/* ────────────────────────────────────────────────────────── */

const formatINR = (v: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(v);

/* ────────────────────────────────────────────────────────── */
/*  Confirmation Modal                                        */
/* ────────────────────────────────────────────────────────── */
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    confirmClassName?: string;
    loading?: boolean;
}

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderNumber: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen, onClose, onConfirm, title, description, confirmLabel, confirmClassName, loading,
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-xl border border-[#E8E0D5] bg-white shadow-2xl overflow-hidden">
                <div className="px-5 py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-[#E8E0D5] bg-[#F5F2EE] text-[#8A8A8A] transition hover:bg-[#EDE9E2]"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <h3 className="text-[14px] font-semibold text-[#1A1A1A] leading-snug pt-1">{title}</h3>
                    </div>
                    <div className="mb-5 pl-12 text-[13px] text-[#6B6B6B] leading-relaxed">{description}</div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer flex-1 rounded-lg border border-[#E8E0D5] bg-white px-4 py-2 text-[12px] font-medium text-[#6B6B6B] transition hover:bg-[#F5F2EE]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={onConfirm}
                            className={`cursor-pointer flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[12px] font-medium transition disabled:opacity-60 ${confirmClassName ?? "bg-[#8B6914] text-white hover:bg-[#7A5C10]"}`}
                        >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SuccessModal: React.FC<SuccessModalProps> = (props) => {
    if (!props.isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative w-full max-w-sm rounded-xl border border-[#E8E0D5] bg-white shadow-2xl overflow-hidden">
                <div className="px-5 py-5">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Shield className="h-4 w-4" />
                        </div>
                        <h3 className="text-[14px] font-semibold text-[#1A1A1A] leading-snug pt-1">Order Confirmed</h3>
                    </div>
                    <div className="mb-5 pl-12 text-[13px] text-[#6B6B6B] leading-relaxed">
                        Your order has been confirmed successfully.
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={props.onClose}
                            className="cursor-pointer flex-1 rounded-lg border border-[#E8E0D5] bg-white px-4 py-2 text-[12px] font-medium text-[#6B6B6B] transition hover:bg-[#F5F2EE]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────────────── */
/*  Coupon Countdown Timer Component                          */
/* ────────────────────────────────────────────────────────── */
const CouponCountdown: React.FC<{ endDateTime?: string }> = ({ endDateTime }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        if (!endDateTime) return;

        const updateTimer = () => {
            let parseableStr = endDateTime;
            if (
                endDateTime.includes("T") &&
                !endDateTime.endsWith("Z") &&
                !endDateTime.includes("+") &&
                !endDateTime.slice(10).includes("-")
            ) {
                parseableStr = endDateTime + "Z";
            }
            const target = new Date(parseableStr).getTime();
            const now = new Date().getTime();
            const diff = target - now;

            if (isNaN(target) || diff <= 0) {
                setTimeLeft("Expired");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`);
            } else {
                setTimeLeft(`${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endDateTime]);

    if (!timeLeft || timeLeft === "Expired") return null;

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/80 text-[11px] font-extrabold shrink-0">
            <Clock size={11} className="text-rose-500" />
            Ends in {timeLeft}
        </span>
    );
};

/* ────────────────────────────────────────────────────────── */
/*  CartPage                                                  */
/* ────────────────────────────────────────────────────────── */
const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        cartItems,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        totalItems,
        cartSubtotal,
        totalGstCharges,
        totalMakingCharges,
        totalPayableAmount,
        deliveryFee,
        deliveryDistanceKm,
        ratePerKm,
        totalDiscountAmount,
        totalDiscountPercentage,
        cartNotification,
        dismissCartNotification,
        appliedCoupon,
        availableCoupons,
        isCouponsLoading,
        couponDiscountAmount,
        loadAvailableCoupons,
        applyCoupon,
        removeAppliedCoupon,
    } = useCart();

    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [showAvailableList, setShowAvailableList] = useState(true);
    const [expandedCouponId, setExpandedCouponId] = useState<number | string | null>(null);
    const [showAllCartItems, setShowAllCartItems] = useState(false);
    const [showAllSummaryItems, setShowAllSummaryItems] = useState(false);
    const [showAllAddresses, setShowAllAddresses] = useState(false);
    const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);

    useEffect(() => {
        loadAvailableCoupons();
    }, [loadAvailableCoupons]);

    useEffect(() => {
        if (appliedCoupon?.couponCode) {
            setCouponInput(appliedCoupon.couponCode);
        }
    }, [appliedCoupon]);

    const handleApplyCoupon = async (code: string) => {
        if (!code || !code.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError("");
        dismissCartNotification();
        try {
            await applyCoupon(code);
            setCouponInput(code.trim().toUpperCase());
        } catch (err: any) {
            setCouponError(err.message || "Failed to apply coupon.");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleApplyCouponInModal = async (code: string) => {
        if (!code || !code.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError("");
        dismissCartNotification();
        try {
            await applyCoupon(code);
            setCouponInput(code.trim().toUpperCase());
            setIsCouponsModalOpen(false);
        } catch (err: any) {
            setCouponError(err.message || "Failed to apply coupon.");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const priceBreakdownRef = useRef<HTMLDivElement | null>(null);
    const [rateBreakdown, setRateBreakdown] = useState<GoldSilverRateBreakdown | null>(null);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const discountModalShownRef = useRef(false);

    const hasSilverItems = cartItems.some(
        (item) =>
            /silver/i.test(item.product?.productName || "") ||
            /silver/i.test(item.variant?.purity || "")
    );
    const isSilverCart = hasSilverItems;
    const metalName = hasSilverItems ? "Silver" : "Gold";

    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            setRateBreakdown(null);
            setShowDiscountModal(false);
            return;
        }

        let isMounted = true;
        (async () => {
            try {
                // Fetch rate breakdown for items in the cart
                const breakdowns = await Promise.all(
                    cartItems.map(async (item) => {
                        try {
                            const res = await fetchGoldSilverRateBreakdown(item.variant.id, item.quantity || 1);
                            return ((res as any)?.data ?? (res as any)?.body ?? res) as GoldSilverRateBreakdown;
                        } catch (err) {
                            console.error(`[CartSlider] Failed breakdown for variant ${item.variant.id}:`, err);
                            return null;
                        }
                    })
                );

                if (!isMounted) return;

                const valid = breakdowns.filter((b): b is GoldSilverRateBreakdown => b !== null);
                if (valid.length > 0) {
                    // Pick the breakdown that contains the discount (or first item) directly without any calculations
                    const targetBreakdown =
                        valid.find(
                            (b) => Number(b.discountPercentage || 0) > 0 || Number(b.discountAmount || 0) > 0
                        ) ?? valid[0];

                    console.log("[CartSlider] Direct API breakdown response (no calculation):", targetBreakdown);
                    setRateBreakdown(targetBreakdown);

                    const discPct = Number(targetBreakdown.discountPercentage || 0);
                    const discAmt = Number(targetBreakdown.discountAmount || 0);

                    // If discount is not zero, open modal
                    if (discPct > 0 || discAmt > 0) {
                        setShowDiscountModal(true);
                    } else {
                        setShowDiscountModal(false);
                    }
                } else {
                    setRateBreakdown(null);
                    setShowDiscountModal(false);
                }
            } catch (err) {
                console.error("[CartSlider] Error fetching rate breakdowns:", err);
                if (isMounted) {
                    setRateBreakdown(null);
                    setShowDiscountModal(false);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [cartItems]);

    const [s, setS] = useState<PageState>({
        addresses: [],
        selectedAddressId: "",
        paymentMode: "CASHFREE",
        walletBalance: null,
        loadingAddresses: false,
        loadingCheckout: false,
        orderSuccess: null,
        incrementingId: null,
        decrementingId: null,
        cartError: "",
        walletConfirmOpen: false,
        removeConfirmVariantId: null,
        confirmOrderModalOpen: false,
        orderId: null,
        paymentSessionId: null,
        txnId: null,
        profileReminderOpen: false,
        checkoutStep: "cart",
        successModalOpen: false,
    });

    const patch = useCallback(
        (partial: Partial<PageState>) => setS((prev) => ({ ...prev, ...partial })),
        []
    );

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) return;
        const uid = JSON.parse(stored).data.userId;
        if (!uid) return;

        (async () => {
            patch({ loadingAddresses: true });
            try {
                const [addrResult, balResult] = await Promise.allSettled([
                    fetchAddresses(uid),
                    fetchWalletBalance(uid),
                ]);


                const addrRes = addrResult.status === "fulfilled" ? addrResult.value : null;
                const balRes = balResult.status === "fulfilled" ? balResult.value : null;

                const mapped: Address[] = (addrRes?.data.reverse() || addrRes || []).map((a: any) => ({
                    id: String(a.id),
                    type: a.type || "Home",
                    flatNo: a.flatNo || "",
                    landMark: a.landMark || "",
                    address: a.address || "",
                    pinCode: a.pinCode || "",
                    state: a.state || "",
                    latitude: a.latitude || "",
                    longitude: a.longitude || "",
                }));

                const preferredDefault = mapped.find((a) => a.latitude && a.longitude) ?? mapped[0];

                patch({
                    addresses: mapped,
                    selectedAddressId: preferredDefault?.id ?? "",
                    walletBalance: balRes?.success ? (balRes.data?.balance ?? 0) : null,
                    loadingAddresses: false,
                });
            } catch (err) {
                console.error("Cart init error:", err);
                patch({ loadingAddresses: false });
            }
        })();
    }, []);

    useEffect(() => {
        if (!s.selectedAddressId) return;

        const syncAddressCart = async () => {
            const ok = await refreshCart(s.selectedAddressId);
            if (!ok) {
                patch({
                    cartError: "This address is missing location coordinates. Please update the address and capture current location to continue."
                });
            } else {
                patch({ cartError: "" });
            }
        };

        syncAddressCart();
    }, [s.selectedAddressId, refreshCart, patch]);

    const handleIncrement = useCallback(
        async (variantId: string) => {
            patch({ incrementingId: variantId });
            try { await incrementQuantity(variantId); }
            finally { patch({ incrementingId: null }); }
        },
        [incrementQuantity, patch]
    );

    const handleDecrement = useCallback(
        async (variantId: string, cartId: number | undefined) => {
            patch({ decrementingId: variantId });
            try { await decrementQuantity(variantId, cartId); }
            finally { patch({ decrementingId: null }); }
        },
        [decrementQuantity, patch]
    );

    const requestRemove = (variantId: string) => patch({ removeConfirmVariantId: variantId });

    const selectAddress = useCallback((addressId: string) => {
        patch({ selectedAddressId: addressId });
        refreshCart(addressId);
    }, [patch, refreshCart]);

    const confirmRemove = () => {
        if (s.removeConfirmVariantId) removeFromCart(s.removeConfirmVariantId);
        patch({ removeConfirmVariantId: null });
    };

    const handleCheckoutClick = () => {
        if (!s.selectedAddressId) return;
        const selectedAddr = s.addresses.find((a) => a.id === s.selectedAddressId);
        const missingLocation = !!selectedAddr && (!selectedAddr.latitude || !selectedAddr.longitude);

        if (missingLocation) {
            patch({
                cartError: "This address is missing location coordinates. Please update the address and capture current location to continue."
            });
            return;
        }

        if (s.paymentMode === "WALLET") patch({ walletConfirmOpen: true });
        else executeCheckout();
    };

    const executeCheckout = async () => {
        patch({ walletConfirmOpen: false, loadingCheckout: true });
        const stored = localStorage.getItem("user");
        if (!stored) return;
        try {
            const userId = JSON.parse(stored)?.data?.userId;
            if (!userId) { alert("Session expired. Please login again."); return; }

            try {
                const profileRes = await getUserProfile(userId);
                const profile = profileRes?.data?.body || profileRes?.data || profileRes;
                if (!profile?.firstName) {
                    patch({ profileReminderOpen: true, loadingCheckout: false });
                    return;
                }
            } catch {
                patch({ profileReminderOpen: true, loadingCheckout: false });
                return;
            }

            const redirectionUrl = s.paymentMode === "CASHFREE"
                ? `${window.location.origin}/physical-gold/payment-status`
                : undefined;

            const res = await createOrder({
                userId,
                addressId: parseInt(s.selectedAddressId),
                notes: "Physical Gold Order",
                paymentMode: s.paymentMode,
                ...(appliedCoupon?.couponCode && { couponCode: appliedCoupon.couponCode }),
                ...(redirectionUrl && { returnUrl: redirectionUrl }),
            });

            if (res.success) {
                const orderId = res.data.id || res.data.orderId;
                const orderNumber = res.data.orderNumber;

                if (s.paymentMode === "WALLET") {
                    clearCart();
                    navigate(`/physical-gold/profile?tab=orders`);
                    patch({ loadingCheckout: false });
                } else if (s.paymentMode === "CASHFREE") {
                    patch({
                        orderId,
                        orderSuccess: { orderNumber },
                        paymentSessionId: res.data.paymentSessionId,
                        txnId: res.data.txnId,
                        confirmOrderModalOpen: true,
                        loadingCheckout: false,
                    });
                } else {
                    patch({ loadingCheckout: false, successModalOpen: true, orderSuccess: { orderNumber } });
                }
            }
        } catch (err: any) {
            alert(err.message || "Checkout failed. Please try again.");
            patch({ loadingCheckout: false });
        }
    };

    const handleConfirmOrder = async () => {
        if (!s.orderId) return;
        patch({ loadingCheckout: true });
        try {
            // await confirmOrder(s.orderId);
            if (s.paymentMode === "CASHFREE" && s.paymentSessionId) {
                const cashfree = await load({ mode: "production" });
                const orderNumber = s.orderSuccess?.orderNumber || "";
                cashfree.checkout({
                    paymentSessionId: s.paymentSessionId,
                    redirectTarget: "_self",
                    returnUrl: `${window.location.origin}/physical-gold/payment-status?order_id=${s.txnId}&internal_id=${s.orderId}&order_number=${orderNumber}`,
                });
            } else {
                clearCart();
                const orderNumber = s.orderSuccess?.orderNumber || "";
                navigate(`/physical-gold/payment-status?order_id=${s.orderId}&internal_id=${s.orderId}&order_number=${orderNumber}`);
            }
        } catch (err: any) {
            alert(err.message || "Confirmation failed. Please try again.");
        } finally {
            patch({ loadingCheckout: false, confirmOrderModalOpen: false });
        }
    };

    /* ── Empty State ── */
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#F5F2EE]">
                <div className="flex items-center justify-center min-h-[80vh] px-4">
                    <div className="text-center max-w-sm mx-auto space-y-5">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#E8E0D5] bg-white shadow-sm">
                            <ShoppingBag className="h-7 w-7 text-[#D1C7BB]" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">Your cart is empty</h2>
                            <p className="text-[13px] text-[#8A8A8A] leading-relaxed">Discover our collection of certified hallmarked gold jewellery.</p>
                        </div>
                        <button
                            onClick={() => navigate("/physical-gold")}
                            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#8B6914] px-6 py-2.5 text-[12px] font-medium text-white hover:bg-[#7A5C10] transition"
                        >
                            <Sparkles className="h-3.5 w-3.5" /> Browse Collection
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const itemToRemove = cartItems.find((ci) => ci.variant.id === s.removeConfirmVariantId);

    return (
        <div className="min-h-screen bg-[#F5F2EE] text-[#1A1A1A]">
            {/* Cart & Coupon Notification Banner */}
            {cartNotification && (
                <div className="fixed top-24 right-4 z-50 max-w-sm w-full transition-all duration-300">
                    <div
                        className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl text-xs font-bold ${
                            cartNotification.type === "success"
                                ? "bg-emerald-900 text-emerald-100 border-emerald-700 shadow-emerald-950/20"
                                : "bg-rose-900 text-rose-100 border-rose-700 shadow-rose-950/20"
                        }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {cartNotification.type === "success" ? (
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            ) : (
                                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                            )}
                            <span className="truncate">{cartNotification.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={dismissCartNotification}
                            className="text-slate-300 hover:text-white font-bold text-sm px-1 cursor-pointer shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={s.walletConfirmOpen}
                onClose={() => patch({ walletConfirmOpen: false })}
                onConfirm={executeCheckout}
                loading={s.loadingCheckout}
                title="Confirm Wallet Payment"
                confirmLabel="Yes, Pay Now"
                confirmClassName="bg-[#8B6914] text-white hover:bg-[#7A5C10]"
                description={
                    <div className="space-y-3">
                        <p>You're about to pay <span className="font-semibold text-[#8B6914]">{formatINR(totalPayableAmount)}</span> from your OxyGold Wallet.</p>
                        <div className="rounded-lg border border-[#E8E0D5] bg-[#F5F2EE] px-3 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">
                                <Wallet className="h-3.5 w-3.5 text-[#8B6914]" /> Balance
                            </div>
                            <span className={`text-[13px] font-semibold ${s.walletBalance !== null && s.walletBalance >= totalPayableAmount ? "text-emerald-600" : "text-rose-500"}`}>
                                {s.walletBalance !== null ? formatINR(s.walletBalance) : "—"}
                            </span>
                        </div>
                    </div>
                }
            />
            <ConfirmModal
                isOpen={!!s.removeConfirmVariantId}
                onClose={() => patch({ removeConfirmVariantId: null })}
                onConfirm={confirmRemove}
                title="Remove Item"
                confirmLabel="Remove"
                confirmClassName="bg-rose-500 text-white hover:bg-rose-600"
                description={<p>Remove <span className="font-semibold">{itemToRemove?.product.productName}</span> from your cart?</p>}
            />
            <ConfirmModal
                isOpen={s.confirmOrderModalOpen}
                onClose={() => patch({ confirmOrderModalOpen: false })}
                onConfirm={handleConfirmOrder}
                loading={s.loadingCheckout}
                title="Confirm Your Order"
                confirmLabel="Confirm & Pay"
                confirmClassName="bg-[#8B6914] text-white hover:bg-[#7A5C10]"
                description={<p>Please review your order summary to proceed with payment.</p>}
            />
            <SuccessModal
                isOpen={s.successModalOpen}
                orderNumber={s.orderSuccess?.orderNumber ?? ""}
                onClose={() => { clearCart(); patch({ successModalOpen: false }); navigate(`/physical-gold/profile?tab=orders`); }}
            />
            <ConfirmModal
                isOpen={s.profileReminderOpen}
                onClose={() => patch({ profileReminderOpen: false })}
                onConfirm={() => { patch({ profileReminderOpen: false }); navigate(`/physical-gold/profile?tab=info&returnTo=${encodeURIComponent(location.pathname + location.search)}`); }}
                title="Complete Your Profile"
                confirmLabel="Go to Profile"
                confirmClassName="bg-[#8B6914] text-white hover:bg-[#7A5C10]"
                description={<p>We need your profile details to process this order.</p>}
            />

            {/* GST Rate & Discount Breakdown Modal */}
            {showDiscountModal && rateBreakdown && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cart-discount-title"
                    onClick={() => setShowDiscountModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-white p-6 sm:p-7 text-center shadow-2xl ring-1 ring-black/5 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Corner decorative icons */}
                        <span className="pointer-events-none absolute left-6 top-6 text-[#C29B27]">
                            <Sparkles size={18} />
                        </span>
                        <span className="pointer-events-none absolute right-12 top-7 text-amber-400 text-xs">
                            ✨
                        </span>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDiscountModal(false);
                            }}
                            className="absolute right-4 top-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>

                        <div className="relative z-10 pt-1">
                            {/* Party Popper Celebration Icon */}
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#C29B27] to-[#8B6914] text-white shadow-lg shadow-amber-300/50">
                                <PartyPopper size={26} />
                            </div>

                            {/* Header Title */}
                            <h2
                                id="cart-discount-title"
                                className="text-xl font-extrabold text-[#8B6914] flex items-center justify-center gap-1.5"
                            >
                                GST & Making Charges on Us 🎉
                            </h2>

                            {/* Mint Green Banner */}
                            <div className="mt-3.5 mb-4 rounded-2xl border border-emerald-100 bg-[#E8F8F0] p-3 text-center">
                                <p className="text-[13px] font-bold text-emerald-900 flex items-center justify-center gap-1">
                                    <span>✨</span> Exclusive for <span className="underline decoration-emerald-600 underline-offset-2">Silver Purchases</span>
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
                                    Zero Making Charges + 100% GST Covered by OXYGOLD.AI!
                                </p>
                            </div>

                            {/* Price Breakdown Box Matching Image 1 */}
                            {(() => {
                                const basePriceVal = Number(rateBreakdown?.variantPrice || 0);
                                const gstVal = Number(rateBreakdown?.gstAmount || 0);
                                const totalVal = Number(rateBreakdown?.totalAmount || (basePriceVal + gstVal));
                                const makingVal = Number(rateBreakdown?.makingAmount || 0);
                                const discountVal = Number(rateBreakdown?.discountAmount || 0);
                                const finalVal = Number(
                                    (rateBreakdown?.finalAmount && rateBreakdown.finalAmount > 0)
                                        ? rateBreakdown.finalAmount
                                        : (totalVal - discountVal)
                                ) || basePriceVal;

                                return (
                                    <div className="my-4 rounded-2xl border border-dashed border-stone-200 bg-[#FDFAF4] p-3.5 text-left text-[13px] space-y-2 shadow-2xs">
                                        <div className="flex justify-between items-center text-stone-700">
                                            <span className="font-medium text-stone-600">Base Price:</span>
                                            <span className="font-bold text-stone-900">
                                                ₹{basePriceVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-stone-700">
                                            <span className="font-medium text-stone-600">GST ({rateBreakdown?.gstPercentage ?? 3}%):</span>
                                            <span className="font-bold text-stone-900">
                                                ₹{gstVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                          <div className="flex justify-between items-center text-stone-700">
                                            <span className="font-medium text-stone-600">Making Charges:</span>
                                            <span className="font-bold text-stone-900">
                                                ₹{makingVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-stone-900 font-bold border-t border-dashed border-stone-200 pt-2">
                                            <span>Total Amount:</span>
                                            <span>
                                                ₹{totalVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {discountVal > 0 && (
                                            <div className="flex justify-between items-center rounded-xl bg-[#E8F8F0] border border-emerald-200 px-3 py-2 text-[12px] font-bold text-emerald-700">
                                                <span>GST Waiver Discount:</span>
                                                <span>
                                                    -₹{discountVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-[#8B6914] font-extrabold text-[15px] pt-1.5 border-t border-stone-200">
                                            <span>Final Amount:</span>
                                            <span>
                                                ₹{finalVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Highlight Badges */}
                            <div className="mb-5 flex justify-center gap-2.5">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-[#8B6914]">
                                    <Gem size={13} className="text-[#C29B27]" /> Valid Only on Silver
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-[#E8F8F0] px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                                    <CheckCircle2 size={13} className="text-emerald-600" /> 100% Tax Covered
                                </span>
                            </div>

                            {/* Main Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDiscountModal(false);
                                }}
                                className="w-full cursor-pointer rounded-2xl py-3.5 text-[14px] font-bold text-white bg-gradient-to-r from-[#C29B27] to-[#8B6914] hover:from-[#B08B20] hover:to-[#78590E] shadow-lg shadow-amber-300/40 transition active:scale-[0.99]"
                            >
                                Awesome, Got It!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Coupons Listing Screen Modal */}
            {isCouponsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E8E0D5]"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE1] bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center justify-center text-[#8B6914] shadow-2xs">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-extrabold text-[#1A1A1A] leading-tight">
                                        Apply Coupon
                                    </h2>
                                    <p className="text-xs font-medium text-stone-500">
                                        Use a coupon code to get the best offer
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCouponsModalOpen(false)}
                                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Top Coupon Code Input Row */}
                        <div className="p-5 bg-white border-b border-[#F0EBE1]">
                            <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-500/30 bg-[#F9F9FB] p-1.5 focus-within:border-[#8B6914] focus-within:bg-white transition shadow-2xs">
                                <div className="pl-3 text-amber-700 shrink-0">
                                    <Tag size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Coupon Code"
                                    value={couponInput}
                                    onChange={(e) => {
                                        setCouponInput(e.target.value.toUpperCase());
                                        setCouponError("");
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            if (appliedCoupon && couponInput === appliedCoupon.couponCode) {
                                                removeAppliedCoupon();
                                                setCouponInput("");
                                            } else if (couponInput.trim()) {
                                                handleApplyCouponInModal(couponInput);
                                            }
                                        }
                                    }}
                                    className="w-full bg-transparent px-2 text-sm font-mono font-bold uppercase tracking-wider text-[#1A1A1A] placeholder:font-sans placeholder:normal-case placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
                                />
                                {appliedCoupon && couponInput === appliedCoupon.couponCode ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            removeAppliedCoupon();
                                            setCouponInput("");
                                            setCouponError("");
                                        }}
                                        className="shrink-0 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 transition cursor-pointer uppercase tracking-wider shadow-2xs"
                                    >
                                        REMOVE
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={!couponInput.trim() || isApplyingCoupon}
                                        onClick={() => handleApplyCouponInModal(couponInput)}
                                        className="shrink-0 px-7 py-2.5 rounded-xl bg-[#8B6914] hover:bg-[#775910] text-white font-extrabold text-xs transition disabled:opacity-40 cursor-pointer uppercase tracking-wider shadow-2xs"
                                    >
                                        {isApplyingCoupon ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                                    </button>
                                )}
                            </div>
                            {couponError && (
                                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 mt-2.5 px-1">
                                    <AlertTriangle size={14} /> {couponError}
                                </p>
                            )}
                        </div>

                        {/* Modal Body — Coupon Cards List */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#FAF9F6] [scrollbar-width:thin]">
                            
                            {/* Section Title */}
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-base font-bold text-[#1A1A1A]">
                                    Available Coupons
                                </h3>
                                <span className="text-xs font-medium text-stone-500">
                                    Choose the best offer for you
                                </span>
                            </div>

                            {/* Coupons Cards Container */}
                            <div className="space-y-4">
                                {availableCoupons.map((coupon, idx) => {
                                    const isApplied = appliedCoupon?.couponCode === coupon.code;
                                    const isApplicable = cartSubtotal >= (coupon.minimumOrderAmount || 0);

                                    const savedAmount = (() => {
                                        if (coupon.discountType === "PERCENTAGE") {
                                            const val = (cartSubtotal * (coupon.discountValue || 0)) / 100;
                                            return coupon.maximumDiscountAmount && coupon.maximumDiscountAmount > 0
                                                ? Math.min(val, coupon.maximumDiscountAmount)
                                                : val;
                                        }
                                        return coupon.discountValue || 0;
                                    })();

                                    // Color theme per card index or type (emerald, rose, blue, amber)
                                    const theme = idx % 3 === 0
                                        ? { border: "border-emerald-200/90", bg: "bg-[#F3FBF7]", stubBorder: "border-emerald-400 text-emerald-800", text: "text-emerald-700" }
                                        : idx % 3 === 1
                                        ? { border: "border-rose-200/90", bg: "bg-[#FFF7F7]", stubBorder: "border-rose-300 text-rose-800", text: "text-rose-700" }
                                        : { border: "border-blue-200/90", bg: "bg-[#F4F8FF]", stubBorder: "border-blue-300 text-blue-800", text: "text-blue-700" };

                                    const formattedValidTill = coupon.endDateTime
                                        ? new Date(
                                            coupon.endDateTime.includes("T") && !coupon.endDateTime.endsWith("Z") && !coupon.endDateTime.includes("+")
                                                ? coupon.endDateTime + "Z"
                                                : coupon.endDateTime
                                          ).toLocaleDateString("en-IN", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                          })
                                        : null;

                                    const categoryLabel = coupon.categoryName || (coupon.applyTo === "CATEGORY" ? `Category #${coupon.categoryId}` : "All Products");

                                    return (
                                        <div
                                            key={coupon.id}
                                            className={`relative rounded-2xl border ${theme.border} ${theme.bg} p-4 sm:p-4.5 shadow-2xs transition-all hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                                        >
                                            {/* Left Side: Dashed Coupon Stub + Details */}
                                            <div className="flex items-start gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
                                                {/* Ticket Stub Badge */}
                                                <div className={`shrink-0 px-3.5 py-3 rounded-xl border-2 border-dashed ${theme.stubBorder} bg-white font-mono font-black text-sm tracking-wide text-center flex items-center justify-center min-w-[95px] shadow-2xs`}>
                                                    {coupon.code}
                                                </div>

                                                {/* Middle Coupon Details */}
                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <h4 className="text-sm sm:text-base font-extrabold text-[#1A1A1A] truncate">
                                                            {coupon.name || coupon.code}
                                                        </h4>
                                                        {/* Countdown timer badge */}
                                                        {coupon.endDateTime && (
                                                            <CouponCountdown endDateTime={coupon.endDateTime} />
                                                        )}
                                                    </div>

                                                    {/* Offer description / saved amount line */}
                                                    <p className={`text-xs sm:text-sm font-extrabold ${theme.text} leading-snug`}>
                                                        {coupon.description
                                                            ? coupon.description
                                                            : coupon.discountType === "PERCENTAGE"
                                                            ? `Get ${coupon.discountValue}% OFF${coupon.maximumDiscountAmount ? ` up to ₹${coupon.maximumDiscountAmount.toLocaleString("en-IN")}` : ""}`
                                                            : `Save ₹${(coupon.discountValue || 0).toLocaleString("en-IN")} with this code`}
                                                    </p>

                                                    {/* Metadata Icons Grid */}
                                                    <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-500 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <ShoppingCart size={13} className="text-stone-400 shrink-0" />
                                                            <span>Min. purchase</span>
                                                            <span className="font-bold text-stone-800">
                                                                ₹{(coupon.minimumOrderAmount || 0).toLocaleString("en-IN")}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <Layers size={13} className="text-stone-400 shrink-0" />
                                                            <span>Applicable on</span>
                                                            <span className="font-bold text-stone-800">
                                                                {categoryLabel}
                                                            </span>
                                                        </div>

                                                        {formattedValidTill && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar size={13} className="text-stone-400 shrink-0" />
                                                                <span>Valid till</span>
                                                                <span className="font-bold text-stone-800">
                                                                    {formattedValidTill}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Unlock notice if cart amount is below minimum purchase */}
                                                    {!isApplicable && coupon.minimumOrderAmount && (
                                                        <p className="text-[11px] font-bold text-rose-600 pt-0.5">
                                                            Add items worth ₹{(coupon.minimumOrderAmount - cartSubtotal).toLocaleString("en-IN")} more to unlock
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Side: Apply / Applied Button */}
                                            <div className="shrink-0 w-full sm:w-auto flex justify-end">
                                                {isApplied ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            removeAppliedCoupon();
                                                            setCouponInput("");
                                                        }}
                                                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition"
                                                    >
                                                        <CheckCircle2 size={14} /> Applied
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={!isApplicable || isApplyingCoupon}
                                                        onClick={() => handleApplyCouponInModal(coupon.code)}
                                                        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition flex items-center justify-center cursor-pointer shadow-2xs ${
                                                            !isApplicable
                                                                ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                                                                : "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600"
                                                        }`}
                                                    >
                                                        {isApplyingCoupon ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {availableCoupons.length === 0 && (
                                    <div className="text-center py-12 px-4 bg-white rounded-2xl border border-stone-200">
                                        <Tag size={36} className="mx-auto text-stone-300 mb-2" />
                                        <p className="text-base font-bold text-[#1A1A1A]">No Coupons Available</p>
                                        <p className="text-xs text-stone-500 mt-1">Check back later for exciting offers and discount codes!</p>
                                    </div>
                                )}
                            </div>

                           

                        </div>
                    </motion.div>
                </div>
            )}

            <main className="pt-24 md:pt-36 lg:pt-36 pb-16 max-w-6xl mx-auto px-4 sm:px-6">

                {/* Back to Store */}
                <button
                    onClick={() => navigate("/physical-gold")}
                    className="mb-2 mt-2 cursor-pointer inline-flex items-center gap-1.5 text-[14px] font-medium text-[#8A8A8A] hover:text-[#8B6914] transition"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
                </button>

                {/* Page Title + Breadcrumb */}
                <div className="mb-4">
                    <h1 className="text-[20px] font-semibold text-[#1A1A1A]">
                        {s.checkoutStep === "cart" ? `Shopping Cart (${totalItems})` : "Checkout"}
                    </h1>
                    <div className="flex pt-1.5 items-center gap-3 text-[14px] text-[#8A8A8A]">
                        <span
                            className={`cursor-pointer ${s.checkoutStep === "cart" ? "text-[#8B6914] font-semibold" : ""}`}
                            onClick={() => patch({ checkoutStep: "cart" })}
                        >
                            01 Shopping Cart
                        </span>
                        <span className="text-[#D1C7BB]">›</span>
                        <span className={s.checkoutStep === "checkout" ? "text-[#8B6914] font-semibold" : ""}>
                            02 Address & Payment
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

                    {/* LEFT — Cart Items or Checkout */}
                    <div className="space-y-3">
                        {s.checkoutStep === "cart" ? (
                            <>
                                <div className="space-y-3">
                                    {(showAllCartItems ? cartItems : cartItems.slice(0, 3)).map(({ cartId, product, variant, quantity }) => {
                                        const lineTotal = variant.price * quantity;
                                        const unitMrp = variant.mrp && variant.mrp > variant.price ? variant.mrp : 0;
                                        const mrpTotal = unitMrp * quantity;
                                        const unitSaved = variant.savedAmount || (unitMrp > variant.price ? unitMrp - variant.price : 0);
                                        const savedTotal = unitSaved * quantity;

                                        return (
                                            <div
                                                key={variant.id}
                                                className="flex flex-row items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-[#E8E0D5] bg-white hover:border-[#C9B87A] transition group overflow-hidden shadow-2xs"
                                            >
                                                {/* Image */}
                                                <button
                                                    type="button"
                                                    onClick={() => product.id && navigate(`/physical-gold/product/${product.id}`)}
                                                    className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#F5F2EE] border border-[#E8E0D5] cursor-pointer hover:border-[#8B6914]/60 transition group/img"
                                                    title={`View ${product.productName}`}
                                                >
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.productName}
                                                        className="h-full w-full object-cover mix-blend-multiply transition-transform duration-300 group-hover/img:scale-105"
                                                    />
                                                </button>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => product.id && navigate(`/physical-gold/product/${product.id}`)}
                                                            className="text-left cursor-pointer group/title min-w-0 flex-1"
                                                        >
                                                            <h3 className="text-[13px] sm:text-[14px] font-semibold text-[#1A1A1A] leading-snug group-hover/title:text-[#8B6914] transition-colors line-clamp-2">
                                                                {product.productName}
                                                            </h3>
                                                        </button>
                                                        <button
                                                            onClick={() => requestRemove(variant.id)}
                                                            className="shrink-0 p-1 text-[#D1C7BB] hover:text-rose-500 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[11px] text-[#8A8A8A] mt-0.5">
                                                        {variant.purity} {variant.weight}g
                                                    </p>
                                                    <div className="flex flex-wrap items-center justify-between mt-2.5 gap-2 w-full">
                                                        <QuantitySelector
                                                            quantity={quantity}
                                                            onIncrease={() => handleIncrement(variant.id)}
                                                            onDecrease={() => handleDecrement(variant.id, cartId)}
                                                            disabled={s.incrementingId === variant.id || s.decrementingId === variant.id}
                                                        />
                                                        <div className="text-right shrink-0 min-w-0">
                                                            <div className="flex items-center gap-1.5 justify-end flex-wrap">
                                                                {mrpTotal > lineTotal && (
                                                                    <span className="text-[11px] sm:text-[12px] text-gray-400 line-through font-medium">
                                                                        ₹{mrpTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                                                    </span>
                                                                )}
                                                                <span className="text-[14px] sm:text-[15px] font-bold text-[#8B6914]">
                                                                    ₹{lineTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            {savedTotal > 0 && (
                                                                <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5 whitespace-nowrap">
                                                                    You Save ₹{savedTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {cartItems.length > 3 && (
                                    <div className="pt-1 text-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowAllCartItems(!showAllCartItems)}
                                            className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E0D5] bg-white text-xs font-bold text-[#8B6914] hover:bg-[#F5EDD6]/40 hover:border-[#8B6914]/50 transition-all shadow-2xs"
                                        >
                                            <span>{showAllCartItems ? "Show Less" : `View More (${cartItems.length - 3} more ${cartItems.length - 3 === 1 ? 'item' : 'items'})`}</span>
                                            {showAllCartItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>
                                )}

                                {cartItems.length > 0 && (
                                    <div className="pt-3 flex justify-center items-center">
                                        <button
                                            type="button"
                                            onClick={() => navigate("/physical-gold")}
                                            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E0D5] bg-white text-[13px] font-semibold text-[#8B6914] hover:bg-[#F5EDD6]/40 hover:border-[#8B6914]/50 hover:shadow-xs transition-all active:scale-95 shadow-2xs"
                                        >
                                            <ShoppingBag size={16} className="text-[#8B6914] shrink-0" />
                                            <span>Continue Shopping</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-5">
                                {/* Delivery Address */}
                                <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 shadow-2xs">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Delivery Address</h3>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/physical-gold/profile?tab=address&add=true&returnTo=${encodeURIComponent(location.pathname + location.search)}`)}
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8B6914] bg-[#F5EDD6]/60 border border-[#C9B87A]/50 px-2.5 py-1 rounded-lg hover:bg-[#F5EDD6] transition cursor-pointer"
                                        >
                                            <Plus size={13} /> Add New Address
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-[19rem] overflow-y-auto pr-1.5 overscroll-contain scroll-smooth [scrollbar-width:thin] [scrollbar-color:#D1C7BB_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#F5F2EE] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D1C7BB] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#8B6914]">
                                        {s.addresses.length === 0 ? (
                                            <div className="text-center py-6 border border-dashed border-[#E8E0D5] rounded-xl bg-[#FAF8F5] p-4">
                                                <MapPin size={24} className="mx-auto text-[#D1C7BB] mb-2" />
                                                <p className="text-[13px] font-semibold text-[#1A1A1A]">No Saved Address</p>
                                                <p className="text-[11px] text-[#8A8A8A] mt-0.5 mb-3">Please add a delivery address to complete your order.</p>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/physical-gold/profile?tab=address&add=true&returnTo=${encodeURIComponent(location.pathname + location.search)}`)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B6914] text-white text-[12px] font-medium hover:bg-[#7A5C10] transition cursor-pointer"
                                                >
                                                    <Plus size={14} /> Add New Address
                                                </button>
                                            </div>
                                        ) : (
                                            (showAllAddresses ? s.addresses : s.addresses.slice(0, 3)).map((addr) => {
                                                const missingLocation = !addr.latitude || !addr.longitude;
                                                const isSelected = s.selectedAddressId === addr.id;
                                                return (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => selectAddress(addr.id)}
                                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-[#8B6914] bg-[#F5EDD6]/30 shadow-2xs" : "border-[#E8E0D5] hover:border-[#C9B87A] bg-white"}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                                                <MapPin size={14} className={`mt-0.5 shrink-0 ${isSelected ? "text-[#8B6914]" : "text-[#D1C7BB]"}`} />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider mb-0.5">{addr.type}</span>
                                                                        {isSelected && (
                                                                            <span className="text-[9px] font-bold uppercase text-[#8B6914] bg-[#F5EDD6] px-1.5 py-0.5 rounded border border-[#C9B87A]/50">Selected</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[13px] font-medium text-[#1A1A1A]">{addr.address}</p>
                                                                    <p className="text-[11px] text-[#8A8A8A]">{addr.landMark}, {addr.flatNo}</p>
                                                                    {missingLocation && (
                                                                        <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                                                            <AlertTriangle size={10} /> Location missing — <button onClick={(e) => { e.stopPropagation(); navigate(`/physical-gold/profile?tab=address&editId=${addr.id}&returnTo=${encodeURIComponent(location.pathname + location.search)}`); }} className="underline font-semibold">edit address</button>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/physical-gold/profile?tab=address&editId=${addr.id}&returnTo=${encodeURIComponent(location.pathname + location.search)}`);
                                                                }}
                                                                className="shrink-0 p-1.5 text-stone-400 hover:text-[#8B6914] hover:bg-[#F5EDD6]/50 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold border border-transparent hover:border-[#C9B87A]/40"
                                                                title="Edit this address"
                                                            >
                                                                <Pencil size={12} />
                                                                <span>Edit</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    {s.addresses.length > 3 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllAddresses(!showAllAddresses)}
                                            className="w-full mt-3 pt-1 text-center text-[11px] font-bold text-[#8B6914] hover:underline flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            <span>{showAllAddresses ? "Show Less" : `View All ${s.addresses.length} Addresses`}</span>
                                            {showAllAddresses ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        </button>
                                    )}
                                </div>

                                {/* Order Items Review (Placed below Delivery Address during Checkout) */}
                                <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 shadow-2xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Order Items ({totalItems})</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {(showAllSummaryItems ? cartItems : cartItems.slice(0, 3)).map(({ product, variant, quantity }) => (
                                            <div
                                                key={`checkout-item-${variant.id}`}
                                                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#F0EBE1] bg-[#FAF8F5]"
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-white border border-[#E8E0D5]">
                                                        <img src={product.imageUrl} alt={product.productName} className="h-full w-full object-cover mix-blend-multiply" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{product.productName}</p>
                                                        <p className="text-[11px] text-[#8A8A8A] mt-0.5">{variant.purity} {variant.weight}g</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="rounded-md bg-[#F5F2EE] px-2 py-1 text-[11px] font-semibold text-[#6B6B6B]">
                                                        Qty: {quantity}
                                                    </span>
                                                    <p className="text-[13px] font-bold text-[#8B6914] mt-1">₹{(variant.price * quantity).toLocaleString("en-IN")}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {cartItems.length > 3 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllSummaryItems(!showAllSummaryItems)}
                                            className="w-full mt-3 pt-1 text-center text-[11px] font-bold text-[#8B6914] hover:underline flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            <span>{showAllSummaryItems ? "Show Less" : `View All ${cartItems.length} Items`}</span>
                                            {showAllSummaryItems ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        </button>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 shadow-2xs">
                                    <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Payment Method</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {(["CASHFREE"] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => patch({ paymentMode: mode })}
                                                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border transition-all text-left w-full ${s.paymentMode === mode ? "border-[#8B6914] bg-[#F5EDD6]/30" : "border-[#E8E0D5] hover:border-[#C9B87A]"}`}
                                            >
                                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.paymentMode === mode ? "bg-[#8B6914] text-white" : "bg-[#F5F2EE] text-[#D1C7BB]"}`}>
                                                    <CreditCard size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-[13px] font-semibold leading-tight ${s.paymentMode === mode ? "text-[#8B6914]" : "text-[#1A1A1A]"}`}>
                                                        Online Payment
                                                    </p>
                                                    <p className="text-[11px] text-[#8A8A8A] mt-0.5">
                                                        UPI, Cards, Net Banking
                                                    </p>
                                                </div>
                                                {s.paymentMode === mode && (
                                                    <div className="ml-auto shrink-0 h-4 w-4 rounded-full bg-[#8B6914] flex items-center justify-center">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT — Order Summary */}
                    <div className="lg:sticky lg:top-24">
                        <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 shadow-sm">
                            <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Order Summary</h2>

                            {/* Coupons & Offers Section — Modal Box Trigger */}
                            <div className="mb-4 rounded-2xl border border-[#E8E0D5] bg-[#FAF8F5] p-3.5 shadow-2xs">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-amber-100/70 text-[#8B6914] shrink-0">
                                            <Tag size={14} />
                                        </div>
                                        <h3 className="text-[14px] font-extrabold tracking-wide text-[#1A1A1A]">Apply Coupon</h3>
                                    </div>
                                    {availableCoupons.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCouponsModalOpen(true)}
                                            className="text-[12px] font-bold text-[#8B6914] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            View All Coupons ({availableCoupons.length}) <ChevronRight size={13} />
                                        </button>
                                    )}
                                </div>

                                {/* Always Visible Coupon Input Box */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 bg-white rounded-xl border border-[#E8E0D5] p-1 shadow-2xs">
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={couponInput}
                                            onChange={(e) => {
                                                setCouponInput(e.target.value.toUpperCase());
                                                setCouponError("");
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    if (appliedCoupon && couponInput === appliedCoupon.couponCode) {
                                                        removeAppliedCoupon();
                                                        setCouponInput("");
                                                    } else if (couponInput.trim()) {
                                                        handleApplyCoupon(couponInput);
                                                    }
                                                }
                                            }}
                                            className="w-full bg-transparent px-3 py-1.5 text-xs font-mono font-extrabold uppercase tracking-wider placeholder:font-sans placeholder:capitalize placeholder:text-[#8A8A8A] placeholder:font-normal focus:outline-none"
                                        />
                                        {appliedCoupon && couponInput === appliedCoupon.couponCode ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    removeAppliedCoupon();
                                                    setCouponInput("");
                                                    setCouponError("");
                                                }}
                                                className="shrink-0 rounded-lg bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700 transition cursor-pointer shadow-2xs uppercase tracking-wider min-w-[65px] flex items-center justify-center"
                                            >
                                                REMOVE
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={!couponInput.trim() || isApplyingCoupon}
                                                onClick={() => handleApplyCoupon(couponInput)}
                                                className="shrink-0 rounded-lg bg-[#8B6914] px-4 py-2 text-xs font-black text-white transition hover:bg-[#7A5C10] disabled:opacity-40 cursor-pointer shadow-2xs uppercase tracking-wider min-w-[65px] flex items-center justify-center"
                                            >
                                                {isApplyingCoupon ? <Loader2 size={13} className="animate-spin" /> : "APPLY"}
                                            </button>
                                        )}
                                    </div>

                                    {couponError && (
                                        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 pt-0.5">
                                            <AlertTriangle size={12} /> {couponError}
                                        </p>
                                    )}

                                    {appliedCoupon && !couponError && (
                                        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-0.5">
                                            <CheckCircle2 size={12} /> Coupon applied successfully! Saved ₹{couponDiscountAmount.toLocaleString("en-IN")}
                                        </p>
                                    )}

                                    {/* {availableCoupons.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsCouponsModalOpen(true)}
                                            className="w-full mt-1 p-2.5 rounded-xl border border-dashed border-[#8B6914]/40 bg-[#F5EDD6]/40 hover:bg-[#F5EDD6] text-[#8B6914] text-xs font-bold flex items-center justify-between transition cursor-pointer group shadow-2xs"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <span>View All Coupons</span>
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] font-extrabold group-hover:translate-x-0.5 transition-transform">
                                                <ChevronRight size={13} />
                                            </span>
                                        </button>
                                    )} */}
                                </div>
                            </div>

                            {/* Price Breakdown Box */}
                            <div ref={priceBreakdownRef} className="rounded-xl border border-[#F0EBE1] bg-[#FAF8F5] p-4 mb-5 space-y-2.5">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-[#6B6B6B] font-medium">Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                                    <span className="font-semibold text-[#1A1A1A]">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-[#8A8A8A]">Making Charges</span>
                                    <span className="font-medium text-[#1A1A1A]">₹{totalMakingCharges.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px]">
                                    <span className="text-[#8A8A8A]">GST (3%)</span>
                                    <span className="font-medium text-[#1A1A1A]">₹{totalGstCharges.toLocaleString("en-IN")}</span>
                                </div>

                                {/* Delivery Fee: Display ONLY if fee > 0 */}
                                {/* {deliveryFee > 0 && ( */}
                                    <div>
                                        <div className="flex justify-between items-center text-[12px]">
                                            <span className="text-[#8A8A8A]">
                                                Delivery{deliveryDistanceKm !== null && deliveryDistanceKm > 0 ? ` (${deliveryDistanceKm} km)` : ""}
                                            </span>
                                            <span className="font-medium text-[#1A1A1A]">₹{deliveryFee.toLocaleString("en-IN")}</span>
                                        </div>
                                        {ratePerKm !== null && ratePerKm > 0 && deliveryDistanceKm !== null && deliveryDistanceKm > 0 && (
                                            <p className="text-[10px] text-[#8A8A8A] text-right mt-0.5">₹{ratePerKm}/km delivery rate</p>
                                        )}
                                    </div>
                                {/* )} */}

                                {totalDiscountAmount > 0 && (
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-emerald-600 flex items-center gap-1 font-medium">
                                            Discount
                                        </span>
                                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                            -₹{totalDiscountAmount.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                )}

                                {couponDiscountAmount > 0 && (
                                    <div className="flex justify-between items-center text-[12px]">
                                        <span className="text-emerald-800 flex items-center gap-1 font-bold">
                                           Coupon ({appliedCoupon?.couponCode})
                                        </span>
                                        <span className="font-extrabold text-emerald-700">
                                            -₹{couponDiscountAmount.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-[#E8E0D5] pt-3 mt-3 flex justify-between items-center">
                                    <span className="text-[14px] font-semibold text-[#1A1A1A]">Total To Pay</span>
                                    <span className="text-[18px] font-bold text-[#8B6914]">
                                        ₹{Math.max(0, totalPayableAmount - couponDiscountAmount).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                            {s.checkoutStep === "cart" ? (
                                <button
                                    onClick={() => patch({ checkoutStep: "checkout" })}
                                    className="w-full py-2.5 rounded-lg bg-[#8B6914] text-white text-[13px] font-medium hover:bg-[#7A5C10] transition flex items-center justify-center gap-2 group"
                                >
                                    Proceed to Checkout
                                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            ) : (() => {
                                if (s.addresses.length === 0) {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/physical-gold/profile?tab=address&add=true&returnTo=${encodeURIComponent(location.pathname + location.search)}`)}
                                            className="w-full py-2.5 rounded-lg bg-[#8B6914] text-white text-[13px] font-medium hover:bg-[#7A5C10] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                                        >
                                            <Plus size={15} />
                                            Add New Address
                                        </button>
                                    );
                                }
                                const selectedAddr = s.addresses.find(a => a.id === s.selectedAddressId);
                                const missingLocation = selectedAddr && (!selectedAddr.latitude || !selectedAddr.longitude);
                                const locationMessage = s.cartError || (missingLocation ? "This address is missing location coordinates. Please edit the address and capture your current location to proceed." : "");
                                return (
                                    <>
                                        {locationMessage && (
                                            <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                                                <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-amber-700 leading-snug">
                                                    {locationMessage.includes("edit the address") ? (
                                                        <>
                                                            {locationMessage.split("Please ")[0]}
                                                            <button onClick={() => navigate(`/physical-gold/profile?tab=address&returnTo=${encodeURIComponent(location.pathname + location.search)}`)} className="underline font-semibold">edit the address</button>
                                                            {locationMessage.includes("to proceed") ? " to proceed." : ""}
                                                        </>
                                                    ) : (
                                                        locationMessage
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                        <button
                                            disabled={!s.selectedAddressId || s.loadingCheckout || !!missingLocation}
                                            onClick={handleCheckoutClick}
                                            className="w-full py-2.5 rounded-lg bg-[#8B6914] text-white text-[13px] font-medium hover:bg-[#7A5C10] transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                                        >
                                            {s.loadingCheckout
                                                ? <Loader2 size={15} className="animate-spin" />
                                                : "Place Order"}
                                        </button>
                                    </>
                                );
                            })()}

                            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#8A8A8A]">
                                <Shield size={11} className="text-[#8B6914]" />
                                Secure & Encrypted Checkout
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CartPage;
