import React from "react";

type Props = {
  icon: React.ReactNode;
  label: string;
};

export default function InfoChip({ icon, label }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
      <span className="text-white/80">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
