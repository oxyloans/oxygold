import React, { useEffect, useState, useCallback, useRef } from 'react';
import { HelpCircle, Search, X, Eye, CheckCircle, Paperclip, Upload, ImageIcon } from 'lucide-react';
import Table from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import {
    adminGetAllQueries,
    adminResolveQuery,
    adminUploadQueryScreenshot,
    HelpdeskQuery,
} from '../services/adminService';

const getAdminId = (): number => {
    try {
        const stored = localStorage.getItem('admin');
        if (stored) {
            const d = JSON.parse(stored);
            return d?.data?.userId || d?.userId || d?.id || 11;
        }
    } catch { }
    return 11;
};

const STATUS_TABS = ['PENDING', 'COMPLETED', 'CANCELLED'];

const Helpdesk: React.FC = () => {
    const [queries, setQueries] = useState<HelpdeskQuery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // Detail / Resolve modal
    const [selectedQuery, setSelectedQuery] = useState<HelpdeskQuery | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [comments, setComments] = useState('');
    const [commentError, setCommentError] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const searchWasActive = useRef(false);

    const loadQueries = useCallback(async (page = 0, status = statusFilter, size = pageSize) => {
        setIsLoading(true);
        try {
            const res = await adminGetAllQueries({ queryStatus: status, page, size });
            setQueries(res.content || []);
            setTotalPages(res.totalPages);
            setTotalElements(res.totalElements);
        } catch (err) {
            console.error('Failed to fetch queries:', err);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        setCurrentPage(0);
        loadQueries(0, statusFilter);
    }, [statusFilter]);

    useEffect(() => {
        const term = searchTerm.trim();
        if (!term) {
            if (searchWasActive.current) {
                searchWasActive.current = false;
                setCurrentPage(0);
                loadQueries(0, statusFilter);
            }
            return;
        }
        searchWasActive.current = true;

        // Ticket search must include records outside the currently visible page.
        const timeout = window.setTimeout(() => {
            setCurrentPage(0);
            loadQueries(0, statusFilter, 1000);
        }, 250);
        return () => window.clearTimeout(timeout);
    }, [searchTerm, statusFilter, loadQueries]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadQueries(page, statusFilter);
    };

    const openDetail = (query: HelpdeskQuery) => {
        setSelectedQuery(query);
        setComments('');
        setCommentError('');
        setUploadFile(null);
        setIsDetailOpen(true);
    };

    const handleUpload = async () => {
        if (!uploadFile || !selectedQuery) return;
        setIsUploading(true);
        try {
            await adminUploadQueryScreenshot(getAdminId(), selectedQuery.id, uploadFile);
            setUploadFile(null);
            // Refresh query to show new doc
            const res = await adminGetAllQueries({ queryStatus: statusFilter, page: currentPage, size: pageSize });
            const updated = res.content.find(q => q.id === selectedQuery.id);
            if (updated) setSelectedQuery(updated);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleStatusUpdate = async (queryStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
        if (!selectedQuery) return;
        if (!comments.trim()) {
            setCommentError('Resolution comment is required.');
            return;
        }
        setCommentError('');
        setIsResolving(true);
        try {
            await adminResolveQuery(selectedQuery.id, {
                userId: selectedQuery.userId,
                queryStatus,
                comments,
            });
            setIsDetailOpen(false);
            loadQueries(currentPage, statusFilter);
        } catch (err) {
            console.error('Failed to update query status:', err);
        } finally {
            setIsResolving(false);
        }
    };

    const normalizedSearch = searchTerm.trim().toLowerCase().replace(/^#/, '');
    const filtered = queries.filter(q => {
        const matchesSearch = !normalizedSearch || [q.name, q.randomTicketId, q.ticketId, q.id, q.email, q.number]
            .some(value => String(value ?? '').toLowerCase().replace(/^#/, '').includes(normalizedSearch));
        return matchesSearch;
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const formatHelpdeskDate = (value?: string | null) => value
        ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    const getStatusStyle = (status: string) => {
        if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-100';
        return 'bg-rose-50 text-rose-700 border-rose-100';
    };

    const columns = [
        {
            header: 'S No.', key: 'id', width: '90px',
            render: (_: number, item: HelpdeskQuery) => (
                <span className="font-bold text-slate-700 tabular-nums">
                    {searchTerm.trim() ? filtered.indexOf(item) + 1 : currentPage * pageSize + filtered.indexOf(item) + 1}
                </span>
            ),
        },
        {
            header: 'User Info', key: 'name', width: '250px',
            render: (_: string, item: HelpdeskQuery) => (
                <div className="min-w-[220px] space-y-1 text-left text-[11px] leading-relaxed">
                    <p><span className="font-bold text-slate-500">Name:</span> {item.name || '—'}</p>
                    <p><span className="font-bold text-slate-500">Email:</span> <span className="break-all">{item.email || '—'}</span></p>
                    <p><span className="font-bold text-slate-500">Mobile:</span> {item.number || '—'}</p>
                    <p><span className="font-bold text-slate-500">Ticket ID:</span> {item.randomTicketId || item.ticketId || item.id}</p>
                    <p><span className="font-bold text-slate-500">Date:</span> {formatHelpdeskDate(item.createdAt)}</p>
                    {/* <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(item.queryStatus)}`}>
                        {item.queryStatus}
                    </span> */}
                </div>
            ),
        },
        {
            header: 'User Query', key: 'query', width: '300px',
            render: (_: string, item: HelpdeskQuery) => (
                <div className="min-w-[260px] space-y-2 text-left">
                    <p className="text-[12px] leading-relaxed text-slate-700 whitespace-pre-wrap">{item.query || '—'}</p>
                    {item.userDocuments?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {item.userDocuments.map((doc) => (
                                <a
                                    key={doc.userDocumentId}
                                    href={doc.filePath || doc.adminUploadedFilePath || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={event => event.stopPropagation()}
                                    className="inline-flex max-w-[180px] items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-emerald-700 hover:border-emerald-300"
                                >
                                    <Paperclip size={10} className="shrink-0" />
                                    <span className="truncate">{doc.fileName || doc.adminUploadedFileName || 'Document'}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Admin & User Replies', key: 'comments', width: '320px',
            render: (_: string | null, item: HelpdeskQuery) => (
                <div className="min-w-[280px] space-y-2 text-[11px]">
                    {item.userPendingQueries?.map(reply => (
                        <div key={reply.id} className="rounded-lg border border-blue-100 bg-blue-50 p-2">
                            <p className="mb-0.5 font-bold text-blue-700">User Reply</p>
                            <p className="whitespace-pre-wrap text-slate-600">{reply.message || reply.pendingComments || '—'}</p>
                        </div>
                    ))}
                    {item.comments && (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2">
                            <p className="mb-0.5 font-bold text-emerald-700">Admin Reply</p>
                            <p className="whitespace-pre-wrap text-slate-600">{item.comments}</p>
                        </div>
                    )}
                    {!item.comments && !item.userPendingQueries?.length && <span className="text-slate-400">No replies yet</span>}
                    {(item.resolvedBy || item.resolvedOn) && (
                        <div className="border-t border-slate-100 pt-2 text-slate-500">
                            <p><span className="font-bold">Resolved By:</span> {item.resolvedBy || '—'}</p>
                            {item.resolvedOn && (
                                <p><span className="font-bold">Resolved On:</span> {formatHelpdeskDate(item.resolvedOn)}</p>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        ...(statusFilter === 'PENDING' ? [{
            header: 'Action', key: 'queryStatus', width: '120px',
            render: (_: string, item: HelpdeskQuery) => (
                <button
                    onClick={event => { event.stopPropagation(); openDetail(item); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"
                >
                     Update
                </button>
            ),
        }] : []),
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="text-emerald-600 shrink-0" size={22} />
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Helpdesk</h1>
                    </div>
                    <p className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-tight">
                        Manage and resolve user support queries
                    </p>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg w-fit">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === tab
                            ? tab === 'COMPLETED'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : tab === 'PENDING'
                                    ? 'bg-white text-amber-600 shadow-sm'
                                    : 'bg-white text-rose-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="flex w-full flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:max-w-md group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500" />
                    <input
                        type="text"
                        placeholder="Search by name, ticket ID, email or phone..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 sm:py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table
                    columns={columns}
                    data={filtered}
                    isLoading={isLoading}
                    emptyMessage="No queries found"
                    className="[&_th]:!text-left [&_td]:!text-left"
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={searchTerm.trim() ? 0 : totalPages}
                    totalElements={searchTerm.trim() ? filtered.length : totalElements}
                    size={pageSize}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Detail / Resolve Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={`Query — ${selectedQuery?.randomTicketId}`}
                size="lg"
                footer={
                    selectedQuery?.queryStatus === 'PENDING' ? (
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                disabled={isResolving}
                                isLoading={isResolving}
                            >
                                <CheckCircle size={14} />
                                Mark as Resolved
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                    )
                }
            >
                {selectedQuery && (
                    <div className="space-y-5">
                        {/* User Info */}
                        {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Name', value: selectedQuery.name },
                                { label: 'Email', value: selectedQuery.email },
                                { label: 'Phone', value: selectedQuery.number },
                                { label: 'Status', value: selectedQuery.queryStatus },
                                { label: 'Created', value: new Date(selectedQuery.createdAt).toLocaleString('en-IN') },
                                { label: 'Resolved By', value: selectedQuery.resolvedBy || '—' },
                                { label: 'Resolved On', value: selectedQuery.resolvedOn ? new Date(selectedQuery.resolvedOn).toLocaleString('en-IN') : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                                    <p className="text-[13px] font-semibold text-slate-700 break-all">{value}</p>
                                </div>
                            ))}
                        </div> */}

                        {/* Query Text */}
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">User Query</p>
                            <p className="text-[13px] text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">{selectedQuery.query}</p>
                        </div>

                        {/* Existing Comments */}
                        {selectedQuery.comments && (
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Admin Response</p>
                                <p className="text-[13px] text-slate-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">{selectedQuery.comments}</p>
                            </div>
                        )}

                        {/* Attachments */}
                        {selectedQuery.userDocuments?.length > 0 && (
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">User Attachments</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {selectedQuery.userDocuments.map((doc) => {
                                        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(doc.fileName || '');
                                        return (
                                            <a
                                                key={doc.userDocumentId}
                                                href={doc.filePath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex flex-col border border-slate-200 rounded-lg overflow-hidden hover:border-emerald-300 transition-all"
                                            >
                                                {isImage ? (
                                                    <div className="aspect-video bg-slate-50 overflow-hidden">
                                                        <img
                                                            src={doc.filePath}
                                                            alt={doc.fileName}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video bg-slate-50 flex items-center justify-center">
                                                        <ImageIcon size={24} className="text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="px-2 py-1.5 flex items-center gap-1.5 bg-white">
                                                    <Paperclip size={10} className="text-slate-400 shrink-0" />
                                                    <span className="text-[11px] text-slate-600 truncate">{doc.fileName}</span>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Upload document / screenshot (admin) */}
                        {selectedQuery.queryStatus === 'PENDING' && (
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Upload Document / Screenshot</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*,.pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={e => setUploadFile(e.target.files?.[0] || null)}
                                    />
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg text-[12px] text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                                    >
                                        <Paperclip size={12} />
                                        {uploadFile ? uploadFile.name : 'Choose file'}
                                    </button>
                                    {uploadFile && (
                                        <Button size="sm" onClick={handleUpload} isLoading={isUploading} disabled={isUploading}>
                                            <Upload size={12} />
                                            Upload
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Resolve Comment */}
                        {selectedQuery.queryStatus === 'PENDING' && (
                            <div>
                                <Textarea
                                    label="Resolution Comment *"
                                    placeholder="Enter your response to resolve this query..."
                                    value={comments}
                                    onChange={e => {
                                        setComments(e.target.value);
                                        if (e.target.value.trim()) setCommentError('');
                                    }}
                                    onBlur={() => {
                                        if (!comments.trim()) setCommentError('Resolution comment is required.');
                                    }}
                                    error={commentError}
                                    required
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Helpdesk;
