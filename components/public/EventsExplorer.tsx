"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/types";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

const ALL = "All Events";

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

  return (
    <div id="events-list" className="flex flex-col gap-10">
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
