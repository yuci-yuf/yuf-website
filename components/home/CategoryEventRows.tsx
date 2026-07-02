"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventItem } from "@/types";
import { EventCard } from "@/components/public/EventCard";
import { CATEGORY_STYLE } from "@/lib/category-style";

export interface CategoryGroup {
  /** The real category key used for filtering/links (e.g. "Arts & Culturals"). */
  key: string;
  /** The label shown to users (e.g. "Non Technical"). */
  label: string;
  events: EventItem[];
}

export function CategoryEventRows({ groups }: { groups: CategoryGroup[] }) {
  return (
    <div className="flex flex-col gap-14">
      {groups.map((group) => (
        <CategoryRow key={group.key} group={group} />
      ))}
    </div>
  );
}

function CategoryRow({ group }: { group: CategoryGroup }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const st = CATEGORY_STYLE[group.key];
  const Icon = st?.icon;

  // Pauses the auto-scroll while the user hovers or is manually paging.
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseAuto = (durationMs = 0) => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    if (durationMs > 0) {
      resumeTimer.current = setTimeout(() => {
        pausedRef.current = false;
      }, durationMs);
    }
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    // Manual paging: pause auto-scroll briefly so it doesn't fight the user.
    pauseAuto(2000);
    // Scroll by roughly one card width so paging feels natural.
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  // Endless auto-scroll. Cards are rendered twice, so once we pass the first
  // copy's width we snap back by exactly that width for a seamless loop.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const SPEED = 0.40; // px per frame (~15px/s at 60fps)
    // Accumulate as a float — writing sub-pixel values to scrollLeft rounds
    // down each frame and would otherwise never advance.
    let pos = el.scrollLeft;

    const tick = () => {
      if (!pausedRef.current) {
        pos += SPEED;
        // The duplicated set starts at half the total scroll width.
        const half = el.scrollWidth / 2;
        if (half > 0 && pos >= half) pos -= half;
        el.scrollLeft = pos;
      } else {
        // Stay in sync if the user manually scrolled while paused.
        pos = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  if (group.events.length === 0) return null;

  // Duplicate events to create the seamless loop.
  const loopEvents = [...group.events, ...group.events];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Category header ── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/events?category=${encodeURIComponent(group.key)}`}
          className="group flex items-center gap-3"
        >
          {Icon && (
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md">
              <Icon size={20} style={{ color: st.accent }} />
            </span>
          )}
          <h3 className="font-heading text-xl font-bold text-white transition-colors group-hover:text-highlight-300 sm:text-2xl">
            {group.label}
          </h3>
        </Link>

        {/* Scroll controls — hidden on touch where native swipe is better. */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Horizontal scroll strip (endless auto-scroll) ── */}
      <div
        ref={scrollRef}
        onMouseEnter={() => pauseAuto()}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onTouchStart={() => pauseAuto()}
        onTouchEnd={() => pauseAuto(2000)}
        className="no-scrollbar -mx-3 flex gap-5 overflow-x-auto px-3 py-3"
      >
        {loopEvents.map((event, i) => (
          <div
            key={`${event.id}-${i}`}
            className="flex w-70 shrink-0 *:h-full sm:w-80"
            aria-hidden={i >= group.events.length}
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
