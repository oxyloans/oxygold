import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  type LucideIcon,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  User,
  X,
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

const statusStyle: Record<string, { bg: string; text: string; border: string; icon: LucideIcon }> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock3,
  },
  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
  },
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
  const [action, setAction] = useState<"approve" | "reject" | "delete" | null>(null);
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
  };

  const closeModal = () => {
    if (working) return;
    setAction(null);
    setSelected(null);
    setReason("");
    setActionError("");
  };

  const confirmAction = async () => {
    if (!selected || !action) return;
    setWorking(selected.id);
    setActionError("");
    try {
      if (action === "approve") {
        replaceReview(await adminApproveReview(selected.id));
      } else if (action === "reject") {
        replaceReview(await adminRejectReview(selected.id, reason));
      } else {
        await adminDeleteReview(selected.id);
        setReviews((current) =>
          current.filter((item) => item.id !== selected.id),
        );
        setTotalElements((value) => Math.max(0, value - 1));
      }
      closeModal();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : `Unable to ${action} review.`,
      );
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="space-y-5 p-2 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
            Ratings &amp; Reviews
          </h1>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
            Review and moderate customer feedback &amp; ratings across your catalog
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(page)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 hover:bg-slate-50/80 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : "text-slate-500"} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Total Reviews", value: totalElements, icon: MessageSquareText, color: "bg-blue-50 text-blue-600 border-blue-100" },
          { label: "Pending (Page)", value: pageStats.pending, icon: Clock3, color: "bg-amber-50 text-amber-600 border-amber-100" },
          { label: "Approved (Page)", value: pageStats.approved, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          { label: "Rejected (Page)", value: pageStats.rejected, icon: XCircle, color: "bg-rose-50 text-rose-600 border-rose-100" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm hover:shadow transition">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${color}`}>
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold tabular-nums text-slate-800">{value}</p>
              <p className="truncate text-[11px] font-semibold text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, customer, email, order or review text..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-8 text-xs sm:text-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 no-scrollbar">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => {
              const active = status === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatus(tab)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition ${
                    active
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  {tab === "ALL" ? "All Reviews" : tab[0] + tab.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-700"
        >
          <span>{error}</span>
          <button
            onClick={() => load(page)}
            className="font-bold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reviews Main Card List */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#FBF7EC] px-4 sm:px-5 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8B6914]">
              Customer Feedback List
            </p>
            <p className="text-[11px] text-slate-500">
              Showing {visible.length} review{visible.length === 1 ? "" : "s"} on page {page + 1}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
            Newest First
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs sm:text-sm text-slate-500">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-amber-500" />
            Loading customer reviews...
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center px-4">
            <MessageSquareText className="mx-auto mb-3 text-slate-300" size={36} />
            <p className="font-semibold text-slate-700 text-sm sm:text-base">No matching reviews found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or filter status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((review) => {
              const statusConfig = statusStyle[review.moderationStatus] || statusStyle.PENDING;
              const StatusIcon = statusConfig.icon;
              return (
                <article
                  key={review.id}
                  className="p-4 sm:p-5 transition hover:bg-slate-50/80"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {review.productName}
                        </span>
                        {review.productId && (
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            #{review.productId}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          <StatusIcon size={12} />
                          {review.moderationStatus}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <ShieldCheck size={12} />
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      {/* Rating Stars & Value */}
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
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
                        <span className="text-xs font-bold text-slate-700">
                          {review.rating}.0 / 5
                        </span>
                      </div>

                      {/* Review Title & Text */}
                      {review.title && (
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {review.title}
                        </h3>
                      )}
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 break-words whitespace-pre-line">
                        {review.reviewText}
                      </p>

                      {/* Customer Details Footer */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] sm:text-xs text-slate-500 border-t border-slate-100/80 mt-2">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <User size={13} className="text-slate-400" />
                          {review.userFullName || "Anonymous"}
                        </span>
                        {review.userEmail && (
                          <span className="text-slate-400">{review.userEmail}</span>
                        )}
                        {review.orderId && (
                          <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            Order #{review.orderId}
                          </span>
                        )}
                        <span className="text-slate-400">
                          {new Date(review.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {review.moderationStatus !== "APPROVED" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(review);
                            setAction("approve");
                            setActionError("");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve</span>
                        </button>
                      )}
                      {review.moderationStatus !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(review);
                            setAction("reject");
                            setReason("");
                            setActionError("");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 cursor-pointer"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(review);
                          setAction("delete");
                          setActionError("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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

      {/* Action Dialog Modal (Approve / Reject / Delete) */}
      <Modal
        isOpen={!!selected && !!action}
        onClose={closeModal}
        title={
          action === "approve"
            ? "Approve Customer Review"
            : action === "delete"
              ? "Delete Review?"
              : "Reject Customer Review"
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={!!working}
            >
              Cancel
            </Button>
            <Button
              variant={action === "delete" ? "danger" : "primary"}
              className={action === "approve" ? "!bg-emerald-600 hover:!bg-emerald-700 text-white" : ""}
              onClick={confirmAction}
              disabled={!!working}
            >
              {working
                ? "Processing…"
                : action === "approve"
                  ? "Approve Review"
                  : action === "delete"
                    ? "Delete Review"
                    : "Reject Review"}
            </Button>
          </>
        }
      >
        {action === "approve" ? (
          <div className="space-y-3">
            {selected && (
              <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                <p className="font-semibold text-slate-800">{selected.productName}</p>
                <p className="truncate mt-0.5 text-slate-500">
                  By {selected.userFullName || "Anonymous"} &bull; {selected.rating}★
                </p>
                {selected.reviewText && (
                  <p className="mt-1.5 text-slate-600 line-clamp-3 italic">
                    "{selected.reviewText}"
                  </p>
                )}
              </div>
            )}
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to approve this customer review? Once approved, it will be publicly visible to all shoppers on the product page.
            </p>
          </div>
        ) : action === "reject" ? (
          <div className="space-y-3">
            {selected && (
              <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                <p className="font-semibold text-slate-800">{selected.productName}</p>
                <p className="truncate mt-0.5 text-slate-500">
                  By {selected.userFullName || "Anonymous"} &bull; {selected.rating}★
                </p>
              </div>
            )}
            <p className="text-xs sm:text-sm text-slate-600">
              Please provide a clear reason for rejecting this review for auditing purposes.
            </p>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setActionError("");
              }}
              rows={4}
              maxLength={500}
              placeholder="Reason for rejection (e.g. Inappropriate language, off-topic, spam)"
            />
            <p className="text-right text-[11px] text-slate-400">
              {reason.length}/500 characters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selected && (
              <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                <p className="font-semibold text-slate-800">{selected.productName}</p>
                <p className="truncate mt-0.5 text-slate-500">
                  By {selected.userFullName || "Anonymous"} &bull; {selected.rating}★
                </p>
              </div>
            )}
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to delete this review? This action cannot be undone and should only be used for severe spam or illegal content.
            </p>
          </div>
        )}
        {actionError && (
          <p className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {actionError}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;

