"use client";

import { useEffect, useRef, useState } from "react";
import type { Stat } from "@/types";
import { Container } from "@/components/ui/Container";

function useCountUp(target: number, run: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);

  return value;
}

function StatItem({
  stat,
  run,
  isLast,
}: {
  stat: Stat;
  run: boolean;
  isLast: boolean;
}) {
  const value = useCountUp(stat.number, run);
  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-heading text-5xl font-extrabold text-white sm:text-6xl">
          {value.toLocaleString("en-IN")}
          <span className="text-accent-400">{stat.suffix}</span>
        </span>
        <span className="text-sm font-medium uppercase tracking-wider text-primary-300">
          {stat.label}
        </span>
      </div>
      {/* Vertical divider between stats — hidden on mobile grid */}
      {!isLast && (
        <div
          className="hidden h-16 w-px self-center bg-white/10 lg:block"
          aria-hidden
        />
      )}
    </>
  );
}

export function StatsCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 py-20">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(40rem 20rem at 50% 50%, rgba(37,99,235,0.3), transparent)",
        }}
        aria-hidden
      />
      <Container className="relative">
        <div
          ref={ref}
          className="grid grid-cols-2 items-center gap-10 lg:flex lg:justify-between"
        >
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              stat={stat}
              run={run}
              isLast={i === stats.length - 1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
