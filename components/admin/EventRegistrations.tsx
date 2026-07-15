"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  formatDate,
} from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getEventById,
  getRegistrationsForEvent,
  institutionTypeLabel,
} from "@/lib/admin-data";
import type { EventItem, Registration } from "@/types";

/**
 * Per-event registrations view with Paid / Pending / Failed tabs.
 *
 * Reached from the events table ("Total" badge). Scoped to a single event so an
 * admin sees only that event's sign-ups, split by payment state. Export CSV
 * always exports the ACTIVE tab's rows, so what downloads matches what's shown.
 */

type TabKey = "all" | "paid" | "pending" | "failed";

const TABS: { key: TabKey; label: string; match: (r: Registration) => boolean }[] =
  [
    { key: "all", label: "All", match: () => true },
    { key: "paid", label: "Paid", match: (r) => r.paymentStatus === "paid" },
    {
      key: "pending",
      label: "Pending",
      match: (r) => r.paymentStatus === "pending",
    },
    {
      // Failed groups both genuine failures and reclaimed/abandoned holds.
      key: "failed",
      label: "Failed",
      match: (r) =>
        r.paymentStatus === "failed" || r.paymentStatus === "expired",
    },
  ];

const TAB_TONE: Record<TabKey, string> = {
  all: "bg-primary-600 text-white",
  paid: "bg-success text-white",
  pending: "bg-accent-600 text-white",
  failed: "bg-error text-white",
};

export function EventRegistrations({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("all");

  useEffect(() => {
    Promise.all([getEventById(eventId), getRegistrationsForEvent(eventId)])
      .then(([ev, regs]) => {
        setEvent(ev);
        setRows(regs);
        setError(null);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load registrations.");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  // Count per tab, computed once so the tab labels can show live totals.
  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: rows.length,
      paid: 0,
      pending: 0,
      failed: 0,
    };
    for (const r of rows) {
      if (r.paymentStatus === "paid") c.paid++;
      else if (r.paymentStatus === "pending") c.pending++;
      else if (r.paymentStatus === "failed" || r.paymentStatus === "expired")
        c.failed++;
    }
    return c;
  }, [rows]);

  const activeTab = TABS.find((t) => t.key === tab)!;
  const visible = useMemo(
    () => rows.filter(activeTab.match),
    [rows, activeTab],
  );

  /** Export the CURRENT tab's rows as CSV — matches exactly what's on screen. */
  function exportCsv() {
    if (visible.length === 0) return;
    const headers = [
      "Name", "Email", "Phone", "City", "Institution",
      "Type", "Category", "Event", "Loc. Venue", "Loc. Date",
      "Standard / Year", "Code", "Amount", "Payment", "Payment ID",
      "Status", "Checked In", "Date",
    ];
    const lines = visible.map((r) =>
      [
        `${r.firstName} ${r.lastName}`, r.email, r.phone, r.location, r.institution,
        institutionTypeLabel(r), r.eventCategory, r.eventTitle,
        r.locationVenue ?? "", r.locationDate ?? "", r.ageCategory,
        r.registrationCode ?? "", r.amountPaid, r.paymentStatus, r.paymentId ?? "",
        r.status, r.checkedIn ? "Yes" : "No", formatDate(r.createdAt),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = `${event?.title ?? eventId} ${tab}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    a.download = `${slug}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Registrations"
        description={
          event
            ? `${event.title} — ${rows.length} total`
            : `${rows.length} total`
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={visible.length === 0}
          >
            <Download size={16} />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Link
          href="/admin/events"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-primary-700"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>

        {/* Payment-status tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? TAB_TONE[t.key]
                  : "text-text-muted hover:bg-surface-alt hover:text-text",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  tab === t.key
                    ? "bg-white/20 text-white"
                    : "bg-surface-alt text-text-muted",
                )}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : visible.length === 0 ? (
          <EmptyState
            message={
              rows.length === 0
                ? "No registrations for this event yet."
                : `No ${tab === "all" ? "" : tab + " "}registrations to show.`
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-alt text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Institution</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Check-in</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((r, i) => (
                  <tr key={r.id} className="hover:bg-surface-alt/60">
                    <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-text">
                      {r.firstName} {r.lastName}
                      {r.registrationCode && (
                        <div className="font-mono text-xs text-text-muted">
                          {r.registrationCode}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="shrink-0" />
                        {r.email}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                        <Phone size={12} className="shrink-0" />
                        {r.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {r.institution}
                      {institutionTypeLabel(r) && (
                        <div className="text-xs">{institutionTypeLabel(r)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {[r.locationVenue, r.locationDate]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-text">
                      ₹ {r.amountPaid.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {r.checkedIn ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-inset ring-success/20">
                          <CheckCircle2 size={13} className="shrink-0" />
                          In
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
