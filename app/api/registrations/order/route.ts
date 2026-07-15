import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import {
  getAdminDb,
  getRegistrationSettings,
  releaseLocationSlot,
} from "@/lib/firebase-admin";
import { getRazorpay } from "@/lib/razorpay";
import { computeInvoice } from "@/lib/pricing";
import { claimUniqueRegistrationCode } from "@/lib/registration-code";
import { sendRegistrationEmailOnce } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-side validation with hard length caps so a malicious client can't
// stuff huge strings into Firestore or the email template. The server owns the
// amount, status, code and event/location snapshots — only participant-identity
// fields come from the request, and every one is bounded here.
const trimmed = (max: number) => z.string().trim().max(max);
const OrderSchema = z.object({
  firstName: trimmed(80).min(1),
  lastName: trimmed(80).default(""),
  email: trimmed(254).min(1).regex(/^\S+@\S+\.\S+$/, "Invalid email."),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone must be 10 digits."),
  location: trimmed(200).min(1),
  institution: trimmed(200).min(1),
  institutionType: z.enum(["school", "college", ""]).optional(),
  ageCategory: trimmed(60).default(""),
  eventId: trimmed(200).min(1),
  /** Which event location the participant is registering for. */
  locationId: trimmed(200).optional(),
  idempotencyKey: trimmed(200).min(1),
});
type OrderBody = z.infer<typeof OrderSchema>;

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = OrderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 },
    );
  }
  const body: OrderBody = parsed.data;

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
      // Fully-formed prior attempt — return it verbatim.
      return NextResponse.json({
        registrationId: d.id,
        code: data.registrationCode,
        orderId: data.orderId,
        amount: Math.round((data.amountPaid ?? 0) * 100),
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }
    // The first attempt reserved the slot + claimed the code but died before
    // writing `orderId` (e.g. the Razorpay call hung). RESUME that reg instead
    // of falling through to a second reservation, which would double-count the
    // slot. Free regs get confirmed on creation and never lack an orderId, so a
    // pending paid reg here just needs its order (re)created.
    const amountPaid = typeof data.amountPaid === "number" ? data.amountPaid : 0;
    if (amountPaid > 0 && data.status === "pending") {
      try {
        const order = await getRazorpay().orders.create({
          amount: Math.round(amountPaid * 100),
          currency: "INR",
          receipt: d.id,
          notes: {
            registrationId: d.id,
            code: data.registrationCode,
            eventId: body.eventId,
          },
        });
        await d.ref.update({ orderId: order.id });
        return NextResponse.json({
          registrationId: d.id,
          code: data.registrationCode,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        });
      } catch (err) {
        console.error("order: resume (order create) failed", err);
        return NextResponse.json(
          { error: "Could not start payment. Please try again." },
          { status: 502 },
        );
      }
    }
  }

  const eventRef = adminDb.collection("events").doc(body.eventId);
  const regRef = regs.doc();

  // ── Reserve a slot + create the pending registration atomically ──
  let base = 0;
  let category = "";
  let title = "";
  let code = "";
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(eventRef);
      if (!snap.exists) throw new Error("EVENT_NOT_FOUND");
      const ev = snap.data()!;
      if (ev.registrationOpen === false) throw new Error("CLOSED");

      // Claim a guaranteed-unique code. Must run before any tx write below —
      // Firestore requires all reads (this does a tx.get per candidate) to
      // precede writes within a transaction.
      code = await claimUniqueRegistrationCode(tx, adminDb, regRef.id);

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
    if (msg === "CODE_ALLOCATION_FAILED") {
      console.error("order: could not allocate a unique registration code", err);
      return NextResponse.json(
        { error: "Could not generate a registration code. Please try again." },
        { status: 503 },
      );
    }
    console.error("order: reservation failed", err);
    return NextResponse.json({ error: "Could not reserve a spot." }, { status: 500 });
  }

  const invoice = computeInvoice(base);

  // Free event → confirm immediately, no payment needed.
  if (invoice.total <= 0) {
    await regRef.update({ paymentStatus: "paid", status: "confirmed" });
    // No Razorpay payment means NO webhook fires for free events — so the client
    // is the only other trigger, and a page reload would lose the email. Send it
    // server-side here (idempotent: the client's call will no-op if this wins).
    await sendRegistrationEmailOnce(adminDb, regRef).catch((err) => {
      console.error("order: free-event confirmation email failed", err);
    });
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
    // Release the slot we reserved so it isn't stuck, then drop the pending reg
    // and free its claimed code so the code space stays clean.
    await releaseLocationSlot(adminDb, eventRef, body.locationId);
    await adminDb.collection("registrationCodes").doc(code).delete().catch(() => {});
    await regRef.delete();
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
