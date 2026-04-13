import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import { rejectOrder, PartnerOrder, RejectOrderPayload } from '../services/partnerService';
import LoadingSpinner from './ui/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

interface RejectOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: PartnerOrder | null;
    onSuccess: () => void;
}

const RejectOrderModal: React.FC<RejectOrderModalProps> = ({ isOpen, onClose, order, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReject = async () => {
        if (!order || !reason.trim()) return;

        setIsRejecting(true);
        setError(null);

        try {
            const payload: RejectOrderPayload = {
                deliveryId: order.orderId, // Using orderId as deliveryId as per requirement
                reason: reason.trim()
            };

            await rejectOrder(payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to reject order:", err);
            setError(err.message || "Failed to reject order. Please try again.");
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reject Order Assignment"
            size="sm"
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isRejecting}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleReject}
                        disabled={!reason.trim() || isRejecting}
                        className="min-w-[100px]"
                    >
                        {isRejecting ? <LoadingSpinner size="sm" /> : 'Reject Assignment'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {order && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                        <p className="text-[13px] font-bold text-rose-800">
                            Rejecting Assignment: <span className="text-rose-600">#{order.orderNumber}</span>
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-rose-100 border border-rose-200 rounded-lg text-rose-600 text-[12px] font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Rejection Reason</h4>
                        <span className="text-[10px] font-bold text-rose-500 uppercase">Required</span>
                    </div>
                    <Textarea
                        placeholder="Please enter the reason for rejection..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-[13px] min-h-[120px] focus:ring-rose-500 focus:border-rose-500"
                    />
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-700">
                    <AlertTriangle size={16} className="shrink-0" />
                    <p className="text-[11px] font-medium leading-relaxed">
                        By rejecting this assignment, the order status will be updated and you can re-assign it to another delivery boy.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default RejectOrderModal;
