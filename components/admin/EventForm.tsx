"use client";

import { useState, type FormEvent } from "react";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
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
import { PdfUploader } from "@/components/admin/PdfUploader";
import { getEventLocations } from "@/lib/event-groups";
import type { EventInput } from "@/lib/admin-data";
import type {
  EventAudience,
  EventItem,
  EventLocation,
  EventStatus,
} from "@/types";

const STATUSES: EventStatus[] = ["upcoming", "ongoing", "past"];
const AUDIENCES: { value: EventAudience; label: string }[] = [
  { value: "both", label: "School & College" },
  { value: "school", label: "School only" },
  { value: "college", label: "College only" },
];

/**
 * A location row in the form. Dates are held as ISO strings for the native
 * picker (converted to/from the stored display label on load/save). `count`
 * carries the existing registrationCount through an edit so it isn't reset.
 */
interface LocationDraft {
  /** React list key + form-field key (UI only). */
  key: string;
  /**
   * The persisted location id. Empty for a newly added row; assigned on save.
   * Preserved for existing locations so their registrations stay linked.
   */
  id: string;
  city: string;
  address: string;
  dateIso: string;
  /**
   * The date label as originally loaded. Preserved so a label the picker can't
   * fully represent — a range like "11th – 13th Sept 2026" — isn't silently
   * collapsed to a single day when the admin saves without touching the date.
   */
  originalDateLabel: string;
  limit: string;
  count: number;
}

let locationKeySeq = 0;
function nextLocationKey(): string {
  locationKeySeq += 1;
  return `loc-${locationKeySeq}`;
}

function emptyLocation(): LocationDraft {
  return {
    key: nextLocationKey(),
    id: "",
    city: "",
    address: "",
    dateIso: "",
    originalDateLabel: "",
    limit: "",
    count: 0,
  };
}

