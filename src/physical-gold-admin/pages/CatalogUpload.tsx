import React, { useState, useEffect } from 'react';
import {
    UploadCloud, Plus, Edit2, ImageIcon, ChevronLeft,
    ChevronRight, Package, Layers, Settings2
} from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Switch from '../components/ui/Switch';
import Select from "../components/ui/Select";
import * as adminService from '../services/adminService';
import Toast from '../../PhysicalGold/components/Toast';

const CatalogUpload: React.FC = () => {
    // Hierarchical Navigation State
    const [level, setLevel] = useState(0); // 0: Main Cat, 1: Sub Cat, 2: Products, 3: Variants
    const [path, setPath] = useState<{ id: number; name: string; level: number }[]>([]);

    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Toast Notification State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'category' | 'product' | 'variant' | 'price' | 'quantity'>('category');
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedViewType, setSelectedViewType] = useState('FRONT');

    // Confirm Toggle State
    const [confirmToggle, setConfirmToggle] = useState<{ open: boolean; item: any | null; type?: 'variant' | 'product' | 'category' }>({ open: false, item: null });

    // Form State
    const [formData, setFormData] = useState<any>({});

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let result: any[] = [];
            const currentParent = path.length > 0 ? path[path.length - 1] : null;

            if (level === 0) {
                const data = await adminService.fetchMainCategories();
                result = data.data;
                console.log(result);
            } else if (level === 1) {
                const data = await adminService.fetchSubCategories(currentParent!.id);
                result = data.data
            } else if (level === 2) {
                result = await adminService.getAllProducts(currentParent!.id);
            } else if (level === 3) {
                const variantData = await adminService.getAllVariants(currentParent!.id);
                result = variantData.data?.listVariantResponse || [];
            }

            // Filter out any null or undefined items from result
            result = (Array.isArray(result) ? result : []).filter(item => item !== null && item !== undefined);

            // Fetch images for categories and products
            if (level < 3) {
                const withImages = await Promise.all(
                    result.map(async (item: any) => {
                        const imgData = level === 2
                            ? await adminService.fetchProductImageURL(item.id)
                            : await adminService.fetchCategoryImageURL(item.id);
                        return { ...item, imageData: imgData };
                    })
                );
                setData(withImages);
            } else {
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [level, path]);

    // Navigation Handlers
    const handleDrillDown = (item: any) => {
        if (level < 3) {
            setPath([...path, { id: item.id, name: item.name, level: level }]);
            setLevel(level + 1);
        }
    };

    const handleBack = () => {
        if (path.length > 0) {
            const newPath = [...path];
            newPath.pop();
            setPath(newPath);
            setLevel(level - 1);
        }
    };

    const jumpToPath = (index: number) => {
        const newPath = path.slice(0, index + 1);
        setPath(newPath);
        setLevel(index + 1);
    };

    const resetToHome = () => {
        setPath([]);
        setLevel(0);
    };

    // CRUD Handlers
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const currentParent = path.length > 0 ? path[path.length - 1] : null;
            const params: any = {
                documentType: 'image',
                viewType: selectedViewType
            };

            if (isEditing) {
                if (level === 2) params.productId = currentItem.id;
                else params.categoryId = currentItem.id;
            } else {
                // For new items, we might need to handle this differently if API requires ID 
                // But user says categeryId and productId are query params.
                // If they are new, they don't have IDs yet. 
                // Usually we upload after creation or use a temporary container.
                // However, the user request shows params: categoryId and productId.
                if (level === 2 && currentParent) params.categoryId = currentParent.id;
                else if (level === 1 && currentParent) params.categoryId = currentParent.id;
            }

            await adminService.uploadCatalogImage(file, params);

            // Refresh to show the new image
            if (isEditing) {
                const freshImageData = level === 2
                    ? await adminService.fetchProductImageURL(currentItem.id)
                    : await adminService.fetchCategoryImageURL(currentItem.id);
                setCurrentItem({ ...currentItem, imageData: freshImageData });
            }
            fetchData();
            setToast({ message: "Image uploaded successfully", type: "success" });
        } catch (error) {
            console.error(error);
            setToast({ message: "Upload failed", type: "error" });
        } finally {
            setIsUploading(false);
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentItem(null);

        if (level < 2) {
            setModalType('category');
            setFormData({ name: '', description: '', imageId: 0 });
        } else if (level === 2) {
            setModalType('product');
            setFormData({
                name: '', description: '', imageId: 0,
                productType: '', gstPercentage: 0, makingPercentage: 0,
                status: 'ACTIVE'
            });
        } else {
            setModalType('variant');
            setFormData({
                sku: '', size: '', purity: '',
                weight: 0, price: 0, mrp: 0, stockQuantity: 0
            });
        }
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setIsEditing(true);
        setCurrentItem(item);

        if (level < 2) {
            setModalType('category');
            setFormData({ name: item.name, description: item.description || '' });
        } else if (level === 2) {
            setModalType('product');
            setFormData({
                name: item.name, description: item.description || '',
                productType: item.productType || '', gstPercentage: item.gstPercentage || 0,
                makingPercentage: item.makingPercentage || 0,
                status: item.status || 'ACTIVE'
            });
        } else {
            setModalType('variant');
            setFormData({ ...item });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const currentParent = path.length > 0 ? path[path.length - 1] : null;
            let successMessage = "Action completed successfully";

            if (modalType === 'category') {
                const payload = { ...formData, parentId: currentParent ? currentParent.id : 0 };
                if (isEditing) {
                    await adminService.updateCategory({ ...payload, id: currentItem.id });
                    successMessage = "Category updated successfully";
                } else {
                    await adminService.createCategory(payload);
                    successMessage = "Category created successfully";
                }
            } else if (modalType === 'product') {
                const payload = { ...formData, categoryId: currentParent!.id };
                if (isEditing) {
                    await adminService.updateProduct(currentItem.id, payload);
                    successMessage = "Product updated successfully";
                } else {
                    await adminService.createProduct(payload);
                    successMessage = "Product created successfully";
                }
            } else if (modalType === 'variant') {
                if (!isEditing) {
                    await adminService.addVariant(currentParent!.id, formData);
                    successMessage = "Variant added successfully";
                }
            } else if (modalType === 'price') {
                await adminService.updateVariantPrice(currentItem.id, formData.price);
                successMessage = "Price updated successfully";
            } else if (modalType === 'quantity') {
                await adminService.updateVariantQuantity(currentItem.id, formData.stockQuantity);
                successMessage = "Stock quantity updated successfully";
            }

            setIsModalOpen(false);
            fetchData();
            setToast({ message: successMessage, type: 'success' });
        } catch (error: any) {
            setToast({ message: error.message || "Action failed", type: 'error' });
        }
    };

    const handleStatusToggle = async (item: any) => {
        const newStatus = item.status === 'ACTIVE' ? 'OUT_OF_STOCK' : 'ACTIVE';
        try {
            await adminService.updateVariantStatus(item.id, newStatus);
            fetchData();
            setToast({ message: `Variant status updated to ${newStatus === 'ACTIVE' ? 'Active' : 'Out of Stock'}`, type: 'success' });
        } catch (error) {
            setToast({ message: "Status update failed", type: 'error' });
        }
    };

    const handleProductStatusToggle = async (item: any) => {
        const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await adminService.updateProductStatus(item.id, newStatus);
            fetchData();
            setToast({ message: `Product status updated to ${newStatus === 'ACTIVE' ? 'Active' : 'Inactive'}`, type: 'success' });
        } catch (error) {
            setToast({ message: "Status update failed", type: 'error' });
        }
    };

    const handleCategoryStatusToggle = async (item: any) => {
        const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await adminService.updateCategoryStatus(item.id, newStatus);
            fetchData();
            setToast({ message: `Category status updated to ${newStatus === 'ACTIVE' ? 'Active' : 'Inactive'}`, type: 'success' });
        } catch (error) {
            setToast({ message: "Status update failed", type: 'error' });
        }
    };

    // Table Columns Configuration
    const getColumns = () => {
        const common: any[] = [
            { header: 'ID', key: 'id', width: '60px' },
        ];

        if (level < 3) {
            common.push({
                header: 'Image',
                key: 'imageData',
                width: '80px',
                render: (imageData: any) => {
                    const url = imageData ? (imageData.frontViewurl || imageData.backViewUrl || imageData.leftViewUrl || imageData.rightViewUrl || imageData.topViewUrl || imageData.bottomViewUrl) : null;
                    return (
                        <div className="w-10 h-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                            {url ? <img src={url} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={14} className="text-slate-300" />}
                        </div>
                    );
                }
            });
            common.push({ header: 'Name', key: 'name' });
            common.push({ header: 'Description', key: 'description' });
            if (level === 2) {
                common.push({ header: 'Type', key: 'productType', width: '100px' });
                common.push({ header: 'GST', key: 'gstPercentage', width: '60px', render: (v: any) => `${v}%` });
                common.push({
                    header: 'Status',
                    key: 'status',
                    width: '100px',
                    render: (val: string, item: any) => (
                        <div onClick={e => e.stopPropagation()}>
                            <Switch
                                checked={val === 'ACTIVE'}
                                onChange={() => setConfirmToggle({ open: true, item, type: 'product' })}
                            />
                        </div>
                    )
                });
            } else if (level < 2) {
                // Add status column for categories (level 0 and 1)
                common.push({
                    header: 'Status',
                    key: 'status',
                    width: '100px',
                    render: (val: string, item: any) => (
                        <div onClick={e => e.stopPropagation()}>
                            <Switch
                                checked={val === 'ACTIVE'}
                                onChange={() => setConfirmToggle({ open: true, item, type: 'category' })}
                            />
                        </div>
                    )
                });
            }
        } else {
            // Variant Columns
            common.push({ header: 'SKU', key: 'sku', width: '100px' });
            common.push({ header: 'Size', key: 'size', width: '80px' });
            common.push({ header: 'Weight', key: 'weight', width: '80px', render: (v: any) => `${v}g` });
            common.push({ header: 'Price', key: 'price', width: '100px', render: (v: any) => `₹${Number(v).toLocaleString()}` });
            common.push({ header: 'Stock', key: 'stockQuantity', width: '80px' });
            common.push({
                header: 'Status',
                key: 'status',
                width: '100px',
                render: (val: string, item: any) => (
                    <Switch
                        checked={val === 'ACTIVE'}
                        onChange={() => setConfirmToggle({ open: true, item, type: 'variant' })}
                    />
                )
            });
        }

        common.push({
            header: '',
            key: 'id',
            width: '40px',
            render: () => level < 3 ? <ChevronRight size={14} className="text-slate-300" /> : null
        });

        common.push({
            header: 'Actions',
            key: 'id',
            width: '120px',
            align: 'right' as const,
            render: (_: any, item: any) => (
                <div className="flex justify-end gap-1">
                    {level === 3 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentItem(item);
                                    setFormData({ price: item.price });
                                    setModalType('price');
                                    setIsModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 transition-all"
                                title="Update Price"
                            >
                                <Settings2 size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentItem(item);
                                    setFormData({ stockQuantity: item.stockQuantity });
                                    setModalType('quantity');
                                    setIsModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 transition-all"
                                title="Update Stock"
                            >
                                <Plus size={14} />
                            </button>
                        </>
                    )}
                    {level !== 3 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 transition-all"
                        >
                            <Edit2 size={14} />
                        </button>
                    )}
                </div>
            )
        });

        return common;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {level > 0 && (
                            <button onClick={handleBack} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 mr-1">
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            {level < 2 ? <Layers className="text-emerald-600" size={20} /> : <Package className="text-emerald-600" size={20} />}
                        </div>
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                            {level === 0 ? 'Catalog' : path[path.length - 1].name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                        <span
                            className={`text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${level === 0 ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={resetToHome}
                        >
                            Catalog
                        </span>
                        {path.map((p, i) => (
                            <React.Fragment key={p.id}>
                                <ChevronRight size={10} className="text-slate-300" />
                                <span
                                    className={`text-[11px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${i === path.length - 1 ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => jumpToPath(i)}
                                >
                                    {p.name}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>Create {level === 0 ? 'Category' : level === 1 ? 'Sub-category' : level === 2 ? 'Product' : 'Variant'}</span>
                </Button>
            </div>

            <Table
                columns={getColumns()}
                data={data}
                isLoading={isLoading}
                onRowClick={handleDrillDown}
                emptyMessage="No items found at this level."
            />

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? `Update ${modalType}` : modalType === 'price' ? 'Update Price' : modalType === 'quantity' ? 'Update Stock' : `Create New ${modalType}`}
                size="md"
                footer={
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isUploading}>
                            {modalType === 'price' || modalType === 'quantity' ? 'Update' : (isEditing ? 'Save Changes' : 'Create')}
                        </Button>
                    </div>
                }
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {modalType === 'price' ? (
                        <Input
                            label="New Price (₹)" type="number" value={formData.price || 0}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                    ) : modalType === 'quantity' ? (
                        <Input
                            label="New Stock Quantity" type="number" value={formData.stockQuantity || 0}
                            onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                        />
                    ) : modalType !== 'variant' ? (
                        <>
                            <Input
                                label="Name" value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Textarea
                                label="Description" value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                            {modalType === 'product' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Product Type"
                                            options={[
                                                { label: 'Physical', value: 'PHYSICAL' },
                                                { label: 'Digital', value: 'DIGITAL' },
                                            ]}
                                            value={formData.productType || ''}
                                            onChange={val => setFormData({ ...formData, productType: val })}
                                            placeholder="Select type..."
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                label="GST %" type="number" value={formData.gstPercentage || 0}
                                                onChange={e => setFormData({ ...formData, gstPercentage: Number(e.target.value) })}
                                            />
                                            <Input
                                                label="Making %" type="number" value={formData.makingPercentage || 0}
                                                onChange={e => setFormData({ ...formData, makingPercentage: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    {/* Status Field */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-500 uppercase">Status</label>
                                        <div className="flex gap-3">
                                            {['ACTIVE', 'INACTIVE'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: s })}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${formData.status === s
                                                        ? s === 'ACTIVE'
                                                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                                            : 'bg-red-50 border-red-400 text-red-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase">Image View Type</label>
                                    <Select
                                        options={[
                                            { label: 'Front View', value: 'FRONT' },
                                            { label: 'Back View', value: 'BACK' },
                                            { label: 'Left View', value: 'LEFT' },
                                            { label: 'Right View', value: 'RIGHT' },
                                            { label: 'Top View', value: 'TOP' },
                                            { label: 'Bottom View', value: 'BOTTOM' },
                                        ]}
                                        value={selectedViewType}
                                        onChange={val => setSelectedViewType(val as string)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase">Upload {selectedViewType.toLowerCase().replace('_', ' ')}</label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 border-slate-200`}
                                        onClick={() => document.getElementById('file-up')?.click()}
                                    >
                                        <div className="flex flex-col items-center">
                                            <UploadCloud size={20} className="text-emerald-500 mb-1" />
                                            <span className="text-xs text-slate-500 font-medium">{isUploading ? 'Uploading...' : 'Click to upload image'}</span>
                                        </div>
                                    </div>
                                    <input id="file-up" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </div>

                                {isEditing && currentItem?.imageData && (
                                    <div className="space-y-2 pt-2">
                                        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Product Gallery</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Front', key: 'frontViewurl' },
                                                { label: 'Back', key: 'backViewUrl' },
                                                { label: 'Left', key: 'leftViewUrl' },
                                                { label: 'Right', key: 'rightViewUrl' },
                                                { label: 'Top', key: 'topViewUrl' },
                                                { label: 'Bottom', key: 'bottomViewUrl' }
                                            ].map(view => {
                                                const url = currentItem.imageData[view.key];
                                                if (!url) return null;
                                                return (
                                                    <div key={view.key} className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                                                        <img src={url} alt={view.label} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 px-1.5 backdrop-blur-sm">
                                                            <p className="text-[9px] text-white font-bold uppercase text-center">{view.label}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Variant Form
                        <div className="space-y-4">
                            <Input label="SKU" value={formData.sku || ''} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Size" value={formData.size || ''} onChange={e => setFormData({ ...formData, size: e.target.value })} />
                                <Input label="Purity" value={formData.purity || ''} placeholder="e.g. 22KT" onChange={e => setFormData({ ...formData, purity: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Weight (g)" type="number" value={formData.weight || 0} onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })} />
                                <Input label="Stock" type="number" value={formData.stockQuantity || 0} onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Price (₹)" type="number" value={formData.price || 0} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                <Input label="MRP (₹)" type="number" value={formData.mrp || 0} onChange={e => setFormData({ ...formData, mrp: Number(e.target.value) })} />
                            </div>
                        </div>
                    )}
                </form>
            </Modal>

            {/* Confirm Status Toggle Modal */}
            <Modal
                isOpen={confirmToggle.open}
                onClose={() => setConfirmToggle({ open: false, item: null })}
                title="Confirm Status Change"
                size="sm"
                footer={
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setConfirmToggle({ open: false, item: null })}>Cancel</Button>
                        <Button onClick={(e) => {
                            e.stopPropagation();
                            if (confirmToggle.type === 'product') handleProductStatusToggle(confirmToggle.item);
                            else if (confirmToggle.type === 'category') handleCategoryStatusToggle(confirmToggle.item);
                            else handleStatusToggle(confirmToggle.item);
                            setConfirmToggle({ open: false, item: null });
                        }}>
                            Confirm
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-slate-600">
                    {confirmToggle.item?.status === 'ACTIVE'
                        ? 'Marking this as inactive will make it no longer visible to customers. Are you sure?'
                        : 'This will make it visible to customers again. Continue?'}
                </p>
            </Modal>

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

export default CatalogUpload;