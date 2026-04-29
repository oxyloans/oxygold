import React, { useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-500",
      textColor: "text-emerald-800",
      iconColor: "text-emerald-500",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-rose-50",
      borderColor: "border-rose-500",
      textColor: "text-rose-800",
      iconColor: "text-rose-500",
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-500",
      textColor: "text-amber-800",
      iconColor: "text-amber-500",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500",
      textColor: "text-blue-800",
      iconColor: "text-blue-500",
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div
      className={`fixed top-24 right-4 z-[9999] flex items-center gap-3 ${bgColor} ${textColor} px-4 py-3 rounded-lg border-l-4 ${borderColor} shadow-lg animate-in slide-in-from-right-5 duration-300 min-w-[300px] max-w-md`}
    >
      <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
