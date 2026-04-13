import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, User, Phone, Mail, CreditCard, Calendar, Box, UserCheck, XCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { fetchActiveOrders, PartnerOrder } from '../services/partnerService';
import AssignOrderModal from '../components/AssignOrderModal';
import RejectOrderModal from '../components/RejectOrderModal';

const OrderDetails: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<PartnerOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        if (!orderId) return;
        setIsLoading(true);
        try {
            const orders = await fetchActiveOrders();
            const foundOrder = orders.find(o => o.orderId.toString() === orderId);
            setOrder(foundOrder || null);
        } catch (error) {
            console.error("Failed to fetch order details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('success') || s.includes('confirmed') || s.includes('completed')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (s.includes('pending') || s.includes('processing')) return 'bg-amber-50 text-amber-600 border-amber-100';
        if (s.includes('fail') || s.includes('cancel')) return 'bg-rose-50 text-rose-600 border-rose-100';
        return 'bg-slate-50 text-slate-600 border-slate-100';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-slate-400 font-medium">Fetching order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <ShoppingBag size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-700">Order Not Found</h2>
                <p className="text-slate-400">The order you're looking for doesn't exist or is no longer active.</p>
                <Button variant="outline" onClick={() => navigate('/partner/orders')}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/partner/orders')}
                        className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100 shadow-sm shadow-transparent hover:shadow-slate-100 group"
                    >
                        <ArrowLeft size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Order #{order.orderNumber}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                            </span>
                        </div>
                        <p className="text-[13px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                            Placed on {formatDate(order.paymentExpiry)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="md"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 gap-2"
                        onClick={() => setIsRejectModalOpen(true)}
                    >
                        <XCircle size={16} /> Reject Order
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        className="gap-2 shadow-lg shadow-emerald-100"
                        onClick={() => setIsAssignModalOpen(true)}
                    >
                        <UserCheck size={16} /> Assign Order
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <CreditCard size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Payment</span>
                            </div>
                            <span className={`text-[13px] font-bold uppercase ${getStatusColor(order.paymentStatus).split(' ')[1]}`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Box size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Method</span>
                            </div>
                            <span className="text-[13px] font-bold text-slate-700 uppercase">
                                {order.paymentMode}
                            </span>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <ShoppingBag size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Items</span>
                            </div>
                            <span className="text-[13px] font-bold text-slate-700">
                                {order.totalItems} Products
                            </span>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Calendar size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Total</span>
                            </div>
                            <span className="text-lg font-bold text-emerald-600 tabular-nums leading-none">
                                {formatCurrency(order.totalAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                                <Box size={18} className="text-emerald-600" />
                                Order Items
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
                                {order.items.length} Items Total
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider tabular-nums">
                                    <tr>
                                        <th className="px-6 py-3">Product Information</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Quantity</th>
                                        <th className="px-6 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 font-bold text-[10px]">
                                                        #{item.productId}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-slate-700">Digital Gold Product</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-600 tabular-nums">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 rounded-md text-[12px] font-bold text-slate-600 tabular-nums">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-700 tabular-nums text-[13px]">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50/30 font-bold">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-right text-[13px] text-slate-500">Subtotal</td>
                                        <td className="px-6 py-4 text-right text-slate-700 text-[13px] tabular-nums">{formatCurrency(order.totalAmount)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-right text-[13px] text-slate-500">Shipping</td>
                                        <td className="px-6 py-4 text-right text-emerald-600 text-[13px]">FREE</td>
                                    </tr>
                                    <tr className="border-t border-slate-100">
                                        <td colSpan={3} className="px-6 py-5 text-right text-[14px] font-extrabold text-slate-800">Total Amount</td>
                                        <td className="px-6 py-5 text-right text-emerald-600 text-[18px] font-extrabold tabular-nums">{formatCurrency(order.totalAmount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Transaction */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50">
                            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                                <User size={18} className="text-emerald-600" />
                                Customer Info
                            </h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                                    <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Full Name</span>
                                    <span className="text-[14px] font-bold text-slate-700">{order.userName || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                                    <Phone size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Contact Number</span>
                                    <span className="text-[14px] font-bold text-slate-700 tabular-nums">{order.phoneNumber}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                                    <Mail size={16} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Email Address</span>
                                    <span className="text-[14px] font-bold text-slate-700 truncate">{order.userEmail || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50">
                            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                                <CreditCard size={18} className="text-emerald-600" />
                                Transaction
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 border-dashed">
                                <span className="text-[12px] text-slate-400 font-medium">Transaction ID</span>
                                <span className="text-[12px] font-bold text-slate-600 tabular-nums">{order.txnId || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1 py-1">
                                <span className="text-[12px] text-slate-400 font-medium">Payment Session ID</span>
                                <span className="text-[11px] font-medium text-slate-500 bg-slate-50 p-2 rounded-lg break-all border border-slate-100">
                                    {order.paymentSessionId || 'N/A'}
                                </span>
                            </div>
                            <div className="py-3 px-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
                                <span className="text-[11px] font-bold text-emerald-800 uppercase">Paid Amount</span>
                                <span className="text-lg font-bold text-emerald-600 tabular-nums">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AssignOrderModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                order={order}
                onSuccess={loadOrderDetails}
            />
            <RejectOrderModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                order={order}
                onSuccess={loadOrderDetails}
            />
        </div>
    );
};

export default OrderDetails;
