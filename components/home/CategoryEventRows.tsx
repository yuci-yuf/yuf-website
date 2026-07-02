"use client";

import { useRef } from "react";
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

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by roughly one card width so paging feels natural.
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (group.events.length === 0) return null;

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

      {/* ── Horizontal scroll strip ── */}
      <div
        ref={scrollRef}
        className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-3 py-3"
      >
        {group.events.map((event) => (
          <div
            key={event.id}
            className="flex w-70 shrink-0 snap-start *:h-full sm:w-80"
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
