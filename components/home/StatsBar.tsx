"use client";

import { useEffect, useRef, useState } from "react";
import type { Stat } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";
import { Users, MapPin, Building2, Globe } from "lucide-react";

const icons = [Users, MapPin, Building2, Globe];

function useCountUp(target: number, run: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

function StatCell({ stat, run, index }: { stat: Stat; run: boolean; index: number }) {
  const value = useCountUp(stat.number, run);
  const Icon = icons[index % icons.length];
  return (
    <div className="flex items-center gap-4 px-2">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Icon size={22} />
      </div>
      <div>
        <span className="font-display text-3xl font-extrabold text-gray-900">
          {value.toLocaleString("en-IN")}
          <span className="text-primary-500">{stat.suffix}</span>
        </span>
        <p className="text-sm text-gray-400">{stat.label}</p>
      </div>
    </div>
  );
}

export function StatsBar({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setRun(true); obs.disconnect(); }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <FadeUp>
      <section className="py-16">
        <Container>
          <div
            ref={ref}
            className="mx-auto grid max-w-5xl grid-cols-2 gap-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm lg:grid-cols-4 lg:divide-x lg:divide-gray-100 lg:gap-0 lg:p-10"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center justify-center">
                <StatCell stat={stat} run={run} index={i} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </FadeUp>
  );
}
