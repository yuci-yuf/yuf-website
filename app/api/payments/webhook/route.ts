import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, releaseLocationSlot } from "@/lib/firebase-admin";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendRegistrationEmailOnce } from "@/lib/email";

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
    payload?: {
      payment?: {
        entity?: { id?: string; order_id?: string; amount?: number };
      };
    };
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
    // Defense-in-depth: confirm the captured amount matches what we billed
    // (amountPaid is stored in rupees; Razorpay reports paise). The signature
    // already proves the payload is authentic, so a mismatch means a
    // partial/altered capture — flag it and don't auto-confirm.
    const expectedPaise = Math.round((data.amountPaid ?? 0) * 100);
    const capturedPaise =
      typeof payment?.amount === "number" ? payment.amount : null;
    if (capturedPaise !== null && capturedPaise < expectedPaise) {
      console.error("webhook: underpaid capture", {
        orderId,
        expectedPaise,
        capturedPaise,
      });
      await ref.update({ paymentStatus: "amount_mismatch" });
      return NextResponse.json({ ok: true });
    }

    if (data.status !== "confirmed") {
      await ref.update({
        paymentStatus: "paid",
        status: "confirmed",
        paymentId: payment?.id ?? data.paymentId ?? null,
        paidAt: FieldValue.serverTimestamp(),
      });
    }
    // Send the confirmation email server-side. This is the RELIABLE path: it
    // fires even if the browser reloaded / closed / redirected before the
    // client's fast-path email call could run. Idempotent — if the client
    // already sent it, this no-ops. Never let an email failure fail the webhook
    // (Razorpay would retry the whole event), so we swallow errors here.
    await sendRegistrationEmailOnce(adminDb, ref).catch((err) => {
      console.error("webhook: confirmation email failed", err);
    });
  } else if (event.event === "payment.failed") {
    // Only release a still-pending hold (never touch a confirmed reg).
    if (data.status === "pending") {
      await ref.update({ paymentStatus: "failed" });
      if (data.eventId) {
        await releaseLocationSlot(
          adminDb,
          adminDb.collection("events").doc(data.eventId),
          data.locationId,
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
