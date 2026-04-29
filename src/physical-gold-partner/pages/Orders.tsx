import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/ui/Table';
import { ShoppingBag, Search, UserCheck, XCircle, Eye } from 'lucide-react';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { fetchActiveOrders, fetchOrdersByStatus, PartnerOrder } from '../services/partnerService';
import AssignOrderModal from '../components/AssignOrderModal';
import RejectOrderModal from '../components/RejectOrderModal';

const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<PartnerOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<PartnerOrder | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ASSIGNED');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadOrders();
    }, [selectedStatus, currentPage]);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await fetchOrdersByStatus(selectedStatus, currentPage, 10);
            const mappedOrders = (data.content || []).map((order: any) => ({
                orderId: order.id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentExpiry: order.createdAt,
                paymentMode: order.paymentMode,
                paymentSessionId: null,
                paymentStatus: order.paymentStatus,
                phoneNumber: order.phoneNumber || '',
                totalAmount: order.totalAmount,
                totalItems: order.totalItems,
                txnId: null,
                userEmail: order.userEmail || null,
                userId: order.userId || 0,
                userName: order.userName || null,
                items: order.items || [],
            }));
            setOrders(mappedOrders);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
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

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
            render: (val: string, item: PartnerOrder) => (
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
        {
            header: 'Actions',
            key: 'orderId',
            align: 'right' as const,
            render: (_: any, item: PartnerOrder) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => navigate(`/partner/orders/${item.orderId}`)}
                        className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-md transition-colors tooltip"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedOrder(item);
                            setIsAssignModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-md transition-colors"
                        title="Assign Delivery"
                    >
                        <UserCheck size={16} />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedOrder(item);
                            setIsRejectModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Reject Order"
                    >
                        <XCircle size={16} />
                    </button>
                </div>
            )
        }
    ];

    const handleRowClick = (order: PartnerOrder) => {
        navigate(`/partner/orders/${order.orderId}`);
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

            <div className="flex flex-wrap gap-2 mb-4">
                {[
                    { value: 'ASSIGNED', label: 'Assigned' },
                    { value: 'ACCEPTED', label: 'Accepted' },
                    { value: 'PICKED_UP', label: 'Picked Up' },
                    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                    { value: 'DELIVERED', label: 'Delivered' },
                    { value: 'REJECTED', label: 'Rejected' },
                    { value: 'FAILED', label: 'Failed' },
                    { value: 'REASSIGNED', label: 'Reassigned' },
                ].map((status) => (
                    <button
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        className={`px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-all ${
                            selectedStatus === status.value
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {status.label}
                    </button>
                ))}
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
                    emptyMessage="No orders found"
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    size={10}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Modals */}
            <AssignOrderModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                order={selectedOrder}
                onSuccess={loadOrders}
            />
            <RejectOrderModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                order={selectedOrder}
                onSuccess={loadOrders}
            />
        </div>
    );
};

export default Orders;

