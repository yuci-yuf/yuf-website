"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, GripVertical, Loader2, Star, Check } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { categoryStyle } from "@/lib/category-style";
import { getAdminEvents, getAdminCategories, setHomeOrder } from "@/lib/admin-data";
import type { EventItem } from "@/types";
import { useDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

/** The events of one category, in their current home-page display order. */
interface CategoryBlock {
  key: string;
  events: EventItem[];
}

/** Which item is being dragged: its category and current index within it. */
interface DragState {
  cat: string;
  index: number;
}

/** Sort a category's events the same way the home page does. */
function homeSort(a: EventItem, b: EventItem) {
  return (
    (a.homeOrder ?? Number.MAX_SAFE_INTEGER) -
    (b.homeOrder ?? Number.MAX_SAFE_INTEGER)
  );
}

export default function ArrangeHomeOrderPage() {
  const { notify } = useDialog();
  const [blocks, setBlocks] = useState<CategoryBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // `drag` drives the row styling; `dragRef` mirrors it so the rapid dragover
  // handler always reads the current position (state closures go stale between
  // the many dragover events that fire before React re-renders).
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  // Snapshot of the loaded order (eventId → index within its category) so we
  // only write what actually moved.
  const [initialOrder, setInitialOrder] = useState<Map<string, number>>(
    new Map(),
  );

  useEffect(() => {
    Promise.all([getAdminEvents(), getAdminCategories()])
      .then(([events, cats]) => {
        // Only active events appear on the home page, so only those are
        // arrangeable here.
        const active = events.filter((e) => e.isActive);

        const present = Array.from(new Set(active.map((e) => e.category)));
        const ordered = [
          ...cats.map((c) => c.name).filter((c) => present.includes(c)),
          ...present.filter((c) => !cats.some((cat) => cat.name === c)),
        ];

        const next: CategoryBlock[] = ordered
          .map((key) => ({
            key,
            events: active.filter((e) => e.category === key).sort(homeSort),
          }))
          .filter((b) => b.events.length > 0);

        // Record the effective starting index of each event within its
        // category, so the dirty check compares against the real display order
        // (not the stored homeOrder, which may be undefined/sparse).
        const snap = new Map<string, number>();
        for (const b of next) {
          b.events.forEach((e, i) => snap.set(e.id, i));
        }
        setInitialOrder(snap);
        setBlocks(next);
        setError(null);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load events.");
      })
      .finally(() => setLoading(false));
  }, []);

  function startDrag(cat: string, index: number) {
    const next = { cat, index };
    dragRef.current = next;
    setDrag(next);
  }

  function endDrag() {
    dragRef.current = null;
    setDrag(null);
  }

  /** Live-reorder while dragging: move the dragged item to `overIndex`. Only
   *  within the same category (dragging across categories is ignored). */
  function reorder(catKey: string, overIndex: number) {
    const cur = dragRef.current;
    if (!cur || cur.cat !== catKey || cur.index === overIndex) return;
    const from = cur.index;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.key !== catKey) return b;
        const events = [...b.events];
        const [moved] = events.splice(from, 1);
        events.splice(overIndex, 0, moved);
        return { ...b, events };
      }),
    );
    const next = { cat: catKey, index: overIndex };
    dragRef.current = next;
    setDrag(next);
    setSaved(false);
  }

  // Which events have a new position vs. what was loaded → the only ones we
  // write. homeOrder is the 0-based index within the category.
  const updates = useMemo(() => {
    const out: { id: string; homeOrder: number }[] = [];
    for (const b of blocks) {
      b.events.forEach((e, i) => {
        if (initialOrder.get(e.id) !== i) out.push({ id: e.id, homeOrder: i });
      });
    }
    return out;
  }, [blocks, initialOrder]);

  const dirty = updates.length > 0;

  async function handleSave() {
    if (!dirty) return;
    setSaving(true);
    try {
      await setHomeOrder(updates);
      // Re-baseline so the screen is clean and further moves diff correctly.
      const snap = new Map<string, number>();
      for (const b of blocks) b.events.forEach((e, i) => snap.set(e.id, i));
      setInitialOrder(snap);
      setSaved(true);
    } catch (e) {
      console.error(e);
      notify({
        title: "Save failed",
        description: "We couldn't save the order. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Arrange Home Order"
        description="Drag events to set the order they appear within each category on the home page. The first event becomes the featured card. This does not affect the Events page."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
            >
              <ArrowLeft size={16} />
              Back to Events
            </Link>
            <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : saved && !dirty ? (
                <Check size={16} />
              ) : null}
              {saved && !dirty ? "Saved" : "Save order"}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-6 p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : blocks.length === 0 ? (
          <EmptyState message="No active events to arrange yet." />
        ) : (
          blocks.map((block) => {
            const st = categoryStyle(block.key);
            return (
              <section
                key={block.key}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
              >
                <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: st.soft, color: st.accent }}
                  >
                    <st.icon size={16} />
                  </span>
                  <h2 className="font-heading text-base font-bold text-text">
                    {block.key}
                  </h2>
                  <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-text-muted">
                    {block.events.length} event
                    {block.events.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ul className="divide-y divide-border">
                  {block.events.map((e, i) => {
                    const isDragged =
                      drag?.cat === block.key && drag.index === i;
                    return (
                      <li
                        key={e.id}
                        draggable
                        onDragStart={(ev) => {
                          ev.dataTransfer.effectAllowed = "move";
                          // Firefox needs data set for the drag to start.
                          ev.dataTransfer.setData("text/plain", e.id);
                          startDrag(block.key, i);
                        }}
                        onDragOver={(ev) => {
                          // Allow dropping and continuously reorder as we pass
                          // over each row (only within this category).
                          if (dragRef.current?.cat !== block.key) return;
                          ev.preventDefault();
                          ev.dataTransfer.dropEffect = "move";
                          reorder(block.key, i);
                        }}
                        onDragEnd={endDrag}
                        onDrop={(ev) => ev.preventDefault()}
                        className={cn(
                          "flex items-center gap-4 px-5 py-3 transition-colors",
                          isDragged
                            ? "bg-primary-50 opacity-60 ring-1 ring-inset ring-primary-300"
                            : "hover:bg-surface-alt/40",
                        )}
                      >
                        <span
                          className="shrink-0 cursor-grab text-text-muted active:cursor-grabbing"
                          aria-hidden
                          title="Drag to reorder"
                        >
                          <GripVertical size={18} />
                        </span>

                        <span className="w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-text-muted">
                          {i + 1}
                        </span>

                        <div className="pointer-events-none relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
                          {e.image ? (
                            <Image
                              src={e.image}
                              alt={e.title}
                              fill
                              draggable={false}
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(135deg, ${st.from}, ${st.to})`,
                              }}
                            />
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="truncate text-sm font-medium text-text">
                            {e.title}
                          </span>
                          {i === 0 && (
                            <span
                              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                              style={{
                                backgroundColor: st.soft,
                                color: st.accent,
                              }}
                              title="Shown as the large featured card on the home page"
                            >
                              <Star size={11} className="fill-current" />
                              Featured
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
