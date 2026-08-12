import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface Column<T> {
    header: string;
    key: keyof T | string;
    render?: (value: any, item: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    className?: string;
}

function Table<T>({
    columns,
    data,
    isLoading,
    onRowClick,
    emptyMessage = 'No data found',
    className = '',
}: TableProps<T>) {
    return (
        <div className={`overflow-x-auto rounded-lg border border-slate-100 bg-white ${className}`}>
            <table className="w-full text-center border-collapse">
                <thead className="bg-[#FBF7EC]">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                style={{ width: column.width, textAlign: 'center' }}
                                className="px-4 py-3 text-[10px] font-bold text-[#8B6914] uppercase tracking-wider border-b border-[#E8D8A8]"
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-8 text-center">
                                <LoadingSpinner size="sm" />
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-slate-400 font-medium">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick?.(item)}
                                className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50/50' : ''}`}
                            >
                                {columns.map((column, colIndex) => {
                                    const value = (item as any)[column.key];
                                    return (
                                        <td
                                            key={colIndex}
                                            style={{ textAlign: 'center' }}
                                            className="px-4 py-3 text-[13px] text-slate-600 font-medium"
                                        >
                                            {column.render ? column.render(value, item) : value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
