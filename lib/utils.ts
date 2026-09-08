import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join conditional class names, with Tailwind-aware conflict resolution
 * (later classes win, e.g. `px-2` then `px-4` → `px-4`). Backed by clsx +
 * tailwind-merge so both our hand-rolled primitives and shadcn-style
 * components share one helper.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Map a content-layer CTA variant ("primary" | "secondary" | "outline") to a
 * shadcn Button variant. The content/CMS schema keeps its own vocabulary; this
 * translates it at the call site so we don't have to migrate stored data.
 */
export function ctaButtonVariant(
  variant?: "primary" | "secondary" | "outline",
): "default" | "secondary" | "outline" {
  if (variant === "outline") return "outline";
  // Both "primary" and "secondary" content CTAs render as a filled brand
  // button (shadcn "secondary" is a pale neutral, which reads as disabled on
  // our colored hero/banners), so collapse them to "default".
  return "default";
}

/* ── Event-date parsing & auto-close ─────────────────────────────────────
   Event/location dates are stored as free text ("24th September 2026",
   "10th Sept 2026", "18th September 2026"). Registration must auto-close at
   12 AM IST on the event day (an event on the 10th is closed from 00:00 on
   the 10th). We compute this live rather than storing a flag, so it's always
   correct without a scheduled job. */

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
  sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parse a free-text event date like "24th September 2026" / "10th Sept 2026"
 * into a UTC timestamp for **00:00 IST on that day** (IST = UTC+5:30, so
 * midnight IST is 18:30 UTC the previous day). Returns null if unparseable —
 * callers treat null as "no known date" (never auto-close).
 */
export function parseEventDateISTMidnight(text?: string): number | null {
  if (!text) return null;
  const day = text.match(/(\d{1,2})/)?.[1];
  const monWord = text.match(/([A-Za-z]+)/g)?.find((w) => w.toLowerCase() in MONTHS);
  const year = text.match(/(\d{4})/)?.[1];
  if (!day || !monWord || !year) return null;
  const month = MONTHS[monWord.toLowerCase()];
  // 00:00 IST == 18:30 UTC on the previous calendar day.
  return Date.UTC(Number(year), month, Number(day), 0, 0, 0) - 5.5 * 60 * 60 * 1000;
}

/**
 * True if the event day has begun (or passed) — i.e. it is now at/after
 * 00:00 IST on the given date. Unparseable/empty dates return false (stay
 * open). `now` is injectable for testing.
 */
export function isEventDatePast(dateText?: string, now: number = Date.now()): boolean {
  const start = parseEventDateISTMidnight(dateText);
  return start !== null && now >= start;
}
