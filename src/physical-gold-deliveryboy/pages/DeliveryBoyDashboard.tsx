import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, MapPin, Navigation, PackageCheck, Phone, RotateCw, Truck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DeliveryDialog } from '../components/DeliveryFeedback';
import Toast, { ToastType } from '../../PhysicalGold/components/Toast';
import {
  acceptDelivery,
  deliverOrder,
  DeliveryAssignment,
  fetchCurrentDeliveries,
  fetchDeliverySummary,
  DeliverySummary,
  markOutForDelivery,
  markDeliveryFailed,
  pickupDelivery,
  rejectDelivery,
  updateDeliveryLocation,
} from '../services/deliveryBoyService';

const actionForStatus: Record<string, { label: string; next: (id: number) => Promise<any> }> = {
  ASSIGNED: { label: 'Accept order', next: acceptDelivery },
  ACCEPTED: { label: 'Confirm package collected', next: pickupDelivery },
  PICKED_UP: { label: 'Start trip to customer', next: markOutForDelivery },
  OUT_FOR_DELIVERY: { label: 'Confirm order delivered', next: deliverOrder },
};

const actionCopy: Record<string, { title: string; text: string; confirm: string }> = {
  ASSIGNED: { title: 'Accept this delivery?', text: 'This order will be added to your active delivery route.', confirm: 'Yes, accept' },
  ACCEPTED: { title: 'Order collected?', text: 'Confirm only after you have received the package safely.', confirm: 'Yes, picked up' },
  PICKED_UP: { title: 'Start delivery now?', text: 'The customer may be notified that you are on the way.', confirm: 'Start delivery' },
  OUT_FOR_DELIVERY: { title: 'Order delivered?', text: 'Confirm only after the package is handed to the customer.', confirm: 'Yes, delivered' },
};

const deliverySteps = ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const statusName = (status: string) => ({
  ASSIGNED: 'New order', ACCEPTED: 'Accepted', PICKED_UP: 'Package collected',
  OUT_FOR_DELIVERY: 'On the way', DELIVERED: 'Delivered',
}[status] || status.replaceAll('_', ' '));

const DeliveryBoyDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [summary, setSummary] = useState<DeliverySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [pending, setPending] = useState<{ delivery: DeliveryAssignment; kind: 'advance' | 'reject' | 'failed' } | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const notify = useCallback((type: ToastType, title: string, message?: string) => {
    setToast({ type, message: message ? `${title}: ${message}` : title });
  }, []);

  const loadDeliveries = useCallback(async () => {
    setError('');
    try {
      const [currentDeliveries, summaryResponse] = await Promise.all([
        fetchCurrentDeliveries(),
        fetchDeliverySummary(),
      ]);
      setDeliveries(currentDeliveries);
      setSummary(summaryResponse.data);
    } catch (err: any) {
      setError(err.message || 'Unable to load assigned deliveries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const stats = useMemo(() => [
    { label: 'New orders', value: summary?.assigned ?? 0, icon: PackageCheck, color: 'bg-blue-50 text-blue-600' },
    { label: 'Orders accepted', value: summary?.accepted ?? 0, icon: CheckCircle2, color: 'bg-violet-50 text-violet-600' },
    { label: 'Orders declined', value: summary?.rejected ?? 0, icon: AlertCircle, color: 'bg-rose-50 text-rose-600' },
    { label: 'Packages collected', value: summary?.pickedUp ?? 0, icon: PackageCheck, color: 'bg-amber-50 text-amber-700' },
    { label: 'On the way', value: summary?.outForDelivery ?? 0, icon: Truck, color: 'bg-orange-50 text-orange-600' },
    { label: 'Orders delivered', value: summary?.delivered ?? 0, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Delivery issues', value: summary?.failed ?? 0, icon: AlertCircle, color: 'bg-red-50 text-red-700' },
    { label: 'Active orders', value: summary?.activeDeliveries ?? 0, icon: Clock3, color: 'bg-cyan-50 text-cyan-700' },
  ], [summary]);

  const chartData = useMemo(() => [
    { name: 'Assigned', value: summary?.assigned ?? 0, color: '#3B82F6' },
    { name: 'Accepted', value: summary?.accepted ?? 0, color: '#8B5CF6' },
    { name: 'Picked up', value: summary?.pickedUp ?? 0, color: '#D4AF37' },
    { name: 'Out', value: summary?.outForDelivery ?? 0, color: '#F97316' },
    { name: 'Delivered', value: summary?.delivered ?? 0, color: '#10B981' },
    { name: 'Rejected', value: summary?.rejected ?? 0, color: '#F43F5E' },
    { name: 'Failed', value: summary?.failed ?? 0, color: '#DC2626' },
  ], [summary]);
  const outcomeData = useMemo(() => chartData.filter(item => ['Delivered', 'Rejected', 'Failed'].includes(item.name)), [chartData]);
  const outcomeTotal = outcomeData.reduce((total, item) => total + item.value, 0);

  const runAction = async (delivery: DeliveryAssignment) => {
    const action = actionForStatus[delivery.status];
    if (!action) return;
    setBusyId(delivery.id);
    setError('');
    try {
      const response = await action.next(delivery.id);
      setPending(null);
      notify('success', 'Delivery updated', response.message || 'The delivery status was updated successfully.');
      await loadDeliveries();
    } catch (err: any) {
      notify('error', 'Unable to update delivery', err.message || 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const shareLocation = (deliveryId: number) => {
    if (!navigator.geolocation) {
      notify('warning', 'Location unavailable', 'Location sharing is not supported by this browser.');
      return;
    }
    setBusyId(deliveryId);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await updateDeliveryLocation(deliveryId, coords.latitude, coords.longitude);
          notify('success', 'Location shared', response.message || 'Your current location was updated successfully.');
        } catch (err: any) {
          notify('error', 'Location not updated', err.message || 'Please try again.');
        } finally {
          setBusyId(null);
        }
      },
      locationError => {
        notify('warning', 'Location permission needed', locationError.message || 'Allow location access in your browser and try again.');
        setBusyId(null);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const requestReason = async (delivery: DeliveryAssignment, action: 'reject' | 'failed') => {
    const cleanReason = reason.trim();
    if (cleanReason.length < 3) {
      setReasonError('Please enter a clear reason (at least 3 characters).');
      return;
    }
    setBusyId(delivery.id);
    setError('');
    try {
      const response = action === 'reject'
        ? await rejectDelivery(delivery.id, cleanReason)
        : await markDeliveryFailed(delivery.id, cleanReason);
      setPending(null);
      setReason('');
      notify('success', action === 'reject' ? 'Assignment declined' : 'Delivery issue reported', response.message || 'The administrator has been notified.');
      await loadDeliveries();
    } catch (err: any) {
      notify('error', 'Unable to submit', err.message || 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={toast.type === 'error' ? 5000 : 3000} />}
      <section className="px-1 py-2 sm:px-2">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Dashboard</h1>
        {summary?.deliveryBoyName?.trim() && <p className="mt-1 text-sm text-slate-500">Welcome, {summary.deliveryBoyName.trim()}</p>}
      </section>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {stats.map(item => {
          const Icon = item.icon;
          return <article key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-2"><div><p className="text-2xl font-bold text-slate-900">{item.value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{item.label}</p></div><div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.color}`}><Icon size={18} /></div></div></article>;
        })}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-bold text-slate-900">Delivery status</h2>
          <div className="mt-5 h-72 w-full" aria-label="Delivery status chart">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 8 }}><CartesianGrid stroke="#EEF2F7" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }}/><Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}/><Bar dataKey="value" name="Deliveries" radius={[6, 6, 0, 0]} maxBarSize={42}>{chartData.map(item => <Cell key={item.name} fill={item.color}/>)}</Bar></BarChart></ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-bold text-slate-900">Delivery outcomes</h2>
          <div className="relative mx-auto mt-4 h-52 max-w-sm"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={outcomeData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={outcomeTotal ? 3 : 0} stroke="none">{outcomeData.map(item => <Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}/></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-2xl font-bold text-slate-900">{outcomeTotal}</p><p className="text-[10px] font-semibold text-slate-400">Total</p></div></div></div>
          <div className="grid grid-cols-3 gap-2">{outcomeData.map(item => <div key={item.name} className="text-center"><span className="mx-auto block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}/><p className="mt-1 text-[10px] font-semibold text-slate-500">{item.name}</p><p className="text-sm font-bold text-slate-800">{item.value}</p></div>)}</div>
        </article>
      </section>
      {error && <div role="alert" className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800"><div className="flex gap-3"><AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={19} /><div><p className="text-sm font-bold">Assignments could not be loaded</p><p className="mt-1 text-xs leading-5">{error}</p></div></div><button onClick={() => { setLoading(true); loadDeliveries(); }} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold shadow-sm"><RotateCw size={14} /> Retry</button></div>}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2"><h2 className="text-sm font-bold">Current deliveries</h2>{!loading && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{deliveries.length}</span>}</div>
          <button onClick={() => { setLoading(true); loadDeliveries(); }} disabled={loading} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[#8B6914] transition hover:bg-amber-50 disabled:opacity-50"><RotateCw className={loading ? 'animate-spin' : ''} size={14} /> Refresh</button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-14 text-sm text-slate-400"><LoaderCircle className="animate-spin" size={18} /> Loading assignments...</div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FBF7EC] text-[#8B6914]"><MapPin size={25} /></div><h3 className="mt-4 text-sm font-bold">No current deliveries</h3><p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">New assigned orders will appear here.</p></div>
        ) : (
          <div className="grid gap-4 p-3 sm:p-4 xl:grid-cols-2">
            {deliveries.map(delivery => {
              const action = actionForStatus[delivery.status];
              const busy = busyId === delivery.id;
              const currentStep = Math.max(deliverySteps.indexOf(delivery.status), 0);
              const destination = delivery.customerLatitude != null && delivery.customerLongitude != null
                ? `${delivery.customerLatitude},${delivery.customerLongitude}`
                : delivery.deliveryAddress;
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
              return (
                <article key={delivery.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-[#D8C47C] hover:shadow-md">
                  <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order</p><p className="mt-1 truncate text-sm font-bold text-[#8B6914]">{delivery.orderNumber || `Delivery #${delivery.id}`}</p></div><span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">{delivery.statusLabel || statusName(delivery.status)}</span></div>
                  <div className="mt-5" aria-label={`Delivery progress: ${statusName(delivery.status)}`}><div className="flex items-center">{deliverySteps.map((step, index) => <React.Fragment key={step}><span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white ${index <= currentStep ? 'bg-[#B8872B]' : 'bg-slate-200'}`}/>{index < deliverySteps.length - 1 && <span className={`h-1 flex-1 ${index < currentStep ? 'bg-[#D4AF37]' : 'bg-slate-100'}`}/>}</React.Fragment>)}</div><div className="mt-2 flex justify-between text-[9px] font-semibold text-slate-400"><span>Assigned</span><span>Accepted</span><span>Picked up</span><span className="hidden sm:inline">On the way</span><span>Delivered</span></div></div>
                  <div className="mt-5 rounded-xl bg-slate-50 p-3.5"><h3 className="font-bold text-slate-900">{delivery.customerName || 'Customer'}</h3><div className="mt-2 flex items-start gap-2"><MapPin className="mt-0.5 shrink-0 text-slate-400" size={14} /><p className="line-clamp-3 text-xs leading-5 text-slate-600" title={delivery.deliveryAddress || 'Address not available'}>{delivery.deliveryAddress || 'Address not available'}</p></div>{delivery.trackingNumber && <p className="mt-2 text-[11px] text-slate-400">Tracking ID: <span className="font-semibold text-slate-600">{delivery.trackingNumber}</span></p>}</div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a href={`tel:${delivery.customerPhone}`} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><Phone size={16} /> Call</a>
                    <a href={directionsUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"><Navigation size={16} /> Directions</a>
                  </div>
                  <div className="mt-3 space-y-2">
                    {action && <button disabled={busy} onClick={() => setPending({ delivery, kind: 'advance' })} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#9A6D18] to-[#C99A32] px-4 text-sm font-bold text-white shadow-md shadow-amber-900/10 transition hover:brightness-95 disabled:cursor-wait disabled:opacity-50">{busy ? 'Updating delivery…' : action.label}</button>}
                    {['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(delivery.status) && <button disabled={busy} onClick={() => shareLocation(delivery.id)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 disabled:opacity-50"><Navigation size={15} /> Share current location</button>}
                    {delivery.status === 'ASSIGNED' && <button disabled={busy} onClick={() => { setReason(''); setReasonError(''); setPending({ delivery, kind: 'reject' }); }} className="min-h-10 w-full rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Decline delivery</button>}
                    {['ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(delivery.status) && <button disabled={busy} onClick={() => { setReason(''); setReasonError(''); setPending({ delivery, kind: 'failed' }); }} className="min-h-10 w-full rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Report issue</button>}
                  </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <DeliveryDialog
        open={Boolean(pending)}
        title={(pending?.kind === 'advance' ? actionCopy[pending.delivery.status]?.title : pending?.kind === 'reject' ? 'Decline this assignment?' : 'Report a delivery problem?') || 'Confirm action'}
        description={(pending?.kind === 'advance' ? actionCopy[pending.delivery.status]?.text : pending?.kind === 'reject' ? 'Tell the administrator why you cannot accept this order.' : 'Explain what prevented this order from being delivered.') || ''}
        confirmLabel={(pending?.kind === 'advance' ? actionCopy[pending.delivery.status]?.confirm : pending?.kind === 'reject' ? 'Decline assignment' : 'Submit report') || 'Confirm'}
        cancelLabel="Go back"
        destructive={pending?.kind !== 'advance'}
        busy={pending ? busyId === pending.delivery.id : false}
        onCancel={() => { setPending(null); setReasonError(''); }}
        onConfirm={() => pending && (pending.kind === 'advance' ? runAction(pending.delivery) : requestReason(pending.delivery, pending.kind))}
      >
        {pending?.kind !== 'advance' && (
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Reason <span className="text-rose-500">*</span></span>
            <textarea autoFocus maxLength={300} rows={4} value={reason} onChange={event => { setReason(event.target.value); setReasonError(''); }} placeholder={pending?.kind === 'reject' ? 'Example: Assignment is outside my delivery area' : 'Example: Customer was unavailable at the address'} className={`w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${reasonError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-[#C9993A] focus:ring-[#C9993A]/10'}`} />
            <div className="mt-1.5 flex justify-between gap-3"><span className="text-xs font-medium text-rose-600">{reasonError}</span><span className="ml-auto text-[11px] text-slate-400">{reason.length}/300</span></div>
          </label>
        )}
      </DeliveryDialog>
    </div>
  );
};

export default DeliveryBoyDashboard;
