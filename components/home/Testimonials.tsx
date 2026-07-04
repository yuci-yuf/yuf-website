"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { SectionHeading } from "@/components/ui/Section";
import { ConfettiDots } from "./FestiveAccents";

function initials(name: string) {
  return name
    .replace(/^(Dr|Shri|Amb|Mr|Mrs|Ms)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Testimonials({
  label,
  title,
  subtitle,
  items,
}: {
  label: string;
  title: string;
  subtitle: string;
  items: Testimonial[];
}) {
  const reduced = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  // Track portraits that fail to load so we fall back to an initials avatar
  // instead of showing a broken image / its alt text.
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const count = items.length;

  const goTo = (next: number, direction: number) => {
    setDir(direction);
    setIndex((next + count) % count);
  };

  // Auto-advance, unless the visitor prefers reduced motion.
  useEffect(() => {
    if (reduced || count <= 1) return;
    const t = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % count);
    }, 7000);
    return () => window.clearInterval(t);
  }, [reduced, count]);

  const active = items[index];

  return (
    <section className="bg-hero-gradient relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Decorative festival glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-festival-purple/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-festival-cyan/25 blur-3xl"
      />
      <ConfettiDots />

      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
        <SectionHeading label={label} title={title} subtitle={subtitle} className="mb-14" invert />

        <div className="mx-auto max-w-none">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/80 p-8 shadow-card backdrop-blur-sm sm:p-12">
            {/* Oversized quotation watermark */}
            <Quote
              aria-hidden
              className="absolute right-6 top-6 h-20 w-20 -scale-x-100 text-primary-100"
              strokeWidth={1.5}
            />

            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={index}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid items-center gap-8 sm:grid-cols-[auto_1fr] sm:gap-10"
              >
                {/* Portrait */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="mx-auto sm:mx-0"
                >
                  <div className="rounded-full bg-gradient-to-br from-festival-blue via-festival-cyan to-festival-purple p-[3px] shadow-lg">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full bg-primary-100 ring-4 ring-surface sm:h-36 sm:w-36">
                      {active.image && !failed[index] ? (
                        <Image
                          src={active.image}
                          alt={active.name}
                          fill
                          sizes="144px"
                          className="object-cover"
                          onError={() =>
                            setFailed((f) => ({ ...f, [index]: true }))
                          }
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center font-display text-4xl font-extrabold text-primary-600">
                          {initials(active.name)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Quote + attribution */}
                <motion.figure
                  initial={reduced ? false : { opacity: 0, x: dir >= 0 ? 24 : -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                  className="flex flex-col gap-4 text-center sm:text-left"
                >
                  <figcaption className="text-xs font-bold uppercase tracking-[0.18em] text-highlight-600">
                    {active.role}
                  </figcaption>
                  <blockquote className="text-lg leading-relaxed text-body sm:text-xl">
                    “{active.quote}”
                  </blockquote>
                  <p className="font-heading text-lg font-bold text-heading">
                    {active.name}
                  </p>
                </motion.figure>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {count > 1 && (
            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => goTo(index - 1, -1)}
                aria-label="Previous testimonial"
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-primary-700 shadow-card transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2.5">
                {items.map((t, i) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => goTo(i, i > index ? 1 : -1)}
                    aria-label={`Show testimonial ${i + 1}`}
                    aria-current={i === index}
                    className={
                      i === index
                        ? "h-2.5 w-6 rounded-full bg-white transition-all"
                        : "h-2.5 w-2.5 rounded-full bg-white/40 transition-all hover:bg-white/70"
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => goTo(index + 1, 1)}
                aria-label="Next testimonial"
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-primary-700 shadow-card transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
