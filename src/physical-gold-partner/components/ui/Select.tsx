import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    options: SelectOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
    label,
    options,
    value,
    onChange,
    multiple = false,
    placeholder = 'Select...',
    required,
    disabled,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = multiple
        ? (value as string[])
        : value ? [value as string] : [];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (val: string) => {
        if (multiple) {
            const curr = value as string[];
            const next = curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val];
            onChange(next);
        } else {
            onChange(val);
            setOpen(false);
        }
    };

    const removeTag = (val: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange((value as string[]).filter(v => v !== val));
    };

    const displayLabel = (val: string) =>
        options.find(o => o.value === val)?.label ?? val;

    return (
        <div className="space-y-1" ref={ref}>
            {label && (
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen(o => !o)}
                    className={`w-full min-h-[38px] px-3 py-2 text-left text-sm rounded-lg border bg-white transition-all flex items-center gap-2 flex-wrap
                        ${open
                            ? 'border-emerald-400 ring-2 ring-emerald-100'
                            : 'border-slate-200 hover:border-slate-300'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
                    `}
                >
                    <span className="flex-1 flex flex-wrap gap-1.5">
                        {selected.length === 0 ? (
                            <span className="text-slate-400">{placeholder}</span>
                        ) : multiple ? (
                            selected.map(val => (
                                <span
                                    key={val}
                                    className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2 py-0.5 rounded-md"
                                >
                                    {displayLabel(val)}
                                    <X size={10} className="cursor-pointer hover:text-red-500 transition-colors" onClick={e => removeTag(val, e)} />
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-800">{displayLabel(selected[0])}</span>
                        )}
                    </span>
                    <ChevronDown
                        size={14}
                        className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                </button>

                {open && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                        <ul className="max-h-52 overflow-y-auto py-1">
                            {options.map(opt => {
                                const isSelected = selected.includes(opt.value);
                                return (
                                    <li
                                        key={opt.value}
                                        onClick={() => toggle(opt.value)}
                                        className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors
                                            ${isSelected
                                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        {opt.label}
                                        {isSelected && <Check size={13} className="text-emerald-500 flex-shrink-0" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Select;