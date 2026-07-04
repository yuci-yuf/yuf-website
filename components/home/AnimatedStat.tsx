"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Counts a stat up from 0 on mount. Accepts values like "5K+", "28+", "100+" —
 * the leading integer animates while the suffix (K+, +, %) stays fixed.
 * Respects prefers-reduced-motion (shows the final value immediately).
 */
export function AnimatedStat({
  value,
  className,
  duration = 1500,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const match = /^(\d+)(.*)$/.exec(value.trim());
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : value;

  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!match) return;
    let raf = 0;

    // Reduced motion (or a flip to it after mount) → jump straight to target.
    if (reduced) {
      raf = requestAnimationFrame(() => setN(target));
      return () => cancelAnimationFrame(raf);
    }

    // Count up from 0. Starting each run fresh (state updates live in the rAF
    // callback) keeps React Strict Mode's mount→cleanup→mount cycle from
    // leaving the counter stuck.
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // `value` (a stable string) stands in for `match`, which is a fresh object
    // every render and would otherwise restart the animation on each frame.
  }, [reduced, target, duration, value]);

  return (
    <span className={className}>
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
