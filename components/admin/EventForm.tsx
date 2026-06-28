"use client";

import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { EventInput } from "@/lib/admin-data";
import type { EventItem, EventStatus } from "@/types";

const STATUSES: EventStatus[] = ["upcoming", "ongoing", "past"];

/** Turn a title into a URL-safe slug used as the event id. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Split a textarea into trimmed, non-empty lines. */
function toLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * The event `date` is stored as a human-readable label (e.g. "15 Feb 2026")
 * shown verbatim on the public site. The form uses a native date picker, so we
 * convert between the picker's ISO value ("2026-02-15") and that label.
 */
function isoToLabel(iso: string): string {
  if (!iso) return "";
  // Parse as a local date to avoid the timezone shift that `new Date(iso)`
  // (which treats a bare YYYY-MM-DD as UTC) can introduce.
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function labelToIso(label: string): string {
  if (!label) return "";
  const parsed = new Date(label);
  if (Number.isNaN(parsed.getTime())) return ""; // non-date label (e.g. a slogan)
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Modal create/edit form for an event. `event` null means create mode.
 * `onSave(id, data, isNew)` does the Firestore write; this component only
 * collects + validates the fields.
 */
export function EventForm({
  event,
  categories,
  existingIds,
  onClose,
  onSave,
}: {
  event: EventItem | null;
  categories: string[];
  existingIds: string[];
  onClose: () => void;
  onSave: (id: string, data: EventInput, isNew: boolean) => Promise<void>;
}) {
  const isNew = event === null;

  const [title, setTitle] = useState(event?.title ?? "");
  const [id, setId] = useState(event?.id ?? "");
  const [idTouched, setIdTouched] = useState(!isNew);
  // Empty for new events so the "Select a category…" placeholder shows; the
  // submit handler enforces that a category is chosen.
  const [category, setCategory] = useState(event?.category ?? "");
  const [tag, setTag] = useState(event?.tag ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [image, setImage] = useState(event?.image ?? "");
  const [fee, setFee] = useState(
    event?.registrationFee != null ? String(event.registrationFee) : "",
  );
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "upcoming");
  const [order, setOrder] = useState(String(event?.order ?? ""));
  const [isActive, setIsActive] = useState(event?.isActive ?? true);
  // `date` holds the ISO value for the date picker; converted to/from the
  // stored display label via isoToLabel/labelToIso.
  const [date, setDate] = useState(labelToIso(event?.date ?? ""));
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [details, setDetails] = useState((event?.details ?? []).join("\n"));
  const [rules, setRules] = useState((event?.rules ?? []).join("\n"));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-derive the id from the title until the admin edits it manually.
  function handleTitle(value: string) {
    setTitle(value);
    if (isNew && !idTouched) setId(slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const finalId = isNew ? slugify(id || title) : event!.id;
    if (!finalId) {
      setError("An event id (slug) is required.");
      return;
    }
    if (isNew && existingIds.includes(finalId)) {
      setError(`An event with id "${finalId}" already exists. Choose another.`);
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    const data: EventInput = {
      title: title.trim(),
      category: category.trim(),
      tag: tag.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      registrationFee: fee.trim() ? Number(fee) : undefined,
      isActive,
      order: order.trim() ? Number(order) : 0,
      status,
      date: date ? isoToLabel(date) : undefined,
      venue: venue.trim() || undefined,
      details: toLines(details).length ? toLines(details) : undefined,
      rules: toLines(rules).length ? toLines(rules) : undefined,
    };

    setSaving(true);
    try {
      await onSave(finalId, data, isNew);
    } catch (err) {
      console.error(err);
      setError("Failed to save the event. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="my-auto w-full max-w-2xl rounded-2xl bg-surface shadow-hover">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-heading text-lg font-bold text-text">
            {isNew ? "New Event" : `Edit: ${event?.title}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <Field label="Title" htmlFor="ev-title" required>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => handleTitle(e.target.value)}
              required
            />
          </Field>

          <Field label="Event ID (URL slug)" htmlFor="ev-id" required>
            <Input
              id="ev-id"
              value={id}
              onChange={(e) => {
                setIdTouched(true);
                setId(slugify(e.target.value));
              }}
              disabled={!isNew}
              placeholder="auto-generated from title"
            />
          </Field>
          {!isNew && (
            <p className="-mt-3 text-xs text-text-muted">
              The id is part of the public URL and can&apos;t be changed after
              creation.
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="ev-category" required>
              <Select
                id="ev-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={categories.length === 0}
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-text-muted">
                  No categories yet —{" "}
                  <a
                    href="/admin/categories"
                    className="font-medium text-primary-700 hover:underline"
                  >
                    create one first
                  </a>
                  .
                </p>
              )}
            </Field>

            <Field label="Tag" htmlFor="ev-tag">
              <Input
                id="ev-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Music"
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="ev-desc">
            <Textarea
              id="ev-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Image" htmlFor="ev-image">
            <ImageUploader
              value={image}
              onChange={setImage}
              folder="yuf-website/events"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Registration Fee (₹)" htmlFor="ev-fee">
              <Input
                id="ev-fee"
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </Field>
            <Field label="Status" htmlFor="ev-status">
              <Select
                id="ev-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Order" htmlFor="ev-order">
              <Input
                id="ev-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date" htmlFor="ev-date">
              <Input
                id="ev-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Venue" htmlFor="ev-venue">
              <Input
                id="ev-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Chennai"
              />
            </Field>
          </div>

          <Field label="Detail paragraphs (one per line)" htmlFor="ev-details">
            <Textarea
              id="ev-details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Shown on the event detail page. Leave blank to use the description."
            />
          </Field>

          <Field label="Rules / guidelines (one per line)" htmlFor="ev-rules">
            <Textarea
              id="ev-rules"
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-400"
            />
            Active (visible on the public site)
          </label>

          {error && (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} icon={saving ? <Loader2 size={16} className="animate-spin" /> : undefined}>
              {saving ? "Saving…" : isNew ? "Create Event" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
