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
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
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

/**
 * Human-readable "School" / "College" for a registration. Prefers the stored
 * `institutionType`; for legacy records that predate that field, infers it from
 * the `institution` string (which was formatted as "... (School — ...)" /
 * "... (College — ...)"). Returns "" when neither is available.
 */
export function institutionTypeLabel(r: Registration): string {
  if (r.institutionType === "school") return "School";
  if (r.institutionType === "college") return "College";
  if (/\(School\b/i.test(r.institution)) return "School";
  if (/\(College\b/i.test(r.institution)) return "College";
  return "";
}

function mapRegistration(id: string, data: DocumentData): Registration {
  return {
    id,
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    location: data.location ?? "",
    institution: data.institution ?? "",
    institutionType: data.institutionType ?? "",
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
    checkedIn: Boolean(data.checkedIn),
    checkedInAt: toISO(data.checkedInAt),
    checkedInBy: data.checkedInBy ?? "",
  } satisfies Registration;
}

export async function getRegistrations(): Promise<Registration[]> {
  const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapRegistration(d.id, d.data()));
}

/**
 * Result of an entry-desk verification. `registration` is present for every
 * outcome except `not_found`, so the desk can still show who a code belongs to
 * even when it can't be admitted.
 */
export type CheckInResult =
  | { result: "ok"; registration: Registration }
  | { result: "already"; registration: Registration; checkedInAt: string | null }
  | { result: "not_confirmed"; registration: Registration }
  | { result: "not_found" };

/**
 * Result of a lookup-only verification (no write). `eligible` means the code
 * belongs to a confirmed registration that hasn't been checked in yet, so the
 * desk can review the identity and then confirm the check-in.
 */
export type VerifyResult =
  | { result: "eligible"; registration: Registration }
  | { result: "already"; registration: Registration; checkedInAt: string | null }
  | { result: "not_confirmed"; registration: Registration }
  | { result: "not_found" };

/**
 * Look up a registration by its code WITHOUT checking it in. Used by the entry
 * desk to display who the pass belongs to so the operator can verify identity
 * before admitting them (the actual check-in is a separate confirm step —
 * `checkInRegistration`).
 */
export async function verifyRegistration(
  rawCode: string,
): Promise<VerifyResult> {
  const code = normalizeCode(rawCode);
  if (!code) return { result: "not_found" };

  const q = query(
    collection(db, "registrations"),
    where("registrationCode", "==", code),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return { result: "not_found" };

  const registration = mapRegistration(snap.docs[0].id, snap.docs[0].data());
  if (registration.status !== "confirmed") {
    return { result: "not_confirmed", registration };
  }
  if (registration.checkedIn) {
    return {
      result: "already",
      registration,
      checkedInAt: registration.checkedInAt ?? null,
    };
  }
  return { result: "eligible", registration };
}

/**
 * Pull the registration code out of a scanned QR value. The QR encodes the raw
 * code, but tolerate a full URL (…/YUF26-XXXXXX) or surrounding whitespace so a
 * pass scanned from a different source still resolves. Uppercased to match how
 * codes are stored/typed.
 */
export function normalizeCode(raw: string): string {
  const trimmed = raw.trim();
  const tail = trimmed.split(/[/?#]/).filter(Boolean).pop() ?? trimmed;
  return tail.toUpperCase();
}

/**
 * Verify a registration code (from a QR scan or manual entry) and, if it's a
 * confirmed registration that hasn't been used, atomically mark it checked in.
 *
 * The transaction guarantees single-use: if two desks scan the same pass at
 * once, exactly one gets `ok` and the other gets `already`. Called only after
 * the operator has reviewed the identity (see `verifyRegistration`).
 */
export async function checkInRegistration(
  rawCode: string,
  by: string,
): Promise<CheckInResult> {
  const code = normalizeCode(rawCode);
  if (!code) return { result: "not_found" };

  const q = query(
    collection(db, "registrations"),
    where("registrationCode", "==", code),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return { result: "not_found" };
  const ref = snap.docs[0].ref;

  return runTransaction(db, async (tx) => {
    const fresh = await tx.get(ref);
    if (!fresh.exists()) return { result: "not_found" };
    const data = fresh.data();
    const registration = mapRegistration(fresh.id, data);

    if (data.status !== "confirmed") {
      return { result: "not_confirmed", registration };
    }
    if (data.checkedIn === true) {
      return {
        result: "already",
        registration,
        checkedInAt: toISO(data.checkedInAt),
      };
    }
    tx.update(ref, {
      checkedIn: true,
      checkedInAt: serverTimestamp(),
      checkedInBy: by,
    });
    return { result: "ok", registration: { ...registration, checkedIn: true } };
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

/** Fetch a single event by id (for the per-event registrations header). */
export async function getEventById(id: string): Promise<EventItem | null> {
  const snap = await getDoc(doc(db, "events", id));
  if (!snap.exists()) return null;
  return normalizeEvent(snap.id, snap.data());
}

/** All registrations for one event (client SDK, admin-only per security rules). */
export async function getRegistrationsForEvent(
  eventId: string,
): Promise<Registration[]> {
  const q = query(
    collection(db, "registrations"),
    where("eventId", "==", eventId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => mapRegistration(d.id, d.data()))
    // Newest first. Sort in memory so no composite (eventId + createdAt) index
    // is required just for this admin view.
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
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
    if (loc.city) out.city = loc.city;
    if (loc.address) out.address = loc.address;
    if (loc.date) out.date = loc.date;
    if (typeof loc.registrationLimit === "number")
      out.registrationLimit = loc.registrationLimit;
    if (loc.audience) out.audience = loc.audience;
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
  // Map any explicitly-cleared field (undefined) to deleteField() so it is
  // REMOVED from the doc rather than left untouched — otherwise clearing an
  // optional field (e.g. the rule book) has no effect on an update. Fields not
  // present in `data` are never touched.
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "locations") continue; // handled below
    payload[key] = value === undefined ? deleteField() : value;
  }
  if (hasLocations) payload.locations = locations ?? [];
  await updateDoc(doc(db, "events", id), payload);
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

// ── Global registration settings ──
/** Turn registration on/off site-wide and set the closed message. */
export async function setRegistrationSettings(
  open: boolean,
  closedTitle: string,
  closedMessage: string,
): Promise<void> {
  await setDoc(
    doc(db, "settings", "registration"),
    { open, closedTitle: closedTitle.trim(), closedMessage: closedMessage.trim() },
    { merge: true },
  );
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
