import React, { useState, useEffect, useMemo } from "react";
import Pagination from "../components/ui/Pagination";
import { Table } from "antd";
import {
  ShoppingBag,
  Search,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Box,
  Banknote,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  X,
  RotateCcw,
  Bike,
  Eye,
  MapPin,
  Truck,
} from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import {
  fetchTodayOrders,
  fetchDayScoreCard,
  AdminOrder,
  DayScoreCard,
  exportOrdersPDF,
} from "../services/adminService";
import AssignDeliveryModal from "../components/AssignDeliveryModal";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 10;
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [exportFilters, setExportFilters] = useState({
    search: "",
    paymentStatus: "",
    orderStatus: "",
    fromDate: "",
    toDate: "",
  });
  const [scoreCard, setScoreCard] = useState<DayScoreCard | null>(null);
  const [scoreCardLoading, setScoreCardLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage]);

  useEffect(() => {
    loadScoreCard();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadScoreCard = async () => {
    setScoreCardLoading(true);
    try {
      const data = await fetchDayScoreCard(selectedDate);
      setScoreCard(data);
    } catch (error) {
      console.error("Failed to fetch day score card:", error);
      setScoreCard(null);
    } finally {
      setScoreCardLoading(false);
    }
  };

  const loadOrders = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const data = await fetchTodayOrders(page, pageSize);
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch today's orders:", error);
      setOrders([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

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

  const scoreCardStats = useMemo(
    () => [
      {
        label: "Total Orders",
        value: `${scoreCard?.totalOrders ?? 0}`,
        icon: <ShoppingBag size={20} />,
        color: "bg-blue-50 text-blue-600",
      },
      {
        label: "Total Revenue",
        value: formatCurrency(scoreCard?.totalRevenue ?? 0),
        icon: <Banknote size={20} />,
        color: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Avg Order Value",
        value: formatCurrency(scoreCard?.averageOrderValue ?? 0),
        icon: <CreditCard size={20} />,
        color: "bg-violet-50 text-violet-600",
      },
      {
        label: "Success Orders",
        value: `${scoreCard?.successOrders ?? 0}`,
        icon: <CheckCircle size={20} />,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Pending Orders",
        value: `${scoreCard?.pendingOrders ?? 0}`,
        icon: <Clock size={20} />,
        color: "bg-amber-50 text-amber-600",
      },
      {
        label: "Failed Orders",
        value: `${scoreCard?.failedOrders ?? 0}`,
        icon: <XCircle size={20} />,
        color: "bg-rose-50 text-rose-600",
      },
    ],
    [scoreCard],
  );

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
    "UNASSIGNED";

  const getFormattedAddress = (order: AdminOrder) => {
    const parts = [
      order.flatNo || order.deliveryDetails?.flatNo,
      order.address || order.deliveryDetails?.address,
      order.landMark || order.deliveryDetails?.landMark,
      order.state || order.deliveryDetails?.state,
      order.pinCode || order.deliveryDetails?.pinCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Address not provided";
  };

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !q ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
        (String(order.orderId) && String(order.orderId).includes(q)) ||
        (order.userName && order.userName.toLowerCase().includes(q)) ||
        (order.phoneNumber && order.phoneNumber.includes(q)) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(q)) ||
        (getDeliveryBoyName(order).toLowerCase().includes(q)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [orders, searchTerm]);

  const openDeliveryAction = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  const columns = [
    {
      title: "Order Info",
      dataIndex: "orderNumber",
      width: 100,
      key: "orderNumber",
      render: (_: string, item: AdminOrder) => (
        <div className="min-w-[140px] space-y-1 text-left text-[12px]">
          <p>
            <b>Order:</b> {item.orderNumber}
          </p>
          <p>
            <b>Order ID:</b> #{item.orderId}
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
        </div>
      ),
    },
    {
      title: "Delivery Address",
      dataIndex: "address",
      key: "address",
      width: 240,
      render: (_: unknown, item: AdminOrder) => {
        const addressText = getFormattedAddress(item);

        return (
          <div className="w-[240px] space-y-0.5 text-left text-[12px] leading-4">
            <p className="line-clamp-8 text-slate-600" title={addressText}>
              {addressText}
            </p>
          </div>
        );
      },
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (_: unknown, item: AdminOrder) => (
        <div className="min-w-[250px] space-y-2 text-left">
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
      width: 120,
      render: (_: unknown, item: AdminOrder) => {
        const assigned = !!getDeliveryId(item);
        const canReassign =
          assigned && getDeliveryStatus(item).toUpperCase() === "ASSIGNED";

        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              disabled={assigned}
              onClick={(event) => {
                event.stopPropagation();
                openDeliveryAction(item);
              }}
              title={assigned ? "Delivery already assigned" : "Assign delivery partner"}
              aria-label="Assign delivery"
              className="h-8 min-w-8 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              Assign
            </button>
            {canReassign && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  openDeliveryAction(item);
                }}
                title="Reassign delivery partner"
                aria-label="Reassign delivery"
                className="h-8 min-w-8 rounded-lg border border-amber-200 bg-amber-50 px-2 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <RotateCcw size={12} className="inline mr-1" />
                Re
              </button>
            )}
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleRowClick(item);
              }}
              title="View full order details"
              aria-label="View order details"
              className="h-8 min-w-8 rounded-lg bg-slate-200 px-2.5 text-slate-700 text-[11px] hover:bg-slate-300 transition-colors flex items-center justify-center"
            >
              View
            </button>
          </div>
        );
      },
    },
  ];

  const handleRowClick = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleExportOrders = async () => {
    try {
      const filters = {
        search: exportFilters.search || undefined,
        paymentStatus: exportFilters.paymentStatus || undefined,
        orderStatus: exportFilters.orderStatus || undefined,
        fromDate: exportFilters.fromDate || undefined,
        toDate: exportFilters.toDate || undefined,
      };
      const blob = await exportOrdersPDF(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Orders_Report.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsFilterModalOpen(false);
    } catch (error) {
      console.error("Failed to export orders:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-emerald-600 shrink-0" size={22} />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Orders Management
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {totalElements} Today
            </span>
          </div>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-tight">
            Manage and track today&apos;s customer orders here
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 cursor-pointer hover:border-emerald-200 transition-all flex-1 sm:flex-none min-w-0">
            <CalendarDays size={16} className="text-emerald-600 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none outline-none bg-transparent text-slate-700 font-semibold cursor-pointer w-full min-w-0"
            />
          </label>
          <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                loadOrders(currentPage);
                loadScoreCard();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {scoreCardLoading ? (
          <div className="col-span-full p-4 text-center text-[13px] text-slate-400 font-medium">
            Loading day score card...
          </div>
        ) : (
          scoreCardStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center shrink-0`}
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
          ))
        )}
      </div>

      <div className="w-full sm:max-w-md relative group">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"
        />

        <input
          type="text"
          placeholder="Search by order ID, name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-10 py-2 sm:py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm shadow-slate-100/50"
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey={(record) => record.orderId || record.id || record.orderNumber}
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
          locale={{ emptyText: "No orders found for today" }}
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
        title={`Order Details - ${selectedOrder?.orderNumber}`}
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

            {/* Delivery Assignment & Details Card if assigned */}
            {getDeliveryId(selectedOrder) && (
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

                  {(selectedOrder.delivery?.otp || selectedOrder.assignedAt || selectedOrder.delivery?.expectedDeliveryTime || selectedOrder.deliveryDetails?.expectedDeliveryTime || selectedOrder.deliveryDistanceKm != null) && (
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
                  )}
                </div>
              </div>
            )}

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
              {!getDeliveryId(selectedOrder) && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAssignModalOpen(true)}
                >
                  Assign Delivery
                </Button>
              )}
              {getDeliveryId(selectedOrder) &&
                getDeliveryStatus(selectedOrder).toUpperCase() ===
                  "ASSIGNED" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Reassign Delivery
                  </Button>
                )}
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

      <AssignDeliveryModal
        order={selectedOrder}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadOrders(currentPage);
        }}
      />

      {/* Export Filters Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Export Orders - Apply Filters"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Search"
            placeholder="Search by order ID, name or phone..."
            value={exportFilters.search}
            onChange={(e) =>
              setExportFilters({ ...exportFilters, search: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Payment Status"
              options={[
                { label: "All", value: "" },
                { label: "Success", value: "SUCCESS" },
                { label: "Pending", value: "PENDING" },
                { label: "Failed", value: "FAILED" },
              ]}
              value={exportFilters.paymentStatus}
              onChange={(val) =>
                setExportFilters({
                  ...exportFilters,
                  paymentStatus: val as string,
                })
              }
              placeholder="Select status..."
            />

            <Select
              label="Order Status"
              options={[
                { label: "All", value: "" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "Processing", value: "PROCESSING" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Cancelled", value: "CANCELLED" },
              ]}
              value={exportFilters.orderStatus}
              onChange={(val) =>
                setExportFilters({
                  ...exportFilters,
                  orderStatus: val as string,
                })
              }
              placeholder="Select status..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="From Date"
              type="date"
              value={exportFilters.fromDate}
              onChange={(e) =>
                setExportFilters({
                  ...exportFilters,
                  fromDate: e.target.value,
                })
              }
            />

            <Input
              label="To Date"
              type="date"
              value={exportFilters.toDate}
              onChange={(e) =>
                setExportFilters({ ...exportFilters, toDate: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsFilterModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() =>
                setExportFilters({
                  search: "",
                  paymentStatus: "",
                  orderStatus: "",
                  fromDate: "",
                  toDate: "",
                })
              }
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExportOrders}
              className="w-full sm:w-auto"
            >
              Export PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
