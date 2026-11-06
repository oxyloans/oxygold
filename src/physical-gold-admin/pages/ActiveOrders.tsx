import React, { useState, useEffect, useMemo, useCallback } from "react";
import Pagination from "../components/ui/Pagination";
import { Table } from "antd";
import {
  Zap,
  Search,
  Eye,
  RefreshCw,
  User,
  MapPin,
  Box,
  ShoppingBag,
  Bike,
  Truck,
  RotateCcw,
  CreditCard,
  Banknote,
  X,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import AssignDeliveryModal from "../components/AssignDeliveryModal";
import {
  fetchActiveOrders,
  AdminOrder,
} from "../services/adminService";

const ActiveOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // In-page search and filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("ALL");
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>("ALL");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const loadOrders = useCallback(
    async (page: number, size: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchActiveOrders(page, size);
        setOrders(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
      } catch (err: any) {
        console.error("Failed to fetch active orders:", err);
        setError(err?.message || "Failed to load active orders. Please try again.");
        setOrders([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadOrders(currentPage, pageSize);
  }, [currentPage, pageSize, loadOrders]);

  const openOrderDetails = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const openAssignModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  const formatCurrency = (amount?: number | null) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount ?? 0);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateString);
    }
  };

  const getDeliveryId = (order: AdminOrder) =>
    order.deliveryId ||
    order.deliveryDetails?.deliveryId ||
    order.delivery?.deliveryId ||
    order.delivery?.id;

  const getOrderDeliveryStatus = (order: AdminOrder): string => {
    return (
      order.deliveryStatus ||
      order.deliveryDetails?.deliveryStatus ||
      order.delivery?.currentStatus ||
      order.delivery?.status ||
      "PENDING"
    );
  };

  const getDeliveryBoyName = (order: AdminOrder) => {
    if (order.deliveryBoyName) return order.deliveryBoyName;
    if (order.deliveryDetails?.deliveryBoyName) return order.deliveryDetails.deliveryBoyName;
    if (order.delivery?.deliveryBoyName) return order.delivery.deliveryBoyName;
    if (order.delivery?.deliveryBoy) {
      const { firstName, lastName } = order.delivery.deliveryBoy;
      const fullName = `${firstName || ""} ${lastName || ""}`.trim();
      if (fullName) return fullName;
    }
    return "Not assigned";
  };

  const getDeliveryBoyPhone = (order: AdminOrder) => {
    return (
      order.deliveryBoyPhone ||
      order.deliveryDetails?.deliveryBoyPhone ||
      order.delivery?.deliveryBoyPhone ||
      order.delivery?.deliveryBoy?.phone ||
      "—"
    );
  };

  const getFormattedAddress = (order: AdminOrder) => {
    const parts = [
      order.flatNo || order.deliveryDetails?.flatNo,
      order.address || order.deliveryDetails?.address,
      order.landMark || order.deliveryDetails?.landMark,
      order.state || order.deliveryDetails?.state,
      order.pinCode || order.deliveryDetails?.pinCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Address unavailable";
  };

  const getOrderStatusBadgeClass = (status?: string | null) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
      case "CONFIRMED":
      case "DELIVERED":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";
      case "PENDING":
      case "PROCESSING":
      case "CREATED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPaymentBadgeClass = (status?: string | null) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
      case "TXN_ID_CREATED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getDeliveryBadgeClass = (status?: string | null) => {
    switch (status?.toUpperCase()) {
      case "ASSIGNED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ACCEPTED":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "PICKED_UP":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";
      case "CANCELLED":
        return "bg-slate-50 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) return "bg-slate-50 text-slate-600 border-slate-200";
    const s = status.toLowerCase();
    if (
      s.includes("success") ||
      s.includes("confirmed") ||
      s.includes("completed") ||
      s.includes("delivered") ||
      s.includes("paid")
    )
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("pending") || s.includes("processing") || s.includes("created"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (s.includes("assigned"))
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (s.includes("accepted") || s.includes("picked"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    if (s.includes("out_for") || s.includes("out for"))
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (s.includes("fail") || s.includes("cancel") || s.includes("reject"))
      return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  // Filter orders by search query and secondary filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
        (String(order.orderId) && String(order.orderId).includes(query)) ||
        (order.userName && order.userName.toLowerCase().includes(query)) ||
        (order.phoneNumber && order.phoneNumber.includes(query)) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(query)) ||
        (getDeliveryBoyName(order).toLowerCase().includes(query)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(query)) ||
        order.items?.some(
          (item) =>
            (item.productName && item.productName.toLowerCase().includes(query)) ||
            (item.variant && item.variant.toLowerCase().includes(query)),
        );

      const matchesOrderStatus =
        orderStatusFilter === "ALL" ||
        (order.orderStatus &&
          order.orderStatus.toUpperCase() === orderStatusFilter);

      const matchesPaymentStatus =
        paymentStatusFilter === "ALL" ||
        (order.paymentStatus &&
          order.paymentStatus.toUpperCase() === paymentStatusFilter);

      const matchesPaymentMode =
        paymentModeFilter === "ALL" ||
        (order.paymentMode &&
          order.paymentMode.toUpperCase() === paymentModeFilter);

      return matchesQuery && matchesOrderStatus && matchesPaymentStatus && matchesPaymentMode;
    });
  }, [orders, searchQuery, orderStatusFilter, paymentStatusFilter, paymentModeFilter]);

  // Statistics cards data
  const stats = useMemo(() => {
    const totalStatusValue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );
    const uniqueDeliveryBoys = new Set(
      orders.map((o) => getDeliveryBoyName(o)).filter((n) => n !== "Not assigned"),
    ).size;
    const totalItems = orders.reduce((sum, o) => sum + (o.totalItems || 0), 0);

    return [
      {
        label: "Total Active Orders",
        value: `${totalElements}`,
        icon: <Zap size={20} />,
        color: "bg-amber-50 text-amber-700",
      },
      {
        label: "Active Total Value",
        value: formatCurrency(totalStatusValue),
        icon: <Banknote size={20} />,
        color: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Delivery Partners",
        value: `${uniqueDeliveryBoys}`,
        icon: <Bike size={20} />,
        color: "bg-purple-50 text-purple-700",
      },
      {
        label: "Total Items",
        value: `${totalItems}`,
        icon: <Box size={20} />,
        color: "bg-blue-50 text-blue-600",
      },
    ];
  }, [orders, totalElements]);

  const columns = [
    {
      title: "Order Info",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (_: string, item: AdminOrder) => (
        <div className="min-w-[140px] space-y-1 text-left text-[12px]">
          <p>
            <b>Order:</b> {item.orderNumber}
          </p>
          <p>
            <b>Order ID:</b> #{item.orderId || item.id}
          </p>
          <p>
            <b>User ID:</b> #{item.userId}
          </p>
          <p className="font-bold text-emerald-600">
            {formatCurrency(item.totalAmount)}
          </p>
        </div>
      ),
    },
    {
      title: "Customer Details",
      dataIndex: "userName",
      key: "userName",
      render: (_: string, item: AdminOrder) => (
        <div className="min-w-[170px] space-y-1 text-left text-[12px]">
          <p className="font-bold text-slate-700">
            {item.userName || "Anonymous"}
          </p>
          <p>{item.phoneNumber || "—"}</p>
          <p className="break-all text-slate-400">
            {item.userEmail || "No email"}
          </p>
          <p>
            <b>Ordered:</b> {item.createdAt ? formatDateTime(item.createdAt) : "—"}
          </p>
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getOrderStatusBadgeClass(item.orderStatus)}`}
          >
            {item.orderStatus}
          </span>
        </div>
      ),
    },
    {
      title: "Delivery Status",
      dataIndex: "deliveryStatus",
      key: "deliveryStatus",
      width: 190,
      render: (_: unknown, item: AdminOrder) => {
        const deliveryStatus = getOrderDeliveryStatus(item);
        const deliveryBoy = getDeliveryBoyName(item);
        const deliveryPhone = getDeliveryBoyPhone(item);
        const tracking =
          item.trackingNumber ||
          item.deliveryDetails?.trackingNumber ||
          item.delivery?.trackingNumber;

        return (
          <div className="min-w-[140px] space-y-1 text-left text-[12px]">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${getDeliveryBadgeClass(deliveryStatus)}`}
            >
              {deliveryStatus}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              {deliveryBoy !== "Not assigned" && (
                <Bike size={13} className="text-purple-600 shrink-0" />
              )}
              <span>{deliveryBoy}</span>
            </div>
            {deliveryPhone !== "—" && (
              <p className="text-slate-500">{deliveryPhone}</p>
            )}
            {tracking && (
              <p className="text-[10px] text-slate-400">
                Tracking: {tracking}
              </p>
            )}
          </div>
        );
      },
    },
    {
      title: "Delivery Address",
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (_: unknown, item: AdminOrder) => {
        const addressText = getFormattedAddress(item);
        const hasCoords = item.latitude || item.longitude;

        return (
          <div className="w-[200px] space-y-0.5 text-left text-[12px] leading-4">
            <p className="line-clamp-2 text-slate-600" title={addressText}>
              {addressText}
            </p>
            {hasCoords && (
              <p className="truncate text-[10px] text-slate-400">
                Lat: {item.latitude || "—"} · Long: {item.longitude || "—"}
              </p>
            )}
            {item.deliveryDistanceKm != null && item.deliveryDistanceKm > 0 && (
              <p className="text-[10px] font-semibold text-slate-500">
                Distance: {item.deliveryDistanceKm} km
              </p>
            )}
          </div>
        );
      },
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (_: unknown, item: AdminOrder) => (
        <div className="min-w-[220px] space-y-2 text-left">
          {item.items?.map((product) => (
            <div
              key={product.orderItemId || product.productId}
              className="rounded-lg bg-slate-50 p-2 text-[11px]"
            >
              <p className="font-bold text-slate-700">
                {product.productName || `Product #${product.productId}`}
              </p>
              <p className="mt-0.5 text-slate-500">
                {product.variant || "Standard variant"}
              </p>
              <p className="mt-1">
                Qty: {product.quantity} · {formatCurrency(product.price)} ·{" "}
                <b>
                  {formatCurrency(
                    product.subtotal ?? product.price * product.quantity,
                  )}
                </b>
              </p>
            </div>
          ))}
          {(!item.items || item.items.length === 0) && (
            <span className="text-slate-400 text-[11px]">No items data</span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_: unknown, item: AdminOrder) => {
        const deliveryStatus = getOrderDeliveryStatus(item);
        const isAssigned = deliveryStatus.toUpperCase() === "ASSIGNED";

        return (
          <div className="flex flex-col gap-1.5 text-left">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openOrderDetails(item)}
              className="flex items-center gap-1.5 justify-center text-[11px] py-1"
            >
              <Eye size={12} />
              View Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openAssignModal(item)}
              className="flex items-center gap-1.5 justify-center text-[11px] py-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Bike size={12} />
              {isAssigned ? "Reassign" : "Assign Boy"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                Active Orders
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Real-time tracking of active customer orders in processing and transit
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders(currentPage, pageSize)}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-amber-500" : ""}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {stat.label}
              </span>
              <div className={`rounded-xl p-2 ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer, phone, tracking #, product..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Order Status" },
                { value: "CREATED", label: "Created" },
                { value: "SUCCESS", label: "Success" },
                { value: "CONFIRMED", label: "Confirmed" },
                { value: "PENDING", label: "Pending" },
                { value: "PROCESSING", label: "Processing" },
                { value: "DELIVERED", label: "Delivered" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "FAILED", label: "Failed" },
              ]}
              className="w-36 text-xs"
            />

            <Select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Payments" },
                { value: "SUCCESS", label: "Paid" },
                { value: "PENDING", label: "Pending" },
                { value: "FAILED", label: "Failed" },
              ]}
              className="w-32 text-xs"
            />

            <Select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Modes" },
                { value: "CASHFREE", label: "Cashfree" },
                { value: "ONLINE", label: "Online" },
                { value: "WALLET", label: "Wallet" },
                { value: "COD", label: "COD" },
              ]}
              className="w-32 text-xs"
            />

            {(searchQuery ||
              orderStatusFilter !== "ALL" ||
              paymentStatusFilter !== "ALL" ||
              paymentModeFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setOrderStatusFilter("ALL");
                  setPaymentStatusFilter("ALL");
                  setPaymentModeFilter("ALL");
                }}
                className="flex items-center gap-1 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Showing counts */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <b>{filteredOrders.length}</b> of <b>{orders.length}</b> orders on this page (Total {totalElements} active)
          </span>
          {loading && (
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <RefreshCw size={12} className="animate-spin" />
              Updating live orders...
            </span>
          )}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center justify-between">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders(currentPage, pageSize)}
            className="border-rose-300 text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Table section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey={(item) =>
            item.orderId ||
            item.id ||
            item.orderNumber ||
            item.orderDetails?.orderId ||
            Math.random()
          }
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <div className="py-12 text-center text-slate-400">
                <ShoppingBag size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No active orders found</p>
                <p className="text-xs text-slate-400 mt-1">
                  There are no active orders matching your current filter criteria.
                </p>
              </div>
            ),
          }}
        />

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Order Details - ${selectedOrder?.orderNumber || ""}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Top Row: Left: Customer Details, Right: Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Customer Information */}
              <div className="space-y-2 flex flex-col h-full">
                <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5">
                  <User size={15} className="text-emerald-600" />
                  Customer Information
                </h3>

                <div className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2 shadow-sm h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Customer Name
                        </span>
                        <span className="text-[14px] font-bold text-slate-800 truncate">
                          {selectedOrder.userName ||
                            selectedOrder.userDetails?.userName ||
                            "Anonymous Customer"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1 border-t border-slate-50 text-[13px]">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {selectedOrder.phoneNumber ||
                            selectedOrder.userDetails?.phoneNumber ||
                            "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="text-slate-600 truncate">
                          {selectedOrder.userEmail ||
                            selectedOrder.userDetails?.userEmail ||
                            "No email provided"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span className="text-slate-600 text-[12px]">
                          Placed:{" "}
                          <b className="text-slate-700">
                            {formatDateTime(
                              selectedOrder.createdAt ||
                                selectedOrder.orderDetails?.createdAt
                            )}
                          </b>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[12px] text-slate-400 font-medium">Order Status</span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getOrderStatusBadgeClass(
                        selectedOrder.orderStatus ||
                          selectedOrder.orderDetails?.orderStatus
                      )}`}
                    >
                      {selectedOrder.orderStatus ||
                        selectedOrder.orderDetails?.orderStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2 flex flex-col h-full">
                <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin size={15} className="text-emerald-600" />
                  Shipping Address
                </h3>

                <div className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2 shadow-sm h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[13px] text-slate-500 font-medium block">
                        Full Address
                      </span>
                      <p className="text-[14px] font-semibold text-slate-800 mt-0.5 leading-relaxed">
                        {getFormattedAddress(selectedOrder)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-500">
                    {(selectedOrder.latitude || selectedOrder.longitude) && (
                      <span>
                        Lat: {selectedOrder.latitude || selectedOrder.deliveryDetails?.latitude || "—"} · Long:{" "}
                        {selectedOrder.longitude || selectedOrder.deliveryDetails?.longitude || "—"}
                      </span>
                    )}
                    {selectedOrder.deliveryDistanceKm != null && selectedOrder.deliveryDistanceKm > 0 && (
                      <span className="font-bold text-slate-700">
                        Distance: {selectedOrder.deliveryDistanceKm} km
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Assignment & Tracking Details Card */}
            <div className="space-y-2">
              <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5">
                <Truck size={15} className="text-purple-600" />
                Delivery Assignment &amp; Details
              </h3>
              <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[14px]">
                  <div>
                    <span className="text-[12px] text-slate-400 font-medium block">Delivery Status</span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border mt-1 ${getDeliveryBadgeClass(getOrderDeliveryStatus(selectedOrder))}`}
                    >
                      {getOrderDeliveryStatus(selectedOrder)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[12px] text-slate-400 font-medium block">Delivery Partner</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                      <Bike size={14} className="text-purple-600 shrink-0" />
                      {getDeliveryBoyName(selectedOrder)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[12px] text-slate-400 font-medium block">Partner Phone</span>
                    <span className="font-bold text-slate-800 block mt-1">
                      {getDeliveryBoyPhone(selectedOrder)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[12px] text-slate-400 font-medium block">Tracking Number</span>
                    <span className="font-mono text-slate-700 block mt-1 break-all">
                      {selectedOrder.trackingNumber ||
                        selectedOrder.deliveryDetails?.trackingNumber ||
                        selectedOrder.delivery?.trackingNumber ||
                        "—"}
                    </span>
                  </div>
                </div>

                {/* Second row of delivery details */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
                  {(selectedOrder.delivery?.otp || selectedOrder.deliveryDetails?.delivery?.otp) && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Delivery OTP</span>
                      <span className="font-mono font-bold text-emerald-600 block mt-0.5">
                        {selectedOrder.delivery?.otp || selectedOrder.deliveryDetails?.delivery?.otp}
                      </span>
                    </div>
                  )}
                  {(selectedOrder.assignedAt || selectedOrder.deliveryDetails?.assignedAt) && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Assigned At</span>
                      <span className="font-semibold text-slate-700 block mt-0.5">
                        {formatDateTime(selectedOrder.assignedAt || selectedOrder.deliveryDetails?.assignedAt)}
                      </span>
                    </div>
                  )}
                  {(selectedOrder.delivery?.expectedDeliveryTime || selectedOrder.deliveryDetails?.expectedDeliveryTime) && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Expected Delivery</span>
                      <span className="font-semibold text-slate-700 block mt-0.5">
                        {formatDateTime(selectedOrder.delivery?.expectedDeliveryTime || selectedOrder.deliveryDetails?.expectedDeliveryTime)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.deliveryDistanceKm != null && selectedOrder.deliveryDistanceKm > 0 && (
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Delivery Distance</span>
                      <span className="font-semibold text-slate-700 block mt-0.5">
                        {selectedOrder.deliveryDistanceKm} km
                      </span>
                    </div>
                  )}
                </div>

                {/* Timeline (if present) */}
                {selectedOrder.delivery?.timeline && selectedOrder.delivery.timeline.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Delivery Timeline
                    </span>
                    <div className="space-y-1">
                      {selectedOrder.delivery.timeline.map((event: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="font-medium text-slate-700">
                              {event.label || event.statusLabel || event.status}
                            </span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {formatDateTime(event.time || event.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                <Box size={15} className="text-emerald-600" />
                Order Items ({selectedOrder.items?.length || selectedOrder.totalItems || 0})
              </h3>
              <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-slate-50/80 text-slate-700 text-[13px] font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 text-center">Product ID</th>
                      <th className="px-4 py-2.5 text-left">Product Name</th>
                      <th className="px-4 py-2.5 text-center">Price</th>
                      <th className="px-4 py-2.5 text-center">Quantity</th>
                      <th className="px-4 py-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-2 font-semibold text-slate-700 text-center text-[13px]">
                          #{item.productId}
                        </td>
                        <td className="px-4 py-2 text-left font-medium text-slate-800 text-[14px]">
                          <span className="font-semibold block text-slate-800">
                            {item.productName || `Product #${item.productId}`}
                          </span>
                          {item.variant && (
                            <span className="block text-[12px] text-slate-400 font-normal">
                              {item.variant}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-slate-600 tabular-nums text-center text-[13px]">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-2 text-slate-700 tabular-nums text-center font-bold text-[13px]">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 font-bold text-slate-800 text-right tabular-nums text-[14px]">
                          {formatCurrency(
                            item.subtotal ?? item.price * item.quantity
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400 text-[13px]">
                          No items listed for this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50/50 font-bold border-t border-slate-100 text-[13px]">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-2 text-right text-slate-600"
                      >
                        Items Total
                      </td>
                      <td className="px-4 py-2 text-right text-emerald-600 text-[14px] tabular-nums font-bold">
                        {formatCurrency(
                          selectedOrder.items?.reduce(
                            (sum, it) =>
                              sum + (it.subtotal ?? it.price * it.quantity),
                            0
                          ) || selectedOrder.totalAmount
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment & Pricing Details Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Payment Details Table */}
              <div className="space-y-2 flex flex-col">
                <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-emerald-600" />
                  Payment Details
                </h3>
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex-1">
                  <table className="w-full text-left text-[14px]">
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Payment Status
                        </td>
                        <td className="px-4 py-2 font-bold text-[14px] text-right">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getStatusColor(
                              selectedOrder.paymentDetails?.paymentStatus ||
                                selectedOrder.paymentStatus
                            )}`}
                          >
                            {selectedOrder.paymentDetails?.paymentStatus ||
                              selectedOrder.paymentStatus ||
                              "—"}
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Payment Mode
                        </td>
                        <td className="px-4 py-2 font-semibold text-slate-800 uppercase text-[14px] text-right">
                          {selectedOrder.paymentDetails?.paymentMode ||
                            selectedOrder.paymentMode ||
                            "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Payment Mode Display
                        </td>
                        <td className="px-4 py-2 font-semibold text-slate-800 uppercase text-[14px] text-right">
                          {selectedOrder.paymentDetails?.paymentModeDisplay ||
                            selectedOrder.paymentModeDisplay ||
                            "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Payment Method
                        </td>
                        <td className="px-4 py-2 font-semibold text-slate-800 uppercase text-[14px] text-right">
                          {selectedOrder.paymentDetails?.paymentMethod ||
                            selectedOrder.paymentMethod ||
                            "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Transaction ID
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-700 text-[14px] text-right">
                          {selectedOrder.paymentDetails?.txnId ||
                            selectedOrder.txnId ||
                            "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Payment Session ID
                        </td>
                        <td
                          className="px-4 py-2 font-mono text-slate-700 truncate max-w-[200px] text-[14px] text-right ml-auto"
                          title={
                            selectedOrder.paymentDetails?.paymentSessionId ||
                            selectedOrder.paymentSessionId ||
                            undefined
                          }
                        >
                          {selectedOrder.paymentDetails?.paymentSessionId ||
                            selectedOrder.paymentSessionId ||
                            "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Payment Expiry
                        </td>
                        <td className="px-4 py-2 text-slate-700 text-[14px] text-right">
                          {selectedOrder.paymentDetails?.paymentExpiry ||
                          selectedOrder.paymentExpiry
                            ? formatDateTime(
                                selectedOrder.paymentDetails?.paymentExpiry ||
                                  selectedOrder.paymentExpiry
                              )
                            : "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Gateway Environment
                        </td>
                        <td className="px-4 py-2 text-slate-700 uppercase text-[14px] text-right">
                          {selectedOrder.paymentDetails?.gatewayEnvironment ||
                            selectedOrder.gatewayEnvironment ||
                            "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Details Table */}
              <div className="space-y-2 flex flex-col">
                <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Banknote size={15} className="text-emerald-600" />
                  Pricing Details
                </h3>
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex-1">
                  <table className="w-full text-left text-[14px]">
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Total Amount
                        </td>
                        <td className="px-4 py-2 font-bold text-emerald-600 text-[15px] tabular-nums text-right">
                          {formatCurrency(
                            selectedOrder.pricingDetails?.totalAmount ??
                              selectedOrder.totalAmount
                          )}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Total Discount Amount
                        </td>
                        <td className="px-4 py-2 font-semibold text-emerald-600 tabular-nums text-[14px] text-right">
                          {(selectedOrder.pricingDetails?.totalDiscountAmount ??
                          selectedOrder.totalDiscountAmount)
                            ? `-${formatCurrency(
                                selectedOrder.pricingDetails?.totalDiscountAmount ??
                                  selectedOrder.totalDiscountAmount
                              )}`
                            : "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Delivery Fee
                        </td>
                        <td className="px-4 py-2 font-semibold text-slate-700 tabular-nums text-[14px] text-right">
                          {selectedOrder.pricingDetails?.deliveryFee != null
                            ? selectedOrder.pricingDetails.deliveryFee === 0
                              ? "Free"
                              : formatCurrency(
                                  selectedOrder.pricingDetails.deliveryFee
                                )
                            : selectedOrder.deliveryFee != null
                            ? selectedOrder.deliveryFee === 0
                              ? "Free"
                              : formatCurrency(selectedOrder.deliveryFee)
                            : "Free"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Delivery Distance
                        </td>
                        <td className="px-4 py-2 text-slate-700 text-[14px] text-right">
                          {selectedOrder.pricingDetails?.deliveryDistanceKm != null
                            ? `${selectedOrder.pricingDetails.deliveryDistanceKm} km`
                            : selectedOrder.deliveryDistanceKm != null
                            ? `${selectedOrder.deliveryDistanceKm} km`
                            : "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Coupon Code
                        </td>
                        <td className="px-4 py-2 font-semibold text-slate-800 text-[14px] text-right">
                          {selectedOrder.pricingDetails?.couponCode ||
                            selectedOrder.couponCode ||
                            "None"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Coupon Discount Amount
                        </td>
                        <td className="px-4 py-2 font-semibold text-emerald-600 tabular-nums text-[14px] text-right">
                          {(selectedOrder.pricingDetails?.couponDiscountAmount ??
                          selectedOrder.couponDiscountAmount)
                            ? `-${formatCurrency(
                                selectedOrder.pricingDetails?.couponDiscountAmount ??
                                  selectedOrder.couponDiscountAmount
                              )}`
                            : "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2 text-slate-500 font-medium text-[14px] whitespace-nowrap text-left">
                          Coupon Eligible Amount
                        </td>
                        <td className="px-4 py-2 font-semibold text-slate-700 tabular-nums text-[14px] text-right">
                          {formatCurrency(
                            selectedOrder.pricingDetails?.couponEligibleAmount ??
                              selectedOrder.couponEligibleAmount ??
                              0
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsAssignModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Bike size={14} />
                {getOrderDeliveryStatus(selectedOrder).toUpperCase() === "ASSIGNED"
                  ? "Reassign Delivery Partner"
                  : "Assign Delivery Partner"}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Delivery Partner Modal */}
      <AssignDeliveryModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        order={selectedOrder}
        onSuccess={() => {
          loadOrders(currentPage, pageSize);
          setIsAssignModalOpen(false);
        }}
      />
    </div>
  );
};

export default ActiveOrders;
