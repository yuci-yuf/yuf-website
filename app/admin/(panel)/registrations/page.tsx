"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download, Loader2 } from "lucide-react";
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
import { getRegistrations, setRegistrationStatus } from "@/lib/admin-data";
import type { Registration } from "@/types";

const STATUSES = ["confirmed", "pending", "cancelled"] as const;

export default function RegistrationsPage() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // "all" is the sentinel for no filter (Radix Select disallows empty values).
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getRegistrations()
      .then(setRows)
      .catch((e) => {
        console.error(e);
        setError("Failed to load registrations.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !q ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  async function handleStatusChange(id: string, status: Registration["status"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await setRegistrationStatus(id, status);
    } catch (e) {
      console.error(e);
    }
  }

  function exportCsv() {
    const headers = [
      "Name", "Email", "Phone", "City", "Institution",
      "Category", "Event", "Loc. Venue", "Loc. Date",
      "Age", "Amount", "Payment", "Status", "Date",
    ];
    const lines = filtered.map((r) =>
      [
        `${r.firstName} ${r.lastName}`, r.email, r.phone, r.location, r.institution,
        r.eventCategory, r.eventTitle, r.locationVenue ?? "", r.locationDate ?? "",
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
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Registrations"
        description={`${filtered.length} of ${rows.length} shown`}
        action={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-60">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
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
                    <td className="px-4 py-3 text-text-muted">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={r.status}
                        onValueChange={(v) =>
                          handleStatusChange(r.id, v as Registration["status"])
                        }
                      >
                        <SelectTrigger className="h-9 w-32 py-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
