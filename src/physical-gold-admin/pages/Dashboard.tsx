import React, { useEffect, useMemo, useState } from 'react';
import {
    LayoutDashboard,
    ShoppingBag,
    Banknote,
    CreditCard,
    Wallet,
    CalendarDays,
    RefreshCw,
    TrendingUp,
    AlertCircle,
    Eye,
    User,
    MapPin,
    Box,
    ChevronLeft,
    ChevronRight,
    PieChart as PieChartIcon,
    BarChart3,
    Filter,
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import {
    fetchPaymentModeSummary,
    fetchActiveOrders,
    PaymentModeSummary,
    AdminOrder,
} from '../services/adminService';
import { formatCurrency } from '../helpers';

const getTodayYMD = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const getDaysAgoYMD = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<PaymentModeSummary | null>(null);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    const [startDate, setStartDate] = useState(getDaysAgoYMD(30));
    const [endDate, setEndDate] = useState(getTodayYMD());

    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');

    const loadDashboard = async (page = currentPage, size = pageSize) => {
        if (startDate > endDate) return;
        setLoading(true);
        try {
            const [summaryRes, ordersRes] = await Promise.all([
                fetchPaymentModeSummary(startDate, endDate),
                fetchActiveOrders(page, size),
            ]);
            setSummary(summaryRes);
            setOrders(ordersRes.content || []);
            setTotalElements(ordersRes.totalElements || 0);
            setTotalPages(ordersRes.totalPages || 0);
        } catch (error) {
            console.error('Dashboard load failed:', error);
            setSummary(null);
            setOrders([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard(currentPage, pageSize);
    }, [currentPage, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleApplyFilter = () => {
        setCurrentPage(0);
        loadDashboard(0, pageSize);
    };

    const setQuickRange = (days: number) => {
        const start = getDaysAgoYMD(days);
        const end = getTodayYMD();
        setStartDate(start);
        setEndDate(end);
        setCurrentPage(0);
        // Load immediately with new dates
        setLoading(true);
        Promise.all([
            fetchPaymentModeSummary(start, end),
            fetchActiveOrders(0, pageSize),
        ])
            .then(([summaryRes, ordersRes]) => {
                setSummary(summaryRes);
                setOrders(ordersRes.content || []);
                setTotalElements(ordersRes.totalElements || 0);
                setTotalPages(ordersRes.totalPages || 0);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    // Calculate aggregated stats
    const stats = useMemo(() => {
        const allOrdersCount = summary?.allModes?.reduce((acc, item) => acc + (item.totalOrders || 0), 0) || 0;
        const allRevenue = summary?.allModes?.reduce((acc, item) => acc + (item.totalRevenue || 0), 0) || 0;
        const avgOrderVal = allOrdersCount > 0 ? allRevenue / allOrdersCount : 0;

        return [
            {
                label: 'Total Orders',
                value: `${allOrdersCount}`,
                subtitle: `${totalElements} active in queue`,
                icon: <ShoppingBag size={20} />,
                color: 'bg-blue-50 text-blue-600 border-blue-100',
            },
            {
                label: 'Total Revenue',
                value: formatCurrency(allRevenue),
                subtitle: 'Period aggregate sales',
                icon: <Banknote size={20} />,
                color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            },
            {
                label: 'Cashfree Online',
                value: `${summary?.cashfreeOrders || 0} orders`,
                subtitle: formatCurrency(summary?.cashfreeRevenue || 0),
                icon: <CreditCard size={20} />,
                color: 'bg-violet-50 text-violet-600 border-violet-100',
            },
            {
                label: 'Cash on Delivery',
                value: `${summary?.codOrders || 0} orders`,
                subtitle: formatCurrency(summary?.codRevenue || 0),
                icon: <Wallet size={20} />,
                color: 'bg-amber-50 text-amber-600 border-amber-100',
            },
            {
                label: 'Avg Order Value',
                value: formatCurrency(avgOrderVal),
                subtitle: 'Revenue per order',
                icon: <TrendingUp size={20} />,
                color: 'bg-teal-50 text-teal-600 border-teal-100',
            },
        ];
    }, [summary, totalElements]);

    // Data for Payment Mode Bar Chart
    const paymentModeChartData = useMemo(() => {
        if (!summary) return [];
        return [
            {
                name: 'Cashfree (Online)',
                orders: summary.cashfreeOrders || 0,
                revenue: summary.cashfreeRevenue || 0,
                fill: '#6366F1',
            },
            {
                name: 'COD (Cash on Delivery)',
                orders: summary.codOrders || 0,
                revenue: summary.codRevenue || 0,
                fill: '#F59E0B',
            },
        ];
    }, [summary]);

    // Data for Payment Pie Chart
    const pieChartData = useMemo(() => {
        if (!summary) return [];
        const cashfreeCount = summary.cashfreeOrders || 0;
        const codCount = summary.codOrders || 0;
        const total = cashfreeCount + codCount;
        if (total === 0) return [];

        return [
            { name: 'Cashfree Online', value: cashfreeCount, revenue: summary.cashfreeRevenue || 0, color: '#6366F1' },
            { name: 'Cash on Delivery', value: codCount, revenue: summary.codRevenue || 0, color: '#F59E0B' },
        ];
    }, [summary]);

    // Order Status Distribution Chart Data from active orders
    const orderStatusChartData = useMemo(() => {
        if (!orders.length) return [];
        const counts: Record<string, number> = {};
        orders.forEach((o) => {
            const st = o.orderStatus || o.paymentStatus || 'OTHER';
            counts[st] = (counts[st] || 0) + 1;
        });
        return Object.keys(counts).map((key) => ({
            status: key,
            count: counts[key],
        }));
    }, [orders]);

    const getStatusBadgeClass = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s.includes('success') || s.includes('confirmed') || s.includes('completed')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (s.includes('pending') || s.includes('processing')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        if (s.includes('fail') || s.includes('cancel')) {
            return 'bg-rose-50 text-rose-700 border-rose-200';
        }
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const formatDateStr = (dateString?: string | null) => {
        if (!dateString) return '—';
        try {
            return new Date(dateString).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const openOrderDetails = (order: AdminOrder) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-emerald-600 shrink-0" size={24} />
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-slate-400 font-medium mt-0.5 tracking-tight">
                        Live sales metrics, payment mode analytics, and recent orders overview
                    </p>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-wrap items-center gap-2">

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-600 hover:border-emerald-300 transition-all flex-1 sm:flex-none">
                        <CalendarDays size={14} className="text-emerald-600 shrink-0" />
                        <input
                            type="date"
                            value={startDate}
                            max={endDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border-none outline-none bg-transparent text-slate-700 font-semibold cursor-pointer w-full min-w-0"
                        />
                    </label>
                    <span className="text-slate-400 font-bold hidden sm:inline">-</span>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-600 hover:border-emerald-300 transition-all flex-1 sm:flex-none">
                        <CalendarDays size={14} className="text-emerald-600 shrink-0" />
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={getTodayYMD()}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border-none outline-none bg-transparent text-slate-700 font-semibold cursor-pointer w-full min-w-0"
                        />
                    </label>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleApplyFilter}
                        disabled={startDate > endDate || loading}
                        className="w-full sm:w-auto"
                    >
                        <Filter size={14} /> Apply
                    </Button>
                </div>
            </div>

            {startDate > endDate && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">
                    <AlertCircle size={15} /> Start date must be on or before end date.
                </div>
            )}

            {/* KPI Executive Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                {stat.label}
                            </span>
                            <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div>
                            <span className="text-xl font-bold text-slate-800 tracking-tight block truncate">
                                {stat.value}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block truncate">
                                {stat.subtitle}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytics & Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Payment Mode Analytics Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <BarChart3 size={18} className="text-emerald-600" />
                                <h3 className="text-[14px] font-bold text-slate-800">Payment Modes Analytics</h3>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Compare Revenue &amp; Order volume between Online Cashfree and COD
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setChartMetric('revenue')}
                                className={`px-3 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                                    chartMetric === 'revenue'
                                        ? 'bg-white text-emerald-700 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Revenue (₹)
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartMetric('orders')}
                                className={`px-3 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                                    chartMetric === 'orders'
                                        ? 'bg-white text-emerald-700 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Orders Count
                            </button>
                        </div>
                    </div>

                    <div className="h-[260px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                                <RefreshCw className="animate-spin mr-2" size={16} /> Loading charts...
                            </div>
                        ) : paymentModeChartData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
                                <PieChartIcon size={28} className="text-slate-300 mb-2" />
                                No payment data available for this range
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentModeChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748B' }}
                                        tickFormatter={(val) =>
                                            chartMetric === 'revenue' ? `₹${(val / 1000).toFixed(0)}k` : `${val}`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [
                                            chartMetric === 'revenue' ? formatCurrency(Number(value)) : `${value} orders`,
                                            chartMetric === 'revenue' ? 'Total Revenue' : 'Total Orders',
                                        ]}
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '8px',
                                            borderColor: '#E2E8F0',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Bar
                                        dataKey={chartMetric}
                                        radius={[6, 6, 0, 0]}
                                        barSize={50}
                                    >
                                        {paymentModeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Donut Chart: Payment Share */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <PieChartIcon size={18} className="text-emerald-600" />
                            <h3 className="text-[14px] font-bold text-slate-800">Payment Distribution</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Order share by payment mode</p>
                    </div>

                    <div className="h-[200px] w-full relative">
                        {pieChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                                No pie data
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, idx) => (
                                            <Cell key={`pie-cell-${idx}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: any, name: any, item: any) => [
                                            `${val} orders (${formatCurrency(item.payload.revenue)})`,
                                            name,
                                        ]}
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '8px',
                                            borderColor: '#E2E8F0',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2 pt-2 border-t border-slate-50">
                        {pieChartData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                    <span className="font-semibold text-slate-700">{item.name}</span>
                                </div>
                                <span className="font-bold text-slate-800">{item.value} orders</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="text-emerald-600 shrink-0" size={18} />
                            <h3 className="text-[14px] font-bold text-slate-800">Recent Orders (Top 5)</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Overview of the 5 most recent customer orders
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-xs text-slate-400 font-medium">
                        <RefreshCw className="animate-spin mx-auto mb-2 text-emerald-600" size={20} />
                        Loading active orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                            <ShoppingBag size={24} />
                        </div>
                        <p className="text-[13px] text-slate-600 font-bold">No active orders found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Active orders will appear here once placed by customers.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop & Tablet Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#FBF7EC]">
                                    <tr className="text-[11px] font-bold uppercase tracking-wider text-[#8B6914] border-b border-[#E8E0D5]">
                                        <th className="px-5 py-3 border-r border-[#E8E0D5]/60 last:border-r-0">Order Number</th>
                                        <th className="px-5 py-3 border-r border-[#E8E0D5]/60 last:border-r-0">Customer Info</th>
                                        <th className="px-5 py-3 border-r border-[#E8E0D5]/60 last:border-r-0">Items Summary</th>
                                        <th className="px-5 py-3 text-center border-r border-[#E8E0D5]/60 last:border-r-0">Payment Mode</th>
                                        <th className="px-5 py-3 text-center border-r border-[#E8E0D5]/60 last:border-r-0">Order Status</th>
                                        <th className="px-5 py-3 text-right border-r border-[#E8E0D5]/60 last:border-r-0">Amount</th>
                                        <th className="px-5 py-3 text-center border-r border-[#E8E0D5]/60 last:border-r-0">Date</th>
                                        <th className="px-5 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[12px]">
                                    {orders.slice(0, 5).map((order) => {
                                        const firstItem = order.items?.[0];
                                        return (
                                            <tr key={order.orderId} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-b-0">
                                                <td className="px-5 py-3.5 font-bold text-slate-800 border-r border-slate-100/80 last:border-r-0">
                                                    <div>
                                                        <span className="text-emerald-700">{order.orderNumber}</span>
                                                        <span className="block text-[10px] text-slate-400 font-medium">
                                                            ID: #{order.orderId}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 border-r border-slate-100/80 last:border-r-0">
                                                    <div>
                                                        <span className="font-bold text-slate-700 block">{order.userName || 'Anonymous'}</span>
                                                        <span className="text-[11px] text-slate-500 block">{order.phoneNumber || '—'}</span>
                                                        {order.userEmail && (
                                                            <span className="text-[10px] text-slate-400 block truncate max-w-[170px]" title={order.userEmail}>
                                                                {order.userEmail}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 max-w-[220px] border-r border-slate-100/80 last:border-r-0">
                                                    {firstItem ? (
                                                        <div>
                                                            <p className="font-semibold text-slate-800 line-clamp-1" title={firstItem.productName}>
                                                                {firstItem.productName}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                                Qty: {firstItem.quantity} {order.items.length > 1 ? `(+${order.items.length - 1} more)` : ''}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">{order.totalItems} items</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-center border-r border-slate-100/80 last:border-r-0">
                                                    <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                                                        {order.paymentMode || 'COD'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-center border-r border-slate-100/80 last:border-r-0">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(order.orderStatus)}`}>
                                                        {order.orderStatus || order.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right font-bold text-slate-800 border-r border-slate-100/80 last:border-r-0">
                                                    {formatCurrency(order.totalAmount)}
                                                </td>
                                                <td className="px-5 py-3.5 text-center text-slate-500 whitespace-nowrap text-[11px] border-r border-slate-100/80 last:border-r-0">
                                                    {formatDateStr(order.createdAt)}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openOrderDetails(order)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                                                    >
                                                        <Eye size={13} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="block md:hidden divide-y divide-slate-100">
                            {orders.slice(0, 5).map((order) => (
                                <div key={order.orderId} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-xs font-bold text-emerald-700 block">{order.orderNumber}</span>
                                            <span className="text-[10px] text-slate-400">Order ID: #{order.orderId}</span>
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(order.orderStatus)}`}>
                                            {order.orderStatus || order.paymentStatus}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Customer</span>
                                            <span className="font-semibold text-slate-800 block truncate">{order.userName || 'Anonymous'}</span>
                                            <span className="text-[11px] text-slate-500">{order.phoneNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Amount</span>
                                            <span className="font-bold text-emerald-600 block">{formatCurrency(order.totalAmount)}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{order.paymentMode}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-[10px] text-slate-400">{formatDateStr(order.createdAt)}</span>
                                        <button
                                            type="button"
                                            onClick={() => openOrderDetails(order)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200"
                                        >
                                            <Eye size={12} /> View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Order Details — ${selectedOrder?.orderNumber}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-5">
                        {/* Status Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Order Status
                                </span>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                                    {selectedOrder.orderStatus}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Payment Status
                                </span>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusBadgeClass(selectedOrder.paymentStatus)}`}>
                                    {selectedOrder.paymentStatus}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Payment Mode
                                </span>
                                <span className="text-xs font-bold text-slate-800 uppercase block">
                                    {selectedOrder.paymentMode}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Total Amount
                                </span>
                                <span className="text-sm font-bold text-emerald-600 block">
                                    {formatCurrency(selectedOrder.totalAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-white">
                                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <User size={14} className="text-emerald-600" /> Customer Information
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-semibold">Name:</span>
                                        <span className="font-bold text-slate-700">{selectedOrder.userName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-semibold">Phone:</span>
                                        <span className="font-bold text-slate-700">{selectedOrder.phoneNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-semibold">Email:</span>
                                        <span className="font-bold text-slate-700 break-all">{selectedOrder.userEmail || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-semibold">User ID:</span>
                                        <span className="font-bold text-slate-700">#{selectedOrder.userId}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-white">
                                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <MapPin size={14} className="text-emerald-600" /> Delivery Address
                                </h4>
                                <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                                    <p className="font-semibold text-slate-800">
                                        {[selectedOrder.flatNo, selectedOrder.address, selectedOrder.landMark, selectedOrder.state, selectedOrder.pinCode]
                                            .filter(Boolean)
                                            .join(', ') || 'Address not available'}
                                    </p>
                                    {(selectedOrder.latitude || selectedOrder.longitude) && (
                                        <p className="text-[10px] text-slate-400">
                                            Coordinates: Lat {selectedOrder.latitude || '—'} · Long {selectedOrder.longitude || '—'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Box size={14} className="text-emerald-600" /> Order Items ({selectedOrder.items?.length || 0})
                            </h4>
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-[#FBF7EC] text-[#8B6914] font-bold uppercase tracking-wider text-[10px]">
                                        <tr>
                                            <th className="px-4 py-2.5">Product</th>
                                            <th className="px-4 py-2.5 text-center">Qty</th>
                                            <th className="px-4 py-2.5 text-right">Price</th>
                                            <th className="px-4 py-2.5 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-2.5">
                                                    <p className="font-bold text-slate-800">{item.productName || `Product #${item.productId}`}</p>
                                                    <p className="text-[10px] text-slate-400">{item.variant || 'Standard'}</p>
                                                </td>
                                                <td className="px-4 py-2.5 text-center font-semibold text-slate-700">{item.quantity}</td>
                                                <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(item.price)}</td>
                                                <td className="px-4 py-2.5 text-right font-bold text-slate-800">{formatCurrency(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 font-bold">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2.5 text-slate-600 text-right">Total Payable Amount</td>
                                            <td className="px-4 py-2.5 text-right text-emerald-600 text-sm">{formatCurrency(selectedOrder.totalAmount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                                Close Details
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Dashboard;
