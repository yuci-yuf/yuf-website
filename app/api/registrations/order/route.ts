import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
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
  ageCategory: string;
  eventId: string;
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

      const limit =
        typeof ev.registrationLimit === "number" ? ev.registrationLimit : null;
      const count =
        typeof ev.registrationCount === "number" ? ev.registrationCount : 0;
      if (limit !== null && count >= limit) throw new Error("FULL");

      base = typeof ev.registrationFee === "number" ? ev.registrationFee : 0;
      category = (ev.category as string) ?? "";
      title = (ev.title as string) ?? "";
      const total = computeInvoice(base).total;

      tx.set(regRef, {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        location: body.location,
        institution: body.institution,
        ageCategory: body.ageCategory ?? "",
        eventCategory: category,
        eventId: body.eventId,
        eventTitle: title,
        registrationCode: code,
        idempotencyKey: body.idempotencyKey,
        amountPaid: total,
        paymentStatus: "pending",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.update(eventRef, { registrationCount: FieldValue.increment(1) });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ERROR";
    if (msg === "FULL")
      return NextResponse.json({ error: "This event is full." }, { status: 409 });
    if (msg === "CLOSED")
      return NextResponse.json({ error: "Registration is closed." }, { status: 409 });
    if (msg === "EVENT_NOT_FOUND")
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
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
    // Release the slot we reserved so it isn't stuck.
    await adminDb.runTransaction(async (tx) => {
      tx.update(eventRef, { registrationCount: FieldValue.increment(-1) });
      tx.delete(regRef);
    });
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
