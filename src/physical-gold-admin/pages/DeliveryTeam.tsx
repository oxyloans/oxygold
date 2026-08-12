import React, { useEffect, useState } from 'react';
import { Bike, CalendarDays, Mail, MapPin, PackageSearch, Phone, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import {
    AdminDeliveryAssignment,
    DeliveryBoy,
    fetchAdminAssignedDeliveries,
    fetchAdminDeliveryBoys,
    updateAdminDeliveryBoyStatus,
} from '../services/adminService';

const DeliveryTeam: React.FC = () => {
    const [boys, setBoys] = useState<DeliveryBoy[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [selectedBoy, setSelectedBoy] = useState<DeliveryBoy | null>(null);
    const [assignments, setAssignments] = useState<AdminDeliveryAssignment[]>([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);

    const loadBoys = async () => {
        setLoading(true);
        setMessage(null);
        try {
            setBoys(await fetchAdminDeliveryBoys());
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Unable to load the delivery team.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBoys(); }, []);

    const toggleStatus = async (boy: DeliveryBoy) => {
        const nextStatus = boy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setUpdatingId(boy.id);
        setMessage(null);
        try {
            await updateAdminDeliveryBoyStatus(boy.id, nextStatus);
            setBoys(current => current.map(item => item.id === boy.id ? { ...item, status: nextStatus } : item));
            setMessage({ type: 'success', text: `${boy.firstName} is now ${nextStatus.toLowerCase()}.` });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Status update failed.' });
        } finally {
            setUpdatingId(null);
        }
    };

    const viewAssignments = async (boy: DeliveryBoy) => {
        setSelectedBoy(boy);
        setAssignments([]);
        setAssignmentsLoading(true);
        setMessage(null);
        try {
            setAssignments(await fetchAdminAssignedDeliveries(boy.id));
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Assigned deliveries could not be loaded.' });
        } finally {
            setAssignmentsLoading(false);
        }
    };

    const formatDate = (value: string | null) => value
        ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    const assignmentStatusStyle = (status: string) => {
        const value = status.toUpperCase();
        if (value.includes('DELIVERED') || value.includes('COMPLETED')) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
        if (value.includes('OUT_FOR') || value.includes('PICKED')) return 'bg-blue-50 text-blue-700 ring-blue-200';
        return 'bg-amber-50 text-amber-700 ring-amber-200';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h1 className="flex items-center gap-2 text-xl font-bold text-slate-800"><Bike className="text-emerald-600" size={22} />Delivery Management</h1><p className="mt-1 text-xs text-slate-400">Manage personnel, pending assignments and live order progress.</p></div>
                <Button variant="outline" onClick={loadBoys}><RefreshCw size={14} /> Refresh</Button>
            </div>
            {message && <div className={`rounded-lg border px-4 py-3 text-xs font-semibold ${message.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-rose-100 bg-rose-50 text-rose-700'}`}>{message.text}</div>}

            <section>
                <h2 className="mb-3 text-sm font-bold text-slate-800">Delivery personnel ({boys.length})</h2>
                {loading ? <div className="rounded-xl bg-white p-10 text-center text-xs text-slate-400">Loading delivery team...</div> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {boys.map(boy => <article key={boy.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-800">{boy.firstName} {boy.lastName}</h3><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${boy.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{boy.status}</span></div><button disabled={updatingId === boy.id} onClick={() => toggleStatus(boy)} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-50 ${boy.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>{updatingId === boy.id ? 'Updating...' : boy.status === 'ACTIVE' ? 'Set inactive' : 'Activate'}</button></div>
                        <div className="mt-3 space-y-1.5 text-xs text-slate-500"><p className="flex items-center gap-2"><Phone size={12} />{boy.phone}</p><p className="flex items-center gap-2 break-all"><Mail size={12} />{boy.email}</p></div>
                        <button onClick={() => viewAssignments(boy)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><PackageSearch size={14} /> View pending assignments</button>
                    </article>)}
                    {!boys.length && <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-10 text-center text-xs text-slate-400">No delivery personnel found.</div>}
                </div>}
            </section>

            {false && selectedBoy && <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Truck size={16} className="text-emerald-600" />{selectedBoy.firstName} {selectedBoy.lastName}&apos;s pending assignments</h2><p className="mt-1 text-xs text-slate-400">Delivery personnel ID: {selectedBoy.id}</p></div><button onClick={() => setSelectedBoy(null)} className="text-xs font-bold text-slate-400">Close</button></div>
                {assignmentsLoading ? <div className="py-10 text-center text-xs text-slate-400">Loading assignments...</div> : assignments.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{assignments.map(item => <article key={item.id} className="rounded-xl border border-slate-100 p-4"><div className="flex justify-between gap-3"><div><p className="text-xs font-bold text-emerald-700">{item.orderNumber}</p><p className="mt-1 text-sm font-bold text-slate-800">{item.customerName}</p></div><span className="h-fit rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">{item.statusLabel || item.status}</span></div><p className="mt-3 flex gap-2 text-xs text-slate-500"><MapPin size={13} className="shrink-0" />{item.deliveryAddress}</p><p className="mt-2 text-[11px] text-slate-400">{item.trackingNumber} · {item.customerPhone}</p></article>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-400">No pending assignments for this delivery person.</div>}
            </section>}

            {selectedBoy && <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Pending delivery assignments</h2>
                            <p className="mt-0.5 text-[11px] text-slate-400">Review orders assigned to the selected delivery person</p>
                        </div>
                        <button type="button" onClick={() => setSelectedBoy(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-500 transition hover:bg-slate-50">Close</button>
                    </div>
                    <div className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm"><Bike size={19} /></span>
                            <div><p className="text-sm font-bold text-slate-800">{selectedBoy.firstName} {selectedBoy.lastName}</p><p className="mt-0.5 text-[11px] text-slate-500">Delivery personnel ID: #{selectedBoy.id}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">{assignments.length} pending {assignments.length === 1 ? 'order' : 'orders'}</span>
                            <button type="button" onClick={() => viewAssignments(selectedBoy)} disabled={assignmentsLoading} title="Refresh assignments" className="rounded-lg bg-white p-2 text-slate-500 shadow-sm hover:text-emerald-700 disabled:opacity-50"><RefreshCw size={15} className={assignmentsLoading ? 'animate-spin' : ''} /></button>
                        </div>
                    </div>

                    {assignmentsLoading ? <div className="py-14 text-center"><RefreshCw size={22} className="mx-auto animate-spin text-emerald-600" /><p className="mt-3 text-xs text-slate-400">Loading pending assignments...</p></div>
                    : assignments.length ? <>
                        <div className="hidden overflow-x-auto rounded-xl border border-slate-100 md:block">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-[#FBF7EC]"><tr className="text-[10px] font-bold uppercase tracking-wider text-[#8B6914]"><th className="px-4 py-3">Order &amp; tracking</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Delivery address</th><th className="px-4 py-3">Assigned on</th><th className="px-4 py-3">Status</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">{assignments.map(item => <tr key={item.id} className="align-top hover:bg-slate-50/70">
                                    <td className="px-4 py-3"><p className="text-xs font-bold text-emerald-700">{item.orderNumber || '—'}</p><p className="mt-1 text-[10px] text-slate-400">{item.trackingNumber || 'No tracking number'}</p></td>
                                    <td className="px-4 py-3"><p className="text-xs font-bold text-slate-700">{item.customerName || '—'}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><Phone size={10} />{item.customerPhone || '—'}</p></td>
                                    <td className="max-w-[280px] px-4 py-3"><p className="flex gap-1.5 text-[11px] leading-5 text-slate-500"><MapPin size={12} className="mt-1 shrink-0 text-emerald-600" />{item.deliveryAddress || 'Address unavailable'}</p></td>
                                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-slate-500">{formatDate(item.assignedAt)}</td>
                                    <td className="px-4 py-3"><span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold uppercase ring-1 ${assignmentStatusStyle(item.status)}`}>{item.statusLabel || item.status}</span></td>
                                </tr>)}</tbody>
                            </table>
                        </div>
                        <div className="grid gap-3 md:hidden">{assignments.map(item => <article key={item.id} className="rounded-xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-emerald-700">{item.orderNumber || '—'}</p><p className="mt-1 text-[10px] text-slate-400">{item.trackingNumber}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ring-1 ${assignmentStatusStyle(item.status)}`}>{item.statusLabel || item.status}</span></div>
                            <div className="mt-3 border-t border-slate-100 pt-3"><p className="text-xs font-bold text-slate-700">{item.customerName || '—'}</p><p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><Phone size={11} />{item.customerPhone || '—'}</p><p className="mt-2 flex gap-1.5 text-[11px] leading-5 text-slate-500"><MapPin size={12} className="mt-1 shrink-0 text-emerald-600" />{item.deliveryAddress || 'Address unavailable'}</p><p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400"><CalendarDays size={11} />Assigned {formatDate(item.assignedAt)}</p></div>
                        </article>)}</div>
                    </> : <div className="rounded-xl border border-dashed border-slate-200 py-14 text-center"><PackageSearch size={28} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">No pending assignments</p><p className="mt-1 text-xs text-slate-400">This delivery person has no pending orders right now.</p></div>}
                </div>
            </section>}
        </div>
    );
};

export default DeliveryTeam;
