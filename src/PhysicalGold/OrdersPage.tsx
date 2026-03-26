import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronLeft, Calendar, Tag, CreditCard, ChevronDown, ChevronUp, ShoppingBag, FileText } from "lucide-react";
import { fetchUserOrders, getInvoicePdfUrl, getInvoicePreviewUrl } from "./physicalGoldService";
import { Order } from "./physicalGoldData";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PhysicalGoldHeader from "./PhysicalGoldHeader";
import { useCart } from "./CartContext";

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { totalItems } = useCart();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            const stored = localStorage.getItem("user");
            if (!stored) {
                navigate("/login");
                return;
            }
            const userData = JSON.parse(stored);
            const userId = userData.data.userId;

            try {
                const data = await fetchUserOrders(userId);
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [navigate]);

    const toggleExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CONFIRMED': return 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-500/5';
            case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100 shadow-sm shadow-amber-500/5';
            case 'CANCELLED': return 'text-rose-600 bg-rose-50 border-rose-100 shadow-sm shadow-rose-500/5';
            default: return 'text-zinc-500 bg-zinc-50 border-zinc-100';
        }
    };

    return (
        <div className="min-h-screen bg-[#FBF8F3] text-zinc-900">
            <PhysicalGoldHeader
                cartItemCount={totalItems}
            />

            <main className="max-w-5xl mx-auto px-4 pt-20 pb-12">
                <button
                    onClick={() => navigate("/physical-gold")}
                    className="flex items-center gap-2 text-zinc-500 hover:text-yellow-600 transition-colors mb-6 group cursor-pointer"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-semibold">Back to Store</span>
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-[#2b0a59] flex items-center justify-center shadow-lg shadow-purple-500/10">
                        <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900">My Orders</h1>
                        <p className="text-zinc-500 text-sm font-medium">View and track your order history</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner size="md" />
                        <p className="mt-4 text-zinc-400 font-medium">Fetching your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl border border-zinc-200 bg-white shadow-sm">
                        <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="h-10 w-10 text-zinc-200" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-zinc-900">No orders found</h2>
                        <p className="text-zinc-500 mb-8 font-medium">You haven't placed any orders yet.</p>
                        <button
                            onClick={() => navigate("/physical-gold")}
                            className="bg-[#2b0a59] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#150b33] transition-all active:scale-95 shadow-lg shadow-purple-500/10 uppercase tracking-wider text-xs"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.orderId}
                                className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-all hover:shadow-md"
                            >
                                <div
                                    onClick={() => toggleExpand(order.orderId)}
                                    className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Order Number</p>
                                            <p className="font-mono text-sm font-bold text-[#2b0a59]">{order.orderNumber}</p>
                                        </div>
                                        <div className="h-8 w-px bg-zinc-100 hidden sm:block" />
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Placed On</p>
                                            <div className="flex items-center gap-2 text-sm text-zinc-700 font-medium">
                                                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                                <span>{formatDate(order.paymentExpiry)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-zinc-50 sm:border-0 pt-4 sm:pt-0">
                                        <div className="text-right space-y-1">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Total Amount</p>
                                            <p className="text-lg font-black text-zinc-900">{formatCurrency(order.totalAmount)}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </div>
                                        <div className="text-zinc-400 group-hover:text-zinc-900 transition-colors">
                                            {expandedOrderId === order.orderId ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                        </div>
                                    </div>
                                </div>

                                {expandedOrderId === order.orderId && (
                                    <div className="border-t border-zinc-100 bg-zinc-50 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                                        <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-zinc-400">
                                            <Tag className="h-3.5 w-3.5" />
                                            <span>Order Items ({order.totalItems})</span>
                                        </h3>
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white border border-zinc-200 shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-100 text-zinc-400 text-[10px] font-bold">
                                                            P{item.productId}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-900">Product ID: {item.productId}</p>
                                                            <p className="text-xs text-zinc-500 font-medium tracking-tight">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-zinc-900">{formatCurrency(item.subtotal)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between pt-6 border-t border-zinc-200">
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                <span>Paid via {order.paymentMode}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span>Payment Status: {order.paymentStatus}</span>
                                            </div>
                                        </div>

                                        {(order.orderStatus === 'CONFIRMED' || order.orderStatus === 'DELIVERED') && (
                                            <div className="mt-4 flex justify-end pt-4 border-t border-zinc-100">
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            const response = await getInvoicePreviewUrl(order.orderNumber);
                                                            const blob = await response.blob();
                                                            const objectUrl = URL.createObjectURL(blob);
                                                            window.open(objectUrl, '_blank');
                                                        } catch (err) {
                                                            console.error("Failed to preview invoice:", err);
                                                        }
                                                    }}
                                                    className="cursor-pointer flex items-center gap-2 rounded-xl bg-[#2b0a59] px-5 py-2.5 text-[10px] font-black text-white transition hover:bg-[#150b33] uppercase tracking-wider shadow-sm shadow-purple-500/10"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Preview Invoice
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrdersPage;