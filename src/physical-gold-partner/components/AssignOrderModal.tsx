import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { fetchDeliveryBoys, assignOrder, DeliveryBoy, PartnerOrder, AssignOrderPayload } from '../services/partnerService';
import LoadingSpinner from './ui/LoadingSpinner';
import { Phone, MapPin } from 'lucide-react';

interface AssignOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: PartnerOrder | null;
    onSuccess: () => void;
}

const AssignOrderModal: React.FC<AssignOrderModalProps> = ({ isOpen, onClose, order, onSuccess }) => {
    const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBoyId, setSelectedBoyId] = useState<number | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadDeliveryBoys();
        }
    }, [isOpen]);

    const loadDeliveryBoys = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchDeliveryBoys();
            // Filter only active delivery boys
            const activeBoys = (data.data || []).filter((db: DeliveryBoy) => db.status === 'ACTIVE');
            setDeliveryBoys(activeBoys);
        } catch (err) {
            console.error("Failed to fetch delivery boys:", err);
            setError("Failed to load delivery boys. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!order || !selectedBoyId) return;

        const selectedBoy = deliveryBoys.find(db => db.id === selectedBoyId);
        if (!selectedBoy) return;

        setIsAssigning(true);
        setError(null);

        try {
            const payload: AssignOrderPayload = {
                orderId: order.orderId,
                orderNumber: order.orderNumber,
                deliveryBoyId: selectedBoyId,
                userId: order.userId,
                customerName: order.userName || 'Customer',
                customerPhone: order.phoneNumber,
                deliveryAddress: "Hyderabad", // Using Hyderabad as default as the api requires it and address isn't present in order object.
                customerLatitude: 17.3850,
                customerLongitude: 78.4867,
                notes: `Order #${order.orderNumber} assigned to ${selectedBoy.firstName} ${selectedBoy.lastName}`
            };

            await assignOrder(payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to assign order:", err);
            setError(err.message || "Failed to assign order. Please try again.");
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Delivery Boy"
            size="md"
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isAssigning}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAssign}
                        disabled={!selectedBoyId || isAssigning}
                        className="min-w-[100px]"
                    >
                        {isAssigning ? <LoadingSpinner size="sm" /> : 'Assign'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {order && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <p className="text-[13px] font-bold text-emerald-800">
                            Assigning Order: <span className="text-emerald-600">#{order.orderNumber}</span>
                        </p>
                        <p className="text-[11px] text-emerald-600/70 font-medium mt-0.5">
                            Customer: {order.userName || 'N/A'} ({order.phoneNumber})
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[12px] font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Select Delivery Boy</h4>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <LoadingSpinner size="md" />
                            <span className="text-[12px] text-slate-400 font-medium">Loading active personnel...</span>
                        </div>
                    ) : deliveryBoys.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-[13px] border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30">
                            No active delivery boys available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            {deliveryBoys.map((boy) => (
                                <label
                                    key={boy.id}
                                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedBoyId === boy.id
                                        ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20 shadow-sm shadow-emerald-100'
                                        : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm shadow-slate-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="deliveryBoy"
                                        className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                                        checked={selectedBoyId === boy.id}
                                        onChange={() => setSelectedBoyId(boy.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[13px] font-bold ${selectedBoyId === boy.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                {boy.firstName} {boy.lastName}
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tight">Active</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Phone size={10} />
                                                <span className="text-[11px] font-medium tabular-nums">{boy.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <MapPin size={10} />
                                                <span className="text-[11px] font-medium">Available</span>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AssignOrderModal;
