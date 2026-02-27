import React from "react";

export default function MiniCircuit() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M40 40 H150 V90 H90 V160"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
      />
      <path d="M70 55 H135" stroke="rgba(212,175,55,0.22)" strokeWidth="2" />
      <circle cx="40" cy="40" r="6" fill="rgba(212,175,55,0.25)" />
      <circle cx="150" cy="40" r="6" fill="rgba(91,46,255,0.25)" />
      <circle cx="90" cy="160" r="6" fill="rgba(212,175,55,0.18)" />
    </svg>
  );
}
