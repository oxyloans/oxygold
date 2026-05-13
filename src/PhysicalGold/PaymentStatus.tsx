import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Package, ShoppingBag, ArrowLeft } from "lucide-react";
import { paymentWebhook, generateInvoice, getInvoicePdfUrl, getInvoicePreviewUrl } from "./physicalGoldService";
import { useCart } from "./CartContext";
import PhysicalGoldHeader from "./components/Header";

const PaymentStatusPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"SUCCESS" | "FAILED" | "PENDING" | "LOADING">("LOADING");
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const { clearCart } = useCart();

    const orderId = searchParams.get("order_id");
    const internalId = searchParams.get("internal_id");
    const urlOrderNumber = searchParams.get("order_number");

    useEffect(() => {
        if (!orderId) {
            setStatus("FAILED");
            return;
        }

        const handleVerify = async () => {
            try {
                const webhookRes = await paymentWebhook(orderId);
                const paymentStatus = webhookRes?.status; // "SUCCESS" | "PENDING" | "FAILED"

                if (paymentStatus === "SUCCESS") {
                    const generationId = internalId || orderId;
                    try {
                        await generateInvoice(generationId);
                        if (urlOrderNumber) setOrderNumber(urlOrderNumber);
                    } catch (invoiceErr) {
                        console.error("Invoice generation failed:", invoiceErr);
                    }
                    clearCart();
                    setStatus("SUCCESS");
                } else if (paymentStatus === "PENDING") {
                    setStatus("PENDING");
                } else {
                    setStatus("FAILED");
                }
            } catch (err) {
                console.error("Payment verification failed:", err);
                setStatus("FAILED");
            }
        };

        handleVerify();
    }, [orderId, clearCart, internalId, urlOrderNumber]);

    const handleDownloadInvoice = async () => {
        if (!orderNumber) return;
        try {
            const res = await getInvoicePdfUrl(orderNumber);
            const blob = await (res as any).blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error(err);
        }
    };

    const handlePreviewInvoice = async () => {
        if (!orderNumber) return;
        try {
            const res = await getInvoicePreviewUrl(orderNumber);
            const blob = await (res as any).blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-4 font-sans text-[#1A1A1A]">
            <div className="absolute top-0 left-0 w-full">
                <PhysicalGoldHeader />
            </div>

            <main className="w-full max-w-lg mt-36">
                <div className="relative overflow-hidden rounded-[32px] border border-[#E8E0D5] bg-white p-8 sm:p-12 shadow-[0_20px_50px_rgba(139,105,20,0.1)] text-center transition-all duration-500 hover:shadow-[0_20px_60px_rgba(139,105,20,0.15)]">

                    {/* Background Decorative Element */}
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#F5EDD6]/30 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#8B6914]/5 blur-3xl" />

                    {status === "LOADING" && (
                        <div className="relative space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#FDFCFB] border border-[#F5EDD6] shadow-inner">
                                <Clock className="h-10 w-10 text-[#8B6914] animate-spin-slow" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Verifying Payment</h2>
                                <p className="text-[14px] text-[#8A8A8A] font-medium max-w-[280px] mx-auto leading-relaxed">
                                    We're confirming your transaction with our payment partner. This usually takes just a few seconds.
                                </p>
                            </div>
                            <div className="flex justify-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#8B6914] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-1.5 w-1.5 rounded-full bg-[#8B6914] animate-bounce" style={{ animationDelay: '200ms' }} />
                                <span className="h-1.5 w-1.5 rounded-full bg-[#8B6914] animate-bounce" style={{ animationDelay: '400ms' }} />
                            </div>
                        </div>
                    )}

                    {status === "PENDING" && (
                        <div className="relative space-y-8 animate-in fade-in zoom-in duration-700">
                            <div className="mx-auto h-28 w-28 flex items-center justify-center rounded-[32px] bg-amber-50 border border-amber-500/20 shadow-sm">
                                <Clock className="h-14 w-14 text-amber-500" strokeWidth={1.5} />
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Payment Pending</h2>
                                <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
                                    Your payment is still being processed. Please check back after a few minutes or contact support if this persists.
                                </p>
                            </div>

                            <div className="bg-[#FDFCFB] border border-[#F5EDD6] rounded-2xl p-5 space-y-2">
                                <p className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-[0.15em]">Transaction Details</p>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-[#8A8A8A]">Status</span>
                                    <span className="font-semibold text-amber-500">Pending</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-[#8A8A8A]">Order ID</span>
                                    <span className="font-semibold text-[#1A1A1A]">#{urlOrderNumber || orderId}</span>
                                </div>
                            </div>

                            <div className="pt-2 space-y-3">
                                <button
                                    onClick={() => navigate("/physical-gold/profile?tab=orders")}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#1A1200] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-black/10 transition hover:bg-[#2A1E00] active:scale-[0.98]"
                                >
                                    <Package className="h-4 w-4" />
                                    Check Order Status
                                </button>
                                <button
                                    onClick={() => navigate("/physical-gold")}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2.5 rounded-2xl border border-[#E8E0D5] bg-white px-6 py-4 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#FDFCFB] hover:border-[#8B6914]/30"
                                >
                                    <ShoppingBag className="h-4 w-4 text-[#8B6914]" />
                                    Return to Store
                                </button>
                            </div>
                        </div>
                    )}

                    {status === "SUCCESS" && (
                        <div className="relative space-y-8 animate-in fade-in zoom-in duration-700">
                            <div className="mx-auto relative h-28 w-28">
                                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping duration-[2000ms]" />
                                <div className="relative flex h-28 w-28 items-center justify-center rounded-[32px] bg-emerald-50 border border-emerald-500/20 shadow-sm">
                                    <CheckCircle2 className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Payment Successful</h2>
                                <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
                                    Your order <span className="text-[#8B6914] font-semibold">#{orderNumber || orderId}</span> has been successfully placed and is being processed.
                                </p>
                            </div>

                            <div className="bg-[#FDFCFB] border border-[#F5EDD6] rounded-2xl p-5 space-y-4">
                                <p className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-[0.15em]">Transaction Details</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-[#8A8A8A]">Status</span>
                                        <span className="font-semibold text-emerald-600">Paid</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 space-y-3">
                                <button
                                    onClick={() => navigate("/physical-gold/profile?tab=orders")}
                                    className="cursor-pointer w-full group flex items-center justify-center gap-2.5 rounded-2xl bg-[#1A1200] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-black/10 transition hover:bg-[#2A1E00] active:scale-[0.98]"
                                >
                                    <Package className="h-4 w-4" />
                                    Track Your Order
                                </button>
                                <button
                                    onClick={() => navigate("/physical-gold")}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2.5 rounded-2xl border border-[#E8E0D5] bg-white px-6 py-4 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#FDFCFB] hover:border-[#8B6914]/30"
                                >
                                    <ShoppingBag className="h-4 w-4 text-[#8B6914]" />
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    )}

                    {status === "FAILED" && (
                        <div className="relative space-y-8 animate-in fade-in zoom-in duration-700">
                            <div className="mx-auto h-28 w-28 flex items-center justify-center rounded-[32px] bg-rose-50 border border-rose-500/20 shadow-sm">
                                <XCircle className="h-14 w-14 text-rose-500" strokeWidth={1.5} />
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Payment Failed</h2>
                                <p className="text-[15px] text-[#6B6B6B] leading-relaxed">
                                    We couldn't process your payment. Don't worry, if any amount was debited, it will be refunded within 3-5 business days.
                                </p>
                            </div>

                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={() => navigate("/physical-gold/cart")}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#8B6914] px-6 py-4 text-sm font-bold text-white shadow-xl shadow-[#8B6914]/20 transition hover:bg-[#7A5C10] active:scale-[0.98]"
                                >
                                    Retry Payment
                                </button>
                                <button
                                    onClick={() => navigate("/physical-gold")}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2.5 rounded-2xl border border-[#E8E0D5] bg-white px-6 py-4 text-sm font-semibold text-[#8A8A8A] transition hover:bg-[#FDFCFB]"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Return to Store
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#BEB5AA]">
                        <span className="h-px w-8 bg-[#E8E0D5]" />
                        Secure Checkout & Encrypted Payment
                        <span className="h-px w-8 bg-[#E8E0D5]" />
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default PaymentStatusPage;
