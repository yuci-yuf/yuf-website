"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Animation direction. Default: "up" */
  direction?: "up" | "left" | "right" | "scale";
  /** Delay in ms before the animation starts */
  delay?: number;
  /** IntersectionObserver threshold (0–1). Default: 0.15 */
  threshold?: number;
}

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      el.classList.remove("reveal-hidden");
      el.classList.add("reveal-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              el.classList.remove("reveal-hidden");
              el.classList.add("reveal-visible");
            }, delay);
          } else {
            el.classList.remove("reveal-hidden");
            el.classList.add("reveal-visible");
          }
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={cn("reveal-hidden", className)}
      data-direction={direction !== "up" ? direction : undefined}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
