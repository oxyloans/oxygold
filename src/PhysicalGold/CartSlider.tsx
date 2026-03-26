import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    IndianRupee,
    Loader2,
    MapPin,
    Minus,
    Plus,
    ShoppingBag,
    Sparkles,
    Trash2,
    Wallet,
    X,
} from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import { useCart } from "./CartContext";
import { fetchAddresses, createOrder, fetchWalletBalance, confirmOrder, getUserProfile } from "./physicalGoldService";
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
}

interface PageState {
    addresses: Address[];
    selectedAddressId: string;
    paymentMode: "WALLET" | "CASHFREE";
    walletBalance: number | null;
    loadingAddresses: boolean;
    loadingCheckout: boolean;
    orderSuccess: { orderNumber: string } | null;
    incrementingId: string | null;
    decrementingId: string | null;
    // Confirmation modals
    walletConfirmOpen: boolean;
    removeConfirmVariantId: string | null; // variantId pending removal
    confirmOrderModalOpen: boolean;
    orderId: string | number | null;
    paymentSessionId: string | null;
    txnId: string | null;
    profileReminderOpen: boolean;
}

/* ────────────────────────────────────────────────────────── */
/*  Helper                                                    */
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

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel,
    confirmClassName,
    loading,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Modal */}
            <div className="relative w-full max-w-sm rounded-2xl border border-zinc-100 bg-white shadow-2xl overflow-hidden">
                <div className="px-5 py-5">
                    {/* Close */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Icon + Title */}
                    <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <AlertTriangle className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 leading-snug">{title}</h3>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-5 pl-12 text-sm text-zinc-500 leading-relaxed font-medium">
                        {description}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={onConfirm}
                            className={`cursor-pointer flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider ${confirmClassName ?? "bg-[#2b0a59] text-white shadow-lg shadow-purple-500/10 hover:bg-[#150b33]"}`}
                        >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────────────── */
