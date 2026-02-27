import React from "react";

export default function RingLines() {
  return (
    <svg
      width="520"
      height="520"
      viewBox="0 0 520 520"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="260"
        cy="260"
        r="210"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
      />
      <circle
        cx="260"
        cy="260"
        r="170"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
      />
      <circle
        cx="260"
        cy="260"
        r="130"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
      />
      <circle
        cx="260"
        cy="260"
        r="90"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1"
      />
      <path
        d="M260 50 A210 210 0 0 1 450 210"
        stroke="rgba(212,175,55,0.22)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M70 310 A210 210 0 0 0 260 470"
        stroke="rgba(91,46,255,0.20)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
