import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalElements?: number;
    size?: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalElements,
    size = 10
}) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1.5 min-w-[32px] rounded-md text-[13px] font-semibold transition-all ${currentPage === i
                            ? 'bg-[#8B6914] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100 sm:px-6">
            <div className="flex items-center flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="relative ml-3 inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    {totalElements !== undefined && (
                        <p className="text-[13px] text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-800">{currentPage * size + 1}</span> to{' '}
                            <span className="font-bold text-slate-800">
                                {Math.min((currentPage + 1) * size, totalElements)}
                            </span>{' '}
                            of <span className="font-bold text-slate-800">{totalElements}</span> results
                        </p>
                    )}
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px gap-1" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="relative inline-flex items-center px-2 py-1.5 rounded-md border border-transparent text-slate-400 hover:text-[#8B6914] hover:bg-[#FBF7EC] transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex gap-1 items-center mx-1">
                            {renderPageNumbers()}
                        </div>

                        <button
                            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="relative inline-flex items-center px-2 py-1.5 rounded-md border border-transparent text-slate-400 hover:text-[#8B6914] hover:bg-[#FBF7EC] transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight size={18} />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
