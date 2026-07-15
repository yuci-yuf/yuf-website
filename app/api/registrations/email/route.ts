import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendRegistrationEmailOnce } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends the registration confirmation email.
 *
 * SECURITY: this route takes ONLY a `registrationId` — never a recipient
 * address or event details from the client. It reads the registration back
 * from Firestore (Admin SDK) and refuses to send unless the registration
 * exists and is `confirmed`. Every field in the email (recipient, event,
 * date, venue, code) comes from the stored document, so this endpoint can't be
 * abused as an open relay to email arbitrary content to arbitrary addresses.
 *
 * The client calls this fire-and-forget right after `/api/payments/verify`
 * confirms the payment. Requires `RESEND_API_KEY`; the sender address and
 * template live server-side in `lib/email`.
 */
export async function POST(req: Request) {
  let body: { registrationId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const registrationId =
    typeof body.registrationId === "string" ? body.registrationId.trim() : "";
  if (!registrationId || registrationId.length > 200) {
    return NextResponse.json(
      { error: "Missing or invalid registrationId." },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  const ref = db.collection("registrations").doc(registrationId);
  let exists: boolean;
  try {
    exists = (await ref.get()).exists;
  } catch (err) {
    console.error("Registration email: lookup failed", err);
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
  if (!exists) {
    return NextResponse.json(
      { error: "Registration not found." },
      { status: 404 },
    );
  }

  // Delegate to the shared idempotent sender: it re-checks `confirmed`, claims
  // the `emailSentAt` marker atomically, and reads the recipient/details from
  // the stored record. If the webhook already sent this, it no-ops — the client
  // treats that as success (the user got their email either way).
  const result = await sendRegistrationEmailOnce(db, ref);
  return NextResponse.json({ ok: true, ...result });
}
