import React from "react";

interface LoadingSpinnerProps {
    /** Visual size of the spinner */
    size?: "sm" | "md" | "lg";
    /** Additional Tailwind classes for wrapper */
    className?: string;
}

const SIZE_MAP = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
};

/**
 * Reusable gold-themed loading spinner.
 * Wraps the animated ring in a flex-centre container.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    className = "",
}) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <span
                className={`block rounded-full border-yellow-300/30 border-t-yellow-400 animate-spin ${SIZE_MAP[size]}`}
                aria-label="Loading…"
                role="status"
            />
        </div>
    );
};

export default LoadingSpinner;
