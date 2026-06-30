"use client";

import { useMemo, useState } from "react";
import { Search, X, CalendarX } from "lucide-react";
import type { EventItem, EventStatus } from "@/types";
import { EventCard } from "./EventCard";
import { categoryStyle } from "@/lib/category-style";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "All Events";

// Push past events to the end so the upcoming festival lineup leads.
const STATUS_RANK: Record<EventStatus, number> = { ongoing: 0, upcoming: 1, past: 2 };
function statusRank(e: EventItem) {
  return STATUS_RANK[e.status ?? "upcoming"];
}

export function EventsExplorer({
  events,
  categoryOrder,
}: {
  events: EventItem[];
  categoryOrder: EventItem["category"][];
}) {
  const [active, setActive] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  // Count per discipline across the full set (stable, drives the pill badges).
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return m;
  }, [events]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    const matches = (e: EventItem) =>
      (active === ALL || e.category === active) &&
      (!q ||
        e.title.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q));
    return events.filter(matches);
  }, [events, active, q]);

  // Under "All", split into color-coded discipline bands so a 36-event wall
  // becomes a few scannable groups. A specific tab shows one flat grid.
  const bands = useMemo(() => {
    const order = (a: EventItem, b: EventItem) => statusRank(a) - statusRank(b);
    if (active !== ALL) {
      return [{ category: active, items: [...visible].sort(order) }];
    }
    return categoryOrder
      .map((category) => ({
        category,
        items: visible.filter((e) => e.category === category).sort(order),
      }))
      .filter((b) => b.items.length > 0);
  }, [active, visible, categoryOrder]);

  const tabs = useMemo(() => [ALL, ...categoryOrder], [categoryOrder]);

  return (
    <div id="events-list" className="flex flex-col gap-10">
      {/* ── Controls: search + discipline rail + summary ── */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-500"
            aria-hidden
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events or venues…"
            aria-label="Search events"
            className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-11 text-sm text-text shadow-card outline-none transition-colors placeholder:text-text-muted focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Mobile: a themed dropdown instead of the wrapping pill rail. */}
        <div className="w-full max-w-md sm:hidden">
          <Select value={active} onValueChange={setActive}>
            <SelectTrigger
              aria-label="Filter events by category"
              className="h-12 w-full rounded-full border-border bg-surface px-5 text-sm font-semibold text-text shadow-card focus-visible:ring-primary-200"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value={ALL}>All Events ({events.length})</SelectItem>
              {categoryOrder.map((c) => (
                <SelectItem key={c} value={c}>
                  {c} ({counts.get(c) ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: discipline pill rail — the page's legend and filter in one. */}
        <div className="hidden flex-wrap justify-center gap-2.5 sm:flex">
          {tabs.map((tab) => {
            const isAll = tab === ALL;
            const st = isAll ? null : categoryStyle(tab);
            const isActive = active === tab;
            const count = isAll ? events.length : counts.get(tab) ?? 0;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                aria-pressed={isActive}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
                style={
                  isActive
                    ? {
                        backgroundColor: st?.accent ?? "#11536e",
                        borderColor: st?.accent ?? "#11536e",
                        color: "#fff",
                        boxShadow: `0 6px 18px -6px ${st?.accent ?? "#11536e"}`,
                      }
                    : {
                        backgroundColor: st?.soft ?? "rgba(17,83,110,0.08)",
                        borderColor: "transparent",
                        color: "#1f2a5e",
                      }
                }
              >
                {isAll ? "All Events" : tab}
                <span
                  className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums"
                  style={
                    isActive
                      ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                      : { backgroundColor: "rgba(255,255,255,0.7)", color: "#1f2a5e" }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-text-muted">
          {visible.length === 0
            ? "No events match your search"
            : `Showing ${visible.length} of ${events.length} events`}
          {active !== ALL && ` in ${active}`}
          {q && ` for "${query}"`}
        </p>
      </div>

      {/* ── Results ── */}
      {bands.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-surface/60 px-8 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <CalendarX size={26} />
          </span>
          <p className="font-heading text-lg font-bold text-heading">
            Nothing here yet
          </p>
          <p className="text-sm text-text-muted">
            No events match that search. Try another keyword, or clear your
            filters to see the full lineup.
          </p>
          <button
            type="button"
            onClick={() => {
              setActive(ALL);
              setQuery("");
            }}
            className="mt-1 inline-flex h-11 items-center rounded-full bg-primary-600 px-6 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-700"
          >
            Show all events
          </button>
        </div>
      ) : (
        bands.map((band) => {
          const st = categoryStyle(band.category);
          return (
            <section key={band.category} className="flex flex-col gap-6">
              {active === ALL && (
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-xl font-bold text-heading sm:text-2xl">
                    {band.category}
                  </h3>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums"
                    style={{ backgroundColor: st.soft, color: st.accent }}
                  >
                    {band.items.length}
                  </span>
                  <span
                    aria-hidden
                    className="h-px flex-1"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${st.accent}, transparent)`,
                    }}
                  />
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {band.items.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