/*  CartPage                                                  */
/* ────────────────────────────────────────────────────────── */
const CartPage: React.FC = () => {
    const navigate = useNavigate();

    const {
        cartItems,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        cartSubtotal,
        totalGstCharges,
        totalMakingCharges,
        totalPayableAmount,
        totalCartItemWeight,
    } = useCart();

    const [s, setS] = useState<PageState>({
        addresses: [],
        selectedAddressId: "",
        paymentMode: "WALLET",
        walletBalance: null,
        loadingAddresses: false,
        loadingCheckout: false,
        orderSuccess: null,
        incrementingId: null,
        decrementingId: null,
        walletConfirmOpen: false,
        removeConfirmVariantId: null,
        confirmOrderModalOpen: false,
        orderId: null,
        paymentSessionId: null,
        txnId: null,
        profileReminderOpen: false,
    });

    const patch = useCallback(
        (partial: Partial<PageState>) => setS((prev) => ({ ...prev, ...partial })),
        []
    );

    /* Load addresses + wallet balance in parallel on mount */
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) return;
        const uid = JSON.parse(stored).data.userId;
        if (!uid) return;

        (async () => {
            patch({ loadingAddresses: true });
            try {
                const [addrRes, balRes] = await Promise.all([
                    fetchAddresses(uid),
                    fetchWalletBalance(uid),
                ]);
                const mapped: Address[] = (addrRes.data || addrRes || []).map((a: any) => ({
                    id: String(a.id),
                    type: a.type || "Home",
                    flatNo: a.flatNo || "",
                    landMark: a.landMark || "",
                    address: a.address || "",
                    pinCode: a.pinCode || "",
                    state: a.state || "",
                }));
                patch({
                    addresses: mapped,
                    selectedAddressId: mapped[0]?.id ?? "",
                    walletBalance: balRes?.success ? (balRes.data?.balance ?? 0) : null,
                    loadingAddresses: false,
                });
            } catch (err) {
                console.error("Cart init error:", err);
                patch({ loadingAddresses: false });
            }
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    /* + — spinner only on this variantId's + button */
    const handleIncrement = useCallback(
        async (variantId: string) => {
            patch({ incrementingId: variantId });
            try { await incrementQuantity(variantId); }
            finally { patch({ incrementingId: null }); }
        },
        [incrementQuantity, patch]
    );

    /* − — spinner only on this variantId's − button */
    const handleDecrement = useCallback(
        async (variantId: string, cartId: number | undefined) => {
            patch({ decrementingId: variantId });
            try { await decrementQuantity(variantId, cartId); }
            finally { patch({ decrementingId: null }); }
        },
        [decrementQuantity, patch]
    );

    /* Remove — ask for confirmation first, then remove */
    const requestRemove = (variantId: string) =>
        patch({ removeConfirmVariantId: variantId });

    const confirmRemove = () => {
        if (s.removeConfirmVariantId) {
            removeFromCart(s.removeConfirmVariantId);
        }
        patch({ removeConfirmVariantId: null });
    };

    /* Checkout — if wallet, show confirm modal first */
    const handleCheckoutClick = () => {
        if (!s.selectedAddressId) return;
        if (s.paymentMode === "WALLET") {
            patch({ walletConfirmOpen: true });
        } else {
            executeCheckout();
        }
    };

    /* Actual checkout API call */
    const executeCheckout = async () => {
        patch({ walletConfirmOpen: false, loadingCheckout: true });
        const stored = localStorage.getItem("user");
        if (!stored) return;
        try {
            const userId = JSON.parse(stored)?.data?.userId;
            if (!userId) { alert("Session expired. Please login again."); return; }

            // 1. Check if profile is complete
            try {
                const profileRes = await getUserProfile(userId);
                const profile = profileRes?.data?.body || profileRes?.data || profileRes;
                if (!profile?.firstName) {
                    patch({ profileReminderOpen: true, loadingCheckout: false });
                    return;
                }
            } catch (err) {
                console.error("Profile check failed:", err);
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
                ...(redirectionUrl && { returnUrl: redirectionUrl })
            });

            if (res.success) {
                // Store orderId, orderNumber and paymentSessionId and show confirmation modal
                patch({
                    orderId: res.data.id || res.data.orderId,
                    orderSuccess: { orderNumber: res.data.orderNumber },
                    paymentSessionId: res.data.paymentSessionId,
                    txnId: res.data.txnId,
                    confirmOrderModalOpen: true,
                    loadingCheckout: false
                });

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
            // 1. Call confirmOrder api
            await confirmOrder(s.orderId);


            if (s.paymentMode === "CASHFREE" && s.paymentSessionId) {
                const cashfree = await load({ mode: "sandbox" });
                console.log(s.paymentSessionId);
                const orderNumber = s.orderSuccess?.orderNumber || "";
                const checkoutOptions = {
                    paymentSessionId: s.paymentSessionId,
                    redirectTarget: "_self",
                    returnUrl: `${window.location.origin}/physical-gold/payment-status?order_id=${s.txnId}&internal_id=${s.orderId}&order_number=${orderNumber}`
                };
                cashfree.checkout(checkoutOptions);

            } else {
                // Wallet payment success
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

    /* Removing inline orderSuccess UI in favor of dedicated page */

    /* ═══════════════════════════════════
       EMPTY CART
    ═══════════════════════════════════ */
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#FBF8F3] text-zinc-900">
                <PhysicalGoldHeader
                    cartItemCount={0}
                />
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="text-center max-w-xs mx-auto space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                            <ShoppingBag className="h-7 w-7 text-zinc-200" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-zinc-900 mb-1">Your cart is empty</h2>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed">Add coins, bars or jewellery from the store.</p>
                        </div>
                        <button
                            onClick={() => navigate("/physical-gold")}
                            className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#2b0a59] px-6 py-3 text-sm font-black text-white shadow-lg shadow-purple-500/10 transition hover:bg-[#150b33] uppercase tracking-wider"
                        >
                            <Sparkles className="h-4 w-4" /> Browse Store
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════
       MAIN CART PAGE
    ═══════════════════════════════════ */
    const itemToRemove = cartItems.find((ci) => ci.variant.id === s.removeConfirmVariantId);

    return (
        <div className="min-h-screen bg-[#FBF8F3] text-zinc-900">

            {/* ── HEADER ── */}
            <PhysicalGoldHeader
                cartItemCount={totalItems}
            />

            {/* ── WALLET CONFIRMATION MODAL ── */}
            <ConfirmModal
                isOpen={s.walletConfirmOpen}
                onClose={() => patch({ walletConfirmOpen: false })}
                onConfirm={executeCheckout}
                loading={s.loadingCheckout}
                title="Confirm Wallet Payment"
                confirmLabel="Yes, Pay Now"
                description={
                    <div className="space-y-2.5">
                        <p>
                            You're about to pay{" "}
                            <span className="font-bold text-[#2b0a59]">{formatINR(totalPayableAmount)}</span>{" "}
                            from your OxyGold Wallet.
                        </p>
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                                <Wallet className="h-3.5 w-3.5 text-yellow-600" />
                                Available balance
                            </div>
                            <span className={`text-xs font-bold ${s.walletBalance !== null && s.walletBalance >= totalPayableAmount ? "text-emerald-600" : "text-rose-600"}`}>
                                {s.walletBalance !== null ? formatINR(s.walletBalance) : "—"}
                            </span>
                        </div>
                        {s.walletBalance !== null && s.walletBalance < totalPayableAmount && (
                            <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 uppercase tracking-tight">
                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                Insufficient balance. Please switch to Online Payment.
                            </p>
                        )}
                    </div>
                }
            />

            {/* ── REMOVE ITEM CONFIRMATION MODAL ── */}
            <ConfirmModal
                isOpen={!!s.removeConfirmVariantId}
                onClose={() => patch({ removeConfirmVariantId: null })}
                onConfirm={confirmRemove}
                title="Remove Item"
                confirmLabel="Yes, Remove"
                confirmClassName="bg-rose-500 text-white shadow-lg shadow-rose-500/10 hover:bg-rose-600"
                description={
                    itemToRemove ? (
                        <p>
                            Remove{" "}
                            <span className="font-bold text-zinc-900">
                                {itemToRemove.product.productName}
                            </span>{" "}
                            ({itemToRemove.variant.purity} · {itemToRemove.variant.weight}g) from your cart?
                        </p>
                    ) : (
                        <p>Remove this item from your cart?</p>
                    )
                }
            />

            {/* ── CONFIRM ORDER MODAL ── */}
            <ConfirmModal
                isOpen={s.confirmOrderModalOpen}
                onClose={() => patch({ confirmOrderModalOpen: false })}
                onConfirm={handleConfirmOrder}
                loading={s.loadingCheckout}
                title="Confirm Your Order"
                confirmLabel="Confirm & Pay"
                description={
                    <div className="space-y-2">
                        <p>Please confirm your order to proceed with the payment.</p>
                        <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">Order ID:</span>
                                <span className="font-bold text-zinc-900">#{s.orderId}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Total Amount:</span>
                                <span className="font-bold text-[#2b0a59]">{formatINR(totalPayableAmount)}</span>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* ── PROFILE REMINDER MODAL ── */}
            <ConfirmModal
                isOpen={s.profileReminderOpen}
                onClose={() => patch({ profileReminderOpen: false })}
                onConfirm={() => {
                    patch({ profileReminderOpen: false });
                    navigate("/physical-gold/profile");
                }}
                title="Complete Your Profile"
                confirmLabel="Create Profile"
                description="Before creating the order, Please Create Profile there."
            />


            <main className="pt-20 sm:pt-24 pb-10">
                <div className="mx-auto max-w-6xl px-3 sm:px-5 lg:px-8">

                    {/* ── BACK NAVIGATION ── */}
                    <button
                        type="button"
                        onClick={() => navigate("/physical-gold")}
                        className="cursor-pointer mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-[#2b0a59] group font-semibold"
                    >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm transition group-hover:bg-zinc-50">
                            <ArrowLeft className="h-3.5 w-3.5" />
                        </span>
                        Back to Store
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4 items-start">

                        {/* ══ LEFT COLUMN: Cart Items → Order Summary ══ */}
                        <div className="space-y-3">

                            {/* CART ITEMS */}
                            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                                <div className="flex items-center px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        Items ({totalItems})
                                    </span>
                                </div>

                                <div className="divide-y divide-zinc-100">
                                    {cartItems.map(({ cartId, product, variant, quantity }) => {
                                        const isInc = s.incrementingId === variant.id;
                                        const isDec = s.decrementingId === variant.id;
                                        const lineTotal = variant.price * quantity;

                                        return (
                                            <div key={variant.id} className="flex items-center gap-3 px-4 py-4 hover:bg-zinc-50/50 transition-colors">
                                                {/* Product Image */}
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                                                    <img
                                                        src={product.imageUrl || "https://images.unsplash.com/photo-1610664921890-ebad0c071814?auto=format&fit=crop&q=80&w=200"}
                                                        alt={product.productName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                {/* Product info — click opens panel on store page */}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/physical-gold`, { state: { openProductId: product.id } })}
                                                    className="cursor-pointer flex-1 min-w-0 text-left group"
                                                >
                                                    <p className="text-sm font-bold text-zinc-900 group-hover:text-[#2b0a59] transition-colors leading-snug truncate">
                                                        {product.productName}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        {[variant.purity, `${variant.weight}g`, variant.size]
                                                            .filter(Boolean)
                                                            .map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="inline-block rounded-full border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-[10px] font-bold text-zinc-500"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                    </div>
                                                    <p className="mt-1.5 text-[11px] text-zinc-400 font-medium">
                                                        ₹{variant.price.toLocaleString("en-IN")} / unit
                                                    </p>
                                                </button>

                                                {/* Right: price + stepper + remove */}
                                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                    <span className="text-sm font-black text-[#2b0a59] flex items-center tabular-nums">
                                                        <IndianRupee className="h-3 w-3" />
                                                        {lineTotal.toLocaleString("en-IN")}
                                                    </span>

                                                    {/* Stepper — only the exact clicked button spins */}
                                                    <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden shadow-sm">
                                                        <button
                                                            type="button"
                                                            aria-label="Decrease quantity"
                                                            disabled={isDec}
                                                            onClick={() => handleDecrement(variant.id, cartId)}
                                                            className="cursor-pointer flex h-7 w-7 items-center justify-center text-zinc-400 transition hover:bg-white hover:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isDec
                                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                : <Minus className="h-3 w-3" />}
                                                        </button>
                                                        <span className="min-w-[24px] text-center text-xs font-black text-zinc-900 tabular-nums select-none">
                                                            {quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            aria-label="Increase quantity"
                                                            disabled={isInc}
                                                            onClick={() => handleIncrement(variant.id)}
                                                            className="cursor-pointer flex h-7 w-7 items-center justify-center text-zinc-400 transition hover:bg-white hover:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isInc
                                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                : <Plus className="h-3 w-3" />}
                                                        </button>
                                                    </div>

                                                    {/* Remove triggers confirmation modal */}
                                                    <button
                                                        type="button"
                                                        onClick={() => requestRemove(variant.id)}
                                                        className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-zinc-300 hover:text-rose-500 transition-colors uppercase tracking-tight"
                                                    >
                                                        <Trash2 className="h-2.5 w-2.5" /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ORDER SUMMARY — sits naturally below items */}
                            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        Summary
                                    </span>
                                </div>
                                <div className="px-4 py-4 space-y-2.5">
                                    {[
                                        { label: "Gold value", val: cartSubtotal },
                                        { label: "Making charges", val: totalMakingCharges },
                                        { label: "GST (3%)", val: totalGstCharges },
                                    ].map(({ label, val }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-500 font-medium">{label}</span>
                                            <span className="text-xs font-bold text-zinc-900">{formatINR(val)}</span>
                                        </div>
                                    ))}
                                    {totalCartItemWeight > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-500 font-medium">Total Weight</span>
                                            <span className="text-xs font-bold text-zinc-900">{totalCartItemWeight.toFixed(3)} g</span>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-wider text-[#2b0a59]">Grand Total</span>
                                        <span className="text-xl font-black text-[#2b0a59]">{formatINR(totalPayableAmount)}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 italic">
                                        *Price locked at live gold rate till checkout
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ══ RIGHT COLUMN (sticky): Address → Payment → CTA ══ */}
                        <div className="lg:sticky lg:top-28 space-y-3">

                            {/* DELIVERY ADDRESS */}
                            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        Address
                                    </span>
                                    <button
                                        onClick={() => navigate("/physical-gold/profile?tab=address")}
                                        className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-bold text-zinc-600 transition hover:bg-zinc-50 shadow-sm uppercase tracking-tight"
                                    >
                                        <Plus className="h-2.5 w-2.5" /> Manage
                                    </button>
                                </div>
                                <div className="p-3">
                                    {s.loadingAddresses ? (
                                        <div className="flex justify-center py-5">
                                            <Loader2 className="h-5 w-5 animate-spin text-zinc-200" />
                                        </div>
                                    ) : s.addresses.length === 0 ? (
                                        <div className="rounded-lg border-2 border-dashed border-zinc-100 p-4 text-center bg-zinc-50/30">
                                            <MapPin className="mx-auto mb-1.5 h-4 w-4 text-zinc-200" />
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                                                No saved addresses
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {s.addresses.map((addr) => {
                                                const selected = addr.id === s.selectedAddressId;
                                                return (
                                                    <button
                                                        key={addr.id}
                                                        type="button"
                                                        onClick={() => patch({ selectedAddressId: addr.id })}
                                                        className={[
                                                            "cursor-pointer w-full text-left rounded-lg border transition-all p-3",
                                                            selected
                                                                ? "border-[#2b0a59] bg-purple-50/30"
                                                                : "border-zinc-100 bg-white hover:border-zinc-200",
                                                        ].join(" ")}
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${selected ? "bg-[#2b0a59] text-white" : "bg-zinc-50 text-zinc-400"}`}>
                                                                <MapPin className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selected ? "text-[#2b0a59]" : "text-zinc-400"}`}>
                                                                        {addr.type}
                                                                    </span>
                                                                    {selected && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                                                                </div>
                                                                <p className="text-xs font-bold text-zinc-900 leading-snug truncate">{addr.address}</p>
                                                                <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                                                                    {[addr.landMark, addr.flatNo].filter(Boolean).join(", ")}
                                                                </p>
                                                                <p className="text-[11px] text-zinc-300 font-bold uppercase tracking-tighter mt-0.5">{addr.state} — {addr.pinCode}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PAYMENT MODE */}
                            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/50">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        Payment
                                    </span>
                                </div>
                                <div className="p-3 grid grid-cols-2 gap-2">
                                    {(["WALLET", "CASHFREE"] as const).map((mode) => {
                                        const sel = s.paymentMode === mode;
                                        return (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => patch({ paymentMode: mode })}
                                                className={[
                                                    "cursor-pointer flex items-center gap-2.5 rounded-lg border p-3 transition-all text-left",
                                                    sel
                                                        ? "border-[#2b0a59] bg-purple-50/30"
                                                        : "border-zinc-100 bg-white hover:border-zinc-200",
                                                ].join(" ")}
                                            >
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${sel ? "bg-[#2b0a59] text-white" : "bg-zinc-50 text-zinc-400"}`}>
                                                    {mode === "WALLET" ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-black uppercase tracking-tight ${sel ? "text-zinc-900" : "text-zinc-500"}`}>
                                                        {mode === "WALLET" ? "Wallet" : "Online"}
                                                    </p>
                                                    {mode === "WALLET" && s.walletBalance !== null && (
                                                        <p className={`text-[10px] font-bold ${s.walletBalance >= totalPayableAmount ? "text-emerald-600" : "text-rose-600"}`}>
                                                            {formatINR(s.walletBalance)}
                                                        </p>
                                                    )}
                                                    {mode === "CASHFREE" && (
                                                        <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-tighter">UPI / CARDS</p>
                                                    )}
                                                </div>
                                                <div className={`h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ml-auto ${sel ? "border-[#2b0a59]" : "border-zinc-100"}`}>
                                                    {sel && <div className="h-1.5 w-1.5 rounded-full bg-[#2b0a59]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* CHECKOUT CTA */}
                            {s.selectedAddressId ? (
                                <button
                                    type="button"
                                    disabled={s.loadingCheckout}
                                    onClick={handleCheckoutClick}
                                    className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2b0a59] px-4 py-4 text-sm font-black text-white shadow-xl shadow-purple-900/10 transition hover:bg-[#150b33] uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {s.loadingCheckout
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                                        : <><CheckCircle2 className="h-4 w-4" /> Pay {formatINR(totalPayableAmount)}</>}
                                </button>
                            ) : (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-center">
                                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider">
                                        Select an address to continue
                                    </p>
                                </div>
                            )}

                            {/* Trust badges */}
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { icon: "🔒", label: "Secure" },
                                    { icon: "🏅", label: "BIS Hallmarked" },
                                    { icon: "🚚", label: "Free Delivery" },
                                    { icon: "↩️", label: "Easy Returns" },
                                ].map(({ icon, label }) => (
                                    <div key={label} className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-white px-2.5 py-2 shadow-sm">
                                        <span className="text-sm">{icon}</span>
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CartPage;