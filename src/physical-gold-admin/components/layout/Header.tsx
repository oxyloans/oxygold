import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 hover:bg-slate-50 rounded-md transition-all text-slate-500" onClick={onMenuClick}>
                    <Menu size={20} />
                </button>
                <div className="relative group max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search products, orders..."
                        className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[13px] w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-50 rounded-md transition-all text-slate-500 relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>

                {/* <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="flex flex-col items-end">
                        <span className="text-[13px] font-bold text-slate-800 leading-tight">Rishik Kumar</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">Super Admin</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-slate-200 transition-colors overflow-hidden">
                        <User size={18} />
                    </div>
                </div> */}
            </div>
        </header>
    );
};

export default Header;
