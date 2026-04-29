import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ChevronRight,
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
} from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import { QuantitySelector } from "./components/ui/QuantitySelector";
import { useCart } from "./CartContext";
import {
    fetchAddresses,
    createOrder,
    fetchWalletBalance,
    confirmOrder,
    getUserProfile,
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
    walletConfirmOpen: boolean;
    removeConfirmVariantId: string | null;
    confirmOrderModalOpen: boolean;
    orderId: string | number | null;
    paymentSessionId: string | null;
    txnId: string | null;
    profileReminderOpen: boolean;
    checkoutStep: "cart" | "checkout";
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
        checkoutStep: "cart",
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
            const balRes  = balResult.status  === "fulfilled" ? balResult.value  : null;

            const mapped: Address[] = (addrRes?.data || addrRes || []).map((a: any) => ({
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
    }, []);

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

    const confirmRemove = () => {
        if (s.removeConfirmVariantId) removeFromCart(s.removeConfirmVariantId);
        patch({ removeConfirmVariantId: null });
    };

    const handleCheckoutClick = () => {
        if (!s.selectedAddressId) return;
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
                ...(redirectionUrl && { returnUrl: redirectionUrl }),
            });

            if (res.success) {
                const orderId = res.data.id || res.data.orderId;
                const orderNumber = res.data.orderNumber;

                if (s.paymentMode === "WALLET") {
                    clearCart();
                    navigate(`/physical-gold/profile?tab=orders`);
                    patch({ loadingCheckout: false });
                } else {
                    patch({
                        orderId,
                        orderSuccess: { orderNumber },
                        paymentSessionId: res.data.paymentSessionId,
                        txnId: res.data.txnId,
                        confirmOrderModalOpen: true,
                        loadingCheckout: false,
                    });
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
            await confirmOrder(s.orderId);
            if (s.paymentMode === "CASHFREE" && s.paymentSessionId) {
                const cashfree = await load({ mode: "sandbox" });
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
            <ConfirmModal
                isOpen={s.profileReminderOpen}
                onClose={() => patch({ profileReminderOpen: false })}
                onConfirm={() => { patch({ profileReminderOpen: false }); navigate("/physical-gold/profile"); }}
                title="Complete Your Profile"
                confirmLabel="Go to Profile"
                confirmClassName="bg-[#8B6914] text-white hover:bg-[#7A5C10]"
                description={<p>We need your profile details to process this order.</p>}
            />

            <main className="pt-40 pb-16 max-w-5xl mx-auto px-4 sm:px-6">

                {/* Back */}
                <button
                    onClick={() => navigate("/physical-gold")}
                    className="mb-2 mt-2 cursor-pointer inline-flex items-center gap-1.5 text-[14px] font-medium text-[#8A8A8A] hover:text-[#8B6914] transition"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
                </button>

                {/* Page Title + Breadcrumb */}
                <div className="mb-2">
                    <h1 className="text-[20px] font-semibold text-[#1A1A1A]">
                        {s.checkoutStep === "cart" ? `Shopping Cart (${totalItems})` : "Checkout"}
                    </h1>
                    <div className="flex items-center gap-2 text-[11px] text-[#8A8A8A]">
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

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

                    {/* LEFT — Cart Items or Checkout */}
                    <div className="space-y-3">
                        {s.checkoutStep === "cart" ? (
                            <>
                                {cartItems.map(({ cartId, product, variant, quantity }) => {
                                    const lineTotal = variant.price * quantity;
                                    return (
                                        <div
                                            key={variant.id}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-[#E8E0D5] bg-white hover:border-[#C9B87A] transition group"
                                        >
                                            {/* Image */}
                                            <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#F5F2EE] border border-[#E8E0D5]">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.productName}
                                                    className="h-full w-full object-cover mix-blend-multiply"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-[14px] font-semibold text-[#1A1A1A] leading-snug">{product.productName}</h3>
                                                    <button
                                                        onClick={() => requestRemove(variant.id)}
                                                        className="shrink-0 p-1 text-[#D1C7BB] hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-[#8A8A8A] mt-0.5">
                                                    {variant.purity} · {variant.weight}g · {variant.size || "Standard"}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <QuantitySelector
                                                        quantity={quantity}
                                                        onIncrease={() => handleIncrement(variant.id)}
                                                        onDecrease={() => handleDecrement(variant.id, cartId)}
                                                    />
                                                    <span className="text-[15px] font-semibold text-[#8B6914]">
                                                        ₹{lineTotal.toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="space-y-5">
                                {/* Delivery Address */}
                                <div className="bg-white border border-[#E8E0D5] rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Delivery Address</h3>
                                        <button
                                            onClick={() => navigate("/physical-gold/profile?tab=address")}
                                            className="text-[11px] font-medium text-[#8B6914] hover:underline"
                                        >
                                            Manage Addresses
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {s.addresses.map((addr) => (
                                            <button
                                                key={addr.id}
                                                onClick={() => patch({ selectedAddressId: addr.id })}
                                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${s.selectedAddressId === addr.id ? "border-[#8B6914] bg-[#F5EDD6]/30" : "border-[#E8E0D5] hover:border-[#C9B87A]"}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <MapPin size={14} className={`mt-0.5 shrink-0 ${s.selectedAddressId === addr.id ? "text-[#8B6914]" : "text-[#D1C7BB]"}`} />
                                                    <div>
                                                        <p className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider mb-0.5">{addr.type}</p>
                                                        <p className="text-[13px] font-medium text-[#1A1A1A]">{addr.address}</p>
                                                        <p className="text-[11px] text-[#8A8A8A]">{addr.landMark}, {addr.flatNo}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white border border-[#E8E0D5] rounded-xl p-5">
                                    <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Payment Method</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(["WALLET", "CASHFREE"] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => patch({ paymentMode: mode })}
                                                className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${s.paymentMode === mode ? "border-[#8B6914] bg-[#F5EDD6]/30" : "border-[#E8E0D5] hover:border-[#C9B87A]"}`}
                                            >
                                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.paymentMode === mode ? "bg-[#8B6914] text-white" : "bg-[#F5F2EE] text-[#D1C7BB]"}`}>
                                                    {mode === "WALLET" ? <Wallet size={16} /> : <CreditCard size={16} />}
                                                </div>
                                                <div className="text-left">
                                                    <p className={`text-[12px] font-semibold ${s.paymentMode === mode ? "text-[#8B6914]" : "text-[#1A1A1A]"}`}>
                                                        {mode === "WALLET" ? "OxyGold Wallet" : "Online Payment"}
                                                    </p>
                                                    <p className="text-[11px] text-[#8A8A8A]">
                                                        {mode === "WALLET" && s.walletBalance !== null
                                                            ? formatINR(s.walletBalance)
                                                            : "UPI, Cards, Net Banking"}
                                                    </p>
                                                </div>
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

                            <div className="space-y-2.5 mb-4">
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-[#8A8A8A]">Subtotal ({totalItems} items)</span>
                                    <span className="font-medium text-[#1A1A1A]">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-[#8A8A8A]">Making Charges</span>
                                    <span className="font-medium text-[#1A1A1A]">₹{totalMakingCharges.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-[#8A8A8A]">GST (3%)</span>
                                    <span className="font-medium text-[#1A1A1A]">₹{totalGstCharges.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-[#8A8A8A]">Shipping</span>
                                    <span className="font-medium text-emerald-600">Free</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-[#8A8A8A]">Insurance</span>
                                    <span className="font-medium text-[#1A1A1A]">Included</span>
                                </div>
                            </div>

                            <div className="border-t border-[#F0EBE1] pt-3 mb-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-semibold text-[#1A1A1A]">Total</span>
                                    <span className="text-[18px] font-bold text-[#8B6914]">
                                        ₹{totalPayableAmount.toLocaleString("en-IN")}
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
                            ) : (
                                <button
                                    disabled={!s.selectedAddressId || s.loadingCheckout}
                                    onClick={handleCheckoutClick}
                                    className="w-full py-2.5 rounded-lg bg-[#8B6914] text-white text-[13px] font-medium hover:bg-[#7A5C10] transition disabled:opacity-50 flex items-center justify-center"
                                >
                                    {s.loadingCheckout
                                        ? <Loader2 size={15} className="animate-spin" />
                                        : "Place Order"}
                                </button>
                            )}

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