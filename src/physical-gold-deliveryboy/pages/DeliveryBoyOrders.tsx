import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MapPin,
  PackageSearch,
  Phone,
  RotateCw,
} from "lucide-react";
import {
  DeliveryOrder,
  DeliveryOrdersPage,
  DeliveryStatus,
  fetchDeliveryOrders,
} from "../services/deliveryBoyService";

const statuses: { value: DeliveryStatus; label: string }[] = [
  { value: "ASSIGNED", label: "New orders" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PICKED_UP", label: "Collected" },
  { value: "OUT_FOR_DELIVERY", label: "On the way" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REJECTED", label: "Declined" },
  { value: "FAILED", label: "Delivery issues" },
  { value: "REASSIGNED", label: "Moved to another partner" },
];
const badge: Record<DeliveryStatus, string> = {
  ASSIGNED: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-violet-50 text-violet-700",
  PICKED_UP: "bg-amber-50 text-amber-700",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  FAILED: "bg-red-50 text-red-700",
  REASSIGNED: "bg-slate-100 text-slate-700",
};
const displayDate = (order: DeliveryOrder) => {
  const value =
    order.deliveredAt ||
    order.outForDeliveryAt ||
    order.pickedUpAt ||
    order.acceptedAt ||
    order.assignedAt;
  if (!value) return "Time not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time not available"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

const DeliveryBoyOrders: React.FC = () => {
  const [status, setStatus] = useState<DeliveryStatus>("ASSIGNED");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<DeliveryOrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData((await fetchDeliveryOrders(status, page, 10)).data);
    } catch (err: any) {
      setError(err.message || "Unable to load deliveries.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);
  useEffect(() => {
    load();
  }, [load]);
  const currentLabel =
    statuses.find((item) => item.value === status)?.label || status;
  const totalPages = Math.max(data?.totalPages || 0, 1);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          Deliveries
        </h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E8D8A8] bg-white px-4 text-sm font-bold text-[#8B6914] shadow-sm"
        >
          <RotateCw className={loading ? "animate-spin" : ""} size={16} />
          Refresh
        </button>
      </section>
      <section className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <div
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
          role="tablist"
        >
          {statuses.map((item) => (
            <button
              key={item.value}
              role="tab"
              aria-selected={status === item.value}
              onClick={() => {
                setStatus(item.value);
                setPage(0);
              }}
              className={`min-h-10 shrink-0 rounded-xl px-4 text-xs font-bold ${status === item.value ? "bg-[#8B6914] text-white" : "text-slate-500 hover:bg-[#FBF7EC]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
        >
          <AlertCircle className="shrink-0" size={19} />
          <div className="flex-1">
            <p className="text-sm font-bold">Couldn’t load deliveries</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
          <button onClick={load} className="text-xs font-bold underline">
            Retry
          </button>
        </div>
      )}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-sm font-bold">
            {currentLabel}{" "}
            <span className="ml-1 font-medium text-slate-400">
              ({data?.totalElements || 0})
            </span>
          </h2>
        </header>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-400">
            <LoaderCircle className="animate-spin" size={19} />
            Loading orders...
          </div>
        ) : !data?.content?.length ? (
          <Empty label={currentLabel} />
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {data.content.map((order) => (
              <OrderCard key={order.deliveryId} order={order} />
            ))}
          </div>
        )}
        {!loading && !error && (data?.totalElements || 0) > 0 && (
          <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-4">
            <p className="text-xs text-slate-500">
              Page <b>{page + 1}</b> of <b>{totalPages}</b>
            </p>
            <div className="flex gap-2">
              <button
                aria-label="Previous page"
                disabled={page === 0}
                onClick={() => setPage((v) => v - 1)}
                className="grid h-10 w-10 place-items-center rounded-xl border disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label="Next page"
                disabled={data?.last || page + 1 >= totalPages}
                onClick={() => setPage((v) => v + 1)}
                className="grid h-10 w-10 place-items-center rounded-xl border disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
};

const Empty = ({ label }: { label: string }) => (
  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FBF7EC] text-[#9A7418]">
      <PackageSearch size={25} />
    </div>
    <h3 className="mt-4 text-sm font-bold">
      No {label.toLowerCase()} deliveries
    </h3>
  </div>
);
const OrderCard = ({ order }: { order: DeliveryOrder }) => (
  <article className="rounded-2xl border border-slate-200 p-4 hover:border-[#DCC781] sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-[#9A7418]">
          {order.orderNumber || `Order #${order.orderId}`}
        </p>
        <h3 className="mt-1 truncate font-bold">
          {order.customerName || "Customer"}
        </h3>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${badge[order.status]}`}
      >
        {order.statusLabel || order.status.replaceAll("_", " ")}
      </span>
    </div>
    <div className="mt-4 flex items-start gap-2">
      <MapPin className="mt-0.5 shrink-0 text-slate-400" size={14} />
      <p className="line-clamp-3 text-xs leading-5 text-slate-600" title={order.deliveryAddress || "Address not available"}>
        {order.deliveryAddress || "Address not available"}
      </p>
    </div>
    <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400">
      <span>{displayDate(order)}</span>
      <span>Tracking: {order.trackingNumber || "—"}</span>
    </div>
    {order.customerPhone && (
      <a
        href={`tel:${order.customerPhone}`}
        className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-bold"
      >
        <Phone size={16} />
        Call customer
      </a>
    )}
  </article>
);
export default DeliveryBoyOrders;
