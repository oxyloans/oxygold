import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
    LogOut,
    ChevronRight,
    User,
    ShoppingBag,
    LayoutDashboard,
    X
} from 'lucide-react';
import { logout } from '../../services/partnerService';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
    const [isLogout, setIsLogout] = useState(false);
    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/partner/dashboard' },
        { title: 'Delivery Boys List', icon: <User size={18} />, path: '/partner/delivery-boys' },
        { title: 'Orders', icon: <ShoppingBag size={18} />, path: '/partner/orders' },
    ];

    const handleLogout = () => {
        setIsLogout(true);
    }

    const handleLogoutVerify = async () => {
        const response = await logout()
        if (response.success) {
            localStorage.removeItem("partner");
            window.location.href = "/partner/login";
            setIsLogout(false);
        }
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/20 z-40" 
                    onClick={onClose}
                />
            )}
            
            <aside className={`
                w-64 bg-white border-r border-slate-100 flex flex-col h-screen 
                fixed left-0 top-0 z-50 lg:z-40
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Mobile Close Button */}
                <div className="lg:hidden flex justify-end p-3">
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 flex items-center gap-3 border-b border-slate-50 mb-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">OG</div>
                    <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-slate-800 leading-tight">OxyGold</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Partner</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-2 py-2">
                    <ul className="space-y-0.5">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => onClose?.()}
                                    className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group
                                    ${isActive
                                            ? 'bg-emerald-50 text-emerald-600 font-semibold'
                                            : 'text-slate-900 hover:bg-slate-50 hover:text-slate-800'}
                                `}
                                >
                                    <span className={`transition-colors ${item.path === '/partner/dashboard' ? '' : 'group-hover:text-emerald-500'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-sm">{item.title}</span>
                                    <ChevronRight className={`ml-auto opacity-0 group-hover:opacity-40 transition-opacity`} size={14} />
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-50 space-y-3">
                    <button className="flex items-center gap-3 px-3 py-2 cursor-pointer text-red-500 hover:bg-red-50 rounded-md transition-all w-full text-sm font-medium mt-2" onClick={() => handleLogout()}>
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
