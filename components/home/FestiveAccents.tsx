"use client";

import { Sparkles } from "lucide-react";

/**
 * Festival section eyebrow — a small uppercase label with a sparkle, in the
 * warm highlight color. Keeps every home section's kicker consistent.
 */
export function FestiveEyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-highlight-600 ${className}`}
    >
      <Sparkles size={15} className="text-highlight-500" />
      {children}
    </span>
  );
}

/**
 * Scattered festival confetti dots, gently floating. Fills the nearest
 * positioned ancestor (give the section `relative overflow-hidden`). Purely
 * decorative.
 */
const DOTS = [
  "left-[6%] top-[14%] bg-highlight-500",
  "left-[14%] top-[68%] bg-festival-cyan",
  "left-[40%] top-[8%] bg-festival-purple",
  "right-[10%] top-[20%] bg-highlight-400",
  "right-[20%] top-[72%] bg-festival-cyan",
  "right-[38%] top-[12%] bg-festival-purple",
  "left-[24%] bottom-[10%] bg-highlight-500",
  "right-[6%] bottom-[16%] bg-festival-purple",
];

export function ConfettiDots({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {DOTS.map((c, i) => (
        <span
          key={i}
          className={`absolute h-2 w-2 animate-float rounded-full ${c}`}
          style={{ animationDelay: `${i * 0.5}s`, opacity: 0.55 }}
        />
      ))}
    </div>
  );
}

/**
 * A pair of soft gradient blobs (orange + purple) for section corners — adds
 * festival warmth behind content without competing with it.
 */
export function FestiveGlows() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-highlight-400/15 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-festival-purple/15 blur-3xl" />
    </div>
  );
}
