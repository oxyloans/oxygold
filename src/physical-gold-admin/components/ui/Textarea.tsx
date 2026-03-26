import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, error, helperText, className = '', ...props }) => {
    return (
        <div className={`mb-3 flex flex-col ${className}`}>
            {label && <label className="text-[11px] font-semibold mb-1 text-slate-500 uppercase tracking-tight">{label}</label>}
            <textarea
                className={`px-3 py-1.5 border rounded-md text-[13px] transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                {...props}
            />
            {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
            {!error && helperText && <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>}
        </div>
    );
};

export default Textarea;
