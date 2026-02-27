import React from "react";

export default function WaveLines() {
  return (
    <svg
      width="560"
      height="560"
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M80 220 C 170 120, 300 120, 420 220 C 520 300, 520 420, 420 500"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1.2"
      />
      <path
        d="M120 240 C 200 150, 320 150, 430 240 C 520 310, 520 420, 430 490"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1.2"
      />
      <path
        d="M160 260 C 230 180, 340 180, 440 260 C 520 320, 520 420, 440 480"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1.2"
      />
      <path
        d="M160 140 C 250 90, 360 90, 460 160"
        stroke="rgba(212,175,55,0.18)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
