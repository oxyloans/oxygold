import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/30 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
            <div
                className={`bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col w-full transition-all animate-in zoom-in-95 duration-200 ${size === 'sm' ? 'max-w-md' :
                    size === 'md' ? 'max-w-xl' :
                        size === 'lg' ? 'max-w-3xl' : 'max-w-5xl'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    {title && <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>}
                    <button className="p-1 hover:bg-slate-50 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {children}
                </div>
                {footer && (
                    <div className="px-4 py-3 border-t border-slate-50 flex justify-end gap-2 bg-slate-50/30 rounded-b-lg">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
