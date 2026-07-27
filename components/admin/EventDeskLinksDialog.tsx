"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Link2,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldOff,
  X,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getEventLocations } from "@/lib/event-groups";
import type { EventDeskLink, EventItem } from "@/types";

export function EventDeskLinksDialog({
  event,
  onClose,
}: {
  event: EventItem;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { confirm, notify } = useDialog();
  const [links, setLinks] = useState<EventDeskLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyLocation, setBusyLocation] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const locations = getEventLocations(event);

  const api = useCallback(
    async <T,>(init?: RequestInit): Promise<T> => {
      if (!user) throw new Error("Sign in required.");
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/admin/event-desk-links${
          init?.method ? "" : `?eventId=${encodeURIComponent(event.id)}`
        }`,
        {
          ...init,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...init?.headers,
          },
          cache: "no-store",
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      return data as T;
    },
    [event.id, user],
  );

  const load = useCallback(async () => {
    const result = await api<{ links: EventDeskLink[] }>();
    setLinks(result.links);
  }, [api]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void load()
        .catch((error) => {
          console.error(error);
          return notify({
            title: "Links could not be loaded",
            description: "Close this window and try again.",
          });
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [load, notify]);

  function activeLink(locationId: string): EventDeskLink | undefined {
    return links.find(
      (link) => link.locationId === locationId && link.active,
    );
  }

  function linkUrl(token: string): string {
    return `${window.location.origin}/event-desk/${token}`;
  }

  async function generate(locationId: string, replacing: boolean) {
    if (replacing) {
      const proceed = await confirm({
        title: "Replace private link?",
        description:
          "The current link will stop working immediately. Anyone using it must receive the new link.",
        confirmLabel: "Replace link",
        tone: "danger",
      });
      if (!proceed) return;
    }
    setBusyLocation(locationId);
    try {
      const result = await api<{ token: string }>({
        method: "POST",
        body: JSON.stringify({ eventId: event.id, locationId }),
      });
      await load();
      await copy(result.token);
    } catch (error) {
      await notify({
        title: "Link could not be created",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setBusyLocation(null);
    }
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(linkUrl(token));
      setCopied(token);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      await notify({
        title: "Copy failed",
        description: "Open the link and copy it from the browser address bar.",
      });
    }
  }

  async function revoke(link: EventDeskLink) {
    const proceed = await confirm({
      title: "Revoke this link?",
      description:
        "The event desk will become inaccessible immediately. You can generate a new link later.",
      confirmLabel: "Revoke link",
      tone: "danger",
    });
    if (!proceed) return;
    setBusyLocation(link.locationId);
    try {
      await api({
        method: "DELETE",
        body: JSON.stringify({ token: link.token }),
      });
      setLinks((current) =>
        current.filter((item) => item.token !== link.token),
      );
    } catch (error) {
      await notify({
        title: "Link could not be revoked",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setBusyLocation(null);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-100 bg-primary-950/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-101 max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-surface shadow-hover focus:outline-none">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface px-5 py-4">
            <div>
              <Dialog.Title className="flex items-center gap-2 font-heading text-lg font-bold text-heading">
                <Link2 size={19} className="text-primary-600" />
                Private event-desk links
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-muted">
                {event.title} · one independent link for each location
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-text-muted hover:bg-surface-alt"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-5">
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm leading-relaxed text-primary-800">
              <KeyRound size={18} className="mt-0.5 shrink-0" />
              Anyone with a link can see confirmed registrations and check
              participants in for that location. Revoke and replace a link if it
              is shared with the wrong person.
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-primary-600" size={28} />
              </div>
            ) : locations.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
                Add a location to this event before creating a private link.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {locations.map((location) => {
                  const link = activeLink(location.id);
                  const busy = busyLocation === location.id;
                  return (
                    <section
                      key={location.id}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 font-medium text-text">
                            <MapPin
                              size={15}
                              className="shrink-0 text-primary-600"
                            />
                            {location.address ||
                              location.city ||
                              "Event location"}
                          </p>
                          {(location.city || location.date) && (
                            <p className="mt-1 pl-6 text-xs text-text-muted">
                              {[location.city, location.date]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                        <span
                          className={
                            link
                              ? "rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
                              : "rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-text-muted"
                          }
                        >
                          {link ? "Link active" : "No link"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {link ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => copy(link.token)}
                            >
                              {copied === link.token ? (
                                <Check size={15} />
                              ) : (
                                <Copy size={15} />
                              )}
                              {copied === link.token ? "Copied" : "Copy link"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a
                                href={linkUrl(link.token)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink size={15} /> Open
                              </a>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => generate(location.id, true)}
                            >
                              <RefreshCw
                                size={15}
                                className={busy ? "animate-spin" : ""}
                              />
                              Replace
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => revoke(link)}
                              className="text-error hover:bg-error/10 hover:text-error"
                            >
                              <ShieldOff size={15} /> Revoke
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={busy}
                            onClick={() => generate(location.id, false)}
                          >
                            {busy ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Link2 size={15} />
                            )}
                            Generate private link
                          </Button>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
