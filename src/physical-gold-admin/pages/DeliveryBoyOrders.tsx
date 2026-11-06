import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Bike,
    CheckCircle2,
    Clock,
    Eye,
    MapPin,
    Package,
    PackageCheck,
    Phone,
    RefreshCw,
    Search,
    Truck,
    User,
    Mail,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Toast, { ToastType } from '../../PhysicalGold/components/Toast';
import {
    DeliveryBoy,
    DeliveryBoyOrder,
    DeliveryBoyOrdersPageData,
    fetchAdminDeliveryBoys,
    fetchDeliveryBoyOrders,
} from '../services/adminService';

type OrderStatusFilter =
    | 'ASSIGNED'
    | 'ACCEPTED'
    | 'PICKED_UP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'REJECTED'
    | 'FAILED'
    | 'REASSIGNED';

interface StatusTabConfig {
    key: OrderStatusFilter;
    label: string;
}

const STATUS_TABS: StatusTabConfig[] = [
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'FAILED', label: 'Failed' },
    { key: 'REASSIGNED', label: 'Reassigned' },
];

const DeliveryBoyOrders: React.FC = () => {
    const { boyId } = useParams<{ boyId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [boy, setBoy] = useState<DeliveryBoy | null>((location.state as any)?.boy || null);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>('ASSIGNED');
    const [pageData, setPageData] = useState<DeliveryBoyOrdersPageData | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageSize = 10;
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Modal state for viewing order details
    const [selectedOrder, setSelectedOrder] = useState<DeliveryBoyOrder | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

    // If boy not in state (e.g. direct reload), load from boys list
    useEffect(() => {
        if (!boy && boyId) {
            fetchAdminDeliveryBoys()
                .then(boys => {
                    const found = boys.find(b => String(b.id) === boyId || String(b.userId) === boyId);
                    if (found) setBoy(found);
                })
                .catch(err => console.error('Failed to load delivery boy details', err));
        }
    }, [boy, boyId]);

    // Fetch orders when boyId, selectedStatus, or currentPage changes
    const loadOrders = async () => {
        if (!boyId) return;
        setLoading(true);
        try {
            const data = await fetchDeliveryBoyOrders(boyId, selectedStatus, currentPage, pageSize);
            setPageData(data);
        } catch (error: any) {
            console.error('Error loading delivery orders:', error);
            setToast({
                type: 'error',
                message: error.message || `Failed to fetch ${selectedStatus} orders.`,
            });
            setPageData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [boyId, selectedStatus, currentPage]);

    const handleStatusTabChange = (status: OrderStatusFilter) => {
        if (selectedStatus === status) return;
        setSelectedStatus(status);
        setCurrentPage(0); // Reset to first page
    };

    const formatDate = (value: string | null | undefined) =>
        value
            ? new Date(value).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '—';

    const ordersList = pageData?.content || [];

    const filteredOrders = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return ordersList;
        return ordersList.filter(
            order =>
                (order.orderNumber || '').toLowerCase().includes(q) ||
                (order.trackingNumber || '').toLowerCase().includes(q) ||
                (order.customerName || '').toLowerCase().includes(q) ||
                (order.customerPhone || '').includes(q) ||
                String(order.deliveryId || '').includes(q) ||
                String(order.orderId || '').includes(q)
        );
    }, [ordersList, searchTerm]);

    return (
        <div className="space-y-6">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* <button
                        type="button"
                        onClick={() => navigate('/admin/delivery')}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                    >
                        <ArrowLeft size={14} /> Back to Delivery Team
                    </button> */}
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                            <Bike className="text-emerald-600" size={22} />
                            Delivery Personnel Orders
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-400">
                            Assigned orders and fulfillment status for this delivery person
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadOrders} disabled={loading}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Delivery Person Profile Header Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-600/30 text-[#8B6914] font-black text-lg border border-amber-200/60 shadow-xs">
                            {boy ? `${boy.firstName?.[0] || ''}${boy.lastName?.[0] || ''}`.toUpperCase() : <User size={20} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-800">
                                    {boy ? `${boy.firstName} ${boy.lastName}` : `Delivery Person #${boyId}`}
                                </h2>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                {boy?.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone size={12} className="text-slate-400" />
                                        {boy.phone}
                                    </span>
                                )}
                                {boy?.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail size={12} className="text-slate-400" />
                                        {boy.email}
                                    </span>
                                )}
                                {boy?.vehicleNumber && (
                                    <span className="flex items-center gap-1 font-medium text-slate-700">
                                        <Bike size={12} className="text-emerald-600" />
                                        {boy.vehicleType || 'Vehicle'}: {boy.vehicleNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {pageData && (
                            <span className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                                Total: {pageData.totalElements} {pageData.totalElements === 1 ? 'Order' : 'Orders'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs (Clean buttons without colored dots) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
                {STATUS_TABS.map(tab => {
                    const isSelected = selectedStatus === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleStatusTabChange(tab.key)}
                            className={`whitespace-nowrap rounded-xl px-4 py-2 transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-[#8B6914] text-white shadow-sm font-bold'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Search and Table Area */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                {/* Search header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {STATUS_TABS.find(t => t.key === selectedStatus)?.label} Orders
                        </span>
                        {pageData && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                {pageData.totalElements}
                            </span>
                        )}
                    </div>
                    <div className="relative min-w-[240px] max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search order #, customer..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* Table for Desktop */}
                {loading ? (
                    <div className="py-20 text-center">
                        <RefreshCw size={26} className="mx-auto animate-spin text-emerald-600" />
                        <p className="mt-3 text-xs font-semibold text-slate-500">Loading orders...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-[#FBF7EC]">
                                    <tr className="border-b border-[#E8D8A8] text-[10px] font-bold uppercase tracking-wider text-[#8B6914]">
                                        <th className="px-4 py-3">Order &amp; Delivery ID</th>
                                        <th className="px-4 py-3">Customer Details</th>
                                        <th className="px-4 py-3">Delivery Address</th>
                                        <th className="px-4 py-3">Timestamps</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.map(order => (
                                        <tr key={order.deliveryId || order.orderId} className="align-top transition-colors hover:bg-slate-50/70">
                                            {/* Order & Delivery ID */}
                                            <td className="px-4 py-3.5">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-emerald-700">
                                                        {order.orderNumber || `ORD-${order.orderId}`}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                                                        <span>Order ID: #{order.orderId}</span>
                                                    </div>
                                                    <span className="inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200/60">
                                                        Delivery #{order.deliveryId}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Customer Details */}
                                            <td className="px-4 py-3.5">
                                                <p className="text-xs font-bold text-slate-800">
                                                    {order.customerName || '—'}
                                                </p>
                                                {order.customerPhone && (
                                                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                                                        <Phone size={11} className="text-slate-400" />
                                                        {order.customerPhone}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Delivery Address */}
                                            <td className="max-w-[280px] px-4 py-3.5">
                                                <p className="flex gap-1.5 text-[11px] leading-5 text-slate-600">
                                                    <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                                                    <span>{order.deliveryAddress || 'Address not provided'}</span>
                                                </p>
                                            </td>

                                            {/* Timestamps */}
                                            <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-slate-500 space-y-1">
                                                {order.assignedAt && (
                                                    <p className="flex items-center gap-1.5">
                                                        <Clock size={11} className="text-amber-500" />
                                                        <span>Assigned: {formatDate(order.assignedAt)}</span>
                                                    </p>
                                                )}
                                                {order.acceptedAt && (
                                                    <p className="flex items-center gap-1.5">
                                                        <CheckCircle2 size={11} className="text-blue-500" />
                                                        <span>Accepted: {formatDate(order.acceptedAt)}</span>
                                                    </p>
                                                )}
                                                {order.pickedUpAt && (
                                                    <p className="flex items-center gap-1.5">
                                                        <Package size={11} className="text-indigo-500" />
                                                        <span>Picked: {formatDate(order.pickedUpAt)}</span>
                                                    </p>
                                                )}
                                                {order.outForDeliveryAt && (
                                                    <p className="flex items-center gap-1.5">
                                                        <Truck size={11} className="text-purple-500" />
                                                        <span>Out: {formatDate(order.outForDeliveryAt)}</span>
                                                    </p>
                                                )}
                                                {order.deliveredAt && (
                                                    <p className="flex items-center gap-1.5 font-semibold text-emerald-700">
                                                        <PackageCheck size={11} className="text-emerald-600" />
                                                        <span>Delivered: {formatDate(order.deliveredAt)}</span>
                                                    </p>
                                                )}
                                            </td>

                                            {/* Action Button: View */}
                                            <td className="px-4 py-3.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsDetailsModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B6914] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#725510] transition cursor-pointer"
                                                >
                                                    <Eye size={13} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards for Mobile */}
                        <div className="grid gap-3 p-4 md:hidden">
                            {filteredOrders.map(order => (
                                <article
                                    key={order.deliveryId || order.orderId}
                                    className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                                        <div>
                                            <span className="text-xs font-bold text-emerald-700">
                                                {order.orderNumber || `ORD-${order.orderId}`}
                                            </span>
                                            <p className="text-[10px] font-mono text-slate-400">
                                                Delivery #{order.deliveryId} • Order #{order.orderId}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setIsDetailsModalOpen(true);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-md bg-[#8B6914] px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:bg-[#725510] transition cursor-pointer"
                                        >
                                            <Eye size={12} /> View
                                        </button>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{order.customerName || '—'}</p>
                                        {order.customerPhone && (
                                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                                                <Phone size={10} /> {order.customerPhone}
                                            </p>
                                        )}
                                        <p className="mt-1.5 flex gap-1 text-[11px] text-slate-600">
                                            <MapPin size={11} className="mt-0.5 shrink-0 text-emerald-600" />
                                            <span>{order.deliveryAddress || 'Address not provided'}</span>
                                        </p>
                                    </div>

                                    <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 space-y-1">
                                        {order.assignedAt && <p>Assigned: {formatDate(order.assignedAt)}</p>}
                                        {order.deliveredAt && <p className="text-emerald-700 font-semibold">Delivered: {formatDate(order.deliveredAt)}</p>}
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination Bar */}
                        {pageData && pageData.totalPages > 1 && (
                            <Pagination
                                currentPage={pageData.number ?? currentPage}
                                totalPages={pageData.totalPages}
                                onPageChange={page => setCurrentPage(page)}
                                totalElements={pageData.totalElements}
                                size={pageSize}
                            />
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center">
                        <Package size={34} className="mx-auto text-slate-300" />
                        <p className="mt-3 text-sm font-bold text-slate-700">
                            No {STATUS_TABS.find(t => t.key === selectedStatus)?.label.toLowerCase()} orders found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            {searchTerm
                                ? 'No orders match your search criteria.'
                                : `There are currently no orders with "${selectedStatus}" status for this personnel.`}
                        </p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedOrder(null);
                }}
                title={`Order Details - ${selectedOrder?.orderNumber || (selectedOrder?.orderId ? `#${selectedOrder.orderId}` : '')}`}
                size="lg"
                footer={
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedOrder(null);
                        }}
                    >
                        Close
                    </Button>
                }
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        {/* Summary Badges Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Delivery ID
                                </span>
                                <span className="text-xs font-extrabold text-[#8B6914] font-mono">
                                    #{selectedOrder.deliveryId}
                                </span>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Order ID
                                </span>
                                <span className="text-xs font-extrabold text-slate-800 font-mono">
                                    #{selectedOrder.orderId}
                                </span>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Tracking #
                                </span>
                                <span className="text-xs font-semibold text-slate-800 font-mono truncate block" title={selectedOrder.trackingNumber}>
                                    {selectedOrder.trackingNumber || '—'}
                                </span>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Status
                                </span>
                                <span className="text-xs font-bold text-emerald-700">
                                    {selectedOrder.statusLabel || selectedOrder.status}
                                </span>
                            </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B6914] flex items-center gap-1.5">
                                <User size={14} /> Customer &amp; Delivery Address
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Customer Name</span>
                                    <span className="font-bold text-slate-800 text-sm">
                                        {selectedOrder.customerName || '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                                    <span className="font-bold text-slate-800 font-mono flex items-center gap-1 mt-0.5">
                                        <Phone size={12} className="text-slate-400" />
                                        {selectedOrder.customerPhone || '—'}
                                    </span>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-slate-400 block text-[11px]">Delivery Address</span>
                                    <p className="mt-1 flex gap-1.5 text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <MapPin size={14} className="shrink-0 text-emerald-600 mt-0.5" />
                                        <span>{selectedOrder.deliveryAddress || 'No address provided'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lifecycle Timestamps */}
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-2xs space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B6914] flex items-center gap-1.5">
                                <Clock size={14} /> Delivery Timeline
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
                                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                    <span className="text-slate-400 block text-[11px]">Assigned At</span>
                                    <span className="font-semibold text-slate-700 mt-0.5 block">
                                        {formatDate(selectedOrder.assignedAt)}
                                    </span>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                    <span className="text-slate-400 block text-[11px]">Accepted At</span>
                                    <span className="font-semibold text-slate-700 mt-0.5 block">
                                        {formatDate(selectedOrder.acceptedAt)}
                                    </span>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                    <span className="text-slate-400 block text-[11px]">Picked Up At</span>
                                    <span className="font-semibold text-slate-700 mt-0.5 block">
                                        {formatDate(selectedOrder.pickedUpAt)}
                                    </span>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                                    <span className="text-slate-400 block text-[11px]">Out For Delivery At</span>
                                    <span className="font-semibold text-slate-700 mt-0.5 block">
                                        {formatDate(selectedOrder.outForDeliveryAt)}
                                    </span>
                                </div>
                                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 sm:col-span-2 lg:col-span-2">
                                    <span className="text-slate-400 block text-[11px]">Delivered At</span>
                                    <span className="font-bold text-emerald-700 mt-0.5 block">
                                        {formatDate(selectedOrder.deliveredAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Toast Alerts */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default DeliveryBoyOrders;
