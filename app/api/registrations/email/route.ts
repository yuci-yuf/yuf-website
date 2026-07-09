import { NextResponse } from "next/server";
import { sendRegistrationEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Sends the registration confirmation email.
 *
 * The client calls this (fire-and-forget) right after the registration is
 * created via `/api/registrations/create`, passing the recipient + event
 * details straight from the form so there's no need to read the doc back
 * here. Only `RESEND_API_KEY` is
 * required. The sender address and template live server-side in `lib/email`.
 */
export async function POST(req: Request) {
  let body: {
    to?: string;
    firstName?: string;
    eventTitle?: string;
    date?: string;
    venue?: string;
    registrationCode?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { to, firstName, eventTitle, date, venue, registrationCode } = body;
  if (!to || !EMAIL_RE.test(to) || !eventTitle) {
    return NextResponse.json(
      { error: "Missing or invalid to / eventTitle." },
      { status: 400 },
    );
  }

  try {
    const { error } = await sendRegistrationEmail({
      to,
      firstName: firstName?.trim() || "there",
      eventTitle,
      date,
      venue,
      registrationCode,
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