/** Slug used as a fallback location id when a row has no persisted id yet. */
function slugifyLocation(l: LocationDraft, index: number): string {
  const base = [l.city, l.address, l.dateIso]
    .map((s) => s.trim())
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `loc-${index + 1}`;
}

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

  // Normalize common festival-label quirks that `new Date()` can't parse:
  // ordinal suffixes ("2nd" → "2"), "Sept" → "Sep", and date ranges
  // ("11th – 13th Sept 2026" → take the first day). This lets the native date
  // picker show a value for labels seeded in human-readable form.
  let normalized = label
    .replace(/(\d+)(st|nd|rd|th)/gi, "$1") // 2nd → 2
    .replace(/\bsept\b/gi, "Sep"); // Sept → Sep

  // Date range → keep only the first date's day, borrowing the month/year that
  // trail the range (e.g. "11 - 13 Sep 2026" → "11 Sep 2026").
  const range = normalized.match(
    /^(\d{1,2})\s*[–—-]\s*\d{1,2}(\s+\w+\s+\d{4})$/,
  );
  if (range) normalized = `${range[1]}${range[2]}`;

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return ""; // still unparseable
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
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "upcoming");
  const [audience, setAudience] = useState<EventAudience>(
    event?.audience ?? "both",
  );
  const [order, setOrder] = useState(String(event?.order ?? ""));
  const [isActive, setIsActive] = useState(event?.isActive ?? true);
  const [registrationOpen, setRegistrationOpen] = useState(
    event?.registrationOpen ?? true,
  );
  // Locations: seeded from the event (via the legacy-aware helper), always at
  // least one row so the form has something to fill in.
  const [locations, setLocations] = useState<LocationDraft[]>(() => {
    const existing = event ? getEventLocations(event) : [];
    if (existing.length === 0) return [emptyLocation()];
    return existing.map((loc) => ({
      key: nextLocationKey(),
      id: loc.id,
      city: loc.city ?? "",
      address: loc.address ?? "",
      dateIso: labelToIso(loc.date ?? ""),
      originalDateLabel: loc.date ?? "",
      limit: loc.registrationLimit != null ? String(loc.registrationLimit) : "",
      count: loc.registrationCount ?? 0,
    }));
  });
  const [details, setDetails] = useState((event?.details ?? []).join("\n"));
  const [guidelines, setGuidelines] = useState(
    (event?.guidelines ?? []).join("\n"),
  );
  const [rules, setRules] = useState((event?.rules ?? []).join("\n"));
  const [ruleBook, setRuleBook] = useState(event?.ruleBook ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateLocation(key: string, patch: Partial<LocationDraft>) {
    setLocations((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    );
  }
  function addLocation() {
    setLocations((prev) => [...prev, emptyLocation()]);
  }
  function removeLocation(key: string) {
    setLocations((prev) =>
      prev.length <= 1 ? prev : prev.filter((l) => l.key !== key),
    );
  }

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

    // Build the locations array. A location counts as "filled in" if it has any
    // of city/address/date; blank rows are dropped. Existing rows keep their
    // id (so registrations stay linked); new rows get a slug, de-duplicated.
    const usedIds = new Set<string>();
    const builtLocations: EventLocation[] = locations
      .filter((l) => l.city.trim() || l.address.trim() || l.dateIso)
      .map((l, i) => {
        let id = l.id || slugifyLocation(l, i);
        while (usedIds.has(id)) id = `${id}-${i + 1}`;
        usedIds.add(id);
        // Keep the original label (e.g. a "11th – 13th Sept" range) when the
        // admin didn't change the date; otherwise convert the picked ISO value.
        const dateUnchanged =
          !!l.originalDateLabel &&
          l.dateIso === labelToIso(l.originalDateLabel);
        const date = dateUnchanged
          ? l.originalDateLabel
          : l.dateIso
            ? isoToLabel(l.dateIso)
            : undefined;
        return {
          id,
          city: l.city.trim() || undefined,
          address: l.address.trim() || undefined,
          date,
          registrationLimit: l.limit.trim() ? Number(l.limit) : undefined,
          registrationCount: l.count,
        };
      });

    if (builtLocations.length === 0) {
      setError("Add at least one location (a city, address, or date).");
      return;
    }

    // City is required on every location: the public register page filters
    // events by city, so a location without one would never be selectable.
    if (builtLocations.some((l) => !l.city)) {
      setError("Every location needs a City (used to filter events on the register page).");
      return;
    }

    const data: EventInput = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      registrationFee: fee.trim() ? Number(fee) : undefined,
      isActive,
      registrationOpen,
      order: order.trim() ? Number(order) : 0,
      status,
      audience,
      locations: builtLocations,
      // Legacy flat fields are superseded by `locations`; clear them so there's
      // a single source of truth.
      date: undefined,
      venue: undefined,
      district: undefined,
      registrationLimit: undefined,
      details: toLines(details).length ? toLines(details) : undefined,
      guidelines: toLines(guidelines).length ? toLines(guidelines) : undefined,
      rules: toLines(rules).length ? toLines(rules) : undefined,
      ruleBook: ruleBook.trim() || undefined,
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
              <SelectTrigger id="ev-category" className="w-full">
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Registration Fee (₹)"
            htmlFor="ev-fee"
            description="Shared across all locations of this event."
          >
            <Input
              id="ev-fee"
              type="number"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0 (free)"
            />
          </Field>
          <Field
            label="Open to"
            htmlFor="ev-audience"
            description="Who can register for this event."
          >
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as EventAudience)}
            >
              <SelectTrigger id="ev-audience" className="w-full">
                <SelectValue placeholder="School & College" />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Status"
            htmlFor="ev-status"
            description="Scheduling state shown on the site."
          >
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as EventStatus)}
            >
              <SelectTrigger id="ev-status" className="w-full">
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

      {/* Locations — one or more places/dates this event runs */}
      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div>
          <h2 className="font-heading text-base font-bold text-text">
            Locations &amp; dates
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Add every place this event runs. Fee and details above are shared;
            each location has its own date and registration limit. Registrations
            are tracked per location.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {locations.map((loc, i) => (
            <div
              key={loc.key}
              className="relative rounded-xl border border-border bg-surface-alt p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text">
                  <MapPin size={14} className="text-primary-600" />
                  Location {i + 1}
                  {loc.count > 0 && (
                    <span className="ml-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {loc.count} registered
                    </span>
                  )}
                </span>
                {locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLocation(loc.key)}
                    className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                    aria-label={`Remove location ${i + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="City" htmlFor={`loc-city-${loc.key}`} required>
                  <Input
                    id={`loc-city-${loc.key}`}
                    value={loc.city}
                    onChange={(e) =>
                      updateLocation(loc.key, { city: e.target.value })
                    }
                    placeholder="e.g. Chennai"
                  />
                </Field>
                <Field label="Address" htmlFor={`loc-address-${loc.key}`}>
                  <Input
                    id={`loc-address-${loc.key}`}
                    value={loc.address}
                    onChange={(e) =>
                      updateLocation(loc.key, { address: e.target.value })
                    }
                    placeholder="e.g. Velammal Bodhi Campus, Ponneri"
                  />
                </Field>
                <Field label="Date" htmlFor={`loc-date-${loc.key}`}>
                  <Input
                    id={`loc-date-${loc.key}`}
                    type="date"
                    value={loc.dateIso}
                    onChange={(e) =>
                      updateLocation(loc.key, { dateIso: e.target.value })
                    }
                  />
                </Field>
                <Field label="Limit" htmlFor={`loc-limit-${loc.key}`}>
                  <Input
                    id={`loc-limit-${loc.key}`}
                    type="number"
                    min="1"
                    value={loc.limit}
                    onChange={(e) =>
                      updateLocation(loc.key, { limit: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <div>
          <Button type="button" variant="outline" size="sm" onClick={addLocation}>
            <Plus size={16} />
            Add location
          </Button>
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

        <Field
          label="About — detail paragraphs (one per line)"
          htmlFor="ev-details"
        >
          <Textarea
            id="ev-details"
            className="min-h-40"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Leave blank to use the description."
          />
        </Field>

        <div className="grid items-start gap-5 lg:grid-cols-2">
          <Field
            label="General Guidelines (one per line)"
            htmlFor="ev-guidelines"
          >
            <Textarea
              id="ev-guidelines"
              className="min-h-60"
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              placeholder="One guideline per line"
            />
          </Field>

          <Field label="Rules & Regulations (one per line)" htmlFor="ev-rules">
            <Textarea
              id="ev-rules"
              className="min-h-60"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="One rule per line"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field
            label="Rule book (PDF, optional)"
            htmlFor="ev-rulebook"
            description="Attach a downloadable rule book. PDF only, up to 10 MB."
          >
            <PdfUploader value={ruleBook} onChange={setRuleBook} />
          </Field>
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
