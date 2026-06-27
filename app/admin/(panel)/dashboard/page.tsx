"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, IndianRupee, Mail, CalendarCheck, Loader2 } from "lucide-react";
import {
  PageHeader,
  StatCard,
  StatusBadge,
  EmptyState,
  formatDate,
} from "@/components/admin/AdminUI";
import { getRegistrations, getContactMessages } from "@/lib/admin-data";
import { events } from "@/lib/content";
import type { ContactMessage, Registration } from "@/types";

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getRegistrations(), getContactMessages()])
      .then(([regs, msgs]) => {
        setRegistrations(regs);
        setContacts(msgs);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const thisMonth = registrations.filter((r) => {
    if (!r.createdAt) return false;
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const revenue = registrations
    .filter((r) => r.paymentStatus === "paid")
    .reduce((sum, r) => sum + (r.amountPaid || 0), 0);
  const activeEvents = events.filter((e) => e.isActive).length;

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of registrations and activity" />

      <div className="flex flex-col gap-8 p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Registrations" value={registrations.length} icon={<ClipboardList size={22} />} />
              <StatCard label="This Month" value={thisMonth} icon={<CalendarCheck size={22} />} accent="accent" />
              <StatCard label="Total Revenue" value={`₹ ${revenue.toLocaleString("en-IN")}`} icon={<IndianRupee size={22} />} accent="success" />
              <StatCard label="Active Events" value={activeEvents} icon={<CalendarCheck size={22} />} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent registrations */}
              <section className="rounded-2xl border border-border bg-surface shadow-card">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-heading font-bold text-text">Recent Registrations</h2>
                  <Link href="/admin/registrations" className="text-sm font-medium text-primary-700 hover:underline">
                    View all
                  </Link>
                </div>
                {registrations.length === 0 ? (
                  <div className="p-6">
                    <EmptyState message="No registrations yet." />
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {registrations.slice(0, 6).map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 px-6 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text">
                            {r.firstName} {r.lastName}
                          </p>
                          <p className="truncate text-xs text-text-muted">{r.eventTitle || "—"}</p>
                        </div>
                        <StatusBadge status={r.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Recent contacts */}
              <section className="rounded-2xl border border-border bg-surface shadow-card">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-heading font-bold text-text">Recent Messages</h2>
                  <Link href="/admin/contacts" className="text-sm font-medium text-primary-700 hover:underline">
                    View all
                  </Link>
                </div>
                {contacts.length === 0 ? (
                  <div className="p-6">
                    <EmptyState message="No messages yet." />
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {contacts.slice(0, 6).map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-3 px-6 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="truncate text-xs text-text-muted capitalize">{c.subject}</p>
                        </div>
                        <span className="shrink-0 text-xs text-text-muted">{formatDate(c.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}
