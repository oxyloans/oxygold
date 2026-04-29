import React from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onChange,
  required = false,
  error,
}) => {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#8A8A8A] mb-1">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] bg-white outline-none focus:ring-2 transition ${
            error
              ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/10"
              : "border-[#E8E0D5] focus:border-[#8B6914] focus:ring-[#8B6914]/10"
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A] pointer-events-none" />
      </div>
      {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
};

export default Dropdown;
