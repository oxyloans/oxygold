import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Package, ShoppingBag, ArrowLeft } from "lucide-react";
import { paymentWebhook, generateInvoice, getInvoicePdfUrl, getInvoicePreviewUrl } from "./physicalGoldService";
import { useCart } from "./CartContext";
import PhysicalGoldHeader from "./PhysicalGoldHeader";

const PaymentStatusPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"SUCCESS" | "FAILED" | "PENDING" | "LOADING">("LOADING");
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const { clearCart } = useCart();

    // In a real scenario, we would verify the orderId with the backend
    const orderId = searchParams.get("order_id");
    const internalId = searchParams.get("internal_id");
    const urlOrderNumber = searchParams.get("order_number");

    useEffect(() => {
        console.log("Current URL search params:", window.location.search);
        console.log("Retrieved orderId:", orderId);
        if (!orderId) {
            setStatus("FAILED");
            return;
        }

        const handleVerify = async () => {
            try {
                // Call webhook to confirm payment with backend (always uses txnId/order_id from URL)
                await paymentWebhook(orderId);

                // Use internalId from URL if available, otherwise fallback to webhook data
                // In latest flow, internal_id should be in the URL params
                const generationId = internalId || orderId;

                // If successful, generate invoice and show success
                try {
                    await generateInvoice(generationId);
                    // Use order_number from URL or fallback
                    if (urlOrderNumber) {
                        setOrderNumber(urlOrderNumber);
                    }
                } catch (invoiceErr) {
                    console.error("Invoice generation failed:", invoiceErr);
                    // We don't fail the whole page just because invoice failed
                }

                clearCart();
                setStatus("SUCCESS");
            } catch (err) {
                console.error("Payment verification failed:", err);
                setStatus("FAILED");
            }
        };

        handleVerify();
    }, [orderId, clearCart]);

    const handleDownloadInvoice = () => {
        if (!orderNumber) return;
        window.open(getInvoicePdfUrl(orderNumber), '_blank');
    };

    const handlePreviewInvoice = () => {
        if (!orderNumber) return;
        window.open(getInvoicePreviewUrl(orderNumber), '_blank');
    };

    return (
        <div className="min-h-screen bg-[#F1F3F9] text-zinc-900">
            <PhysicalGoldHeader cartItemCount={0} />

            <main className="pt-24 sm:pt-32 pb-12">
                <div className="mx-auto max-w-lg px-4">
                    <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-lg shadow-zinc-200/50 text-center animate-in fade-in zoom-in duration-500">
                        {status === "LOADING" && (
                            <div className="space-y-6">
                                <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-100">
                                    <Clock className="h-10 w-10 text-zinc-300 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 mb-2">Verifying Payment</h2>
                                    <p className="text-zinc-500 font-medium">Please wait while we confirm your transaction...</p>
                                </div>
                            </div>
                        )}

                        {status === "SUCCESS" && (
                            <div className="space-y-6">
                                <div className="relative mx-auto h-24 w-24">
                                    <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 border border-emerald-500/20">
                                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 mb-2">Order Confirmed!</h2>
                                    <p className="text-zinc-500 font-medium leading-relaxed">
                                        Your payment was successful and order <span className="text-[#2b0a59] font-black">#{orderNumber || orderId}</span> has been placed.
                                    </p>
                                </div>

                                {orderNumber && (
                                    <div className="flex flex-col gap-2 py-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={handlePreviewInvoice}
                                                className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50 uppercase tracking-wider"
                                            >
                                                Preview Invoice
                                            </button>
                                            <button
                                                onClick={handleDownloadInvoice}
                                                className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-zinc-800 uppercase tracking-wider shadow-sm"
                                            >
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 space-y-3">
                                    <button
                                        onClick={() => navigate("/physical-gold/orders")}
                                        className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2b0a59] px-6 py-4 text-sm font-black text-white shadow-xl shadow-purple-900/20 transition hover:bg-[#150b33] uppercase tracking-wider"
                                    >
                                        <Package className="h-4 w-4" /> Track My Order
                                    </button>
                                    <button
                                        onClick={() => navigate("/physical-gold")}
                                        className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-4 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 uppercase tracking-wider shadow-sm"
                                    >
                                        <ShoppingBag className="h-4 w-4" /> Continue Shopping
                                    </button>
                                </div>
                            </div>
                        )}

                        {status === "FAILED" && (
                            <div className="space-y-6">
                                <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-rose-50 border border-rose-500/20">
                                    <XCircle className="h-12 w-12 text-rose-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 mb-2">Payment Failed</h2>
                                    <p className="text-zinc-500 font-medium leading-relaxed">
                                        Something went wrong with your transaction. No funds were debited from your account.
                                    </p>
                                </div>
                                <div className="pt-4 space-y-3">
                                    <button
                                        onClick={() => navigate("/physical-gold/cart")}
                                        className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2b0a59] px-6 py-4 text-sm font-black text-white shadow-xl shadow-purple-900/20 transition hover:bg-[#150b33] uppercase tracking-wider"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => navigate("/physical-gold")}
                                        className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-4 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 uppercase tracking-wider shadow-sm"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Go Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            Secure Transaction · OxyGold Physical Store
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentStatusPage;
