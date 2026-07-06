/**
 * Public-facing content loaders.
 *
 * These read CMS data from Firestore (events, categories, gallery). There is
 * intentionally NO fallback to the hardcoded defaults: the public site shows
 * exactly what the admin has published, and empty collections render empty
 * states. Everything here uses the Firebase client SDK and runs in Server
 * Components.
 */
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EventItem, EventLocation } from "@/types";

/** Read a stored `locations` array into typed EventLocation[]. */
export function normalizeLocations(raw: unknown): EventLocation[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const locations = raw
    .filter((l): l is Record<string, unknown> => !!l && typeof l === "object")
    .map((l, i) => ({
      id: typeof l.id === "string" && l.id ? l.id : `loc-${i}`,
      city: typeof l.city === "string" ? l.city : undefined,
      address: typeof l.address === "string" ? l.address : undefined,
      date: typeof l.date === "string" ? l.date : undefined,
      registrationLimit:
        typeof l.registrationLimit === "number" ? l.registrationLimit : undefined,
      registrationCount:
        typeof l.registrationCount === "number" ? l.registrationCount : 0,
    }));
  return locations.length > 0 ? locations : undefined;
}

function normalizeEvent(id: string, data: Record<string, unknown>): EventItem {
  return {
    id,
    title: (data.title as string) ?? "",
    category: (data.category as string) ?? "",
    description: (data.description as string) ?? "",
    image: (data.image as string) ?? undefined,
    registrationFee:
      typeof data.registrationFee === "number"
        ? (data.registrationFee as number)
        : undefined,
    registrationLimit:
      typeof data.registrationLimit === "number"
        ? (data.registrationLimit as number)
        : undefined,
    registrationCount:
      typeof data.registrationCount === "number"
        ? (data.registrationCount as number)
        : 0,
    isActive: data.isActive !== false,
    registrationOpen: data.registrationOpen !== false,
    order: typeof data.order === "number" ? (data.order as number) : 0,
    homeOrder:
      typeof data.homeOrder === "number" ? (data.homeOrder as number) : undefined,
    status: (data.status as EventItem["status"]) ?? "upcoming",
    audience: (data.audience as EventItem["audience"]) ?? "both",
    details: Array.isArray(data.details) ? (data.details as string[]) : undefined,
    locations: normalizeLocations(data.locations),
    date: (data.date as string) ?? undefined,
    venue: (data.venue as string) ?? undefined,
    district: (data.district as string) ?? undefined,
    guidelines: Array.isArray(data.guidelines)
      ? (data.guidelines as string[])
      : undefined,
    rules: Array.isArray(data.rules) ? (data.rules as string[]) : undefined,
    ruleBook: (data.ruleBook as string) ?? undefined,
  };
}

/** All events from Firestore, ordered. Empty array when none exist. */
export async function getEvents(): Promise<EventItem[]> {
  try {
    const q = query(collection(db, "events"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeEvent(d.id, d.data()));
  } catch (e) {
    console.error("getEvents failed", e);
    return [];
  }
}

/**
 * A single event by id, read directly (so it works for events created after a
 * build, and always returns the latest fee/details). Undefined if missing.
 */
export async function getEventById(id: string): Promise<EventItem | undefined> {
  try {
    const snap = await getDoc(doc(db, "events", id));
    if (!snap.exists()) return undefined;
    return normalizeEvent(snap.id, snap.data());
  } catch (e) {
    console.error("getEventById failed", e);
    return undefined;
  }
}

/**
 * Ordered list of category names from the admin-managed `eventCategories`
 * collection. Empty array when none exist.
 */
export async function getCategoryOrder(): Promise<string[]> {
  try {
    const q = query(collection(db, "eventCategories"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => (d.data().name as string) ?? "").filter(Boolean);
  } catch (e) {
    console.error("getCategoryOrder failed", e);
    return [];
  }
}

/** Gallery photos from Firestore, ordered. Empty array when none exist. */
export async function getGalleryPhotos(): Promise<
  { src: string; alt: string }[]
> {
  try {
    const q = query(collection(db, "gallery"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return { src: (data.src as string) ?? "", alt: (data.alt as string) ?? "" };
    });
  } catch (e) {
    console.error("getGalleryPhotos failed", e);
    return [];
  }
}
