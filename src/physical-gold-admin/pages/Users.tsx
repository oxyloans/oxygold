import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Calendar,
  Loader2,
  Search,
  X,
  Users as UsersIcon,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Toast from '../../PhysicalGold/components/Toast';
import { viewAllUsers, updateTestUserStatus } from '../services/adminService';

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
  createdAt: string | null;
  profileImageUrl: string | null;
  testUser?: boolean;
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

    // Test User update states
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; user: UserData | null }>({
      open: false,
      user: null,
    });
    const [toast, setToast] = useState<{
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
    } | null>(null);

    const fetchUsers = async (page: number, search?: string, type?: 'name' | 'phoneNumber') => {
        setLoading(true);
        try {
            const params: any = { page, size: pageSize };
            if (search && type) {
                params[type] = search;
            }
            const response = await viewAllUsers(params.page, params.size, params.name, params.phoneNumber);
            if (response?.success) {
                setUsers(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
            setTotalElements(0);
            setTotalPages(0);
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

    const handleConfirmStatusChange = async () => {
        if (!confirmModal.user) return;
        const targetUser = confirmModal.user;
        const newStatus = !targetUser.testUser;
        setUpdatingUserId(targetUser.userId);

        try {
            const response = await updateTestUserStatus(targetUser.userId, newStatus);
            if (response?.success || response) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.userId === targetUser.userId ? { ...u, testUser: newStatus } : u
                    )
                );
                setToast({
                    message: `User #${targetUser.userId} has been successfully updated to ${
                        newStatus ? 'Test User' : 'Live User'
                    }.`,
                    type: 'success',
                });
                setConfirmModal({ open: false, user: null });
            }
        } catch (error: any) {
            console.error('Failed to update test user status:', error);
            setToast({
                message: error?.message || 'Failed to update test user status. Please try again.',
                type: 'error',
            });
        } finally {
            setUpdatingUserId(null);
        }
    };

    const formatDateStr = (dateString?: string | null) => {
        if (!dateString) return 'Not set';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const columns = [
      {
        header: "SR No",
        key: "srNo",
        width: "70px",
        align: "left",
        render: (_: any, item: UserData) => (
          <span className="font-bold text-slate-600 text-[12px] tabular-nums">
            {users.findIndex((user) => user.userId === item.userId) +
              1 +
              currentPage * pageSize}
          </span>
        ),
      },
      {
        header: "User Info",
        key: "userInfo",
        width: "230px",
        align: "left",
        render: (_: any, item: UserData) => (
          <div className="min-w-[190px] space-y-1 text-left text-[12px] leading-relaxed">
            <p>
              <span className="font-bold text-slate-500">User Id:</span>{" "}
              <span className="font-bold text-slate-800">#{item.userId}</span>
            </p>
            <p>
              <span className="font-bold text-slate-500">Name:</span>{" "}
              <span className="font-bold text-slate-800">
                {item.firstName || ""} {item.lastName || ""}
                {!item.firstName && !item.lastName && "No Name"}
              </span>
            </p>
            <p>
              <span className="font-bold text-slate-500">Gender:</span>{" "}
              <span className="font-semibold text-slate-700 uppercase text-[11px]">
                {item.gender || "—"}
              </span>
            </p>
          </div>
        ),
      },
      {
        header: "User Type",
        key: "testUser",
        width: "140px",
        align: "center",
        render: (_: any, item: UserData) => {
          const isTest = Boolean(item.testUser);
          return (
            <div className="flex items-center justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                  isTest
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isTest ? (
                  <>
                    <FlaskConical size={12} className="text-amber-600 shrink-0" />
                    Test User
                  </>
                ) : (
                  <>
                    <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                    Live User
                  </>
                )}
              </span>
            </div>
          );
        },
      },
      {
        header: "Email",
        key: "email",
        width: "210px",
        align: "left",
        render: (val: string) => (
          <div className="flex items-center gap-1.5 text-left text-[12px] text-slate-600">
            <Mail size={13} className="text-slate-400 shrink-0" />
            <span className="break-all">{val || "No Email"}</span>
          </div>
        ),
      },
      {
        header: "Phone / Whatsapp",
        key: "phoneNumber",
        width: "190px",
        align: "left",
        render: (val: string, item: UserData) => (
          <div className="space-y-1 text-left text-[12px]">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Phone size={13} className="text-slate-400 shrink-0" />
              <span>{val || "—"}</span>
            </div>
            {item.whatsappNumber && (
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span>WA: {item.whatsappNumber}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        header: "Date of Joining",
        key: "createdAt",
        width: "150px",
        align: "left",
        render: (val: string) => (
          <div className="flex items-center gap-1.5 text-left text-[12px] text-slate-600 whitespace-nowrap">
            <Calendar size={13} className="text-slate-400 shrink-0" />
            <span>{formatDateStr(val)}</span>
          </div>
        ),
      },
      {
        header: "Action",
        key: "action",
        width: "160px",
        align: "center",
        render: (_: any, item: UserData) => {
          const isTest = Boolean(item.testUser);
          const isUpdating = updatingUserId === item.userId;

          return (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: true, user: item })}
                disabled={isUpdating}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isTest
                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 hover:border-amber-300"
                }`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-slate-500" />
                    <span>Updating...</span>
                  </>
                ) : isTest ? (
                  <>
                    <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                    <span>Switch to Live</span>
                  </>
                ) : (
                  <>
                    <FlaskConical size={12} className="text-amber-600 shrink-0" />
                    <span>Switch to Test</span>
                  </>
                )}
              </button>
            </div>
          );
        },
      },
    ];

    return (
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <UsersIcon className="text-emerald-600 shrink-0" size={24} />
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                User Management
              </h1>
            </div>
            <p className="text-[12px] sm:text-[13px] text-slate-400 font-medium mt-0.5 tracking-tight">
              View and manage customer accounts and toggle Test / Live user status
            </p>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <UsersIcon size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Registered Users</span>
              <span className="text-xl font-bold text-slate-800 tracking-tight">{totalElements}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Verified Phone Accounts</span>
              <span className="text-xl font-bold text-slate-800 tracking-tight">{totalElements}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <FlaskConical size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Current Page Breakdown</span>
              <span className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="text-amber-600 font-bold">{users.filter((u) => u.testUser).length} Test</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-600 font-bold">{users.filter((u) => !u.testUser).length} Live</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-[14px] font-bold text-slate-800">
                Registration List
              </h3>
              <div className="flex items-center gap-2">
                {loading && (
                  <Loader2
                    size={16}
                    className="text-emerald-500 animate-spin"
                  />
                )}
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                  Total: {totalElements}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as "name" | "phoneNumber")
                }
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="phoneNumber">Mobile Number</option>
              </select>

              <div className="flex-1 relative min-w-0">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={`Search by ${
                    searchType === "name" ? "name" : "mobile number"
                  }...`}
                  className="w-full px-4 py-2 pl-9 pr-9 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />

                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={!searchValue}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors sm:w-auto cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Table View for Desktop / Tablet */}
          <div className="hidden md:block">
            <Table
              columns={columns}
              data={users}
              isLoading={loading}
              className="border-none rounded-none"
              emptyMessage="No users found."
            />
          </div>

          {/* Card View for Mobile */}
          <div className="block md:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Loader2 size={20} className="mx-auto animate-spin text-emerald-600 mb-2" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No users found.
              </div>
            ) : (
              users.map((item, index) => {
                const isTest = Boolean(item.testUser);
                const isUpdating = updatingUserId === item.userId;

                return (
                  <div key={item.userId} className="p-4 space-y-2.5 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          SR #{index + 1 + currentPage * pageSize}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isTest
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isTest ? (
                            <>
                              <FlaskConical size={10} className="text-amber-600" />
                              Test User
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={10} className="text-emerald-600" />
                              Live User
                            </>
                          )}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">
                        User Id: #{item.userId}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs pt-1">
                      <p>
                        <span className="font-bold text-slate-400">Name:</span>{" "}
                        <span className="font-bold text-slate-800">
                          {item.firstName || ""} {item.lastName || ""}
                          {!item.firstName && !item.lastName && "No Name"}
                        </span>
                      </p>
                      <p>
                        <span className="font-bold text-slate-400">Gender:</span>{" "}
                        <span className="font-semibold text-slate-700 uppercase">
                          {item.gender || "—"}
                        </span>
                      </p>
                      <p className="flex items-center gap-1 text-slate-600 pt-0.5">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="break-all">{item.email || "No Email"}</span>
                      </p>
                      <p className="flex items-center gap-1 text-slate-700 font-medium">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{item.phoneNumber || "—"}</span>
                        {item.whatsappNumber && (
                          <span className="text-[10px] text-emerald-600 font-bold ml-2">
                            (WA: {item.whatsappNumber})
                          </span>
                        )}
                      </p>
                      <p className="flex items-center gap-1 text-slate-400 text-[11px] pt-0.5">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>Joined: {formatDateStr(item.createdAt)}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Action
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmModal({ open: true, user: item })}
                        disabled={isUpdating}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isTest
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                        } disabled:opacity-50`}
                      >
                        {isUpdating ? (
                          <span className="inline-flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" /> Updating...
                          </span>
                        ) : isTest ? (
                          <>
                            <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                            <span>Switch to Live</span>
                          </>
                        ) : (
                          <>
                            <FlaskConical size={12} className="text-amber-600 shrink-0" />
                            <span>Switch to Test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalElements={totalElements}
            size={pageSize}
          />
        </div>

        {/* Confirmation Modal */}
        {confirmModal.open && confirmModal.user && (
          <Modal
            isOpen={confirmModal.open}
            onClose={() => !updatingUserId && setConfirmModal({ open: false, user: null })}
            title="Update User Account Type"
            size="sm"
            footer={
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={Boolean(updatingUserId)}
                  onClick={() => setConfirmModal({ open: false, user: null })}
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmModal.user.testUser ? "primary" : "secondary"}
                  size="sm"
                  isLoading={updatingUserId === confirmModal.user.userId}
                  onClick={handleConfirmStatusChange}
                >
                  Confirm {confirmModal.user.testUser ? "Live User" : "Test User"}
                </Button>
              </div>
            }
          >
            <div className="space-y-3.5 text-slate-700">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <p>
                  <span className="font-semibold text-slate-500">User ID:</span>{" "}
                  <span className="font-bold text-slate-800">#{confirmModal.user.userId}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">Name:</span>{" "}
                  <span className="font-bold text-slate-800">
                    {confirmModal.user.firstName || ""} {confirmModal.user.lastName || ""}
                    {!confirmModal.user.firstName && !confirmModal.user.lastName && "No Name"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">Mobile:</span>{" "}
                  <span className="font-bold text-slate-800">
                    {confirmModal.user.phoneNumber || "—"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">Current Status:</span>{" "}
                  <span
                    className={`font-bold ${
                      confirmModal.user.testUser ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {confirmModal.user.testUser ? "Test User" : "Live User"}
                  </span>
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to change this user to{" "}
                <strong
                  className={
                    confirmModal.user.testUser ? "text-emerald-700" : "text-amber-700"
                  }
                >
                  {confirmModal.user.testUser ? "Live User" : "Test User"}
                </strong>
                ?
              </p>

              {confirmModal.user.testUser ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2">
                  <ShieldCheck size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    Setting to <strong>Live User</strong> means this account will be treated as an active production user for real orders and transactions.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-[11px] text-amber-800 flex items-start gap-2">
                  <FlaskConical size={15} className="shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Setting to <strong>Test User</strong> flags this account for staging/QA testing and simulation purposes.
                  </span>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Toast Notification */}
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

export default Users;
