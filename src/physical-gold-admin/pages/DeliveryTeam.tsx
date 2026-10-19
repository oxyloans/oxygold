import React, { useEffect, useState } from 'react';
import { Bike, CalendarDays, Mail, MapPin, PackageSearch, Phone, RefreshCw, Plus, Pencil, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Toast, { ToastType } from '../../PhysicalGold/components/Toast';
import {
    AdminDeliveryAssignment,
    DeliveryBoy,
    DeliveryBoyPayload,
    DeliveryBoyStatus,
    DeliveryBoyAvailabilityStatus,
    createAdminDeliveryBoy,
    fetchAdminAssignedDeliveries,
    fetchAdminDeliveryBoys,
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

const DeliveryTeam: React.FC = () => {
    const [boys, setBoys] = useState<DeliveryBoy[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [selectedBoy, setSelectedBoy] = useState<DeliveryBoy | null>(null);
    const [assignments, setAssignments] = useState<AdminDeliveryAssignment[]>([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);

    // Filter tab: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    const [filterStatus, setFilterStatus] = useState<'ALL' | DeliveryBoyStatus>('ALL');

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
        } catch (error: any) {
            setToast({ type: 'error', message: error.message || 'Unable to load the delivery team.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBoys(); }, []);

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
        } catch (error: any) {
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

    // View Pending Assignments
    const viewAssignments = async (boy: DeliveryBoy) => {
        setSelectedBoy(boy);
        setAssignments([]);
        setAssignmentsLoading(true);
        try {
            setAssignments(await fetchAdminAssignedDeliveries(boy.id));
        } catch (error: any) {
            setToast({ type: 'error', message: error.message || 'Assigned deliveries could not be loaded.' });
        } finally {
            setAssignmentsLoading(false);
        }
    };

    const formatDate = (value: string | null) => value
        ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    const assignmentStatusStyle = (status: string) => {
        const value = status.toUpperCase();
        if (value.includes('DELIVERED') || value.includes('COMPLETED')) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
        if (value.includes('OUT_FOR') || value.includes('PICKED')) return 'bg-blue-50 text-blue-700 ring-blue-200';
        return 'bg-amber-50 text-amber-700 ring-amber-200';
    };

    // Filter boys based on selected tab
    const filteredBoys = boys.filter(boy => {
        if (filterStatus === 'ALL') return true;
        return boy.status === filterStatus;
    });

    const activeCount = boys.filter(b => b.status === 'ACTIVE').length;
    const inactiveCount = boys.filter(b => b.status === 'INACTIVE').length;
    const suspendedCount = boys.filter(b => b.status === 'SUSPENDED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                        <Bike className="text-emerald-600" size={22} />Delivery Management
                    </h1>
                    <p className="mt-1 text-xs text-slate-400">
                        Manage personnel, insert new delivery boys, configure availability &amp; status, and track assignments.
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
                <button
                    type="button"
                    onClick={() => setFilterStatus('SUSPENDED')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                        filterStatus === 'SUSPENDED' ? 'bg-white text-rose-700 shadow-xs' : 'hover:text-rose-700'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Suspended ({suspendedCount})
                </button>
            </div>

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
                            return (
                                <article
                                    key={boy.id}
                                    className={`rounded-xl border bg-white p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between ${
                                        isSuspended ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                    {boy.firstName} {boy.lastName}
                                                </h3>
                                                
                                                {/* Status & Availability Badges */}
                                                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                                    {/* Status Badge (ACTIVE | INACTIVE | SUSPENDED) */}
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                            isActive
                                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                                : boy.status === 'INACTIVE'
                                                                ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                                                                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                isActive ? 'bg-emerald-500' : boy.status === 'INACTIVE' ? 'bg-slate-400' : 'bg-rose-500'
                                                            }`}
                                                        />
                                                        {boy.status}
                                                    </span>

                                                    {/* AvailabilityStatus Badge (AVAILABLE | BUSY | OFFLINE) */}
                                                    {boy.availabilityStatus && (
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                                boy.availabilityStatus === 'AVAILABLE'
                                                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                                    : boy.availabilityStatus === 'BUSY'
                                                                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                                                    : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${
                                                                    boy.availabilityStatus === 'AVAILABLE'
                                                                        ? 'bg-blue-500 animate-pulse'
                                                                        : boy.availabilityStatus === 'BUSY'
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-slate-400'
                                                                }`}
                                                            />
                                                            {boy.availabilityStatus === 'BUSY' ? 'BUSY (On delivery)' : boy.availabilityStatus}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Control & Edit */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(boy)}
                                                    title="Edit Delivery Personnel"
                                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                                >
                                                    <Pencil size={13} />
                                                </button>

                                                {/* Status Selector Dropdown (ACTIVE | INACTIVE | SUSPENDED) */}
                                                <select
                                                    disabled={updatingId === boy.id}
                                                    value={boy.status}
                                                    onChange={(e) => handleStatusChange(boy, e.target.value as DeliveryBoyStatus)}
                                                    title="Change Status"
                                                    className={`text-[10px] font-bold rounded-lg px-2 py-1.5 border transition cursor-pointer outline-none ${
                                                        isActive
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
                                                            : boy.status === 'INACTIVE'
                                                            ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/70'
                                                            : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/70'
                                                    } disabled:opacity-50`}
                                                >
                                                    <option value="ACTIVE">ACTIVE</option>
                                                    <option value="INACTIVE">INACTIVE</option>
                                                    <option value="SUSPENDED">SUSPENDED</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Contact & Vehicle Details */}
                                        <div className="mt-3.5 space-y-1.5 text-xs text-slate-500">
                                            <p className="flex items-center gap-2">
                                                <Phone size={12} className="text-slate-400 shrink-0" />
                                                <span>{boy.phone}</span>
                                            </p>
                                            {boy.alternateMobileNumber && (
                                                <p className="flex items-center gap-2 text-[11px] text-slate-400">
                                                    <Phone size={11} className="text-slate-300 shrink-0" />
                                                    <span>Alt: {boy.alternateMobileNumber}</span>
                                                </p>
                                            )}
                                            <p className="flex items-center gap-2 break-all">
                                                <Mail size={12} className="text-slate-400 shrink-0" />
                                                <span>{boy.email}</span>
                                            </p>
                                            {boy.vehicleNumber && boy.vehicleNumber !== '—' && (
                                                <p className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                                                    <Bike size={12} className="text-emerald-600 shrink-0" />
                                                    <span>{boy.vehicleType || 'Vehicle'}: <strong className="font-semibold text-slate-800">{boy.vehicleNumber}</strong></span>
                                                </p>
                                            )}
                                            {(boy.totalDeliveries !== undefined || (boy.rating !== undefined && boy.rating > 0)) && (
                                                <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-500 border-t border-slate-100">
                                                    {boy.totalDeliveries !== undefined && <span>Deliveries: <strong className="text-slate-700">{boy.totalDeliveries}</strong></span>}
                                                    {boy.rating !== undefined && boy.rating > 0 && <span>Rating: ⭐ <strong className="text-slate-700">{boy.rating}</strong></span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => viewAssignments(boy)}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                                    >
                                        <PackageSearch size={14} /> View pending assignments
                                    </button>
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

            {/* Assignments View Section */}
            {selectedBoy && (
                <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Pending delivery assignments</h2>
                                <p className="mt-0.5 text-[11px] text-slate-400">Review orders assigned to the selected delivery person</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedBoy(null)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-500 transition hover:bg-slate-50 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-800">{selectedBoy.firstName} {selectedBoy.lastName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">
                                    {assignments.length} pending {assignments.length === 1 ? 'order' : 'orders'}
                                </span>
                            </div>
                        </div>

                        {assignmentsLoading ? (
                            <div className="py-14 text-center">
                                <RefreshCw size={22} className="mx-auto animate-spin text-emerald-600" />
                                <p className="mt-3 text-xs text-slate-400">Loading pending assignments...</p>
                            </div>
                        ) : assignments.length ? (
                            <>
                                <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                                    <table className="w-full border-collapse border border-slate-200 text-left">
                                        <thead className="bg-[#FBF7EC]">
                                            <tr className="text-[10px] font-bold uppercase tracking-wider text-[#8B6914]">
                                                <th className="border border-slate-200 px-4 py-3">Order &amp; tracking</th>
                                                <th className="border border-slate-200 px-4 py-3">Customer</th>
                                                <th className="border border-slate-200 px-4 py-3">Delivery address</th>
                                                <th className="border border-slate-200 px-4 py-3">Assigned on</th>
                                                <th className="border border-slate-200 px-4 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignments.map(item => (
                                                <tr key={item.id} className="align-top hover:bg-slate-50/70">
                                                    <td className="border border-slate-200 px-4 py-3">
                                                        <p className="text-xs font-bold text-emerald-700">{item.orderNumber || '—'}</p>
                                                        <p className="mt-1 text-[10px] text-slate-400">{item.trackingNumber || 'No tracking number'}</p>
                                                    </td>
                                                    <td className="border border-slate-200 px-4 py-3">
                                                        <p className="text-xs font-bold text-slate-700">{item.customerName || '—'}</p>
                                                        <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                                                            <Phone size={10} />{item.customerPhone || '—'}
                                                        </p>
                                                    </td>
                                                    <td className="max-w-[280px] border border-slate-200 px-4 py-3">
                                                        <p className="flex gap-1.5 text-[11px] leading-5 text-slate-500">
                                                            <MapPin size={12} className="mt-1 shrink-0 text-emerald-600" />
                                                            {item.deliveryAddress || 'Address unavailable'}
                                                        </p>
                                                    </td>
                                                    <td className="whitespace-nowrap border border-slate-200 px-4 py-3 text-[11px] text-slate-500">
                                                        {formatDate(item.assignedAt)}
                                                    </td>
                                                    <td className="border border-slate-200 px-4 py-3">
                                                        <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold uppercase ring-1 ${assignmentStatusStyle(item.status)}`}>
                                                            {item.statusLabel || item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="grid gap-3 md:hidden">
                                    {assignments.map(item => (
                                        <article key={item.id} className="rounded-xl border border-slate-100 p-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-700">{item.orderNumber || '—'}</p>
                                                    <p className="mt-1 text-[10px] text-slate-400">{item.trackingNumber}</p>
                                                </div>
                                                <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ring-1 ${assignmentStatusStyle(item.status)}`}>
                                                    {item.statusLabel || item.status}
                                                </span>
                                            </div>
                                            <div className="mt-3 border-t border-slate-100 pt-3">
                                                <p className="text-xs font-bold text-slate-700">{item.customerName || '—'}</p>
                                                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                                                    <Phone size={11} />{item.customerPhone || '—'}
                                                </p>
                                                <p className="mt-2 flex gap-1.5 text-[11px] leading-5 text-slate-500">
                                                    <MapPin size={12} className="mt-1 shrink-0 text-emerald-600" />
                                                    {item.deliveryAddress || 'Address unavailable'}
                                                </p>
                                                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                                                    <CalendarDays size={11} />Assigned {formatDate(item.assignedAt)}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 py-14 text-center">
                                <PackageSearch size={28} className="mx-auto text-slate-300" />
                                <p className="mt-3 text-sm font-bold text-slate-600">No pending assignments</p>
                                <p className="mt-1 text-xs text-slate-400">This delivery person has no pending orders right now.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}
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
