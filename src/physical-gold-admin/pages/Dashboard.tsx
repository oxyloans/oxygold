import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, ShoppingBag, Banknote, CreditCard, Wallet, CalendarDays } from 'lucide-react';
import Button from '../components/ui/Button';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
    fetchPaymentModeSummary,
    fetchActiveOrders,
    PaymentModeSummary,
    AdminOrder
} from '../services/adminService';
import { formatCurrency } from '../helpers';

const Dashboard: React.FC = () => {
    const [showRangePicker, setShowRangePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<PaymentModeSummary | null>(null);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [range, setRange] = useState([
        {
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    const formatYMD = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const startDate = formatYMD(range[0].startDate as Date);
            const endDate = formatYMD(range[0].endDate as Date);
            const [summaryRes, ordersRes] = await Promise.all([
                fetchPaymentModeSummary(startDate, endDate),
                fetchActiveOrders()
            ]);
            setSummary(summaryRes);
            setOrders((ordersRes || []).slice(0, 5));
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
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-emerald-600" size={22} />
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium mt-0.5 tracking-tight">Live payment summary and recent orders overview</p>
                </div>
                <div className="relative">
                    <Button variant="outline" onClick={() => setShowRangePicker(v => !v)}>
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays size={16} />
                            {formatYMD(range[0].startDate as Date)} to {formatYMD(range[0].endDate as Date)}
                        </span>
                    </Button>
                    {showRangePicker && (
                        <div className="absolute right-0 mt-2 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
                            <DateRange
                                ranges={range}
                                onChange={(item: any) => setRange([item.selection])}
                                moveRangeOnFirstSelection={false}
                                maxDate={new Date()}
                            />
                            <div className="flex justify-end gap-2 p-2">
                                <Button variant="outline" onClick={() => setShowRangePicker(false)}>Close</Button>
                                <Button onClick={() => { setShowRangePicker(false); loadDashboard(); }}>Apply</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                                            {order.paymentExpiry
                                                ? new Date(order.paymentExpiry).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
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
