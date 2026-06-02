import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Hash, Loader2, Search } from 'lucide-react';
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
    const [searchType, setSearchType] = useState<'name' | 'phoneNumber'>('name');
    const [searchValue, setSearchValue] = useState('');

    const fetchUsers = async (page: number, search?: string, type?: 'name' | 'phoneNumber') => {
        setLoading(true);
        try {
            const params: any = { page, size: pageSize };
            if (search && type) {
                params[type] = search;
            }
            const response = await viewAllUsers(params.page, params.size, params.name, params.phoneNumber);
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

    useEffect(() => {
        if (searchValue === '') {
            setCurrentPage(0);
            fetchUsers(0);
        }
    }, [searchValue]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = () => {
        if (searchValue) {
            setCurrentPage(0);
            fetchUsers(0, searchValue, searchType);
        }
    };

    const columns = [
        {
            header: 'SR No',
            key: 'srNo',
            width: '60px',
            render: (_: any, item: UserData) => (
                <span className="font-bold text-slate-600">
                    {users.findIndex(user => user.userId === item.userId) + 1 + (currentPage * pageSize)}
                </span>
            )
        },
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
            header: 'Email',
            key: 'email',
            render: (val: string) => (
                <div className="flex items-center gap-1.5 text-slate-600">
                    <Mail size={12} className="text-slate-400" />
                    {val || 'No Email'}
                </div>
            )
        },
        {
            header: 'Gender',
            key: 'gender',
            width: '80px',
            render: (val: string) => (
                <span className="text-slate-700 font-semibold uppercase text-xs">
                    {val || '-'}
                </span>
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
                <div className="p-4 border-b border-slate-50 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[14px] font-bold text-slate-800">Registration List</h3>
                        <div className="flex items-center gap-2">
                            {loading && <Loader2 size={16} className="text-emerald-500 animate-spin" />}
                            <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">Total: {totalElements}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as 'name' | 'phoneNumber')}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="name">Name</option>
                            <option value="phoneNumber">Mobile Number</option>
                        </select>
                        
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={`Search by ${searchType === 'name' ? 'name' : 'mobile number'}...`}
                                className="w-full px-4 py-2 pl-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        
                        <button
                            onClick={handleSearch}
                            disabled={!searchValue}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Search
                        </button>
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
