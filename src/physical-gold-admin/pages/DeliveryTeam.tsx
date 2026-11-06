import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Mail, Phone, RefreshCw, Plus, Pencil, PackageSearch } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Toast, { ToastType } from '../../PhysicalGold/components/Toast';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Toast, { ToastType } from '../../PhysicalGold/components/Toast';
import {
    DeliveryBoy,
    DeliveryBoyPayload,
    DeliveryBoyStatus,
    createAdminDeliveryBoy,
    fetchAdminDeliveryBoys,
    updateAdminDeliveryBoy,
    updateAdminDeliveryBoy,
    updateAdminDeliveryBoyStatus,
} from '../services/adminService';

const initialFormData: DeliveryBoyPayload = {
    firstName: '',
    lastName: '',
    phone: '',
    alternateMobileNumber: '',
    email: '',
    vehicleNumber: '',
    vehicleType: '',
};

const initialFormData: DeliveryBoyPayload = {
    firstName: '',
    lastName: '',
    phone: '',
    alternateMobileNumber: '',
    email: '',
    vehicleNumber: '',
    vehicleType: '',
};

const DeliveryTeam: React.FC = () => {
    const navigate = useNavigate();
    const [boys, setBoys] = useState<DeliveryBoy[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Filter tab: 'ALL' | 'ACTIVE' | 'INACTIVE'
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    // Modal & Form State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingBoy, setEditingBoy] = useState<DeliveryBoy | null>(null);
    const [formData, setFormData] = useState<DeliveryBoyPayload>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadBoys = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminDeliveryBoys();
            setBoys(data);
            const data = await fetchAdminDeliveryBoys();
            setBoys(data);
        } catch (error: any) {
            setToast({ type: 'error', message: error.message || 'Unable to load the delivery team.' });
            setToast({ type: 'error', message: error.message || 'Unable to load the delivery team.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBoys(); }, []);

    // Change Status (PATCH /delivery/{id}/status)
    const handleStatusChange = async (boy: DeliveryBoy, nextStatus: DeliveryBoyStatus) => {
        if (boy.status === nextStatus) return;
    // Change Status (PATCH /delivery/{id}/status)
    const handleStatusChange = async (boy: DeliveryBoy, nextStatus: DeliveryBoyStatus) => {
        if (boy.status === nextStatus) return;
        setUpdatingId(boy.id);
        try {
            const res = await updateAdminDeliveryBoyStatus(boy.id, nextStatus);
            setBoys(current => current.map(item => item.id === boy.id ? { ...item, ...(res || {}), status: nextStatus } : item));
            
            const description = nextStatus === 'ACTIVE'
                ? 'available to take deliveries'
                : nextStatus === 'INACTIVE'
                ? 'off duty'
                : 'suspended';

            setToast({
                type: 'success',
                message: `${boy.firstName}'s status set to ${nextStatus} (${description}).`,
            });
            const res = await updateAdminDeliveryBoyStatus(boy.id, nextStatus);
            setBoys(current => current.map(item => item.id === boy.id ? { ...item, ...(res || {}), status: nextStatus } : item));
            
            const description = nextStatus === 'ACTIVE'
                ? 'available to take deliveries'
                : nextStatus === 'INACTIVE'
                ? 'off duty'
                : 'suspended';

            setToast({
                type: 'success',
                message: `${boy.firstName}'s status set to ${nextStatus} (${description}).`,
            });
        } catch (error: any) {
            setToast({ type: 'error', message: error.message || 'Status update failed.' });
            setToast({ type: 'error', message: error.message || 'Status update failed.' });
        } finally {
            setUpdatingId(null);
        }
    };

    // Open Modal for Create
    const openCreateModal = () => {
        setEditingBoy(null);
        setFormData(initialFormData);
        setFormErrors({});
        setIsFormModalOpen(true);
    };

    // Open Modal for Edit
    const openEditModal = (boy: DeliveryBoy) => {
        setEditingBoy(boy);
        setFormData({
            firstName: boy.firstName || '',
            lastName: boy.lastName || '',
            phone: boy.phone || '',
            alternateMobileNumber: boy.alternateMobileNumber || '',
            email: boy.email || '',
            vehicleNumber: boy.vehicleNumber || '',
            vehicleType: boy.vehicleType || '',
        });
        setFormErrors({});
        setIsFormModalOpen(true);
    };

    // Form Validation
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required.';
        } else if (!/^\d{10,15}$/.test(formData.phone.replace(/[\s+-]/g, ''))) {
            errors.phone = 'Enter a valid phone number (10-15 digits).';
        }
        if (formData.alternateMobileNumber && !/^\d{10,15}$/.test(formData.alternateMobileNumber.replace(/[\s+-]/g, ''))) {
            errors.alternateMobileNumber = 'Enter a valid alternate phone number (10-15 digits).';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form Submit (POST for Create / PUT for Update)
    const handleFormSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload: DeliveryBoyPayload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phone: formData.phone.trim(),
                alternateMobileNumber: formData.alternateMobileNumber?.trim() || undefined,
                email: formData.email.trim(),
                vehicleNumber: formData.vehicleNumber?.trim() || undefined,
                vehicleType: formData.vehicleType?.trim() || undefined,
            };

            if (editingBoy) {
                // PUT /delivery/{id}
                const updated = await updateAdminDeliveryBoy(editingBoy.id, payload);
                setBoys(current => current.map(b => b.id === editingBoy.id ? { ...b, ...updated } : b));
                setToast({ type: 'success', message: `Delivery personnel ${payload.firstName} ${payload.lastName} updated successfully.` });
            } else {
                // POST /delivery/insertDeliveryBoys
                const created = await createAdminDeliveryBoy(payload);
                setBoys(current => [created, ...current]);
                setToast({ type: 'success', message: `Delivery personnel ${payload.firstName} ${payload.lastName} added successfully.` });
            }
            setIsFormModalOpen(false);
            loadBoys();
        } catch (error: any) {
            setToast({ type: 'error', message: error.message || 'Operation failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter boys based on selected tab
    const filteredBoys = boys.filter(boy => {
        if (filterStatus === 'ALL') return true;
        return boy.status === filterStatus;
    });

    const activeCount = boys.filter(b => b.status === 'ACTIVE').length;
    const inactiveCount = boys.filter(b => b.status === 'INACTIVE').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                        <Bike className="text-emerald-600" size={22} />Delivery Management
                    </h1>
                    <p className="mt-1 text-xs text-slate-400">
                        Manage personnel, view assigned orders, configure availability &amp; status, and register new delivery boys.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadBoys}>
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </Button>
                    <Button
                        onClick={openCreateModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus size={15} /> Add Delivery Boy
                    </Button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit text-xs font-semibold text-slate-600">
                <button
                    type="button"
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                    }`}
                >
                    All ({boys.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterStatus('ACTIVE')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                        filterStatus === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-emerald-700'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active ({activeCount})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterStatus('INACTIVE')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                        filterStatus === 'INACTIVE' ? 'bg-white text-slate-800 shadow-xs' : 'hover:text-slate-800'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Inactive ({inactiveCount})
                </button>
            </div>

            {/* Delivery personnel list */}
            {/* Delivery personnel list */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-800">
                        Delivery personnel ({filteredBoys.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="rounded-xl bg-white p-12 text-center text-xs text-slate-400 shadow-sm border border-slate-100">
                        <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-emerald-600" />
                        Loading delivery team...
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredBoys.map(boy => {
                            const isSuspended = boy.status === 'SUSPENDED';
                            const isActive = boy.status === 'ACTIVE';
                            const displayUserId = boy.userId ?? boy.id;

                            return (
                                <article
                                    key={boy.id}
                                    className={`rounded-xl border bg-white p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between ${
                                        isSuspended ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100'
                                    }`}
                                >
                                    <div>
                                        {/* Card Header: Left = User ID, Right = View Orders Button */}
                                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                    User ID:
                                                </span>
                                                <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-xs font-extrabold text-[#8B6914] border border-amber-200/60">
                                                    #{displayUserId}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => navigate(`/admin/delivery/${boy.id}/orders`, { state: { boy } })}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
                                            >
                                                <PackageSearch size={14} /> View Orders
                                            </button>
                                        </div>

                                        {/* Details: Name, Email, Mobile Number, Status */}
                                        <div className="mt-3.5 space-y-2.5 text-xs">
                                            {/* Name */}
                                            <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-400 font-medium shrink-0">Name :</span>
                                                <span className="font-bold text-slate-800 text-right truncate">
                                                    {boy.firstName} {boy.lastName}
                                                </span>
                                            </div>

                                            {/* Email */}
                                            <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-400 font-medium shrink-0">Email :</span>
                                                <span className="font-semibold text-slate-700 truncate text-right break-all max-w-[210px]" title={boy.email}>
                                                    {boy.email || '—'}
                                                </span>
                                            </div>

                                            {/* Mobile Number */}
                                            <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-400 font-medium shrink-0">Mobile Number :</span>
                                                <div className="text-right">
                                                    <span className="font-semibold text-slate-700 font-mono">
                                                        {boy.phone || '—'}
                                                    </span>
                                                    {boy.alternateMobileNumber && (
                                                        <span className="block text-[10px] text-slate-400 font-mono">
                                                            Alt: {boy.alternateMobileNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-400 font-medium shrink-0">Status :</span>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        isActive
                                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                            : boy.status === 'INACTIVE'
                                                            ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                                                            : 'bg-rose-50 text-rose-700 ring-rose-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            isActive ? 'bg-emerald-500' : boy.status === 'INACTIVE' ? 'bg-slate-400' : 'bg-rose-500'
                                                        }`}
                                                    />
                                                    {boy.status}
                                                </span>
                                            </div>

                                            {/* Vehicle Details */}
                                            {boy.vehicleNumber && boy.vehicleNumber !== '—' && (
                                                <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2 text-slate-500">
                                                    <span className="text-slate-400 font-medium">{boy.vehicleType || 'Vehicle'} :</span>
                                                    <span className="font-semibold text-slate-700 font-mono">{boy.vehicleNumber}</span>
                                                </div>
                                            )}

                                            {/* Deliveries count and rating */}
                                            {(boy.totalDeliveries !== undefined || (boy.rating !== undefined && boy.rating > 0)) && (
                                                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1">
                                                    {boy.totalDeliveries !== undefined && <span>Deliveries: <strong className="text-slate-700">{boy.totalDeliveries}</strong></span>}
                                                    {boy.rating !== undefined && boy.rating > 0 && <span>Rating: ⭐ <strong className="text-slate-700">{boy.rating}</strong></span>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Action Bar: Left = Switch Active/Inactive, Right = Update Details */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                            {/* Left side: Switch Active/Inactive button */}
                                            <button
                                                type="button"
                                                disabled={updatingId === boy.id}
                                                onClick={() => handleStatusChange(boy, isActive ? 'INACTIVE' : 'ACTIVE')}
                                                className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer border ${
                                                    isActive
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                } disabled:opacity-50`}
                                                title={`Click to switch to ${isActive ? 'INACTIVE' : 'ACTIVE'}`}
                                            >
                                                <span
                                                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                                        isActive ? 'bg-emerald-600' : 'bg-slate-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                            isActive ? 'translate-x-3' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </span>
                                                <span>
                                                    {updatingId === boy.id ? (
                                                        'Updating...'
                                                    ) : isActive ? (
                                                        'Active'
                                                    ) : (
                                                        'Inactive'
                                                    )}
                                                </span>
                                            </button>

                                            {/* Right side: Update Details button */}
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(boy)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                                            >
                                                <Pencil size={13} className="text-slate-500" />
                                                Update Details
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                        {!filteredBoys.length && (
                            <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-400 bg-white">
                                <Bike size={32} className="mx-auto mb-2 text-slate-300" />
                                <p className="font-semibold text-slate-600">No {filterStatus === 'ALL' ? '' : filterStatus.toLowerCase()} delivery personnel found.</p>
                                <p className="mt-1 text-slate-400">Click &quot;Add Delivery Boy&quot; above to register a new delivery personnel.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Modal: Add / Edit Delivery Boy */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => !isSubmitting && setIsFormModalOpen(false)}
                title={editingBoy ? `Edit Delivery Personnel (${editingBoy.firstName} ${editingBoy.lastName})` : 'Add Delivery Boy'}
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsFormModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleFormSubmit}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                editingBoy ? 'Update Delivery Boy' : 'Add Delivery Boy'
                            )}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleFormSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="First Name *"
                            value={formData.firstName}
                            onChange={e => {
                                setFormData(prev => ({ ...prev, firstName: e.target.value }));
                                if (formErrors.firstName) setFormErrors(prev => ({ ...prev, firstName: '' }));
                            }}
                            error={formErrors.firstName}
                            placeholder="e.g. Ramesh"
                        />
                        <Input
                            label="Last Name *"
                            value={formData.lastName}
                            onChange={e => {
                                setFormData(prev => ({ ...prev, lastName: e.target.value }));
                                if (formErrors.lastName) setFormErrors(prev => ({ ...prev, lastName: '' }));
                            }}
                            error={formErrors.lastName}
                            placeholder="e.g. Kumar"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Phone Number *"
                            value={formData.phone}
                            onChange={e => {
                                setFormData(prev => ({ ...prev, phone: e.target.value }));
                                if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                            }}
                            error={formErrors.phone}
                            placeholder="e.g. 9876543210"
                            maxLength={15}
                        />
                        <Input
                            label="Alternate Mobile"
                            value={formData.alternateMobileNumber || ''}
                            onChange={e => {
                                setFormData(prev => ({ ...prev, alternateMobileNumber: e.target.value }));
                                if (formErrors.alternateMobileNumber) setFormErrors(prev => ({ ...prev, alternateMobileNumber: '' }));
                            }}
                            error={formErrors.alternateMobileNumber}
                            placeholder="e.g. 9123456780 (optional)"
                            maxLength={15}
                        />
                    </div>

                    <Input
                        label="Email Address *"
                        type="email"
                        value={formData.email}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, email: e.target.value }));
                            if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                        }}
                        error={formErrors.email}
                        placeholder="e.g. ramesh.kumar@example.com"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Vehicle Number"
                            value={formData.vehicleNumber || ''}
                            onChange={e => {
                                setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }));
                                if (formErrors.vehicleNumber) setFormErrors(prev => ({ ...prev, vehicleNumber: '' }));
                            }}
                            error={formErrors.vehicleNumber}
                            placeholder="e.g. TS09AB1234 (optional)"
                        />
                        <div className="mb-3 flex flex-col">
                            <label className="text-[11px] font-semibold mb-1 text-slate-500 uppercase tracking-tight">
                                Vehicle Type
                            </label>
                            <select
                                className="px-3 py-1.5 border rounded-md text-[13px] transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 border-slate-200 bg-white"
                                value={formData.vehicleType || ''}
                                onChange={e => {
                                    setFormData(prev => ({ ...prev, vehicleType: e.target.value }));
                                    if (formErrors.vehicleType) setFormErrors(prev => ({ ...prev, vehicleType: '' }));
                                }}
                            >
                                <option value="">Select vehicle type (optional)</option>
                                <option value="BIKE">Bike</option>
                                <option value="SCOOTER">Scooter</option>
                                <option value="VAN">Van</option>
                                <option value="CAR">Car</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Toast Alert Notification (Top-Right) */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default DeliveryTeam;
