"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Mail, MailOpen, Loader2 } from "lucide-react";
import { PageHeader, EmptyState, formatDate } from "@/components/admin/AdminUI";
import { getContactMessages, setContactRead } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types";

export default function ContactsPage() {
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getContactMessages()
      .then(setRows)
      .catch((e) => {
        console.error(e);
        setError("Failed to load messages.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleOpen(msg: ContactMessage) {
    const next = openId === msg.id ? null : msg.id;
    setOpenId(next);
    // Opening an unread message marks it read.
    if (next && !msg.isRead) {
      setRows((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
      try {
        await setContactRead(msg.id, true);
      } catch (e) {
        console.error(e);
      }
    }
  }

  const unread = rows.filter((m) => !m.isRead).length;

  return (
    <>
      <PageHeader
        title="Contact Submissions"
        description={`${rows.length} total · ${unread} unread`}
      />

      <div className="flex flex-col gap-6 p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : rows.length === 0 ? (
          <EmptyState message="No messages yet." />
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((m) => {
              const open = openId === m.id;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-2xl border bg-surface shadow-card transition-colors",
                    m.isRead ? "border-border" : "border-primary-300",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleOpen(m)}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left"
                  >
                    <span className={cn("shrink-0", m.isRead ? "text-text-muted" : "text-primary-600")}>
                      {m.isRead ? <MailOpen size={20} /> : <Mail size={20} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm", m.isRead ? "font-medium text-text" : "font-semibold text-text")}>
                        {m.firstName} {m.lastName}
                        <span className="ml-2 font-normal capitalize text-text-muted">· {m.subject}</span>
                      </p>
                      <p className="truncate text-xs text-text-muted">{m.email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-text-muted">{formatDate(m.createdAt)}</span>
                    <ChevronDown
                      size={18}
                      className={cn("shrink-0 text-text-muted transition-transform", open && "rotate-180")}
                    />
                  </button>

                  {open && (
                    <div className="border-t border-border px-6 py-5">
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <Detail label="Email" value={m.email} />
                        <Detail label="Phone" value={m.phone || "—"} />
                        <Detail label="Subject" value={m.subject} />
                        <Detail label="Received" value={formatDate(m.createdAt)} />
                      </div>
                      <div className="mt-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Message</p>
                        <p className="whitespace-pre-wrap leading-relaxed text-text">{m.message}</p>
                      </div>
                      <a
                        href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                        className="mt-4 inline-flex text-sm font-medium text-primary-700 hover:underline"
                      >
                        Reply by email →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}: </span>
      <span className="capitalize text-text">{value}</span>
    </div>
  );
}
