import React from 'react';
import Switch from '../components/ui/Switch';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Settings as SettingsIcon, Store, ShieldCheck, Bell } from 'lucide-react';

const Settings: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <SettingsIcon className="text-emerald-600" size={22} />
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Settings</h1>
                    </div>
                    <p className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-tight">Configure portal preferences and store settings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                        <Store size={18} className="text-emerald-500" />
                        <h3 className="text-[14px] font-bold text-slate-800">Store Information</h3>
                    </div>
                    <div className="p-6">
                        <form className="space-y-4">
                            <Input label="Store Name" defaultValue="OxyGold Official" />
                            <Input label="Support Email" defaultValue="support@oxygold.com" />
                            <Input label="Contact Number" defaultValue="+91 1234567890" />
                            <div className="pt-2">
                                <Button variant="primary" size="md">Save Changes</Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        <h3 className="text-[14px] font-bold text-slate-800">Notifications & Security</h3>
                    </div>
                    <div className="p-0">
                        <div className="divide-y divide-slate-50">
                            <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="space-y-0.5">
                                    <span className="text-[13px] font-bold text-slate-700">Order Notifications</span>
                                    <p className="text-[11px] text-slate-400 font-medium">Receive email for every new order</p>
                                </div>
                                <Switch checked={true} onChange={() => { }} />
                            </div>
                            <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="space-y-0.5">
                                    <span className="text-[13px] font-bold text-slate-700">Inventory Alerts</span>
                                    <p className="text-[11px] text-slate-400 font-medium">Notify when stock is below 5 units</p>
                                </div>
                                <Switch checked={false} onChange={() => { }} />
                            </div>
                            <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="space-y-0.5">
                                    <span className="text-[13px] font-bold text-slate-700">Two-Factor Authentication</span>
                                    <p className="text-[11px] text-slate-400 font-medium">Extra layer of security for your account</p>
                                </div>
                                <Switch checked={true} onChange={() => { }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
