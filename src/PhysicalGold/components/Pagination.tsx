import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalElements?: number;
    pageSize?: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalElements,
    pageSize,
}) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 2) {
                for (let i = 0; i < 3; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages - 1);
            } else if (currentPage >= totalPages - 3) {
                pages.push(0);
                pages.push("...");
                for (let i = totalPages - 3; i < totalPages; i++) pages.push(i);
            } else {
                pages.push(0);
                pages.push("...");
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push("...");
                pages.push(totalPages - 1);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between border-t border-[#E8E0D5] pt-4 mt-4">
            {totalElements !== undefined && pageSize !== undefined && (
                <p className="text-[11px] text-[#8A8A8A]">
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} orders
                </p>
            )}

            <div className="flex items-center gap-2 ml-auto">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E8E0D5] text-[#8A8A8A] hover:bg-[#F5F2EE] hover:text-[#1A1A1A] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-[#8A8A8A]">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg text-[12px] font-medium transition ${
                                currentPage === page
                                    ? "bg-[#8B6914] text-white"
                                    : "border border-[#E8E0D5] text-[#8A8A8A] hover:bg-[#F5F2EE] hover:text-[#1A1A1A]"
                            }`}
                        >
                            {(page as number) + 1}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E8E0D5] text-[#8A8A8A] hover:bg-[#F5F2EE] hover:text-[#1A1A1A] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
