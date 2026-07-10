import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getRegistrationSettings } from "@/lib/firebase-admin";
import { computeInvoice } from "@/lib/pricing";
import { generateRegistrationCode } from "@/lib/registration-code";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public registration WITHOUT a payment step.
 *
 * Payment is currently deferred, so the browser can't be trusted to create the
 * `registrations` doc itself (Firestore rules keep `create: if false`). This
 * route writes it authoritatively via the Admin SDK: it re-reads the event to
 * honour the latest fee, reserves a per-location slot atomically, and records
 * the registration as confirmed / payment-pending. The client only supplies
 * participant details and the chosen event/location — the amount, status, and
 * registration code are all decided here so they can't be forged.
 */
interface CreateBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  institution: string;
  institutionType?: "school" | "college" | "";
  ageCategory?: string;
  eventId: string;
  /** Which event location the participant is registering for. */
  locationId?: string;
}

function isValid(b: Partial<CreateBody>): b is CreateBody {
  return Boolean(
    b &&
      b.firstName?.trim() &&
      b.lastName?.trim() &&
      b.email?.trim() &&
      /^[6-9]\d{9}$/.test(b.phone ?? "") &&
      b.location?.trim() &&
      b.institution?.trim() &&
      b.eventId?.trim(),
  );
}

export async function POST(req: Request) {
  let body: Partial<CreateBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValid(body)) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 },
    );
  }

  const adminDb = getAdminDb();

  // Global switch — refuse sign-ups when registration is closed site-wide.
  const settings = await getRegistrationSettings(adminDb);
  if (!settings.open) {
    return NextResponse.json({ error: settings.closedMessage }, { status: 403 });
  }

  const eventRef = adminDb.collection("events").doc(body.eventId);
  const regRef = adminDb.collection("registrations").doc();
  const code = generateRegistrationCode();

  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(eventRef);
      if (!snap.exists) throw new Error("EVENT_NOT_FOUND");
      const ev = snap.data()!;
      if (ev.registrationOpen === false) throw new Error("CLOSED");

      const base = typeof ev.registrationFee === "number" ? ev.registrationFee : 0;
      const category = (ev.category as string) ?? "";
      const title = (ev.title as string) ?? "";
      const total = computeInvoice(base).total;

      // Per-location capacity. When the event has a `locations` array we reserve
      // against the chosen location's count/limit and write the array back
      // (Firestore can't increment an array element, so we re-write the array —
      // atomic inside the transaction). Legacy events (no array) fall back to
      // the whole-doc registrationCount.
      const locations = Array.isArray(ev.locations)
        ? (ev.locations as Record<string, unknown>[])
        : null;

      let locationSnapshot: { venue: string; date: string } = {
        venue: "",
        date: "",
      };

      if (locations && locations.length > 0) {
        const idx = body.locationId
          ? locations.findIndex((l) => l.id === body.locationId)
          : 0;
        if (idx < 0) throw new Error("LOCATION_NOT_FOUND");
        const loc = locations[idx];
        const limit =
          typeof loc.registrationLimit === "number" ? loc.registrationLimit : null;
        const count =
          typeof loc.registrationCount === "number" ? loc.registrationCount : 0;
        if (limit !== null && count >= limit) throw new Error("FULL");

        const nextLocations = locations.map((l, i) =>
          i === idx ? { ...l, registrationCount: count + 1 } : l,
        );
        tx.update(eventRef, {
          locations: nextLocations,
          registrationCount: FieldValue.increment(1),
        });
        locationSnapshot = {
          venue: (loc.address as string) || (loc.city as string) || "",
          date: (loc.date as string) || "",
        };
      } else {
        const limit =
          typeof ev.registrationLimit === "number" ? ev.registrationLimit : null;
        const count =
          typeof ev.registrationCount === "number" ? ev.registrationCount : 0;
        if (limit !== null && count >= limit) throw new Error("FULL");
        tx.update(eventRef, { registrationCount: FieldValue.increment(1) });
        locationSnapshot = {
          venue: (ev.venue as string) || (ev.district as string) || "",
          date: (ev.date as string) || "",
        };
      }

      tx.set(regRef, {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        location: body.location,
        institution: body.institution,
        institutionType: body.institutionType ?? "",
        ageCategory: body.ageCategory ?? "",
        eventCategory: category,
        eventId: body.eventId,
        eventTitle: title,
        locationId: body.locationId ?? "",
        locationVenue: locationSnapshot.venue,
        locationDate: locationSnapshot.date,
        registrationCode: code,
        amountPaid: total,
        // Payment deferred: the spot is held (confirmed) but not yet paid.
        paymentStatus: "pending",
        status: "confirmed",
        checkedIn: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    if (msg === "FULL")
      return NextResponse.json({ error: "This event is full." }, { status: 409 });
    if (msg === "CLOSED")
      return NextResponse.json(
        { error: "Registration is closed." },
        { status: 409 },
      );
    if (msg === "EVENT_NOT_FOUND")
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    if (msg === "LOCATION_NOT_FOUND")
      return NextResponse.json(
        { error: "Selected location not found." },
        { status: 404 },
      );
    console.error("create: registration failed", err);
    return NextResponse.json(
      { error: "Could not save your registration." },
      { status: 500 },
    );
  }

  return NextResponse.json({ registrationId: regRef.id, code });
}
