import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  getAdminDb,
  getRegistrationSettings,
  releaseLocationSlot,
} from "@/lib/firebase-admin";
import { getRazorpay } from "@/lib/razorpay";
import { computeInvoice } from "@/lib/pricing";
import { generateRegistrationCode } from "@/lib/registration-code";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OrderBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  institution: string;
  institutionType?: "school" | "college" | "";
  ageCategory: string;
  eventId: string;
  /** Which event location the participant is registering for. */
  locationId?: string;
  idempotencyKey: string;
}

function isValid(b: Partial<OrderBody>): b is OrderBody {
  return Boolean(
    b &&
      b.firstName?.trim() &&
      b.email?.trim() &&
      /^\d{10}$/.test(b.phone ?? "") &&
      b.location?.trim() &&
      b.institution?.trim() &&
      b.eventId?.trim() &&
      b.idempotencyKey?.trim(),
  );
}

export async function POST(req: Request) {
  let body: Partial<OrderBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValid(body)) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const adminDb = getAdminDb();

  // Global switch — refuse sign-ups when registration is closed site-wide.
  const settings = await getRegistrationSettings(adminDb);
  if (!settings.open) {
    return NextResponse.json({ error: settings.closedMessage }, { status: 403 });
  }

  const regs = adminDb.collection("registrations");

  // ── Idempotency: if this attempt already reserved + ordered, return it ──
  const existing = await regs
    .where("idempotencyKey", "==", body.idempotencyKey)
    .limit(1)
    .get();
  if (!existing.empty) {
    const d = existing.docs[0];
    const data = d.data();
    if (data.orderId) {
      return NextResponse.json({
        registrationId: d.id,
        code: data.registrationCode,
        orderId: data.orderId,
        amount: Math.round((data.amountPaid ?? 0) * 100),
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }
  }

  const eventRef = adminDb.collection("events").doc(body.eventId);
  const regRef = regs.doc();
  const code = generateRegistrationCode();

  // ── Reserve a slot + create the pending registration atomically ──
  let base = 0;
  let category = "";
  let title = "";
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(eventRef);
      if (!snap.exists) throw new Error("EVENT_NOT_FOUND");
      const ev = snap.data()!;
      if (ev.registrationOpen === false) throw new Error("CLOSED");

      base = typeof ev.registrationFee === "number" ? ev.registrationFee : 0;
      category = (ev.category as string) ?? "";
      title = (ev.title as string) ?? "";
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
        idempotencyKey: body.idempotencyKey,
        amountPaid: total,
        paymentStatus: "pending",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    if (msg === "FULL")
      return NextResponse.json({ error: "This event is full." }, { status: 409 });
    if (msg === "CLOSED")
      return NextResponse.json({ error: "Registration is closed." }, { status: 409 });
    if (msg === "EVENT_NOT_FOUND")
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    if (msg === "LOCATION_NOT_FOUND")
      return NextResponse.json(
        { error: "Selected location not found." },
        { status: 404 },
      );
    console.error("order: reservation failed", err);
    return NextResponse.json({ error: "Could not reserve a spot." }, { status: 500 });
  }

  const invoice = computeInvoice(base);

  // Free event → confirm immediately, no payment needed.
  if (invoice.total <= 0) {
    await regRef.update({ paymentStatus: "paid", status: "confirmed" });
    return NextResponse.json({ registrationId: regRef.id, code, free: true });
  }

  // ── Create the Razorpay order; roll the reservation back on failure ──
  try {
    const order = await getRazorpay().orders.create({
      amount: invoice.total * 100, // paise
      currency: "INR",
      receipt: regRef.id,
      notes: { registrationId: regRef.id, code, eventId: body.eventId },
    });
    await regRef.update({ orderId: order.id });
    return NextResponse.json({
      registrationId: regRef.id,
      code,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("order: razorpay create failed", err);
    // Release the slot we reserved so it isn't stuck, then drop the pending reg.
    await releaseLocationSlot(adminDb, eventRef, body.locationId);
    await regRef.delete();
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
