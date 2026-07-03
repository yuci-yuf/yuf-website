"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { cn } from "@/lib/utils";
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

/**
 * Make a slug unique against the existing event ids by appending -2, -3, …
 * Lets two events share a title while still getting distinct URL slugs.
 */
function uniqueSlug(base: string, existing: string[]): string {
  if (!base || !existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
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
 * Full-page create/edit form for an event. `event` null means create mode.
 * `onSave(id, data, isNew)` does the Firestore write; this component only
 * collects + validates the fields. `onCancel` returns to wherever the host
 * wants (typically the events list).
 */
export function EventForm({
  event,
  categories,
  existingIds,
  onCancel,
  onSave,
}: {
  event: EventItem | null;
  categories: string[];
  existingIds: string[];
  onCancel: () => void;
  onSave: (id: string, data: EventInput, isNew: boolean) => Promise<void>;
}) {
  const isNew = event === null;

  const [title, setTitle] = useState(event?.title ?? "");
  // Empty for new events so the "Select a category…" placeholder shows; the
  // submit handler enforces that a category is chosen.
  const [category, setCategory] = useState(event?.category ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [image, setImage] = useState(event?.image ?? "");
  const [fee, setFee] = useState(
    event?.registrationFee != null ? String(event.registrationFee) : "",
  );
  const [limit, setLimit] = useState(
    event?.registrationLimit != null ? String(event.registrationLimit) : "",
  );
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "upcoming");
  const [order, setOrder] = useState(String(event?.order ?? ""));
  const [isActive, setIsActive] = useState(event?.isActive ?? true);
  const [registrationOpen, setRegistrationOpen] = useState(
    event?.registrationOpen ?? true,
  );
  // `date` holds the ISO value for the date picker; converted to/from the
  // stored display label via isoToLabel/labelToIso.
  const [date, setDate] = useState(labelToIso(event?.date ?? ""));
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [district, setDistrict] = useState(event?.district ?? "");
  const [details, setDetails] = useState((event?.details ?? []).join("\n"));
  const [rules, setRules] = useState((event?.rules ?? []).join("\n"));
  // Rules are optional per event: the toggle defaults on when the event
  // already has rules. Turning it off hides + clears the rules on save.
  const [hasRules, setHasRules] = useState((event?.rules?.length ?? 0) > 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    // The id (URL slug) is derived from the title and made unique so two
    // events can share a title; for existing events it never changes.
    const finalId = isNew ? uniqueSlug(slugify(title), existingIds) : event!.id;
    if (!finalId) {
      setError(
        "Could not derive a URL slug from the title. Add some letters or numbers.",
      );
      return;
    }
    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    const data: EventInput = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      registrationFee: fee.trim() ? Number(fee) : undefined,
      registrationLimit: limit.trim() ? Number(limit) : undefined,
      isActive,
      registrationOpen,
      order: order.trim() ? Number(order) : 0,
      status,
      date: date ? isoToLabel(date) : undefined,
      venue: venue.trim() || undefined,
      district: district.trim() || undefined,
      details: toLines(details).length ? toLines(details) : undefined,
      rules: hasRules && toLines(rules).length ? toLines(rules) : undefined,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Poster image — full width, top of the form */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="mb-4 font-heading text-base font-bold text-text">
          Event poster
        </h2>
        <ImageUploader
          value={image}
          onChange={setImage}
          folder="yuf-website/events"
        />
      </section>

      {/* Basics */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-heading text-base font-bold text-text">Basics</h2>

        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Title" htmlFor="ev-title" required>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>

          <Field label="Category" htmlFor="ev-category" required>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={categories.length === 0}
            >
              <SelectTrigger id="ev-category">
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-xs text-text-muted">
                No categories yet — go back and use the{" "}
                <span className="font-medium text-primary-700">Categories</span>{" "}
                button to create one first.
              </p>
            )}
          </Field>

          <Field label="Venue" htmlFor="ev-venue">
            <Input
              id="ev-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Chennai"
            />
          </Field>

          <Field label="District" htmlFor="ev-district">
            <Input
              id="ev-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Ponneri"
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
      </section>

      {/* Registration & scheduling */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-heading text-base font-bold text-text">
          Registration &amp; scheduling
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Registration Fee (₹)" htmlFor="ev-fee">
            <Input
              id="ev-fee"
              type="number"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0 (free)"
            />
          </Field>
          <Field label="Registration Limit" htmlFor="ev-limit">
            <Input
              id="ev-limit"
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Unlimited"
            />
            <p className="text-xs text-text-muted">Blank = unlimited.</p>
          </Field>
          <Field label="Date" htmlFor="ev-date">
            <Input
              id="ev-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Status" htmlFor="ev-status">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as EventStatus)}
            >
              <SelectTrigger id="ev-status">
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
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label
            htmlFor="ev-active"
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-alt px-4 py-3"
          >
            <span className="flex flex-col">
              <span className="text-sm font-medium text-text">Active</span>
              <span className="text-xs text-text-muted">
                Visible on the public site
              </span>
            </span>
            <Switch id="ev-active" checked={isActive} onCheckedChange={setIsActive} />
          </label>
          <label
            htmlFor="ev-reg-open"
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-alt px-4 py-3"
          >
            <span className="flex flex-col">
              <span className="text-sm font-medium text-text">
                Registration open
              </span>
              <span className="text-xs text-text-muted">Accepts new sign-ups</span>
            </span>
            <Switch
              id="ev-reg-open"
              checked={registrationOpen}
              onCheckedChange={setRegistrationOpen}
            />
          </label>
        </div>
      </section>

      {/* Detail page content */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div>
          <h2 className="font-heading text-base font-bold text-text">
            Detail page content
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Extra copy shown on the public event detail page.
          </p>
        </div>

        {/* Rules toggle — full width so the two textareas below stay aligned */}
        <label
          htmlFor="ev-has-rules"
          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-alt px-4 py-3"
        >
          <span className="flex flex-col">
            <span className="text-sm font-medium text-text">
              This event has rules
            </span>
            <span className="text-xs text-text-muted">
              Show a rules / guidelines list on the detail page
            </span>
          </span>
          <Switch
            id="ev-has-rules"
            checked={hasRules}
            onCheckedChange={setHasRules}
          />
        </label>

        <div className={cn("grid items-start gap-5", hasRules && "lg:grid-cols-2")}>
          <Field label="Detail paragraphs (one per line)" htmlFor="ev-details">
            <Textarea
              id="ev-details"
              className="min-h-60"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Leave blank to use the description."
            />
          </Field>

          {hasRules && (
            <Field label="Rules / guidelines (one per line)" htmlFor="ev-rules">
              <Textarea
                id="ev-rules"
                className="min-h-60"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="One rule per line"
              />
            </Field>
          )}
        </div>
      </section>

      {/* Advanced */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display order" htmlFor="ev-order">
            <Input
              id="ev-order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-text-muted">
              Lower numbers appear first within a category.
            </p>
          </Field>
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
      )}

      <div className="sticky bottom-0 -mx-8 flex justify-end gap-3 border-t border-border bg-surface-alt/80 px-8 py-4 backdrop-blur">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Saving…" : isNew ? "Create Event" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
