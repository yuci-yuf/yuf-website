"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, Check, X, Pencil, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/admin-data";
import type { EventCategoryDoc } from "@/types";

/**
 * Modal for managing event categories (add / rename / delete). Categories only
 * exist to organize events, so this lives inside the Events page rather than a
 * standalone route. `eventCounts` maps a category name → number of events using
 * it (for the per-row pill); `onChanged` lets the host refetch when the set of
 * categories changes.
 */
export function CategoryManager({
  eventCounts,
  onClose,
  onChanged,
}: {
  eventCounts: Record<string, number>;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [rows, setRows] = useState<EventCategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Lock background scroll while the modal is open.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  function reload() {
    getAdminCategories()
      .then(setRows)
      .catch((e) => {
        console.error(e);
        setError("Failed to load categories.");
      });
  }

  useEffect(() => {
    getAdminCategories()
      .then(setRows)
      .catch((e) => {
        console.error(e);
        setError("Failed to load categories.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (rows.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      setError(`"${name}" already exists.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const nextOrder = rows.length
        ? Math.max(...rows.map((r) => r.order)) + 1
        : 1;
      await createCategory(name, nextOrder);
      setNewName("");
      reload();
      onChanged?.();
    } catch (err) {
      console.error(err);
      setError("Failed to add category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRename(id: string) {
    const name = editName.trim();
    if (!name) return;
    try {
      await updateCategory(id, { name });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
      onChanged?.();
    } catch (err) {
      console.error(err);
      setError("Failed to rename category.");
    } finally {
      setEditId(null);
    }
  }

  async function handleDelete(cat: EventCategoryDoc) {
    if (
      !confirm(
        `Delete category "${cat.name}"? Events keep their category label but it will no longer appear in the managed list.`,
      )
    )
      return;
    try {
      await deleteCategory(cat.id);
      setRows((prev) => prev.filter((r) => r.id !== cat.id));
      onChanged?.();
    } catch (err) {
      console.error(err);
      setError("Failed to delete category.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-surface shadow-hover">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Tag size={16} />
            </span>
            <h2 className="font-heading text-lg font-bold text-text">
              Manage Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {/* Add bar */}
          <form onSubmit={handleAdd} className="flex gap-3">
            <div className="relative flex-1">
              <Tag
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input
                placeholder="New category name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full pl-9"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add
            </Button>
          </form>

          {error && (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary-600" size={28} />
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
              No categories yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {rows.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-alt/50"
                >
                  {editId === cat.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cat.id);
                          if (e.key === "Escape") setEditId(null);
                        }}
                      />
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleRename(cat.id)}
                          className="rounded-lg p-2 text-success transition-colors hover:bg-success/10"
                          aria-label="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt"
                          aria-label="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Tag size={16} />
                        </span>
                        <span className="truncate text-sm font-medium text-text">
                          {cat.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-text-muted">
                          {eventCounts[cat.name] ?? 0} event
                          {(eventCounts[cat.name] ?? 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(cat.id);
                            setEditName(cat.name);
                          }}
                          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-primary-700"
                          aria-label={`Rename ${cat.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                          aria-label={`Delete ${cat.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
