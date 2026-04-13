import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-emerald-600" size={22} />
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium mt-0.5 tracking-tight">Status Update</p>
                </div>
            </div>
            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500 font-medium">Dashboard summary and analytics will be available soon.</p>
            </div>
        </div>
    );
};

export default Dashboard;
