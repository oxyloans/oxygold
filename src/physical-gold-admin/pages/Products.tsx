import React from 'react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Plus, Search, MessageSquare, Edit2, Trash2, Package } from 'lucide-react';

const Products: React.FC = () => {
    const columns = [
        {
            header: 'Image', key: 'imageUrl', render: (val: string) => (
                <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-100">
                    <img src={val} alt="product" className="w-full h-full object-cover" />
                </div>
            )
        },
        {
            header: 'Product Name', key: 'productName', render: (val: string, item: any) => (
                <div className="flex flex-col">
                    <span className="text-slate-800 font-bold tracking-tight">{val}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.category}</span>
                </div>
            )
        },
        { header: 'Price', key: 'price', render: (val: string) => <span className="text-emerald-600 font-bold">{val}</span> },
        { header: 'Stock', key: 'stock', render: (val: number) => <span className="text-emerald-500 font-bold">{val || '99'}</span> },
        {
            header: 'Status', key: 'status', render: (val: string) => (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${val.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>In Stock</span>
            )
        },
        {
            header: 'Variants', key: 'variants', render: () => (
                <button className="text-[10px] text-slate-400 font-bold border border-slate-200 border-dashed px-2 py-0.5 rounded hover:bg-slate-50 transition-all">+ Add Variant</button>
            )
        },
        {
            header: 'Actions', key: 'actions', render: () => (
                <div className="flex items-center gap-2">
                    <button className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded transition-all"><Edit2 size={14} /></button>
                    <button className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"><Trash2 size={14} /></button>
                </div>
            )
        },
    ];

    const data = [
        { imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9caab53?q=80&w=100', productName: '1g Gold Coin', category: 'Gold Coins', price: '₹6,500', stock: 99, status: 'Active' },
        { imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=100', productName: '5g Gold Bar', category: 'Gold Bars', price: '₹32,000', stock: 100, status: 'Active' },
        { imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=100', productName: 'Diamond Ring', category: 'Jewellery', price: '₹85,000', stock: 10, status: 'Inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Package className="text-emerald-600" size={22} />
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Products</h1>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium mt-0.5 tracking-tight">Manage your store products</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary">
                        <MessageSquare size={14} />
                        WhatsApp Sync (1)
                    </Button>
                    <Button variant="primary">
                        <Plus size={16} />
                        Add Product
                    </Button>
                </div>
            </div>

            <div className="max-w-md relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm shadow-slate-100/50"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table columns={columns} data={data} />
            </div>
        </div>
    );
};

export default Products;
