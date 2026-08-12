import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

type DialogProps = {
  open: boolean; title: string; description: string; confirmLabel: string; cancelLabel?: string;
  destructive?: boolean; busy?: boolean; children?: React.ReactNode; onConfirm: () => void; onCancel: () => void;
};

export const DeliveryDialog: React.FC<DialogProps> = ({ open, title, description, confirmLabel, cancelLabel = 'Cancel', destructive, busy, children, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => event.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, busy, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="delivery-dialog-title">
      <button type="button" className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" onClick={() => !busy && onCancel()} aria-label="Close dialog" />
      <div className="relative w-full rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${destructive ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'}`}>{destructive ? <AlertTriangle size={21} /> : <CheckCircle2 size={21} />}</div>
        <h2 id="delivery-dialog-title" className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" disabled={busy} onClick={onCancel} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">{cancelLabel}</button>
          <button type="button" disabled={busy} onClick={onConfirm} className={`flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold text-white transition disabled:cursor-wait disabled:opacity-60 ${destructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#A8791F] hover:bg-[#8B6914]'}`}>{busy ? 'Please wait…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};
