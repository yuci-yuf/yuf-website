import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Partnership / Sponsorship proposal intake.
 *
 * The browser POSTs the form fields (+ an already-uploaded Cloudinary proposal
 * URL) here; this route forwards them to the organisation's Google Apps Script
 * Web App, which appends the row to the form's own tab (`Partnership` /
 * `Sponsorship`) and emails the team. The webhook URL is server-only
 * (`GOOGLE_SHEETS_WEBHOOK_URL`) so it never ships to the client.
 *
 * The Apps Script must handle `action: "partner_submit"` with a `formType`
 * (`partnership` | `sponsorship`) and append the fields in that tab's column
 * order. See forms.md → `google-apps-script/Code.gs` for the reference handler.
 */

const FORM_TYPES = new Set(["partnership", "sponsorship"]);

// Cap payload sizes so a malformed/hostile request can't push huge strings into
// the sheet. Generous enough for a full proposal write-up.
const MAX_FIELD_LEN = 5000;
const MAX_FIELDS = 40;

interface PartnerBody {
  formType?: string;
  fields?: Record<string, unknown>;
  proposalUrl?: string;
  proposalName?: string;
}

export async function POST(req: Request) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("Partner submit: GOOGLE_SHEETS_WEBHOOK_URL is not set.");
    return NextResponse.json(
      { error: "Submissions are not configured." },
      { status: 503 },
    );
  }

  let body: PartnerBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const formType = typeof body.formType === "string" ? body.formType : "";
  if (!FORM_TYPES.has(formType)) {
    return NextResponse.json({ error: "Unknown form type." }, { status: 400 });
  }

  // Coerce every field to a trimmed, length-capped string. Never trust the
  // client shape — only string values reach the sheet.
  const rawFields =
    body.fields && typeof body.fields === "object" ? body.fields : {};
  const entries = Object.entries(rawFields).slice(0, MAX_FIELDS);
  const fields: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (typeof key !== "string") continue;
    const str = value == null ? "" : String(value);
    fields[key] = str.slice(0, MAX_FIELD_LEN);
  }

  const proposalUrl =
    typeof body.proposalUrl === "string"
      ? body.proposalUrl.slice(0, MAX_FIELD_LEN)
      : "";
  const proposalName =
    typeof body.proposalName === "string"
      ? body.proposalName.slice(0, 300)
      : "";

  const payload = {
    action: "partner_submit",
    formType,
    ...fields,
    proposalUrl,
    proposalName,
    submittedAt: new Date().toISOString(),
  };

  let res: Response;
  try {
    res = await fetch(webhookUrl, {
      method: "POST",
      // text/plain keeps this a CORS-simple request, which Apps Script Web Apps
      // require (they don't answer the OPTIONS preflight).
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
  } catch (err) {
    console.error("Partner submit: webhook request failed", err);
    return NextResponse.json({ error: "Upstream error." }, { status: 502 });
  }

  const text = await res.text().catch(() => "");
  if (
    text.includes("You need access") ||
    text.includes("accounts.google.com")
  ) {
    console.error(
      "Partner submit: Apps Script access denied — set deployment access to 'Anyone'.",
    );
    return NextResponse.json({ error: "Upstream error." }, { status: 502 });
  }
  if (!res.ok) {
    console.error(`Partner submit: webhook HTTP ${res.status}: ${text}`);
    return NextResponse.json({ error: "Upstream error." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
