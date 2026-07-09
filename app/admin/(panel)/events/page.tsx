"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { PageHeader, StatusBadge, EmptyState, formatDate } from "@/components/admin/AdminUI";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getAdminEvents,
  getAdminCategories,
  getRegistrations,
  deleteEvent,
  institutionTypeLabel,
} from "@/lib/admin-data";
import type {
  EventCategoryDoc,
  EventItem,
  EventLocation,
  Registration,
} from "@/types";
import { getEventLocations } from "@/lib/event-groups";
import { useDialog } from "@/components/ui/confirm-dialog";

const ALL = "All";
const PAGE_SIZE = 10;

export default function AdminEventsPage() {
  const { confirm, notify } = useDialog();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<EventCategoryDoc[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managingCats, setManagingCats] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  // Event whose location-picker download dialog is open (multi-location events).
  const [downloadEvent, setDownloadEvent] = useState<EventItem | null>(null);

  function load() {
    return Promise.all([
      getAdminEvents(),
      getAdminCategories(),
      getRegistrations(),
    ])
      .then(([evs, cats, regs]) => {
        setEvents(evs);
        setCategories(cats);
        setRegistrations(regs);
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
      .filter((e) => {
        if (!term) return true;
        if (e.title.toLowerCase().includes(term)) return true;
        // Search across every location's city/address.
        return getEventLocations(e).some((loc) =>
          `${loc.city ?? ""} ${loc.address ?? ""}`
            .toLowerCase()
            .includes(term),
        );
      })
      .sort((a, b) => a.order - b.order);
  }, [events, activeCategory, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp in case the filtered list shrank below the current page (e.g. after
  // a search narrows results or an event is deleted).
  const currentPage = Math.min(page, pageCount);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  // Reset to the first page whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [search, activeCategory]);

  /**
   * Download an event's registrations as CSV. When `loc` is given, only that
   * location's registrations are exported and the filename is scoped to it —
   * so you can pull "Kabaddi · Ponneri" separately from "Kabaddi · Coimbatore".
   */
  function exportEventCsv(ev: EventItem, loc?: EventLocation) {
    const rows = registrations.filter(
      (r) => r.eventId === ev.id && (!loc || r.locationId === loc.id),
    );
    const headers = [
      "Name", "Email", "Phone", "City", "Institution",
      "Type", "Category", "Event", "Loc. Venue", "Loc. Date",
      "Standard / Year", "Amount", "Payment", "Status", "Date",
    ];
    const lines = rows.map((r) =>
      [
        `${r.firstName} ${r.lastName}`, r.email, r.phone, r.location, r.institution,
        institutionTypeLabel(r), r.eventCategory, r.eventTitle, r.locationVenue ?? "", r.locationDate ?? "",
        r.ageCategory, r.amountPaid, r.paymentStatus,
        r.status, formatDate(r.createdAt),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Scope the filename to the event (and location, when given) so multiple
    // exports are distinct, e.g. "kabaddi-ponneri-registrations.csv".
    const slug = [ev.title, loc?.city || loc?.address || loc?.date]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    a.download = `${slug || ev.id}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Registrations for a given location of an event. */
  function locationRegCount(ev: EventItem, loc: EventLocation): number {
    return registrations.filter(
      (r) => r.eventId === ev.id && r.locationId === loc.id,
    ).length;
  }

  /**
   * Download entry point. Events with a single location export straight away;
   * events with multiple locations open a dialog so the admin can pick one
   * location or grab all of them at once.
   */
  function handleDownload(ev: EventItem) {
    const locs = getEventLocations(ev);
    if (locs.length > 1) {
      setDownloadEvent(ev);
    } else {
      exportEventCsv(ev);
    }
  }

  async function handleDelete(ev: EventItem) {
    const regCount = regCounts[ev.id] ?? 0;
    const ok = await confirm({
      title: "Delete event?",
      description:
        regCount > 0
          ? `"${ev.title}" and its ${regCount} registration${
              regCount === 1 ? "" : "s"
            } will be permanently deleted. This cannot be undone.`
          : `"${ev.title}" and any of its registrations will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteEvent(ev.id);
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      // Drop the removed event's registrations from local state so counts and
      // the "N shown" totals stay accurate without a reload.
      setRegistrations((prev) => prev.filter((r) => r.eventId !== ev.id));
      setRegCounts((prev) => {
        const next = { ...prev };
        delete next[ev.id];
        return next;
      });
    } catch (e) {
      console.error(e);
      notify({
        title: "Delete failed",
        description: "We couldn't delete the event. Please try again.",
      });
    }
  }

  return (
    <>
      <PageHeader
        title="Events"
        description="Create, edit, and remove festival events"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/events/arrange">
                <ArrowUpDown size={16} />
                Arrange Home Order
              </Link>
            </Button>
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
                    <th className="px-5 py-3.5">Locations</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Total</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((e) => (
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
                        {(() => {
                          const locs = getEventLocations(e);
                          if (locs.length === 0) return "—";
                          return (
                            <ul className="flex flex-col gap-1.5">
                              {locs.map((loc) => {
                                const place =
                                  loc.city || loc.address || "Location";
                                return (
                                  <li
                                    key={loc.id}
                                    className="flex items-center gap-2"
                                  >
                                    <MapPin size={13} className="shrink-0" />
                                    <span className="max-w-45 truncate">
                                      {place}
                                      {loc.date ? (
                                        <span className="text-text-muted/70">
                                          {" "}
                                          · {loc.date}
                                        </span>
                                      ) : null}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          );
                        })()}
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
                          // Total limit = sum of per-location limits, but only
                          // when every location is capped (otherwise unlimited).
                          const locs = getEventLocations(e);
                          const limits = locs.map((l) => l.registrationLimit);
                          const totalLimit = limits.every(
                            (l) => typeof l === "number",
                          )
                            ? (limits as number[]).reduce((a, b) => a + b, 0)
                            : null;
                          const full =
                            totalLimit !== null && count >= totalLimit;
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
                                totalLimit !== null
                                  ? `${count} of ${totalLimit} spots filled`
                                  : `${count} registrations`
                              }
                            >
                              <Users size={13} />
                              {totalLimit !== null
                                ? `${count}/${totalLimit}`
                                : count}
                              {full && " · Full"}
                            </Link>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDownload(e)}
                            disabled={(regCounts[e.id] ?? 0) === 0}
                            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                            aria-label={`Download registrations for ${e.title}`}
                            title={
                              (regCounts[e.id] ?? 0) === 0
                                ? "No registrations yet"
                                : `Download ${regCounts[e.id]} registration(s) as CSV`
                            }
                          >
                            <Download size={16} />
                          </button>
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

            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3.5">
                <p className="text-sm text-text-muted">
                  Showing{" "}
                  <span className="font-medium text-text">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-text">{filtered.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </Button>
                  <span className="px-3 text-sm text-text-muted">
                    Page{" "}
                    <span className="font-medium text-text">{currentPage}</span> of{" "}
                    {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={currentPage === pageCount}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
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

      {/* Location picker for downloading a multi-location event's registrations. */}
      <Dialog.Root
        open={downloadEvent !== null}
        onOpenChange={(next) => {
          if (!next) setDownloadEvent(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-100 bg-primary-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-101 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-hover focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
            <Dialog.Title className="font-heading text-lg font-bold text-heading">
              Download registrations
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm leading-relaxed text-text-muted">
              {downloadEvent?.title} runs in multiple locations. Choose which
              registrations to download.
            </Dialog.Description>

            {downloadEvent && (
              <div className="mt-5 flex flex-col gap-2">
                {/* All locations */}
                <button
                  type="button"
                  onClick={() => {
                    exportEventCsv(downloadEvent);
                    setDownloadEvent(null);
                  }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-alt/50 px-4 py-3 text-left transition-colors hover:border-primary-500 hover:bg-primary-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Download size={16} className="text-primary-600" />
                    <span className="font-medium text-text">All locations</span>
                  </span>
                  <span className="text-xs font-semibold text-text-muted">
                    {regCounts[downloadEvent.id] ?? 0}
                  </span>
                </button>

                <div className="my-1 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-wide text-text-muted">
                    Or a single location
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                {/* Per-location */}
                {getEventLocations(downloadEvent).map((loc) => {
                  const count = locationRegCount(downloadEvent, loc);
                  const place = loc.city || loc.address || "Location";
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      disabled={count === 0}
                      onClick={() => {
                        exportEventCsv(downloadEvent, loc);
                        setDownloadEvent(null);
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-primary-500 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent"
                    >
                      <span className="flex items-center gap-2.5">
                        <MapPin size={16} className="shrink-0 text-text-muted" />
                        <span className="flex flex-col">
                          <span className="font-medium text-text">{place}</span>
                          {loc.date && (
                            <span className="text-xs text-text-muted">
                              {loc.date}
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-text-muted">
                        {count === 0 ? "None" : count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
