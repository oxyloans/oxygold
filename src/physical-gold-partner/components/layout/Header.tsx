import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2 sm:gap-4">
                <button className="lg:hidden p-2 hover:bg-slate-50 rounded-md transition-all text-slate-500" onClick={onMenuClick}>
                    <Menu size={20} />
                </button>
                <div className="relative group max-w-xs sm:max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-xs sm:text-sm w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 hover:bg-slate-50 rounded-md transition-all text-slate-500 relative">
                    <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                </button>

                <div className="h-6 w-[1px] bg-slate-100 mx-1 sm:mx-2"></div>

               
            </div>
        </header>
    );
};

export default Header;
