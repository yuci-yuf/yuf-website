"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Mail,
  MailOpen,
  Loader2,
  Trash2,
} from "lucide-react";
import { PageHeader, EmptyState, formatDate } from "@/components/admin/AdminUI";
import {
  getContactMessages,
  setContactRead,
  deleteContactMessage,
} from "@/lib/admin-data";
import { useContacts } from "@/contexts/ContactsContext";
import { useDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types";

export default function ContactsPage() {
  const { confirm, notify } = useDialog();
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const { refresh } = useContacts();

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
      await updateRead(msg.id, true);
    }
  }

  async function updateRead(id: string, isRead: boolean) {
    setRows((prev) => prev.map((m) => (m.id === id ? { ...m, isRead } : m)));
    try {
      await setContactRead(id, isRead);
      refresh(); // keep the sidebar badge in sync
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(msg: ContactMessage) {
    const ok = await confirm({
      title: "Delete message?",
      description: `The message from ${msg.firstName} ${msg.lastName} will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    const prev = rows;
    setRows((r) => r.filter((m) => m.id !== msg.id)); // optimistic
    try {
      await deleteContactMessage(msg.id);
      refresh();
    } catch (e) {
      console.error(e);
      setRows(prev); // restore on failure
      notify({
        title: "Delete failed",
        description: "We couldn't delete the message. Please try again.",
      });
    }
  }

  const unread = rows.filter((m) => !m.isRead).length;

  return (
    <>
      <PageHeader
        title="Contact Submissions"
        description={`${rows.length} total · ${unread} unread`}
      />

      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
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
                  <div className="flex items-center gap-4 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => toggleOpen(m)}
                      className="flex min-w-0 flex-1 items-center gap-4 text-left"
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
                    <div className="flex shrink-0 items-center gap-1 border-l border-border pl-3">
                      <button
                        type="button"
                        onClick={() => updateRead(m.id, !m.isRead)}
                        title={m.isRead ? "Mark as unread" : "Mark as read"}
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-primary-700"
                      >
                        {m.isRead ? <Mail size={16} /> : <MailOpen size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        title="Delete message"
                        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="border-t border-border px-6 py-5">
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <Detail label="Email" value={m.email} plain />
                        <Detail label="Phone" value={m.phone || "—"} plain />
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

function Detail({
  label,
  value,
  plain,
}: {
  label: string;
  value: string;
  /** Skip capitalization for values like emails that are case-sensitive. */
  plain?: boolean;
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}: </span>
      <span className={cn("text-text", !plain && "capitalize")}>{value}</span>
    </div>
  );
}
