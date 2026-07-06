/**
 * Client-side Firestore reads/writes for the admin panel.
 *
 * These run in the browser using the Firebase client SDK. Per the PRD
 * security model only admins may read these collections; in development the
 * open getting-started rules allow it (they expire 2026-07-27, after which
 * production rules with isAdmin() must be in place).
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeLocations } from "@/lib/cms-data";
import type {
  ContactMessage,
  EventCategoryDoc,
  EventItem,
  GalleryImage,
  Registration,
} from "@/types";

function toISO(value: unknown): string | null {
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return null;
}

export async function getRegistrations(): Promise<Registration[]> {
  const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      location: data.location ?? "",
      institution: data.institution ?? "",
      eventCategory: data.eventCategory ?? "",
      eventId: data.eventId ?? "",
      eventTitle: data.eventTitle ?? "",
      locationId: data.locationId ?? "",
      locationVenue: data.locationVenue ?? "",
      locationDate: data.locationDate ?? "",
      ageCategory: data.ageCategory ?? "",
      message: data.message ?? "",
      amountPaid: data.amountPaid ?? 0,
      registrationCode: data.registrationCode ?? "",
      orderId: data.orderId ?? "",
      paymentId: data.paymentId ?? "",
      paymentStatus: data.paymentStatus ?? "pending",
      status: data.status ?? "pending",
      createdAt: toISO(data.createdAt),
      paidAt: toISO(data.paidAt),
    } satisfies Registration;
  });
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const q = query(
    collection(db, "contactSubmissions"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      subject: data.subject ?? "",
      message: data.message ?? "",
      isRead: Boolean(data.isRead),
      createdAt: toISO(data.createdAt),
    } satisfies ContactMessage;
  });
}

export async function setContactRead(id: string, isRead: boolean): Promise<void> {
  await updateDoc(doc(db, "contactSubmissions", id), { isRead });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, "contactSubmissions", id));
}

export async function setRegistrationStatus(
  id: string,
  status: Registration["status"],
): Promise<void> {
  await updateDoc(doc(db, "registrations", id), { status });
}

// ── Events CMS ──
// Events live in the `events` collection. The doc id is the event slug/id used
// in URLs (e.g. /events/<id>), so we write with setDoc on a chosen id rather
// than addDoc. The public site reads these (with lib/content.ts as fallback).

/**
 * Editable fields for an event (everything except the id). `registrationCount`
 * is system-managed by the public registration flow, not admin-editable, so it
 * is excluded here.
 */
export type EventInput = Omit<EventItem, "id" | "registrationCount">;

export async function getAdminEvents(): Promise<EventItem[]> {
  const q = query(collection(db, "events"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeEvent(d.id, d.data()));
}

/**
 * Prepare a `locations` array for Firestore: drop undefined per-location fields
 * (Firestore rejects them) and ensure each has a numeric `registrationCount`.
 * `preserveCounts` keeps whatever count the location already carries (used on
 * update so an edit never wipes live counts); create seeds them to 0.
 */
function prepareLocationsForWrite(
  locations: EventItem["locations"] | undefined,
  preserveCounts: boolean,
): Record<string, unknown>[] | undefined {
  if (!locations) return undefined;
  return locations.map((loc) => {
    const out: Record<string, unknown> = {
      id: loc.id,
      registrationCount: preserveCounts ? loc.registrationCount ?? 0 : 0,
    };
    if (loc.district) out.district = loc.district;
    if (loc.venue) out.venue = loc.venue;
    if (loc.date) out.date = loc.date;
    if (typeof loc.registrationLimit === "number")
      out.registrationLimit = loc.registrationLimit;
    return out;
  });
}

export async function createEvent(
  id: string,
  data: EventInput,
): Promise<void> {
  const locations = prepareLocationsForWrite(data.locations, false);
  // Seed registrationCount so the public capacity check has a number to read.
  await setDoc(doc(db, "events", id), {
    ...stripUndefined(data),
    ...(locations ? { locations } : {}),
    registrationCount: 0,
  });
}

export async function updateEvent(
  id: string,
  data: Partial<EventInput>,
): Promise<void> {
  const hasLocations = "locations" in data;
  const locations = prepareLocationsForWrite(data.locations, true);
  await updateDoc(doc(db, "events", id), {
    ...stripUndefined(data),
    ...(hasLocations ? { locations: locations ?? [] } : {}),
  });
}

/**
 * Persist the home-page display order for a set of events. Each entry writes
 * only the `homeOrder` field (leaving all other event data untouched), batched
 * so reordering a whole category is one atomic commit. Used by the "Arrange
 * Home Order" screen. Batched in chunks of 500 to respect Firestore's limit.
 */
export async function setHomeOrder(
  updates: { id: string; homeOrder: number }[],
): Promise<void> {
  for (let i = 0; i < updates.length; i += 500) {
    const batch = writeBatch(db);
    for (const u of updates.slice(i, i + 500)) {
      batch.update(doc(db, "events", u.id), { homeOrder: u.homeOrder });
    }
    await batch.commit();
  }
}

/**
 * Delete an event and cascade-delete its registrations, so no orphaned
 * registrations linger (which previously reattached to a new event that
 * reclaimed the same slug id). Registrations are removed in batches of 500 to
 * stay within Firestore's per-batch write limit.
 */
export async function deleteEvent(id: string): Promise<void> {
  const q = query(collection(db, "registrations"), where("eventId", "==", id));
  const snap = await getDocs(q);

  const regDocs = snap.docs;
  for (let i = 0; i < regDocs.length; i += 500) {
    const batch = writeBatch(db);
    for (const d of regDocs.slice(i, i + 500)) batch.delete(d.ref);
    await batch.commit();
  }

  await deleteDoc(doc(db, "events", id));
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

// ── Event categories ──

export async function getAdminCategories(): Promise<EventCategoryDoc[]> {
  const q = query(collection(db, "eventCategories"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: (data.name as string) ?? "",
      order: typeof data.order === "number" ? (data.order as number) : 0,
    } satisfies EventCategoryDoc;
  });
}

export async function createCategory(name: string, order: number): Promise<void> {
  await addDoc(collection(db, "eventCategories"), { name, order });
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<EventCategoryDoc, "id">>,
): Promise<void> {
  await updateDoc(doc(db, "eventCategories", id), { ...data });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "eventCategories", id));
}

// ── Gallery ──

export async function getAdminGallery(): Promise<GalleryImage[]> {
  const q = query(collection(db, "gallery"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      src: (data.src as string) ?? "",
      alt: (data.alt as string) ?? "",
      order: typeof data.order === "number" ? (data.order as number) : 0,
      createdAt: toISO(data.createdAt),
    } satisfies GalleryImage;
  });
}

export async function addGalleryImage(
  src: string,
  alt: string,
  order: number,
): Promise<void> {
  await addDoc(collection(db, "gallery"), {
    src,
    alt,
    order,
    createdAt: serverTimestamp(),
  });
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await deleteDoc(doc(db, "gallery", id));
}

/** Firestore rejects `undefined` field values; drop them before writing. */
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}
