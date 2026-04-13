import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
    Package,
    Settings,
    LogOut,
    ChevronRight,
    User,
    MessageSquare,
    Bell,
    HelpCircle,
    ShoppingBag,
    UploadCloud,
    LayoutDashboard
} from 'lucide-react';
import { logout } from '../../services/adminService';

const Sidebar: React.FC = () => {
    const [isLogout, setIsLogout] = useState(false);
    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin/dashboard' },
        // { title: 'Products', icon: <Package size={18} />, path: '/admin/products' },
        { title: 'Catalog Upload', icon: <UploadCloud size={18} />, path: '/admin/catalog-upload' },
        { title: 'Users', icon: <User size={18} />, path: '/admin/users' },
        { title: 'Orders', icon: <ShoppingBag size={18} />, path: '/admin/orders' },

        // { title: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' },
    ];

    const handleLogout = () => {
        setIsLogout(true);
    }

    const handleLogoutVerify = async () => {
        const response = await logout()
        if (response.success) {
            localStorage.removeItem("admin");
            window.location.href = "/admin/login";
            setIsLogout(false);
        }
    }

    return (
        <>
            <aside className="w-50 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-40">
                <div className="p-4 flex items-center gap-2 border-b border-slate-50 mb-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">OG</div>
                    <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-slate-800 leading-tight">OxyGold</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Admin</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-2 py-2">
                    <ul className="space-y-0.5">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2 rounded-md transition-all group
                                    ${isActive
                                            ? 'bg-emerald-50 text-emerald-600 font-semibold'
                                            : 'text-slate-900 hover:bg-slate-50 hover:text-slate-800'}
                                `}
                                >
                                    <span className={`transition-colors ${item.path === '/admin/dashboard' ? '' : 'group-hover:text-emerald-500'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[13px]">{item.title}</span>
                                    <ChevronRight className={`ml-auto opacity-0 group-hover:opacity-40 transition-opacity`} size={14} />
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-50 space-y-3">
                    <button className="flex items-center gap-3 px-3 py-2 cursor-pointer text-red-500 hover:bg-red-50 rounded-md transition-all w-full text-[13px] font-medium mt-2" onClick={() => handleLogout()}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                    <div className="text-[10px] text-center text-slate-300 font-medium">Version 1.0.0</div>
                </div>
            </aside>
            <Modal
                isOpen={isLogout}
                onClose={() => setIsLogout(false)}
                title="Confirm Logout"
                size="sm"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsLogout(false)}>Cancel</Button>
                        <Button variant="danger" onClick={() => {
                            handleLogoutVerify();
                        }}>Logout</Button>
                    </div>
                }
            >
                <p className='text-sm font-normal'>Are you sure you want to Logout?</p>
            </Modal>
        </>
    );
};

export default Sidebar;
