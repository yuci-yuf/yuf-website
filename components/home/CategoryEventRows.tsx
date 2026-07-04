"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import type { EventItem } from "@/types";
import { CATEGORY_STYLE, categoryStyle } from "@/lib/category-style";
import { getEventLocations } from "@/lib/event-groups";

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

/* ── Fixture card ──
   Image-forward "match ticket": a date tab clipped to the photo, a frosted
   info strip with the venue + title, on the festival gradient. Home-only. */
function splitDate(date?: string) {
  if (!date) return null;
  const m = /(\d{1,2})[a-z]*\s+([A-Za-z]+)/.exec(date);
  return m ? { day: m[1], month: m[2].slice(0, 3).toUpperCase() } : null;
}

function FixtureCard({ event }: { event: EventItem }) {
  const st = categoryStyle(event.category);

  const locations = getEventLocations(event);
  const multi = locations.length > 1;
  const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
  const metaPlace = uniq(
    locations.map((l) => (l.district || l.venue || "").trim()),
  ).join(", ");
  const tab = splitDate(locations[0]?.date ?? event.date);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl shadow-xl shadow-primary-950/40 ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      {/* Photo */}
      {event.image ? (
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="20rem"
          className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `linear-gradient(135deg, ${st.from}, ${st.to})` }}
        />
      )}

      {/* Scrim */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-950/15 to-primary-950/10"
      />

      {/* Date tab — the fixture "stub" */}
      {tab && (
        <span className="absolute left-4 top-4 z-10 flex flex-col items-center rounded-xl bg-white px-2.5 py-1.5 leading-none shadow-lg">
          <span className="font-display text-lg font-extrabold text-primary-700">
            {tab.day}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary-500">
            {tab.month}
          </span>
        </span>
      )}

      {/* Multi-location badge */}
      {multi && (
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-800 shadow-sm backdrop-blur-sm">
          <MapPin size={12} style={{ color: st.accent }} />
          {locations.length} locations
        </span>
      )}

      {/* Frosted info strip */}
      <div className="relative z-10 m-3 flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur-md">
        {/* Category-colored hairline ties the card to its discipline */}
        <span
          aria-hidden
          className="h-0.5 w-8 rounded-full"
          style={{ backgroundColor: st.accent }}
        />
        <h3 className="font-heading text-lg font-bold leading-tight text-white">
          {event.title}
        </h3>
        {metaPlace && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
            <MapPin size={13} className="shrink-0 text-highlight-300" />
            <span className="line-clamp-1">{metaPlace}</span>
          </span>
        )}
        <span className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors group-hover:text-highlight-300">
          View details
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
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
    const SPEED = 0.4; // px per frame (~15px/s at 60fps)
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
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2.5">
              <h3 className="font-heading text-xl font-bold text-white transition-colors group-hover:text-highlight-300 sm:text-2xl">
                {group.label}
              </h3>
              <span className="text-sm font-medium text-white/55">
                {group.events.length} event{group.events.length === 1 ? "" : "s"}
              </span>
            </div>
            <span
              aria-hidden
              className="h-0.5 w-10 rounded-full"
              style={{ backgroundColor: st?.accent }}
            />
          </div>
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
        className="no-scrollbar -mx-3 flex gap-5 overflow-x-auto px-3 py-3 [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]"
      >
        {loopEvents.map((event, i) => (
          <div
            key={`${event.id}-${i}`}
            className="w-64 shrink-0 sm:w-72"
            aria-hidden={i >= group.events.length}
          >
            <FixtureCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
