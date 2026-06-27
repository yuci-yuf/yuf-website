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

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const value = useCountUp(stat.number, run);
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="font-heading text-4xl font-bold text-white sm:text-5xl">
        {value.toLocaleString("en-IN")}
        <span className="text-accent-400">{stat.suffix}</span>
      </span>
      <span className="text-sm font-medium uppercase tracking-wide text-primary-200">
        {stat.label}
      </span>
    </div>
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
    <section className="bg-primary-900 py-16">
      <Container>
        <div
          ref={ref}
          className="grid grid-cols-2 gap-10 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} run={run} />
          ))}
        </div>
      </Container>
    </section>
  );
}
