/**
 * Location helpers for events.
 *
 * An event can run in multiple places that share all details (fee, description,
 * image, rules) but each have their own venue, date, and capacity — stored in
 * `EventItem.locations`. Legacy events have no `locations` array and instead
 * carry a single flat venue/date; `getEventLocations` normalizes both shapes so
 * the rest of the app reads one consistent structure.
 */
import type { EventAudience, EventItem, EventLocation } from "@/types";

/**
 * Short label for who an event is open to. Returns null for "both" (the
 * default) so the UI can skip the badge when there's nothing distinctive.
 */
export function audienceLabel(audience: EventAudience | undefined): string | null {
  switch (audience) {
    case "school":
      return "School only";
    case "college":
      return "College only";
    default:
      return null; // "both" or unset — open to everyone, no badge needed
  }
}

/**
 * The event's locations as a uniform array. When `locations` is set, it's
 * returned as-is. Otherwise a single implicit location is synthesized from the
 * legacy flat fields so old events keep working. Returns `[]` only when an
 * event has neither — callers treat that as "no scheduled location yet".
 */
export function getEventLocations(event: EventItem): EventLocation[] {
  if (event.locations && event.locations.length > 0) return event.locations;

  const hasFlat = event.venue || event.date || event.district;
  if (!hasFlat && event.registrationLimit == null) return [];

  return [
    {
      id: "default",
      city: event.district,
      address: event.venue,
      date: event.date,
      registrationLimit: event.registrationLimit,
      registrationCount: event.registrationCount ?? 0,
    },
  ];
}

/**
 * The distinguishing bits of a location split apart, so a UI can render the
 * (possibly long) place with truncation while keeping the short date always
 * visible. `place` prefers the short city, falling back to the full address.
 */
export function locationParts(location: EventLocation): {
  place: string;
  date: string;
} {
  const city = location.city?.trim() || "";
  const address = location.address?.trim() || "";
  const date = location.date?.trim() || "";
  return { place: city || address, date };
}

/** Remaining spots at a location, or null when it has no limit (unlimited). */
export function locationSpotsLeft(location: EventLocation): number | null {
  if (typeof location.registrationLimit !== "number") return null;
  return Math.max(0, location.registrationLimit - (location.registrationCount ?? 0));
}
