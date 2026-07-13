import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendRegistrationEmail } from "@/lib/email";

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

  let reg: FirebaseFirestore.DocumentData;
  try {
    const snap = await getAdminDb()
      .collection("registrations")
      .doc(registrationId)
      .get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "Registration not found." },
        { status: 404 },
      );
    }
    reg = snap.data()!;
  } catch (err) {
    console.error("Registration email: lookup failed", err);
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }

  // Only ever email a confirmed registration, and only to the stored address.
  if (reg.status !== "confirmed") {
    return NextResponse.json(
      { error: "Registration is not confirmed." },
      { status: 409 },
    );
  }
  const to = typeof reg.email === "string" ? reg.email.trim() : "";
  const eventTitle = typeof reg.eventTitle === "string" ? reg.eventTitle : "";
  if (!to || !eventTitle) {
    return NextResponse.json(
      { error: "Registration is missing email or event." },
      { status: 422 },
    );
  }

  try {
    const { error } = await sendRegistrationEmail({
      to,
      firstName:
        (typeof reg.firstName === "string" && reg.firstName.trim()) || "there",
      eventTitle,
      date: typeof reg.locationDate === "string" ? reg.locationDate : undefined,
      venue: typeof reg.locationVenue === "string" ? reg.locationVenue : undefined,
      registrationCode:
        typeof reg.registrationCode === "string"
          ? reg.registrationCode
          : undefined,
    });
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Registration email failed:", err);
    return NextResponse.json({ error: "Email send failed." }, { status: 500 });
  }
}
