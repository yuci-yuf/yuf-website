/**
 * Razorpay helpers — SERVER ONLY.
 *
 * Wraps order creation and the two signature checks:
 *  - payment signature (from the client checkout callback), and
 *  - webhook signature (from Razorpay's server-to-server webhook).
 * Keys come from env; never expose RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET
 * to the client.
 */
import crypto from "crypto";
import Razorpay from "razorpay";

export function getRazorpay(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys (RAZORPAY_KEY_ID/SECRET) are not configured.");
  }
  return new Razorpay({ key_id, key_secret });
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Verify the checkout-callback signature: HMAC(order_id|payment_id, key_secret). */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/** Verify a webhook: HMAC(rawBody, webhook_secret) vs the x-razorpay-signature header. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}
