"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download, Loader2, Trash2, CheckCircle2, X } from "lucide-react";
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  formatDate,
} from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getRegistrations,
  institutionTypeLabel,
  deleteAllRegistrations,
} from "@/lib/admin-data";
import { useDialog } from "@/components/ui/confirm-dialog";
import type { Registration } from "@/types";

/**
 * Location label for a registration: the venue (falling back to the stored
 * city) plus its date — e.g. "Velammal Bodhi Campus, Ponneri · 9th Sept 2026".
 * Used both to build the location filter's options and to match against them,
 * so the same event running on two dates shows as two distinct locations.
 */
function locationKey(r: Registration): string {
  const place = (r.locationVenue || r.location || "").trim();
  const date = (r.locationDate || "").trim();
  return [place, date].filter(Boolean).join(" · ");
}

export default function RegistrationsPage() {
  const { confirm, notify } = useDialog();
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // "all" is the sentinel for no filter (Radix Select disallows empty values).
  const [eventFilter, setEventFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [checkinFilter, setCheckinFilter] = useState("all");
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    getRegistrations()
      .then(setRows)
      .catch((e) => {
        console.error(e);
        setError("Failed to load registrations.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter option lists, derived from the loaded data so only values that
  // actually occur are offered (no empty "Coimbatore" when nobody picked it).
  const eventOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.eventTitle).filter(Boolean))).sort(),
    [rows],
  );
  const locationOptions = useMemo(
    () => Array.from(new Set(rows.map(locationKey).filter(Boolean))).sort(),
    [rows],
  );

  const anyFilter =
    eventFilter !== "all" ||
    locationFilter !== "all" ||
    paymentFilter !== "all" ||
    checkinFilter !== "all";

  function clearFilters() {
    setEventFilter("all");
    setLocationFilter("all");
    setPaymentFilter("all");
    setCheckinFilter("all");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !q ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q);
      const matchesEvent = eventFilter === "all" || r.eventTitle === eventFilter;
      const matchesLocation =
        locationFilter === "all" || locationKey(r) === locationFilter;
      const matchesPayment =
        paymentFilter === "all" || r.paymentStatus === paymentFilter;
      const matchesCheckin =
        checkinFilter === "all" ||
        (checkinFilter === "in" ? r.checkedIn : !r.checkedIn);
      return (
        matchesQ &&
        matchesEvent &&
        matchesLocation &&
        matchesPayment &&
        matchesCheckin
      );
    });
  }, [rows, search, eventFilter, locationFilter, paymentFilter, checkinFilter]);

  function exportCsv() {
    const headers = [
      "Name", "Email", "Phone", "City", "Institution",
      "Type", "Category", "Event", "Loc. Venue", "Loc. Date",
      "Standard / Year", "Amount", "Payment", "Payment ID", "Date",
      "Checked In", "Check-in Date",
    ];
    const lines = filtered.map((r) =>
      [
        `${r.firstName} ${r.lastName}`, r.email, r.phone, r.location, r.institution,
        institutionTypeLabel(r), r.eventCategory, r.eventTitle, r.locationVenue ?? "", r.locationDate ?? "",
        r.ageCategory, r.amountPaid, r.paymentStatus, r.paymentId ?? "",
        formatDate(r.createdAt),
        r.checkedIn ? "Yes" : "No", formatDate(r.checkedInAt ?? null),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // TEMPORARY: bulk-clear test registrations. Remove this action (and the
  // deleteAllRegistrations helper) before launch.
  async function handleDeleteAll() {
    const ok = await confirm({
      title: "Delete ALL registrations?",
      description: `This permanently deletes all ${rows.length} registration${
        rows.length === 1 ? "" : "s"
      } and resets every event's spot counts to zero. This cannot be undone.`,
      confirmLabel: "Delete all",
      tone: "danger",
    });
    if (!ok) return;
    setDeletingAll(true);
    try {
      await deleteAllRegistrations();
      setRows([]);
    } catch (e) {
      console.error(e);
      notify({
        title: "Delete failed",
        description: "We couldn't delete the registrations. Please try again.",
      });
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Registrations"
        description={`${filtered.length} of ${rows.length} shown`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download size={16} />
              Export CSV
            </Button>
            {/* TEMPORARY: clears test registrations — remove before launch. */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={rows.length === 0 || deletingAll}
            >
              {deletingAll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Delete all
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-60 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {eventOptions.map((ev) => (
                <SelectItem key={ev} value={ev}>
                  {ev}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locationOptions.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={checkinFilter} onValueChange={setCheckinFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All check-in</SelectItem>
              <SelectItem value="in">Checked in</SelectItem>
              <SelectItem value="out">Not checked in</SelectItem>
            </SelectContent>
          </Select>

          {anyFilter && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X size={15} /> Clear filters
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState message="No registrations match your filters." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-alt text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Payment ID</th>
                  <th className="px-4 py-3 font-semibold">Check-in</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-alt/60">
                    <td className="px-4 py-3 font-medium text-text">
                      {r.firstName} {r.lastName}
                      <div className="text-xs text-text-muted">{r.institution}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      <div>{r.email}</div>
                      <div className="text-xs">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {r.eventTitle}
                      <div className="text-xs">{r.eventCategory}</div>
                      {(r.locationVenue || r.locationDate) && (
                        <div className="text-xs text-primary-700">
                          {[r.locationVenue, r.locationDate]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text">₹ {r.amountPaid.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      {r.paymentId ? (
                        <span className="font-mono text-xs text-text-muted" title={r.paymentId}>
                          {r.paymentId}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.checkedIn ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-inset ring-success/20">
                          <CheckCircle2 size={13} className="shrink-0" />
                          Checked in
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(r.createdAt)}</td>
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
