import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, ShoppingBag, Banknote, CreditCard, Wallet, CalendarDays } from 'lucide-react';
import Button from '../components/ui/Button';
import {
    fetchPaymentModeSummary,
    fetchActiveOrders,
    PaymentModeSummary,
    AdminOrder
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
    const [startDate, setStartDate] = useState(getDaysAgoYMD(30));
    const [endDate, setEndDate] = useState(getTodayYMD());

    const loadDashboard = async () => {
        if (startDate > endDate) return;
        setLoading(true);
        try {
            const [summaryRes, ordersRes] = await Promise.all([
                fetchPaymentModeSummary(startDate, endDate),
                fetchActiveOrders(0, 5)
            ]);
            setSummary(summaryRes);
            setOrders(ordersRes.content || []);
        } catch (error) {
            console.error('Dashboard load failed:', error);
            setSummary(null);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const stats = useMemo(() => {
        const allOrdersCount = summary?.allModes?.reduce((acc, item) => acc + (item.totalOrders || 0), 0) || 0;
        const allRevenue = summary?.allModes?.reduce((acc, item) => acc + (item.totalRevenue || 0), 0) || 0;
        return [
            { label: 'Total Orders', value: `${allOrdersCount}`, icon: <ShoppingBag size={20} />, color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Revenue', value: formatCurrency(allRevenue), icon: <Banknote size={20} />, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Cashfree Orders', value: `${summary?.cashfreeOrders || 0}`, icon: <CreditCard size={20} />, color: 'bg-violet-50 text-violet-600' },
            { label: 'COD Orders', value: `${summary?.codOrders || 0}`, icon: <Wallet size={20} />, color: 'bg-amber-50 text-amber-600' }
        ];
    }, [summary]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-emerald-600 shrink-0" size={22} />
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium mt-0.5 tracking-tight">Live payment summary and recent orders overview</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-500 cursor-pointer hover:border-emerald-200 transition-all flex-1 sm:flex-none min-w-0">
                        <CalendarDays size={14} className="text-emerald-600 shrink-0" />
                        <input
                            type="date"
                            value={startDate}
                            max={endDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border-none outline-none bg-transparent text-slate-700 font-semibold cursor-pointer w-full min-w-0"
                        />
                    </label>
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-500 cursor-pointer hover:border-emerald-200 transition-all flex-1 sm:flex-none min-w-0">
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
                    <Button variant="outline" onClick={loadDashboard} disabled={startDate > endDate} className="w-full sm:w-auto">
                        Apply
                    </Button>
                </div>
            </div>

            {startDate > endDate && (
                <p className="text-[13px] text-rose-500 font-medium">Start date must be on or before end date.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-emerald-100 transition-all cursor-default">
                        <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110`}>
                            {stat.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                            <span className="text-lg font-bold text-slate-800 tracking-tight">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                    <h3 className="text-[14px] font-bold text-slate-800">Recent Orders (Top 5)</h3>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-[13px] text-slate-400 font-medium">Loading dashboard data...</div>
                ) : orders.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                            <ShoppingBag size={24} />
                        </div>
                        <p className="text-[13px] text-slate-400 font-medium">No recent orders to display</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-5 py-3">Order</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-5 py-3">Customer</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-5 py-3">Payment Mode</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-5 py-3">Order Date</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 px-5 py-3">Status</th>
                                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 px-5 py-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.orderId} className="border-t border-slate-100">
                                        <td className="px-5 py-3 text-[13px] font-semibold text-slate-700">{order.orderNumber}</td>
                                        <td className="px-5 py-3 text-[13px] text-slate-600">{order.userName || order.userEmail || '-'}</td>
                                        <td className="px-5 py-3 text-[13px] text-slate-700">{order.paymentMode}</td>
                                        <td className="px-5 py-3 text-[13px] text-slate-700">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                  
                                                })
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-[12px] font-semibold text-slate-500">{order.paymentStatus}</td>
                                        <td className="px-5 py-3 text-right text-[13px] font-bold text-slate-800">{formatCurrency(order.totalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
