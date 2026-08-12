import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import Textarea from "../components/ui/Textarea";
import {
  adminApproveReview,
  adminDeleteReview,
  adminFetchReviews,
  adminRejectReview,
  type AdminReview,
} from "../services/adminService";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
};

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<AdminReview | null>(null);
  const [action, setAction] = useState<"reject" | "delete" | null>(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [working, setWorking] = useState<number | null>(null);
  const pageSize = 20;

  const load = useCallback(
    async (targetPage = page) => {
      setLoading(true);
      setError("");
      try {
        const data = await adminFetchReviews(targetPage, pageSize);
        setReviews(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load reviews.",
        );
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  const visible = useMemo(
    () =>
      reviews.filter((review) => {
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          [
            review.productName,
            review.userFullName,
            review.userEmail,
            review.title,
            review.reviewText,
            String(review.orderId || ""),
          ].some((value) => value?.toLowerCase().includes(term));
        return (
          matchesSearch &&
          (status === "ALL" || review.moderationStatus === status)
        );
      }),
    [reviews, search, status],
  );

  const pageStats = useMemo(
    () => ({
      pending: reviews.filter((review) => review.moderationStatus === "PENDING").length,
      approved: reviews.filter((review) => review.moderationStatus === "APPROVED").length,
      rejected: reviews.filter((review) => review.moderationStatus === "REJECTED").length,
    }),
    [reviews],
  );

  const replaceReview = (updated: AdminReview) => {
    setReviews((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected(updated);
  };
  const approve = async (review: AdminReview) => {
    setWorking(review.id);
    setActionError("");
    try {
      replaceReview(await adminApproveReview(review.id));
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to approve review.",
      );
    } finally {
      setWorking(null);
    }
  };
  const confirmAction = async () => {
    if (!selected || !action) return;
    setWorking(selected.id);
    setActionError("");
    try {
      if (action === "reject")
        replaceReview(await adminRejectReview(selected.id, reason));
      else {
        await adminDeleteReview(selected.id);
        setReviews((current) =>
          current.filter((item) => item.id !== selected.id),
        );
        setSelected(null);
        setTotalElements((value) => Math.max(0, value - 1));
      }
      setAction(null);
      setReason("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : `Unable to ${action} review.`,
      );
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <MessageSquareText size={20} />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Ratings &amp; Reviews
            </h1>
          </div>
          <p className="ml-11 mt-0.5 text-[12px] font-medium text-slate-400">
            Review and moderate customer feedback across your catalogue
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(page)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total reviews", value: totalElements, icon: MessageSquareText, color: "bg-blue-50 text-blue-600" },
          { label: "Pending on page", value: pageStats.pending, icon: Clock3, color: "bg-amber-50 text-amber-600" },
          { label: "Approved on page", value: pageStats.approved, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
          { label: "Rejected on page", value: pageStats.rejected, icon: XCircle, color: "bg-rose-50 text-rose-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold tabular-nums text-slate-800">{value}</p>
              <p className="truncate text-[11px] font-semibold text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search current page by product, customer, order or review"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </label>
          <div className="flex overflow-x-auto rounded-lg bg-slate-100 p-1">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatus(tab)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-bold transition ${
                  status === tab
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === "ALL" ? "All reviews" : tab[0] + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}{" "}
          <button
            onClick={() => load(page)}
            className="ml-2 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#FBF7EC] px-5 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8B6914]">Customer feedback</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Showing {visible.length} review{visible.length === 1 ? "" : "s"} on this page</p>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">Newest first</span>
        </div>
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500">
            Loading reviews…
          </div>
        ) : visible.length === 0 ? (
          <div className="p-16 text-center">
            <MessageSquareText className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">No matching reviews</p>
            <p className="text-sm text-slate-400">
              Try another filter or page.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((review) => (
              <article key={review.id} className="p-4 transition hover:bg-slate-50/60 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-800">
                        {review.productName}
                      </h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusStyle[review.moderationStatus]}`}
                      >
                        {review.moderationStatus}
                      </span>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <ShieldCheck size={13} />
                          Verified purchase
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={15}
                          fill={value <= review.rating ? "#D4AF37" : "none"}
                          stroke={
                            value <= review.rating ? "#D4AF37" : "#cbd5e1"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-2 font-semibold text-slate-700">
                      {review.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                      {review.reviewText}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      {review.userFullName}
                      {review.userEmail ? ` · ${review.userEmail}` : ""} · Order
                      #{review.orderId || "—"} ·{" "}
                      {new Date(review.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelected(review)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      <Eye size={14} />
                      Details
                    </button>
                    {review.moderationStatus !== "APPROVED" && (
                      <button
                        disabled={working === review.id}
                        onClick={() => approve(review)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>
                    )}
                    {review.moderationStatus !== "REJECTED" && (
                      <button
                        onClick={() => {
                          setSelected(review);
                          setAction("reject");
                          setReason("");
                          setActionError("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalElements={totalElements}
          size={pageSize}
        />
      </div>
      <Modal
        isOpen={!!selected && !action}
        onClose={() => setSelected(null)}
        title="Review details"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <p>
                <b>Product:</b> {selected.productName} (#{selected.productId})
              </p>
              <p>
                <b>Customer:</b> {selected.userFullName}
              </p>
              <p>
                <b>Order:</b> #{selected.orderId || "—"} / Item #
                {selected.orderItemId || "—"}
              </p>
              <p>
                <b>Status:</b> {selected.moderationStatus}
              </p>
            </div>
            <div>
              <h4 className="font-bold">{selected.title}</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {selected.reviewText}
              </p>
            </div>
            {selected.media?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-bold">
                  Media ({selected.media.length})
                </p>
                {selected.media.map((media) => (
                  <div
                    key={media.id}
                    className="rounded-lg border p-3 text-xs text-slate-500"
                  >
                    {media.mediaType}:{" "}
                    {media.mediaUrl.startsWith("http") ? (
                      <a
                        className="text-blue-600 underline"
                        href={media.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open media
                      </a>
                    ) : (
                      <span title={media.mediaUrl}>Stored securely in S3</span>
                    )}
                  </div>
                ))}
              </div>
            )}{" "}
            {actionError && (
              <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {actionError}
              </p>
            )}
            <div className="flex justify-between border-t pt-4">
              <button
                onClick={() => setAction("delete")}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600"
              >
                <Trash2 size={14} />
                Delete permanently
              </button>
              <div className="flex gap-2">
                {selected.moderationStatus !== "REJECTED" && (
                  <Button
                    onClick={() => setAction("reject")}
                    variant="secondary"
                  >
                    Reject
                  </Button>
                )}
                {selected.moderationStatus !== "APPROVED" && (
                  <Button onClick={() => approve(selected)}>Approve</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={!!selected && !!action}
        onClose={() => !working && setAction(null)}
        title={
          action === "delete" ? "Delete review permanently?" : "Reject review"
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setAction(null)}
              disabled={!!working}
            >
              Cancel
            </Button>
            <Button onClick={confirmAction} disabled={!!working}>
              {working
                ? "Processing…"
                : action === "delete"
                  ? "Delete review"
                  : "Reject review"}
            </Button>
          </>
        }
      >
        {action === "reject" ? (
          <>
            <p className="mb-3 text-sm text-slate-600">
              Give a clear moderation reason for the audit record.
            </p>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setActionError("");
              }}
              rows={4}
              maxLength={500}
              placeholder="Reason for rejection (3–500 characters)"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {reason.length}/500
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-600">
            This action cannot be undone. Use deletion only for spam, abuse, or
            legally required removal.
          </p>
        )}
        {actionError && (
          <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {actionError}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;
