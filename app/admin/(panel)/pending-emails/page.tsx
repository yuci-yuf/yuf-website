"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Send,
  Copy,
  Check,
  Undo2,
  X,
} from "lucide-react";
import { PageHeader, EmptyState, formatDate } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/contexts/AuthContext";
import type { PendingEmailRegistration } from "@/types";

interface EmailCopy {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Participants who paid but never received their confirmation email.
 *
 * The sender releases its `emailSentAt` marker whenever a send fails, so this
 * list is simply "confirmed, but no marker" — most often Resend's free-tier
 * daily cap refusing the send. Nothing retries automatically, hence this page:
 * resend through Resend once quota is back, or copy the email (QR inlined, so
 * it survives the paste) and send it by hand from any mail client.
 */
export default function PendingEmailsPage() {
  const { user } = useAuth();
  const { confirm, notify } = useDialog();
  const [rows, setRows] = useState<PendingEmailRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  // The scan is bounded; true when it hit the ceiling and older confirmed
  // registrations went unchecked, so the list is never silently partial.
  const [truncated, setTruncated] = useState(false);
  // Ids marked done in this session. The rows STAY in the table (greyed, with
  // an Undo) rather than vanishing, so a misclick is visible and recoverable
  // in place. They're gone on the next load, by which point they're handled.
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [copy, setCopy] = useState<EmailCopy | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<"html" | "text" | null>(null);

  const api = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      if (!user) throw new Error("Sign in required.");
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/pending-emails${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...init?.headers,
        },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      return data as T;
    },
    [user],
  );

  const fetchPending = useCallback(
    () =>
      api<{
        registrations: PendingEmailRegistration[];
        truncated: boolean;
      }>(""),
    [api],
  );

  // Every setState here lives in a promise callback, never in the effect body
  // — calling them synchronously would trigger cascading renders.
  useEffect(() => {
    if (!user) return;
    fetchPending()
      .then((d) => {
        setRows(d.registrations);
        setTruncated(d.truncated);
        setError(null);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load."),
      )
      .finally(() => setLoading(false));
  }, [user, fetchPending]);

  /** Re-fetch after a send, or on demand from the Refresh button. */
  function reload() {
    setLoading(true);
    fetchPending()
      .then((d) => {
        setRows(d.registrations);
        setTruncated(d.truncated);
        setError(null);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load."),
      )
      .finally(() => setLoading(false));
  }

  /**
   * Record that this one was emailed by hand. The row stays put, marked, so
   * the change is visible where it happened and can be undone in place.
   */
  async function markDone(row: PendingEmailRegistration) {
    setBusyId(row.id);
    try {
      await api("", {
        method: "PATCH",
        body: JSON.stringify({ registrationId: row.id }),
      });
      setMarkedIds((prev) => [...prev, row.id]);
    } catch (e) {
      notify({
        title: "Could not mark as done",
        description: e instanceof Error ? e.message : "Request failed.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function undoMark(row: PendingEmailRegistration) {
    setBusyId(row.id);
    try {
      await api("", {
        method: "PATCH",
        body: JSON.stringify({ registrationId: row.id, undo: true }),
      });
      setMarkedIds((prev) => prev.filter((id) => id !== row.id));
    } catch (e) {
      notify({
        title: "Could not undo",
        description: e instanceof Error ? e.message : "Request failed.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function resendOne(row: PendingEmailRegistration) {
    setBusyId(row.id);
    try {
      const result = await api<{ sent: boolean; reason?: string }>("", {
        method: "POST",
        body: JSON.stringify({ registrationId: row.id }),
      });
      if (result.sent) {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
      } else {
        // The most likely reason is the daily cap still being exhausted.
        notify({
          title: "Not sent",
          description:
            result.reason === "resend-error"
              ? "Resend refused the send — the daily limit may still be reached. Use “Copy email” to send it by hand."
              : `Could not send (${result.reason ?? "unknown"}).`,
        });
      }
    } catch (e) {
      notify({
        title: "Not sent",
        description: e instanceof Error ? e.message : "Request failed.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function resendAll() {
    const pending = rows.filter((r) => !markedIds.includes(r.id)).length;
    const ok = await confirm({
      title: `Send ${pending} confirmation email${pending === 1 ? "" : "s"}?`,
      description:
        "Each one is sent through Resend. Anyone already emailed is skipped automatically. If the daily limit is reached, the rest stay listed here.",
      confirmLabel: "Send all",
    });
    if (!ok) return;
    setBulkBusy(true);
    try {
      const result = await api<{
        sent: number;
        failed: number;
        truncated: boolean;
      }>("", { method: "POST", body: JSON.stringify({ all: true }) });
      notify({
        title: `Sent ${result.sent}`,
        description: [
          result.failed > 0 ? `${result.failed} could not be sent.` : "",
          result.truncated ? "More remain — run it again to continue." : "",
        ]
          .filter(Boolean)
          .join(" ") || "All pending confirmations were sent.",
      });
      reload();
    } catch (e) {
      notify({
        title: "Bulk send failed",
        description: e instanceof Error ? e.message : "Request failed.",
      });
    } finally {
      setBulkBusy(false);
    }
  }

  async function openCopy(row: PendingEmailRegistration) {
    setCopyingId(row.id);
    try {
      setCopy(await api<EmailCopy>(`?id=${encodeURIComponent(row.id)}`));
      setCopied(null);
    } catch (e) {
      notify({
        title: "Could not build the email",
        description: e instanceof Error ? e.message : "Request failed.",
      });
    } finally {
      setCopyingId(null);
    }
  }

  async function copyToClipboard(kind: "html" | "text") {
    if (!copy) return;
    await navigator.clipboard.writeText(kind === "html" ? copy.html : copy.text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  // Rows still needing action — marked ones are already handled, so counting
  // them would overstate what's left (and the server skips them regardless).
  const unmarkedCount = rows.filter((r) => !markedIds.includes(r.id)).length;

  return (
    <div>
      <PageHeader
        title="Pending emails"
        description="Participants who paid but never received their confirmation email."
        action={
          rows.length > 0 ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={reload} disabled={loading}>
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </Button>
              <Button onClick={resendAll} disabled={bulkBusy}>
                {bulkBusy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send all ({unmarkedCount})
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Same inset as the other admin pages, so the table doesn't run to the
          viewport edges while the header above it stays indented. */}
      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : rows.length === 0 ? (
          <EmptyState message="Everyone has their email — every confirmed registration has had its confirmation sent." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
            {truncated && (
              <p className="border-b border-border bg-surface-alt px-5 py-2.5 text-xs text-text-muted">
                Showing the first {rows.length} found — older confirmed
                registrations were not checked, so there may be more.
              </p>
            )}
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-alt text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Participant</th>
                  <th className="px-5 py-3.5 font-semibold">Event</th>
                  <th className="px-5 py-3.5 font-semibold">Code</th>
                  <th className="px-5 py-3.5 font-semibold">Registered</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => {
                  // Marked rows stay in place, dimmed, until the next load —
                  // the click is visible where it happened and undoable there.
                  const marked = markedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      className={`align-top ${
                        marked ? "bg-surface-alt/60" : "hover:bg-surface-alt/40"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div
                          className={`font-medium ${
                            marked
                              ? "text-text-muted line-through"
                              : "text-text"
                          }`}
                        >
                          {[r.firstName, r.lastName].filter(Boolean).join(" ")}
                        </div>
                        <div className="text-xs text-text-muted">{r.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div
                          className={marked ? "text-text-muted" : "text-text"}
                        >
                          {r.eventTitle}
                        </div>
                        <div className="text-xs text-text-muted">
                          {[r.locationVenue, r.locationDate]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-text-muted">
                        {r.registrationCode || "—"}
                      </td>
                      <td className="px-5 py-4 text-xs text-text-muted">
                        {r.createdAt ? formatDate(r.createdAt) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {marked ? (
                            <>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-text-muted ring-1 ring-border">
                                <Check size={13} />
                                Sent by hand
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => undoMark(r)}
                                disabled={busyId === r.id}
                              >
                                {busyId === r.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Undo2 size={14} />
                                )}
                                Undo
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCopy(r)}
                                disabled={copyingId === r.id}
                              >
                                {copyingId === r.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Copy size={14} />
                                )}
                                Copy email
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markDone(r)}
                                disabled={busyId === r.id}
                                title="I've already emailed this participant by hand"
                              >
                                <Check size={14} />
                                Mark done
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => resendOne(r)}
                                disabled={busyId === r.id}
                              >
                                {busyId === r.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Send size={14} />
                                )}
                                Resend
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Copy panel — the full email, QR inlined as a data URI so it survives
          a paste into Gmail/Outlook (the sent version uses a cid: attachment,
          which would show as a broken image outside a real MIME message). */}
      {copy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold text-text">Send this by hand</h2>
                <p className="text-xs text-text-muted">
                  To: {copy.to}
                </p>
              </div>
              <button
                onClick={() => setCopy(null)}
                className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Subject
              </label>
              <p className="mt-1 rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text">
                {copy.subject}
              </p>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Preview
              </label>
              <iframe
                title="Email preview"
                srcDoc={copy.html}
                className="mt-1 h-80 w-full rounded-lg border border-border bg-white"
              />
              <p className="mt-2 text-xs text-text-muted">
                Paste the HTML into your mail client&apos;s rich-text/HTML
                composer. The QR code is embedded, so it travels with the paste.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
              <Button variant="outline" onClick={() => copyToClipboard("text")}>
                {copied === "text" ? <Check size={16} /> : <Copy size={16} />}
                Copy plain text
              </Button>
              <Button onClick={() => copyToClipboard("html")}>
                {copied === "html" ? <Check size={16} /> : <Copy size={16} />}
                Copy HTML
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
