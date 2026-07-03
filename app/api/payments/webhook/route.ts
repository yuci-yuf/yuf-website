import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — the AUTHORITATIVE payment confirmation.
 *
 * Verifies the signature against the raw body, then reconciles the matching
 * registration. Idempotent: replays don't double-confirm, and a failure
 * releases the reserved slot.
 *
 * Configure in the Razorpay dashboard → Webhooks with events
 * `payment.captured` and `payment.failed`, pointing at
 * https://<host>/api/payments/webhook, using RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  if (!orderId) return NextResponse.json({ ok: true }); // nothing to reconcile

  const adminDb = getAdminDb();
  const regs = adminDb.collection("registrations");
  const found = await regs.where("orderId", "==", orderId).limit(1).get();
  if (found.empty) return NextResponse.json({ ok: true });

  const ref = found.docs[0].ref;
  const data = found.docs[0].data();

  if (event.event === "payment.captured" || event.event === "order.paid") {
    if (data.status !== "confirmed") {
      await ref.update({
        paymentStatus: "paid",
        status: "confirmed",
        paymentId: payment?.id ?? data.paymentId ?? null,
        paidAt: FieldValue.serverTimestamp(),
      });
    }
  } else if (event.event === "payment.failed") {
    // Only release a still-pending hold (never touch a confirmed reg).
    if (data.status === "pending") {
      await adminDb.runTransaction(async (tx) => {
        tx.update(ref, { paymentStatus: "failed" });
        if (data.eventId) {
          tx.update(adminDb.collection("events").doc(data.eventId), {
            registrationCount: FieldValue.increment(-1),
          });
        }
      });
    }
  }

  return NextResponse.json({ ok: true });
}
