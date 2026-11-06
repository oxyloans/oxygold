import React, { useState, useEffect, useMemo, useCallback } from "react";
import Pagination from "../components/ui/Pagination";
import { Table } from "antd";
import {
  Truck,
  Search,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Box,
  Banknote,
  RotateCcw,
  Bike,
  MapPin,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import {
  fetchAssignedOrders,
  AdminOrder,
} from "../services/adminService";
import AssignDeliveryModal from "../components/AssignDeliveryModal";

const AssignedOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("ALL");
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>("ALL");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const loadOrders = useCallback(async (page = currentPage) => {
    setIsLoading(true);
    try {
      const data = await fetchAssignedOrders(page, pageSize);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch assigned orders:", error);
      setOrders([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage, loadOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  const getDeliveryStatus = (order: AdminOrder) =>
    order.deliveryStatus ||
    order.deliveryDetails?.deliveryStatus ||
    order.delivery?.currentStatus ||
    order.delivery?.status ||
    "ASSIGNED";

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

  // Filter orders by search & payment status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
        (String(order.orderId) && String(order.orderId).includes(q)) ||
        (order.userName && order.userName.toLowerCase().includes(q)) ||
        (order.phoneNumber && order.phoneNumber.includes(q)) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(q)) ||
        (getDeliveryBoyName(order).toLowerCase().includes(q)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q)) ||
        order.items?.some(
          (it) => it.productName && it.productName.toLowerCase().includes(q),
        );

      const matchesPaymentStatus =
        paymentStatusFilter === "ALL" ||
        (order.paymentStatus &&
          order.paymentStatus.toUpperCase() === paymentStatusFilter);

      const matchesPaymentMode =
        paymentModeFilter === "ALL" ||
        (order.paymentMode &&
          order.paymentMode.toUpperCase() === paymentModeFilter);

      return matchesSearch && matchesPaymentStatus && matchesPaymentMode;
    });
  }, [orders, searchTerm, paymentStatusFilter, paymentModeFilter]);

  // Statistics cards data
  const stats = useMemo(() => {
    const totalAssignedValue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );
    const uniqueDeliveryBoys = new Set(
      orders.map((o) => getDeliveryBoyName(o)).filter((n) => n !== "Not assigned"),
    ).size;
    const totalItems = orders.reduce((sum, o) => sum + (o.totalItems || 0), 0);

    return [
      {
        label: "Total Assigned",
        value: `${totalElements}`,
        icon: <Truck size={20} />,
        color: "bg-purple-50 text-purple-700",
      },
      {
        label: "Assigned Value",
        value: formatCurrency(totalAssignedValue),
        icon: <Banknote size={20} />,
        color: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Active Delivery Boys",
        value: `${uniqueDeliveryBoys}`,
        icon: <Bike size={20} />,
        color: "bg-blue-50 text-blue-600",
      },
      {
        label: "Total Items",
        value: `${totalItems}`,
        icon: <Box size={20} />,
        color: "bg-amber-50 text-amber-600",
      },
    ];
  }, [orders, totalElements]);

  const openDeliveryAction = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  const handleRowClick = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Order Info",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (_: string, item: AdminOrder) => (
        <div className="min-w-[120px] space-y-1 text-left text-[12px]">
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
        <div className="min-w-[180px] space-y-1 text-left text-[12px]">
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
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusColor(item.orderStatus)}`}
          >
            {item.orderStatus}
          </span>
        </div>
      ),
    },
    {
      title: "Assigned Delivery",
      dataIndex: "deliveryStatus",
      key: "deliveryStatus",
      width: 200,
      render: (_: unknown, item: AdminOrder) => {
        const deliveryStatus = getDeliveryStatus(item);
        const deliveryBoy = getDeliveryBoyName(item);
        const deliveryPhone = getDeliveryBoyPhone(item);
        const tracking =
          item.trackingNumber ||
          item.deliveryDetails?.trackingNumber ||
          item.delivery?.trackingNumber;
        const assignedTime =
          item.assignedAt ||
          item.deliveryDetails?.assignedAt ||
          item.delivery?.assignedAt;

        return (
          <div className="min-w-[160px] space-y-1 text-left text-[12px]">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusColor(deliveryStatus)}`}
            >
              {deliveryStatus}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Bike size={13} className="text-purple-600 shrink-0" />
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
            {assignedTime && (
              <p className="text-[10px] text-slate-400">
                Assigned: {formatDateTime(assignedTime)}
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
      // width: 220,
      render: (_: unknown, item: AdminOrder) => {
        const addressText = getFormattedAddress(item);
        const hasCoords = item.latitude || item.longitude;

        return (
          <div className="w-[180px] space-y-0.5 text-left text-[12px] leading-4">
            <p className="line-clamp-8 text-slate-600" title={addressText}>
              {addressText}
            </p>
            {/* {hasCoords && (
              <p className="truncate text-[10px] text-slate-400">
                Lat: {item.latitude || "—"} · Long: {item.longitude || "—"}
              </p>
            )} */}
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
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_: unknown, item: AdminOrder) => {
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={(event) => {
                event.stopPropagation();
                openDeliveryAction(item);
              }}
              title="Reassign delivery person"
              aria-label="Reassign delivery"
              className="inline-flex items-center gap-1 h-8 rounded-lg border border-purple-200 bg-purple-50 px-2.5 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reassign</span>
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleRowClick(item);
              }}
              title="View full order details"
              aria-label="View order details"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Eye size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Truck className="text-purple-600 shrink-0" size={24} />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Assigned Orders
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              {totalElements}
            </span>
          </div>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-tight">
            Manage customer orders currently assigned to delivery partners
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="md"
            onClick={() => loadOrders(currentPage)}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center shrink-0`}
            >
              {stat.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">
                {stat.label}
              </span>
              <span className="text-base font-bold text-slate-800 tracking-tight truncate">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="w-full sm:max-w-md relative group">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500"
          />
          <input
            type="text"
            placeholder="Search by order ID, customer, delivery boy, tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm shadow-slate-100/50"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-40">
            <Select
              options={[
                { label: "All Payments", value: "ALL" },
                { label: "Success", value: "SUCCESS" },
                { label: "Pending", value: "PENDING" },
                { label: "Failed", value: "FAILED" },
              ]}
              value={paymentStatusFilter}
              onChange={(val) => setPaymentStatusFilter(val as string)}
              placeholder="Payment status"
            />
          </div>

          <div className="w-36">
            <Select
              options={[
                { label: "All Modes", value: "ALL" },
                { label: "Wallet", value: "WALLET" },
                { label: "Cashfree", value: "CASHFREE" },
                { label: "COD", value: "COD" },
              ]}
              value={paymentModeFilter}
              onChange={(val) => setPaymentModeFilter(val as string)}
              placeholder="Payment mode"
            />
          </div>

          {(searchTerm || paymentStatusFilter !== "ALL" || paymentModeFilter !== "ALL") && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSearchTerm("");
                setPaymentStatusFilter("ALL");
                setPaymentModeFilter("ALL");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey={(record) => record.orderId || record.id || record.orderNumber}
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
          locale={{ emptyText: "No assigned orders found" }}
          className="orders-antd-table"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: "cursor-pointer hover:bg-slate-50 transition-colors",
          })}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          size={pageSize}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Assigned Order Details — ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Top Row: Left: Customer Details, Right: Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Customer Information */}
              <div className="space-y-2 flex flex-col h-full">
                <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5">
                  <User size={15} className="text-emerald-600" />
                  Customer Information
                </h3>

                <div className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2.5 shadow-sm h-full flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                        <User size={15} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] text-slate-500 font-medium">
                          Full Name
                        </span>
                        <span className="text-[14px] font-bold text-slate-800 truncate">
                          {selectedOrder.userName || selectedOrder.userDetails?.userName || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                        <Phone size={15} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] text-slate-500 font-medium">
                          Phone Number
                        </span>
                        <span className="text-[14px] font-bold text-slate-800">
                          {selectedOrder.phoneNumber || selectedOrder.userDetails?.phoneNumber || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                        <Mail size={15} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] text-slate-500 font-medium">
                          Email Address
                        </span>
                        <span className="text-[14px] font-bold text-slate-800 break-all">
                          {selectedOrder.userEmail || selectedOrder.userDetails?.userEmail || "N/A"}
                        </span>
                      </div>
                    </div>
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
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border mt-1 ${getStatusColor(getDeliveryStatus(selectedOrder))}`}
                    >
                      {getDeliveryStatus(selectedOrder)}
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

            {/* Modal Actions Footer */}
            <div className="flex justify-end pt-3 gap-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsAssignModalOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Reassign Delivery</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign / Reassign Modal */}
      <AssignDeliveryModal
        order={selectedOrder}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadOrders(currentPage);
        }}
      />
    </div>
  );
};

export default AssignedOrders;
