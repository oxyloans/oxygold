import React from "react";
import { Minus, Plus } from "lucide-react";

export interface QuantitySelectorProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    quantity,
    onIncrease,
    onDecrease,
}) => {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={onDecrease}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] transition hover:border-[#1A1A1A] hover:bg-[#F9F7F3]"
            >
                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
            <span className="w-4 text-center text-[13px] font-bold text-[#1A1A1A]">
                {quantity}
            </span>
            <button
                type="button"
                onClick={onIncrease}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] transition hover:border-[#1A1A1A] hover:bg-[#F9F7F3]"
            >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
        </div>
    );
};
