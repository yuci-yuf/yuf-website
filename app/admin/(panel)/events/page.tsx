"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/AdminUI";
import { EventForm } from "@/components/admin/EventForm";
import { Button } from "@/components/ui/Button";
import {
  getAdminEvents,
  getAdminCategories,
  createEvent,
  updateEvent,
  deleteEvent,
  type EventInput,
} from "@/lib/admin-data";
import type { EventCategoryDoc, EventItem } from "@/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<EventCategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);

  function reload() {
    Promise.all([getAdminEvents(), getAdminCategories()])
      .then(([evs, cats]) => {
        setEvents(evs);
        setCategories(cats);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load events.");
      });
  }

  useEffect(() => {
    Promise.all([getAdminEvents(), getAdminCategories()])
      .then(([evs, cats]) => {
        setEvents(evs);
        setCategories(cats);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load events.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Category names: prefer the managed list, but include any categories that
  // existing events use so nothing is unselectable.
  const categoryNames = useMemo(() => {
    const fromCats = categories.map((c) => c.name);
    const fromEvents = events.map((e) => e.category).filter(Boolean);
    return Array.from(new Set([...fromCats, ...fromEvents]));
  }, [categories, events]);

  const grouped = useMemo(() => {
    const order = categoryNames.length
      ? categoryNames
      : Array.from(new Set(events.map((e) => e.category)));
    return order
      .map((cat) => ({
        category: cat,
        items: events
          .filter((e) => e.category === cat)
          .sort((a, b) => a.order - b.order),
      }))
      .filter((g) => g.items.length > 0);
  }, [events, categoryNames]);

  async function handleSave(id: string, data: EventInput, isNew: boolean) {
    if (isNew) {
      await createEvent(id, data);
    } else {
      await updateEvent(id, data);
    }
    setCreating(false);
    setEditing(null);
    reload();
  }

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
          <Button size="sm" onClick={() => setCreating(true)} icon={<Plus size={16} />}>
            New Event
          </Button>
        }
      />

      <div className="flex flex-col gap-8 p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : events.length === 0 ? (
          <EmptyState message="No events yet. Create your first event to get started." />
        ) : (
          grouped.map((group) => (
            <section
              key={group.category}
              className="rounded-2xl border border-border bg-surface shadow-card"
            >
              <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                <CalendarDays size={18} className="text-primary-600" />
                <h2 className="font-heading font-bold text-text">{group.category}</h2>
                <span className="text-sm text-text-muted">({group.items.length})</span>
              </div>
              <ul className="divide-y divide-border">
                {group.items.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-4 px-6 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text">{e.title}</p>
                      <p className="truncate text-xs text-text-muted">
                        {e.tag}
                        {typeof e.registrationFee === "number" &&
                          ` · ₹${e.registrationFee.toLocaleString("en-IN")}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={e.isActive ? "confirmed" : "cancelled"} />
                      <button
                        type="button"
                        onClick={() => setEditing(e)}
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-primary-700"
                        aria-label={`Edit ${e.title}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(e)}
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                        aria-label={`Delete ${e.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {(creating || editing) && (
        <EventForm
          event={editing}
          categories={categoryNames}
          existingIds={events.map((e) => e.id)}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
