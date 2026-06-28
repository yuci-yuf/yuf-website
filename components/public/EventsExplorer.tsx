"use client";

import { useMemo, useState } from "react";
import type { EventItem, EventStatus } from "@/types";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

const ALL = "All Events";

const STATUS_GROUPS: { status: EventStatus; label: string }[] = [
  { status: "ongoing", label: "Ongoing Events" },
  { status: "upcoming", label: "Upcoming Events" },
  { status: "past", label: "Past Events" },
];

export function EventsExplorer({
  events,
  categoryOrder,
}: {
  events: EventItem[];
  categoryOrder: EventItem["category"][];
}) {
  const [active, setActive] = useState<string>(ALL);

  const tabs = useMemo(() => [ALL, ...categoryOrder], [categoryOrder]);

  const visible = useMemo(
    () => (active === ALL ? events : events.filter((e) => e.category === active)),
    [active, events],
  );

  // Group the visible events by scheduling status, keeping only non-empty
  // groups in a stable display order (ongoing → upcoming → past).
  const groups = useMemo(
    () =>
      STATUS_GROUPS.map((g) => ({
        ...g,
        items: visible.filter((e) => (e.status ?? "upcoming") === g.status),
      })).filter((g) => g.items.length > 0),
    [visible],
  );

  return (
    <div id="events-list" className="flex flex-col gap-12">
      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              active === tab
                ? "bg-primary-600 text-white shadow-card"
                : "border border-border bg-surface text-text-muted hover:border-primary-300 hover:text-primary-700",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {groups.map((group) => (
        <div key={group.status} className="flex flex-col gap-6">
          {/* Only label groups when more than one status is present, to avoid a
              redundant single heading. */}
          {groups.length > 1 && (
            <h3 className="font-heading text-xl font-bold text-text">
              {group.label}
            </h3>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
