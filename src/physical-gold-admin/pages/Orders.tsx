import React, { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import { ShoppingBag, Search, User, Phone, Mail, CreditCard, Calendar, Box } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { fetchActiveOrders, AdminOrder } from '../services/adminService';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await fetchActiveOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
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

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phoneNumber.includes(searchTerm)
    );

    const columns = [
        {
            header: 'Order #',
            key: 'orderNumber',
            render: (val: string) => <span className="font-bold text-slate-800 tabular-nums">{val}</span>
        },
        {
            header: 'Customer',
            key: 'userName',
            render: (val: string, item: AdminOrder) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{val || 'Anonymous'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.phoneNumber}</span>
                </div>
            )
        },
        {
            header: 'Total Amount',
            key: 'totalAmount',
            render: (val: number) => <span className="text-emerald-600 font-bold tabular-nums">{formatCurrency(val)}</span>
        },
        {
            header: 'Payment Status',
            key: 'paymentStatus',
            render: (val: string) => (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(val)}`}>
                    {val}
                </span>
            )
        },
        {
            header: 'Order Status',
            key: 'orderStatus',
            render: (val: string) => (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(val)}`}>
                    {val}
                </span>
            )
        },
    ];

    const handleRowClick = (order: AdminOrder) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="text-emerald-600" size={22} />
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Orders Management</h1>
                    </div>
                    <p className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-tight">Manage and track customer active orders here</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="md" onClick={loadOrders}>
                        Refresh
                    </Button>
                    <Button variant="primary" size="md">
                        Export Orders
                    </Button>
                </div>
            </div>

            <div className="max-w-md relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500" />
                <input
                    type="text"
                    placeholder="Search by order ID, name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm shadow-slate-100/50"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table
                    columns={columns}
                    data={filteredOrders}
                    isLoading={isLoading}
                    onRowClick={handleRowClick}
                    emptyMessage="No active orders found"
                />
            </div>

            {/* Order Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Order Details - ${selectedOrder?.orderNumber}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Status Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <ShoppingBag size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Order Status</span>
                                </div>
                                <span className={`text-[12px] font-bold uppercase ${getStatusColor(selectedOrder.orderStatus).split(' ')[1]}`}>
                                    {selectedOrder.orderStatus}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <CreditCard size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Payment Status</span>
                                </div>
                                <span className={`text-[12px] font-bold uppercase ${getStatusColor(selectedOrder.paymentStatus).split(' ')[1]}`}>
                                    {selectedOrder.paymentStatus}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Payment Expiry</span>
                                </div>
                                <span className="text-[12px] font-bold text-slate-700">
                                    {formatDate(selectedOrder.paymentExpiry)}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Box size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Payment Mode</span>
                                </div>
                                <span className="text-[12px] font-bold text-slate-700 uppercase">
                                    {selectedOrder.paymentMode}
                                </span>
                            </div>
                        </div>

                        {/* Customer & Transaction Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                                    <User size={16} className="text-emerald-600" />
                                    Customer Information
                                </h3>
                                <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                            <User size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Full Name</span>
                                            <span className="text-[13px] font-bold text-slate-700">{selectedOrder.userName || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                            <Phone size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</span>
                                            <span className="text-[13px] font-bold text-slate-700">{selectedOrder.phoneNumber}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                            <Mail size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                                            <span className="text-[13px] font-bold text-slate-700">{selectedOrder.userEmail || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                                    <CreditCard size={16} className="text-emerald-600" />
                                    Transaction Details
                                </h3>
                                <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3 shadow-sm">
                                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                        <span className="text-[12px] text-slate-500">Transaction ID</span>
                                        <span className="text-[12px] font-bold text-slate-700 tabular-nums">{selectedOrder.txnId || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                        <span className="text-[12px] text-slate-500">Payment Session ID</span>
                                        <span className="text-[12px] font-bold text-slate-700 truncate max-w-[150px]">{selectedOrder.paymentSessionId || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                        <span className="text-[12px] text-slate-500">Total Items</span>
                                        <span className="text-[12px] font-bold text-slate-700">{selectedOrder.totalItems}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-[13px] font-bold text-slate-800">Total Amount</span>
                                        <span className="text-[15px] font-bold text-emerald-600 tabular-nums">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="space-y-4">
                            <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                                <Box size={16} className="text-emerald-600" />
                                Order Items
                            </h3>
                            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[12px]">
                                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider tabular-nums">
                                        <tr>
                                            <th className="px-4 py-3">Product ID</th>
                                            <th className="px-4 py-3">Price</th>
                                            <th className="px-4 py-3">Quantity</th>
                                            <th className="px-4 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-700">#{item.productId}</td>
                                                <td className="px-4 py-3 text-slate-600 tabular-nums">{formatCurrency(item.price)}</td>
                                                <td className="px-4 py-3 text-slate-600 tabular-nums">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-700 tabular-nums">{formatCurrency(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/50 font-bold">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-slate-500">Total</td>
                                            <td className="px-4 py-3 text-right text-emerald-600 text-[14px] tabular-nums">{formatCurrency(selectedOrder.totalAmount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
                                Close Details
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Orders;

