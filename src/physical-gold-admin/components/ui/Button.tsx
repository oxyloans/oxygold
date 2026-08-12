import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center cursor-pointer font-semibold transition-all gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed rounded-md';

    const variantClasses = {
        primary: 'bg-[#8B6914] text-white hover:bg-[#74570F] shadow-sm shadow-[#D4AF37]/20',
        secondary: 'bg-[#D4AF37] text-[#3F310B] hover:bg-[#C49D2E]',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
        outline: 'border border-[#E8D8A8] bg-white text-[#74570F] hover:bg-[#FBF7EC]',
    };

    const sizeClasses = {
        sm: 'px-2.5 py-1 text-[11px]',
        md: 'px-4 py-1.5 text-[13px]',
        lg: 'px-6 py-2 text-[14px]',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            {children}
        </button>
    );
};

export default Button;
