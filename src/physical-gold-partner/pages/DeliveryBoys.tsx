import React, { useState, useEffect } from "react";
import { User, Search, Edit2, ShoppingBag, AlertTriangle } from "lucide-react";
import Table from "../components/ui/Table";
import Switch from "../components/ui/Switch";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Modal from "../components/ui/Modal";
import {
  fetchDeliveryBoys,
  updateDeliveryBoyStatus,
} from "../services/partnerService";

interface DeliveryBoy {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  alternateMobileNumber: string | null;
}

const DeliveryBoys: React.FC = () => {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [boyToDeactivate, setBoyToDeactivate] = useState<DeliveryBoy | null>(
    null,
  );

  useEffect(() => {
    loadDeliveryBoys();
  }, []);

  const loadDeliveryBoys = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDeliveryBoys();
      setDeliveryBoys(data.data || []);
    } catch (error) {
      console.error("Failed to fetch delivery boys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (boy: DeliveryBoy) => {
    if (boy.status === "ACTIVE") {
      setBoyToDeactivate(boy);
      setIsDeactivateModalOpen(true);
      return;
    }

    const id = boy.id;
    setUpdatingStatus(id);

    try {
      await updateDeliveryBoyStatus(id, "ACTIVE");

      setDeliveryBoys((prev) =>
        prev.map((db) => (db.id === id ? { ...db, status: "ACTIVE" } : db)),
      );
    } catch (error) {
      console.error("Failed to activate delivery boy:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const confirmDeactivation = async () => {
    if (!boyToDeactivate) return;

    const id = boyToDeactivate.id;
    setUpdatingStatus(id);
    setIsDeactivateModalOpen(false);

    try {
      await updateDeliveryBoyStatus(id, "INACTIVE");

      setDeliveryBoys((prev) =>
        prev.map((db) => (db.id === id ? { ...db, status: "INACTIVE" } : db)),
      );
    } catch (error) {
      console.error("Failed to deactivate delivery boy:", error);
    } finally {
      setUpdatingStatus(null);
      setBoyToDeactivate(null);
    }
  };

  const filteredBoys = deliveryBoys.filter(
    (boy) =>
      `${boy.firstName} ${boy.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      boy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boy.phone.includes(searchTerm),
  );

  const columns = [
    {
      header: "Name",
      key: "firstName",
      render: (_: any, item: DeliveryBoy) => (
        <span className="font-bold text-slate-700">
          {item.firstName} {item.lastName}
        </span>
      ),
    },
    {
      header: "Email",
      key: "email",
      render: (val: string) => <span className="text-slate-500">{val}</span>,
    },
    {
      header: "Phone",
      key: "phone",
      render: (val: string) => (
        <span className="font-medium text-slate-600 tabular-nums">{val}</span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (val: string, item: DeliveryBoy) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={val === "ACTIVE"}
            onChange={() => handleStatusToggle(item)}
            disabled={updatingStatus === item.id}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              val === "ACTIVE" ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {val}
          </span>
          {updatingStatus === item.id && <LoadingSpinner size="sm" />}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "id",
      align: "right" as const,
      render: () => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="h-8 px-2 py-0">
            <Edit2 size={12} className="mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2 py-0">
            <ShoppingBag size={12} className="mr-1" /> View Orders
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <User className="text-emerald-600" size={22} />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Delivery Boys List
          </h1>
        </div>
        <p className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-tight">
          Manage and monitor your delivery personnel
        </p>
      </div>

      <div className="max-w-md relative group">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500"
        />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm shadow-slate-100/50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table
          columns={columns}
          data={filteredBoys}
          isLoading={isLoading}
          emptyMessage="No delivery boys found"
        />
      </div>

      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
          setBoyToDeactivate(null);
        }}
        title="Confirm Deactivation"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-700">
            <AlertTriangle size={20} className="shrink-0" />
            <p className="text-sm font-medium">
              Are you sure you want to deactivate{" "}
              <b>
                {boyToDeactivate?.firstName} {boyToDeactivate?.lastName}
              </b>
              ?
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Deactivating a delivery boy will prevent them from accepting new
            orders until they are reactivated.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeactivateModalOpen(false);
                setBoyToDeactivate(null);
              }}
            >
              Cancel
            </Button>

            <Button variant="danger" onClick={confirmDeactivation}>
              Deactivate Boy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeliveryBoys;
