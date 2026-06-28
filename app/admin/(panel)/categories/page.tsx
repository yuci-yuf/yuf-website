"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/admin-data";
import type { EventCategoryDoc } from "@/types";

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<EventCategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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
    } catch (err) {
      console.error(err);
      setError("Failed to delete category.");
    }
  }

  return (
    <>
      <PageHeader
        title="Event Categories"
        description="Categories shown when creating events and grouping the public listing"
      />

      <div className="flex max-w-2xl flex-col gap-6 p-8">
        <form
          onSubmit={handleAdd}
          className="flex gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card"
        >
          <Input
            placeholder="New category name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={saving}
            icon={saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          >
            Add
          </Button>
        </form>

        {error && (
          <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState message="No categories yet. Add one above." />
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-card">
            {rows.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                {editId === cat.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                      autoFocus
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
                    <span className="text-sm font-medium text-text">{cat.name}</span>
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
    </>
  );
}
