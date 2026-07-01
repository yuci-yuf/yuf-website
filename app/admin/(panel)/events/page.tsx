"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/AdminUI";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getAdminEvents,
  getAdminCategories,
  getRegistrations,
  deleteEvent,
} from "@/lib/admin-data";
import type { EventCategoryDoc, EventItem } from "@/types";

const ALL = "All";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<EventCategoryDoc[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managingCats, setManagingCats] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

  function load() {
    return Promise.all([
      getAdminEvents(),
      getAdminCategories(),
      getRegistrations(),
    ])
      .then(([evs, cats, regs]) => {
        setEvents(evs);
        setCategories(cats);
        const counts: Record<string, number> = {};
        for (const r of regs) {
          if (r.eventId) counts[r.eventId] = (counts[r.eventId] ?? 0) + 1;
        }
        setRegCounts(counts);
        setError(null);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load events.");
      });
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category names: prefer the managed list, but include any categories that
  // existing events use so nothing is unselectable.
  const categoryNames = useMemo(() => {
    const fromCats = categories.map((c) => c.name);
    const fromEvents = events.map((e) => e.category).filter(Boolean);
    return Array.from(new Set([...fromCats, ...fromEvents]));
  }, [categories, events]);

  // Number of events per category name — shown in the Manage Categories modal.
  const categoryEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      if (e.category) counts[e.category] = (counts[e.category] ?? 0) + 1;
    }
    return counts;
  }, [events]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events
      .filter((e) => activeCategory === ALL || e.category === activeCategory)
      .filter(
        (e) =>
          !term ||
          e.title.toLowerCase().includes(term) ||
          (e.venue ?? "").toLowerCase().includes(term),
      )
      .sort((a, b) => a.order - b.order);
  }, [events, activeCategory, search]);

  async function handleDelete(ev: EventItem) {
    if (!confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    try {
      await deleteEvent(ev.id);
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete event.");
    }
  }

  return (
    <>
      <PageHeader
        title="Events"
        description="Create, edit, and remove festival events"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setManagingCats(true)}
            >
              <Tag size={16} />
              Categories
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin/events/new">
                <Plus size={16} />
                New Event
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        {/* Search + category filter tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1">
            {[ALL, ...categoryNames].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-primary-600 text-white"
                    : "text-text-muted hover:bg-surface-alt hover:text-text",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : events.length === 0 ? (
          <EmptyState message="No events yet. Create your first event to get started." />
        ) : filtered.length === 0 ? (
          <EmptyState message="No events match your search." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-205 border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <th className="px-5 py-3.5">Event</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Venue</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Registrations</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((e) => (
                    <tr
                      key={e.id}
                      className="align-middle transition-colors hover:bg-surface-alt/50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-text">{e.title}</p>
                        {typeof e.registrationFee === "number" && (
                          <p className="text-xs text-text-muted">
                            ₹{e.registrationFee.toLocaleString("en-IN")}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-text-muted">
                        {e.date ? (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} className="shrink-0" />
                            {e.date}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-text-muted">
                        {e.venue ? (
                          <span className="inline-flex max-w-55 items-center gap-1.5">
                            <MapPin size={13} className="shrink-0" />
                            <span className="truncate">{e.venue}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            e.registrationOpen === false ? "cancelled" : "confirmed"
                          }
                        />
                      </td>
                      <td className="px-5 py-4 text-center">
                        {(() => {
                          const count = regCounts[e.id] ?? 0;
                          const full =
                            typeof e.registrationLimit === "number" &&
                            count >= e.registrationLimit;
                          return (
                            <Link
                              href="/admin/registrations"
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                                full
                                  ? "bg-error/10 text-error hover:bg-error/20"
                                  : "bg-surface-alt text-text hover:bg-primary-50 hover:text-primary-700",
                              )}
                              title={
                                typeof e.registrationLimit === "number"
                                  ? `${count} of ${e.registrationLimit} spots filled`
                                  : `${count} registrations`
                              }
                            >
                              <Users size={13} />
                              {typeof e.registrationLimit === "number"
                                ? `${count}/${e.registrationLimit}`
                                : count}
                              {full && " · Full"}
                            </Link>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/events/${e.id}/edit`}
                            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-primary-700"
                            aria-label={`Edit ${e.title}`}
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(e)}
                            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                            aria-label={`Delete ${e.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {managingCats && (
        <CategoryManager
          eventCounts={categoryEventCounts}
          onClose={() => setManagingCats(false)}
          onChanged={load}
        />
      )}
    </>
  );
}
