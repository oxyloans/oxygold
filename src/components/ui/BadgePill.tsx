import React from "react";
import { BadgeCheck } from "lucide-react";

type Props = {
  text: string;
};

export default function BadgePill({ text }: Props) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/85">
      <BadgeCheck className="h-4 w-4 text-white/80" />
      {text}
    </span>
  );
}
