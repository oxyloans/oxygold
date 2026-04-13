import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Hash, Loader2 } from 'lucide-react';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import { viewAllUsers } from '../services/adminService';

interface UserData {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phoneNumber: string;
    alternativeNumber: string | null;
    whatsappNumber: string | null;
    gender: string | null;
    dob: string | null;
    profileImageUrl: string | null;
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const fetchUsers = async (page: number) => {
        setLoading(true);
        try {
            const response = await viewAllUsers(page, pageSize);
            if (response.success) {
                setUsers(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const columns = [
        {
            header: 'User ID',
            key: 'userId',
            width: '80px',
            render: (val: number) => (
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Hash size={12} className="text-slate-400" />
                    {val}
                </span>
            )
        },
        {
            header: 'Name',
            key: 'firstName',
            render: (_: any, item: UserData) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 uppercase font-bold text-xs">
                        {item.firstName?.[0] || item.phoneNumber?.[0] || 'U'}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">
                            {item.firstName || ''} {item.lastName || ''}
                            {(!item.firstName && !item.lastName) && 'No Name'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">Customer Account</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Phone / Whatsapp',
            key: 'phoneNumber',
            render: (val: string, item: UserData) => (
                <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone size={12} className="text-slate-400" />
                        {val}
                    </div>
                    {item.whatsappNumber && (
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span>WA: {item.whatsappNumber}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Email / Gender',
            key: 'email',
            render: (val: string, item: UserData) => (
                <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={12} className="text-slate-400" />
                        {val || 'No Email'}
                    </div>
                    {item.gender && (
                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            {item.gender}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Date of Birth',
            key: 'dob',
            render: (val: string) => (
                <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar size={12} className="text-slate-400" />
                    {val || 'Not set'}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <User className="text-emerald-600" size={22} />
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">User Management</h1>
                </div>
                <p className="text-[13px] text-slate-400 font-medium mt-0.5 tracking-tight">View and manage all registered users on the platform</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
                    <h3 className="text-[14px] font-bold text-slate-800">Registration List</h3>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 size={16} className="text-emerald-500 animate-spin" />}
                        <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">Total: {totalElements}</span>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={users}
                    isLoading={loading}
                    className="border-none rounded-none"
                    emptyMessage="No users found."
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalElements={totalElements}
                    size={pageSize}
                />
            </div>
        </div>
    );
};

export default Users;
