import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyPaymentSignature } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fast-path confirmation from the client checkout callback. Verifies the
 * Razorpay handler signature and confirms the registration. The webhook
 * remains the authoritative source of truth (this just gives instant UX).
 */
export async function POST(req: Request) {
  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    registrationId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } =
    body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
  }

  const adminDb = getAdminDb();
  const ref = adminDb.collection("registrations").doc(registrationId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.orderId !== razorpay_order_id) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  if (snap.data()?.status !== "confirmed") {
    await ref.update({
      paymentStatus: "paid",
      status: "confirmed",
      paymentId: razorpay_payment_id,
      paidAt: FieldValue.serverTimestamp(),
    });
  }

  return NextResponse.json({ ok: true, code: snap.data()?.registrationCode });
}
