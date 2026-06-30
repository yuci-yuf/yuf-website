"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminUI";
import { EventForm } from "@/components/admin/EventForm";
import {
  getAdminEvents,
  getAdminCategories,
  createEvent,
  updateEvent,
  type EventInput,
} from "@/lib/admin-data";
import type { EventItem } from "@/types";

/**
 * Shared client wrapper for the full-page New / Edit event routes. Loads the
 * managed categories and existing event ids (needed for slug uniqueness +
 * the category dropdown), then renders the EventForm. On save it writes to
 * Firestore and navigates back to the events list.
 *
 * `eventId` null → create mode. Otherwise the matching event is loaded for edit.
 */
export function EventFormPage({ eventId }: { eventId: string | null }) {
  const router = useRouter();
  const isNew = eventId === null;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([getAdminEvents(), getAdminCategories()])
      .then(([evs, cats]) => {
        setEvents(evs);
        // Prefer the managed list, but include categories already used by
        // events so nothing existing becomes unselectable.
        const names = Array.from(
          new Set([
            ...cats.map((c) => c.name),
            ...evs.map((e) => e.category).filter(Boolean),
          ]),
        );
        setCategories(names);
        if (!isNew && !evs.some((e) => e.id === eventId)) {
          setNotFound(true);
        }
      })
      .catch((e) => {
        console.error(e);
        setNotFound(!isNew);
      })
      .finally(() => setLoading(false));
  }, [eventId, isNew]);

  const event = useMemo(
    () => (isNew ? null : (events.find((e) => e.id === eventId) ?? null)),
    [events, eventId, isNew],
  );

  async function handleSave(id: string, data: EventInput, creating: boolean) {
    if (creating) {
      await createEvent(id, data);
    } else {
      await updateEvent(id, data);
    }
    router.push("/admin/events");
  }

  return (
    <>
      <PageHeader
        title={isNew ? "New Event" : event ? `Edit: ${event.title}` : "Edit Event"}
        description={
          isNew
            ? "Add a new festival event"
            : "Update the details for this event"
        }
        action={
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
          >
            <ArrowLeft size={16} />
            Back to Events
          </Link>
        }
      />

      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : notFound ? (
          <div className="flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-surface p-12">
            <p className="text-text-muted">
              That event could not be found. It may have been deleted.
            </p>
            <Link
              href="/admin/events"
              className="text-sm font-medium text-primary-700 hover:underline"
            >
              ← Back to Events
            </Link>
          </div>
        ) : (
          <EventForm
            event={event}
            categories={categories}
            existingIds={events.map((e) => e.id)}
            onCancel={() => router.push("/admin/events")}
            onSave={handleSave}
          />
        )}
      </div>
    </>
  );
}
