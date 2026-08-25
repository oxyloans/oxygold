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
} from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import {
  fetchActiveOrders,
  fetchDayScoreCard,
  AdminOrder,
  DayScoreCard,
  exportOrdersPDF,
} from "../services/adminService";
import AssignDeliveryModal from "../components/AssignDeliveryModal";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exportFilters, setExportFilters] = useState({
    search: "",
    paymentStatus: "",
    orderStatus: "",
    fromDate: "",
    toDate: "",
  });
  const [scoreCard, setScoreCard] = useState<DayScoreCard | null>(null);
  const [scoreCardLoading, setScoreCardLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
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
      const data = await fetchActiveOrders(page, pageSize);
      setOrders(data.content || []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (
      s.includes("success") ||
      s.includes("confirmed") ||
      s.includes("completed")
    )
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s.includes("pending") || s.includes("processing"))
      return "bg-amber-50 text-amber-600 border-amber-100";
    if (s.includes("fail") || s.includes("cancel"))
      return "bg-rose-50 text-rose-600 border-rose-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
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

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm),
  );

  const openDeliveryAction = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  const getDeliveryId = (order: AdminOrder) =>
    order.deliveryId || order.delivery?.deliveryId || order.delivery?.id;

  const getDeliveryStatus = (order: AdminOrder) =>
    order.deliveryStatus || order.delivery?.status || "UNASSIGNED";

  const columns = [
    // {
    //   title: "S No.",
    //   key: "serial",
    //   width: 65,
    //   render: (_: unknown, item: AdminOrder) => (
    //     <span className="font-bold tabular-nums">
    //       {currentPage * pageSize + filteredOrders.indexOf(item) + 1}
    //     </span>
    //   ),
    // },
    {
      title: "Order Info",
      dataIndex: "orderNumber",
      key: "orderNumber",
     
      render: (_: string, item: AdminOrder) => (
        <div className="min-w-[180px] space-y-1 text-left text-[11px]">
          <p>
            <b>Order:</b> {item.orderNumber}
          </p>
          <p>
            <b>Order ID:</b> #{item.orderId}
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
      title: "Details",
      dataIndex: "userName",
      key: "userName",
      
      render: (_: string, item: AdminOrder) => (
        <div className="min-w-[180px] space-y-1 text-left text-[11px]">
          <p className="font-bold text-slate-700">
            {item.userName || "Anonymous"}
          </p>
          <p>{item.phoneNumber || "—"}</p>
          <p className="break-all text-slate-400">
            {item.userEmail || "No email"}
          </p>
          <p>
            <b>Ordered:</b> {item.createdAt ? formatDate(item.createdAt) : "—"}
          </p>
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${getStatusColor(item.orderStatus)}`}
          >
            {item.orderStatus}
          </span>
        </div>
      ),
    },
    {
      title: "Delivery",
      dataIndex: "deliveryStatus",
      key: "deliveryStatus",
      width: 180,
      render: (_: unknown, item: AdminOrder) => {
        const deliveryId = getDeliveryId(item);
        const deliveryStatus = getDeliveryStatus(item);
        const deliveryBoy = item.deliveryBoyName || item.delivery?.deliveryBoy
          ? item.deliveryBoyName || `${item.delivery?.deliveryBoy?.firstName || ""} ${item.delivery?.deliveryBoy?.lastName || ""}`.trim()
          : "Not assigned";
        const deliveryPhone = item.deliveryBoyPhone || item.delivery?.deliveryBoy?.phone;

        return (
          <div className="min-w-[160px] space-y-1 text-left text-[11px]">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${getStatusColor(deliveryStatus)}`}>
              {deliveryStatus}
            </span>
            <p className="font-bold text-slate-700">{deliveryBoy}</p>
            {deliveryPhone && <p className="text-slate-500">{deliveryPhone}</p>}
            {deliveryId && <p className="text-[9px] text-slate-400">Tracking: {item.trackingNumber || item.delivery?.trackingNumber || "—"}</p>}
          </div>
        );
      },
    },
    {
      title: "Delivery Address",
      dataIndex: "address",
      key: "address",
      width: 180,
      render: (_: unknown, item: AdminOrder) => (
        <div className="w-[220px] space-y-0.5 text-left text-[11px] leading-4">
          <p
            className="line-clamp-2 text-slate-600"
            title={[item.flatNo, item.address, item.landMark, item.state, item.pinCode].filter(Boolean).join(", ") || "Address unavailable"}
          >
            {[
              item.flatNo,
              item.address,
              item.landMark,
              item.state,
              item.pinCode,
            ]
              .filter(Boolean)
              .join(", ") || "Address unavailable"}
          </p>
          <p className="truncate text-[9px] text-slate-400">
            Lat: {item.latitude || "—"} · Long: {item.longitude || "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
     
      render: (_: unknown, item: AdminOrder) => (
        <div className="min-w-[270px] space-y-2 text-left">
          {item.items.map((product) => (
            <div
              key={product.orderItemId || product.productId}
              className="rounded-lg bg-slate-50 p-2 text-[10px]"
            >
              <p className="font-bold text-slate-700">
                {product.productName || `Product #${product.productId}`}
              </p>
              <p className="mt-0.5 text-slate-500">
                {product.variant || "Standard variant"}
              </p>
              <p className="mt-1">
                Qty: {product.quantity} · {formatCurrency(product.price)} ·{" "}
                <b>{formatCurrency(product.subtotal)}</b>
              </p>
              <p className="text-slate-400">
                Item #{product.orderItemId || "—"} · Product #
                {product.productId}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 105,
      fixed: "right" as const,
      render: (_: unknown, item: AdminOrder) => {
        const assigned = !!getDeliveryId(item);
        const canReassign = assigned && getDeliveryStatus(item).toUpperCase() === "ASSIGNED";
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              disabled={assigned}
              onClick={(event) => {
                event.stopPropagation();
                openDeliveryAction(item);
              }}
              title="Assign delivery"
              aria-label="Assign delivery"
              className="h-8 min-w-8 rounded-lg bg-emerald-600 px-2 text-[10px] font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              A
            </button>
            <button
              disabled={!canReassign}
              onClick={(event) => {
                event.stopPropagation();
                openDeliveryAction(item);
              }}
              title={canReassign ? "Reassign delivery" : "Reassignment is available while delivery is assigned"}
              aria-label="Reassign delivery"
              className="h-8 min-w-8 rounded-lg border border-amber-200 bg-amber-50 px-2 text-[10px] font-bold text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Re
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
          </div>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-tight">
            Manage and track customer active orders here
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
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Export
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
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
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
          rowKey="orderId"
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
          locale={{ emptyText: "No active orders found" }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: "cursor-pointer",
          })}
          className="orders-antd-table"
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
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <ShoppingBag size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Order Status
                  </span>
                </div>
                <span
                  className={`text-[12px] font-bold uppercase ${getStatusColor(selectedOrder.orderStatus).split(" ")[1]}`}
                >
                  {selectedOrder.orderStatus}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <CreditCard size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Payment Status
                  </span>
                </div>
                <span
                  className={`text-[12px] font-bold uppercase ${getStatusColor(selectedOrder.paymentStatus).split(" ")[1]}`}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Payment Expiry
                  </span>
                </div>
                <span className="text-[12px] font-bold text-slate-700">
                  {formatDate(selectedOrder.paymentExpiry)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Box size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Payment Mode
                  </span>
                </div>
                <span className="text-[12px] font-bold text-slate-700 uppercase">
                  {selectedOrder.paymentMode}
                </span>
              </div>
            </div>

            {/* Customer & Transaction Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <div className="space-y-4 flex flex-col h-full">
                <h3 className="text-[13px] font-bold text-slate-800">
                  Customer Information
                </h3>

                <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3 shadow-sm h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Full Name
                      </span>
                      <span className="text-[13px] font-bold text-slate-700">
                        {selectedOrder.userName || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                      <Phone size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Phone Number
                      </span>
                      <span className="text-[13px] font-bold text-slate-700">
                        {selectedOrder.phoneNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                      <Mail size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Email Address
                      </span>
                      <span className="text-[13px] font-bold text-slate-700">
                        {selectedOrder.userEmail || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col h-full">
                <h3 className="text-[13px] font-bold text-slate-800">
                  Transaction Details
                </h3>
                <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3 shadow-sm h-full">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[12px] text-slate-500">
                      Transaction ID
                    </span>
                    <span className="text-[12px] font-bold text-slate-700 tabular-nums">
                      {selectedOrder.txnId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[12px] text-slate-500">
                      Payment Session ID
                    </span>
                    <span className="text-[12px] font-bold text-slate-700 truncate max-w-[150px]">
                      {selectedOrder.paymentSessionId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[12px] text-slate-500">
                      Total Items
                    </span>
                    <span className="text-[12px] font-bold text-slate-700">
                      {selectedOrder.totalItems}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[13px] font-bold text-slate-800">
                      Total Amount
                    </span>
                    <span className="text-[15px] font-bold text-emerald-600 tabular-nums">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Assignment */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-bold text-slate-800">Delivery Assignment</h3>
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Status</p>
                  <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusColor(getDeliveryStatus(selectedOrder))}`}>
                    {getDeliveryStatus(selectedOrder)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Partner</p>
                  <p className="mt-1 text-[12px] font-bold text-slate-700">
                    {selectedOrder.deliveryBoyName || `${selectedOrder.delivery?.deliveryBoy?.firstName || ""} ${selectedOrder.delivery?.deliveryBoy?.lastName || ""}`.trim() || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Partner Phone</p>
                  <p className="mt-1 text-[12px] font-bold text-slate-700">{selectedOrder.deliveryBoyPhone || selectedOrder.delivery?.deliveryBoy?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tracking Number</p>
                  <p className="mt-1 break-all text-[12px] font-bold text-slate-700">{selectedOrder.trackingNumber || selectedOrder.delivery?.trackingNumber || "—"}</p>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                {/* <Box size={16} className="text-emerald-600" /> */}
                Order Items
              </h3>
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-center text-[12px]">
                  <thead className="bg-[#FBF7EC] text-[#8B6914] font-bold uppercase tracking-wider tabular-nums">
                    <tr>
                      <th className="px-4 py-3 text-center">Product ID</th>
                      <th className="px-4 py-3 text-center">Price</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-center">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedOrder.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-slate-700 text-center">
                          #{item.productId}
                        </td>
                        <td className="px-4 py-3 text-slate-600 tabular-nums text-center">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-slate-600 tabular-nums text-center">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3  font-bold text-slate-700 text-center tabular-nums">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/50 font-bold">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-3 text-center text-slate-500"
                      >
                        Total
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-600 text-[14px] tabular-nums">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              {!getDeliveryId(selectedOrder) && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="mr-2"
                >
                  Assign Delivery
                </Button>
              )}
              {getDeliveryId(selectedOrder) && getDeliveryStatus(selectedOrder).toUpperCase() === "ASSIGNED" && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="mr-2"
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
