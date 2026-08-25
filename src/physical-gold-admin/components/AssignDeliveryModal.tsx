import React, { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import {
    AdminOrder,
    DeliveryBoy,
    assignAdminDelivery,
    fetchAdminDeliveryBoys,
    reassignAdminDelivery,
} from '../services/adminService';

interface Props {
    order: AdminOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AssignDeliveryModal: React.FC<Props> = ({ order, isOpen, onClose, onSuccess }) => {
    const existingDeliveryId = order?.deliveryId || order?.delivery?.deliveryId || order?.delivery?.id;
    const [boys, setBoys] = useState<DeliveryBoy[]>([]);
    const [boyId, setBoyId] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setBoyId('');
        setNotes('');
        setLoading(true);
        fetchAdminDeliveryBoys()
            .then(data => setBoys(data.filter(item => item.status === 'ACTIVE')))
            .catch((err: any) => setError(err.message || 'Unable to load delivery personnel.'))
            .finally(() => setLoading(false));
    }, [isOpen, order]);

    const submit = async () => {
        if (!order || !boyId) {
            setError('Select a delivery person.');
            return;
        }
        const deliveryAddress = [order.flatNo, order.address, order.landMark, order.state, order.pinCode]
            .filter(Boolean).join(', ') || 'Address unavailable';
        const lat = order.latitude == null || order.latitude === '' ? 0 : Number(order.latitude);
        const lng = order.longitude == null || order.longitude === '' ? 0 : Number(order.longitude);
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setError('Latitude must be between -90 and 90; longitude between -180 and 180.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            if (existingDeliveryId) await reassignAdminDelivery({
                deliveryId: existingDeliveryId,
                newDeliveryBoyId: Number(boyId),
                reason: notes.trim() || 'Reassigned by admin',
            });
            else await assignAdminDelivery({
                orderId: order.orderId,
                orderNumber: order.orderNumber,
                deliveryBoyId: Number(boyId),
                userId: order.userId,
                customerName: order.userName || 'Customer',
                customerPhone: order.phoneNumber,
                deliveryAddress,
                customerLatitude: lat,
                customerLongitude: lng,
                notes: notes.trim(),
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Delivery assignment failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${existingDeliveryId ? 'Reassign' : 'Assign'} delivery — ${order?.orderNumber || ''}`} size="md"
            footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} isLoading={submitting} disabled={loading || !boys.length}>{existingDeliveryId ? 'Reassign delivery' : 'Assign delivery'}</Button></div>}>
            <div className="space-y-4">
                {error && <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</div>}
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Delivery person *</label>
                    <select value={boyId} onChange={e => setBoyId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500">
                        <option value="">{loading ? 'Loading…' : 'Select active delivery person'}</option>
                        {boys.map(boy => <option key={boy.id} value={boy.id}>{boy.firstName} {boy.lastName} — {boy.phone}</option>)}
                    </select>
                </div>
                {!existingDeliveryId && (
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-[11px] leading-5 text-emerald-700">
                        The customer delivery location will be taken automatically from the order.
                    </div>
                )}
                <Input label={existingDeliveryId ? 'Reassignment reason' : 'Assignment notes (optional)'} value={notes} onChange={e => setNotes(e.target.value)} placeholder={existingDeliveryId ? 'Reason for changing delivery person' : 'Optional instructions'} />
            </div>
        </Modal>
    );
};

export default AssignDeliveryModal;
